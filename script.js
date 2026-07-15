/* ==========================================================
   Texture Map Generator
   Part 1
========================================================== */

const fileInput = document.getElementById("f");
const strengthSlider = document.getElementById("s");
const strengthText = document.getElementById("strengthValue");
const themeBtn = document.getElementById("themeBtn");

const srcCanvas = document.getElementById("src");
const normalCanvas = document.getElementById("dst");
const dispCanvas = document.getElementById("disp");

const srcCtx = srcCanvas.getContext("2d");
const normalCtx = normalCanvas.getContext("2d");
const dispCtx = dispCanvas.getContext("2d");

let currentImage = null;

/* ===========================
   Strength Slider
=========================== */

strengthSlider.addEventListener("input", () => {

    strengthText.textContent = strengthSlider.value;

    if(currentImage){

        generateAll();

    }

});

/* ===========================
   Upload Image
=========================== */

fileInput.addEventListener("change",(event)=>{

    const file = event.target.files[0];

    if(!file) return;

    const img = new Image();

    img.onload = ()=>{

        currentImage = img;

        resizeCanvas(img.width,img.height);

        drawOriginal(img);

        generateAll();

    }

    img.src = URL.createObjectURL(file);

});

/* ===========================
   Resize Canvas
=========================== */

function resizeCanvas(width,height){

    srcCanvas.width = width;
    srcCanvas.height = height;

    normalCanvas.width = width;
    normalCanvas.height = height;

    dispCanvas.width = width;
    dispCanvas.height = height;

}

/* ===========================
   Draw Original
=========================== */

function drawOriginal(img){

    srcCtx.clearRect(0,0,srcCanvas.width,srcCanvas.height);

    srcCtx.drawImage(img,0,0);

}

/* ===========================
   Theme
=========================== */

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        themeBtn.textContent="☀️ Light Mode";

    }else{

        themeBtn.textContent="🌙 Night Mode";

    }

});

/* ===========================
   Generate All
=========================== */

function generateAll(){

    generateNormalMap();

    generateDisplacement();

}

/* ==========================================================
   Part 2
   Generate Normal Map (Sobel)
========================================================== */

function grayAt(data, x, y, width, height){

    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));

    const i = (y * width + x) * 4;

    return (
        data[i] * 0.299 +
        data[i + 1] * 0.587 +
        data[i + 2] * 0.114
    );

}

function generateNormalMap(){

    const width = srcCanvas.width;
    const height = srcCanvas.height;

    const image = srcCtx.getImageData(0,0,width,height);

    const pixels = image.data;

    const output = normalCtx.createImageData(width,height);

    const out = output.data;

    const strength = Number(strengthSlider.value);

    for(let y=0;y<height;y++){

        for(let x=0;x<width;x++){

            const gx =

                -grayAt(pixels,x-1,y-1,width,height)
                +grayAt(pixels,x+1,y-1,width,height)

                -2*grayAt(pixels,x-1,y,width,height)
                +2*grayAt(pixels,x+1,y,width,height)

                -grayAt(pixels,x-1,y+1,width,height)
                +grayAt(pixels,x+1,y+1,width,height);

            const gy =

                -grayAt(pixels,x-1,y-1,width,height)
                -2*grayAt(pixels,x,y-1,width,height)
                -grayAt(pixels,x+1,y-1,width,height)

                +grayAt(pixels,x-1,y+1,width,height)
                +2*grayAt(pixels,x,y+1,width,height)
                +grayAt(pixels,x+1,y+1,width,height);

            let nx = -gx * strength / 255;
            let ny = -gy * strength / 255;
            let nz = 1;

            const len = Math.hypot(nx,ny,nz);

            nx /= len;
            ny /= len;
            nz /= len;

            const i = (y * width + x) * 4;

            out[i] = (nx * 0.5 + 0.5) * 255;
            out[i+1] = (ny * 0.5 + 0.5) * 255;
            out[i+2] = (nz * 0.5 + 0.5) * 255;
            out[i+3] = 255;

        }

    }

    normalCtx.putImageData(output,0,0);

}

/* ==========================================================
   Part 3
   Generate Displacement Map
========================================================== */

function generateDisplacement() {

    const width = srcCanvas.width;
    const height = srcCanvas.height;

    const image = srcCtx.getImageData(0, 0, width, height);

    const pixels = image.data;

    const output = dispCtx.createImageData(width, height);

    const out = output.data;

    const strength = Number(strengthSlider.value);

    for (let i = 0; i < pixels.length; i += 4) {

        // Grayscale
        let gray =
            pixels[i] * 0.299 +
            pixels[i + 1] * 0.587 +
            pixels[i + 2] * 0.114;

        // Terapkan strength
        gray = gray * (strength / 2);

        if (gray > 255) gray = 255;
        if (gray < 0) gray = 0;

        out[i] = gray;
        out[i + 1] = gray;
        out[i + 2] = gray;
        out[i + 3] = 255;

    }

    dispCtx.putImageData(output, 0, 0);

}

/* ===========================
   Download Normal Map
=========================== */

document.getElementById("d").addEventListener("click", () => {

    const a = document.createElement("a");

    a.download = "normal_map.png";

    a.href = normalCanvas.toDataURL("image/png");

    a.click();

});

/* ===========================
   Download Displacement
=========================== */

document.getElementById("downloadDisp").addEventListener("click", () => {

    const a = document.createElement("a");

    a.download = "displacement_map.png";

    a.href = dispCanvas.toDataURL("image/png");

    a.click();

});