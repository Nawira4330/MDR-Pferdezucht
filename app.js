// app.js – Exterieur-Fohlenanalyse nach genetischem Ideal (HH vorne, hh hinten)
const STUTEN_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let stuten = [];
let hengste = [];

const MERKMALE = [
  "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust",
  "Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"
];

// CSV einlesen
async function ladeCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const [header, ...rows] = text.trim().split(/\r?\n/).map(r => r.split(","));
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || "").trim()])));
}

// Genetik-Parsing: Leerzeichen & "|" ignorieren → in 8 Paare splitten
function parseGeneString(str) {
  if (!str) return [];
  const clean = str.replace(/\s+/g, "").replace("|", "");
  return clean.match(/.{2}/g) || [];
}

// Punktetabellen
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

// mögliche Kind-Genpaare bilden (Vererbung)
function getFoalCombos(mare, stallion) {
  const allelesMare = mare.split("");
  const allelesStallion = stallion.split("");
  let results = [];
  allelesMare.forEach(a => allelesStallion.forEach(b => results.push(a + b)));
  return results;
}

// Score-Berechnung
function berechneScore(stute, hengst) {
  let best = 0, worst = 0;
  for (const merk of MERKMALE) {
    const sGenes = parseGeneString(stute[merk]);
    const hGenes = parseGeneString(hengst[merk]);
    if (sGenes.length !== 8 || hGenes.length !== 8) continue;

    for (let i = 0; i < 8; i++) {
      const front = i < 4;
      const scoreTable = front ? FRONT_SCORE : BACK_SCORE;
      const combos = getFoalCombos(sGenes[i], hGenes[i]);
      const scores = combos.map(c => scoreTable[c] ?? 0);
      best += Math.max(...scores);
      worst += Math.min(...scores);
    }
  }
  return { best, worst };
}

// Dropdowns
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

// Anzeige
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
              <span class="score">Score: ${h.best} / ${h.worst}</span>
            </li>
          `).join("")}
        </ul>
      </div>`;
    results.insertAdjacentHTML("beforeend", html);
  });
}

// Events
document.getElementById("mareSelect").addEventListener("change", zeigeVorschlaege);
document.getElementById("ownerSelect").addEventListener("change", zeigeVorschlaege);
document.getElementById("showAll").addEventListener("click", zeigeVorschlaege);

window.addEventListener("DOMContentLoaded", async () => {
  stuten = await ladeCSV(STUTEN_URL);
  hengste = await ladeCSV(HENGSTE_URL);
  fuelleDropdowns();
});
