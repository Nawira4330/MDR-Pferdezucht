// app.js – MDR-Zucht Paarungsanalyse Exterieur-Matching
// ---------------------------------------------

const MARE_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const STALLION_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let mares = [];
let stallions = [];

const TRAITS = [
  "Kopf",
  "Gebiss",
  "Hals",
  "Halsansatz",
  "Widerrist",
  "Schulter",
  "Brust",
  "Rückenlinie",
  "Rückenlänge",
  "Kruppe",
  "Beinwinkelung",
  "Beinstellung",
  "Fesseln",
  "Hufe",
];

// CSV einlesen und in Objekte umwandeln
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const rows = text.split("\n").map((r) => r.split(","));
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (r[i] || "").trim()));
    return obj;
  });
}

// Daten laden
async function loadData() {
  [mares, stallions] = await Promise.all([fetchCSV(MARE_CSV), fetchCSV(STALLION_CSV)]);

  // 🟩 Nur vollständig ausgefüllte Hengste behalten
  stallions = stallions.filter((stallion) => {
    const hasAll = TRAITS.every((trait) => {
      const key = Object.keys(stallion).find(
        (k) => k.replace(/\s+/g, "").toLowerCase() === trait.toLowerCase()
      );
      const val = key ? (stallion[key] || "").trim() : "";
      return val !== "" && val.includes("|");
    });
    return hasAll;
  });

  fillDropdowns();
}

// Dropdowns füllen
function fillDropdowns() {
  const stuteSelect = document.getElementById("stuteSelect");
  const besitzerSelect = document.getElementById("besitzerSelect");

  stuteSelect.innerHTML = '<option value="">-- Stute wählen --</option>';
  mares.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m["Name"] || `Stute ${i + 1}`;
    stuteSelect.appendChild(opt);
  });

  const owners = [...new Set(mares.map((m) => m["Besitzer"]).filter((x) => x && x !== ""))];
  besitzerSelect.innerHTML = '<option value="">-- Besitzer wählen --</option>';
  owners.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    besitzerSelect.appendChild(opt);
  });

  document.getElementById("sortSelect").addEventListener("change", showResults);
  stuteSelect.addEventListener("change", showResults);
  besitzerSelect.addEventListener("change", showResults);
}

// Genetische Punktetabelle
const FRONT_SCORE = {
  "HH-HH": 4,
  "HH-Hh": 3,
  "HH-hh": 2,
  "Hh-HH": 3,
  "Hh-Hh": 2,
  "Hh-hh": 1,
  "hh-HH": 2,
  "hh-Hh": 1,
  "hh-hh": 0,
};
const BACK_SCORE = {
  "HH-HH": 0,
  "HH-Hh": 1,
  "HH-hh": 2,
  "Hh-HH": 1,
  "Hh-Hh": 2,
  "Hh-hh": 3,
  "hh-HH": 2,
  "hh-Hh": 3,
  "hh-hh": 4,
};

// Normalisierung der Paare (z. B. hH → Hh)
function normalizePair(pair) {
  pair = pair.toUpperCase();
  if (pair === "hH") pair = "Hh";
  if (pair.length !== 2) return "hh";
  return pair;
}

// Genstring aufsplitten und bereinigen
function splitGeneString(str) {
  if (!str) return [];
  str = str.replace(/\s+/g, "").toUpperCase();
  const parts = str.split("|");
  const left = (parts[0] || "").match(/.{1,2}/g) || [];
  const right = (parts[1] || "").match(/.{1,2}/g) || [];
  return [...left, ...right].map(normalizePair);
}

// Score für ein Stute–Hengst-Paar berechnen
function calculateScores(mare, stallion) {
  let best = 0;
  let worst = 0;
  let foundAny = 0;

  TRAITS.forEach((trait) => {
    const mVal = mare[trait];
    const hVal = stallion[trait];
    if (!mVal || !hVal) return;

    const mPairs = splitGeneString(mVal);
    const hPairs = splitGeneString(hVal);
    if (mPairs.length < 8 || hPairs.length < 8) return;

    foundAny++;
    for (let i = 0; i < 8; i++) {
      const combo = `${mPairs[i]}-${hPairs[i]}`;
      if (i < 4) {
        best += FRONT_SCORE[combo] ?? 0;
        worst += BACK_SCORE[combo] ?? 0;
      } else {
        best += BACK_SCORE[combo] ?? 0;
        worst += FRONT_SCORE[combo] ?? 0;
      }
    }
  });

  return { best, worst, max: foundAny * 32 };
}

// Top 3 Hengste für eine Stute finden
function top3Matches(mare, sortMode = "best") {
  const scored = stallions
    .map((stallion) => {
      const result = calculateScores(mare, stallion);
      const range = Math.abs(result.best - result.worst);
      return { ...stallion, ...result, range };
    })
    .filter((x) => x.best > 0 || x.worst > 0);

  switch (sortMode) {
    case "worst":
      scored.sort((a, b) => b.worst - a.worst);
      break;
    case "range":
      scored.sort((a, b) => a.range - b.range);
      break;
    default:
      scored.sort((a, b) => b.best - a.best);
  }

  return scored.slice(0, 3);
}

// Ergebnisse anzeigen
function showResults() {
  const stuteIdx = document.getElementById("stuteSelect").value;
  const ownerSel = document.getElementById("besitzerSelect").value;
  const sortMode = document.getElementById("sortSelect").value;
  const output = document.getElementById("results");
  output.innerHTML = "";

  let maresToShow = [];
  if (stuteIdx) {
    maresToShow = [mares[stuteIdx]];
  } else if (ownerSel) {
    maresToShow = mares.filter((m) => m["Besitzer"] === ownerSel);
  } else {
    maresToShow = mares;
  }

  maresToShow.forEach((mare) => {
    const matches = top3Matches(mare, sortMode);
    const mareName = mare["Name"] || "Unbekannte Stute";
    const mareColor = mare["Farbgenetik"] || "-";
    const owner = mare["Besitzer"] || "-";

    let html = `<div class="mare-block">
      <h3>${mareName}</h3>
      <p><strong>Besitzer:</strong> ${owner}</p>
      <p><strong>Farbgenetik:</strong> ${mareColor}</p>
      <ol class="top3">`;

    const medals = ["🥇", "🥈", "🥉"];
    matches.forEach((m, i) => {
      const pctBest = m.max ? Math.round((m.best / m.max) * 100) : 0;
      const pctWorst = m.max ? Math.round((m.worst / m.max) * 100) : 0;
      html += `<li>${medals[i]} <strong>${m["Name"] || "?"}</strong> 
        — Farbe: ${m["Farbgenetik"] || "-"}
        <div class="score">Best: ${m.best} / Worst: ${m.worst} (${pctBest} % / ${pctWorst} %)</div></li>`;
    });

    html += `</ol></div>`;
    output.innerHTML += html;
  });
}

// Button "Alle anzeigen"
document.getElementById("showAll").addEventListener("click", () => {
  document.getElementById("stuteSelect").value = "";
  document.getElementById("besitzerSelect").value = "";
  showResults();
});

// Start
window.addEventListener("DOMContentLoaded", loadData);
