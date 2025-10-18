// Anzeige der Ergebnisse
const UI = {
  render(mares, stallions, selMare, selOwner, sortOpt) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    const filtered = mares
      .filter(m =>
        (!selMare || m.Name === selMare) &&
        (!selOwner || m.Besitzer === selOwner)
      )
      .sort((a, b) => a.Name.localeCompare(b.Name)); // alphabetisch sortiert

    if (!filtered.length) {
      results.innerHTML =
        "<p style='text-align:center;color:#777;'>Keine Stuten gefunden.</p>";
      return;
    }

    filtered.forEach(mare => {
      const div = document.createElement("div");
      div.className = "mare-card";
      div.innerHTML = `<h3>${mare.Name}</h3>
        <p><b>Besitzer:</b> ${mare.Besitzer || "-"}<br>
        <b>Farbgenetik:</b> ${mare.Farbgenetik || "-"}</p>`;

      const scores = stallions.map(s => ({
        stallion: s,
        score: Genetics.calculate(mare, s)
      }));

      // Sortierung
      if (sortOpt === "best") scores.sort((a, b) => b.score.best - a.score.best);
      else if (sortOpt === "worst") scores.sort((a, b) => b.score.worst - a.score.worst);
      else scores.sort((a, b) =>
        (a.score.best - a.score.worst) - (b.score.best - b.score.worst)
      );

      // Top 3 anzeigen
      scores.slice(0, 3).forEach((entry, i) => {
        const medal = ["🥇", "🥈", "🥉"][i];
        const best = entry.score.best.toFixed(2);
        const worst = entry.score.worst.toFixed(2);

        div.innerHTML += `
          <div class="stallion-entry">
            ${medal} <b>${entry.stallion.Name || "(Unbekannt)"}</b>
            <span class="tag">${entry.stallion.Farbgenetik || "-"}</span>
            <span class="score">Best: ${best} Worst: ${worst} </span>
          </div>`;
      });

      results.appendChild(div);
    });
  }
};

window.UI = UI;
