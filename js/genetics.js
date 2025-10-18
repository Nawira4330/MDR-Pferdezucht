// ===============================
// Genetik-Logik & Scoring
// ===============================

const SCORE_FRONT = {
  "HH-HH": 4, "HH-Hh": 3, "HH-hh": 2,
  "Hh-HH": 3, "Hh-Hh": 2, "Hh-hh": 1,
  "hh-HH": 2, "hh-Hh": 1, "hh-hh": 0,
};

const SCORE_BACK = {
  "HH-HH": 0, "HH-Hh": 1, "HH-hh": 2,
  "Hh-HH": 1, "Hh-Hh": 2, "Hh-hh": 3,
  "hh-HH": 2, "hh-Hh": 3, "hh-hh": 4,
};

function offspringCombos(sPair, hPair) {
  const combos = [];
  for (const s of sPair) for (const h of hPair) combos.push(s + h);
  return combos;
}

function getPairScore(isFront, sPair, hPair) {
  const combos = offspringCombos(sPair, hPair);
  const table = isFront ? SCORE_FRONT : SCORE_BACK;
  const vals = combos.map((c) => table[c] ?? 0);
  return { best: Math.max(...vals), worst: Math.min(...vals) };
}

function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
    "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
    "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  function getField(obj, key) {
    const keys = Object.keys(obj);
    const found = keys.find(
      (k) => k.replace(/\s+/g, "").toLowerCase() === key.toLowerCase()
    );
    return found ? obj[found] : "";
  }

  let best = 0, worst = 0, foundAny = false;

  for (const t of TRAITS) {
    const m = (getField(mare, t) || "").replace(/\s+/g, "");
    const h = (getField(stallion, t) || "").replace(/\s+/g, "");
    if (!m.includes("|") || !h.includes("|")) continue;
    foundAny = true;

    const [mf, mb] = m.split("|");
    const [hf, hb] = h.split("|");

    const mPairs = (mf.match(/.{1,2}/g) || []).concat(mb.match(/.{1,2}/g) || []);
    const hPairs = (hf.match(/.{1,2}/g) || []).concat(hb.match(/.{1,2}/g) || []);

    for (let i = 0; i < 8; i++) {
      const { best: b, worst: w } = getPairScore(i < 4, mPairs[i], hPairs[i]);
      best += b;
      worst += w;
    }
  }

  return foundAny ? { best, worst } : { best: 0, worst: 0 };
}
