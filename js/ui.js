// ===============================
// UI – Dropdowns, Anzeige, Tabs
// ===============================
let currentMares = [];

function fillDropdowns() {
  const mareSel = document.getElementById("mareSelect");
  mares.forEach((m) => {
    const o = document.createElement("option");
    o.textContent = m.Name;
    o.value = m.Name;
    mareSel.appendChild(o);
  });

  const ownerSel = document.getElementById("ownerSelect");
  [...new Set(mares.map((m) => m.Besitzer))].forEach((oName) => {
    const o = document.createElement("option");
    o.textContent = oName;
    o.value = oName;
    ownerSel.appendChild(o);
  });
}

function showResults(filteredMares) {
  const sort = document.getElementById("sortSelect").value;
  const res = document.getElementById("results");
  res.innerHTML = "";

  filteredMares.forEach((m) => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <h2>${m.Name}</h2>
      <div class="owner">Besitzer: ${m.Besitzer}</div>
      <div><span class="badge">${m.Farbgenetik || "-"}</span></div>
    `;

    const scores = stallions.map((s) => {
      const sc = calculateScores(m, s);
      return { s, ...sc, diff: sc.best - sc.worst };
    });

    let sorted = scores;
    if (sort === "best") sorted = scores.sort((a, b) => b.best - a.best);
    else if (sort === "worst") sorted = scores.sort((a, b) => b.worst - a.worst);
    else sorted = scores.sort((a, b) => a.diff - b.diff);

    sorted.slice(0, 3).forEach((r, i) => {
      const rank = ["🥇", "🥈", "🥉"][i];
      const stDiv = document.createElement("div");
      stDiv.className = "stallion";
      stDiv.innerHTML = `
        <div>${rank} ${r.s.Name}</div>
        <div><span class="badge">${r.s.Farbgenetik || "-"}</span></div>
        <div class="score">Best: ${r.best} / Worst: ${r.worst}</div>
      `;
      card.appendChild(stDiv);
    });

    res.appendChild(card);
  });
}
