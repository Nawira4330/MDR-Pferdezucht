// main.js – Initialisierung & Event-Handling

let mares = [];
let stallions = [];

// ===============================
// Initialisierung nach Laden der Seite
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starte Datenimport...");

  // Sicherstellen, dass DataLoader und Genetics geladen sind
  if (typeof DataLoader === "undefined" || typeof calculateScores === "undefined") {
    console.error("❌ DataLoader oder Genetics nicht gefunden! Prüfe Script-Reihenfolge.");
    return;
  }

  // Daten laden
  const data = await DataLoader.loadData();
  mares = data.mares;
  stallions = data.stallions;

  // Dropdowns befüllen
  const mareSelect = document.getElementById("mareSelect");
  const ownerSelect = document.getElementById("ownerSelect");
  const sortSelect = document.getElementById("sortSelect");
  const allBtn = document.getElementById("showAll");

  // 🔹 Stuten-Dropdown
  [...new Set(mares.map(m => m.Name).filter(Boolean))].forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    mareSelect.appendChild(opt);
  });

  // 🔹 Besitzer-Dropdown
  [...new Set(mares.map(m => m.Besitzer).filter(Boolean))].forEach(owner => {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    ownerSelect.appendChild(opt);
  });

  // ===============================
  // Funktion: Ergebnisse aktualisieren
  // ===============================
  function updateResults() {
    const mareName = mareSelect.value;
    const ownerName = ownerSelect.value;
    const sortOpt = sortSelect.value;

    renderResults(mares, stallions, mareName, ownerName, sortOpt);
  }

  // ===============================
  // Events
  // ===============================
  mareSelect.addEventListener("change", updateResults);
  ownerSelect.addEventListener("change", updateResults);
  sortSelect.addEventListener("change", updateResults);

  allBtn.addEventListener("click", () => {
    renderResults(mares, stallions, null, null, sortSelect.value);
  });

  // ===============================
  // Initialanzeige (alle Stuten)
  // ===============================
  renderResults(mares, stallions, null, null, "range");
});
