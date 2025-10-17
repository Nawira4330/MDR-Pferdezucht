// Tab-Umschaltung
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
});


// ==== Exterieur-Matching Code ====
const STUTEN_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let stuten = [];
let hengste = [];

const MERKMALE = [
  "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust",
  "Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"
];

// CSV robust laden
async function ladeCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let inQuotes = false, field = "", fields = [];
    for (let c of line) {
      if (c === '"') inQuotes = !inQuotes;
      else if (c === "," && !inQuotes) {
        fields.push(field.trim()); field = "";
      } else field += c;
    }
    fields.push(field.trim());
    const obj = {};
    headers.forEach((h, j) => obj[h] = fields[j] || "");
    rows.push(obj);
  }
  return rows;
}

function parseGeneString(str) {
  if (!str) return [];
  const clean = str.replace(/\s+/g, "").replace("|", "");
  return clean.match(/.{2}/g) || [];
}

const FRONT_SCORE = {
  "HH-HH":4,"HH-Hh":3,"HH-hh":2,
  "Hh-HH":3,"Hh-Hh":2,"Hh-hh":1,
  "hh-HH":2,"hh-Hh":1,"hh-hh":0
};
const BACK_SCORE = {
  "HH-HH":0,"HH-Hh":1,"HH-hh":2,
  "Hh-HH":1,"Hh-Hh":2,"Hh-hh":3,
  "hh-HH":2,"hh-Hh":3,"hh-hh":4
};

function getFoalCombos(mare, stallion) {
  const allelesMare = mare.split("");
  const allelesStallion = stallion.split("");
  let results = [];
  allelesMare.forEach(a => allelesStallion.forEach(b => results.push(a + b)));
  return results;
}

function berechneScore(stute, hengst) {
  let best = 0, worst = 0;
  for (const merk of MERKMALE) {
    const sGenes = parseGeneString(stute[merk]);
    const hGenes = parseGeneString(hengst[merk]);
    if (sGenes.length !== 8 || hGenes.length !== 8) continue;

    for (let i = 0; i < 8; i++) {
      const isFront = i < 4;
      const table = isFront ? FRONT_SCORE : BACK_SCORE;
      const combos = getFoalCombos(sGenes[i], hGenes[i]);
      const scores = combos.map(c => table[c] ?? 0);
      best += Math.max(...scores);
      worst += Math.min(...scores);
    }
  }
  return { best, worst };
}

function fuelleDropdowns() {
  const mareSel = document.getElementById("mareSelect");
  const ownerSel = document.getElementById("ownerSelect");
  mareSel.innerHTML = '<option value="">-- bitte wählen --</option>';
  ownerSel.innerHTML = '<option value="">-- bitte wählen --</option>';

  stuten.forEach((s, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = s.Name;
    mareSel.appendChild(opt);
  });

  [...new Set(stuten.map(s => s.Besitzer))].filter(x => x).forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    ownerSel.appendChild(opt);
  });
}

function zeigeVorschlaege() {
  const mareSel = document.getElementById("mareSelect");
  const ownerSel = document.getElementById("ownerSelect");
  const results = document.getElementById("results");
  results.innerHTML = "";

  let mares = [];
  if (mareSel.value) mares = [stuten[parseInt(mareSel.value)]];
  else if (ownerSel.value) mares = stuten.filter(s => s.Besitzer === ownerSel.value);
  else mares = stuten;

  mares.forEach(stute => {
    const scored = hengste.map(h => {
      const { best, worst } = berechneScore(stute, h);
      return { ...h, best, worst };
    })
    .sort((a, b) => b.best - a.best)
    .slice(0, 3);

    const html = `
      <div class="card">
        <h3>${stute.Name} <span class="badge">${stute.Farbgenetik}</span></h3>
        <p><strong>Besitzer:</strong> ${stute.Besitzer}</p>
        <ul class="toplist">
          ${scored.map((h, i) => `
            <li>
              <span class="medal">${["🥇","🥈","🥉"][i]}</span>
              ${h.Name} <span class="badge">${h.Farbgenetik}</span>
              <span class="score">Fohlen: Best ${h.best} / Worst ${h.worst}</span>
            </li>
          `).join("")}
        </ul>
      </div>`;
    results.insertAdjacentHTML("beforeend", html);
  });
}

document.getElementById("mareSelect").addEventListener("change", zeigeVorschlaege);
document.getElementById("ownerSelect").addEventListener("change", zeigeVorschlaege);
document.getElementById("showAll").addEventListener("click", zeigeVorschlaege);

window.addEventListener("DOMContentLoaded", async () => {
  stuten = await ladeCSV(STUTEN_URL);
  hengste = await ladeCSV(HENGSTE_URL);
  fuelleDropdowns();
});
