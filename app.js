// ===== JPG to PDF =====
function convertJpgToPdf() {
  const files = document.getElementById('jpgInput').files;
  if (!files.length) return alert("Upload JPG images!");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgData = e.target.result;
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, 10, 180, 0);
      if (index === files.length - 1) {
        pdf.save("converted.pdf");
      }
    }
    reader.readAsDataURL(file);
  });
}

// ===== PDF to JPG =====
function convertPdfToJpg() {
  alert("PDF to JPG requires PDF.js. Include pdf.js and implement rendering page by page.");
}

// ===== Word to PDF =====
function convertWordToPdf() {
  alert("Word to PDF requires API or server-side processing.");
}

// ===== PNG to JPG =====
function convertPngToJpg() {
  const input = document.getElementById('pngInput');
  if (!input.files.length) return alert("Upload PNG file!");
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const jpg = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.getElementById('pngDownload');
      link.href = jpg;
      link.download = "converted.jpg";
      link.style.display = "inline";
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

// ===== Image Compressor =====
function compressImage() {
  const input = document.getElementById('compressInput');
  if (!input.files.length) return alert("Upload image!");
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const compressed = canvas.toDataURL("image/jpeg", 0.5);
      const link = document.getElementById('compressDownload');
      link.href = compressed;
      link.download = "compressed.jpg";
      link.style.display = "inline";
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

// ===== Merge PDF =====
function mergePdf() {
  alert("Merge PDF requires PDF-lib.js. Include library and implement merge.");
}

// ===== Video Converter =====
function convertVideo() {
  alert("Video conversion requires API or server-side FFmpeg.");
}

// ===== QR Generator =====
function generateQR() {
  const text = document.getElementById('qrText').value;
  if (!text) return alert("Enter text!");
  const output = document.getElementById('qrOutput');
  output.innerHTML = "";
  new QRCode(output, { text: text, width: 150, height: 150 });
}

// ===== Timer =====
function startTimer() {
  let time = parseInt(document.getElementById('timerInput').value);
  if (isNaN(time) || time <= 0) return alert("Enter seconds!");
  const display = document.getElementById('timerDisplay');
  display.textContent = time;
  const interval = setInterval(() => {
    time--;
    display.textContent = time;
    if (time <= 0) clearInterval(interval);
  }, 1000);
}
