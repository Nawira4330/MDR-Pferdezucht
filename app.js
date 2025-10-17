// ========================================
// Paarungsanalyse – MDR-Zucht 2025 (Fix)
// ========================================

// Quellen der CSV-Daten
const STUTEN_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let mares = [];
let stallions = [];

// ========================================
// Hilfsfunktionen
// ========================================

// CSV-Lader
async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.length > 1).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = (r[i] || "").trim());
    return obj;
  });
}

// ========================================
// Initialisierung
// ========================================
async function init() {
  [mares, stallions] = await Promise.all([loadCSV(STUTEN_URL), loadCSV(HENGSTE_URL)]);
  populateDropdowns();

  document.getElementById("mareSelect").addEventListener("change", showSelectedMare);
  document.getElementById("ownerSelect").addEventListener("change", showByOwner);
  document.getElementById("showAll").addEventListener("click", showAllResults);
  document.getElementById("sortSelect").addEventListener("change", () => {
    const mareName = document.getElementById("mareSelect").value;
    const owner = document.getElementById("ownerSelect").value;
    if (mareName) showSelectedMare();
    else if (owner) showByOwner();
    else showAllResults();
  });
}

// ========================================
// Dropdowns füllen
// ========================================
function populateDropdowns() {
  const mareSel = document.getElementById("mareSelect");
  const ownerSel = document.getElementById("ownerSelect");
  mareSel.innerHTML = '<option value="">– Stute wählen –</option>';
  ownerSel.innerHTML = '<option value="">– Besitzer wählen –</option>';

  const owners = new Set();
  mares.forEach(m => {
    if (m["Name"]) {
      const o = document.createElement("option");
      o.value = m["Name"];
      o.textContent = m["Name"];
      mareSel.appendChild(o);
    }
    if (m["Besitzer"]) owners.add(m["Besitzer"]);
  });
  [...owners].forEach(o => {
    const el = document.createElement("option");
    el.value = o;
    el.textContent = o;
    ownerSel.appendChild(el);
  });
}

// ========================================
// Anzeige-Funktionen
// ========================================
function showSelectedMare() {
  const name = document.getElementById("mareSelect").value;
  if (!name) return;
  const mare = mares.find(m => m["Name"] === name);
  displayResults([mare]);
}

function showByOwner() {
  const owner = document.getElementById("ownerSelect").value;
  if (!owner) return;
  displayResults(mares.filter(m => m["Besitzer"] === owner));
}

function showAllResults() {
  displayResults(mares);
}

// ===============================
// SCORE-LOGIK (Endgültige funktionierende Version)
// ===============================

// Punktetabellen für 2-Buchstaben-Kombis (Vorne = HH-Ziel, Hinten = hh-Ziel)
const SCORE_FRONT = {
  "HH": 4, "Hh": 3, "hH": 3, "hh": 2
};
const SCORE_BACK = {
  "HH": 0, "Hh": 1, "hH": 1, "hh": 4
};

// erzeugt alle 4 möglichen Genkombinationen aus einem Paar (Stute/Hengst)
function offspringCombos(stutePair, hengstPair) {
  const combos = [];
  for (const s of stutePair) {
    for (const h of hengstPair) {
      combos.push(s + h); // z. B. Hh, hh, hH, HH
    }
  }
  return combos;
}

// bewertet ein einzelnes Genpaar
function getPairScore(isFront, stutePair, hengstPair) {
  const combos = offspringCombos(stutePair, hengstPair);
  const table = isFront ? SCORE_FRONT : SCORE_BACK;
  const vals = combos.map(c => table[c] ?? 0);
  return { best: Math.max(...vals), worst: Math.min(...vals) };
}

// Hauptberechnung pro Stute×Hengst
function calculateScores(mare, stallion) {
  const traits = [
    "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust",
    "Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"
  ];
  let best = 0;
  let worst = 0;

  for (const t of traits) {
    let m = (mare[t] || "").replace(/\s+/g, "");
    let h = (stallion[t] || "").replace(/\s+/g, "");
    if (!m.includes("|") || !h.includes("|")) continue;

    const [mf, mb] = m.split("|");
    const [hf, hb] = h.split("|");
    const mPairs = (mf.match(/.{1,2}/g) || []).concat(mb.match(/.{1,2}/g) || []);
    const hPairs = (hf.match(/.{1,2}/g) || []).concat(hb.match(/.{1,2}/g) || []);

    for (let i = 0; i < 8; i++) {
      const front = i < 4;
      const { best: b, worst: w } = getPairScore(front, mPairs[i], hPairs[i]);
      best += b;
      worst += w;
    }
  }
  return { best, worst };
}

// ========================================
// Darstellung
// ========================================
function displayResults(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  const sortOpt = document.getElementById("sortSelect")?.value || "best";

  list.forEach(mare => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${mare["Name"]} <span class="badge">${mare["Farbgenetik"] || "-"}</span></h3>
      <p><strong>Besitzer:</strong> ${mare["Besitzer"] || "-"}</p>
    `;

    const scored = stallions.map(h => {
      const { best, worst } = calcScores(mare, h);
      return { name: h["Name"], color: h["Farbgenetik"], best, worst, range: best - worst };
    });

    // Sortierung
    scored.sort((a, b) => {
      if (sortOpt === "best") return b.best - a.best;
      if (sortOpt === "worst") return b.worst - a.worst;
      if (sortOpt === "range") return a.range - b.range;
      return 0;
    });

    const medals = ["🥇", "🥈", "🥉"];
    const ul = document.createElement("ul");
    ul.classList.add("toplist");
    scored.slice(0, 3).forEach((h, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span><span class="medal">${medals[i]}</span>${h.name}</span>
        <span><span class="badge">${h.color || "-"}</span>
        <span class="score">Best: ${h.best} / Worst: ${h.worst} <span class="range">Δ${h.range}</span></span></span>
      `;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    container.appendChild(card);
  });
}

// Start
init();
