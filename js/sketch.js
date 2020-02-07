// Main script to construct the noise field
let img;
let fitToScreen = true;
let lineLengthSlider, xSpacingSlider, ySpacingSlider, strokeWeightSlider, lineDirectionSelect, modeSelect, colorSelect, windowWidth, windowHeight;
const namespace = 'http://www.w3.org/2000/svg';
let svg;
// Load obama on start
function preload() {
    // preload() runs once
    img = loadImage('imgs/obama.jpg');
    svg = document.querySelector("#svg-clone")
    svg.style.position = "absolute";
    svg.style.left = "300px";
}

function imageUpload(file) {
    img = loadImage(file.data, function () {
        drawOnce();
    });
}

// Compute dimensions to maximize image size to fit screen
function getDimensions(img, maxWidth, maxHeight) {
    let imgWidth = null,
        imgHeight = null;
    if (img === undefined) return { width: 0, height: 0 }
    if (fitToScreen === true) {
        // Maximize area of photo
        let imageRatio = img.width / img.height;
        let screenRatio = maxWidth / maxHeight;
        let scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        if (imageRatio > screenRatio) {
            imgWidth = Math.floor(maxWidth);
            imgHeight = Math.floor(img.height * scale);
        } else {
            imgHeight = Math.floor(maxHeight);
            imgWidth = Math.floor(img.width * scale);
        }
    } else {
        imgHeight = img.height;
        imgWidth = img.width;
    }
    return {
        width: imgWidth,
        height: imgHeight
    }
}

function makeControls() {
    // Controls 
    let controlWrapper = createDiv().id("control-wrapper");
    let controlHeader = createDiv("<h2>Controls</h2>");
    controlHeader.parent(controlWrapper);

    // File input
    let fileInputWrapper = createDiv("<label id='file_label' for='file'>Upload File</label");
    let fileInput = createFileInput(imageUpload);
    fileInput.id("file");
    fileInput.parent(fileInputWrapper);
    fileInputWrapper.parent(controlWrapper);
    imgPreview = createDiv().id("img_preview");
    imgPreview.parent(controlWrapper);

    // Mode (line, circles, rectangles)
    modeSelect = makeSelect("Drawing Mode", options = ["Lines", "Circles", "Rectangles"], value = "Lines", parent = controlWrapper, drawOnce)
    // Spacing
    let spacingHeader = createDiv("<h3>Spacing</h3>");
    spacingHeader.parent(controlWrapper);
    xSpacingSlider = makeSlider("Vertical Spacing", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)
    ySpacingSlider = makeSlider("Horizontal Spacing", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)

    // Line features
    let lineHeader = createDiv("<h3>Line Attributes</h3>");
    lineHeader.parent(controlWrapper);
    lineDirectionSelect = makeSelect("Line Direction", options = ["Horizontal", "Vertical", "Diagonal"], value = "Vertical", parent = controlWrapper, drawOnce)
    lineLengthSlider = makeSlider("Line Length", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)
    lineLengthSelect = makeSelect("Line Length", options = ["Constant", "GrayScale"], value = "Constant", parent = controlWrapper, drawOnce)
    strokeWeightSlider = makeSlider("Stroke Width", minVal = .5, maxVal = 10, value = 1, step = .5, parent = controlWrapper, drawOnce);

    // Color
    let colorHeader = createDiv("<h3>Color</h3>");
    colorHeader.parent(controlWrapper);
    colorSelect = makeSelect("Color Setting", options = ["Black and White", "Original"], value = "Black and White", parent = controlWrapper, drawOnce)

    // Buttons  
    makeButton("Download", controlWrapper, () => download());
    makeButton("About", controlWrapper, () => { }, "modal");
    makeButton("GitHub", controlWrapper, () => {
        window.open("https://github.com/mkfreemaan/imageFields", "_blank");
    });
    return controlWrapper;
}

// Download canvas
function download() {
    noLoop(); // pause
    let link = document.createElement('a');
    link.download = 'textDraw.png';
    link.href = document.querySelector('.p5_canvas').toDataURL()
    link.click();
}

// Set up (elements only drawn once)
function setup() {
    // Get window size 
    // windowWidth = window.innerWidth - 270;
    // windowHeight = window.innerHeight - 180;
    windowWidth =  96 * 8;
    windowHeight = 96 * 6;

    // Container for everything
    let container = createDiv().class("container");

    // Create controls and canvas
    let controls = makeControls();
    controls.parent(container);
    let canvasContainer = createDiv();
    canvas = createCanvas(windowWidth, windowHeight).class("p5_canvas");
    canvasContainer.parent(container);
    canvas.parent(canvasContainer);
    canvas.style("display", "none")
    // Set color mode to RGB percentages  
    colorMode(RGB, 100);
    drawOnce();
}

function getGrayscaleValue(img, x, y) {
    let c = color(img.get(x, y));
    return {
        original: c,
        value: round(
            red(c) * .222 +
            green(c) * .707 +
            blue(c) * .071
        )
    };
}
function addSvgLine(x1, y1, x2, y2) {        
    svg.setAttribute("width", windowWidth);
    svg.setAttribute("height", windowHeight);
    let line = document.createElementNS(namespace, 'line');
    line.style.stroke = "rgb(0,0,0)";
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    svg.appendChild(line);
}
function drawOnce() {
    background("white");
    svg.innerHTML = '' // clear svg;
    // Resize based on image width
    let dims = getDimensions(img, windowWidth, windowHeight);
    resizeCanvas(dims.width, dims.height)
    let imgRatio = (dims.width / img.width);
    loadPixels() // don't actually *show* the image but use its pixels!

    // Get drawing mode
    let mode = modeSelect.value();
    for (let x = 0; x < dims.width; x += xSpacingSlider.value()) {
        for (let y = 0; y < dims.height; y += ySpacingSlider.value()) {
            let posX = round(img.width / dims.width * x);
            let posY = round(img.height / dims.height * y);
            let grayValue = getGrayscaleValue(img, posX, posY);
            let strokeValue;
            switch (colorSelect.value()) {
                case "Black and White":
                    // strokeValue = grayValue.value;
                    strokeValue = "black";
                    break;
                case "Original":
                    strokeValue = grayValue.original;
                    break;
            }
            switch (mode) {
                case "Lines":
                    stroke(strokeValue);
                    strokeWeight(strokeWeightSlider.value());
                    let lineLength = lineLengthSelect.value() == "Constant" ? lineLengthSlider.value() : map(grayValue.value, 0, 100, lineLengthSlider.value(), 1, .1)
                    // let lineLength = 10;
                    if(lineLength < 5) {
                        break;
                    }
                    let direction = lineDirectionSelect.value();
                    let xEnd = direction !== "Vertical" ? x + lineLength : x;
                    let yEnd = direction !== "Horizontal" ? y + lineLength : y;
                    // line(x, y, xEnd, yEnd);
                    addSvgLine(x, y, xEnd, yEnd);
                    break;
                case "Circles":
                    stroke(strokeValue);
                    noFill();
                    strokeWeight(strokeWeightSlider.value());
                    let r = map(grayValue.value, 100, 0, 30, 1, .1)
                    ellipse(x, y, r);
                case "Rectangles":
                    stroke(strokeValue);
                    noFill();
                    strokeWeight(strokeWeightSlider.value());
                    let rectSize = map(grayValue.value, 100, 0, 40, 1, .1)
                    rect(x, y, rectSize, rectSize);
            }

        }
    }
}
