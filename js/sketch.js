// Main script to construct the noise field
let img;
let fitToScreen = true;
let xMaxSlider, xSpacingSlider, ySpacingSlider, strokeWeightSlider, lineDirectionSelect, colorSelect;
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

    // Sliders
    xMaxSlider = makeSlider("Max. Line Length (x)", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)
    xSpacingSlider = makeSlider("Vertical Space Between Pixels", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)
    ySpacingSlider = makeSlider("Horizontal Space Between Pixels", minVal = 1, maxVal = 100, value = 10, step = 1, parent = controlWrapper, drawOnce)
    lineDirectionSelect = makeSelect("Line Direction", options = ["Horizontal", "Vertical", "Diagonal"], value = "Vertical", parent = controlWrapper, drawOnce)
    colorSelect = makeSelect("Color Setting", options = ["Black and White", "Original"], value = "Black and White", parent = controlWrapper, drawOnce)
    strokeWeightSlider = makeSlider("Stroke Width", minVal = .5, maxVal = 10, value = 1, step = .5, parent = controlWrapper, drawOnce);
    // particleSlider = makeSlider("Number of Particles", minVal = 10, maxVal = 10000, value = 500, step = 10, parent = controlWrapper, clearContent);
    // opacitySlider = makeSlider("Opacity", minVal = 1, maxVal = 100, value = 30, step = 1, parent = controlWrapper);
    // strokeWeightSlider = makeSlider("Stroke Weight", minVal = .5, maxVal = 20, value = 2, step = .5, parent = controlWrapper);
    // nrowSlider = makeSlider("Vertical Anchors", minVal = 2, maxVal = 50, value = 30, step = 1, parent = controlWrapper, clearContent);
    // ncolSlider = makeSlider("Horizontal Anchors", minVal = 2, maxVal = 50, value = 30, step = 1, parent = controlWrapper, clearContent);
    // xIncrementSlider = makeSlider("Horizontal Smoothness", minVal = .0001, maxVal = .3, value = .05, step = .0001, parent = controlWrapper, clearContent);
    // yIncrementSlider = makeSlider("Vertical Smoothness", minVal = .0001, maxVal = .3, value = .05, step = .0001, parent = controlWrapper, clearContent);
    // zIncrementSlider = makeSlider("Fluctuations in Forces", minVal = 0, maxVal = .3, value = .01, step = .0001, parent = controlWrapper, clearContent);
    // speedSlider = makeSlider("Maximum Particle Velocity", minVal = 1, maxVal = 5, value = 1, step = 1, parent = controlWrapper);

    // Buttons
    // makeButton("Pause", controlWrapper, noLoop);
    // makeButton("Resume", controlWrapper, loop);
    // makeButton("Clear", controlWrapper, clearContent);
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
    let windowWidth = window.innerWidth - 270;
    let windowHeight = window.innerHeight - 180;

    // Container for everything
    let container = createDiv().class("container");

    // Create controls and canvas
    let controls = makeControls();
    controls.parent(container);
    let canvasContainer = createDiv();
    canvas = createCanvas(windowWidth, windowHeight).class("p5_canvas");
    canvasContainer.parent(container);
    canvas.parent(canvasContainer);

    // Set color mode to RGB percentages  
    colorMode(RGB, 100);
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

function drawOnce() {
    background("white");
    // Resize based on image width
    let dims = getDimensions(img, width, height);
    resizeCanvas(dims.width, dims.height)
    let imgRatio = (dims.width / img.width);
    loadPixels() // don't actually *show* the image but use its pixels!
    strokeWeight(strokeWeightSlider.value())
    for (let x = 0; x < dims.width; x += xSpacingSlider.value()) {
        for (let y = 0; y < dims.height; y += ySpacingSlider.value()) {
            let posX = round(img.width / dims.width * x);
            let posY = round(img.height / dims.height * y);
            let grayValue = getGrayscaleValue(img, posX, posY);
            let strokeValue;
            switch (colorSelect.value()) {
                case "Black and White":
                    strokeValue = grayValue.value;
                    break;
                case "Original":
                    strokeValue = grayValue.original;
                    break;
            }
            stroke(strokeValue);
            let lineLength = map(grayValue.value, 0, 100, xMaxSlider.value(), 0, .1)
            let direction = lineDirectionSelect.value();
            let xEnd = direction !== "Vertical" ? x + lineLength : x;
            let yEnd = direction !== "Horizontal" ? y + lineLength : y;
            line(x, y, xEnd, yEnd);
        }
    }
}
