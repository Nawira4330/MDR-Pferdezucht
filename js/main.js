// main.js – Initialisierung und Eventsteuerung

let mares = [];
let stallions = [];

// 🌟 Startpunkt
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starte Datenimport...");

  // Prüfe ob DataLoader & Genetics existieren
  if (typeof DataLoader === "undefined" || typeof Genetics === "undefined") {
    console.error("❌ DataLoader oder Genetics nicht gefunden! Prüfe Script-Reihenfolge.");
    return;
  }

  try {
    console.log("📥 Lade Daten von Google Sheets ...");
    const data = await DataLoader.load();

    mares = data.mares;
    stallions = data.stallions;

    console.log(`✅ Stuten geladen: ${mares.length}`, mares);
    console.log(`✅ Hengste geladen: ${stallions.length}`, stallions);

    // Dropdown-Elemente
    const mareSelect = document.getElementById("mareSelect");
    const ownerSelect = document.getElementById("ownerSelect");
    const sortSelect = document.getElementById("sortSelect");
    const allBtn = document.getElementById("showAll");

    // 🔹 Dropdown: Stuten
    const mareNames = [...new Set(mares.map(m => m.Name).filter(Boolean))].sort();
    mareNames.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      mareSelect.appendChild(opt);
    });

    // 🔹 Dropdown: Besitzer
    const owners = [...new Set(mares.map(m => m.Besitzer).filter(Boolean))].sort();
    owners.forEach(owner => {
      const opt = document.createElement("option");
      opt.value = owner;
      opt.textContent = owner;
      ownerSelect.appendChild(opt);
    });

    // 🔹 Ergebnisaktualisierung
    function updateResults() {
      const mareName = mareSelect.value || null;
      const ownerName = ownerSelect.value || null;
      const sortOpt = sortSelect.value || "best";

      // 🔸 Wenn keine Stute gewählt ist → alphabetisch sortieren
      let maresToRender = mares;
      if (!mareName) {
        maresToRender = [...mares].sort((a, b) => a.Name.localeCompare(b.Name, "de"));
      }

      UI.render(maresToRender, stallions, mareName, ownerName, sortOpt);
    }

    // 🔹 Event Listener
    mareSelect.addEventListener("change", updateResults);
    ownerSelect.addEventListener("change", updateResults);
    sortSelect.addEventListener("change", updateResults);

    allBtn.addEventListener("click", () => {
      // Alphabetisch sortieren bei "Alle anzeigen"
      const maresSorted = [...mares].sort((a, b) => a.Name.localeCompare(b.Name, "de"));
      UI.render(maresSorted, stallions, null, null, sortSelect.value);
    });

    // 🔹 Initialanzeige – alphabetisch sortiert
    const maresSorted = [...mares].sort((a, b) => a.Name.localeCompare(b.Name, "de"));
    UI.render(maresSorted, stallions, null, null, "best");

  } catch (err) {
    console.error("❌ Fehler beim Laden der Daten:", err);
    alert("Fehler beim Laden der Daten. Bitte prüfe die Konsole für Details.");
  }
});
