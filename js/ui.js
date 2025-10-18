// ui.js – Darstellung, Filterung & Sortierung

function renderResults(mares, stallions, selectedMare, selectedOwner, sortOption) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  const filteredMares = mares.filter(
    m =>
      (!selectedMare || m.Name === selectedMare) &&
      (!selectedOwner || m.Besitzer === selectedOwner)
  );

  filteredMares.forEach(mare => {
    const mareDiv = document.createElement("div");
    mareDiv.classList.add("mare-card");

    const mareHeader = `
      <h3>${mare.Name}</h3>
      <p><b>Besitzer:</b> ${mare.Besitzer || "-"}</p>
      <p>${mare.Farbgenetik ? mare.Farbgenetik : ""}</p>
    `;
    mareDiv.innerHTML = mareHeader;

    const stallionScores = stallions
      .map(stallion => ({
        stallion,
        score: calculateScores(mare, stallion),
      }))
      .filter(s => s.score.best > 0);

    stallionScores.sort((a, b) => {
      if (sortOption === "best") return b.score.best - a.score.best;
      if (sortOption === "worst") return b.score.worst - a.score.worst;
      const rangeA = a.score.best - a.score.worst;
      const rangeB = b.score.best - b.score.worst;
      return rangeA - rangeB;
    });

    const top3 = stallionScores.slice(0, 3);
    top3.forEach((entry, i) => {
      const medal = ["🥇", "🥈", "🥉"][i];
      const sDiv = document.createElement("div");
      sDiv.classList.add("stallion-entry");
      sDiv.innerHTML = `
        <p>${medal} <b>${entry.stallion.Name || "(Unbekannt)"}</b>
        <span class="tag">${entry.stallion.Farbgenetik || "-"}</span>
        <span class="score">Best: ${entry.score.best} / Worst: ${entry.score.worst}</span></p>
      `;
      mareDiv.appendChild(sDiv);
    });

    resultsContainer.appendChild(mareDiv);
  });
}

window.renderResults = renderResults;
