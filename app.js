function openTool(tool){
  const area = document.getElementById("tool-area");
  area.innerHTML = `<h2>${tool.replace(/([A-Z])/g,' $1')}</h2>
  <p>Tool UI will appear here.</p>`;
}
