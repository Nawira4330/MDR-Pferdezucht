// ui.js – Anzeige der Ergebnisse
const UI = {
  render(mares, stallions, selMare, selOwner, sortOpt) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    // 🔹 Filter und alphabetische Sortierung
    const filtered = mares
      .filter(m =>
        (!selMare || m.Name === selMare) &&
        (!selOwner || m.Besitzer === selOwner)
      )
      .sort((a, b) => a.Name.localeCompare(b.Name));

    if (!filtered.length) {
      results.innerHTML =
        "<p style='text-align:center;color:#777;'>Keine Stuten gefunden.</p>";
      return;
    }

    // 🔹 Jede Stute individuell berechnen
    filtered.forEach(mare => {
      const mareDiv = document.createElement("div");
      mareDiv.className = "mare-card";
      mareDiv.innerHTML = `
        <h3>${mare.Name}</h3>
        <p><b>Besitzer:</b> ${mare.Besitzer || "-"}<br>
        <b>Farbgenetik:</b> ${mare.Farbgenetik || "-"}</p>
      `;

      // 🔹 Für jede Stute -> alle Hengste neu vergleichen
      const stallionScores = stallions.map(stallion => {
        const score = Genetics.calculate(mare, stallion);
        return {
          stallion: stallion,
          best: score.best,
          worst: score.worst,
          range: score.best - score.worst
        };
      });

      // Debug-Ausgabe zur Kontrolle der Berechnungen
console.group(`🐴 ${mare.Name}`);
stallions.forEach(s => {
  const score = Genetics.calculate(mare, s);
  console.log(
    `${s.Name} → Best: ${score.best.toFixed(2)}, Worst: ${score.worst.toFixed(2)}`
  );
});
console.groupEnd();


      // 🔹 Sortierung nach Auswahl
      if (sortOpt === "best") {
        stallionScores.sort((a, b) => b.best - a.best);
      } else if (sortOpt === "worst") {
        stallionScores.sort((a, b) => a.worst - b.worst);
      } else if (sortOpt === "range") {
        stallionScores.sort((a, b) => a.range - b.range);
      }

      // 🔹 Top 3 Hengste für diese Stute
      const top3 = stallionScores.slice(0, 3);

      top3.forEach((entry, index) => {
        const medal = ["🥇", "🥈", "🥉"][index];
        const best = entry.best.toFixed(2);
        const worst = entry.worst.toFixed(2);

        const sDiv = document.createElement("div");
        sDiv.className = "stallion-entry";
        sDiv.innerHTML = `
          ${medal} <b>${entry.stallion.Name || "(Unbekannt)"}</b>
          <span class="tag">${entry.stallion.Farbgenetik || "-"}</span>
          <span class="score">Best: ${best} Worst: ${worst} </span>
        `;
        mareDiv.appendChild(sDiv);
      });

      results.appendChild(mareDiv);
    });
  }
};

window.UI = UI;
