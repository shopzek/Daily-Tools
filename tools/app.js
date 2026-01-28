// ================= ELEMENTS =================
const dropZone  = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileInfo  = document.getElementById("fileInfo");
const extractBtn = document.getElementById("extractBtn");
const zipBtn     = document.getElementById("zipBtn");
const output     = document.getElementById("output");

// ================= SAFETY CHECK =================
if (!dropZone || !fileInput || !extractBtn || !zipBtn) {
  console.error("❌ HTML elements not found. Check IDs.");
}

// ================= CLICK TO SELECT =================
dropZone.addEventListener("click", () => {
  fileInput.click();
});

// ================= FILE SELECT =================
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    fileInfo.textContent = `${fileInput.files.length} file(s) selected`;
  }
});

// ================= DRAG & DROP =================
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
  fileInput.files = e.dataTransfer.files;
  fileInfo.textContent = `${fileInput.files.length} file(s) selected`;
});

// ================= CONVERT FILES TO ZIP =================
zipBtn.addEventListener("click", async () => {

  if (!fileInput.files.length) {
    alert("Please select files first");
    return;
  }

  const zip = new JSZip();

  for (const file of fileInput.files) {
    zip.file(file.name, file);
  }

  output.innerHTML = "Creating ZIP...";

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);

  output.innerHTML = `
    <a href="${url}" download="files.zip">
      ⬇ Download ZIP
    </a>
  `;
});

// ================= EXTRACT ZIP =================
extractBtn.addEventListener("click", async () => {

  if (!fileInput.files.length) {
    alert("Select a ZIP file");
    return;
  }

  const file = fileInput.files[0];

  if (!file.name.endsWith(".zip")) {
    alert("Please select a ZIP file");
    return;
  }

  output.innerHTML = "Extracting ZIP...";

  const zip = await JSZip.loadAsync(file);
  output.innerHTML = "";

  for (const name in zip.files) {
    const fileData = await zip.files[name].async("blob");
    const url = URL.createObjectURL(fileData);

    output.innerHTML += `
      <p>
        📄 ${name} –
        <a href="${url}" download="${name}">Download</a>
      </p>
    `;
  }
});
