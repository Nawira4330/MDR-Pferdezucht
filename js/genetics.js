// ==============================================
// GENETIK-LOGIK – Balance-Algorithmus (Erhaltung + Ausgleich)
// ==============================================

// VORDERER BEREICH (Ziel HH) – Kraft, Typ, Ausdruck
// → Stärken (HH) schützen, Schwächen (hh) ausgleichen
const SCORE_FRONT = {
  "HH-HH": 4, // perfekt erhalten
  "HH-Hh": 3, // leicht abgeschwächt, aber stabil
  "HH-hh": 1, // schwächt zu stark ab
  "Hh-HH": 3, // unterstützt Stärke
  "Hh-Hh": 2, // neutral
  "Hh-hh": 1, // verliert Stabilität
  "hh-HH": 4, // idealer Ausgleich
  "hh-Hh": 3, // teils ausgeglichen
  "hh-hh": 0, // schwach + schwach = keine Verbesserung
};

// HINTERER BEREICH (Ziel hh) – Elastizität, Losgelassenheit
// → Weiche Strukturen erhalten, zu harte ausgleichen
const SCORE_BACK = {
  "HH-HH": 0, // zu hart
  "HH-Hh": 2, // etwas besser
  "HH-hh": 4, // idealer Ausgleich
  "Hh-HH": 1, // zu fest
  "Hh-Hh": 3, // gute Balance
  "Hh-hh": 4, // ideal weich
  "hh-HH": 2, // noch stabil, aber härter
  "hh-Hh": 3, // perfekt erhalten
  "hh-hh": 4, // optimale Weichheit erhalten
};

// Kombiniert die Allele (z. B. hh + HH = [hH, hH, hH, hH])
function offspringCombos(sPair, hPair) {
  const combos = [];
  for (const s of sPair) for (const h of hPair) combos.push(s + h);
  return combos;
}

// Berechnet Score pro Gen-Paar
function getPairScore(isFront, sPair, hPair) {
  const combos = offspringCombos(sPair, hPair);
  const table = isFront ? SCORE_FRONT : SCORE_BACK;
  const vals = combos.map((c) => table[c] ?? 0);
  return { best: Math.max(...vals), worst: Math.min(...vals) };
}

// ==============================================
// Hauptfunktion zur Berechnung des Gesamtscores
// ==============================================
function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
    "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
    "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  function getField(obj, key) {
    const found = Object.keys(obj).find(
      (k) => k.replace(/\s+/g, "").toLowerCase() === key.toLowerCase()
    );
    return found ? obj[found] : "";
  }

  let totalBest = 0;
  let totalWorst = 0;
  let foundAny = false;

  for (const trait of TRAITS) {
    let mareVal = (getField(mare, trait) || "").replace(/\s+/g, "");
    let stallionVal = (getField(stallion, trait) || "").replace(/\s+/g, "");
    if (!mareVal || !stallionVal || !mareVal.includes("|") || !stallionVal.includes("|"))
      continue;
    foundAny = true;

    // Front und Back trennen
    const [mFront, mBack] = mareVal.split("|");
    const [hFront, hBack] = stallionVal.split("|");

    const mFrontPairs = mFront.match(/.{1,2}/g) || [];
    const mBackPairs = mBack.match(/.{1,2}/g) || [];
    const hFrontPairs = hFront.match(/.{1,2}/g) || [];
    const hBackPairs = hBack.match(/.{1,2}/g) || [];

    let traitBest = 0, traitWorst = 0;

    // Vordere 4 Paare (Ziel HH)
    for (let i = 0; i < 4; i++) {
      const mPair = mFrontPairs[i];
      const hPair = hFrontPairs[i];
      if (!mPair || !hPair) continue;
      const { best, worst } = getPairScore(true, mPair, hPair);
      traitBest += best;
      traitWorst += worst;
    }

    // Hintere 4 Paare (Ziel hh)
    for (let i = 0; i < 4; i++) {
      const mPair = mBackPairs[i];
      const hPair = hBackPairs[i];
      if (!mPair || !hPair) continue;
      const { best, worst } = getPairScore(false, mPair, hPair);
      traitBest += best;
      traitWorst += worst;
    }

    totalBest += traitBest;
    totalWorst += traitWorst;
  }

  return foundAny ? { best: totalBest, worst: totalWorst } : { best: 0, worst: 0 };
}
