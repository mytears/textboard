// [변경] 스크롤 속도를 전역 상수로 정의하여 공유
const PIXELS_PER_SECOND = 30; // 1초에 100픽셀 이동하는 속도

// 전역 변수들 (기존과 동일)
let isRecording = false;
let framesAdded = 0;
let gif = null;
let spans = [];
let m_font_animation = null;
let m_f_color_0 = ["#F7AC43", "#73D674", "#000000"];
let m_f_color_1 = ["#000000", "#FFFFFF", "#FFFFFF"];
const strokeWidth = 7;
let m_mode = "1";
let m_f_txt = "전광판 테스트용 문자열입니다.";
let m_font_list = [];
let m_curr_font = null;
let m_curr_font_num = 0;
let m_default_font_size = 0;
let splitter = new GraphemeSplitter();
let tickerTimeout1 = null;
let tickerTimeout2 = null;
let m_item_w = 640;

function setInit() {
    $(".btn_download").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickDownloadBtn();
    });
    $(".btn_convert").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickConvertBtn(this);
    });
    $(".btn_add").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickAddBtn(this);
    });
    $(".btn_submit").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickSubmitBtn(this);
    });
    $(".btn_back").on("touchstart mousedown", function (e) {
        e.preventDefault();
        onClickBackBtn(this);
    });
    $(".txt_string").on("focus", function (e) {
        e.preventDefault();
    });
    $(".txt_string").on("input", function (e) {});
    // [핵심 추가] paste 이벤트를 가로채서 순수 텍스트만 붙여넣도록 처리합니다.
    $(".txt_string").on("paste", function (e) {
        // 1. 기본 붙여넣기 동작(HTML 서식 포함)을 막습니다.
        e.preventDefault();

        // 2. 클립보드 데이터에서 순수 텍스트(text/plain) 정보만 추출합니다.
        let text = (e.originalEvent || e).clipboardData.getData('text/plain');

        // 3. 추출한 순수 텍스트를 현재 커서 위치에 삽입합니다.
        document.execCommand('insertText', false, text);
    });
    $("#id_color_3").on("input", function (e) {
        e.preventDefault();
        $(".main_png_txt").css("background-color", $(this).val());
    });

    $("#id_color_4").on("input", function (e) {
        e.preventDefault();
        const selectedColor = $(this).val();
        $(".txt_string").focus();
        document.execCommand('foreColor', false, selectedColor);
    });

    $("#id_color_5").on("input", function (e) {
        e.preventDefault();
        const newColor = $(this).val();
        $(".ticker__item").css("color", newColor);
        $(".ticker__item").find("font").css("color", newColor);
        $(".txt_string").css("color", newColor);
        $(".txt_string").find("font").css("color", newColor);
    });

    $(".main_png_zone").css("background-color", $("#id_color_3").val());
    $(".txt_string").html(m_f_txt);
    m_default_font_size = parseFloat($(".main_png_txt").css("font-size"));

    setTicker();
    setLoadFont();
}

function setTicker() {
    if (tickerTimeout1) clearTimeout(tickerTimeout1);
    if (tickerTimeout2) clearTimeout(tickerTimeout2);

    const $tickers = $(".ticker");
    $tickers.css('animation', 'none');

    const contentHtml = $(".txt_string").html();
    let t_html = "<div class='ticker__item'>" + contentHtml + "</div>";
    $tickers.html(t_html);

    tickerTimeout1 = setTimeout(function () {
        let itemWidth = $tickers.first().find('.ticker__item').first().width();
        m_item_w = itemWidth;
        let containerWidth = $tickers.first().parent().width();

        if (itemWidth === 0) return;

        if (itemWidth < containerWidth) {
            let repeatCount = (Math.ceil(containerWidth / itemWidth) + 1)/2;
            let finalHtml = "";
            for (let i = 0; i < repeatCount; i++) {
                finalHtml += t_html;
            }
            $tickers.html(finalHtml);
        }
        // [변경] 전역 상수로 정의된 속도 사용
        const finalTickerWidth = $(".ticker_1").width();
        const duration = finalTickerWidth / PIXELS_PER_SECOND;
        void $tickers[0].offsetWidth;
        $tickers.css('animation', `flow ${duration}s linear infinite`);

    }, 10);
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
    for (let i = 0; i < m_font_list.length; i += 1) {
        t_html += "<div class='font_btn' code='" + i + "' onClick='javascript:onClickBtnFont(" + i + ");' style='font-family:" + m_font_list[i].name + "' >" + m_font_list[i].title + "</div>";
    }
    $(".btns_zone").append(t_html);
    onClickBtnFont(1);
}

function onClickConvertBtn(_obj) {
    setTicker();
}

function onClickBtnFont(_num) {
    $(".font_btn").removeClass("active");
    $(".font_btn[code='" + _num + "']").addClass("active");
    m_curr_font = m_font_list[_num];
    m_curr_font_num = _num;
    $(".txt_string").css("font-family", m_curr_font.name);
    $(".ticker__item").css("font-family", m_curr_font.name);
}

function setAddFont(_obj) {
    fetch(_obj.path)
        .then(response => response.json())
        .then(data => {
            const fontData = data.data;
            const fontName = _obj.name;
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

function onClickDownloadBtn() {
    if (isRecording) {
        Swal.fire({
            title: "GIF 생성 중",
            text: "잠시만 기다려 주세요...",
            icon: "info",
            showConfirmButton: false,
            target: ".main_cont"
        });
        return;
    }

    isRecording = true;
    framesAdded = 0;

    Swal.fire({
        title: "GIF 생성 시작",
        text: "움직임을 캡처하는 중입니다. 잠시 기다려 주세요.",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        target: ".main_cont"
    });

    const $tickerContainer = $(".main_png_txt");
    const $tickers = $(".ticker");

    // [핵심 수정 1] 화면의 해상도 비율(DPI)을 가져옵니다.
    //const scale = window.devicePixelRatio || 1;
    const scale = 1;
    const FPS = 30;

    // [핵심 수정 2] 해상도 비율을 반영하여 GIF와 캔버스의 최종 크기를 계산합니다.
    const captureWidth = $tickerContainer.width() * scale;
    const captureHeight = $tickerContainer.height() * scale;

    gif = new GIF({
        workers: 2,
        quality: 24,
        width: captureWidth, // 계산된 너비 적용
        height: captureHeight, // 계산된 높이 적용
        workerScript: 'include/js/lib/gif.worker.js'
    });

    // [핵심 수정] 캡처할 길이를 'ticker__item' 하나 만큼으로 한정
    const captureDistance = $tickers.first().find('.ticker__item').first().width() + parseInt($tickers.first().find('.ticker__item').first().css('padding-left'))*2;
    
    // [핵심 수정] 그 길이에 맞는 시간과 프레임 수를 다시 계산
    const captureDuration = (captureDistance / PIXELS_PER_SECOND) * 1000; // ms 단위
    const totalFrames = Math.round((captureDuration / 1000) * FPS);
    const frameInterval = 1000 / FPS;
    let currentFrame = 0;

    $tickers.css('animation', 'none');
    const captureBgColor = $("#id_color_3").val();

    function captureFrame() {
        if (currentFrame >= totalFrames) {
            gif.render();
            return;
        }

        const progress = currentFrame / totalFrames;
        // [핵심 수정] 이동 거리의 기준을 전체 너비가 아닌 captureDistance로 변경
        const tx = -1 * captureDistance * progress;

        $tickers.css('transform', `translateX(${tx}px)`);

        requestAnimationFrame(() => {
            html2canvas($tickerContainer[0], {
                backgroundColor: captureBgColor,
                useCORS: true,
                scale: scale // [핵심 수정 3] html2canvas에 해상도 비율(scale) 옵션을 전달합니다.
            }).then(function (canvas) {
                gif.addFrame(canvas, {
                    delay: frameInterval,
                    copy: true
                });
                framesAdded++;
                currentFrame++;

                Swal.update({
                    title: "GIF 생성 중",
                    text: `프레임 캡처: ${framesAdded} / ${totalFrames}`
                });

                captureFrame();
            });
        });
    }

    gif.on('finished', function (blob) {
        saveAs(blob, 'ticker_animation.gif');
        Swal.fire({
            title: "GIF 생성 완료!",
            text: "다운로드가 시작됩니다.",
            icon: "success",
            target: ".main_cont"
        });
        isRecording = false;

        $tickers.css('transform', '');
        $tickers.css('animation', '');
    });

    gif.on('progress', function (p) {
        // [변경] '인코딩 중' 상태를 text로 업데이트
        Swal.update({
            title: 'GIF 인코딩 중', // 인코딩 시에는 제목 변경
            text: `진행률: ${Math.round(p * 100)}%`
        });
    });

    captureFrame();
}

function onClickAddBtn(_obj) {
    $(".txt_string").focus();
    document.execCommand('insertHTML', false, $(_obj).text());
}

function onClickSubmitBtn(_obj) {
    $(".start_zone").hide();
    $(".final_zone").show();
}

function onClickBackBtn(_obj) {
    $(".start_zone").show();
    $(".final_zone").hide();
}
