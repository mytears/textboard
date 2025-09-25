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

function setInit() {
    $(".btn_download").on("touchstart mousedown", function(e) { e.preventDefault(); onClickDownloadBtn(); });
    $(".btn_convert").on("touchstart mousedown", function(e) { e.preventDefault(); onClickConvertBtn(this); });
    $(".btn_add").on("touchstart mousedown", function(e) { e.preventDefault(); onClickAddBtn(this); });
    $(".txt_string").on("focus", function(e) { e.preventDefault(); });
    $(".txt_string").on("input paste", function(e) {});

    $("#id_color_3").on("input", function(e) {
        e.preventDefault();
        $(".main_png_zone").css("background-color", $(this).val());
    });

    $("#id_color_4").on("input", function(e) {
        e.preventDefault();
        const selectedColor = $(this).val();
        $(".txt_string").focus();
        document.execCommand('foreColor', false, selectedColor);
    });

    $("#id_color_5").on("input", function(e) {
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
    // 1. 애니메이션을 확실히 멈춤
    $tickers.css('animation', 'none');

    const contentHtml = $(".txt_string").html();
    let t_html = "<div class='ticker__item'>" + contentHtml + "</div>";
    $tickers.html(t_html);

    tickerTimeout1 = setTimeout(function() {
        let itemWidth = $tickers.first().find('.ticker__item').first().width();
        let containerWidth = $tickers.first().parent().width();

        if (itemWidth === 0) return;

        if (itemWidth < containerWidth) {
            let repeatCount = Math.ceil(containerWidth / itemWidth) + 1;
            let finalHtml = "";
            for (let i = 0; i < repeatCount; i++) {
                finalHtml += t_html;
            }
            $tickers.html(finalHtml);
        }

        const PIXELS_PER_SECOND = 100;
        const finalTickerWidth = $(".ticker_1").width();
        const duration = finalTickerWidth / PIXELS_PER_SECOND;

        // 2. 브라우저가 'animation: none' 상태를 인지하도록 강제 (리플로우)
        void $tickers[0].offsetWidth;

        // 3. [핵심 수정] 계산된 duration을 포함하여 animation 단축 속성을 한 번에 설정
        // 형식: animation: [name] [duration] [timing-function] [iteration-count];
        $tickers.css('animation', `flow ${duration}s linear infinite`);

    }, 10);
}

function setLoadFont() {
    let _url = "data/font_list.json";
    $.ajax({
        url: _url,
        dataType: 'json',
        success: function(data) {
            m_font_list = data.fonts_list;
            setInitFont();
        },
        error: function(xhr, status, error) {
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
        text: "움직임을 캡처하는 중입니다.",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        target: ".main_cont",
        didOpen: () => {
            Swal.showLoading();
        }
    });

    gif = new GIF({
        workers: 2,
        quality: 10,
        width: $('.main_png_zone').width(),
        height: $('.main_png_zone').height(),
        workerScript: 'include/js/lib/gif.worker.js'
    });

    const $tickerContainer = $(".main_png_zone");
    const $tickers = $(".ticker");
    const animationDuration = parseFloat($tickers.first().css('animation-duration')) * 1000;
    const FPS = 3;
    const totalFrames = Math.round((animationDuration / 1000) * FPS);
    const frameInterval = 1000 / FPS;
    let currentFrame = 0;

    $tickers.css('animation', 'none');

    function captureFrame() {
        if (currentFrame >= (totalFrames/3)) {
            gif.render();
            return;
        }

        const progress = currentFrame / totalFrames;
        const oneCycleWidth = $(".ticker_1").width();
        const tx = -1 * oneCycleWidth * progress;
        
        $tickers.css('transform', `translateX(${tx}px)`);

        requestAnimationFrame(() => {
            html2canvas($tickerContainer[0], {
                backgroundColor: null,
                useCORS: true,
            }).then(function(canvas) {
                gif.addFrame(canvas, { delay: frameInterval, copy: true });
                framesAdded++;
                currentFrame++;

                Swal.update({
                    title: "GIF 생성 중",
                    text: `프레임 캡처: ${framesAdded} / ${totalFrames}`,
                    target: ".main_cont"
                });

                captureFrame();
            });
        });
    }

    gif.on('finished', function(blob) {
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

    gif.on('progress', function(p) {
        Swal.update({
            title: "GIF 인코딩 중",
            text: `인코딩 진행률: ${Math.round(p * 100)}%`,
            target: ".main_cont"
        });
    });

    captureFrame();
}

function onClickAddBtn(_obj) {
    $(".txt_string").focus();
    document.execCommand('insertHTML', false, $(_obj).text());
}