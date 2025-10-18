// ==========================
// 🎨 ui.js
// Darstellung, Filterung & Sortierung
// ==========================

function renderResults(mares, stallions, selectedMare, selectedOwner, sortOption) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  const filteredMares = mares.filter(
    m =>
      (!selectedMare || m.Name === selectedMare) &&
      (!selectedOwner || m.Besitzer === selectedOwner)
  );

  if (filteredMares.length === 0) {
    resultsContainer.innerHTML =
      "<p style='text-align:center;color:#777;'>Keine passenden Stuten gefunden.</p>";
    return;
  }

  filteredMares.forEach(mare => {
    const mareDiv = document.createElement("div");
    mareDiv.classList.add("mare-card");

    mareDiv.innerHTML = `
      <h3>${mare.Name}</h3>
      <p><b>Besitzer:</b> ${mare.Besitzer || "-"}</p>
      <p>${mare.Farbgenetik ? mare.Farbgenetik : ""}</p>
    `;

    // 🔹 Berechne Score für jeden Hengst
    const stallionScores = stallions
      .map(stallion => ({
        stallion,
        score: Genetics.calculateScores(mare, stallion),
      }))
      .filter(s => s.score.best > 0 || s.score.worst > 0);

    // 🔹 Sortierung
    stallionScores.sort((a, b) => {
      if (sortOption === "best") return b.score.best - a.score.best;
      if (sortOption === "worst") return b.score.worst - a.score.worst;
      const rangeA = a.score.best - a.score.worst;
      const rangeB = b.score.best - b.score.worst;
      return rangeA - rangeB;
    });

    // 🔹 Top 3
    const top3 = stallionScores.slice(0, 3);
    if (top3.length === 0) {
      mareDiv.innerHTML += "<p style='color:#888;'>Keine passenden Hengste gefunden.</p>";
    }

    top3.forEach((entry, i) => {
      const medal = ["🥇", "🥈", "🥉"][i];
      const stallionName =
        entry.stallion.Name && entry.stallion.Name.trim() !== ""
          ? entry.stallion.Name
          : "(Unbekannt)";
      const stallionColor =
        entry.stallion.Farbgenetik ||
        entry.stallion["Farbe"] ||
        "-";

      const sDiv = document.createElement("div");
      sDiv.classList.add("stallion-entry");
      sDiv.innerHTML = `
        <p>${medal} <b>${stallionName}</b>
        <span class="tag">${stallionColor}</span>
        <span class="score">Best: ${entry.score.best} / Worst: ${entry.score.worst}</span></p>
      `;
      mareDiv.appendChild(sDiv);
    });

    resultsContainer.appendChild(mareDiv);
  });
}

window.renderResults = renderResults;
