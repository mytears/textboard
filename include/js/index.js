let isRecording = false; // 녹화 중인지 확인
let framesAdded = 0;
let totalFrames = 60; // 녹화할 프레임 수
let gif = null;
let spans = [];
let m_font_animation = null;
let m_f_color_0 = ["#F7AC43", "#73D674", "#000000"];
let m_f_color_1 = ["#F7AC43", "#FFFFFF", "#000000"];
const strokeWidth = 7;
let m_mode = "1";
let m_f_txt = "테스트";
let m_font_list = [];
let m_curr_font = null;
let m_curr_font_num = 0;
let m_default_font_size = 0;
let splitter = new GraphemeSplitter();

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
        //        $(".txt_string").val("");
    });

    $(".txt_string").on("input paste", function (e) {
        //e.preventDefault();
        //setCheckTextLength(this, 10);
    });

    $("#id_color_0, #id_color_1, #id_color_3, #id_color_4").on("input", function (e) {
        e.preventDefault();
        onClickColorPicker(this);
    });

    $("#id_color_2, #id_color_5").on("input", function (e) {
        e.preventDefault();
        onClickStroke(this);
    });
    $(".main_txt").html(m_f_txt);

    //$(".main_png_txt_font").html($("#id_txt_string").html()); // + "<img src='images/heart_002.png'>");

    //let inputLength = [...$("#id_txt_string").val()].length;
    //console.log(inputLength);

    /*
    $(".main_txt").html($("#id_txt_string").val()); // + "<img src='images/heart_002.png'>");
    $(".main_txt_temp").html($(".main_txt").html());
    const $mainTxt = $(".main_txt");
    const text = $mainTxt.text();
    $mainTxt.empty(); // 기존 텍스트 제거
    $.each(text.split(""), function (index, char) {
        const $span = $("<span>").text(char).css({
            opacity: 1
        });
        $mainTxt.append($span);
        spans.push($span);
    });

    updateTextColorsCSS_0(m_f_color_0[0], m_f_color_0[1]);
    $(".main_txt span").each(function () {
        this.style.webkitTextStroke = `${strokeWidth}px ${m_f_color_0[2]}`;
    });
    */
    //updateTextColorsCSS_1(m_f_color_1[0], m_f_color_1[1]);
    $(".main_png_txt").each(function () {
        //this.style.webkitTextStroke = `${strokeWidth}px ${m_f_color_1[2]}`;
    });


    $(".main_png_txt_bg2").css("--stroke-color", convDarkenColor(m_f_color_1[0], 25)); // 더 진한 색으로 변경
    $(".main_png_txt_bg2").css("--shadow-color", convDarkenColor(m_f_color_1[0], 25)); // 더 진한 색으로 변경


    $("#id_color_0").val(m_f_color_0[0]);
    $("#id_color_1").val(m_f_color_0[1]);
    $("#id_color_2").val(m_f_color_0[2]);
    $("#id_color_3").val(m_f_color_1[0]);
    $("#id_color_4").val(m_f_color_1[1]);
    $("#id_color_5").val(m_f_color_1[2]);

    //    $(".txt_string").html(m_f_txt);
    $(".txt_string").val(m_f_txt);
    /*
    let range = document.createRange();
    let selection = window.getSelection();
    range.selectNodeContents($(".txt_string")[0]);
    range.collapse(false); // `false`로 설정하면 맨 끝으로 이동
    selection.removeAllRanges();
    selection.addRange(range);
    */
    m_default_font_size = parseFloat($(".main_png_txt").css("font-size"));

    setTicker();
    
    //$(".main_png_txt_font").html($(".txt_string").html()); // + "<img src='images/heart_002.png'>");

    /*

    const fontBase64 = `
        @font-face {
            font-family: 'CookieBlack';
            src: url('${cookieBlack}') format('woff');
        }`;

    const style = document.createElement("style");
    style.innerHTML = fontBase64;
    document.head.appendChild(style);
    $(".main_png_txt").css("font-family", "CookieBlack");
    */
    setLoadFont();
}

function setTicker() {
    $(".ticker_1").html("<div class='ticker__item'>" + getWrapEmojiWithTag($(".txt_string").val()) + "</div>");
//    $(".ticker_2").html("<div class='ticker__item'>" + getWrapEmojiWithTag($(".txt_string").val()) + "</div>");

    let t_html = "<div class='ticker__item'>" + getWrapEmojiWithTag($(".txt_string").val()) + "</div>";
    
    let $ticker = $(".ticker_1");
    
    
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

        // 3. setTimeout(0~10) 후 width 다시 측정 (진짜 반복된 전체 ticker 길이)
        setTimeout(function () {
            let tickerWidth = $ticker.width();
            console.log(tickerWidth+", "+containerWidth);
            // 속도/애니메이션 계산 (원하는대로)
            let t_speed = 4;

            // 예: 한 화면 통과에 t_speed초 기준
            let duration = (tickerWidth / containerWidth) * t_speed;
            console.log(duration);

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
        }, 1000);
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

function onClickStrokeReset() {
    //console.log($("#id_color_6").val());
    t_color = $("#id_color_6").val();
    $(".main_png_txt_bg2").css("--stroke-color", t_color);
    $(".main_png_txt_bg2").css("--shadow-color", t_color);
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

function onClickStroke(_obj) {
    let t_color = "#000000";
    if (m_mode == "0") {
        t_color = $("#id_color_2").val();
        $(".main_txt span").each(function () {
            this.style.webkitTextStroke = `${strokeWidth}px ${strokeColor}`;
        });
    } else {
        t_color = $("#id_color_5").val();
        /*
        $(".main_png_txt").each(function () {
            this.style.webkitTextStroke = `${strokeWidth}px ${t_color}`;
        });
        */
        $(".main_png_txt_bg2").css("--stroke-color", t_color);
        $(".main_png_txt_bg2").css("--shadow-color", t_color);
    }
}

function onClickColorPicker(_obj) {
    let t_color_0 = "";
    let t_color_1 = "";
    if (m_mode == "0") { //gif 모드
        t_color_0 = $("#id_color_0").val();
        t_color_1 = $("#id_color_1").val();
        updateTextColorsCSS_0(t_color_0, t_color_1);
    } else {
        t_color_0 = $("#id_color_3").val();
        t_color_1 = $("#id_color_4").val();
        updateTextColorsCSS_1(t_color_0, t_color_1);
        //$(".main_png_txt").css("color", t_color_0);
        //$(".main_png_txt").css("--stroke-color", convDarkenColor(t_color_0, 35)); // 더 진한 색으로 변경
    }
}

function updateTextColorsCSS_0(_color0, _color1) {
    let styleTag = $("#dynamicStyles");

    // 스타일 태그가 없으면 생성
    if (styleTag.length === 0) {
        $("head").append('<style id="dynamicStyles"></style>');
        styleTag = $("#dynamicStyles");
    }

    // 새로운 스타일을 설정
    styleTag.html(`
        .main_txt span:nth-child(odd) {
            color: ${_color0} !important;
        }
        .main_txt span:nth-child(even) {
            color: ${_color1} !important;
        }
    `);
}

function updateTextColorsCSS_1(_color0, _color1) {

    $(".main_png_txt_value").css({
        "background": "linear-gradient(0deg, " + _color1 + ", " + _color0 + ", " + _color0 + ")",
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent"
    });

    //$(".main_png_txt").css("color", t_color_0);
    $(".main_png_txt_bg2").css("--stroke-color", convDarkenColor(_color0, 20)); // 더 진한 색으로 변경
    $(".main_png_txt_bg2").css("--shadow-color", convDarkenColor(_color0, 20)); // 더 진한 색으로 변경

    /*
    $(".main_png_txt").css({
        "background": "linear-gradient(0deg, " + _color1 + ", " + _color0 + ")",
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent"
    });
    */
}

function onClickConvertBtn(_obj) {
    /*
    if (getAccurateLength($("#id_txt_string").val()) > 9) {
        Swal.fire({
            icon: 'error',
            title: '9글자까지만 입력가능합니다.',
            target: ".main_cont",
            position: "center",
            customClass: {
                popup: 'alert',
            },
        });
    }
    */
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

        $(".main_png_txt").css("width", "auto");
        $(".main_png_txt").css("height", "auto");
        //$(".main_png_txt_font").attr("title", $(".txt_string").val());
        //console.log($(".txt_string").html());
        $(".main_png_txt_font").html(getWrapEmojiWithTag($(".txt_string").val()));
        //$(".main_png_txt_font").html($(".txt_string").html()); // + "<img src='images/heart_002.png'>");
        adjustFontSize();
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
    adjustFontSize();
}

function setAddFont(_obj) {

    fetch(_obj.path)
        .then(response => response.json())
        .then(data => {
            const fontData = data.data; // Base64 WOFF 데이터

            // 폰트 이름 설정 (임의로 지정 가능)
            const fontName = _obj.name;

            // Base64 데이터를 Blob으로 변환
            //const fontBlob = new Blob([Uint8Array.from(atob(fontData.split(",")[1]), c => c.charCodeAt(0))], { type: "font/woff" });
            //const fontURL = URL.createObjectURL(fontBlob);

            // 스타일 태그 생성 및 @font-face 추가
            const style = document.createElement("style");
            style.innerHTML = `
                @font-face {
                    font-family: '${fontName}';
                    src: url('${fontData}') format('woff');
                }
            `;
            document.head.appendChild(style);
            //$(".main_txt").css("font-family", fontName);
            //$(".main_png_txt").css("font-family", fontName);
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

function saveTextAsImage() {

    /*
    $(".main_png_txt_temp").css("width", "auto");
    $(".main_png_txt_temp").css("height", "auto");
    let t_w = $(".main_png_txt_temp").width() * 1.5;
    let t_h = $(".main_png_txt_temp").outerHeight() * 1.2;
    $(".main_png_txt_temp").css({
        width: t_w + "px",
        height: t_h + "px"
    });
    */
    let t_name = convFilterText($(".txt_string").val());
    if (t_name == "") {
        t_name = "image";
    }
    //return;
    domtoimage.toBlob($(".main_png_txt_temp").get(0))
        .then(function (blob) {
            saveAs(blob, 'name_tag_' + t_name + '.png');

            //$(".main_png_txt_temp").css({ width: "auto", height: "auto" });
        });
    /*
    $(".main_png_txt").css("width", "auto");
    $(".main_png_txt").css("height", "auto");
    let t_w = $(".main_png_txt").width() * 1.1;
    let t_h = $(".main_png_txt").outerHeight() * 1.2;
    $(".main_png_txt").css({
        width: t_w + "px",
        height: t_h + "px"
    });
    domtoimage.toBlob($(".main_png_txt").get(0))
        .then(function (blob) {
            saveAs(blob, 'text_timage.png');

            $(".main_png_txt").css({ width: "auto", height: "auto" });
        });
        */
    /*
    let element = document.querySelector(".main_png_txt");
    domtoimage.toPng(element)
        .then(function (dataUrl) {
            let link = document.createElement("a");
            link.href = dataUrl;
            link.download = "text_image.png";
            link.click();
        })
        .catch(function (error) {
            console.error("이미지 저장 중 오류 발생:", error);
        });

    */

    /*
    let element = document.querySelector(".main_png_txt");

    html2canvas(element, {
        backgroundColor: null, // 투명 배경 유지
        useCORS: true // 외부 폰트 문제 해결
    }).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/png"); // PNG 데이터 URL 생성
        link.download = "text_image.png"; // 저장될 파일 이름
        link.click();
    });
    */
}


function saveTextAsImageOld2() {
    const textElement = $(".main_png_txt")[0];
    const text = textElement.innerText || textElement.textContent;
    const fontSize = parseInt(window.getComputedStyle(textElement).fontSize);
    const fontFamily = window.getComputedStyle(textElement).fontFamily;
    const gradientColor1 = $("#id_color_3").val();
    const gradientColor2 = $("#id_color_4").val();
    const strokeColor = $("#id_color_5").val();
    const strokeWidth = parseInt($("#stroke_width").val()) || 5;

    // 📌 Canvas 생성
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 📌 Canvas 크기 설정
    canvas.width = textElement.offsetWidth;
    canvas.height = textElement.offsetHeight;

    // 📌 배경 투명 설정
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 📌 폰트 설정
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 📌 그라데이션 설정
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, gradientColor1);
    gradient.addColorStop(1, gradientColor2);

    // 📌 테두리(stroke) 먼저 그리기
    //ctx.strokeStyle = strokeColor;
    //ctx.lineWidth = strokeWidth;
    //ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

    for (let i = 0; i < strokeWidth * 3; i++) {
        ctx.lineWidth = i;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    }

    // 📌 채우기(fill) 적용
    ctx.fillStyle = gradient;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // 📌 이미지 저장
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "text_image.png";
    link.click();
}


function saveTextAsImageOld() {
    const textElement = $(".main_png_txt")[0];
    const text = textElement.innerText || textElement.textContent;
    const textWidth = $(".main_png_txt").outerWidth();
    const textHeight = $(".main_png_txt").outerHeight();
    const fontSize = parseInt(window.getComputedStyle(textElement).fontSize);
    const fontFamily = window.getComputedStyle(textElement).fontFamily;
    const gradientColor1 = $("#id_color_3").val();
    const gradientColor2 = $("#id_color_4").val();
    const strokeColor = $("#id_color_5").val();
    const strokeWidth = 7;
    const filterStyle = window.getComputedStyle(textElement).filter;

    let shadowColor = "rgba(0,0,0,0)";
    let shadowX = 0;
    let shadowY = 0;
    let shadowBlur = 0;


    // drop-shadow 값을 올바르게 추출하는 정규식
    const dropShadowMatch = filterStyle.match(/drop-shadow\(\s*(rgba?\([^)]+\)|#[0-9a-fA-F]+)\s+(-?\d+px)\s+(-?\d+px)\s+(-?\d+px)?\s*\)/);
    //console.log(dropShadowMatch);
    if (dropShadowMatch) {
        shadowColor = dropShadowMatch[1]; // 색상 (rgba 또는 hex)
        shadowX = parseFloat(dropShadowMatch[2]) || 0; // x-offset
        shadowY = parseFloat(dropShadowMatch[3]) || 0; // y-offset
        shadowBlur = parseFloat(dropShadowMatch[4]) || 0; // blur 값

        //console.log({shadowColor,shadowX,shadowY,shadowBlur});

        // 이제 이 값을 사용하여 SVG의 <filter>를 생성
    }
    //console.log(fontFamily);
    // 📌 SVG 코드 생성
    //console.log(m_curr_font.name);
    //console.log(m_curr_font.path);

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${textWidth}" height="${textHeight}">
            <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${gradientColor1};" />
                    <stop offset="100%" style="stop-color:${gradientColor2};" />
                </linearGradient>
                <filter id="dropShadow">
                    <feOffset dx="${shadowX}" dy="${shadowY}" result="offsetBlur" />
                    <feGaussianBlur in="offsetBlur" stdDeviation="${shadowBlur}" result="blurred" />
                    <feFlood flood-color="${shadowColor}" result="shadowColor" />
                    <feComposite in2="blurred" in="shadowColor" operator="in" result="shadow" />
                    <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <style>
                @font-face {
                    font-family: '${m_curr_font.name}';
                    src: url('${m_curr_font.data}') format('woff');
                }
                text {
                    font-family: '${m_curr_font.name}', sans-serif;
                    filter: url(#dropShadow);
                }
            </style>
            <text x="50%" y="50%" font-size="${fontSize}px" 
                text-anchor="middle" dominant-baseline="middle"
                stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="url(#textGradient)">
                ${text}
            </text>
        </svg>`;
    //console.log(svg);
    // 📌 SVG를 데이터 URL로 변환
    const svgData = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    const img = new Image();
    img.src = svgData;
    $(".main_svg_zone").append(img);

    //const img = new Image();
    img.src = svgData;

    img.onload = function () {
        // 📌 Canvas 생성 및 SVG 렌더링
        const canvas = document.createElement("canvas");
        canvas.width = textWidth;
        canvas.height = textHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // 📌 이미지 저장
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "text_image.png";
        link.click();
    };
}

function saveGradientTextCanvas() {
    const text = $(".main_png_txt").text();
    const fontSize = parseInt(window.getComputedStyle($(".main_png_txt")[0]).fontSize);
    const fontFamily = window.getComputedStyle($(".main_png_txt")[0]).fontFamily;
    const textColor1 = $("#id_color_3").val();
    const textColor2 = $("#id_color_4").val();
    const strokeColor = $("#id_color_5").val();
    let width = $(".main_png_txt").outerWidth();
    let height = $(".main_png_txt").outerHeight();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // 그라데이션 설정
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, textColor1);
    gradient.addColorStop(1, textColor2);

    // 텍스트 스타일 설정
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    //ctx.lineWidth = strokeWidth;

    for (let i = 0; i < strokeWidth * 3; i++) {
        ctx.lineWidth = i;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    }

    ctx.fillStyle = gradient;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // 이미지 다운로드
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "text_image.png";
    link.click();
}



function setStartAnimation() {
    if (m_mode == "1") {
        //saveGradientTextCanvas();
        saveTextAsImage();
        return;
    }
    $(".txt_finish_title").html("");
    $(".txt_finish_desc").html("");
    /*
    const $mainTxt = $(".main_txt");
    const text = $mainTxt.text();
    $mainTxt.empty(); // 기존 텍스트 제거

    let spans = [];
    $.each(text.split(""), function (index, char) {
        const $span = $("<span>").text(char).css({
            opacity: 1
        });
        $mainTxt.append($span);
        spans.push($span);
    });
    
    */

    /*
    gsap.to(spans, {
        startAt: {
            scale: 2
        },
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.2, // 한 글자씩 순차적으로 등장
        ease: "elastic.out(1, 0.5)", // 부드럽게 튕기는 효과
        onComplete: function () {
            // 모든 글자가 나타난 후, 한 글자씩 개별적으로 커졌다 작아지는 애니메이션 실행
            spans.forEach((span, index) => {
                gsap.to(span, {
                    scale: 1.5,
                    duration: 0.3,
                    repeat: 1,
                    yoyo: true,
                    ease: "power1.inOut",
                    delay: index * 0.1 // 개별적으로 순차 실행
                });
            });
        }
    });
    */
    let startTime = performance.now();
    //console.log(startTime);

    if (m_font_animation) {
        m_font_animation.kill();
    }

    m_font_animation = gsap.to(spans, {
        startAt: {
            scale: 2
        },
        opacity: 1,
        scale: 1,
        duration: 1,
        stagger: 0.4, // 한 글자씩 순차적으로 등장
        ease: "elastic.out(1, 0.5)", // 부드럽게 튕기는 효과
        onComplete: function () {
            // 모든 글자가 나타난 후, 한 글자씩 개별적으로 커졌다 작아지는 애니메이션 실행
            spans.forEach((span, index) => {
                gsap.to(span, {
                    //                    scale: 1.5,
                    y: -70,
                    duration: 0.6,
                    repeat: 1,
                    yoyo: true,
                    ease: "power1.inOut",
                    delay: index * 0.2, // 개별적으로 순차 실행
                    onComplete: function () {
                        if (index === spans.length - 1) {
                            console.log("애니메이션 종료");
                            /*
                            gif.on('progress', function (p) {
                                console.log(`GIF 렌더링 진행률: ${(p * 100).toFixed(2)}%`);
                            });

                            gif.once('finished', function (blob) {
                                console.log("GIF 렌더링 완료! 파일 저장 시작...");
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "animation.gif";
                                a.click();
                            });
                            gif.render(); // 마지막 애니메이션이 끝나면 GIF 생성
                            */
                        }
                        //startTime = performance.now();
                        //console.log(startTime);
                    }
                });
            });
        }
    });

    startRecording();
}

function startRecording() {
    framesAdded = 0;
    gif = new GIF({
        workers: 4, // 워커 수 증가 (병렬 처리 속도 향상)
        quality: 1, // 퀄리티 최상 (0~30, 낮을수록 고품질)
        repeat: -1, // 무한 반복
        transparent: 0x00000000, // 배경 투명 유지
        workerScript: 'include/js/lib/gif.worker.js'
    });

    const firstAnimation = 1 + (spans.length - 1) * 0.4;
    const secondAnimation = (spans.length - 1) * 0.2 + 1.2;

    captureFrames3(firstAnimation + secondAnimation); // 프레임 캡처 시작
}

async function captureFrames() {
    for (let i = 0; i < totalFrames; i++) {
        await html2canvas(document.querySelector(".main_txt"), {
            willReadFrequently: true,
            scale: 1,
            backgroundColor: null // 배경 투명 설정
        }).then(canvas => {
            console.log(`캔버스 크기: ${canvas.width}x${canvas.height}`);
            gif.addFrame(canvas, {
                delay: 30
            });
            framesAdded++;
            console.log(`프레임 추가됨: ${framesAdded}/${totalFrames}`);
        });
    }

    console.log("프레임 추가 완료! GIF 렌더링 시작...");
    console.log(gif);

    gif.on('progress', function (p) {
        console.log(`GIF 렌더링 진행률: ${(p * 100).toFixed(2)}%`);
    });

    gif.on('finished', function (blob) {
        console.log("GIF 렌더링 완료!");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "animation.gif";
        a.click();
    });

    gif.render(); // GIF 렌더링 시작
}

async function captureFrames2() {
    totalFrames = 135;
    const frameDuration = 1000 / 30; // 30FPS -> 1프레임당 33.3ms (1000ms / 30)

    for (let i = 0; i < totalFrames; i++) {
        const startTime = performance.now(); // 현재 시간 기록
        //console.log(startTime);
        await html2canvas(document.querySelector(".main_txt"), {
            willReadFrequently: true,
            scale: 1,
            backgroundColor: null // 배경 투명 설정
        }).then(originalCanvas => {
            // 새로운 캔버스 생성
            let newCanvas = document.createElement("canvas");
            newCanvas.width = originalCanvas.width;
            newCanvas.height = originalCanvas.height;
            let ctx = newCanvas.getContext("2d");
            // 기존 캔버스를 새로운 캔버스로 복사
            ctx.drawImage(originalCanvas, 0, 0);
            //console.log(startTime);
            //console.log(`캔버스 크기: ${newCanvas.width}x${newCanvas.height}`);
            gif.addFrame(newCanvas, {
                delay: frameDuration
            });
            framesAdded++;
            //console.log(`프레임 추가됨: ${framesAdded}/${totalFrames}`);
        });

        // 다음 프레임까지 남은 시간만큼 대기
        const elapsedTime = performance.now() - startTime;
        //        const waitTime = Math.max(0, frameDuration - elapsedTime);
        const waitTime = Math.abs(frameDuration - elapsedTime);
        //console.log(frameDuration, elapsedTime, waitTime);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    console.log(frameDuration / 1000 * framesAdded);
    console.log("프레임 추가 완료! GIF 렌더링 시작...");
    console.log(gif);

    gif.on('progress', function (p) {
        console.log(`GIF 렌더링 진행률: ${(p * 100).toFixed(2)}%`);
    });

    gif.on('finished', function (blob) {
        console.log("GIF 렌더링 완료!");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "animation.gif";
        a.click();
    });
    gif.render();
}

async function captureFrames3(_sec) {

    console.log(_sec);
    console.log($(".main_txt").width(), $(".main_txt").height());

    $(".main_txt").css("width", "auto");
    let t_w = $(".main_txt").width() * 1.2;
    if (t_w > 1280) {
        t_w = 1280
    };
    $(".main_txt").css("width", t_w + "px");
    //    return;


    $(".txt_finish_title").html("녹화 시작");
    totalFrames = Math.ceil((_sec * 1000) / (1000 / 30)); // 4.5초 동안 30FPS 캡처
    const frameDuration = 1000 / 30; // 30FPS -> 1프레임당 33.3ms
    let framePromises = [];

    for (let i = 0; i < totalFrames; i++) {
        const startTime = performance.now();
        // html2canvas 캡처 작업을 비동기적으로 배열에 저장
        framePromises.push(
            html2canvas(document.querySelector(".main_txt"), {
                willReadFrequently: true,
                scale: 1,
                backgroundColor: null
            }).then(originalCanvas => {
                let newCanvas = document.createElement("canvas");
                newCanvas.width = originalCanvas.width;
                newCanvas.height = originalCanvas.height;
                let ctx = newCanvas.getContext("2d");
                ctx.drawImage(originalCanvas, 0, 0);
                $(".txt_finish_desc").html("(" + (i + 1) + "/" + totalFrames + ")장 저장중");
                gif.addFrame(newCanvas, {
                    delay: frameDuration
                });
            })
        );

        // 프레임 간격 조정
        const elapsedTime = performance.now() - startTime;
        const waitTime = Math.max(0, frameDuration - elapsedTime);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    await Promise.all(framePromises);
    console.log("프레임 추가 완료! GIF 렌더링 시작...");
    $(".txt_finish_title").html("녹화 완료 렌더링 시작");
    gif.on('progress', function (p) {
        $(".txt_finish_desc").html(Math.round(p * 100) + "% 완료");
        console.log(`GIF 렌더링 진행률: ${(p * 100).toFixed(2)}%`);
    });

    gif.once('finished', function (blob) {
        console.log("GIF 렌더링 완료! 파일 저장 시작...");
        $(".txt_finish_title").html("작업 완료 파일 저장 시작");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "animation.gif";
        a.click();
    });
    gif.render();
}

function adjustFontSize() {
    return;
    $(".main_png_txt").css("font-size", m_default_font_size + "px");
    let $parent = $(".main_png_txt").parent(); // 부모 요소
    let parentWidth = $parent.width(); // 부모 너비
    let textWidth = $(".main_png_txt").outerWidth(); // 현재 텍스트 너비
    let fontSize = m_default_font_size; // 초기 폰트 크기

    // 부모 너비를 초과하면 폰트 크기 줄이기
    //    console.log(textWidth); 
    //console.log(textWidth , parentWidth, fontSize);
    while (textWidth > parentWidth && fontSize > 10) {
        fontSize -= 2;
        $(".main_png_txt").css("font-size", fontSize + "px");
        textWidth = $(".main_png_txt").outerWidth();
    }
}

// 💾 GIF 다운로드 (버튼 클릭 시 실행)
function onClickDownloadBtn() {
    setStartAnimation();
}

function convDarkenColor(hex, percent) {
    // HEX → RGB 변환
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // 밝기 조절 (비율 적용)
    r = Math.max(0, r - (r * percent / 100));
    g = Math.max(0, g - (g * percent / 100));
    b = Math.max(0, b - (b * percent / 100));

    $("#id_color_6").val(`#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`);
    // RGB → HEX 변환
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function setCheckTextLength(_obj, _max) {
    let t_input = $(_obj);
    let t_val = t_input.val();
    let t_cursor_pos = t_input[0].selectionStart;

    // 입력 값을 grapheme으로 나누어 정확한 글자 수 계산
    let graphemes = splitter.splitGraphemes(t_val);

    if (graphemes.length > _max) {
        /*
        if (getAccurateLength(t_val) > 9) {
            Swal.fire({
                icon: 'error',
                title: '10글자까지만 입력가능합니다.',
                target: ".main_cont",
                position: "center",
                customClass: {
                    popup: 'alert',
                },
            });
        }
        */
        // 현재 커서 위치 바로 앞의 글자 삭제
        let new_val = [...graphemes];
        new_val.splice(t_cursor_pos - 1, 1); // 커서 앞 문자 제거

        t_input.val(new_val.join(""));

        // 커서 위치 유지 (삭제된 문자만큼 왼쪽으로 이동)
        let new_cursor_pos = t_cursor_pos - 1;
        t_input[0].setSelectionRange(new_cursor_pos, new_cursor_pos);
        t_input.focus();
    }
}

function onClickAddBtn(_obj) {
    let t_cursorPos = $("#id_input")[0].selectionStart;
    let t_input = $("#id_input");
    let t_val = t_input.val();
    /*
    if (getAccurateLength(t_val) > 9) {
        Swal.fire({
            icon: 'error',
            title: '10글자까지만 입력가능합니다.',
            target: ".main_cont",
            position: "center",
            customClass: {
                popup: 'alert',
            },
        });
        return;
    }
    */
    let t_str = t_val.substr(0, t_cursorPos) + $(_obj).text() + t_val.substr(t_cursorPos, t_val.length - t_cursorPos);
    t_input.val(t_str);
    let t_newCursorPos = t_cursorPos + $(_obj).text().length;
    t_input[0].selectionStart = t_newCursorPos;
    t_input[0].selectionEnd = t_newCursorPos;
    t_input.focus();

    //console.log(t_str);
    return;
    /*
    let input = $("#id_txt_string")[0]; // JavaScript의 input 요소 가져오기
    let cursorPos = input.selectionStart; // 현재 커서 위치
    let text = input.value; // 현재 입력된 값
    let newText = text.slice(0, cursorPos) + $(_obj).text() + text.slice(cursorPos); // 문자열 삽입
    console.log(cursorPos);
    console.log($(_obj).text());
    console.log(text);
    console.log(newText);
    */
    let selection = window.getSelection();
    let input = $("#id_txt_string")[0]; // input 요소 가져오기
    let text = input.innerHTML; // 현재 입력된 값
    //console.log(text);
    let caretPos = getCaretPosition($("#id_txt_string"));
    //console.log(caretPos);
    let range = selection.getRangeAt(0);
    let insertText = $(_obj).html();

    let fragment;

    // insertText가 HTML 태그를 포함하면 그대로 사용, 그렇지 않으면 텍스트 노드로 변환
    if (/<[^>]+>/g.test(insertText)) { // HTML 태그가 포함된 경우
        let tempElement = document.createElement("div");
        tempElement.innerHTML = insertText;
        fragment = document.createDocumentFragment();
        while (tempElement.firstChild) {
            //            console.log(tempElement.firstChild);
            fragment.appendChild(tempElement.firstChild);
        }
        //console.log(fragment.firstChild);
    } else { // 일반 텍스트만 포함된 경우
        fragment = document.createTextNode(insertText);
    }

    // 현재 위치에 삽입
    let lastNode = fragment.lastChild;
    range.insertNode(fragment); // 현재 커서 위치에 삽입
    //console.log(fragment_temp);

    // 커서를 삽입된 요소 뒤로 이동
    //console.log(fragment.nodeType);
    if (fragment.nodeType === 3) {
        //console.log(fragment);
        range.setStartAfter(fragment);
        range.setEndAfter(fragment);
    } else {
        range.setStartAfter(lastNode);
        range.setEndAfter(lastNode);
    }

    selection.removeAllRanges();
    selection.addRange(range);

    $("#id_txt_string").focus();

    return;

    let utf16CursorPos = input.selectionStart;
    //let cursorPos = [...text.substring(0, utf16CursorPos)].length; // 코드포인트 기준으로 변환
    //let cursorPos = Array.from(text.substring(0, utf16CursorPos)).length; // 정확한 문자 단위 변환
    let cursorPos = caretPos;

    // 새로운 문자열 생성 (이모지를 포함한 문자열 처리)
    //console.log(insertText);
    //let newText = [...text].slice(0, cursorPos).join("") + insertText + [...text].slice(cursorPos).join("");
    //let newText = Array.from(text).slice(0, cursorPos).join("") + insertText + Array.from(text).slice(cursorPos).join("");

    let newText = text + insertText;
    // 값 적용 후 커서 위치 업데이트
    $("#id_txt_string").html(newText);
    //console.log(newText);
    //console.log(getAccurateLength($("#id_txt_string").text()));
    // 새로운 커서 위치를 올바르게 계산
    let newCursorPos = cursorPos + [...insertText].length;
    let newUtf16CursorPos = [...newText].slice(0, newCursorPos).join("").length;

    // 커서 위치 업데이트 (입력된 문자열의 길이를 반영하여 이동)
    //let newCursorPos = cursorPos + Array.from(insertText).length;
    //let newUtf16CursorPos = newText.substring(0, newCursorPos).length;

    // 커서 위치 유지
    //input.setSelectionRange(newUtf16CursorPos, newUtf16CursorPos);
    input.focus(); // 다시 포커스 주기
    //console.log(getAccurateLength($("#id_txt_string").val()));

    /*
    input.value = newText; // 새로운 값 적용
    input.setSelectionRange(cursorPos + 1, cursorPos + 1); // 커서 위치 조정
    input.focus(); // 다시 포커스 주기    
    */
}

function getCaretPosition($editableDiv) {
    let selection = window.getSelection();
    if (!selection.rangeCount) return 0; // 선택된 범위가 없으면 0 반환

    let range = selection.getRangeAt(0);
    let preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents($editableDiv[0]);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
}

function getAccurateLength(text) {
    let segmenter = new Intl.Segmenter("ko", {
        granularity: "grapheme"
    });
    return [...segmenter.segment(text)].length;
}

function trimTo9Characters($element) {
    let maxLength = 9;
    let textLength = 0;
    let newHtml = "";

    function traverseNodes(node) {
        if (textLength >= maxLength) return; // 9글자 넘으면 중단

        if (node.nodeType === 3) { // 텍스트 노드인 경우
            let remaining = maxLength - textLength;
            if (node.nodeValue.length > remaining) {
                newHtml += node.nodeValue.substring(0, remaining);
                textLength = maxLength;
            } else {
                newHtml += node.nodeValue;
                textLength += node.nodeValue.length;
            }
        } else if (node.nodeType === 1) { // 요소 노드 (태그)인 경우
            let clonedNode = node.cloneNode(false); // 빈 태그 복사
            newHtml += clonedNode.outerHTML.replace("</" + clonedNode.tagName.toLowerCase() + ">", ""); // 여는 태그 추가
            for (let i = 0; i < node.childNodes.length; i++) {
                traverseNodes(node.childNodes[i]); // 자식 노드 재귀 탐색
                if (textLength >= maxLength) break;
            }
            newHtml += `</${clonedNode.tagName.toLowerCase()}>`; // 닫는 태그 추가
        }
    }

    // 현재 HTML을 DOM으로 변환하여 탐색
    let tempDiv = $("<div>").html($element.html())[0];
    for (let i = 0; i < tempDiv.childNodes.length; i++) {
        traverseNodes(tempDiv.childNodes[i]);
        if (textLength >= maxLength) break;
    }

    $element.html(newHtml); // 9글자까지만 남긴 HTML 적용
}
