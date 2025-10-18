// ==========================
// ⚙️ main.js
// Initialisiert die Seite und verknüpft UI mit Daten
// ==========================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 MDR-Zucht: Seite wird initialisiert...");

  // --- Daten laden ---
  const { mares, stallions } = await DataLoader.loadAllData();
  window.mares = mares;
  window.stallions = stallions;

  // --- Dropdowns befüllen ---
  DataLoader.populateDropdowns(mares);
  console.log(`✅ ${mares.length} Stuten und ${stallions.length} Hengste geladen.`);

  // --- Elemente auswählen ---
  const mareSelect = document.getElementById("mareSelect");
  const ownerSelect = document.getElementById("ownerSelect");
  const sortSelect = document.getElementById("sortSelect");
  const showAllBtn = document.getElementById("showAll");

  // --- Standardanzeige: leer, bis etwas gewählt wird ---
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = `
    <div style="text-align:center; color:#777; margin-top:1rem;">
      Bitte wähle eine Stute, einen Besitzer oder „Alle anzeigen“, um Ergebnisse zu sehen.
    </div>
  `;

  // --- Event: Stute ändern ---
  mareSelect.addEventListener("change", () => {
    const selectedMare = mareSelect.value;
    const selectedOwner = ownerSelect.value;
    const sortMode = sortSelect.value;

    console.log(`🐴 Stute ausgewählt: ${selectedMare}`);
    UI.showResults(selectedMare, selectedOwner, sortMode);
  });

  // --- Event: Besitzer ändern ---
  ownerSelect.addEventListener("change", () => {
    const selectedOwner = ownerSelect.value;
    const sortMode = sortSelect.value;

    console.log(`👤 Besitzer ausgewählt: ${selectedOwner}`);
    UI.showResults("", selectedOwner, sortMode);
  });

  // --- Event: Sortierung ändern ---
  sortSelect.addEventListener("change", () => {
    const selectedMare = mareSelect.value;
    const selectedOwner = ownerSelect.value;
    const sortMode = sortSelect.value;

    console.log(`🔀 Sortierung geändert: ${sortMode}`);
    UI.showResults(selectedMare, selectedOwner, sortMode);
  });

  // --- Event: "Alle anzeigen" ---
  showAllBtn.addEventListener("click", () => {
    const sortMode = sortSelect.value;
    console.log("📋 Alle anzeigen (Sortierung:", sortMode, ")");
    UI.showResults("", "", sortMode);
  });
});
