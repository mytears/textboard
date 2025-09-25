let isRecording = false; // 녹화 중인지 확인
let framesAdded = 0;
let totalFrames = 60; // 녹화할 프레임 수
let gif = null;
let spans = [];
let m_font_animation = null;
let m_f_color_0 = ["#F7AC43", "#73D674", "#000000"];
let m_f_color_1 = ["#000000", "#FFFFFF", "#FFFFFF"];
const strokeWidth = 7;
let m_mode = "1";
let m_f_txt = "테스트";
let m_font_list = [];
let m_curr_font = null;
let m_curr_font_num = 0;
let m_default_font_size = 0;
let splitter = new GraphemeSplitter();
// Timeout ID를 저장할 변수를 함수 외부에 선언
let tickerTimeout1 = null;
let tickerTimeout2 = null;

function setInit() {

    $(".font_btn").on("touchstart mousedown", function (e) {
        e.preventDefault();
        //onClickFontBtn(this);
    });
    
    $(".btn_download").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickDownloadBtn(this);
    });

    $(".btn_convert").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickConvertBtn(this);
    });

    $(".btn_add").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickAddBtn(this);
    });

    $(".txt_string").on("focus", function (e) {
        e.preventDefault();
    });

    $(".txt_string").on("input paste", function (e) {
    });

    $("#id_color_0, #id_color_1, #id_color_3, #id_color_4").on("input", function (e) {
        e.preventDefault();
        onClickColorPicker(this);
    });

    $("#id_color_2, #id_color_5").on("input", function (e) {
        e.preventDefault();
        onClickColorPickerReset(this);
    });
    $(".main_txt").html(m_f_txt);

    $("#id_color_0").val(m_f_color_0[0]);
    $("#id_color_1").val(m_f_color_0[1]);
    $("#id_color_2").val(m_f_color_0[2]);
    $("#id_color_3").val(m_f_color_1[0]);
    $("#id_color_4").val(m_f_color_1[1]);
    $("#id_color_5").val(m_f_color_1[2]);

    $(".txt_string").val(m_f_txt);
    m_default_font_size = parseFloat($(".main_png_txt").css("font-size"));

    setTicker();
    
    setLoadFont();
}

function setTicker() {
    // 1. 기존에 예약된 setTimeout들을 모두 취소
    if (tickerTimeout1) clearTimeout(tickerTimeout1);
    if (tickerTimeout2) clearTimeout(tickerTimeout2);

    let $ticker_1 = $(".ticker_1");
    let $ticker_2 = $(".ticker_2");

    // 2. 현재 진행 중인 애니메이션을 즉시 중지하고 큐를 비움
    $ticker_1.stop(true);
    $ticker_2.stop(true);

    // 3. CSS 위치를 초기 상태로 리셋
    $ticker_1.css("transform", "translateX(0)");
    $ticker_2.css("transform", "translateX(0)");

    // 초기 HTML 설정
    let t_html = "<div class='ticker__item'>" + getWrapEmojiWithTag($(".txt_string").val()) + "</div>";
    $ticker_1.html(t_html);
    $ticker_2.html(t_html);

    // 너비 계산 및 애니메이션 설정 (setTimeout 사용)
    tickerTimeout1 = setTimeout(function () {
        let oneCycleWidth = $ticker_1.find('.ticker__item').first().width();
        let containerWidth = $ticker_1.parent().width();
        // 너비가 0이면 중단 (예외 처리)
        if (oneCycleWidth === 0) return;

        let repeatCount = Math.ceil(containerWidth / oneCycleWidth) + 1;

        let finalHtml = "";
        for (let i = 0; i < repeatCount; i++) {
            finalHtml += t_html;
        }
        $ticker_1.html(finalHtml);
        $ticker_2.html(finalHtml);
        
    }, 10);
}


function isEmoji(character) {
    const exclude_symbols = ["™", "©", "®", "ℹ", "♻", "☎", "☣", "☢", "☠"];
    return character.match(/\p{Extended_Pictographic}/u) && !exclude_symbols.includes(character);
}

function getWrapEmojiWithTag(text) {
    return text.replace(/([\p{Extended_Pictographic}]\uFE0F?)/gu, match =>
        isEmoji(match) ? `<span>${match}</span>` : match
    );
}

function setLoadFont() {
    let _url = "data/font_list.json";
    $.ajax({
        url: _url,
        dataType: 'json',
        success: function (data) {
            m_font_list = data.fonts_list;
            setInitFont();
        },
        error: function (xhr, status, error) {
            console.error('컨텐츠 에러 발생:', status, error);
        },
    });
}

function setInitFont() {

    for (let i = 0; i < m_font_list.length; i += 1) {
        setAddFont(m_font_list[i]);
    }

    let t_html = "";
    $(".btns_zone").html("");
    for (i = 0; i < m_font_list.length; i += 1) {
        t_html += "<div class='font_btn' code='" + i + "' onClick='javascript:onClickBtnFont(" + i + ");' style='font-family:" + m_font_list[i].name + "' >" + m_font_list[i].title + "</div>";
    }
    $(".btns_zone").append(t_html);
    onClickBtnFont(1);
}


function onClickColorPicker(_obj) {
    let t_color_0 = "";
    let t_color_1 = "";
    
    t_color_0 = $("#id_color_3").val();
    t_color_1 = $("#id_color_4").val();
    updateTextColorsCSS_1(t_color_0, t_color_1);
    
}


function onClickColorPickerReset(_obj) {
    let t_color_0 = "";    
    t_color_0 = $("#id_color_5").val();    
}

function updateTextColorsCSS_1(_color0, _color1) {
    
}

function onClickConvertBtn(_obj) {    
    if (m_mode == "0") {
        $(".main_txt_temp").html($(".txt_string").val());
        $(".main_txt").html($(".main_txt_temp").html());
        const $mainTxt = $(".main_txt");
        const text = $mainTxt.text();
        $mainTxt.empty(); // 기존 텍스트 제거
        spans = [];
        $.each(text.split(""), function (index, char) {
            const $span = $("<span>").text(char).css({
                opacity: 1
            });
            $mainTxt.append($span);
            spans.push($span);
        });
    } else {
        setTicker();
    }
}

function onClickBtnFont(_num) {
    $(".font_btn").removeClass("active");
    $(".font_btn[code='" + _num + "']").addClass("active");
    m_curr_font = m_font_list[_num];
    m_curr_font_num = _num;
    $(".input_zone input").css("font-family", m_curr_font.name);
    $(".main_txt").css("font-family", m_curr_font.name);
    $(".main_png_txt_font").css("font-family", m_curr_font.name);
    $(".ticker__item").css("font-family", m_curr_font.name);
}

function setAddFont(_obj) {

    fetch(_obj.path)
        .then(response => response.json())
        .then(data => {
            const fontData = data.data; // Base64 WOFF 데이터

            // 폰트 이름 설정 (임의로 지정 가능)
            const fontName = _obj.name;

            // 스타일 태그 생성 및 @font-face 추가
            const style = document.createElement("style");
            style.innerHTML = `
                @font-face {
                    font-family: '${fontName}';
                    src: url('${fontData}') format('woff');
                }
            `;
            document.head.appendChild(style);
        
            _obj.data = fontData;
            _obj.loaded = true;
        })
        .catch(error => console.error("폰트 로드 실패:", error));
}

function onClickFontBtn(obj) {
    $(".main_txt").css("font-family", $(obj).html());
    $(".main_txt").css("font-weight", "900");
    $(".txt_finish_title").html("");
    $(".txt_finish_desc").html("");
    $(".main_png_txt").css("font-family", $(obj).html());
    $(".main_png_txt").css("font-weight", "900");
}

function convFilterText(text) {
    return text.replace(/[^가-힣a-zA-Z0-9]/g, '');
}

function onClickDownloadBtn() {    
    //setStartAnimation();
}

function onClickAddBtn(_obj) {
    let t_cursorPos = $("#id_input")[0].selectionStart;
    let t_input = $("#id_input");
    let t_val = t_input.val();
    
    let t_str = t_val.substr(0, t_cursorPos) + $(_obj).text() + t_val.substr(t_cursorPos, t_val.length - t_cursorPos);
    t_input.val(t_str);
    let t_newCursorPos = t_cursorPos + $(_obj).text().length;
    t_input[0].selectionStart = t_newCursorPos;
    t_input[0].selectionEnd = t_newCursorPos;
    t_input.focus();
}
