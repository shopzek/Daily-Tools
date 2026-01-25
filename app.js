/* ===============================
   PDF.JS WORKER
================================ */
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

/* ===============================
   MAIN DOM READY
================================ */
document.addEventListener("DOMContentLoaded", () => {
  console.log("App.js loaded and DOM ready ✅");

  /* ===============================
     DOM ELEMENTS
  ================================= */
  // Text Case
  const caseInput = document.getElementById("caseInput");
  const caseOutput = document.getElementById("caseOutput");

  // Password Generator
  const passLength = document.getElementById("passLength");
  const passwordOutput = document.getElementById("passwordOutput");

  // Word Counter
  const countInput = document.getElementById("countInput");
  const countResult = document.getElementById("countResult");

  // JPG → PDF
  const jpgInput = document.getElementById("jpgInput");
  const jpgStatus = document.getElementById("status");

  // PDF → JPG
  const pdfInput = document.getElementById("pdfInput");
  const imageOutput = document.getElementById("imageOutput");

  // PNG → JPG
  const pngInput = document.getElementById("pngInput");
  const pngOutput = document.getElementById("pngOutput");

  // Merge PDF
  const mergePdfInput = document.getElementById("mergePdfInput");
  const mergePdfResult = document.getElementById("mergePdfResult");

  // QR Code
  const qrText = document.getElementById("qrText");
  const qrResult = document.getElementById("qrResult");

  // Timer/Stopwatch
  const timerDisplay = document.getElementById("timerDisplay");
  const stopwatchDisplay = document.getElementById("stopwatchDisplay");
  const minutesInput = document.getElementById("minutes");

  /* ===============================
     GLOBAL UI HELPERS
  ================================= */
  window.openTool = function (id) {
    document.querySelectorAll(".tool-area").forEach(
      section => section.style.display = "none"
    );
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.toggleDark = function () {
    document.body.classList.toggle("dark");
  };

  /* ===============================
     DRAG & DROP
  ================================= */
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

  /* ===============================
     JPG → PDF
  ================================= */
  window.convertJpgToPdf = async function () {
    if (!jpgInput || !jpgInput.files.length) {
      if (jpgStatus) jpgStatus.innerText = "Please select JPG images";
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < jpgInput.files.length; i++) {
      const imgData = await new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(jpgInput.files[i]);
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
    if (jpgStatus) jpgStatus.innerText = "✅ PDF downloaded";
  };

  /* ===============================
     PDF → JPG
  ================================= */
  window.convertPdfToJpg = async function () {
    if (!pdfInput || !pdfInput.files.length) return alert("Select a PDF file");
    if (!imageOutput) return;

    imageOutput.innerHTML = "";

    const pdf = await pdfjsLib.getDocument(await pdfInput.files[0].arrayBuffer()).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/jpeg", 1);
      img.style.maxWidth = "100%";
      img.style.marginBottom = "10px";
      imageOutput.appendChild(img);
    }
  };

  /* ===============================
     PNG → JPG
  ================================= */
  window.convertPngToJpg = function () {
    if (!pngInput || !pngInput.files.length) return alert("Please select a PNG image");
    if (!pngOutput) return;

    const file = pngInput.files[0];
    if (file.type !== "image/png") return alert("Only PNG files allowed");

    pngOutput.innerHTML = "⏳ Converting...";

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

        pngOutput.innerHTML = `
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
  };

  /* ===============================
     MERGE PDF
  ================================= */
  window.mergePdfFiles = async function () {
    if (!mergePdfInput || mergePdfInput.files.length < 2) return alert("Select at least 2 PDF files");
    if (!mergePdfResult) return;

    const merged = await PDFLib.PDFDocument.create();

    for (const file of mergePdfInput.files) {
      const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    const blob = new Blob([await merged.save()], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    mergePdfResult.innerHTML = `
      <a href="${url}" download="merged.pdf" class="primary-btn">
        ⬇ Download Merged PDF
      </a>
    `;
  };

  /* ===============================
     QR CODE
  ================================= */
  window.generateQR = function () {
    if (!qrText || !qrResult) return;

    const text = qrText.value.trim();
    if (!text) {
      qrResult.innerText = "Enter text or URL";
      return;
    }

    qrResult.innerHTML = "";
    new QRCode(qrResult, { text, width: 200, height: 200 });
  };

  /* ===============================
     TIMER + STOPWATCH
  ================================= */
  let timerInterval, stopwatchInterval;
  let swSeconds = 0;

  window.startTimer = function () {
    if (!minutesInput || !timerDisplay) return;
    const minutes = parseInt(minutesInput.value);
    if (!minutes || minutes <= 0) return alert("Enter minutes");

    let time = minutes * 60;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timerDisplay.innerText =
        String(Math.floor(time / 60)).padStart(2, "0") + ":" +
        String(time % 60).padStart(2, "0");

      if (--time < 0) clearInterval(timerInterval);
    }, 1000);
  };

  window.resetTimer = function () {
    clearInterval(timerInterval);
    if (timerDisplay) timerDisplay.innerText = "00:00";
  };

  window.startStopwatch = function () {
    if (!stopwatchDisplay) return;
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
      swSeconds++;
      stopwatchDisplay.innerText =
        String(Math.floor(swSeconds / 3600)).padStart(2, "0") + ":" +
        String(Math.floor(swSeconds / 60) % 60).padStart(2, "0") + ":" +
        String(swSeconds % 60).padStart(2, "0");
    }, 1000);
  };

  window.stopStopwatch = function () {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  };

  window.resetStopwatch = function () {
    window.stopStopwatch();
    swSeconds = 0;
    if (stopwatchDisplay) stopwatchDisplay.innerText = "00:00:00";
  };

  /* ===============================
     TEXT CASE FUNCTIONS
  ================================= */
  window.toUpper = () => {
    if (caseInput && caseOutput) caseOutput.value = caseInput.value.toUpperCase();
  };
  window.toLower = () => {
    if (caseInput && caseOutput) caseOutput.value = caseInput.value.toLowerCase();
  };
  window.toTitle = () => {
    if (caseInput && caseOutput) caseOutput.value = caseInput.value
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  /* ===============================
     PASSWORD GENERATOR
  ================================= */
  window.generatePassword = () => {
    if (!passLength || !passwordOutput) return;
    const len = parseInt(passLength.value) || 12;
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let pass = "";
    for (let i = 0; i < len; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    passwordOutput.value = pass;
  };

  /* ===============================
     WORD COUNTER
  ================================= */
  if (countInput && countResult) {
    countInput.addEventListener("input", () => {
      const text = countInput.value.trim();
      countResult.innerText =
        `Words: ${text ? text.split(/\s+/).length : 0} | Characters: ${countInput.value.length}`;
    });
  }
});
