// genetics.js – Exterieur-Matching: Best/Worst-Score pro Stute×Hengst

// ---------------------------
// Hilfen
// ---------------------------

// robustes Spalten-Matching (ignoriert Leerzeichen & Groß/Klein)
function getField(obj, key) {
  const target = key.toLowerCase().replace(/\s/g, "");
  const found = Object.keys(obj).find(
    k => k.toLowerCase().replace(/\s/g, "") === target
  );
  return found ? obj[found] : "";
}

// Normalisiert ein Genpaar zu genau "HH", "Hh" oder "hh"
// - akzeptiert Eingaben wie "HH", "Hh", "hH", "hh", auch mit Fremdzeichen
function normalizeGene(pair) {
  if (!pair) return "hh";
  const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
  const hCount = (clean.match(/H/g) || []).length;
  if (hCount >= 2) return "HH";
  if (hCount === 1) return "Hh";
  return "hh";
}

// ---------------------------
// Scoring-Tabellen
// ---------------------------
// FRONT (Ziel = HH) – Stärke erhalten, Schwäche ausgleichen
const FRONT = {
  "HH-HH": 4, "HH-Hh": 3, "HH-hh": 1,
  "Hh-HH": 3, "Hh-Hh": 2, "Hh-hh": 1,
  "hh-HH": 4, "hh-Hh": 3, "hh-hh": 0
};

// BACK (Ziel = hh) – Weichheit/Elastizität erhalten, Härte ausgleichen
const BACK = {
  "HH-HH": 0, "HH-Hh": 2, "HH-hh": 4,
  "Hh-HH": 1, "Hh-Hh": 3, "Hh-hh": 4,
  "hh-HH": 2, "hh-Hh": 3, "hh-hh": 4
};

// „Worst“-Bewertungen (schlechteste genetische Richtung)
const FRONT_WORST = {
  "HH-HH": 0, "HH-Hh": 1, "HH-hh": 2,
  "Hh-HH": 1, "Hh-Hh": 2, "Hh-hh": 3,
  "hh-HH": 4, "hh-Hh": 3, "hh-hh": 2
};
const BACK_WORST = {
  "HH-HH": 4, "HH-Hh": 3, "HH-hh": 2,
  "Hh-HH": 3, "Hh-Hh": 2, "Hh-hh": 1,
  "hh-HH": 2, "hh-Hh": 1, "hh-hh": 0
};

// Punkte für ein einzelnes Paar (m = Stute, h = Hengst), je Bereich
function frontScore(m, h)      { return FRONT[`${m}-${h}`] ?? 0; }
function backScore(m, h)       { return BACK[`${m}-${h}`] ?? 0; }
function worstFrontScore(m, h) { return FRONT_WORST[`${m}-${h}`] ?? 0; }
function worstBackScore(m, h)  { return BACK_WORST[`${m}-${h}`] ?? 0; }

// ---------------------------
// Hauptberechnung
// ---------------------------
function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter",
    "Brust","Rückenlinie","Rückenlänge","Kruppe",
    "Beinwinkelung","Beinstellung","Fesseln","Hufe"
  ];

  let totalBest = 0;
  let totalWorst = 0;

  for (const trait of TRAITS) {
    // Rohwerte holen (tolerant)
    const rawM = getField(mare, trait);
    const rawH = getField(stallion, trait);
    if (!rawM || !rawH) continue;

    // reinigen: Anführungszeichen, Whitespaces, BOM raus
    const mClean = String(rawM).replace(/["']/g,"").replace(/\s+/g,"").replace(/\uFEFF/g,"").trim();
    const hClean = String(rawH).replace(/["']/g,"").replace(/\s+/g,"").replace(/\uFEFF/g,"").trim();
    if (!mClean || !hClean) continue;

    // Es können mehrere | vorkommen → alle Teile verbinden
    const mJoined = mClean.split("|").map(p=>p.trim()).filter(Boolean).join("");
    const hJoined = hClean.split("|").map(p=>p.trim()).filter(Boolean).join("");

    // in Zweier-Paare zerlegen → nur 8 Paare verwenden
    const mPairs = (mJoined.match(/.{1,2}/g) || []).slice(0, 8);
    const hPairs = (hJoined.match(/.{1,2}/g) || []).slice(0, 8);
    if (mPairs.length < 8 || hPairs.length < 8) continue;

    const mFront = mPairs.slice(0,4).map(normalizeGene);
    const mBack  = mPairs.slice(4,8).map(normalizeGene);
    const hFront = hPairs.slice(0,4).map(normalizeGene);
    const hBack  = hPairs.slice(4,8).map(normalizeGene);

    let traitBest = 0;
    let traitWorst = 0;

    // vorne (HH-Ziel)
    for (let i = 0; i < 4; i++) {
      traitBest  += frontScore(mFront[i], hFront[i]);
      traitWorst += worstFrontScore(mFront[i], hFront[i]);
    }
    // hinten (hh-Ziel)
    for (let i = 0; i < 4; i++) {
      traitBest  += backScore(mBack[i], hBack[i]);
      traitWorst += worstBackScore(mBack[i], hBack[i]);
    }

    totalBest  += traitBest;
    totalWorst += traitWorst;
  }

  // Max pro Merkmal 32 → gesamt 14*32 = 448
  return { best: totalBest, worst: totalWorst };
}

// make functions global (falls Modulreihenfolge variiert)
window.calculateScores = calculateScores;
