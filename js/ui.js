// ui.js – Anzeige der Ergebnisse & Sortierung

const UI = {
  render(mares, stallions, selMare, selOwner, sortOpt) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    // 🔹 Filterung nach Stute / Besitzer
    const filtered = mares.filter(
      m =>
        (!selMare || m.Name === selMare) &&
        (!selOwner || m.Besitzer === selOwner)
    );

    if (!filtered.length) {
      results.innerHTML =
        "<p style='text-align:center;color:#777;'>Keine passenden Stuten gefunden.</p>";
      return;
    }

    // 🔹 Für jede gefilterte Stute
    filtered.forEach(mare => {
      const div = document.createElement("div");
      div.className = "mare-card";

      div.innerHTML = `
        <h3>${mare.Name}</h3>
        <p><b>Besitzer:</b> ${mare.Besitzer || "-"}<br>
        <b>Farbgenetik:</b> ${mare.Farbgenetik || "-"}</p>
      `;

      // 🔹 Scores für alle Hengste berechnen
      const scores = stallions
        .filter(s => s.Name && s.Kopf) // nur vollständige Hengste
        .map(s => ({
          stallion: s,
          score: Genetics.calculate(mare, s)
        }))
        .filter(s => s.score.best > 0); // nur relevante Ergebnisse

      if (!scores.length) {
        div.innerHTML +=
          "<p style='color:#888;font-style:italic;'>Keine genetischen Daten verfügbar.</p>";
        results.appendChild(div);
        return;
      }

      // 🔹 Sortierung
      if (sortOpt === "best")
        scores.sort((a, b) => b.score.best - a.score.best);
      else if (sortOpt === "worst")
        scores.sort((a, b) => a.score.worst - b.score.worst);
      else {
        const range = s => s.score.best - s.score.worst;
        scores.sort((a, b) => range(a) - range(b));
      }

      // 🔹 Top 3 anzeigen
      scores.slice(0, 3).forEach((entry, i) => {
        const medal = ["🥇", "🥈", "🥉"][i];
        const stallionName =
          entry.stallion.Name?.trim() || "(Unbekannt)";
        const colorTag =
          entry.stallion.Farbgenetik?.trim() || "-";

        div.innerHTML += `
          <div class="stallion-entry">
            ${medal} <b>${stallionName}</b>
            <span class="tag">${colorTag}</span>
            <span class="score">
              Best: ${entry.score.best.toFixed(1)} /
              Worst: ${entry.score.worst.toFixed(1)}
            </span>
          </div>
        `;
      });

      results.appendChild(div);
    });
  }
};

window.UI = UI;
