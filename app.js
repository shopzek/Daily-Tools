/* ===============================
   PDF.JS WORKER
================================ */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

/* ===============================
   JPG → PDF
================================ */
async function convertJpgToPdf() {
  const input = document.getElementById("jpgInput");
  const status = document.getElementById("status");

  if (!input.files.length) {
    status.innerText = "Please select JPG images";
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < input.files.length; i++) {
    const imgData = await new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(input.files[i]);
    });

    const img = new Image();
    await new Promise(ok => {
      img.onload = ok;
      img.src = imgData;
    });

    const w = pdf.internal.pageSize.getWidth();
    const h = (img.height * w) / img.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, w, h);
  }

  pdf.save("converted.pdf");
  status.innerText = "Done!";
}

/* ===============================
   QR CODE
================================ */
function generateQR() {
  const text = document.getElementById("qrText").value.trim();
  const box = document.getElementById("qrResult");
  box.innerHTML = "";
  if (!text) return (box.innerText = "Enter text");
  new QRCode(box, { text, width: 200, height: 200 });
}

/* ===============================
   TIMER + STOPWATCH (FIXED)
================================ */
let timerInterval, stopwatchInterval;
let swSeconds = 0;

const minutesInput = document.getElementById("minutes");
const timerDisplay = document.getElementById("timerDisplay");
const stopwatchDisplay = document.getElementById("stopwatchDisplay");

function startTimer() {
  let time = parseInt(minutesInput.value) * 60;
  if (!time) return alert("Enter minutes");

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerDisplay.innerText =
      String(Math.floor(time / 60)).padStart(2, "0") + ":" +
      String(time % 60).padStart(2, "0");

    if (--time < 0) clearInterval(timerInterval);
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerDisplay.innerText = "00:00";
}

function startStopwatch() {
  if (stopwatchInterval) return;
  stopwatchInterval = setInterval(() => {
    swSeconds++;
    stopwatchDisplay.innerText =
      String(Math.floor(swSeconds / 3600)).padStart(2, "0") + ":" +
      String(Math.floor(swSeconds / 60) % 60).padStart(2, "0") + ":" +
      String(swSeconds % 60).padStart(2, "0");
  }, 1000);
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
}

function resetStopwatch() {
  stopStopwatch();
  swSeconds = 0;
  stopwatchDisplay.innerText = "00:00:00";
}

/* ===============================
   PDF → JPG
================================ */
async function convertPdfToJpg() {
  const file = pdfInput.files[0];
  if (!file) return alert("Select PDF");

  imageOutput.innerHTML = "";
  const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport
    }).promise;

    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/jpeg", 1);
    imageOutput.appendChild(img);
  }
}

/* ===============================
   MERGE PDF (FIXED)
================================ */
async function mergePdfFiles() {
  const files = mergePdfInput.files;
  if (files.length < 2) return alert("Select at least 2 PDFs");

  const merged = await PDFLib.PDFDocument.create();

  for (const file of files) {
    const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  const blob = new Blob([await merged.save()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  mergePdfResult.innerHTML =
    `<a href="${url}" download="merged.pdf">⬇ Download Merged PDF</a>`;
}

/* ===============================
   VIDEO CONVERTER (EXPANDED)
================================ */
const { createFFmpeg, fetchFile } = FFmpeg;

let ffmpeg;

async function loadFFmpeg() {
  if (ffmpeg) return;

  ffmpeg = createFFmpeg({
    log: true,
    corePath: "./ffmpeg/ffmpeg-core.js" // ✅ LOCAL CORE
  });

  await ffmpeg.load();
}

document.getElementById("convertVideoBtn").addEventListener("click", async () => {
  const file = videoInput.files[0];
  const format = videoFormat.value;

  if (!file) {
    alert("Select a video file");
    return;
  }

  videoResult.innerHTML = "⏳ Loading FFmpeg (first run ~10s)...";

  try {
    await loadFFmpeg();

    ffmpeg.FS("writeFile", "input", await fetchFile(file));

    let output = `output.${format}`;

    if (format === "mp3") {
      await ffmpeg.run(
        "-i", "input",
        "-vn",
        "-acodec", "libmp3lame",
        output
      );
    } else {
      await ffmpeg.run("-i", "input", output);
    }

    const data = ffmpeg.FS("readFile", output);
    const url = URL.createObjectURL(new Blob([data.buffer]));

    videoResult.innerHTML = `
      ✅ Conversion successful<br>
      <a href="${url}" download="${output}">⬇ Download</a>
    `;
  } catch (err) {
    console.error(err);
    videoResult.innerHTML = "❌ Conversion failed. See console.";
  }
});

/* ===============================
   UI HELPERS
================================ */
function openTool(id) {
  document.querySelectorAll(".tool-area").forEach(t => t.style.display = "none");
  document.getElementById(id).style.display = "block";
}
function toggleDark() {
  document.body.classList.toggle("dark");
}
