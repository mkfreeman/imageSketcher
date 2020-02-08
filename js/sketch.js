// Main script to construct the noise field
let img;
let fitToScreen = true;
let lineLengthSlider, xSpacingSlider, ySpacingSlider, strokeWeightSlider, lineDirectionSelect, modeSelect, colorSelect, windowWidth, windowHeight;
let fontSizeMax = 20;
let fontSizeMin = 5;
// Load obama on start
function preload() {
    // preload() runs once
    img = loadImage('imgs/obama.jpg');
}

function imageUpload(file) {
    img = loadImage(file.data, function () {
        drawOnce();
    });
}

let inputText = "I chose to run for president at this moment in history because I believe deeply that we cannot solve the challenges of our time unless we solve them together, unless we perfect our union by understanding that we may have different stories, but we hold common hopes; that we may not look the same and may not have come from the same place, but we all want to move in the same direction: toward a better future for our children and our grandchildren.And this belief comes from my unyielding faith in the decency and generosity of the American people. But it also comes from my own story. I am the son of a black man from Kenya and a white woman from Kansas. I was raised with the help of a white grandfather who survived a Depression to serve in Patton's army during World War II and a white grandmother who worked on a bomber assembly line at Fort Leavenworth while he was overseas.I've gone to some of the best schools in America and I've lived in one of the world's poorest nations. I am married to a black American who carries within her the blood of slaves and slave owners, an inheritance we pass on to our two precious daughters.I have brothers, sisters, nieces, nephews, uncles and cousins of every race and every hue scattered across three continents. And for as long as I live, I will never forget that in no other country on earth is my story even possible.It's a story that hasn't made me the most conventional of candidates. But it is a story that has seared into my genetic makeup the idea that this nation is more than the sum of its parts -- that out of many, we are truly one.Throughout the first year of this campaign, against all predictions to the contrary, we saw how hungry the American people were for this message of unity. Despite the temptation to view my candidacy through a purely racial lens, we won commanding victories in states with some of the whitest populations in the country. In South Carolina, where the Confederate flag still flies, we built a powerful coalition of African Americans and white Americans.This is not to say that race has not been an issue in this campaign. At various stages in the campaign, some commentators have deemed me either too black or not black enough. We saw racial tensions bubble to the surface during the week before the South Carolina primary. The press has scoured every single exit poll for the latest evidence of racial polarization, not just in terms of white and black, but black and brown as well.And yet, it's only been in the last couple of weeks that the discussion of race in this campaign has taken a particularly divisive turn.On one end of the spectrum, we've heard the implication that my candidacy is somehow an exercise in affirmative action; that it's based solely on the desire of wild- and wide-eyed liberals to purchase racial reconciliation on the cheap.On the other end, we've heard my former pastor, Jeremiah Wright, use incendiary language to express views that have the potential not only to widen the racial divide, but views that denigrate both the greatness and the goodness of our nation and that rightly offend white and black alike.I have already condemned, in unequivocal terms, the statements of Reverend Wright that have caused such controversy, and in some cases, pain.For some, nagging questions remain: Did I know him to be an occasionally fierce critic of American domestic and foreign policy? Of course. Did I ever hear him make remarks that could be considered controversial while I sat in the church? Yes. Did I strongly disagree with many of his political views? Absolutely, just as I'm sure many of you have heard remarks from your pastors, priests or rabbis with which you strongly disagree.But the remarks that have caused this recent firestorm weren't simply controversial. They weren't simply a religious leader's effort to speak out against perceived injustice. Instead, they expressed a profoundly distorted view of this country, a view that sees white racism as endemic and that elevates what is wrong with America above all that we know is right with America; a view that sees the conflicts in the Middle East as rooted primarily in the actions of stalwart allies like Israel instead of emanating from the perverse and hateful ideologies of radical Islam.As such, Reverend Wright's comments were not only wrong but divisive, divisive at a time when we need unity; racially charged at a time when we need to come together to solve a set of monumental problems -- two wars, a terrorist threat, a falling economy, a chronic health care crisis and potentially devastating climate change, problems that are neither black or white or Latino or Asian, but rather problems that confront us all.Given my background, my politics, and my professed values and ideals, there will no doubt be those for whom my statements of condemnation are not enough.Why associate myself with Reverend Wright in the first place, they may ask? Why not join another church? And I confess that if all that I knew of Reverend Wright were the snippets of those sermons that have run in an endless loop on the television sets and YouTube, if Trinity United Church of Christ conformed to the caricatures being peddled by some commentators, there is no doubt that I would react in much the same wayBut the truth is, that isn't all that I know of the man. The man I met more than twenty years ago is a man who helped introduce me to my Christian faith, a man who spoke to me about our obligations to love one another; to care for the sick and lift up the poor.He is a man who served his country as a U.S. Marine, and who has studied and lectured at some of the finest universities and seminaries in the country, and who over 30 years has led a church that serves the community by doing God's work here on Earth -- by housing the homeless, ministering to the needy, providing day care services and scholarships and prison ministries, and reaching out to those suffering from HIV/AIDS.In my first book, Dreams From My Father, I described the experience of my first service at Trinity, and it goes as follows: People began to shout, to rise from their seats and clap and cry out, a forceful wind carrying the reverend's voice up into the rafters.And in that single note -- hope -- I heard something else; at the foot of that cross, inside the thousands of churches across the city, I imagined the stories of ordinary black people merging with the stories of David and Goliath, Moses and Pharaoh, the Christians in the lion's den, Ezekiel's field of dry bones.Those stories of survival and freedom and hope became our story, my story. The blood that spilled was our blood; the tears our tears; until this black church, on this bright day, seemed once more a vessel carrying the story of a people into future generations and into a larger world."
let kerning = .1;
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

    // Spacing
    let spacingHeader = createDiv("<h3>Spacing</h3>");
    spacingHeader.parent(controlWrapper);
    spacingSlider = makeSlider("Spacing", minVal = 2, maxVal = 30, value = 10, step = 1, parent = controlWrapper, drawOnce)
    maxFontSizeSlider = makeSlider("Max. Font Size", minVal = 5, maxVal = 30, value = 20, step = 1, parent = controlWrapper, drawOnce)
    minFontSizeSlider = makeSlider("Min. Font Size", minVal = 1, maxVal = 20, value = 8, step = 1, parent = controlWrapper, drawOnce)


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
    windowWidth = window.innerWidth - 270;
    windowHeight = window.innerHeight - 180;

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

function drawOnce() {
    background("white");

    // Resize based on image width
    let dims = getDimensions(img, windowWidth, windowHeight);
    resizeCanvas(dims.width, dims.height)
    let imgRatio = (dims.width / img.width);
    loadPixels() // don't actually *show* the image but use its pixels!

    let spacing = spacingSlider.value();
    let y = 10, x = 0, counter = 0;
    while (y < dims.height) {
        let posX = round(img.width / dims.width * x);
        let posY = round(img.height / dims.height * y);
        let grayValue = getGrayscaleValue(img, posX, posY);
        push(); // new drawing state
        translate(x, y);
        let letter = inputText.charAt(counter);
        let fontSize = map(grayValue.value, 0, 100, maxFontSizeSlider.value(), minFontSizeSlider.value());
        textSize(fontSize);
        text(letter, 0, 0)
        let letterWidth = textWidth(letter) + kerning;
        x += letterWidth
        pop(); // restore drawing state
        counter++
        if (x + letterWidth >= dims.width) {
            x = 0;
            y += spacing;
        }
        if (counter >= inputText.length) {
            counter = 0;
        }
    }
}
