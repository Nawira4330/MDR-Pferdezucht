// genetics.js – Berechnet individuelle Scores für jede Stute-Hengst-Kombination

function getField(obj, key) {
  const target = key.toLowerCase().replace(/\s/g, "");
  const found = Object.keys(obj).find(
    k => k.toLowerCase().replace(/\s/g, "") === target
  );
  return found ? obj[found] : "";
}

function normalizeGene(pair) {
  if (!pair) return "hh";
  const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
  const hCount = (clean.match(/H/g) || []).length;
  if (hCount >= 2) return "HH";
  if (hCount === 1) return "Hh";
  return "hh";
}

const FRONT = {
  "HH-HH": 4, "HH-Hh": 3, "HH-hh": 1,
  "Hh-HH": 3, "Hh-Hh": 2, "Hh-hh": 1,
  "hh-HH": 4, "hh-Hh": 3, "hh-hh": 0
};
const BACK = {
  "HH-HH": 0, "HH-Hh": 2, "HH-hh": 4,
  "Hh-HH": 1, "Hh-Hh": 3, "Hh-hh": 4,
  "hh-HH": 2, "hh-Hh": 3, "hh-hh": 4
};
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

function frontScore(m, h)      { return FRONT[`${m}-${h}`] ?? 0; }
function backScore(m, h)       { return BACK[`${m}-${h}`] ?? 0; }
function worstFrontScore(m, h) { return FRONT_WORST[`${m}-${h}`] ?? 0; }
function worstBackScore(m, h)  { return BACK_WORST[`${m}-${h}`] ?? 0; }

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

    const mClean = String(rawM).replace(/["']/g,"").replace(/\s+/g,"").replace(/\uFEFF/g,"").trim();
    const hClean = String(rawH).replace(/["']/g,"").replace(/\s+/g,"").replace(/\uFEFF/g,"").trim();
    if (!mClean || !hClean) continue;

    const mJoined = mClean.split("|").map(p=>p.trim()).filter(Boolean).join("");
    const hJoined = hClean.split("|").map(p=>p.trim()).filter(Boolean).join("");

    const mPairs = (mJoined.match(/.{1,2}/g) || []).slice(0, 8);
    const hPairs = (hJoined.match(/.{1,2}/g) || []).slice(0, 8);
    if (mPairs.length < 8 || hPairs.length < 8) continue;

    const mFront = mPairs.slice(0,4).map(normalizeGene);
    const mBack  = mPairs.slice(4,8).map(normalizeGene);
    const hFront = hPairs.slice(0,4).map(normalizeGene);
    const hBack  = hPairs.slice(4,8).map(normalizeGene);

    let traitBest = 0;
    let traitWorst = 0;

    for (let i = 0; i < 4; i++) {
      traitBest  += frontScore(mFront[i], hFront[i]);
      traitWorst += worstFrontScore(mFront[i], hFront[i]);
    }
    for (let i = 0; i < 4; i++) {
      traitBest  += backScore(mBack[i], hBack[i]);
      traitWorst += worstBackScore(mBack[i], hBack[i]);
    }

    totalBest  += traitBest;
    totalWorst += traitWorst;
  }

  return { best: totalBest, worst: totalWorst };
}

window.calculateScores = calculateScores;
