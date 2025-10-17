// ===============================
// Google Sheet Quellen (CSV)
// ===============================
const MARE_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const STALLION_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let mares = [];
let stallions = [];
let currentMares = []; // aktuell gefilterte Stuten

// ===============================
// CSV laden & parsen
// ===============================
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const [head, ...rows] = text
    .trim()
    .split("\n")
    .map((r) => r.split(","));
  return rows.map((r) =>
    Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ? r[i].trim() : ""]))
  );
}

async function loadData() {
  [mares, stallions] = await Promise.all([
    fetchCSV(MARE_CSV),
    fetchCSV(STALLION_CSV),
  ]);

  // === Exterieur-Merkmale ===
  const TRAITS = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
    "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
    "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  // === Hengste ohne Werte in allen Merkmalen ignorieren ===
  stallions = stallions.filter((stallion) => {
    return TRAITS.some((trait) => {
      const key = Object.keys(stallion).find(
        (k) => k.replace(/\s+/g, "").toLowerCase() === trait.toLowerCase()
      );
      const val = key ? (stallion[key] || "").trim() : "";
      return val !== "";
    });
  });

  fillDropdowns();
}

// ===============================
// Dropdowns füllen
// ===============================
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

// ===============================
// Genetik-Scoring-System
// ===============================

// Score-Tabelle (vorne / hinten)
const SCORE_FRONT = {
  "HH-HH": 4, "HH-Hh": 3, "HH-hh": 2,
  "Hh-HH": 3, "Hh-Hh": 2, "Hh-hh": 1,
  "hh-HH": 2, "hh-Hh": 1, "hh-hh": 0,
};

const SCORE_BACK = {
  "HH-HH": 0, "HH-Hh": 1, "HH-hh": 2,
  "Hh-HH": 1, "Hh-Hh": 2, "Hh-hh": 3,
  "hh-HH": 2, "hh-Hh": 3, "hh-hh": 4,
};

// Alle möglichen Fohlenkombinationen
function offspringCombos(sPair, hPair) {
  const combos = [];
  for (const s of sPair) for (const h of hPair) combos.push(s + h);
  return combos;
}

// Score-Berechnung pro Paar
function getPairScore(isFront, sPair, hPair) {
  const combos = offspringCombos(sPair, hPair);
  const table = isFront ? SCORE_FRONT : SCORE_BACK;
  const vals = combos.map((c) => table[c] ?? 0);
  return { best: Math.max(...vals), worst: Math.min(...vals) };
}

// ===============================
// Hauptbewertung
// ===============================
function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
    "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
    "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  function getField(obj, key) {
    const keys = Object.keys(obj);
    const found = keys.find(
      (k) => k.replace(/\s+/g, "").toLowerCase() === key.toLowerCase()
    );
    return found ? obj[found] : "";
  }

  let best = 0, worst = 0, foundAny = false;

  for (const t of TRAITS) {
    const m = (getField(mare, t) || "").replace(/\s+/g, "");
    const h = (getField(stallion, t) || "").replace(/\s+/g, "");
    if (!m.includes("|") || !h.includes("|")) continue;
    foundAny = true;

    const [mf, mb] = m.split("|");
    const [hf, hb] = h.split("|");

    // Leerzeichen entfernen & in Zweiergruppen aufteilen
    const mPairs = (mf.match(/.{1,2}/g) || []).concat(mb.match(/.{1,2}/g) || []);
    const hPairs = (hf.match(/.{1,2}/g) || []).concat(hb.match(/.{1,2}/g) || []);

    for (let i = 0; i < 8; i++) {
      const { best: b, worst: w } = getPairScore(i < 4, mPairs[i], hPairs[i]);
      best += b;
      worst += w;
    }
  }

  return foundAny ? { best, worst } : { best: 0, worst: 0 };
}

// ===============================
// Ergebnisse anzeigen
// ===============================
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

// ===============================
// Filter-Events
// ===============================
document.getElementById("mareSelect").addEventListener("change", () => {
  const mName = document.getElementById("mareSelect").value;
  const m = mares.find((x) => x.Name === mName);
  currentMares = m ? [m] : [];
  if (currentMares.length) showResults(currentMares);
});

document.getElementById("ownerSelect").addEventListener("change", () => {
  const o = document.getElementById("ownerSelect").value;
  currentMares = mares.filter((m) => m.Besitzer === o);
  if (currentMares.length) showResults(currentMares);
});

document.getElementById("showAll").addEventListener("click", () => {
  currentMares = mares;
  showResults(currentMares);
});

// Sortierung sofort neu anwenden
document.getElementById("sortSelect").addEventListener("change", () => {
  if (currentMares.length) showResults(currentMares);
});

// ===============================
// Info-Tabs (aufklappbar)
// ===============================
document.getElementById("toggleInfo").addEventListener("click", () => {
  document.getElementById("infoTabs").classList.toggle("hidden");
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const id = tab.dataset.tab;
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  });
});

// ===============================
// Start
// ===============================
loadData();
