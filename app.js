/*******************************
 * MDR Zucht – Top 3 Hengste JS
 * Individuelle Berechnung basierend auf Fohlen-Genetik
 *******************************/

const STUTEN_CSV_URL  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const HENGSTE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

function bust() {
  const d = new Date();
  return `&_ts=${d.getTime()}`;
}

let stuten = [];
let hengste = [];

const MERKMALE = [
  "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust",
  "Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"
];

const NAME_KEYS  = ["Name","Stutenname","Stute","name"];
const OWNER_KEYS = ["Besitzer","Owner","besitzer"];
const COLOR_KEYS = ["Farbgenetik","Farbe","Genetik","color"];

// CSV in Array-Objekte
function parseCSV(text){
  const rows = text.replace(/\r/g,"").trim().split("\n").map(r=>r.split(","));
  const headers = rows.shift().map(h=>h.trim());
  return rows.map(r=>{
    const o={};
    headers.forEach((h,i)=>o[h]=(r[i]||"").trim());
    return o;
  });
}

// Hilfsfunktionen
function pickField(o, keys){ for(const k of keys){ if(o[k]) return o[k]; } return ""; }
function pickName(o){return pickField(o,NAME_KEYS)||"(ohne Name)";}
function pickOwner(o){return pickField(o,OWNER_KEYS)||"(kein Besitzer)";}
function pickColor(o){return pickField(o,COLOR_KEYS)||"-";}
function escapeHtml(s){return String(s).replace(/[&<>"'\/]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;'}[c]));}

// Normalisierung der Genstrings (Leerzeichen + | entfernen)
function normalizeGenString(str){
  if(!str) return "";
  return str.replace(/\s+/g,"").replace(/[;:]/g,"|").trim();
}

// In 8 Paare splitten (4 vorne, 4 hinten)
function toPairs(raw){
  let s = normalizeGenString(raw);
  let [front, back] = s.includes("|") ? s.split("|") : [s.slice(0,8), s.slice(8,16)];
  const split2 = str => (str.match(/.{1,2}/g) || []).slice(0,4);
  const norm = p=>{
    if(!p) return "hh";
    p = p.toUpperCase();
    if(p==="HH") return "HH";
    if(p.includes("H") && p.includes("h")) return "Hh";
    return "hh";
  };
  return {
    front: split2(front).map(norm),
    back:  split2(back).map(norm)
  };
}

/***********************
 * Neue Fohlen-Logik
 ***********************/

// Simuliere alle möglichen Fohlen-Genotypen
function possibleFoalGenes(parentA, parentB) {
  const alleles = { "HH": ["H", "H"], "Hh": ["H", "h"], "hh": ["h", "h"] };
  const a = alleles[parentA] || ["h", "h"];
  const b = alleles[parentB] || ["h", "h"];
  const kids = new Set();
  for (const i of a) {
    for (const j of b) {
      const pair = [i, j].sort().join("");
      if (pair === "HH") kids.add("HH");
      else if (pair === "Hh" || pair === "hH") kids.add("Hh");
      else kids.add("hh");
    }
  }
  return [...kids];
}

// Bewertung der Fohlen-Gene (Idealwert)
function idealScoreForFoalGene(gene, position) {
  // position < 4 => vorne (Ideal HH)
  // position >=4 => hinten (Ideal hh)
  if (position < 4) {
    if (gene === "HH") return 4;
    if (gene === "Hh") return 2;
    return 0;
  } else {
    if (gene === "hh") return 4;
    if (gene === "Hh") return 2;
    return 0;
  }
}

// Berechnet Score einer Stute/Hengst-Kombination (basierend auf dem Fohlen)
function pairingScore(stute, hengst) {
  let total = 0;
  for (const merkmal of MERKMALE) {
    const s = toPairs(stute[merkmal]);
    const h = toPairs(hengst[merkmal]);
    const pairs = [...s.front, ...s.back].map((v, i) => ({
      sGene: v || "hh",
      hGene: i < 4 ? (h.front[i] || "hh") : (h.back[i - 4] || "hh"),
      pos: i
    }));
    for (const p of pairs) {
      const kids = possibleFoalGenes(p.sGene, p.hGene);
      const max = Math.max(...kids.map(k => idealScoreForFoalGene(k, p.pos)));
      total += max;
    }
  }
  return total;
}

// Berechnet best & worst möglichen Fohlenscore
function foalBestWorstTotal(stute, hengst) {
  let best = 0, worst = 0;
  for (const merkmal of MERKMALE) {
    const s = toPairs(stute[merkmal]);
    const h = toPairs(hengst[merkmal]);
    const pairs = [...s.front, ...s.back].map((v, i) => ({
      sGene: v || "hh",
      hGene: i < 4 ? (h.front[i] || "hh") : (h.back[i - 4] || "hh"),
      pos: i
    }));
    for (const p of pairs) {
      const kids = possibleFoalGenes(p.sGene, p.hGene);
      const vals = kids.map(k => idealScoreForFoalGene(k, p.pos));
      best += Math.max(...vals);
      worst += Math.min(...vals);
    }
  }
  return { best, worst };
}

/***********************
 * Anzeige & Filter
 ***********************/

// Dropdowns
function fillDropdowns(){
  const mare=document.getElementById("mareSelect");
  const owner=document.getElementById("ownerSelect");
  mare.innerHTML="<option value=''>-- bitte wählen --</option>";
  owner.innerHTML="<option value=''>-- bitte wählen --</option>";
  stuten.forEach((s,i)=>{
    const opt=document.createElement("option");
    opt.value=i; opt.textContent=pickName(s);
    mare.appendChild(opt);
  });
  const owners=[...new Set(stuten.map(s=>pickOwner(s)))].filter(Boolean);
  owners.forEach(o=>{
    const op=document.createElement("option");
    op.value=o; op.textContent=o;
    owner.appendChild(op);
  });
}

// Karten rendern
function renderCards(list){
  const out=document.getElementById("results");
  if(!list.length){out.innerHTML="<p>Keine Stuten gefunden.</p>";return;}
  out.innerHTML=list.map(st=>{
    const scored=hengste
      .filter(h=>MERKMALE.some(m=>(h[m]||"").trim()!==""))
      .map(h=>{
        const sc=pairingScore(st,h);
        const {best,worst}=foalBestWorstTotal(st,h);
        return {...h,__score:sc,__best:best,__worst:worst};
      })
      .sort((a,b)=>b.__score-a.__score)
      .slice(0,3);
    const medals=["🥇","🥈","🥉"];
    return `
      <article class="card">
        <h3>${escapeHtml(pickName(st))} <span class="badge">${escapeHtml(pickOwner(st))}</span></h3>
        <div class="meta small">Farbgenetik Stute: <strong>${escapeHtml(pickColor(st))}</strong></div>
        <ul class="toplist">
          ${scored.map((h,i)=>`
            <li>
              <span class="medal">${medals[i]}</span>
              <strong>${escapeHtml(pickName(h))}</strong>
              <span class="badge">${escapeHtml(pickColor(h))}</span>
              <span class="score">Score: ${h.__score}</span>
              <span class="subscore">Fohlen: Best ${h.__best} / Worst ${h.__worst}</span>
            </li>`).join("")}
        </ul>
      </article>`;
  }).join("");
}

// Auswahl aktualisieren
function updateSelection(){
  const m=document.getElementById("mareSelect").value;
  const o=document.getElementById("ownerSelect").value;
  let sel=[];
  if(m!==""){const i=parseInt(m,10);if(!isNaN(i)&&stuten[i])sel=[stuten[i]];}
  else if(o!==""){sel=stuten.filter(s=>pickOwner(s)===o);}
  renderCards(sel);
}

// Daten laden
async function loadData(){
  const [stCSV,hgCSV]=await Promise.all([
    fetch(STUTEN_CSV_URL+bust()).then(r=>r.text()),
    fetch(HENGSTE_CSV_URL+bust()).then(r=>r.text())
  ]);
  stuten=parseCSV(stCSV);
  hengste=parseCSV(hgCSV);
  fillDropdowns();
  updateSelection();
}

window.addEventListener("DOMContentLoaded",async()=>{
  document.getElementById("mareSelect").addEventListener("change",updateSelection);
  document.getElementById("ownerSelect").addEventListener("change",updateSelection);
  document.getElementById("showAll").addEventListener("click",()=>renderCards(stuten));
  await loadData();
});
