// ==============================================
// GENETIK-BERECHNUNG – Exterieur-Matching-System
// ==============================================
// Diese Version:
// ✅ Unterstützt robustes Spalten-Matching (auch bei Leerzeichen / Schreibfehlern)
// ✅ Berechnet Scores für jede Stute-Hengst-Kombination individuell
// ✅ Balanciert Stärken (erhalten) und Schwächen (ausgleichen)
// ✅ Zeigt per DEBUG-Ausgabe, ob Daten richtig eingelesen wurden
// ==============================================

// FRONT (HH-Ziel) – Kraft, Typ, Stabilität
const SCORE_FRONT = {
  "HH-HH": 4, "HH-Hh": 3, "HH-hh": 1,
  "Hh-HH": 3, "Hh-Hh": 2, "Hh-hh": 1,
  "hh-HH": 4, "hh-Hh": 3, "hh-hh": 0
};

// BACK (hh-Ziel) – Elastizität, Losgelassenheit
const SCORE_BACK = {
  "HH-HH": 0, "HH-Hh": 2, "HH-hh": 4,
  "Hh-HH": 1, "Hh-Hh": 3, "Hh-hh": 4,
  "hh-HH": 2, "hh-Hh": 3, "hh-hh": 4
};

// Hilfsfunktion: Alle möglichen Fohlenkombinationen (z. B. hh × HH → hH, hH, hH, hH)
function offspringCombos(sPair, hPair) {
  const combos = [];
  if (!sPair || !hPair) return combos;
  for (const s of sPair) for (const h of hPair) combos.push(s + h);
  return combos;
}

// Berechnet Punkte eines einzelnen Genpaars
function getPairScore(isFront, sPair, hPair) {
  const table = isFront ? SCORE_FRONT : SCORE_BACK;
  const combos = offspringCombos(sPair, hPair);
  const vals = combos.map(c => table[c] ?? 0);
  return { best: Math.max(...vals, 0), worst: Math.min(...vals, 0) };
}

// ==============================================
// 🧠 Robustes Spalten-Matching
// ==============================================
function getField(obj, key) {
  const target = key.toLowerCase().replace(/\s/g, "");
  const found = Object.keys(obj).find(
    k => k.toLowerCase().replace(/\s/g, "") === target
  );
  return found ? obj[found] : "";
}

// ==============================================
// 🔬 Hauptfunktion – Scoreberechnung pro Kombination
// ==============================================
function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
    "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
    "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  let totalBest = 0, totalWorst = 0, foundAny = false;

  // --- DEBUG-Start ---
  console.groupCollapsed(`🐎 DEBUG: ${mare.Name} × ${stallion.Name}`);
  // --- DEBUG-Ende ---

  for (const trait of TRAITS) {
    const mareVal = (getField(mare, trait) || "").replace(/\s+/g, "");
    const stallVal = (getField(stallion, trait) || "").replace(/\s+/g, "");

    if (!mareVal || !stallVal) continue;
    if (!mareVal.includes("|") || !stallVal.includes("|")) continue;
    foundAny = true;

    const [mFront, mBack] = mareVal.split("|");
    const [hFront, hBack] = stallVal.split("|");

    const toPairs = s => (s.match(/.{1,2}/g) || []).slice(0, 8);
    const mFrontPairs = toPairs(mFront);
    const mBackPairs = toPairs(mBack);
    const hFrontPairs = toPairs(hFront);
    const hBackPairs = toPairs(hBack);

    let traitBest = 0, traitWorst = 0;

    // Vordere 4 (Ziel HH)
    for (let i = 0; i < 4; i++) {
      const { best, worst } = getPairScore(true, mFrontPairs[i], hFrontPairs[i]);
      traitBest += best; traitWorst += worst;
    }

    // Hintere 4 (Ziel hh)
    for (let i = 0; i < 4; i++) {
      const { best, worst } = getPairScore(false, mBackPairs[i], hBackPairs[i]);
      traitBest += best; traitWorst += worst;
    }

    totalBest += traitBest;
    totalWorst += traitWorst;

    console.log(`➡️ ${trait}: best ${traitBest}, worst ${traitWorst}`);
  }

  console.groupEnd();

  return foundAny ? { best: totalBest, worst: totalWorst } : { best: 0, worst: 0 };
}
