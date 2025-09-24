const m_content_url = "data/kiosk_contents.json";
//let m_notice_list = [];
let m_page_list = [];
let m_final_notice_list = [];
let m_time_last = 0;
let m_curr_notice_cnt = -1;
let m_notice_ptime = 0;
let m_curr_notice_num = 1;
let m_str_show = "";
let m_str_hide = "";
let m_chk_timer;
let m_start_time;
let m_current_time;
let m_start_ptime_time;
let m_ptime_timer;
let m_reload_chk = 0;
let m_show_video_loaded_cnt = 0;
let m_show_video_cnt = 0;
let m_first_time = 0;
let m_operating_trigger = false;
let m_operating_trigger_str = "";
//let m_create_chk_num = 0;
let m_video_time_map_list = new Map();
let m_header = null;
let m_form_type = "AD";
let m_curr_page_obj = null;
let m_page_timer;
let m_pdf_timer;
let m_pdf_width = 0;
let m_pdf_height = 0;
let m_pdf_num = 0;
let m_pdf_temp_context;
var m_pdf_render_task = null;
var m_is_pdf_rendering = false;
let m_first_draw = true;

let m_info_mode = false;
let m_video_cnt = 0;
let m_video_max = 0;
let m_widget_list = [];
let m_weather_json = null;
let m_time_json = null;
let m_rss_json = null;
let m_caption_json = null;
let m_rss_json_list = [];
let m_caption_json_list = [];
let m_curr_caption_list = [];
let m_rss_cnt = 0;
let m_rss_max = 0;

let m_s_header = null;
let m_s_page_list = [];
let m_s_widget_list = [];
let m_s_curr_notice_cnt = -1;
let m_s_str_show = "";
let m_s_str_hide = "";
let m_s_page_timer;
let m_s_notice_ptime = 0;
let m_s_curr_notice_num = 0;
let m_s_curr_page_obj = null;
let m_s_first_draw = false;
let m_s_show_video_cnt = 0;
let m_s_show_video_loaded_cnt = 0;
let m_s_video_cnt = 0;
let m_s_video_max = 0;
let m_s_ptime_timer;
let m_s_start_ptime_time;
let m_s_ttime_list = [];
let m_s_etime_list = [];
let m_s_etime_voice_list = [];
let m_s_ttime_trigger = false;
let m_s_stime_trigger = false;
let m_s_mtime_trigger = false;
let m_s_etime_trigger = false;
let m_s_trigger_timer;

let m_curr_playing = null;
let m_ticker_timer;
let m_time_trigger = false;
let m_caption_num = 0;
let m_caption_time = 0;
let m_play_mode = "normal";

function setInit() {
    m_first_time = new Date().getTime();
    setSpecialContentes();
    setContents();

    if (m_info_mode == true) {
        $(".time_main_box").show();
    }

    $('.d_btn').on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickDebugBtn(this);
    });
}

function setSpecialContentes() {
    let t_date = new Date();
    let t_day = t_date.getDay();
    //console.log(t_day);

    if (t_day <= 1 || t_day >= 7) {
        return;
    }

    const t_url = "commonfiles/special/special_contents.json";
    fetch(t_url)
        .then(response => response.json())
        .then(data => {
            m_s_header = data.header;
            m_s_page_list = data.page_list;
            m_s_widget_list = data.widget;
            m_play_mode = "special";
            //$(".debug_temp_btn").show();
            //m_s_ttime_list = m_s_header.ttime.split(',').map(item => item.trim());
            setSpecialTargetTime(m_s_header.ttime.split(',').map(item => item.trim()));
        })
        .catch(error => {
            console.error('컨텐츠 에러 발생:', error);
        });
}

function setSpecialTargetTime(_list) {
    for (var i = 0; i < _list.length; i += 1) {
        m_s_ttime_list.push({
            target: getTimeCal(_list[i], -5),
            code: "1"
        });
        m_s_ttime_list.push({
            target: getTimeCal(_list[i], 0),
            code: "2"
        });
        m_s_ttime_list.push({
            target: getTimeCal(_list[i], 30),
            code: "5"
        });
        m_s_ttime_list.push({
            target: getTimeCal(_list[i], 60),
            code: "3"
        });
        m_s_ttime_list.push({
            target: getTimeCal(_list[i], 90),
            code: "5"
        });
        m_s_ttime_list.push({
            target: getTimeCal(_list[i], 120),
            code: "4"
        });
    }
    let now = new Date();
    let currentTime = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');

    // 대상 시간 비교 및 추가
    m_s_ttime_list.forEach(item => {
        if (parseInt(item.target) < parseInt(currentTime)) {
            //console.log(item.target);
            m_s_etime_list.push(item.target);
        }
    });

    if (m_s_ttime_list.length == 0) {
        return;
    }

    // 구간 검사 로직
    let groupSize = 5; // 각 그룹 크기
    let gap = 2; // 그룹 간 간격
    let startIndex = 1; // 시작 인덱스
    while (startIndex < m_s_ttime_list.length) {
        // 그룹의 시작과 끝 시간 가져오기
        let startTime = m_s_ttime_list[startIndex].target;
        let endTime = m_s_ttime_list[Math.min(startIndex + groupSize - 1, m_s_ttime_list.length - 1)].target;

        // 현재 시간이 구간에 포함되면 pop()
        if (parseInt(currentTime) >= parseInt(startTime) && parseInt(currentTime) <= parseInt(endTime)) {
            setCallWebToApp("SETLOG", "[SPECIAL] CHECK > " + `현재 시간 ${currentTime}는 ${startTime} ~ ${endTime} 구간에 포함됩니다.`);
            console.log(`현재 시간 ${currentTime}는 ${startTime} ~ ${endTime} 구간에 포함됩니다. pop() 실행`);
            m_s_etime_list.pop();
            break; // 한 번 pop() 후 종료
        }

        // 다음 그룹으로 이동
        startIndex += groupSize + gap;
    }
    //console.log(m_s_etime_list);
}

function setContents() {
    const t_url = m_content_url;
    fetch(t_url)
        .then(response => response.json())
        .then(data => {
            m_header = data.header;
            setCallWebToApp("RESOLUTION", m_header.kiosk_resolution.width + "|" + m_header.kiosk_resolution.height);
            $(".main_cont").css("width", m_header.kiosk_resolution.width + "px");
            $(".main_cont").css("height", m_header.kiosk_resolution.height + "px");
            if (parseInt(m_header.kiosk_resolution.width) > parseInt(m_header.kiosk_resolution.height)) {
                //가로형
                $(".alert_img img").attr('src', "images/easyCMS_standby_4k(1).png");
            } else {
                $(".alert_img img").attr('src', "images/easyCMS_standby_4k(2).png");
            }
            m_page_list = data.page_list;
            m_form_type = m_header.form_type;
            m_widget_list = data.widget;
            if (m_form_type == "AD") {
                //setNoticeInit();
                setPageInit();
            } else if (m_form_type == "LAYOUT") {
                setPageInit();
            }
        })
        .catch(error => {
            console.error('컨텐츠 에러 발생:', error);
        });
}

async function fetchRSS(_url) {
    const url = 'https://api.rss2json.com/v1/api.json?rss_url=' + _url;
    const response = await fetch(url);
    const data = await response.json();
    var t_list = [];

    if (data.status == "error") {
        $(ticker).hide();
    } else {

        for (var i = 0; i < data.items.length; i += 1) {
            t_list.push(data.items[i].title);
        }
        setTicker(m_rss_json, t_list);
    }
}

async function fetchRSS2(_json) {
    const url = 'https://api.rss2json.com/v1/api.json?rss_url=' + _json.url;
    const response = await fetch(url);
    const data = await response.json();
    var t_list = [];

    if (data.status == "error") {
        m_rss_cnt += 1;
        if (m_rss_cnt == m_rss_max) {
            setCurrCaptionNext();
        }
    } else {
        _json.caption_list = [];
        for (var i = 0; i < data.items.length; i += 1) {
            //t_list.push(data.items[i].title);
            _json.caption_list.push("[" + _json.tag + "] " + data.items[i].title);
        }
        //console.log(_json.caption_list);
        //m_curr_caption_list.push(_json);
        //console.log(m_curr_caption_list);
        m_rss_cnt += 1;
        if (m_rss_cnt == m_rss_max) {
            setCurrCaptionNext();
        }
    }
}

function setTicker2() {
    $(".ticker_cont").html("<div class='ticker' id='id_ticker'></div>");
    m_caption_num = (m_caption_num + 1) % m_curr_caption_list.length;
    let t_json = m_curr_caption_list[m_caption_num];
    let t_html = "";
    for (let i = 0; i < t_json.caption_list.length; i++) {
        t_html += "<div class='ticker__item'>" + t_json.caption_list[i] + "</div>";
    }
    let $ticker = $("#id_ticker");
    $ticker.html(t_html);

    setTimeout(function () {
        let oneCycleWidth = $ticker.width();
        let containerWidth = $ticker.parent().width();
        let repeatCount = Math.ceil(containerWidth / oneCycleWidth) + 1;

        // 2. 반복해서 채우기
        let finalHtml = "";
        for (let i = 0; i < repeatCount; i++) {
            finalHtml += t_html;
        }
        $ticker.html(finalHtml);

        // 스타일 적용
        $(".ticker_cont").css("background-color", t_json.bg_color);
        $("#id_ticker .ticker__item").css({
            "color": t_json.font_color
        });

        setAdjustTickerFontSize(t_json.font_size);

        // 3. setTimeout(0~10) 후 width 다시 측정 (진짜 반복된 전체 ticker 길이)
        setTimeout(function () {
            let tickerWidth = $ticker.width();
            console.log(tickerWidth);
            // 속도/애니메이션 계산 (원하는대로)
            let t_speed_list = [0, 6, 10, 14, 18, 22];
            let t_speed = t_speed_list[parseInt(t_json.speed)];

            // 예: 한 화면 통과에 t_speed초 기준
            let duration = (tickerWidth / containerWidth) * t_speed;

            // 애니메이션 함수
            function animateTicker() {
                $ticker.css({
                        transform: "translateX(0)"
                    })
                    .animate({
                        dummy: 1
                    }, {
                        duration: duration * 1000,
                        step: function (now, fx) {
                            let progress = fx.pos;
                            let tx = -1 * (tickerWidth - containerWidth) * progress;
                            $ticker.css("transform", `translateX(${tx}px)`);
                        },
                        easing: "linear",
                        complete: animateTicker
                    });
            }
            animateTicker();
        }, 10);
    }, 10);


    $(".ticker_cont").show();
}


function setTicker2_old() {
    $(".ticker_cont").html("");
    $(".ticker_cont").html("<div class='ticker' id='id_ticker'></div><div class='ticker' id='id_ticker_2'></div>");

    m_caption_num += 1;
    if (m_caption_num >= m_curr_caption_list.length) {
        m_caption_num = 0;
    }
    let t_json = m_curr_caption_list[m_caption_num];
    //console.log(m_caption_num, m_curr_caption_list, t_json);
    let t_html = "";
    $("#id_ticker").html("");
    $("#id_ticker_2").html("");
    for (i = 0; i < t_json.caption_list.length; i += 1) {
        t_html += "<div class='ticker__item'>" + t_json.caption_list[i] + "</div>";
    }
    $("#id_ticker").append(t_html);
    $("#id_ticker_2").append(t_html);

    const t_speed_list = [0, 15, 25, 35, 45, 55];
    //const t_speed_list = [0, 25, 50, 75, 100, 125];
    const t_position = t_json.position;
    const t_speed = parseInt(t_json.speed);
    const t_font_size = t_json.font_size;
    const t_font_color = t_json.font_color;
    const t_bg_color = t_json.bg_color;
    let containerWidth = 0;
    let textWidth = 0;
    let speed = 0;
    let duration = 0;

    //console.log("Ticker", "font size : " + t_font_size, "font color : " + t_font_color, "bg color : " + t_bg_color);

    //$("#id_ticker").css("animation", "none");
    //$("#id_ticker_2").css("animation", "none");
    setTimeout(function () {
        containerWidth = $("#id_ticker").parent().outerWidth();
        textWidth = $(".ticker_cont .ticker").width();
        speed = t_speed_list[t_speed];
        duration = textWidth / speed;
        //console.log(textWidth);
        //console.log($("#id_ticker").width(), containerWidth, speed, duration);

        $('.ticker_cont').removeClass('top bot');
        $('.ticker_cont').addClass(t_position.toLowerCase());
        $(".ticker_cont").css("background-color", t_bg_color);

        $("#id_ticker").css("animation-name", "ticker_anim");
        $("#id_ticker").css("animation-duration", duration + "s");
        $("#id_ticker").css("animation-delay", "-" + duration + "s");
        $("#id_ticker").css("color", t_font_color);
        $("#id_ticker").css("font-size", t_font_size + "px");

        $("#id_ticker_2").css("animation-name", "ticker_anim");
        $("#id_ticker_2").css("animation-duration", duration + "s");
        $("#id_ticker_2").css("animation-delay", "-" + duration + "s");
        $("#id_ticker_2").css("color", t_font_color);
        $("#id_ticker_2").css("font-size", t_font_size + "px");

        if (m_ticker_timer) {
            clearTimeout(m_ticker_timer);
        }
        m_ticker_timer = setTimeout(setTicker2End, parseInt(duration) * 1000);
        setAdjustTickerFontSize(t_font_size);


        /*
        let base_width = 1080;

        if (m_header.kiosk_resolution.height > m_header.kiosk_resolution.width) {
            $(".ticker_cont").css("height", "5%");
            base_width = 1080; // 기준 해상도
        }else{
            base_width = 1920; // 기준 해상도
        }
        const current_width = m_header.kiosk_resolution.width;
        const scale = current_width / base_width;
        console.log(scale);
        $(".ticker_cont").css("transform", `scale(${scale})`);  
        */


    }, 10);

    $(".ticker_cont").show();
}

function setAdjustTickerFontSize(_font_size) {
    const base_width_l = 1920;
    //const base_height_l = 1080;
    const base_width_p = 1080;
    const base_font_size = _font_size; // 기준 font-size
    let font_size = 20;
    const current_width = m_header.kiosk_resolution.width;
    const current_height = m_header.kiosk_resolution.height;

    //console.log(current_width, current_height);
    // 어떤 방향이 더 긴지 판단
    const is_landscape = current_width >= current_height;

    // 비율 계산
    const width_ratio_l = current_width / base_width_l;
    const width_ratio_p = current_width / base_width_p;
    //const height_ratio = current_height / base_height;

    // 방향에 따라 비율 선택
    //const scale_ratio = is_landscape ? width_ratio : height_ratio;
    // 최종 font-size 계산

    if (current_height > current_width) {
        //console.log("0000000000000");
        $(".ticker_cont").css("height", "5%");
        font_size = base_font_size * width_ratio_p;
    } else {
        //console.log("111111111111");
        font_size = base_font_size * width_ratio_l;
    }

    console.log("FINAL_FONT_SIZE = " + font_size);

    $("#id_ticker").css("font-size", font_size + "px");
    $("#id_ticker_2").css("font-size", font_size + "px");
}

function setTicker2End() {
    //$(".ticker_cont").hide();  
    $("#id_ticker").css("animation", "none");
    $("#id_ticker_2").css("animation", "none");
    $("#id_ticker").html("");
    $("#id_ticker_2").html("");
    let t_date = new Date();
    let t_now_time = t_date.getTime();
    let t_chk_caption_time = (t_now_time - m_caption_time) / 1000;
    //console.log(t_chk_caption_time+"초 지남");
    if (m_rss_max > 0 && t_chk_caption_time > 1800) {
        console.log("RSS 리프레쉬");
        //console.log("RSS 리프레쉬", t_date.getHours()+":"+t_date.getMinutes()+":"+t_date.getSeconds());
        m_caption_time = t_date.getTime();
        setCurrCaptionStart();
    } else {
        setTicker2();
    }
}


function setTicker3(_num) {
    $(".ticker_cont").html("");
    $(".ticker_cont").html("<div class='ticker' id='id_ticker'></div><div class='ticker' id='id_ticker_2'></div>");
    if (_num == -1) {
        $(".ticker_cont").hide();
        if (m_ticker_timer) {
            clearTimeout(m_ticker_timer);
        }
        return;
    }
    let t_json = m_s_widget_list[_num];

    let t_html = "";
    $("#id_ticker").html("");
    $("#id_ticker_2").html("");
    for (i = 0; i < t_json.caption_list.length; i += 1) {
        t_html += "<div class='ticker__item'>" + t_json.caption_list[i] + "</div>";
    }
    $("#id_ticker").append(t_html);
    $("#id_ticker_2").append("");

    const t_speed_list = [0, 30, 50, 70, 90, 110];
    //const t_speed_list = [0, 25, 50, 75, 100, 125];
    const t_position = t_json.position;
    const t_speed = parseInt(t_json.speed);
    const t_font_size = t_json.font_size;
    const t_font_color = t_json.font_color;
    const t_bg_color = t_json.bg_color;

    let containerWidth = 0;
    let textWidth = 0;
    let speed = 0;
    let duration = 0;

    console.log("Ticker", "font size : " + t_font_size, "font color : " + t_font_color, "bg color : " + t_bg_color);

    //$("#id_ticker").css("animation", "none");
    //$("#id_ticker_2").css("animation", "none");
    setTimeout(function () {
        containerWidth = $("#id_ticker").parent().outerWidth();
        textWidth = $(".ticker_cont .ticker").width();
        speed = t_speed_list[t_speed];
        duration = textWidth / speed;
        //console.log(textWidth);
        //console.log($("#id_ticker").width(), containerWidth, speed, duration);

        $('.ticker_cont').removeClass('top bot');
        $('.ticker_cont').addClass(t_position.toLowerCase());
        $(".ticker_cont").css("background-color", t_bg_color);

        $("#id_ticker").css("animation-name", "ticker_anim");
        $("#id_ticker").css("animation-duration", duration + "s");
        $("#id_ticker").css("animation-delay", "-" + duration + "s");
        $("#id_ticker").css("color", t_font_color);
        $("#id_ticker").css("font-size", t_font_size + "px");

        $("#id_ticker_2").css("animation-name", "ticker_anim");
        $("#id_ticker_2").css("animation-duration", duration + "s");
        $("#id_ticker_2").css("animation-delay", "-" + duration + "s");
        $("#id_ticker_2").css("color", t_font_color);
        $("#id_ticker_2").css("font-size", t_font_size + "px");

        if (m_ticker_timer) {
            clearTimeout(m_ticker_timer);
        }
        m_ticker_timer = setTimeout(setTicker3End, parseInt(duration) * 1000);

    }, 10);

    $(".ticker_cont").show();
}

function setTicker3End() {
    //$(".ticker_cont").hide();  
    $("#id_ticker").css("animation", "none");
    $("#id_ticker_2").css("animation", "none");
    $("#id_ticker").html("");
    $("#id_ticker_2").html("");
    $(".ticker_cont").html("");
    $(".ticker_cont").hide();
    //setTicker2();

    if (m_curr_caption_list.length > 0) {
        //setTicker2();
    }
}


function setTicker(_json, _ticker_list) {
    let t_html = "";
    $("#id_ticker").html = "";
    $("#id_ticker_2").html = "";
    for (i = 0; i < _ticker_list.length; i += 1) {
        t_html += "<div class='ticker__item'>" + _ticker_list[i] + "</div>";
    }
    $("#id_ticker").append(t_html);
    $("#id_ticker_2").append(t_html);

    const t_speed_list = [0, 30, 50, 70, 90, 110];
    //const t_speed_list = [0, 25, 50, 75, 100, 125];
    const t_position = _json.position;
    const t_speed = parseInt(_json.speed);
    const t_font_size = _json.font_size;
    const t_font_color = _json.font_color;
    const t_bg_color = _json.bg_color;

    let containerWidth = 0;
    let textWidth = 0;
    let speed = 0;
    let duration = 0;

    if (getTimeCheck(_json) == false) {
        $(".ticker_cont").hide();
        return;
    }

    console.log("Ticker", "font size : " + t_font_size, "font color : " + t_font_color, "bg color : " + t_bg_color);

    setTimeout(function () {
        containerWidth = $("#id_ticker").parent().outerWidth();
        textWidth = $(".ticker_cont .ticker").width();
        speed = t_speed_list[t_speed];
        duration = textWidth / speed;
        //console.log(textWidth);
        //console.log($("#id_ticker").width(), containerWidth, speed, duration);

        $('.ticker_cont').removeClass('top bot');
        $('.ticker_cont').addClass(t_position.toLowerCase());
        $(".ticker_cont").css("background-color", t_bg_color);

        $("#id_ticker").css("animation-duration", duration + "s");
        $("#id_ticker").css("animation-delay", "-" + duration + "s");
        $("#id_ticker").css("color", t_font_color);
        $("#id_ticker").css("font-size", t_font_size + "px");

        $("#id_ticker_2").css("animation-duration", duration + "s");
        $("#id_ticker_2").css("animation-delay", "-" + duration + "s");
        $("#id_ticker_2").css("color", t_font_color);
        $("#id_ticker_2").css("font-size", t_font_size + "px");
    }, 0);

    $(".ticker_cont").show();

}

function setTime(_json) {
    const t_font_size = _json.font_size;
    const t_font_color = _json.font_color;
    const t_bg_color = "#000000AA";
    //    const t_pos_x = _json.position.split("_")[1];
    $(".time_cont").css("background-color", t_bg_color);
    $(".time_cont").css("color", t_font_color);
    $(".time_cont").css("font-size", t_font_size + "px");

    const t_pos_y = _json.position;
    let t_x = "0%";
    let t_ancor_x = "right";
    let t_y = "0%";
    let t_anchor_y = "top";

    if (t_pos_y == "top") {
        t_anchor_y = "top";
        t_y = "0%";
    } else if (t_pos_y == "bot") {
        t_anchor_y = "bottom";
        t_y = "0%";
    }
    $(".time_cont").css(t_anchor_y, t_y);
    $(".time_cont").css(t_ancor_x, t_x);


    $(".time_cont").show();

    m_time_trigger = true;

    $(".date_txt").html(setDateTime("date"));
    $(".time_txt").html(setDateTime("time"));
}

function setWeather(_json) {
    const t_type = _json.type;
    const t_font_size = _json.font_size;
    const t_font_color = _json.font_color;
    const t_position = _json.position;
    const t_url = _json.url;
    if (t_url == "") {
        return;
    }
    console.log("serWeather > " + t_type);
    if (t_type == "W" || t_type == "WT") {
        $('.weather_main .weather_box').show();
        $('.weather_main').removeClass('lt lb rt rb');
        $('.weather_main').addClass(t_position.toLowerCase());
        //$(".weather_main").css("color", t_font_color);
        //$(".weather_main").css("font-size", t_font_size + "px");
        console.log(t_url);
        fetch(t_url)
            .then(response => response.json())
            .then(data => {
                if (data.ret_code == "SUCC") {
                    setWeatherValue(data.weather);
                } else {
                    console.error('날씨 에러 발생:', error);
                }
            })
            .catch(error => {
                console.error('날씨 에러 발생:', error);
            });
        if (t_type == "WT") {
            $(".weather_main .time_box .txt_day").html(setDateTime("date"));
            $(".weather_main .time_box .txt_hour").html(setDateTime("time"));
            $('.weather_main .time_box').show();
        } else {
            $('.weather_main').addClass("w");
            $('.weather_main .time_box').hide();
        }


        let base_width = 1080;

        if (m_header.kiosk_resolution.height > m_header.kiosk_resolution.width) {
            base_width = 1620; // 기준 해상도
        } else {
            base_width = 2880; // 기준 해상도
        }
        const current_width = m_header.kiosk_resolution.width;
        const scale = current_width / base_width * 0.75;

        $(".weather_main").css({
            "transform": `scale(${scale})`,
            "transform-origin": "right top" // 오른쪽 위 기준
        });


    } else if (t_type == "T") {
        $('.weather_main').removeClass('lt lb rt rb');
        $('.weather_main').addClass(t_position.toLowerCase());
        $('.weather_main').addClass("t");
        $(".weather_main .time_box .txt_day").html(setDateTime("date"));
        $(".weather_main .time_box .txt_hour").html(setDateTime("time"));
        $('.weather_main .time_box').show();
        $('.weather_main .weather_box').hide();
        $(".weather_main").show();
    }
}

function setWeatherValue(_json) {
    const t_sky = _json.sky;
    const t_pty = _json.pty;
    const t_tmp = _json.tmp;
    const t_reh = _json.reh;

    let t_icon_url = "";
    let t_icon_path = "images/weather/";
    let t_icon_list = ["DB04_B.svg", "DB05_B.svg", "DB07_B.svg", "DB08_B.svg", "DB05_B.svg", "DB05_B.svg", "DB07_B.svg", "DB08_B.svg", "DB01_B.svg"]
    if (t_sky == "1") { // 맑음
        str_weather = "Sunny";
        t_pty == "8";
    } else {
        if (t_pty == "0") { // 흐림
            str_weather = "흐림";
        } else if (t_pty == "1") { // 비
            str_weather = "비";
        } else if (t_pty == "2") { // 비/눈
            str_weather = "비/눈";
        } else if (t_pty == "3") { // 눈
            str_weather = "눈";
        } else if (t_pty == "4") { // 빗방울
            str_weather = "빗방울";
        } else if (t_pty == "5") { // 빗방울
            str_weather = "빗방울";
        } else if (t_pty == "6") { // 빗방울 눈날림
            str_weather = "비/눈";
        } else if (t_pty == "7") { // 눈날림
            str_weather = "눈";
        }
    }
    t_icon_url = t_icon_path + t_icon_list[parseInt(t_pty)];
    $(".weather_main .icon img").attr('src', t_icon_url);
    $(".weather_main .title").html(str_weather);
    $(".weather_main .temp").html(t_tmp + "<span class='icon'>°C</span>");
    $(".weather_main").show();
}


function setTickerAnimation() {
    const ticker = $('#id_ticker');
    const textWidth = ticker[0].scrollWidth;

    const containerWidth = ticker.parent().outerWidth();

    // 일정 속도로 애니메이션을 설정하기 위한 시간 계산
    const speed = 300; // 속도 (픽셀 당 1초)
    const duration = (textWidth + containerWidth) / speed;
    gsap.to(ticker, {
        x: -textWidth,
        duration: duration,
        ease: "linear",
        repeat: -1 // 무한 반복
    });
}

function updateTicker(text) {
    const ticker = $('#id_ticker');
    ticker.text(text);
    setTickerAnimation(); // 애니메이션 적용
}

function setWidget() {

    $(".weather_main").hide();
    $(".time_cont").hide();
    $(".ticker_cont").hide();

    if (m_widget_list.length == 0) {
        return;
    }
    m_weather_json = null;
    m_time_json = null;
    m_rss_json = null;
    m_caption_json = null;

    let t_list = [];

    for (var i = 0; i < m_widget_list.length; i += 1) {
        if (m_widget_list[i].sect == "WEATHER") {
            m_weather_json = m_widget_list[i];
        } else if (m_widget_list[i].type == "RSS") {
            //m_rss_json_list.push(m_widget_list[i]);
            m_caption_json_list.push(m_widget_list[i]);
        } else if (m_widget_list[i].type == "CAPTION") {
            m_caption_json_list.push(m_widget_list[i]);
        }
    }

    if (m_weather_json != null && m_weather_json.show_yn == "Y") {
        setWeather(m_weather_json);
    }
    m_caption_num = -1;
    m_caption_time = new Date().getTime();
    setCurrCaptionStart();
    /*
    if (m_rss_json != null && m_rss_json.show_yn == "Y") {
        fetchRSS(m_rss_json.url);
    }
    
    if (m_rss_json == null) {
        if (m_caption_json != null && m_caption_json.show_yn == "Y") {
            for (i = 0; i < m_caption_json.caption_list.length; i += 1) {
                t_list.push(m_caption_json.caption_list[i]);
            }
            setTicker(m_caption_json, t_list)
        }
    } else {
        if (m_caption_json != null && m_caption_json.show_yn == "Y" && m_rss_json.show_yn == "N") {
            for (i = 0; i < m_caption_json.caption_list.length; i += 1) {
                t_list.push(m_caption_json.caption_list[i]);
            }
            setTicker(m_caption_json, t_list)
        }
    }
    */
}

function setCurrCaptionStart() {
    //console.log("setCurrCaptionStart");
    m_curr_caption_list = [];
    m_rss_cnt = 0;
    m_rss_max = 0;
    const date = new Date();
    const i_date = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const i_time = date.getHours() * 100 + date.getMinutes();
    let t_json = null;
    let t_list = [];

    for (var i = 0; i < m_caption_json_list.length; i += 1) {
        if (m_caption_json_list[i].type == "RSS") {
            t_json = m_caption_json_list[i];
            if (t_json != null && t_json.show_yn == "Y") {
                if (parseInt(t_json.sday) <= i_date && parseInt(t_json.eday) >= i_date) {
                    if (parseInt(t_json.stime) <= i_time && parseInt(t_json.etime) >= i_time) {
                        t_list.push(t_json);
                    }
                }
            }
        }
    }
    if (t_list.length == 0) {
        setCurrCaptionNext();
    } else {
        m_rss_max = t_list.length;
        for (var i = 0; i < t_list.length; i += 1) {
            fetchRSS2(t_list[i]);
        }
    }
}

function setCurrCaptionNext() {
    //console.log("setCurrCaptionNext");

    const date = new Date();
    const i_date = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const i_time = date.getHours() * 100 + date.getMinutes();
    let t_json = null;
    let t_list = [];

    for (var i = 0; i < m_caption_json_list.length; i += 1) {
        //if(m_caption_json_list[i].type=="CAPTION"){
        t_json = m_caption_json_list[i];
        if (t_json != null && t_json.show_yn == "Y") {
            if (parseInt(t_json.sday) <= i_date && parseInt(t_json.eday) >= i_date) {
                if (parseInt(t_json.stime) <= i_time && parseInt(t_json.etime) >= i_time) {
                    m_curr_caption_list.push(t_json);
                }
            }
        }
        //}
    }
    //console.log(m_curr_caption_list);

    if (m_curr_caption_list.length > 0) {
        setTicker2();
    }
}


function setPageInit() {
    setWidget();
    //fetchRSS();
    const date = new Date();
    const i_date = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    m_final_notice_list = m_page_list.filter(page => {
        const i_sday = parseInt(page.sday);
        const i_eday = parseInt(page.eday);
        return i_sday <= i_date && i_eday >= i_date;
    });
    //console.log(m_final_notice_list);

    setTimeout(setMainTimeOut, 500);
    setInterval(setMainInterval, 1000);
}

/*
function setNoticeInit() {
    const date = new Date();
    const i_date = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    m_final_notice_list = m_notice_list.filter(notice => {
        const i_sday = parseInt(notice.sday);
        const i_eday = parseInt(notice.eday);
        return i_sday <= i_date && i_eday >= i_date;
    });

    setTimeout(setMainTimeOut, 500);
    setInterval(setMainInterval, 1000);
}
*/

function getTimeCheck(_json) {

    const date = new Date();
    const i_date = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const i_time = date.getHours() * 100 + date.getMinutes();

    const i_sday = parseInt(_json.sday);
    const i_eday = parseInt(_json.eday);
    const i_stime = parseInt(_json.stime);
    const i_etime = parseInt(_json.etime);

    if (i_sday <= i_date && i_eday >= i_date) {
        if (i_stime <= i_time && i_etime >= i_time) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

}

function onTriggerTimeOut() {
    m_s_ttime_trigger = false;

    setCallWebToApp("SETLOG", "[SPECIAL] TRIGGER > " + m_s_ttime_trigger);
}

function getTimeCal(_time, _min) {
    let hours = parseInt(_time.slice(0, 2), 10); // "12" -> 12
    let minutes = parseInt(_time.slice(2, 4), 10); // "00" -> 0

    // 기준 시간(Date 객체)
    let baseTime = new Date();
    baseTime.setHours(hours);
    baseTime.setMinutes(minutes);
    baseTime.setSeconds(0); // 초는 0으로 초기화

    let t_time = new Date(baseTime.getTime() + _min * 60 * 1000);
    let t_h = t_time.getHours().toString().padStart(2, '0');
    let t_m = t_time.getMinutes().toString().padStart(2, '0');

    return t_h + t_m;
}

function setMainInterval() {
    const t_date = new Date();
    if (m_play_mode == "special") {
        let t_num = "1";
        const t_sec = t_date.getHours().toString().padStart(2, '0') + t_date.getMinutes().toString().padStart(2, '0');
        //console.log(t_sec);
        for (var i = 0; i < m_s_ttime_list.length; i += 1) {

            if (parseInt(m_s_ttime_list[i].target) <= parseInt(t_sec)) {
                //console.log(t_sec, m_s_ttime_list[i].target, m_s_etime_list.indexOf(m_s_ttime_list[i].target));
                if (m_s_etime_list.indexOf(m_s_ttime_list[i].target) == -1) {
                    m_s_etime_list.push(m_s_ttime_list[i].target);
                    //console.log("-----------", m_s_ttime_list[i].target);

                    setSpecial(m_s_ttime_list[i].code);
                }
            }
            //console.log(m_s_ttime_list[i].target, t_sec);
            if (parseInt(m_s_ttime_list[i].target) == parseInt(t_sec)) {
                //console.log("11",m_s_etime_voice_list);
                if (m_s_etime_voice_list.indexOf(m_s_ttime_list[i].target) == -1) {
                    m_s_etime_voice_list.push(m_s_ttime_list[i].target);
                    //console.log("-----------", m_s_ttime_list[i].target);

                    setSpecialVoice(m_s_ttime_list[i].code);
                }
                //console.log("22",m_s_etime_voice_list);
            }
            /*
            //console.log(getTimeCal(m_s_ttime_list[i], -5));
            //console.log(getTimeCal(m_s_ttime_list[i], 0));
            //console.log(getTimeCal(m_s_ttime_list[i], 60));
            //console.log(getTimeCal(m_s_ttime_list[i], 120));
            //console.log("==========================");
            if (getTimeCal(m_s_ttime_list[i], -5) == t_sec) {
                setSpecial("1");
            } else if (getTimeCal(m_s_ttime_list[i], 0) == t_sec) {
                setSpecial("2");
            } else if (getTimeCal(m_s_ttime_list[i], 60) == t_sec) {
                setSpecial("3");
            } else if (getTimeCal(m_s_ttime_list[i], 120) == t_sec) {
                setSpecial("4");
            }
            */
        }
    }
    const time_curr = Date.now();
    const time_gap = Math.floor((time_curr - m_time_last) / 1000);
    if (time_gap > 60) {
        m_time_last = time_curr;
        setCallWebToApp("STATUS", "STATUS");
    }
    let t_operating_time = time_curr - m_first_time;
    t_operating_time = Math.round(t_operating_time / 1000);
    let t_str = "";
    if (m_operating_trigger == false) {
        m_operating_trigger_str = convFormatTime(t_operating_time);
        t_str = m_operating_trigger_str;
    } else {
        t_str = m_operating_trigger_str + " // " + convFormatTime(t_operating_time);
    }
    if (m_time_trigger == true && time_gap % 10 == 0) {
        $(".date_txt").html(setDateTime("date"));
        $(".time_txt").html(setDateTime("time"));
        if (getTimeCheck(_json) == false) {
            $(".ticker_cont").hide();
        }
    }


    //    $(".timeBox").html(t_str);
}

function setDateTime(_str) {
    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1; // 월
    let date = today.getDate(); // 날짜
    let day = today.getDay(); // 요일
    let rour = today.getHours();
    let hour = today.getHours();
    let min = today.getMinutes();
    let ampm = "";

    if (rour === 0) { 
        // 자정
        hour = 12;
        ampm = 'AM';
    } else if (rour === 12) { 
        // 정오
        hour = 12;
        ampm = 'PM';
    } else if (rour > 12) { 
        // 오후
        hour = rour - 12;
        ampm = 'PM';
    } else { 
        // 오전
        hour = rour;
        ampm = 'AM';
    }
    
    if (_str == "date") {
        return year.toString() + '-' + month.toString().padStart(2, '0') + '-' + date.toString().padStart(2, '0') + "";
        //return year.toString() + '년 ' + month.toString().padStart(2, '0') + '월 ' + date.toString().padStart(2, '0') + "일";
    } else {
        return rour.toString().padStart(2, '0') + ":" + min.toString().padStart(2, '0');
        //return ampm + " " + hour.toString().padStart(2, '0') + ":" + min.toString().padStart(2, '0');
    }
    //$('.time').html(rour.toString().padStart(2, '0') + ":" + min.toString().padStart(2, '0'));
    //$('.date').html(year.toString() + '/' + month.toString().padStart(2, '0') + '/' + date.toString().padStart(2, '0'));
}

function convFormatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    let formattedTime = "";

    if (hours > 0) {
        formattedTime += hours + ":";
    }

    if (minutes > 0 || hours > 0) {
        formattedTime += minutes + ":";
    }

    formattedTime += remainingSeconds + ":";

    return formattedTime;
}

function setMainTimeOut() {
    resetTimer();
    if (m_form_type == "AD") {
        //setNoticeDrawInfo();
        setPageDrawInfo();
    } else if (m_form_type == "LAYOUT") {
        setPageDrawInfo();
    }
}

function setPageDrawInfo() {
    if (m_final_notice_list.length == 0) {
        $(".alert_area").show();
        return;
    }
    //if (m_final_notice_list.length === 0) return;
    if ($(".cover").css("display") != "none") {
        $('.cover').hide();
    }
    let $videos;
    if (m_str_hide != "") {
        $videos = $(`#${m_str_hide} video`);
        try {
            $videos.each(function () {
                const video = this;
                setCallWebToApp("SETLOG", "[MOV] [REMOVE] " + decodeURIComponent(video.currentSrc).split('/').pop());
                video.pause();
                video.src = '';
                video.load();
                $(video).off('canplaythrough', onCanPlayPageEvent);
                $(video).remove();
            });
        } catch (error) {
            console.error('비디오 찾기 실패4 :', error);
            setCallWebToApp("SETLOG", "비디오 찾기 실패4 : " + error);
        }
    }

    m_curr_notice_cnt += 1;
    if (m_curr_notice_cnt >= m_final_notice_list.length) {
        m_curr_notice_cnt = 0;
    }
    console.log(getLogTime(), "setPageDrawInfo", m_curr_notice_cnt);

    const obj = m_final_notice_list[m_curr_notice_cnt];
    m_curr_page_obj = obj;

    m_curr_notice_num = (m_curr_notice_num === 1) ? 2 : 1;
    m_str_show = (m_curr_notice_num === 1) ? "id_notice_box_01" : "id_notice_box_02";
    m_str_hide = (m_curr_notice_num === 1) ? "id_notice_box_02" : "id_notice_box_01";
    
    
    $("#" + m_str_hide).css('z-index', 209);
    $("#" + m_str_show).css('z-index', 210);
    $("#" + m_str_show).hide();

    let t_html = "";
    m_show_video_cnt = 0;
    m_show_video_loaded_cnt = 0;


    for (let i = 0; i < obj.layout.length; i += 1) {
        const t_frame = obj.layout[i];
        //console.log(t_frame.cts_list);
        t_html += `<div class='notice_frame' style='top:${t_frame.y}px;left:${t_frame.x}px;width:${t_frame.width}px;height:${t_frame.height}px;z-index:${100 + i}'>`;
        //t_html += `<div class='notice_frame' style='top:${t_frame.y}px;left:${t_frame.x}px;width:${t_frame.width}px;height:${t_frame.height}px;z-index:${100 + obj.layout.length - i}'>`;
        t_html += "    <video muted preload>";
        //        t_html += `        <source src=${encodeURI(t_frame.cts_list[i].file_url)}>`;
        t_html += "        <source src=''>";
        t_html += "    </video>";
        t_html += "    <img src=''>";
        t_html += "    <div class='pdf_cont'>";
        t_html += "        <canvas class='pdf_view'></canvas>";
        t_html += "        <canvas class='pdf_view_temp'></canvas>";
        t_html += "    </div>";
        t_html += "    <div class='web_cont'>";
        t_html += "        <iframe allowtransparency='true' name='frame_webpage' scrolling ='no' onload='onLoadingComp()' src=''></iframe>";
        //t_html += "        <div class='click_blocker'></div>";
        t_html += "    </div>";
        t_html += "    <div class='debug_cont'>";
        t_html += "        <div class='circle'></div>";
        t_html += "    </div>";
        if (m_info_mode == true) {
            t_html += "    <div class='info'>";
            t_html += "        <div class='txt timeupdatePage'>0</div>";
            t_html += "    </div>";
        }
        t_html += "</div>";

        setCallWebToApp("SETLOG", "[LAYOUT] START / " + obj.ptime + "sec");
    }
    $("#" + m_str_show).append(t_html);
    //$('#id_ticker').hide();

    for (let i = 0; i < obj.layout.length; i += 1) {
        setPlayContents(i, 0);
    }
    //$("#" + m_str_show).show();

    m_first_draw = true;
    $videos = $("#" + m_str_show + " video");

    if ($videos.length > 0) {
        m_video_cnt = 0;
        m_video_max = 0;
        //setCallWebToApp("UNMUTE", "UNMUTE");
        try {
            $videos.each(function () {
                const video = this;
                if (video.src != "") {
                    m_video_max += 1;
                }
                $(this).on('canplaythrough', onCanPlayPageEvent);
            });
        } catch (error) {
            console.error('비디오 찾기 실패1 :', error);
            setCallWebToApp("SETLOG", "비디오 찾기 실패1 : " + error);
        }
    }

    if (m_page_timer) {
        clearInterval(m_page_timer);
    }

    m_page_timer = setInterval(onPageTimer, 100);
    obj.curr_date = Date.now();
    //    $("#" + m_str_show).css('opacity', '0');
    //m_create_chk_num += 1;
    m_notice_ptime = parseFloat(obj.ptime) * 1000;
    //console.log(m_notice_ptime);
    startPtimeTimer();

    setTimeout(setPageDrawInfoEnd, 250);
}

function setPageDrawInfoEnd() {
    //const $("#" + m_str_show) = $(`#${m_str_show}`);
    /*
    $("#" + m_str_show).css('display', 'block');
    setTimeout(() => {
        $("#" + m_str_show).css('opacity', '1');
    }, 10);
    */
    $("#" + m_str_show).show();
    const $videos = $(`#${m_str_hide} video`);
    try {
        $videos.each(function () {
            this.pause();
        });
    } catch (error) {
        console.error('비디오 찾기 실패3 :', error);
        setCallWebToApp("SETLOG", "비디오 찾기 실패3 : " + error);
    }
    setTimeout(setClearHideVideos, 1000);
}



function setSpecialPageDrawInfo() {
    if (m_s_page_list.length === 0) return;
    if ($(".cover").css("display") != "none") {
        $('.cover').hide();
    }
    let $videos;
    if (m_s_str_hide != "") {
        $videos = $(`#${m_s_str_hide} video`);
        try {
            $videos.each(function () {
                const video = this;
                setCallWebToApp("SETLOG", "[MOV] [REMOVE] " + decodeURIComponent(video.currentSrc).split('/').pop());
                video.pause();
                video.src = '';
                video.load();
                $(video).off('canplaythrough', onCanPlayPageEvent);
                $(video).remove();
            });
        } catch (error) {
            console.error('비디오 찾기 실패4 :', error);
            setCallWebToApp("SETLOG", "비디오 찾기 실패4 : " + error);
        }
    }

    m_s_curr_notice_cnt += 1;
    if (m_s_curr_notice_cnt >= m_s_page_list.length) {
        m_s_curr_notice_cnt = 0;
    }
    console.log(getLogTime(), "setSpecialPageDrawInfo", m_s_curr_notice_cnt);

    const obj = m_s_page_list[m_s_curr_notice_cnt];
    m_s_curr_page_obj = obj;

    m_s_curr_notice_num = (m_s_curr_notice_num === 1) ? 2 : 1;
    m_s_str_show = (m_s_curr_notice_num === 1) ? "id_s_notice_box_01" : "id_s_notice_box_02";
    m_s_str_hide = (m_s_curr_notice_num === 1) ? "id_s_notice_box_02" : "id_s_notice_box_01";

    $("#" + m_s_str_hide).css('z-index', 209);
    $("#" + m_s_str_show).css('z-index', 210);
    $("#" + m_s_str_show).hide();

    let t_html = "";
    m_s_show_video_cnt = 0;
    m_s_show_video_loaded_cnt = 0;

    for (let i = 0; i < obj.layout.length; i += 1) {
        const t_frame = obj.layout[i];
        t_html += `<div class='notice_frame' style='top:0px;left:0px;width:${m_header.kiosk_resolution.width}px;height:${m_header.kiosk_resolution.height}px;z-index:${100 + i}'>`;
        t_html += "    <video muted preload>";
        t_html += "        <source src=''>";
        t_html += "    </video>";
        t_html += "    <img src=''>";
        t_html += "    <div class='pdf_cont'>";
        t_html += "        <canvas class='pdf_view'></canvas>";
        t_html += "    </div>";
        t_html += "    <div class='web_cont'>";
        t_html += "        <iframe allowtransparency='true' name='frame_webpage' scrolling ='no' onload='onLoadingComp()' src=''></iframe>";
        t_html += "    </div>";
        t_html += "    <div class='debug_cont'>";
        t_html += "        <div class='circle'></div>";
        t_html += "    </div>";

        if (m_info_mode == true) {
            t_html += "    <div class='info'>";
            t_html += "        <div class='txt timeupdatePage'>0</div>";
            t_html += "    </div>";
        }
        t_html += "</div>";

        setCallWebToApp("SETLOG", "[LAYOUT] START / " + obj.ptime + "sec");
    }
    $("#" + m_s_str_show).append(t_html);

    for (let i = 0; i < obj.layout.length; i += 1) {
        setSpecialPlayContents(i, 0);
    }
    //$("#" + m_s_str_show).show();

    m_s_first_draw = true;
    $videos = $("#" + m_s_str_show + " video");
    if ($videos.length > 0) {
        m_s_video_cnt = 0;
        m_s_video_max = 0;
        //setCallWebToApp("UNMUTE", "UNMUTE");
        try {
            $videos.each(function () {
                const video = this;
                if (video.src != "") {
                    m_s_video_max += 1;
                }
                $(this).on('canplaythrough', onCanPlaySpecialPageEvent);
            });
        } catch (error) {
            console.error('비디오 찾기 실패1 :', error);
            setCallWebToApp("SETLOG", "비디오 찾기 실패1 : " + error);
        }
    }

    if (m_s_page_timer) {
        clearInterval(m_s_page_timer);
    }

    m_s_page_timer = setInterval(onSpecialPageTimer, 100);
    //    $("#" + m_s_str_show).css('opacity', '0');
    //m_create_chk_num += 1;
    m_s_notice_ptime = parseFloat(obj.ptime) * 1000;
    //console.log(m_notice_ptime);
    startSpecialPtimeTimer();

    setTimeout(setSpecialPageDrawInfoEnd, 250);
}

function setSpecialPageDrawInfoEnd() {
    $("#" + m_s_str_show).show();
    const $videos = $(`#${m_s_str_hide} video`);
    try {
        $videos.each(function () {
            this.pause();
        });
    } catch (error) {
        console.error('비디오 찾기 실패3 :', error);
        setCallWebToApp("SETLOG", "비디오 찾기 실패3 : " + error);
    }
    setTimeout(setClearSpecialHideVideos, 1000);
}

function onLoadingComp() {

}


function onPageTimer() {
    for (let i = 0; i < m_curr_page_obj.layout.length; i += 1) {
        const t_layout = m_curr_page_obj.layout[i];
        let t_cnt = t_layout.curr_cnt;
        const t_ptime = t_layout.cts_list[t_cnt].full_time * 1000;
        const elapsedTime = Date.now() - t_layout.cts_list[t_cnt].curr_date;
        const totalCheckTime = Date.now() - m_curr_page_obj.curr_date;

        if (m_info_mode == true) {
            $("#" + m_str_show + " .notice_frame").eq(i).find(".timeupdatePage").html((elapsedTime / 1000).toFixed(2) + "초");
        }
        //if (i == 0) {
        //console.log(elapsedTime, t_ptime, m_notice_ptime);
        //}
        //console.log(elapsedTime, t_ptime, m_notice_ptime, totalCheckTime);
        if (elapsedTime > t_ptime) {
            t_cnt += 1;
            if (t_cnt > t_layout.cts_list.length - 1) {
                t_cnt = 0;
            }
            const t_chk_time = Math.abs(m_notice_ptime - t_ptime);
            //console.log("TIME_CHECK!! " + t_ptime);
            //console.log("TIME_CHECK!! " + m_notice_ptime);
            //console.log("TIME_CHECK!! " + Math.abs(m_notice_ptime - t_ptime));
            //console.log(t_chk_time, t_ptime);
            //t_chk_time은 100초짜리 page타임에 60초짜리 컨텐츠가 들어갔을 경우 남은 시간동안 추가 재생을 해야하는지를 판단하는 값이었음
            //100초짜리에 50초짜리 동영상이 돌아간다면, 두번째 재생이 종료되고 세번째 재생이 시작되는 시점과, 다음 page를 재생하는 시점이 맡물릴 경우에 대한 대책이었으나
            //남은 시간을 비교해서 더 돌릴 수 없다고 판단하면 다시 재생하지 않는 문제가 발생하여 일단 주석처리
            //if (t_chk_time > t_ptime) {
            if (totalCheckTime + 500 < m_notice_ptime) {
                //console.log(elapsedTime, m_notice_ptime);
                setPlayContents(i, t_cnt);
            }
            //}
            /*
            if (m_pdf_timer) {
                clearInterval(m_pdf_timer);
            }
            */
        }
    }
}

function onSpecialPageTimer() {
    //console.log(m_s_curr_page_obj);
    for (let i = 0; i < m_s_curr_page_obj.layout.length; i += 1) {
        const t_layout = m_s_curr_page_obj.layout[i];
        let t_cnt = t_layout.curr_cnt;
        const t_ptime = t_layout.cts_list[t_cnt].full_time * 1000;
        const elapsedTime = Date.now() - t_layout.cts_list[t_cnt].curr_date;
        if (elapsedTime > t_ptime) {
            t_cnt += 1;
            if (t_cnt > t_layout.cts_list.length - 1) {
                t_cnt = 0;
            }
            const t_chk_time = Math.abs(m_s_notice_ptime - t_ptime);
            if (elapsedTime + 500 < m_s_notice_ptime) {
                setSpecialPlayContents(i, t_cnt);
            }
        }
    }
}

function onPdfTimer() {
    for (let i = 0; i < m_curr_page_obj.layout.length; i += 1) {
        const t_layout = m_curr_page_obj.layout[i];
        let t_cnt = t_layout.curr_cnt;
        let t_curr_cnt = t_layout.cts_list[t_cnt].curr_cnt;
        let t_curr_full_time = t_layout.cts_list[t_cnt].full_time * 1000;
        const t_ptime = (t_layout.cts_list[t_cnt].full_time / t_layout.cts_list[t_cnt].page_cnt * 1000) * t_curr_cnt;
        const elapsedTime = Date.now() - t_layout.cts_list[t_cnt].curr_date;
        if (t_layout.cts_list[t_cnt].type == "PDF" || t_layout.cts_list[t_cnt].type == "PPT") {
            //console.log(elapsedTime, t_ptime);
            if (elapsedTime > t_ptime) {
                t_curr_cnt += 1;
                if (t_curr_cnt > t_layout.cts_list[t_cnt].max_cnt) {
                    const $pdf = $("#" + m_str_show + " .notice_frame .pdf_cont").eq(i);
                    $pdf.find('.pdf_view').remove(); // 현재 선택된 pdf_view만 삭제
                    $pdf.find('.pdf_view_temp').remove(); // 현재 선택된 pdf_view만 삭제
                    $pdf.append('<canvas class="pdf_view"></canvas>'); // 새 pdf_view 추가
                    $pdf.append('<canvas class="pdf_view_temp"></canvas>'); // 새 pdf_view 추가
                    t_curr_cnt = 1;
                    //if (m_pdf_timer) {
                    //clearInterval(m_pdf_timer);
                    //}
                }
                //console.log(">>>>", t_curr_cnt, t_layout.cts_list[t_cnt].max_cnt);
                if (t_curr_cnt <= t_layout.cts_list[t_cnt].max_cnt) {
                    t_layout.cts_list[t_cnt].curr_cnt = t_curr_cnt;
                    //$("#" + m_str_show + " .notice_frame .pdf_cont .pdf_view").remove();
                    //$("#" + m_str_show + " .notice_frame .pdf_cont").append('<canvas class="pdf_view"></canvas>');

                    const $pdf = $("#" + m_str_show + " .notice_frame .pdf_cont").eq(i);
                    //$pdf.find('.pdf_view').remove(); // 현재 선택된 pdf_view만 삭제
                    //$pdf.append('<canvas class="pdf_view"></canvas>'); // 새 pdf_view 추가
                    const $circle = $("#" + m_str_show + " .notice_frame .circle").eq(i);
                    //console.log(t_layout.cts_list[t_cnt].file_url);

                    const t_chk_time = Math.abs(m_notice_ptime - t_ptime);
                    //console.log(t_curr_cnt, t_layout.cts_list[t_cnt].max_cnt, t_chk_time, t_ptime);
                    //if (t_chk_time > t_ptime) {{
                    console.log(">>", elapsedTime, t_ptime, t_curr_full_time, m_notice_ptime, t_layout.cts_list[t_cnt].page_cnt * 1000);
                    //if (elapsedTime + 500 < t_ptime) {
                    if (elapsedTime > t_ptime) {
                        if (elapsedTime + 500 < t_curr_full_time) {
                            setLoadPdf(t_layout, t_layout.cts_list[t_cnt], t_layout.cts_list[t_cnt].file_url, $pdf, t_layout.width, t_layout.height, t_layout.cts_list[t_cnt].curr_cnt, $circle);
                        }
                    }
                    //}
                }
            }
        }
    }
}

function setPlayContents(_inum, _cnt) {
    m_curr_page_obj.layout[_inum].curr_cnt = _cnt;
    const t_list = m_curr_page_obj.layout[_inum].cts_list;
    console.log(getLogTime(), "setPlayContents / " + _cnt + "번째 화면 / " + _inum + "번째 컨텐츠 / " + t_list[_cnt].file_url.split("/")[2]);
    //console.log(t_list[_cnt]);
    t_list[_cnt].curr_date = Date.now();
    const $video = $("#" + m_str_show + " .notice_frame").eq(_inum).find('video');
    const $img = $("#" + m_str_show + " .notice_frame").eq(_inum).find('img');
    const $pdf = $("#" + m_str_show + " .notice_frame .pdf_cont").eq(_inum);
    const $web = $("#" + m_str_show + " .notice_frame .web_cont").eq(_inum);
    const $circle = $("#" + m_str_show + " .notice_frame").eq(_inum).find('.circle');
    $circle.hide();
    $video.hide();
    $img.hide();
    $pdf.hide();
    $web.hide();

    //console.log("111",$("#" + m_str_show + " .notice_frame .pdf_cont"));
    if (t_list[_cnt].type == "MOV") {
        /*
        
        $video.show();
        if (t_list[_cnt].ratio == "FULL") {
            $video.addClass("full_size");
        } else {
            $video.removeClass("full_size");
        }
        $video.attr('src', t_list[_cnt].file_url);
        setCallWebToApp("SETLOG", "[MOV] [LOAD] " + t_list[_cnt].ratio + " / " + decodeURIComponent($video.attr('src')).split('/').pop() + " / " + t_list[_cnt].full_time + "sec");

        $video.on('error', function () {
            setCallWebToApp("SETLOG", "[MOV] [ERROR] " + decodeURIComponent($video.attr('src')).split('/').pop());
            $circle.css('background-color', 'red');
            $circle.show();
        });
        
        */
        // 1) 비어있는 <source> 제거 (있다면)
        $video.find("source").each(function () {
            const s = $(this).attr("src");
            if (!s) $(this).remove();
        });

        // 2) 꽉 채움 여부
        if (t_list[_cnt].ratio === "FULL") $video.addClass("full_size");
        else $video.removeClass("full_size");

        // 3) 자동재생 필수 속성 세팅
        $video.prop({
            muted: true,               // 자동재생 정책 우회
            autoplay: true,
            playsInline: true,         // iOS 인라인 재생
            loop: true
        });
        
        // 4) 이전 이벤트/소스 정리
        $video.off("error loadeddata canplay");
        // 강제 리로드를 위해 src 비우고 다시 할당
        const url = t_list[_cnt].file_url;
        $video.attr("src", "");               // 캐시된 소스 클리어
        // 재생 로그
        setCallWebToApp("SETLOG", "[MOV] [LOAD] " + t_list[_cnt].ratio + " / "
            + decodeURIComponent(url).split("/").pop() + " / " + t_list[_cnt].full_time + "sec");

        // 5) 이벤트(중복 방지하고, 실패/성공 표식)
        $video.on("error", function () {
            setCallWebToApp("SETLOG", "[MOV] [ERROR] " + decodeURIComponent(url).split("/").pop());
            $circle.css("background-color", "red").show();
        });

        // 6) 소스 할당 → load() → play()
        const v = $video.get(0);
        $video.attr("src", url);
        try { v.load(); } catch(e) {}
        // loadeddata 이후 play 시도 + 첫 터치 백업
        const tryPlay = () => v.play().catch(err => {
            // 자동재생 정책으로 막힌 경우 대비
            setCallWebToApp("SETLOG", "[MOV] [PLAY][CATCH] " + err);
        });

        $video.one("loadeddata", tryPlay);
        // 이미 준비되었으면 바로
        if (v.readyState >= 2) tryPlay();

        // iOS/모바일 첫 터치 보조
        window.addEventListener("pointerdown", function once() {
            tryPlay();
            window.removeEventListener("pointerdown", once, { capture:false });
        }, { once:true, passive:true });

        // 7) 보이기 (마지막에)
        $video.show();
        
    } else if (t_list[_cnt].type == "IMG") {
        $img.attr('src', '');
        $img.show();
        if (t_list[_cnt].ratio == "FULL") {
            $img.addClass("full_size");
        } else {
            $img.removeClass("full_size");
        }
        $img.attr('src', t_list[_cnt].file_url);
        setCallWebToApp("SETLOG", "[IMG] [LOAD] " + t_list[_cnt].ratio + " / " + decodeURIComponent(t_list[_cnt].file_url).split('/').pop() + " / " + t_list[_cnt].full_time + "sec");
        $img.on('error', function () {
            setCallWebToApp("SETLOG", "[IMG] [ERROR] " + decodeURIComponent(t_list[_cnt].file_url).split('/').pop());
            $circle.css('background-color', 'green');
            $circle.show();
        });
    } else if (t_list[_cnt].type == "PDF" || t_list[_cnt].type == "PPT") {
        $pdf.show();
        if (t_list[_cnt].ratio == "FULL") {
            $pdf.addClass("full_size");
        } else {
            $pdf.removeClass("full_size");
        }
        $pdf.find('.pdf_view').remove(); // 현재 선택된 pdf_view만 삭제
        $pdf.append('<canvas class="pdf_view"></canvas>'); // 새 pdf_view 추가
        t_list[_cnt].curr_cnt = 1;
        m_curr_page_obj.layout[_inum].is_rendering = false;
        setLoadPdf(m_curr_page_obj.layout[_inum], t_list[_cnt], t_list[_cnt].file_url, $pdf, m_curr_page_obj.layout[_inum].width, m_curr_page_obj.layout[_inum].height, t_list[_cnt].curr_cnt, $circle);
        setCallWebToApp("SETLOG", "[PDF] [LOAD] " + t_list[_cnt].ratio + " / " + decodeURIComponent(t_list[_cnt].file_url).split('/').pop() + " / " + t_list[_cnt].full_time + "sec");
        if (m_pdf_timer) {
            clearInterval(m_pdf_timer);
        }
        m_pdf_timer = setInterval(onPdfTimer, 100);

    } else if (t_list[_cnt].type == "URL") {
        $web.show();
        setCallWebToApp("SETLOG", "[URL] [LOAD] " + t_list[_cnt].ratio + " / " + t_list[_cnt].file_url + " / " + t_list[_cnt].full_time + "sec");
        $web.find('iframe').attr('src', t_list[_cnt].file_url);
        //setCheckWebpage($web, t_list[_cnt].file_url);
    } else if (t_list[_cnt].type == "RSS") {
        setCallWebToApp("SETLOG", "[RSS] [LOAD] " + t_list[_cnt].ratio + " / " + t_list[_cnt].file_url + " / " + t_list[_cnt].full_time + "sec");
        //$web.find('iframe').attr('src', t_list[_cnt].name);
        //setCheckWebpage($web, t_list[_cnt].file_url);
        //fetchRSS(t_list[_cnt].file_url);
    }
}

function getLogTime() {
    var t_date = new Date();
    var t_time = t_date.getHours().toString().padStart(2, '0') + ":" + t_date.getMinutes().toString().padStart(2, '0') + ":" + t_date.getSeconds().toString().padStart(2, '0');
    return t_time;
}

function setSpecialPlayContents(_inum, _cnt) {
    m_s_curr_page_obj.layout[_inum].curr_cnt = _cnt;
    const t_list = m_s_curr_page_obj.layout[_inum].cts_list;
    //console.log("setSpecialPlayContents / " + _cnt + "번째 화면 / " + _inum + "번째 컨텐츠 / " + t_list[_cnt].file_url.split("/")[2]);
    //console.log(t_list[_cnt]);
    t_list[_cnt].curr_date = Date.now();
    const $video = $("#" + m_s_str_show + " .notice_frame").eq(_inum).find('video');
    const $img = $("#" + m_s_str_show + " .notice_frame").eq(_inum).find('img');
    const $pdf = $("#" + m_s_str_show + " .notice_frame .pdf_cont").eq(_inum);
    const $web = $("#" + m_s_str_show + " .notice_frame .web_cont").eq(_inum);
    const $circle = $("#" + m_s_str_show + " .notice_frame").eq(_inum).find('.circle');
    $circle.hide();
    $video.hide();
    $img.hide();
    $pdf.hide();
    $web.hide();

    //console.log("111",$("#" + m_s_str_show + " .notice_frame .pdf_cont"));
    if (t_list[_cnt].type == "MOV") {
        $video.show();
        if (t_list[_cnt].ratio == "FULL") {
            $video.addClass("full_size");
        } else {
            $video.removeClass("full_size");
        }
        $video.attr('src', t_list[_cnt].file_url);
        setCallWebToApp("SETLOG", "[MOV] [LOAD] " + t_list[_cnt].ratio + " / " + decodeURIComponent($video.attr('src')).split('/').pop() + " / " + t_list[_cnt].full_time + "sec");

        $video.on('error', function () {
            setCallWebToApp("SETLOG", "[MOV] [ERROR] " + decodeURIComponent($video.attr('src')).split('/').pop());
            $circle.css('background-color', 'red');
            $circle.show();
        });
    } else if (t_list[_cnt].type == "IMG") {
        $img.attr('src', '');
        $img.show();
        if (t_list[_cnt].ratio == "FULL") {
            $img.addClass("full_size");
        } else {
            $img.removeClass("full_size");
        }
        $img.attr('src', t_list[_cnt].file_url);
        setCallWebToApp("SETLOG", "[IMG] [LOAD] " + t_list[_cnt].ratio + " / " + decodeURIComponent(t_list[_cnt].file_url).split('/').pop() + " / " + t_list[_cnt].full_time + "sec");
        $img.on('error', function () {
            setCallWebToApp("SETLOG", "[IMG] [ERROR] " + decodeURIComponent(t_list[_cnt].file_url).split('/').pop());
            $circle.css('background-color', 'green');
            $circle.show();
        });
    } else if (t_list[_cnt].type == "PDF" || t_list[_cnt].type == "PPT") {
        m_pdf_temp_context = null;
        $pdf.show();
        if (t_list[_cnt].ratio == "FULL") {
            $pdf.addClass("full_size");
        } else {
            $pdf.removeClass("full_size");
        }
        $pdf.find('.pdf_view').remove(); // 현재 선택된 pdf_view만 삭제
        $pdf.append('<canvas class="pdf_view"></canvas>'); // 새 pdf_view 추가
        $pdf.find('.pdf_view_temp').remove(); // 현재 선택된 pdf_view만 삭제
        $pdf.append('<canvas class="pdf_view_temp"></canvas>'); // 새 pdf_view 추가
        t_list[_cnt].curr_cnt = 1;
        m_s_curr_page_obj.layout[_inum].is_rendering = false;
        setLoadPdf(m_s_curr_page_obj.layout[_inum], t_list[_cnt], t_list[_cnt].file_url, $pdf, m_s_curr_page_obj.layout[_inum].width, m_s_curr_page_obj.layout[_inum].height, t_list[_cnt].curr_cnt, $circle);
        setCallWebToApp("SETLOG", "[PDF] [LOAD] " + t_list[_cnt].ratio + " / " + decodeURIComponent(t_list[_cnt].file_url).split('/').pop() + " / " + t_list[_cnt].full_time + "sec");
        if (m_pdf_timer) {
            clearInterval(m_pdf_timer);
        }
        m_pdf_timer = setInterval(onPdfTimer, 100);

    } else if (t_list[_cnt].type == "URL") {
        $web.show();
        setCallWebToApp("SETLOG", "[URL] [LOAD] " + t_list[_cnt].ratio + " / " + t_list[_cnt].file_url + " / " + t_list[_cnt].full_time + "sec");
        $web.find('iframe').attr('src', t_list[_cnt].file_url);
        //setCheckWebpage($web, t_list[_cnt].file_url);
    } else if (t_list[_cnt].type == "RSS") {
        setCallWebToApp("SETLOG", "[RSS] [LOAD] " + t_list[_cnt].ratio + " / " + t_list[_cnt].file_url + " / " + t_list[_cnt].full_time + "sec");
        //$web.find('iframe').attr('src', t_list[_cnt].name);
        //setCheckWebpage($web, t_list[_cnt].file_url);
        //fetchRSS(t_list[_cnt].file_url);
    }
}


function onCanPlayPageEvent(event) {
    if (m_first_draw == true) {
        m_video_cnt += 1;
        //console.log(event.target+" // "+m_video_cnt);
        //console.log(m_video_cnt+" / "+m_video_max);
        if (m_video_cnt == m_video_max) {
            const $videos = $(`#${m_str_show} video`);
            $videos.each(function () {
                const video = this;
                //console.log(video);
                if (video.readyState === 4) {
                    video.play();
                    setCallWebToApp("SETLOG", "[MOV] [PLAY] " + decodeURIComponent(video.currentSrc).split('/').pop());
                    //startPtimeTimer();
                    //checkAllVideosLoaded();
                }
            });
            m_video_cnt = 0;
            m_first_draw = false;
        }
    } else {
        $(event.target)[0].play();
        setCallWebToApp("SETLOG", "[MOV] [PLAY] " + decodeURIComponent($(event.target)[0].currentSrc).split('/').pop());
    }
}

function onCanPlaySpecialPageEvent(event) {
    if (m_s_first_draw == true) {
        m_s_video_cnt += 1;
        if (m_s_video_cnt == m_s_video_max) {
            const $videos = $(`#${m_str_show} video`);
            $videos.each(function () {
                const video = this;
                if (video.readyState === 4) {
                    video.play();
                    setCallWebToApp("SETLOG", "[MOV] [PLAY] " + decodeURIComponent(video.currentSrc).split('/').pop());
                }
            });
            m_s_video_cnt = 0;
            m_s_first_draw = false;
        }
    } else {
        $(event.target)[0].play();
        setCallWebToApp("SETLOG", "[MOV] [PLAY] " + decodeURIComponent($(event.target)[0].currentSrc).split('/').pop());
    }
}

function setClearHideVideos() {
    $("#" + m_str_hide).fadeOut();
    const $videos = $(`#${m_str_hide} video`);
    try {
        $videos.each(function () {
            const video = this;
            setCallWebToApp("SETLOG", "[MOV] [REMOVE] " + decodeURIComponent(video.currentSrc).split('/').pop());
            video.pause();
            video.src = '';
            video.load();
            $(video).off('canplaythrough', onCanPlayPageEvent);
            $(video).remove();
        });
    } catch (error) {
        console.error('비디오 찾기 실패4 :', error);
        setCallWebToApp("SETLOG", "비디오 찾기 실패4 : " + error);
    }
    setTimeout(setClearHideDiv, 500);
}

function setClearSpecialHideVideos() {
    $("#" + m_s_str_hide).fadeOut();
    const $videos = $(`#${m_s_str_hide} video`);
    try {
        $videos.each(function () {
            const video = this;
            setCallWebToApp("SETLOG", "[MOV] [REMOVE] " + decodeURIComponent(video.currentSrc).split('/').pop());
            video.pause();
            video.src = '';
            video.load();
            $(video).off('canplaythrough', onCanPlaySpecialPageEvent);
            $(video).remove();
        });
    } catch (error) {
        console.error('비디오 찾기 실패4 :', error);
        setCallWebToApp("SETLOG", "비디오 찾기 실패4 : " + error);
    }
    setTimeout(setClearHideSpecialDiv, 500);
}

function setClearHideDiv() {
    $("#" + m_str_hide).html('');
    $("#" + m_str_hide).hide();
}

function setClearHideSpecialDiv() {
    $("#" + m_s_str_hide).html('');
    $("#" + m_s_str_hide).hide();
}

function startPtimeTimer() {
    if (m_ptime_timer) {
        clearInterval(m_ptime_timer);
    }
    m_start_ptime_time = Date.now();
    m_ptime_timer = setInterval(onPtimeTimer, 100);
}

function startSpecialPtimeTimer() {
    if (m_s_ptime_timer) {
        clearInterval(m_s_ptime_timer);
    }
    m_s_start_ptime_time = Date.now();
    m_s_ptime_timer = setInterval(onSpecialPtimeTimer, 100);
}

function startTimer() {
    if (m_chk_timer) {
        clearInterval(m_chk_timer);
    }
    m_video_time_map_list = new Map();
    m_start_time = Date.now();
    m_chk_timer = setInterval(onShowTimer, 100);
}

function resetTimer() {
    if (m_chk_timer) {
        clearInterval(m_chk_timer);
    }
    m_start_time = Date.now();
}

function onPtimeTimer() {
    const elapsedTime = Date.now() - m_start_ptime_time;
    //console.log(elapsedTime);
    if (m_info_mode == true) {
        $(".time_main_box").html((elapsedTime / 1000).toFixed(2) + "초 / " + (m_notice_ptime / 1000).toFixed(2) + "초");
    }
    //console.log(elapsedTime);
    if (elapsedTime > m_notice_ptime) {
        clearInterval(m_ptime_timer);
        resetTimer();
        if (m_form_type == "AD") {
            //setNoticeDrawInfo();
            setPageDrawInfo();
        } else if (m_form_type == "LAYOUT") {
            setPageDrawInfo();
        }
    }
}

function onSpecialPtimeTimer() {

    const elapsedTime = Date.now() - m_s_start_ptime_time;
    if (m_info_mode == true) {
        $(".time_main_box").html((elapsedTime / 1000).toFixed(2) + "초 / " + (m_notice_ptime / 1000).toFixed(2) + "초");
    }

    //console.log(elapsedTime);
    if (elapsedTime > m_s_notice_ptime) {
        clearInterval(m_s_ptime_timer);
        resetTimer();
        if (m_form_type == "AD") {
            //setNoticeDrawInfo();
            setSpecialPageDrawInfo();
        } else if (m_form_type == "LAYOUT") {
            setSpecialPageDrawInfo();
        }
    }
}

function onShowTimerOld() {
    m_current_time = ((Date.now() - m_start_time) / 1000).toFixed(2);
    const $videos = $(`#${m_str_show} video`);
    try {
        $videos.each(function () {
            const video = this;
            const t_currrent_time = video.currentTime.toFixed(2);
            const t_result = Math.abs(m_current_time - t_currrent_time).toFixed(2);
            $(video).next().find(".timeupdate").text(`시간차 : ${m_current_time} - ${t_currrent_time} = ${t_result}`);
            if (t_result > 0.5) {
                setReloadUDP(m_current_time, t_currrent_time, t_result);
            }
        });
    } catch (error) {
        console.error('비디오 찾기 실패 :', error);
    }
}

function onShowTimer() {
    m_current_time = ((Date.now() - m_start_time) / 1000).toFixed(2);
    const $videos = $(`#${m_str_show} video`);

    try {
        $videos.each(function () {
            const video = this;
            const videoId = video.id || $(video).index(); // 비디오를 구분할 수 있는 ID 또는 인덱스 사용
            const t_current_time = parseFloat(video.currentTime);
            if (!m_video_time_map_list.has(videoId)) {
                m_video_time_map_list.set(videoId, {
                    accumulatedTime: 0,
                    lastTime: t_current_time,
                    loopCount: 0
                });
            }
            let videoData = m_video_time_map_list.get(videoId);
            let {
                accumulatedTime,
                lastTime,
                loopCount
            } = videoData;
            const timeDifference = lastTime - t_current_time;

            if (timeDifference > 0.5) {
                loopCount += 1;
            }
            accumulatedTime = loopCount * video.duration + t_current_time;
            videoData = {
                accumulatedTime,
                lastTime: t_current_time,
                loopCount
            };
            m_video_time_map_list.set(videoId, videoData);
            const t_result = Math.abs(m_current_time - accumulatedTime).toFixed(2);
            $(video).next().find(".timeupdate").text(`시간차 : ${m_current_time} - ${parseFloat(accumulatedTime).toFixed(2)} = ${t_result}`);
            if (t_result > 0.5) {
                setReloadUDP(m_current_time, accumulatedTime.toFixed(2), t_result);
            }
        });
    } catch (error) {
        console.error('비디오 찾기 실패 :', error);
    }
}

function setReloadUDP(_current_time, _currrent_video_time, _result) {
    m_operating_trigger = true;
    if (m_reload_chk === 0) {
        m_reload_chk = 1;
        setCallWebToApp("SETLOG", "[WEB] UDP RELOAD!!!! " + _current_time + "-" + _currrent_video_time + "=" + _result);
        setTimeout(setReloadReset, 10000);
    }
}

function setReloadReset() {
    m_reload_chk = 0;
}




//pdf 불러오기
function setLoadPdf(_layout, _json, _url, _obj, _w, _h, _num, _circle) {
    //console.log(_json);
    //console.log(_obj);
    //console.log("setLoadPdf", _json, _url, _num);
    console.log("setLoadPdf" + " / " + _num + "번째 페이지 / " + _url.split("/")[2]);
    if (_url == "") {
        console.log('PDF 파일 없음:');
        return;
    }
    m_curr_x = 0;
    m_pdf_num = _num;
    m_pdf_width = _w;
    m_pdf_height = _h;
    m_width = 0;
    m_height = 0;
    var container = $(_obj);

    var url = _url;

    // page_imgs 배열 초기화 (최초 로드 시)
    if (!_json.page_imgs) {
        _json.page_imgs = [];
        _json.max_cnt = -1;
        _json.pdf_doc = null;
    }

    //console.log("캐시 이미지 체크 : ",_json.page_imgs, _json.page_imgs[_num - 1]);

    if (_json.page_imgs[_num - 1]) {
        useCachedImage(_layout, _num, container, _json.page_imgs[_num - 1], _w, _h);
        console.log("캐시 이미지 1");
        // 다음 페이지를 미리 로드
        if (_num < _json.max_cnt && _json.max_cnt != -1 && !_json.page_imgs[_num]) {
            renderPagePreload(_layout, _num + 1, container, _json.pdf_doc, _w, _h, _json);
        }
    } else {
        if (_json.pdf_doc == null) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/include/js/lib/pdf.worker.min.js';

            let loadingTask = pdfjsLib.getDocument({
                url: url,
                cMapUrl: '/include/js/lib/cmaps/',
                enableXfa: true,
                disableFontFace: false,
            });

            loadingTask.onProgress = function (progressData) {
                let t_Loaded = (progressData.loaded / progressData.total) * 100;
                //console.log(t_Loaded+"%");
            };
            loadingTask.promise
                .then(function (_pdfDoc) {
                    //pdfDoc = _pdfDoc;
                    //console.log("container",container);
                    _json.max_cnt = _pdfDoc.numPages;
                    _json.pdf_doc = _pdfDoc;
                    // _num번째 페이지만 로드
                    //console.log("loadingTask",_num, pdfDoc.numPages);
                    if (_num >= 1 && _num <= _json.max_cnt) {
                        // 캐시된 이미지가 없으면 렌더링
                        renderPage(_layout, _num, container, _json.pdf_doc, _w, _h, _json);
                        console.log("렌더링 이미지");
                        // 다음 페이지를 미리 로드
                        if (_num < _json.max_cnt && _json.max_cnt != -1 && !_json.page_imgs[_num]) {
                            renderPagePreload(_layout, _num + 1, container, _json.pdf_doc, _w, _h, _json);
                        }
                    } else {
                        console.error('유효하지 않은 페이지 번호입니다.');
                    }
                })
                .catch(function (error) {
                    // PDF를 불러오는데 실패한 경우
                    console.error('PDF 로드 에러:', error);
                    _circle.css('background-color', 'blue');
                    _circle.show();
                });
        } else {
            if (_num >= 1 && _num <= _json.max_cnt) {
                // 캐시된 이미지가 없으면 렌더링
                renderPage(_layout, _num, container, _json.pdf_doc, _w, _h, _json);
                console.log("렌더링 이미지 2");
                // 다음 페이지를 미리 로드
                if (_num < _json.max_cnt && _json.max_cnt != -1 && !_json.page_imgs[_num]) {
                    renderPagePreload(_layout, _num + 1, container, _json.pdf_doc, _w, _h, _json);
                }
            } else {
                console.error('유효하지 않은 페이지 번호입니다.');
            }
        }
    }
}

// 캐시된 이미지 사용
function useCachedImage(_layout, num, cont, cachedImage, _w, _h) {
    var $canvas = cont.find('.pdf_view')[0];
    var context = $canvas.getContext('2d', {
        willReadFrequently: true
    });

    // 캔버스 내용 지우기
    context.clearRect(0, 0, $canvas.width, $canvas.height);

    $canvas.width = cachedImage.width;
    $canvas.height = cachedImage.height;
    context.putImageData(cachedImage, 0, 0);

    // 캔버스 위치 조정 (필요한 경우)
    //$canvas.style.position = 'absolute';
    //$canvas.style.top = _h / 2 - cachedImage.height / 2 + "px";
    //$canvas.style.left = _w / 2 - cachedImage.width / 2 + "px";
}

//pdf 페이지 렌더링
function renderPage(_layout, _num, _cont, _pdfDoc, _w, _h, _json) {
    //console.log("_layout.is_rendering",_layout.is_rendering);
    if (_layout.is_rendering) {
        return;
    }
    _layout.is_rendering = true;

    let nw = 0;
    let nh = 0;

    let $pdf_view = _cont.find('.pdf_view');
    let $canvas = $pdf_view[0];
    let context = $canvas.getContext('2d', {
        willReadFrequently: true
    });

    // 캔버스 내용 지우기
    context.clearRect(0, 0, $canvas.width, $canvas.height);

    let t_scale = 0;
    let renderContext = null;

    _pdfDoc.getPage(_num).then(function (page) {
        let viewport = page.getViewport({
            scale: 1
        });
        //console.log("Original viewport:", viewport.width, viewport.height);
        if (_cont.hasClass("full_size")) {
            $pdf_view.addClass("full_size");
        } else {
            $pdf_view.removeClass("full_size");
        }

        var scaleX = _w / viewport.width;
        var scaleY = _h / viewport.height;
        t_scale = Math.min(scaleX, scaleY);

        viewport = page.getViewport({
            scale: t_scale
        });
        //console.log("Final Scale:", t_scale);
        //console.log("Resized viewport:", viewport.width, viewport.height);

        nw = viewport.width;
        nh = viewport.height;
        // 캔버스 크기 설정 (1920x1080)
        $canvas.width = nw;
        $canvas.height = nh;
        context.clearRect(0, 0, nw, nh);

        // 렌더링
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        return page.render(renderContext).promise;

    }).then(function () {
        // 렌더링 완료 후 이미지 데이터 캐시
        var imageData = context.getImageData(0, 0, $canvas.width, $canvas.height);
        _json.page_imgs[_num - 1] = imageData; // 페이지 번호는 1부터 시작하므로 인덱스는 num-1
        _layout.is_rendering = false;
    }).catch(function (error) {
        _layout.is_rendering = false;
    });
}

//pdf 페이지 렌더링
function renderPagePreload(_layout, _num, _cont, _pdfDoc, _w, _h, _json) {
    console.log("renderPagePreload", _num);
    if (_json.page_imgs[_num - 1]) {
        // 캐시된 이미지가 있으면 캐시된 이미지를 사용
        useCachedImage(_layout, _num, _cont, _json.page_imgs[_num - 1], _w, _h);
        return;
    }

    let nw = 0;
    let nh = 0;

    let $pdf_view = _cont.find('.pdf_view_temp');
    var $canvas = $pdf_view[0];
    var context = $canvas.getContext('2d', {
        willReadFrequently: true
    });

    // 캔버스 내용 지우기
    context.clearRect(0, 0, $canvas.width, $canvas.height);
    var t_scale = 0;
    var renderContext = null;

    _pdfDoc.getPage(_num).then(function (page) {
        let viewport = page.getViewport({
            scale: 1
        });
        //console.log("Original viewport:", viewport.width, viewport.height);
        if (_cont.hasClass("full_size")) {
            $pdf_view.addClass("full_size");
        } else {
            $pdf_view.removeClass("full_size");
        }

        var scaleX = _w / viewport.width;
        var scaleY = _h / viewport.height;
        t_scale = Math.min(scaleX, scaleY);

        viewport = page.getViewport({
            scale: t_scale
        });
        //console.log("Final Scale:", t_scale);
        //console.log("Resized viewport:", viewport.width, viewport.height);

        nw = viewport.width;
        nh = viewport.height;
        // 캔버스 크기 설정 (1920x1080)
        $canvas.width = nw;
        $canvas.height = nh;
        context.clearRect(0, 0, nw, nh);

        // 렌더링
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        return page.render(renderContext).promise;
    }).then(function () {
        // 렌더링 완료 후 이미지 데이터 캐시
        var imageData = context.getImageData(0, 0, $canvas.width, $canvas.height);
        _json.page_imgs[_num - 1] = imageData; // 페이지 번호는 1부터 시작하므로 인덱스는 _num-1
    }).catch(function (error) {
        console.error("renderPagePreload 에러:", error);
    });
}

function sePauseDrawInfo() {
    if (m_page_timer) {
        clearInterval(m_page_timer);
    }
    if (m_ptime_timer) {
        clearInterval(m_ptime_timer);
    }
    $("#" + m_str_show).html('');
}

function seResumeDrawInfo() {
    resetTimer();
    setPageDrawInfo();

    if (m_curr_caption_list.length > 0) {
        setTicker2();
    }
}

function setSpecialVoice(_num) {
    if (_num == "1") { // 집중근무 5분 전 + 티커
        setVoicePlay("commonfiles/special/voices/voice_01.mp3");
        setTicker3(0);
    } else if (_num == "2") { // 정시에 스케쥴을 스페셜로 바꾸기 위함
        //setVoicePlay("commonfiles/special/voices/voice_02.mp3");
        setTicker3(1);
    } else if (_num == "3") { // 현재 집중근무 음성 노출 + 티커
        //setVoicePlay("commonfiles/special/voices/voice_02.mp3");
        setTicker3(1);
    } else if (_num == "4") { // 집중근무 종료 + 티커
        //setVoicePlay("commonfiles/special/voices/voice_03.mp3");
        setTicker3(2);
    } else if (_num == "5") { // 30분 마다
        //setVoicePlay("commonfiles/special/voices/voice_02.mp3");
        setTicker3(1);
    }
}

function setSpecial(_num) {
    if (m_play_mode != "special") {
        return;
    }
    setCallWebToApp("SETLOG", "[SPECIAL] STEP " + _num);
    console.log(getLogTime(), ">>>>> Special Time >>>>> " + _num);
    if (_num == "1") { // 집중근무 5분 전 + 티커
        //setVoicePlay("commonfiles/special/voices/voice_01.mp3");
        //setTicker3(0);
    } else if (_num == "2") { // 정시에 스케쥴을 스페셜로 바꾸기 위함
        sePauseDrawInfo();
        if ($("#id_page_s_notice_list").css("display") == "none") {
            $('#id_page_s_notice_list').show();
            setSpecialPageDrawInfo();
        }
        setSpecial("3");
    } else if (_num == "3") { // 현재 집중근무 음성 노출 + 티커
        sePauseDrawInfo();
        if ($("#id_page_s_notice_list").css("display") == "none") {
            $('#id_page_s_notice_list').show();
            setSpecialPageDrawInfo();
        }
        //setVoicePlay("commonfiles/special/voices/voice_02.mp3");
        //setTicker3(1);
        setTicker3(-1);
    } else if (_num == "4") { // 집중근무 종료 + 티커
        if ($("#id_page_s_notice_list").css("display") == "none") {
            $('#id_page_s_notice_list').show();
            setSpecialPageDrawInfo();
        }
        //setVoicePlay("commonfiles/special/voices/voice_03.mp3");
        //setTicker3(2);
        setTimeout(setCloseSpecialPage, 30000);
    } else if (_num == "5") { // 30분 마다
        sePauseDrawInfo();
        if ($("#id_page_s_notice_list").css("display") == "none") {
            $('#id_page_s_notice_list').show();
            setSpecialPageDrawInfo();
        }
        setSpecial("3");
    }
}

function setCloseSpecialPage() {
    if (m_s_page_timer) {
        clearInterval(m_s_page_timer);
    }
    if (m_s_ptime_timer) {
        clearInterval(m_s_ptime_timer);
    }
    $('#id_page_s_notice_list').hide();
    seResumeDrawInfo();
}


function onClickDebugBtn(_obj) {
    let t_code = $(_obj).attr('code');
    setSpecial(t_code);
    setSpecialVoice(t_code);
}



function setVoicePlay(_voice) {
    if (m_play_mode != "special") {
        return;
    }
    setCallWebToApp("SETLOG", "[SPECIAL VOICE] " + _voice);
    console.log(getLogTime(), ">>>>> Special Voice >>>>> " + _voice);
    console.log(_voice);
    if (m_curr_playing) {
        m_curr_playing.pause(); // 이전 오디오 중지
        m_curr_playing.currentTime = 0; // Reset time
    }
    m_curr_playing = new Audio(_voice);
    setTimeout(function () {
        m_curr_playing.play();
    }, 150);
}
