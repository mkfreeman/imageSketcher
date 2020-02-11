// Main script to construct the drawing area

// Global variables
let img;
let fitToScreen = true;
let lineControlsWrapper, xSpacingSlider, ySpacingSlider, strokeWeightSlider, lineDirectionSelect, modeSelect, colorSelect, windowWidth, windowHeight;
const namespace = 'http://www.w3.org/2000/svg';
let svg;

// Helper function for setting HTML element attributes
function setAttrs(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

// Helper function for setting styles
function setStyles(el, attrs) {
    for (var key in attrs) {
        el.style[key] = attrs[key];
    }
}

// Load image on start
function preload() {
    img = loadImage('imgs/obama.jpg');
    // makeImagePreview(imgPreview, img);
    svg = document.querySelector("#svg-clone")
    svg.style.position = "absolute";
    svg.style.left = "300px";
}

// Function to upload an image
function imageUpload(file) {
    img = loadImage(file.data, function () {
        drawOnce();
        makeImagePreview(imgPreview, img);
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

// Build controls
function makeControls() {
    // Wrapper 
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
    makeImagePreview(imgPreview, img)

    // Mode (line, circles, rectangles)
    modeSelect = makeSelect("Drawing Mode", options = ["Lines", "Circles", "Rectangles"], value = "Circles", parent = controlWrapper, drawOnce)

    // Spacing
    let spacingHeader = createDiv("<h3>Spacing</h3>");
    spacingHeader.parent(controlWrapper);
    xSpacingSlider = makeSlider("Vertical Spacing", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)
    ySpacingSlider = makeSlider("Horizontal Spacing", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)

    // Line controls
    lineControlsWrapper = createDiv();
    lineControlsWrapper.id("line_controls");
    lineControlsWrapper.parent(controlWrapper)
    let lineHeader = createDiv("<h3>Line Attributes</h3>");
    lineHeader.parent(lineControlsWrapper);
    lineDirectionSelect = makeSelect("Line Direction", options = ["Horizontal", "Vertical", "Diagonal"], value = "Diagonal", parent = lineControlsWrapper, drawOnce)
    lineMinSize = makeSlider("Min. Line Size", minVal = 0, maxVal = 50, value = 1, step = 1, parent = lineControlsWrapper, drawOnce)
    lineMaxSize = makeSlider("Max. Line Size", minVal = 2, maxVal = 100, value = 20, step = 1, parent = lineControlsWrapper, drawOnce)
    lineThreshold = makeSlider("Hide Lines Smaller than ...", minVal = 0, maxVal = 100, value = 1, step = 1, parent = lineControlsWrapper, drawOnce)

    // Circle controls
    circleControlsWrapper = createDiv();
    circleControlsWrapper.id("circle_controls");
    circleControlsWrapper.parent(controlWrapper)
    let circleHeader = createDiv("<h3>Circle Attributes</h3>");
    circleHeader.parent(circleControlsWrapper);
    circleMinSize = makeSlider("Min. Circle Size", minVal = 0, maxVal = 50, value = 1, step = 1, parent = circleControlsWrapper, drawOnce)
    circleMaxSize = makeSlider("Max. Circle Size", minVal = 2, maxVal = 100, value = 20, step = 1, parent = circleControlsWrapper, drawOnce)
    circleThreshold = makeSlider("Hide Circles Smaller than ...", minVal = 0, maxVal = 100, value = 1, step = 1, parent = circleControlsWrapper, drawOnce)

    // Rectangle controls
    rectControlsWrapper = createDiv();
    rectControlsWrapper.id("rect_controls");
    rectControlsWrapper.parent(controlWrapper)
    let rectHeader = createDiv("<h3>Rectangle Attributes</h3>");
    rectHeader.parent(rectControlsWrapper);
    rectMinSize = makeSlider("Min. Rect Size", minVal = 0, maxVal = 50, value = 1, step = 1, parent = rectControlsWrapper, drawOnce)
    rectMaxSize = makeSlider("Max. Rect Size", minVal = 2, maxVal = 100, value = 20, step = 1, parent = rectControlsWrapper, drawOnce)
    rectThreshold = makeSlider("Hide Rects Smaller than ...", minVal = 0, maxVal = 100, value = 1, step = 1, parent = rectControlsWrapper, drawOnce)


    // Buttons  
    makeButton("Download", controlWrapper, () => saveSvg());
    makeButton("About", controlWrapper, () => { }, "modal");
    return controlWrapper;
}

function toggleControlVisibility() {
    let mode = modeSelect.value();
    circleControlsWrapper.addClass("hidden");
    lineControlsWrapper.addClass("hidden");
    rectControlsWrapper.addClass("hidden");
    switch (mode) {
        case "Lines":
            lineControlsWrapper.removeClass("hidden");
            break;
        case "Circles":
            circleControlsWrapper.removeClass("hidden");
            break;
        case "Rectangles":
            rectControlsWrapper.removeClass("hidden");
            break;
    }
}

// Make a preview of the image on upload
function makeImagePreview(containerDiv, img) {
    // Empty div, if there is already an image
    containerDiv.html("")

    // For now, make it as a p5 sketch -- a little overkill
    s = (sketch) => {
        sketch.setup = () => {
            sketchCanvas = sketch.createCanvas(200, 200);
            sketch.noLoop();
            previewGet = sketch.get;
        };
        sketch.draw = () => {
            let dims = getDimensions(img, 200, 200);
            sketch.resizeCanvas(dims.width, dims.height)
            sketch.image(img, 0, 0, dims.width, dims.height);
        }
    };
    imgSample = new p5(s, containerDiv.id());
}


// Function to download canvas (not currenlty working, b/c not canvas...)
// function download() {
//     noLoop(); // pause
//     let link = document.createElement('a');
//     link.download = 'textDraw.png';
//     link.href = document.querySelector('.p5_canvas').toDataURL()
//     link.click();
// }

function saveSvg() {
    let svgEl = document.querySelector("svg");
    let name = "image_sketch.svg"
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Set up (elements only drawn once)
function setup() {
    // Get window size 
    // windowWidth = window.innerWidth - 270;
    // windowHeight = window.innerHeight - 180;
    windowWidth = 96 * 8;
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

// Get grayscale from color
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

// Draw a line
function addLine(x1, y1, x2, y2) {
    let line = document.createElementNS(namespace, 'line');
    line.style.stroke = "rgb(0,0,0)";
    setAttrs(line, { x1: x1, x2: x2, y1: y1, y2: y2 })
    svg.appendChild(line);
}

// Draw a circle
function addCircle(cx, cy, r) {
    let circle = document.createElementNS(namespace, 'circle');
    setAttrs(circle, { cx: cx, cy: cy, r: r });
    setStyles(circle, { fill: "none", stroke: "black", strokeWidth: "1px" })
    svg.appendChild(circle);
}

// Draw a rectangle
function addRect(x, y, dx, dy) {
    let rect = document.createElementNS(namespace, 'rect');
    setAttrs(rect, { x: x, y: y, width: dx, height: dy });
    setStyles(rect, { fill: "none", stroke: "black", strokeWidth: "1px" })
    svg.appendChild(rect);

}

function drawOnce() {
    background("white");
    svg.setAttribute("width", windowWidth);
    svg.setAttribute("height", windowHeight);
    svg.innerHTML = '' // clear svg;

    // Resize based on image width
    let dims = getDimensions(img, windowWidth, windowHeight);
    resizeCanvas(dims.width, dims.height)

    loadPixels() // don't actually *show* the image but use its pixels!

    // Get drawing mode
    let mode = modeSelect.value();

    // Toggle Controls
    toggleControlVisibility()

    // Draw a shape at every point
    for (let x = 0; x < dims.width; x += xSpacingSlider.value()) {
        for (let y = 0; y < dims.height; y += ySpacingSlider.value()) {
            let posX = round(img.width / dims.width * x);
            let posY = round(img.height / dims.height * y);
            let grayValue = getGrayscaleValue(img, posX, posY);
            // conso
            switch (mode) {
                case "Lines":
                    let lineLength = map(grayValue.value, 0, 100, lineMaxSize.value(), lineMinSize.value(), .1)
                    if (lineLength < lineThreshold.value()) {
                        break;
                    }
                    let direction = lineDirectionSelect.value();
                    let xEnd = direction !== "Vertical" ? x + lineLength : x;
                    let yEnd = direction !== "Horizontal" ? y + lineLength : y;
                    addLine(x, y, xEnd, yEnd);
                    break;
                case "Circles":
                    let r = map(grayValue.value, 0, 100, circleMaxSize.value(), circleMinSize.value(), .1) / 2;
                    if (r < circleThreshold.value()) {
                        break;
                    }
                    addCircle(x, y, r);
                    break;
                case "Rectangles":
                    let rectSize = map(grayValue.value, 0, 100, rectMaxSize.value(), rectMinSize.value(), .1);
                    if (rectSize < rectThreshold.value()) {
                        break;
                    }
                    addRect(x, y, rectSize, rectSize);
                    break;
            }

        }
    }
}
