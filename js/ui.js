// ui.js – Darstellung & Logik für Ergebnisanzeige
const UI = {
  render(mares, stallions, selMare, selOwner, sortOpt) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    // 🔹 Filtere nach Auswahl
    const filteredMares = mares.filter(
      m =>
        (!selMare || m.Name === selMare) &&
        (!selOwner || m.Besitzer === selOwner)
    );

    if (!filteredMares.length) {
      results.innerHTML = "<p style='text-align:center;color:#777;'>Keine passenden Stuten gefunden.</p>";
      return;
    }

    // 🔹 Jede Stute einzeln mit ALLEN Hengsten vergleichen
    filteredMares.forEach(mare => {
      const mareDiv = document.createElement("div");
      mareDiv.className = "mare-card";

      mareDiv.innerHTML = `
        <h3>${mare.Name}</h3>
        <p><b>Besitzer:</b> ${mare.Besitzer || "-"}<br>
        <b>Farbgenetik:</b> ${mare.Farbgenetik || "-"}</p>
      `;

      // 🔹 Für jeden Hengst Score berechnen
      const stallionScores = stallions.map(stallion => {
        const score = Genetics.calculate(mare, stallion);
        return { stallion, score };
      });

      // 🔹 Sortierung: Best / Worst / Kleinste Range
      stallionScores.sort((a, b) => {
        if (sortOpt === "best") {
          return b.score.best - a.score.best; // absteigend nach best
        } else if (sortOpt === "worst") {
          return b.score.worst - a.score.worst; // absteigend nach worst
        } else {
          // Kleinste Range (Differenz zwischen best & worst)
          const rangeA = a.score.best - a.score.worst;
          const rangeB = b.score.best - b.score.worst;
          return rangeA - rangeB; // aufsteigend: kleinere Range besser
        }
      });

      // 🔹 Nur die Top 3 anzeigen
      stallionScores.slice(0, 3).forEach((entry, i) => {
        const medal = ["🥇", "🥈", "🥉"][i];
        const stallion = entry.stallion;
        const color = stallion.Farbgenetik || "-";
        const best = entry.score.best.toFixed(1);
        const worst = entry.score.worst.toFixed(1);

        const sDiv = document.createElement("div");
        sDiv.className = "stallion-entry";
        sDiv.innerHTML = `
          ${medal} <b>${stallion.Name || "(Unbekannt)"}</b>
          <span class="tag">${color}</span>
          <span class="score">Best: ${best} / Worst: ${worst}</span>
        `;
        mareDiv.appendChild(sDiv);
      });

      results.appendChild(mareDiv);
    });
  },
};

window.UI = UI;
