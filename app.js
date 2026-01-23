pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";


async function convertJpgToPdf() {
  const input = document.getElementById("jpgInput");
  const status = document.getElementById("status");

  if (!input.files.length) {
    status.innerText = "Please select at least one JPG image.";
    return;
  }

  status.innerText = "Converting...";

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);

    await new Promise(resolve => {
      img.onload = () => {
        const width = pdf.internal.pageSize.getWidth();
        const height = (img.height * width) / img.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, width, height);
        resolve();
      };
    });
  }

  pdf.save("converted.pdf");
  status.innerText = "Done! Your PDF is downloaded.";
}
// QR CODE GENERATOR
function generateQR() {
  const text = document.getElementById("qrText").value.trim();
  const result = document.getElementById("qrResult");

  result.innerHTML = "";

  if (!text) {
    result.innerText = "Please enter text or URL.";
    return;
  }

  new QRCode(result, {
    text: text,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff"
  });
}
// TIMER
let timerInterval = null;

function startTimer() {
  const minutesInput = document.getElementById("minutes");
  const display = document.getElementById("timerDisplay");

  if (!minutesInput || !display) {
    alert("Timer elements not found");
    return;
  }

  let time = parseInt(minutesInput.value, 10) * 60;

  if (isNaN(time) || time <= 0) {
    display.innerText = "Enter valid minutes";
    return;
  }

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;

    display.innerText =
      String(mins).padStart(2, "0") + ":" +
      String(secs).padStart(2, "0");

    if (time === 0) {
      clearInterval(timerInterval);
      alert("Time is up!");
    }

    time--;
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  document.getElementById("timerDisplay").innerText = "00:00";
}
// STOPWATCH
let stopwatchInterval = null;
let stopwatchSeconds = 0;

function startStopwatch() {
  if (stopwatchInterval) return;

  stopwatchInterval = setInterval(() => {
    stopwatchSeconds++;

    const hrs = Math.floor(stopwatchSeconds / 3600);
    const mins = Math.floor((stopwatchSeconds % 3600) / 60);
    const secs = stopwatchSeconds % 60;

    document.getElementById("stopwatchDisplay").innerText =
      String(hrs).padStart(2, "0") + ":" +
      String(mins).padStart(2, "0") + ":" +
      String(secs).padStart(2, "0");
  }, 1000);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
}

function resetStopwatch() {
  stopStopwatch();
  stopwatchSeconds = 0;
  document.getElementById("stopwatchDisplay").innerText = "00:00:00";
}
// PDF TO JPG
async function convertPdfToJpg() {
  const fileInput = document.getElementById("pdfInput");
  const output = document.getElementById("imageOutput");

  if (!fileInput.files.length) {
    alert("Please select a PDF file");
    return;
  }

  output.innerHTML = "Converting...";

  const file = fileInput.files[0];
  const fileReader = new FileReader();

  fileReader.onload = async function () {
    const typedArray = new Uint8Array(this.result);

    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    output.innerHTML = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/jpeg", 1.0);
      output.appendChild(img);
    }
  };

  fileReader.readAsArrayBuffer(file);
}

// =====================
// Show only selected tool
// =====================
function openTool(toolId) {
  const allTools = document.querySelectorAll(".tool-area");
  allTools.forEach(t => t.style.display = "none");
  const tool = document.getElementById(toolId);
  if (tool) tool.style.display = "block";
}

// =====================
// IMAGE CONVERTER & COMPRESSOR
// =====================
document.addEventListener("DOMContentLoaded", function() {
  const convertBtn = document.getElementById("convertImgBtn");
  const imgInput = document.getElementById("imgInput");
  const formatSelect = document.getElementById("format");
  const compressCheckbox = document.getElementById("compressCheckbox");
  const widthInput = document.getElementById("imgWidth");
  const heightInput = document.getElementById("imgHeight");
  const imgResult = document.getElementById("imgResult");

  convertBtn.addEventListener("click", function() {
    imgResult.innerHTML = "";

    if (!imgInput.files.length) {
      imgResult.innerText = "Please select an image!";
      return;
    }

    const file = imgInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function() {
        const width = parseInt(widthInput.value) || img.width;
        const height = parseInt(heightInput.value) || img.height;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const outputType = formatSelect.value;
        const quality = compressCheckbox.checked ? 0.6 : 0.9;

        const finalDataUrl = canvas.toDataURL(outputType, quality);

        const preview = document.createElement("img");
        preview.src = finalDataUrl;
        preview.style.maxWidth = "300px";
        preview.style.display = "block";
        imgResult.appendChild(preview);

        const link = document.createElement("a");
        link.href = finalDataUrl;
        const ext = outputType.split("/")[1];
        link.download = (compressCheckbox.checked ? "compressed_" : "converted_") + file.name.replace(/\.[^/.]+$/, "") + "." + ext;
        link.innerText = "Download Image";
        link.style.display = "block";
        link.style.marginTop = "10px";
        imgResult.appendChild(link);
      };

      img.onerror = function() {
        imgResult.innerText = "Failed to load image!";
      };
    };

    reader.readAsDataURL(file);
  });
});


