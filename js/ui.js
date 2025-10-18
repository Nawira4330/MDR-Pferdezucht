// ui.js – Anzeige und Sortierung der Ergebnisse

const UI = {
  render(mares, stallions, selMare, selOwner, sortOpt) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    // 🔹 Auswahl-Filter anwenden
    const filteredMares = mares
      .filter(m =>
        (!selMare || m.Name === selMare) &&
        (!selOwner || m.Besitzer === selOwner)
      )
      .sort((a, b) => a.Name.localeCompare(b.Name)); // alphabetisch, falls keine Auswahl

    if (!filteredMares.length) {
      results.innerHTML = "<p style='text-align:center;color:#777;'>Keine Stuten gefunden.</p>";
      return;
    }

    // 🔹 Jede Stute einzeln auswerten
    filteredMares.forEach(mare => {
      const card = document.createElement("div");
      card.className = "mare-card";

      card.innerHTML = `
        <h3>${mare.Name}</h3>
        <p><b>Besitzer:</b> ${mare.Besitzer || "-"}<br>
        <b>Farbgenetik:</b> ${mare.Farbgenetik || "-"}</p>
      `;

      // 🔹 Jede Stute mit allen Hengsten vergleichen
      const scoredStallions = stallions.map(stallion => ({
        stallion,
        score: Genetics.calculate(mare, stallion)
      }));

      // 🔹 Sortierung anwenden
      if (sortOpt === "best") {
        scoredStallions.sort((a, b) => b.score.best - a.score.best);
      } else if (sortOpt === "worst") {
        scoredStallions.sort((a, b) => b.score.worst - a.score.worst);
      } else {
        // kleinste Range zuerst (Differenz zwischen Best und Worst)
        scoredStallions.sort(
          (a, b) => (a.score.best - a.score.worst) - (b.score.best - b.score.worst)
        );
      }

      // 🔹 Top 3 Ergebnisse anzeigen
      scoredStallions.slice(0, 3).forEach((entry, i) => {
        const medal = ["🥇", "🥈", "🥉"][i];
        const s = entry.stallion;
        const best = entry.score.best.toFixed(2);
        const worst = entry.score.worst.toFixed(2);

        card.innerHTML += `
          <div class="stallion-entry">
            ${medal} <b>${s.Name || "(Unbekannt)"}</b>
            <span class="tag">${s.Farbgenetik || "-"}</span>
            <span class="score">Best: ${best} / Worst: ${worst}</span>
          </div>
        `;
      });

      results.appendChild(card);
    });
  }
};

window.UI = UI;
