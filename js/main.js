// main.js – Initialisierung & Eventlistener

let mares = [];
let stallions = [];

document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadData();
  mares = data.mares;
  stallions = data.stallions;

  const mareSelect = document.getElementById("mareSelect");
  const ownerSelect = document.getElementById("ownerSelect");
  const sortSelect = document.getElementById("sortSelect");
  const allBtn = document.getElementById("showAll");

  // 🔹 Dropdowns befüllen
  [...new Set(mares.map(m => m.Name).filter(Boolean))].forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    mareSelect.appendChild(opt);
  });

  [...new Set(mares.map(m => m.Besitzer).filter(Boolean))].forEach(owner => {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    ownerSelect.appendChild(opt);
  });

  function updateResults() {
    const mareName = mareSelect.value;
    const ownerName = ownerSelect.value;
    const sortOpt = sortSelect.value;
    renderResults(mares, stallions, mareName, ownerName, sortOpt);
  }

  // 🔹 Events
  mareSelect.addEventListener("change", updateResults);
  ownerSelect.addEventListener("change", updateResults);
  sortSelect.addEventListener("change", updateResults);
  allBtn.addEventListener("click", () => {
    renderResults(mares, stallions, null, null, sortSelect.value);
  });

  // 🔹 Initialanzeige
  renderResults(mares, stallions, null, null, "range");
});
