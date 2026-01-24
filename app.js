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
   TIMER + STOPWATCH
================================ */
let timerInt, stopwatchInt, swSec = 0;

function startTimer() {
  let t = parseInt(minutes.value) * 60;
  if (!t) return;
  clearInterval(timerInt);
  timerInt = setInterval(() => {
    timerDisplay.innerText =
      String(Math.floor(t / 60)).padStart(2, "0") + ":" +
      String(t % 60).padStart(2, "0");
    if (t-- <= 0) clearInterval(timerInt);
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInt);
  timerDisplay.innerText = "00:00";
}
function startStopwatch() {
  if (stopwatchInt) return;
  stopwatchInt = setInterval(() => {
    swSec++;
    stopwatchDisplay.innerText =
      String(Math.floor(swSec / 3600)).padStart(2, "0") + ":" +
      String(Math.floor(swSec / 60) % 60).padStart(2, "0") + ":" +
      String(swSec % 60).padStart(2, "0");
  }, 1000);
}
function stopStopwatch() { clearInterval(stopwatchInt); stopwatchInt = null; }
function resetStopwatch() { stopStopwatch(); swSec = 0; stopwatchDisplay.innerText="00:00:00"; }

/* ===============================
   PDF → JPG
================================ */
async function convertPdfToJpg() {
  const f = pdfInput.files[0];
  if (!f) return alert("Select PDF");
  imageOutput.innerHTML = "";

  const pdf = await pdfjsLib.getDocument(await f.arrayBuffer()).promise;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const v = page.getViewport({ scale: 2 });
    const c = document.createElement("canvas");
    c.width = v.width; c.height = v.height;
    await page.render({ canvasContext: c.getContext("2d"), viewport: v }).promise;
    const img = document.createElement("img");
    img.src = c.toDataURL("image/jpeg", 1);
    imageOutput.appendChild(img);
  }
}

/* ===============================
   IMAGE CONVERTER
================================ */
document.addEventListener("DOMContentLoaded", () => {
  convertImgBtn.onclick = () => {
    if (!imgInput.files.length) return;
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        const w = imgWidth.value || img.width;
        const h = imgHeight.value || img.height;
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const out = c.toDataURL(format.value, compressCheckbox.checked ? .6 : .9);
        imgResult.innerHTML = `<img src="${out}" style="max-width:300px"><a download href="${out}">Download</a>`;
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(imgInput.files[0]);
  };
});

/* ===============================
   PNG → JPG
================================ */
function convertPngToJpg() {
  const f = pngInput.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      const d = c.toDataURL("image/jpeg", .9);
      pngOutput.innerHTML = `<a href="${d}" download="image.jpg">Download JPG</a>`;
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(f);
}

/* ===============================
   MERGE PDF (REAL)
================================ */
async function mergePdfFiles() {
  const files = mergePdfInput.files;
  if (files.length < 2) return alert("Select 2+ PDFs");

  const out = await PDFLib.PDFDocument.create();
  for (const f of files) {
    const pdf = await PDFLib.PDFDocument.load(await f.arrayBuffer());
    (await out.copyPages(pdf, pdf.getPageIndices()))
      .forEach(p => out.addPage(p));
  }

  const url = URL.createObjectURL(
    new Blob([await out.save()], { type: "application/pdf" })
  );
  mergePdfResult.innerHTML = `<a href="${url}" download="merged.pdf">Download PDF</a>`;
}

/* ===============================
   VIDEO CONVERTER (STABLE)
================================ */
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

convertVideoBtn.onclick = async () => {
  if (!videoInput.files.length) return alert("Select video");

  videoResult.innerText = "Loading FFmpeg...";
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoInput.files[0]));

  const fmt = videoFormat.value;
  const out = fmt === "mp3" ? "out.mp3" : "out." + fmt;

  await ffmpeg.run("-i", "input.mp4", out);
  const data = ffmpeg.FS("readFile", out);
  const url = URL.createObjectURL(new Blob([data.buffer]));

  videoResult.innerHTML = `<a href="${url}" download="${out}">Download</a>`;
};

/* ===============================
   UI HELPERS
================================ */
function openTool(id) {
  document.querySelectorAll(".tool-area").forEach(t => t.style.display="none");
  document.getElementById(id).style.display="block";
}
function toggleDark() {
  document.body.classList.toggle("dark");
}
