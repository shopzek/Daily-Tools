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
