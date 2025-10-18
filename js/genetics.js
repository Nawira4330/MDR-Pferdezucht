// genetics.js – Berechnet die Exterieur-Kompatibilität zwischen Stute & Hengst

/**
 * Berechne Score für eine Stute–Hengst-Kombination
 * @param {object} mare - Stutenobjekt
 * @param {object} stallion - Hengstobjekt
 * @returns {object} { best: number, worst: number }
 */
function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter",
    "Brust","Rückenlinie","Rückenlänge","Kruppe",
    "Beinwinkelung","Beinstellung","Fesseln","Hufe"
  ];

  let totalBest = 0;
  let totalWorst = 0;

  for (const trait of TRAITS) {
    const rawM = getField(mare, trait);
    const rawH = getField(stallion, trait);
    if (!rawM || !rawH) continue;

    // Säubere Werte (entferne Anführungszeichen, Leerzeichen, BOM)
    const mareVal = rawM.replace(/["']/g, "").replace(/\s+/g, "").replace(/\uFEFF/g, "").trim();
    const stallVal = rawH.replace(/["']/g, "").replace(/\s+/g, "").replace(/\uFEFF/g, "").trim();

    // Robust: mehrere "|" möglich -> alles verbinden
    const mParts = mareVal.split("|").map(p => p.trim()).filter(Boolean);
    const hParts = stallVal.split("|").map(p => p.trim()).filter(Boolean);
    const mJoined = mParts.join("");
    const hJoined = hParts.join("");

    // In Zweierpaare zerlegen, nur die ersten 8 Paare verwenden
    const mPairs = (mJoined.match(/.{1,2}/g) || []).slice(0, 8);
    const hPairs = (hJoined.match(/.{1,2}/g) || []).slice(0, 8);

    if (mPairs.length < 8 || hPairs.length < 8) continue;

    const mFront = mPairs.slice(0, 4);
    const mBack = mPairs.slice(4, 8);
    const hFront = hPairs.slice(0, 4);
    const hBack = hPairs.slice(4, 8);

    let bestTrait = 0;
    let worstTrait = 0;

    // --- Bewertung vorne (Ziel HH) ---
    for (let i = 0; i < 4; i++) {
      const m = normalizeGene(mFront[i]);
      const h = normalizeGene(hFront[i]);
      bestTrait += frontScore(m, h);
      worstTrait += worstFrontScore(m, h);
    }

    // --- Bewertung hinten (Ziel hh) ---
    for (let i = 0; i < 4; i++) {
      const m = normalizeGene(mBack[i]);
      const h = normalizeGene(hBack[i]);
      bestTrait += backScore(m, h);
      worstTrait += worstBackScore(m, h);
    }

    totalBest += bestTrait;
    totalWorst += worstTrait;
  }

  return { best: totalBest, worst: totalWorst };
}

/**
 * Normalisiert ein Genpaar wie 'hH' oder 'HH' zu standardisierten Großbuchstaben.
 */
function normalizeGene(pair) {
  if (!pair) return "hh";
  return pair.replace(/[^Hh]/g, "").substring(0, 2).toUpperCase();
}

// --- Frontbereich (Ziel = HH) ---
function frontScore(m, h) {
  const table = {
    "HHHH": 4, "HHHh": 3, "HHhh": 2,
    "HhHH": 3, "HhHh": 2, "Hhhh": 1,
    "hhHH": 2, "hhHh": 1, "hhhh": 0
  };
  return table[m + h] ?? 0;
}

// --- Hinten (Ziel = hh) ---
function backScore(m, h) {
  const table = {
    "HHHH": 0, "HHHh": 1, "HHhh": 2,
    "HhHH": 1, "HhHh": 2, "Hhhh": 3,
    "hhHH": 2, "hhHh": 3, "hhhh": 4
  };
  return table[m + h] ?? 0;
}

// --- Worst (umgekehrte Bewertung, also schlechte Ergänzung) ---
function worstFrontScore(m, h) {
  const table = {
    "HHHH": 0, "HHHh": 1, "HHhh": 2,
    "HhHH": 1, "HhHh": 2, "Hhhh": 3,
    "hhHH": 4, "hhHh": 3, "hhhh": 2
  };
  return table[m + h] ?? 0;
}

function worstBackScore(m, h) {
  const table = {
    "HHHH": 4, "HHHh": 3, "HHhh": 2,
    "HhHH": 3, "HhHh": 2, "Hhhh": 1,
    "hhHH": 2, "hhHh": 1, "hhhh": 0
  };
  return table[m + h] ?? 0;
}
