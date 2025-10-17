// ===============================
// Paarungsanalyse – MDR-Zucht 2025
// ===============================

// Google Sheets CSV URLs
const STUTEN_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

// Globale Variablen
let mares = [];
let stallions = [];

// =============== CSV LADEN ===============
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

// =============== INIT ===============
async function init() {
  [mares, stallions] = await Promise.all([loadCSV(STUTEN_URL), loadCSV(HENGSTE_URL)]);
  populateDropdowns();
  document.getElementById("mareSelect").addEventListener("change", showSelectedMare);
  document.getElementById("ownerSelect").addEventListener("change", showByOwner);
  document.getElementById("showAll").addEventListener("click", showAllResults);
  setupTabs();
  setupInfoToggle();
}

// =============== DROPDOWNS ===============
function populateDropdowns() {
  const mareSelect = document.getElementById("mareSelect");
  const ownerSelect = document.getElementById("ownerSelect");

  mareSelect.innerHTML = '<option value="">– Stute wählen –</option>';
  ownerSelect.innerHTML = '<option value="">– Besitzer wählen –</option>';

  const owners = new Set();

  mares.forEach((mare) => {
    const name = mare["Name"]?.trim();
    const owner = mare["Besitzer"]?.trim();
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

// =============== ANZEIGE ===============
function showSelectedMare() {
  const mareName = document.getElementById("mareSelect").value;
  if (!mareName) return;
  const mare = mares.find((m) => m["Name"] === mareName);
  if (mare) displayResults([mare]);
}

function showByOwner() {
  const ownerName = document.getElementById("ownerSelect").value;
  if (!ownerName) return;
  const owned = mares.filter((m) => m["Besitzer"] === ownerName);
  displayResults(owned);
}

function showAllResults() {
  displayResults(mares);
}

// =============== SCORE-BERECHNUNG ===============
function calculateBestWorstScore(mare, stallion) {
  const traits = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter", "Brust", "Rückenlinie",
    "Rückenlänge", "Kruppe", "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  let bestTotal = 0;
  let worstTotal = 0;

  for (const trait of traits) {
    const mareVal = (mare[trait] || "").replace(/\s+/g, "");
    const stallionVal = (stallion[trait] || "").replace(/\s+/g, "");
    if (!mareVal.includes("|") || !stallionVal.includes("|")) continue;

    const [mareFront, mareBack] = mareVal.split("|");
    const [stallionFront, stallionBack] = stallionVal.split("|");

    const marePairs = (mareFront.match(/.{1,2}/g) || []).concat(mareBack.match(/.{1,2}/g) || []);
    const stallionPairs = (stallionFront.match(/.{1,2}/g) || []).concat(stallionBack.match(/.{1,2}/g) || []);

    let traitBest = 0;
    let traitWorst = 0;

    for (let i = 0; i < 8; i++) {
      const m = marePairs[i];
      const s = stallionPairs[i];
      const { best, worst } = scorePairBestWorst(i < 4, m, s);
      traitBest += best;
      traitWorst += worst;
    }

    bestTotal += traitBest;
    worstTotal += traitWorst;
  }

  return { bestTotal, worstTotal };
}

// Bewertung einzelner Genpaare (beste + schlechteste mögliche Kombination)
function scorePairBestWorst(isFront, m, s) {
  if (!m || !s) return { best: 0, worst: 0 };

  // Alle möglichen Weitergaben (z. B. Hh → H oder h)
  const mareGenes = m.split("");
  const stallionGenes = s.split("");

  const combinations = [];
  for (const ma of mareGenes) {
    for (const st of stallionGenes) {
      combinations.push(ma + st);
    }
  }

  const tableFront = {
    "HH": 4, "Hh": 3, "hH": 3, "hh": 2 // vorne HH-Ziel
  };
  const tableBack = {
    "HH": 0, "Hh": 1, "hH": 1, "hh": 4 // hinten hh-Ziel
  };

  const table = isFront ? tableFront : tableBack;
  const scores = combinations.map((g) => table[g] ?? 0);

  return {
    best: Math.max(...scores),
    worst: Math.min(...scores)
  };
}

// =============== TOP 3 ANZEIGE ===============
function displayResults(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  list.forEach((mare) => {
    const mareCard = document.createElement("div");
    mareCard.classList.add("card");

    const title = document.createElement("h3");
    title.innerHTML = `${mare["Name"]} <span class="badge">${mare["Farbgenetik"] || "-"}</span>`;
    mareCard.appendChild(title);

    const owner = document.createElement("p");
    owner.innerHTML = `<strong>Besitzer:</strong> ${mare["Besitzer"] || "-"}`;
    mareCard.appendChild(owner);

    // individuelle Scores für alle Hengste
    const scored = stallions.map((stallion) => {
      const { bestTotal, worstTotal } = calculateBestWorstScore(mare, stallion);
      return {
        name: stallion["Name"],
        color: stallion["Farbgenetik"],
        best: bestTotal,
        worst: worstTotal
      };
    });

    // Top 3 nach bestem Score
    const top3 = scored.sort((a, b) => b.best - a.best).slice(0, 3);

    const ul = document.createElement("ul");
    ul.classList.add("toplist");

    const medals = ["🥇", "🥈", "🥉"];

    top3.forEach((h, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span><span class="medal">${medals[i]}</span>${h.name}</span>
        <span>
          <span class="badge">${h.color || "-"}</span> 
          <span class="score">Fohlen: Best ${h.best} / Worst ${h.worst}</span>
        </span>`;
      ul.appendChild(li);
    });

    mareCard.appendChild(ul);
    container.appendChild(mareCard);
  });
}

// =============== INFOBOX LOGIK ===============
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

// =============== START ===============
init();
