// genetics.js – Mendelbasierte Berechnung der Fohlen-Genetik

function getField(obj, key) {
  const target = key.toLowerCase().replace(/\s/g, "");
  const found = Object.keys(obj).find(
    k => k.toLowerCase().replace(/\s/g, "") === target
  );
  return found ? obj[found] : "";
}

// Normalisiert jede Genstelle auf HH, Hh, hh
function normalizeGene(pair) {
  if (!pair) return "hh";
  const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
  const hCount = (clean.match(/H/g) || []).length;
  if (hCount >= 2) return "HH";
  if (hCount === 1) return "Hh";
  return "hh";
}

// Gibt alle 4 möglichen Nachkommenkombinationen nach Mendel zurück
function possibleOffspringGenes(mareGene, stallionGene) {
  const allelesM = mareGene.split("");
  const allelesS = stallionGene.split("");
  const combos = [];
  for (const m of allelesM) {
    for (const s of allelesS) {
      const combo = (m + s).replace(/(.)(?=.*\1)/g, "$1"); // normalize
      combos.push(normalizeGene(combo));
    }
  }
  return combos;
}

// Bewertet ein Gen nach Bereich (front/back)
function geneScore(gene, isFront) {
  if (isFront) {
    if (gene === "HH") return 2;
    if (gene === "Hh") return 1;
    return 0;
  } else {
    if (gene === "hh") return 2;
    if (gene === "Hh") return 1;
    return 0;
  }
}

function calculateScores(mare, stallion) {
  const TRAITS = [
    "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter",
    "Brust","Rückenlinie","Rückenlänge","Kruppe",
    "Beinwinkelung","Beinstellung","Fesseln","Hufe"
  ];

  let totalBest = 0;
  let totalWorst = 0;
  let countedTraits = 0;

  for (const trait of TRAITS) {
    const rawM = getField(mare, trait);
    const rawH = getField(stallion, trait);
    if (!rawM || !rawH) continue;

    const mClean = String(rawM).replace(/["'\s\uFEFF]/g, "").trim();
    const hClean = String(rawH).replace(/["'\s\uFEFF]/g, "").trim();
    if (!mClean || !hClean) continue;

    const mPairs = (mClean.replace(/\|/g, "").match(/.{1,2}/g) || []).slice(0, 8);
    const hPairs = (hClean.replace(/\|/g, "").match(/.{1,2}/g) || []).slice(0, 8);
    if (mPairs.length < 8 || hPairs.length < 8) continue;

    let bestTrait = 0;
    let worstTrait = 0;

    // 4 vordere Paare (Ziel: HH)
    for (let i = 0; i < 4; i++) {
      const mareGene = normalizeGene(mPairs[i]);
      const stallionGene = normalizeGene(hPairs[i]);
      const offspring = possibleOffspringGenes(mareGene, stallionGene);
      const scores = offspring.map(g => geneScore(g, true));
      bestTrait += Math.max(...scores);
      worstTrait += Math.min(...scores);
    }

    // 4 hintere Paare (Ziel: hh)
    for (let i = 4; i < 8; i++) {
      const mareGene = normalizeGene(mPairs[i]);
      const stallionGene = normalizeGene(hPairs[i]);
      const offspring = possibleOffspringGenes(mareGene, stallionGene);
      const scores = offspring.map(g => geneScore(g, false));
      bestTrait += Math.max(...scores);
      worstTrait += Math.min(...scores);
    }

    totalBest += bestTrait;
    totalWorst += worstTrait;
    countedTraits++;
  }

  // Durchschnitt pro Merkmal
  const bestAvg = countedTraits > 0 ? totalBest / countedTraits : 0;
  const worstAvg = countedTraits > 0 ? totalWorst / countedTraits : 0;

  return {
    best: Math.round(bestAvg * 10) / 10, // z. B. 13.4 Punkte
    worst: Math.round(worstAvg * 10) / 10
  };
}

window.calculateScores = calculateScores;
