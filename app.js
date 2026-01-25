/* ===============================
   PDF.JS WORKER
================================ */
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

/* ===============================
   GLOBAL UI HELPERS
================================ */
function openTool(id) {
  document.querySelectorAll(".tool-area").forEach(
    section => section.style.display = "none"
  );
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

/* ===============================
   DRAG & DROP (SAFE)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".drop-zone").forEach(zone => {
    const input = zone.querySelector("input");

    zone.addEventListener("dragover", e => {
      e.preventDefault();
      zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("dragover");
    });

    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.classList.remove("dragover");
      if (input) input.files = e.dataTransfer.files;
    });
  });
});

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

    const w = pdf.internal.pageSize.getWidth();
    const h = (img.height * w) / img.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, w, h);
  }

  pdf.save("converted.pdf");
  status.innerText = "✅ PDF downloaded";
}

/* ===============================
   PDF → JPG
================================ */
async function convertPdfToJpg() {
  const input = document.getElementById("pdfInput");
  const output = document.getElementById("imageOutput");

  if (!input || !input.files.length) return alert("Select a PDF file");

  output.innerHTML = "";

  const pdf = await pdfjsLib.getDocument(
    await input.files[0].arrayBuffer()
  ).promise;

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
    img.style.marginBottom = "10px";
    output.appendChild(img);
  }
}

/* ===============================
   PNG → JPG (NEW – PRO)
================================ */
function convertPngToJpg() {
  const input = document.getElementById("pngInput");
  const output = document.getElementById("pngOutput");

  if (!input || !input.files.length) {
    alert("Please select a PNG image");
    return;
  }

  const file = input.files[0];
  if (file.type !== "image/png") {
    alert("Only PNG files allowed");
    return;
  }

  output.innerHTML = "⏳ Converting...";

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const jpgUrl = canvas.toDataURL("image/jpeg", 0.95);

      output.innerHTML = `
        <img src="${jpgUrl}" style="max-width:100%;border-radius:8px;margin:10px 0">
        <br>
        <a href="${jpgUrl}" download="converted.jpg" class="primary-btn">
          ⬇ Download JPG
        </a>
      `;
    };
    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

/* ===============================
   MERGE PDF
================================ */
async function mergePdfFiles() {
  const input = document.getElementById("mergePdfInput");
  const result = document.getElementById("mergePdfResult");

  if (!input || input.files.length < 2) {
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

  result.innerHTML = `
    <a href="${url}" download="merged.pdf" class="primary-btn">
      ⬇ Download Merged PDF
    </a>
  `;
}

/* ===============================
   QR CODE
================================ */
function generateQR() {
  const text = document.getElementById("qrText")?.value.trim();
  const box = document.getElementById("qrResult");

  if (!text) {
    box.innerText = "Enter text or URL";
    return;
  }

  box.innerHTML = "";
  new QRCode(box, { text, width: 200, height: 200 });
}

/* ===============================
   TIMER + STOPWATCH
================================ */
let timerInterval, stopwatchInterval;
let swSeconds = 0;

function startTimer() {
  const minutes = parseInt(document.getElementById("minutes").value);
  if (!minutes || minutes <= 0) return alert("Enter minutes");

  let time = minutes * 60;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    document.getElementById("timerDisplay").innerText =
      String(Math.floor(time / 60)).padStart(2, "0") + ":" +
      String(time % 60).padStart(2, "0");

    if (--time < 0) clearInterval(timerInterval);
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  document.getElementById("timerDisplay").innerText = "00:00";
}

function startStopwatch() {
  if (stopwatchInterval) return;
  stopwatchInterval = setInterval(() => {
    swSeconds++;
    document.getElementById("stopwatchDisplay").innerText =
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
  document.getElementById("stopwatchDisplay").innerText = "00:00:00";
}

/* ===============================
   TEXT CASE
================================ */
function toUpper() {
  caseOutput.value = caseInput.value.toUpperCase();
}
function toLower() {
  caseOutput.value = caseInput.value.toLowerCase();
}
function toTitle() {
  caseOutput.value = caseInput.value
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ===============================
   PASSWORD GENERATOR
================================ */
function generatePassword() {
  const len = parseInt(passLength.value) || 12;
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let pass = "";
  for (let i = 0; i < len; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  passwordOutput.value = pass;
}

/* ===============================
   WORD COUNTER
================================ */
document.addEventListener("DOMContentLoaded", () => {
  if (!countInput) return;
  countInput.addEventListener("input", () => {
    const text = countInput.value.trim();
    countResult.innerText =
      `Words: ${text ? text.split(/\s+/).length : 0} | Characters: ${countInput.value.length}`;
  });
});
