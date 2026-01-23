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
let timerInterval;

function startTimer() {
  const minutes = document.getElementById("minutes").value;
  let time = minutes * 60;
  const display = document.getElementById("timerDisplay");

  if (!minutes) {
    display.innerText = "Enter minutes";
    return;
  }

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;

    display.innerText =
      String(mins).padStart(2, "0") + ":" +
      String(secs).padStart(2, "0");

    if (time <= 0) {
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
let stopwatchInterval;
let seconds = 0;

function startStopwatch() {
  if (stopwatchInterval) return;

  stopwatchInterval = setInterval(() => {
    seconds++;

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

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
  seconds = 0;
  document.getElementById("stopwatchDisplay").innerText = "00:00:00";
}
