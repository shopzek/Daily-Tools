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

  if (!input || !input.files.length) {
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

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (img.height * pageWidth) / img.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
  }

  pdf.save("converted.pdf");
  status.innerText = "Done!";
}

/* ===============================
   QR CODE GENERATOR
================================ */
function generateQR() {
  const text = document.getElementById("qrText").value.trim();
  const box = document.getElementById("qrResult");

  box.innerHTML = "";
  if (!text) {
    box.innerText = "Enter text or URL";
    return;
  }

  new QRCode(box, {
    text,
    width: 200,
    height: 200
  });
}

/* ===============================
   TIMER + STOPWATCH
================================ */
let timerInterval = null;
let stopwatchInterval = null;
let swSeconds = 0;

const minutesInput = document.getElementById("minutes");
const timerDisplay = document.getElementById("timerDisplay");
const stopwatchDisplay = document.getElementById("stopwatchDisplay");

function startTimer() {
  const minutes = parseInt(minutesInput.value, 10);
  if (!minutes || minutes <= 0) return alert("Enter valid minutes");

  let time = minutes * 60;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    timerDisplay.innerText = `${m}:${s}`;

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
    const h = String(Math.floor(swSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor(swSeconds / 60) % 60).padStart(2, "0");
    const s = String(swSeconds % 60).padStart(2, "0");
    stopwatchDisplay.innerText = `${h}:${m}:${s}`;
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
  const input = document.getElementById("pdfInput");
  const output = document.getElementById("imageOutput");

  if (!input.files.length) return alert("Select a PDF file");

  output.innerHTML = "";
  const pdf = await pdfjsLib.getDocument(await input.files[0].arrayBuffer()).promise;

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
    img.style.maxWidth = "100%";
    output.appendChild(img);
  }
}

/* ===============================
   MERGE PDF
================================ */
async function mergePdfFiles() {
  const input = document.getElementById("mergePdfInput");
  const result = document.getElementById("mergePdfResult");

  if (!input.files || input.files.length < 2) {
    alert("Select at least 2 PDF files");
    return;
  }

  const merged = await PDFLib.PDFDocument.create();

  for (const file of input.files) {
    const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  const blob = new Blob([await merged.save()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  result.innerHTML =
    `<a href="${url}" download="merged.pdf">⬇ Download Merged PDF</a>`;
}

/* ===============================
   UI HELPERS
================================ */
function openTool(id) {
  document.querySelectorAll(".tool-area").forEach(
    section => section.style.display = "none"
  );
  document.getElementById(id).style.display = "block";
}

function toggleDark() {
  document.body.classList.toggle("dark");
}
