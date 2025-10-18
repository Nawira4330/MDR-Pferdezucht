// ==========================
// 🎨 ui.js
// Rendert Stuten- & Hengst-Ergebnisse
// ==========================

const UI = (() => {
  /**
   * Hauptfunktion zum Anzeigen der Ergebnisse
   * @param {string} selectedMare - Name der ausgewählten Stute (optional)
   * @param {string} selectedOwner - Name des Besitzers (optional)
   * @param {string} sortMode - Sortiermodus ("best", "worst", "range")
   */
  function showResults(selectedMare = "", selectedOwner = "", sortMode = "best") {
    const container = document.getElementById("results");
    container.innerHTML = "";

    if (!window.mares || !window.stallions) {
      container.innerHTML = "<p style='color:red;'>❌ Daten konnten nicht geladen werden.</p>";
      return;
    }

    // --- Filtern nach Auswahl ---
    let filteredMares = window.mares;

    if (selectedMare) {
      filteredMares = filteredMares.filter((m) => m["Name"] === selectedMare);
    } else if (selectedOwner) {
      filteredMares = filteredMares.filter((m) => m["Besitzer"] === selectedOwner);
    }

    if (filteredMares.length === 0) {
      container.innerHTML = `
        <p style="text-align:center; color:#777;">Keine passenden Stuten gefunden.</p>
      `;
      return;
    }

    // --- Jede Stute anzeigen ---
    filteredMares.forEach((mare) => {
      const mareCard = document.createElement("div");
      mareCard.className = "mare-card";

      // Titel und Besitzer
      const mareName = mare["Name"] || "(Unbenannt)";
      const owner = mare["Besitzer"] || "Unbekannt";
      const color = mare["Farbgenetik"] || "-";

      mareCard.innerHTML = `
        <h3>${mareName}</h3>
        <p><strong>Besitzer:</strong> ${owner}</p>
        <p>${color}</p>
      `;

      // --- Hengst-Berechnung ---
      const stallionResults = [];

      window.stallions.forEach((stallion) => {
        const geneticsScore = calculateScores(mare, stallion);
        if (geneticsScore.best > 0 || geneticsScore.worst > 0) {
          stallionResults.push({
            name: stallion["Name"] || "(Unbekannt)",
            color: stallion["Farbgenetik"] || "-",
            best: geneticsScore.best,
            worst: geneticsScore.worst,
          });
        }
      });

      if (stallionResults.length === 0) {
        mareCard.innerHTML += `<p style="color:#888;">Keine genetisch passenden Hengste gefunden.</p>`;
      } else {
        // --- Sortierung ---
        if (sortMode === "best") {
          stallionResults.sort((a, b) => b.best - a.best);
        } else if (sortMode === "worst") {
          stallionResults.sort((a, b) => b.worst - a.worst);
        } else if (sortMode === "range") {
          stallionResults.sort((a, b) => (a.best - a.worst) - (b.best - b.worst));
        }

        // --- Nur Top 3 ---
        const top3 = stallionResults.slice(0, 3);

        // --- Anzeige ---
        top3.forEach((stallion, index) => {
          const medal = ["🥇", "🥈", "🥉"][index] || "";
          const entry = document.createElement("div");
          entry.className = "stallion-entry";

          entry.innerHTML = `
            <span>${medal} ${stallion.name}</span>
            <span class="tag">${stallion.color}</span>
            <span class="score">Best: ${stallion.best} / Worst: ${stallion.worst}</span>
          `;
          mareCard.appendChild(entry);
        });
      }

      container.appendChild(mareCard);
    });
  }

  /**
   * Berechnet Score zwischen Stute & Hengst
   * (delegiert an Genetics-Modul)
   */
  function calculateScores(mare, stallion) {
    if (typeof Genetics === "undefined" || !Genetics.comparePair) {
      console.error("❌ Genetics-Modul nicht gefunden!");
      return { best: 0, worst: 0 };
    }
    return Genetics.calculateScores(mare, stallion);
  }

  // Öffentlich machen
  return { showResults };
})();
