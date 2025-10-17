// ===============================
// Paarungsanalyse – MDR-Zucht 2025
// ===============================

// CSV URLs
const STUTEN_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let mares = [];
let stallions = [];

// ===============================
// CSV LADEN
// ===============================
async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.split("\n").map((r) => r.split(","));
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.length > 1)
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (r[i] || "").trim();
      });
      return obj;
    });
}

// ===============================
// INITIALISIERUNG
// ===============================
async function init() {
  [mares, stallions] = await Promise.all([
    loadCSV(STUTEN_URL),
    loadCSV(HENGSTE_URL),
  ]);
  populateDropdowns();
  setupTabs();
  setupInfoToggle();

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

// ===============================
// DROPDOWNS
// ===============================
function populateDropdowns() {
  const mareSelect = document.getElementById("mareSelect");
  const ownerSelect = document.getElementById("ownerSelect");

  mareSelect.innerHTML = '<option value="">– Stute wählen –</option>';
  ownerSelect.innerHTML = '<option value="">– Besitzer wählen –</option>';

  const owners = new Set();
  mares.forEach((mare) => {
    const name = mare["Name"];
    const owner = mare["Besitzer"];
    if (name) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      mareSelect.appendChild(opt);
    }
    if (owner) owners.add(owner);
  });

  [...owners].forEach((owner) => {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    ownerSelect.appendChild(opt);
  });
}

// ===============================
// AUSWAHL
// ===============================
function showSelectedMare() {
  const mareName = document.getElementById("mareSelect").value;
  if (!mareName) return;
  const mare = mares.find((m) => m["Name"] === mareName);
  if (mare) displayResults([mare]);
}

function showByOwner() {
  const owner = document.getElementById("ownerSelect").value;
  if (!owner) return;
  const list = mares.filter((m) => m["Besitzer"] === owner);
  displayResults(list);
}

function showAllResults() {
  displayResults(mares);
}

// ===============================
// SCORE-LOGIK
// ===============================

// Bewertungstabelle
const SCORE_TABLE = {
  front: {
    "HHHH": 4, "HHHh": 3, "HhHH": 3, "Hhhh": 2,
    "HhHh": 2, "Hhhh": 1, "hhHH": 2, "hhHh": 1, "hhhh": 0,
  },
  back: {
    "HHHH": 0, "HHHh": 1, "HhHH": 1, "Hhhh": 2,
    "HhHh": 2, "Hhhh": 3, "hhHH": 2, "hhHh": 3, "hhhh": 4,
  }
};

// Liefert alle möglichen Fohlen-Genotypen aus einem Paar
function getOffspringCombos(stutePair, hengstPair) {
  const combos = [];
  for (const a of stutePair) {
    for (const b of hengstPair) {
      combos.push(a + b);
    }
  }
  return combos;
}

function getPairScore(isFront, stutePair, hengstPair) {
  const combos = getOffspringCombos(stutePair, hengstPair);
  const table = isFront ? SCORE_TABLE.front : SCORE_TABLE.back;
  const values = combos.map((c) => table[c] ?? 0);
  return {
    best: Math.max(...values),
    worst: Math.min(...values),
  };
}

function calculateScores(mare, stallion) {
  const traits = [
    "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter",
    "Brust","Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung",
    "Beinstellung","Fesseln","Hufe"
  ];

  let best = 0;
  let worst = 0;

  for (const trait of traits) {
    const mareVal = (mare[trait] || "").replace(/\s+/g, "");
    const stallionVal = (stallion[trait] || "").replace(/\s+/g, "");
    if (!mareVal.includes("|") || !stallionVal.includes("|")) continue;

    const [mFront, mBack] = mareVal.split("|");
    const [sFront, sBack] = stallionVal.split("|");

    const marePairs = (mFront.match(/.{1,2}/g) || []).concat(mBack.match(/.{1,2}/g) || []);
    const stallionPairs = (sFront.match(/.{1,2}/g) || []).concat(sBack.match(/.{1,2}/g) || []);

    for (let i = 0; i < 8; i++) {
      const front = i < 4;
      const { best: b, worst: w } = getPairScore(front, marePairs[i], stallionPairs[i]);
      best += b;
      worst += w;
    }
  }

  return { best, worst };
}

// ===============================
// ANZEIGE
// ===============================
function displayResults(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const sortOption = document.getElementById("sortSelect")?.value || "best";

  list.forEach((mare) => {
    const mareCard = document.createElement("div");
    mareCard.classList.add("card");

    mareCard.innerHTML = `
      <h3>${mare["Name"]} <span class="badge">${mare["Farbgenetik"] || "-"}</span></h3>
      <p><strong>Besitzer:</strong> ${mare["Besitzer"] || "-"}</p>
    `;

    const scored = stallions.map((stallion) => {
      const { best, worst } = calculateScores(mare, stallion);
      return {
        name: stallion["Name"],
        color: stallion["Farbgenetik"],
        best,
        worst,
        range: best - worst,
      };
    });

    scored.sort((a, b) => {
      if (sortOption === "best") return b.best - a.best;
      if (sortOption === "worst") return b.worst - a.worst;
      if (sortOption === "range") return a.range - b.range;
      return 0;
    });

    const top3 = scored.slice(0, 3);

    const medals = ["🥇", "🥈", "🥉"];
    const ul = document.createElement("ul");
    ul.classList.add("toplist");

    top3.forEach((h, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span><span class="medal">${medals[i]}</span>${h.name}</span>
        <span>
          <span class="badge">${h.color || "-"}</span>
          <span class="score">
            Best: ${h.best} / Worst: ${h.worst} 
            <span class="range">Δ${h.range}</span>
          </span>
        </span>`;
      ul.appendChild(li);
    });

    mareCard.appendChild(ul);
    container.appendChild(mareCard);
  });
}

// ===============================
// INFOBOX
// ===============================
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
}

function setupInfoToggle() {
  const toggle = document.getElementById("toggleInfo");
  const box = document.getElementById("infoContainer");
  toggle.addEventListener("click", () => {
    box.classList.toggle("hidden");
    toggle.textContent = box.classList.contains("hidden")
      ? "ℹ️ Info & Score-Erklärung anzeigen"
      : "🔽 Info & Score-Erklärung ausblenden";
  });
}

init();
