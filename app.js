/***********************
 * MDR Zucht — App JS  *
 * Mit deinen bereitgestellten CSV-Links *
 ***********************/

// Deine CSV-Links
const STUTEN_CSV_URL  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

// Hilfsfunktion: Cache-Busting
function bust() {
  const d = new Date();
  return `&_ts=${d.getTime()}`;
}

// Datencontainer
let stuten = [];
let hengste = [];

// Merkmale
const MERKMALE = [
  "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust",
  "Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"
];

// Feldnamenvarianten
const NAME_KEYS = ["Name","Stutenname","Stute","Hengstname","name"];
const OWNER_KEYS = ["Besitzer","Owner","besitzer","owner"];
const COLOR_KEYS = ["Farbgenetik","Farbe","Genetik","color"];

// CSV → JSON
function parseCSV(text){
  const rows = text.replace(/\r/g, "").trim().split("\n").map(r => r.split(","));
  const headers = rows.shift().map(h => h.trim());
  return rows.map(r => {
    const obj = {};
    headers.forEach((h,i) => {
      obj[h] = (r[i] || "").trim();
    });
    return obj;
  });
}

// Feldzugriff
function pickField(o, keys) {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== "") return o[k];
  }
  return "";
}
function pickName(o)  { return pickField(o, NAME_KEYS) || "(ohne Name)"; }
function pickOwner(o) { return pickField(o, OWNER_KEYS) || "(kein Besitzer)"; }
function pickColor(o) { return pickField(o, COLOR_KEYS) || "-"; }

function escapeHtml(s){
  return String(s).replace(/[&<>"'\/]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;','/':'&#47;'
  }[c]));
}

// Parsing der Genetik in Paare
function toPairs(raw){
  if (!raw) return { front: [], back: [] };
  let s = String(raw).replace(/\s+/g, "").trim();
  let frontStr="", backStr="";
  if (s.includes("|")) {
    const parts = s.split("|");
    frontStr = parts[0].trim();
    backStr  = parts[1].trim();
  } else {
    frontStr = s.slice(0,8);
    backStr  = s.slice(8,16);
  }
  const split2 = str => (str.match(/.{1,2}/g) || []).slice(0,4);
  const normPair = p => {
    if (!p || p.length !== 2) return "";
    const a = p[0].toUpperCase(), b = p[1].toLowerCase();
    const sorted = [a, b.toUpperCase()].sort((x,y)=> x==='H' && y!=='H' ? -1 : x===y ? 0 : 1);
    const hh = sorted[0]+sorted[1];
    if (hh === "HH") return "HH";
    if (hh === "Hh" || hh === "hH") return "Hh";
    return "hh";
  };
  return {
    front: split2(frontStr).map(normPair),
    back:  split2(backStr).map(normPair)
  };
}

// Pairing-Score
function frontScorePair(s, h){
  const key = s + h;
  const map = {
    "HHHH":4, "HHHh":3, "HHhh":2,
    "HhHH":3, "HhHh":2, "Hhhh":1,
    "hhHH":2, "hhHh":1, "hhhh":0
  };
  return map[key] ?? 0;
}
function backScorePair(s, h){
  const key = s + h;
  const map = {
    "HHHH":0, "HHHh":1, "HHhh":2,
    "HhHH":1, "HhHh":2, "Hhhh":3,
    "hhHH":2, "hhHh":3, "hhhh":4
  };
  return map[key] ?? 0;
}

// Gesamt-Score einer Stute + eines Hengstes
function pairingScore(stute, hengst){
  let total = 0;
  for (const m of MERKMALE) {
    const s = toPairs(stute[m]);
    const h = toPairs(hengst[m]);
    for (let i=0;i<4;i++){
      total += frontScorePair(s.front[i] || "hh", h.front[i] || "hh");
      total += backScorePair(s.back[i] || "hh", h.back[i] || "hh");
    }
  }
  return total;
}

// Best/Worst möglicher Fohlen-Score (über alle Merkmale)
function childGenotypes(parent, other){
  const alleles = {
    "HH": ["H","H"], "Hh": ["H","h"], "hh": ["h","h"]
  };
  const p = alleles[parent] || ["h","h"];
  const o = alleles[other]  || ["h","h"];
  const outs = new Set();
  p.forEach(a => o.forEach(b => {
    const pair = [a,b].sort((x,y)=> x==='H' && y!=='H' ? -1 : x===y ? 0 : 1).join("");
    if (pair === "HH") outs.add("HH");
    else if (pair === "Hh" || pair === "hH") outs.add("Hh");
    else outs.add("hh");
  }));
  return Array.from(outs);
}
function childPointsFront(c){
  if (c === "HH") return 4;
  if (c === "Hh") return 2;
  return 0;
}
function childPointsBack(c){
  if (c === "hh") return 4;
  if (c === "Hh") return 2;
  return 0;
}
function foalBestWorstForPairs(sp, hp){
  const {front: sf, back: sb} = sp;
  const {front: hf, back: hb} = hp;
  let best = 0, worst = 0;
  for (let i=0;i<4;i++){
    const kidsF = childGenotypes(sf[i]||"hh", hf[i]||"hh");
    const valsF = kidsF.map(childPointsFront);
    best += Math.max(...valsF);
    worst += Math.min(...valsF);
    const kidsB = childGenotypes(sb[i]||"hh", hb[i]||"hh");
    const valsB = kidsB.map(childPointsBack);
    best += Math.max(...valsB);
    worst += Math.min(...valsB);
  }
  return {best, worst};
}
function foalBestWorstTotal(stute, hengst){
  let best = 0, worst = 0;
  for (const m of MERKMALE) {
    const sp = toPairs(stute[m]);
    const hp = toPairs(hengst[m]);
    const bw = foalBestWorstForPairs(sp, hp);
    best += bw.best;
    worst += bw.worst;
  }
  return {best, worst};
}

// Aufbau Dropdowns
function fillDropdowns(){
  const mare = document.getElementById("mareSelect");
  const owner = document.getElementById("ownerSelect");
  mare.innerHTML = "<option value=''>-- bitte wählen --</option>";
  owner.innerHTML = "<option value=''>-- bitte wählen --</option>";

  stuten.forEach((s,i)=>{
    const o = document.createElement("option");
    o.value = i;
    o.textContent = pickName(s);
    mare.appendChild(o);
  });
  const owners = [...new Set(stuten.map(s=>pickOwner(s)))].filter(o=>o);
  owners.forEach(o=>{
    const op = document.createElement("option");
    op.value = o;
    op.textContent = o;
    owner.appendChild(op);
  });
}

// Rendering der Karten
function renderCards(stList){
  const out = document.getElementById("results");
  if (stList.length === 0) {
    out.innerHTML = "<p>Keine Stuten ausgewählt.</p>";
    return;
  }
  out.innerHTML = stList.map(st => {
    const scored = hengste
      .filter(h => MERKMALE.some(m => (h[m]||"").trim()!==""))
      .map(h => {
        const sc = pairingScore(st, h);
        const {best, worst} = foalBestWorstTotal(st, h);
        return {...h, __score: sc, __best: best, __worst: worst};
      })
      .sort((a,b)=>b.__score - a.__score)
      .slice(0,3);

    const stName  = escapeHtml(pickName(st));
    const stOwner = escapeHtml(pickOwner(st));
    const stColor = escapeHtml(pickColor(st));

    const medals = ["🥇","🥈","🥉"];
    const listHtml = scored.map((h,i) => {
      return `
        <li>
          <span class="medal">${medals[i] || "•"}</span>
          <strong>${escapeHtml(pickName(h))}</strong>
          <span class="badge">${escapeHtml(pickColor(h))}</span>
          <span class="score">${h.__score}</span>
          <span class="subscore">Fohlen: Best ${h.__best} / Worst ${h.__worst}</span>
        </li>
      `;
    }).join("");

    return `
      <article class="card">
        <h3>${stName} <span class="badge">${stOwner}</span></h3>
        <div class="meta small">Farbgenetik Stute: <strong>${stColor}</strong></div>
        <ul class="toplist">
          ${listHtml || `<li>Keine passenden Hengste gefunden.</li>`}
        </ul>
      </article>
    `;
  }).join("");
}

// Update-Auswahl
function updateBySelection(){
  const ms = document.getElementById("mareSelect").value;
  const os = document.getElementById("ownerSelect").value;
  let sel = [];
  if (ms !== "") {
    const idx = parseInt(ms,10);
    if (!isNaN(idx) && stuten[idx]) sel = [stuten[idx]];
  } else if (os !== "") {
    sel = stuten.filter(s => pickOwner(s) === os);
  }
  renderCards(sel);
}

// Laden + Initialisieren
async function loadData(){
  const urlSt = STUTEN_CSV_URL + bust();
  const urlHg = HENGSTE_CSV_URL + bust();
  const [csvSt, csvHg] = await Promise.all([
    fetch(urlSt, {cache:"no-store"}).then(r => r.text()),
    fetch(urlHg, {cache:"no-store"}).then(r => r.text())
  ]);
  stuten  = parseCSV(csvSt);
  hengste = parseCSV(csvHg);
  fillDropdowns();
  updateBySelection();
}

// Automatische stündliche Refresh
function setupHourlyRefresh(){
  setInterval(loadData, 60*60*1000);
}

// Info Fenster Toggle
function setupInfoToggle(){
  const btn = document.getElementById("infoToggle");
  const box = document.getElementById("infoBox");
  btn.addEventListener("click", ()=>{
    if (box.hasAttribute("hidden")) {
      box.removeAttribute("hidden");
      btn.setAttribute("aria-expanded","true");
    } else {
      box.setAttribute("hidden","");
      btn.setAttribute("aria-expanded","false");
    }
  });
}

// DOM ready
window.addEventListener("DOMContentLoaded", async ()=>{
  setupInfoToggle();
  document.getElementById("mareSelect").addEventListener("change", updateBySelection);
  document.getElementById("ownerSelect").addEventListener("change", updateBySelection);
  document.getElementById("showAll").addEventListener("click", ()=> renderCards(stuten));

  await loadData();
  setupHourlyRefresh();
});
