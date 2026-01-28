document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ ZIP Tool JS loaded");

  const dropZone   = document.getElementById("dropZone");
  const fileInput  = document.getElementById("fileInput");
  const fileInfo   = document.getElementById("fileInfo");
  const extractBtn = document.getElementById("extractBtn");
  const zipBtn     = document.getElementById("zipBtn");
  const output     = document.getElementById("output");

  let selectedFiles = []; // ✅ SAFE STORAGE

  /* CLICK TO OPEN FILE PICKER */
  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  /* FILE SELECT */
  fileInput.addEventListener("change", () => {
    selectedFiles = Array.from(fileInput.files);
    fileInfo.textContent = `${selectedFiles.length} file(s) selected`;
  });

  /* DRAG & DROP */
  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    selectedFiles = Array.from(e.dataTransfer.files);
    fileInfo.textContent = `${selectedFiles.length} file(s) selected`;
  });

  /* CONVERT FILES TO ZIP */
  zipBtn.addEventListener("click", async () => {

    if (!selectedFiles.length) {
      alert("Please select files first");
      return;
    }

    const zip = new JSZip();

    selectedFiles.forEach(file => {
      zip.file(file.name, file);
    });

    output.innerHTML = "Creating ZIP file...";

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    output.innerHTML = `
      <a href="${url}" download="files.zip">
        ⬇ Download ZIP
      </a>
    `;
  });

  /* EXTRACT ZIP */
  extractBtn.addEventListener("click", async () => {

    if (!selectedFiles.length) {
      alert("Please select a ZIP file");
      return;
    }

    const file = selectedFiles[0];

    if (!file.name.toLowerCase().endsWith(".zip")) {
      alert("Selected file is not a ZIP");
      return;
    }

    output.innerHTML = "Extracting ZIP...";

    const zip = await JSZip.loadAsync(file);
    output.innerHTML = "";

    for (const name in zip.files) {

      if (zip.files[name].dir) continue;

      const blob = await zip.files[name].async("blob");
      const url = URL.createObjectURL(blob);

      output.innerHTML += `
        <p>
          📄 ${name} —
          <a href="${url}" download="${name}">Download</a>
        </p>
      `;
    }
  });

});
