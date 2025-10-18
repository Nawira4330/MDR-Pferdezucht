// ==========================
// ⚙️ main.js
// Initialisierung & Eventlistener
// ==========================

if (!window.DataLoader || !window.Genetics) {
  console.error("❌ DataLoader oder Genetics nicht gefunden! Prüfe Script-Reihenfolge.");
}

let mares = [];
let stallions = [];

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starte Datenimport...");

  const data = await DataLoader.loadData();
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

  // 🔹 Aktualisierung bei Änderungen
  function updateResults() {
    const mareName = mareSelect.value || null;
    const ownerName = ownerSelect.value || null;
    const sortOpt = sortSelect.value;
    renderResults(mares, stallions, mareName, ownerName, sortOpt);
  }

  mareSelect.addEventListener("change", updateResults);
  ownerSelect.addEventListener("change", updateResults);
  sortSelect.addEventListener("change", updateResults);

  allBtn.addEventListener("click", () => {
    renderResults(mares, stallions, null, null, sortSelect.value);
  });

  // 🔹 Startanzeige
  renderResults(mares, stallions, null, null, "range");
});
