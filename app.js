/* ===============================
   PDF.JS WORKER
================================ */
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

/* ===============================
   DOM READY
================================ */
document.addEventListener("DOMContentLoaded", () => {
  console.log("App.js loaded ✅");

  /* ===============================
     HELPER TOGGLE DARK MODE
  ================================= */
  window.toggleDark = () => document.body.classList.toggle("dark");

  /* ===============================
     DRAG & DROP SUPPORT
  ================================= */
  document.querySelectorAll(".drop-zone").forEach(zone => {
    const input = zone.querySelector("input");

    zone.addEventListener("dragover", e => {
      e.preventDefault();
      zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));

    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.classList.remove("dragover");
      if (input) input.files = e.dataTransfer.files;
      const info = zone.querySelector(".file-info");
      if (info && input.files.length) info.innerText = `${input.files.length} file(s) selected`;
    });
  });

  /* ===============================
     JPG → PDF
  ================================= */
  const jpgInput = document.getElementById("jpgInput");
  const jpgStatus = document.getElementById("status");

  if (jpgInput && jpgStatus) {
    window.convertJpgToPdf = async () => {
      if (!jpgInput.files.length) {
        jpgStatus.innerText = "Please select JPG images";
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
        await new Promise(ok => { img.onload = ok; img.src = imgData; });

        const w = pdf.internal.pageSize.getWidth();
        const h = (img.height * w) / img.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, w, h);
      }

      pdf.save("converted.pdf");
      jpgStatus.innerText = "✅ PDF downloaded";
    };
  }

  /* ===============================
     PDF → JPG
  ================================= */
  const pdfInput = document.getElementById("pdfInput");
  const imageOutput = document.getElementById("imageOutput");

  if (pdfInput && imageOutput) {
    window.convertPdfToJpg = async () => {
      if (!pdfInput.files.length) return alert("Select a PDF file");
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
  }

  /* ===============================
     PNG → JPG
  ================================= */
  const pngInput = document.getElementById("pngInput");
  const pngOutput = document.getElementById("pngOutput");

  if (pngInput && pngOutput) {
    window.convertPngToJpg = () => {
      if (!pngInput.files.length) return alert("Please select a PNG image");
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
  }

  /* ===============================
     Merge PDF
  ================================= */
  const mergePdfInput = document.getElementById("mergePdfInput");
  const mergePdfResult = document.getElementById("mergePdfResult");

  if (mergePdfInput && mergePdfResult) {
    window.mergePdfFiles = async () => {
      if (mergePdfInput.files.length < 2) return alert("Select at least 2 PDF files");

      mergePdfResult.innerHTML = "⏳ Merging PDFs...";
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
  }

  /* ===============================
     QR CODE
  ================================= */
  const qrText = document.getElementById("qrText");
  const qrResult = document.getElementById("qrResult");
  const qrLogoInput = document.getElementById("qrLogoInput");

  if (qrText && qrResult) {
    window.generateQR = () => {
      const value = qrText.value.trim();
      if (!value) { qrResult.innerText = "Enter text or URL"; return; }

      qrResult.innerHTML = "";
      const tempDiv = document.createElement("div");
      qrResult.appendChild(tempDiv);

      const qr = new QRCode(tempDiv, {
        text: value,
        width: 300,
        height: 300,
        correctLevel: QRCode.CorrectLevel.H
      });

      if (qrLogoInput && qrLogoInput.files[0]) {
        setTimeout(() => {
          const canvas = tempDiv.querySelector("canvas");
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const ctx = canvas.getContext("2d");
              const logoSize = canvas.width * 0.2;
              ctx.drawImage(img, (canvas.width - logoSize)/2, (canvas.height - logoSize)/2, logoSize, logoSize);
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(qrLogoInput.files[0]);
          qrResult.appendChild(canvas);
          tempDiv.remove();
        }, 150);
      } else {
        setTimeout(() => {
          const canvas = tempDiv.querySelector("canvas");
          qrResult.appendChild(canvas);
          tempDiv.remove();
        }, 150);
      }
    };
  }

  /* ===============================
     Timer & Stopwatch
  ================================= */
  const timerDisplay = document.getElementById("timerDisplay");
  const stopwatchDisplay = document.getElementById("stopwatchDisplay");
  const minutesInput = document.getElementById("minutes");

  let timerInterval, stopwatchInterval, swSeconds = 0;

  if (timerDisplay && minutesInput) {
    window.startTimer = () => {
      const minutes = parseInt(minutesInput.value);
      if (!minutes || minutes <= 0) return alert("Enter minutes");
      let time = minutes * 60;
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timerDisplay.innerText =
          String(Math.floor(time/60)).padStart(2,"0")+":"+String(time%60).padStart(2,"0");
        if (--time < 0) clearInterval(timerInterval);
      },1000);
    };
    window.resetTimer = () => { clearInterval(timerInterval); timerDisplay.innerText="00:00"; };
  }

  if (stopwatchDisplay) {
    window.startStopwatch = () => {
      if (stopwatchInterval) return;
      stopwatchInterval = setInterval(() => {
        swSeconds++;
        stopwatchDisplay.innerText =
          String(Math.floor(swSeconds/3600)).padStart(2,"0")+":"+
          String(Math.floor(swSeconds/60)%60).padStart(2,"0")+":"+
          String(swSeconds%60).padStart(2,"0");
      },1000);
    };
    window.stopStopwatch = () => { clearInterval(stopwatchInterval); stopwatchInterval=null; };
    window.resetStopwatch = () => { swSeconds=0; stopwatchDisplay.innerText="00:00:00"; };
  }

  /* ===============================
     Text Case
  ================================= */
  const caseInput = document.getElementById("caseInput");
  const caseOutput = document.getElementById("caseOutput");
  if (caseInput && caseOutput) {
    window.toUpper = () => { caseOutput.value = caseInput.value.toUpperCase(); };
    window.toLower = () => { caseOutput.value = caseInput.value.toLowerCase(); };
    window.toTitle = () => { 
      caseOutput.value = caseInput.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); 
    };
  }

  /* ===============================
     Password Generator
  ================================= */
  const passLength = document.getElementById("passLength");
  const passwordOutput = document.getElementById("passwordOutput");
  if (passLength && passwordOutput) {
    window.generatePassword = () => {
      const len = parseInt(passLength.value) || 12;
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
      let pass="";
      for(let i=0;i<len;i++){ pass+=chars[Math.floor(Math.random()*chars.length)]; }
      passwordOutput.value=pass;
    };
  }

  /* ===============================
     Word Counter
  ================================= */
  const countInput = document.getElementById("countInput");
  const countResult = document.getElementById("countResult");
  if (countInput && countResult) {
    countInput.addEventListener("input", () => {
      const text = countInput.value.trim();
      countResult.innerText = `Words: ${text?text.split(/\s+/).length:0} | Characters: ${countInput.value.length}`;
    };
  }

/* ===============================
   URL SHORTENER
================================ */
const longUrlInput = document.getElementById("longUrl");
const shortUrlOutput = document.getElementById("shortUrlOutput");

if (longUrlInput && shortUrlOutput) {
  window.shortenURL = async () => {
    const url = longUrlInput.value.trim();
    if (!url) {
      shortUrlOutput.innerText = "Enter a valid URL";
      return;
    }

    shortUrlOutput.innerText = "⏳ Shortening...";

    try {
      const res = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
      );
      const shortUrl = await res.text();

      shortUrlOutput.innerHTML = `
        <input type="text" value="${shortUrl}" readonly style="width:100%;margin:8px 0">
        <button onclick="navigator.clipboard.writeText('${shortUrl}')">
          📋 Copy
        </button>
      `;
    } catch {
      shortUrlOutput.innerText = "❌ Failed to shorten URL";
    };
  }

   /* ===============================
   BACKGROUND & SMART OBJECT REMOVER
================================ */
const imageInput = document.getElementById("imageInput");
const imageCanvas = document.getElementById("imageCanvas");
const ctx = imageCanvas.getContext("2d");
const removeBgBtn = document.getElementById("removeBgBtn");
const smartRemoveBtn = document.getElementById("smartRemoveBtn");
const clearMarksBtn = document.getElementById("clearMarksBtn");
const loading = document.getElementById("loading");

let img = new Image();
let imgOriginalData = null; // Original image data
let marks = []; // user painted points
let isPainting = false;
let mode = null; // "smart-remove" or null

// ===================
// Load Image
// ===================
imageInput.onchange = () => {
  if (!imageInput.files.length) return;
  loadImage(imageInput.files[0]);
};

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

img.onload = () => {
  const maxWidth = 700;
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  imageCanvas.width = img.width * scale;
  imageCanvas.height = img.height * scale;
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
  imgOriginalData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  removeBgBtn.disabled = false;
  smartRemoveBtn.disabled = false;
  clearMarksBtn.disabled = true;
  marks = [];
  mode = null;
  loading.textContent = "";
};

// ===================
// Drag & Drop (optional)
// ===================
const dropZone = document.getElementById("dropZone");
dropZone.onclick = () => imageInput.click();
dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add("dragover"); };
dropZone.ondragleave = () => dropZone.classList.remove("dragover");
dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length) loadImage(e.dataTransfer.files[0]);
};

// ===================
// Drawing for Smart Object Remove
// ===================
imageCanvas.onmousedown = e => { if (mode === "smart-remove") startPainting(e); };
imageCanvas.onmouseup = e => { if (mode === "smart-remove") stopPainting(); };
imageCanvas.onmouseout = e => { if (mode === "smart-remove") stopPainting(); };
imageCanvas.onmousemove = e => { if (mode === "smart-remove" && isPainting) addMark(e); };

function startPainting(e) { isPainting = true; addMark(e); }
function stopPainting() { isPainting = false; }

function addMark(e) {
  const rect = imageCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  marks.push({ x, y });
  drawMarks();
}

function drawMarks() {
  ctx.putImageData(imgOriginalData, 0, 0);
  ctx.fillStyle = "rgba(255,0,0,0.4)";
  ctx.strokeStyle = "rgba(255,0,0,0.7)";
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (marks.length > 1) {
    ctx.beginPath();
    ctx.moveTo(marks[0].x, marks[0].y);
    for (let i = 1; i < marks.length; i++) ctx.lineTo(marks[i].x, marks[i].y);
    ctx.stroke();
  }

  marks.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
    ctx.fill();
  });

  clearMarksBtn.disabled = marks.length === 0;
}

// ===================
// Buttons
// ===================
clearMarksBtn.onclick = () => {
  marks = [];
  ctx.putImageData(imgOriginalData, 0, 0);
  clearMarksBtn.disabled = true;
  loading.textContent = "";
};

removeBgBtn.onclick = async () => {
  if (!img.src) return alert("Please load an image first.");
  mode = null;
  marks = [];
  clearMarksBtn.disabled = true;
  loading.textContent = "⏳ Processing background removal...";
  await removeBackground();
  loading.textContent = "✅ Background removed.";
};

smartRemoveBtn.onclick = () => {
  if (!img.src) return alert("Please load an image first.");
  mode = "smart-remove";
  loading.textContent = "🖌️ Paint over objects to remove, then double-click Smart Remove.";
};

smartRemoveBtn.ondblclick = () => {
  if (!marks.length) { alert("No marked area to remove."); return; }
  loading.textContent = "⏳ Removing marked objects...";
  smartObjectRemove();
};

// ===================
// Functions
// ===================
async function removeBackground() {
  const imgData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) data[i + 3] = 0;
  }

  ctx.putImageData(imgData, 0, 0);
  imgOriginalData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
}

function smartObjectRemove() {
  const imgData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  const data = imgData.data;
  const radius = 20;

  marks.forEach(({ x, y }) => {
    const cx = Math.round(x), cy = Math.round(y);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = cx + dx, py = cy + dy;
        if (px < 0 || py < 0 || px >= imageCanvas.width || py >= imageCanvas.height) continue;
        if (dx * dx + dy * dy > radius * radius) continue;

        const neighbors = [
          [px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1],
          [px - 1, py - 1], [px + 1, py - 1], [px - 1, py + 1], [px + 1, py + 1]
        ];

        const surroundingColors = [];
        neighbors.forEach(([nx, ny]) => {
          if (nx >= 0 && ny >= 0 && nx < imageCanvas.width && ny < imageCanvas.height) {
            const idx = (ny * imageCanvas.width + nx) * 4;
            surroundingColors.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
          }
        });

        if (!surroundingColors.length) continue;

        const avg = surroundingColors.reduce((acc, c) => {
          acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += c[3]; return acc;
        }, [0, 0, 0, 0]).map(x => x / surroundingColors.length);

        const idx = (py * imageCanvas.width + px) * 4;
        data[idx] = avg[0]; data[idx + 1] = avg[1]; data[idx + 2] = avg[2]; data[idx + 3] = avg[3];
      }
    }
  });

  ctx.putImageData(imgData, 0, 0);
  marks = [];
  clearMarksBtn.disabled = true;
  loading.textContent = "✅ Objects removed. Paint & remove again to refine.";
}


   
   /* ===============================
   EMOJI TOOL
================================ */
const emojiGrid = document.getElementById("emojiGrid");
const selectedEmoji = document.getElementById("selectedEmoji");

if (emojiGrid && selectedEmoji) {
  const emojis = [
    "😀","😂","😍","😎","😭","🔥","❤️","👍",
    "🎉","🚀","💰","📈","📱","🤖","⚡"
  ];

  emojis.forEach(e => {
    const btn = document.createElement("button");
    btn.textContent = e;
    btn.className = "emoji-btn";
    btn.onclick = () => selectedEmoji.innerText = e;
    emojiGrid.appendChild(btn);
  });

  window.copyEmoji = () => {
    if (!selectedEmoji.innerText) return alert("Select an emoji");
    navigator.clipboard.writeText(selectedEmoji.innerText);
    alert("Emoji copied!");
  };

  window.downloadEmoji = () => {
    if (!selectedEmoji.innerText) return alert("Select an emoji");

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.font = "200px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selectedEmoji.innerText, 128, 140);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "emoji.png";
    link.click();
  });
} 
});
/* ================= WHY US TOGGLE ================= */
function toggleWhy(btn) {
  const grid = document.getElementById("whyGrid");
  grid.classList.toggle("active");

  btn.innerText = grid.classList.contains("active")
    ? "Why Choose DailyTools? −"
    : "Why Choose DailyTools? +";
}
