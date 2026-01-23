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

