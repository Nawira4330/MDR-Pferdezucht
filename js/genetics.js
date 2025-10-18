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
    "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter",
    "Brust","Rückenlinie","Rückenlänge","Kruppe",
    "Beinwinkelung","Beinstellung","Fesseln","Hufe"
  ];

  let totalBest = 0, totalWorst = 0, foundAny = false;

  for (const trait of TRAITS) {
    // Feld robust holen (auch wenn Leerzeichen oder falsche Header)
    const mareVal = Object.entries(mare).find(([k]) =>
      k.toLowerCase().replace(/\s/g,"") === trait.toLowerCase())?.[1] || "";
    const stallVal = Object.entries(stallion).find(([k]) =>
      k.toLowerCase().replace(/\s/g,"") === trait.toLowerCase())?.[1] || "";

    if (!mareVal || !stallVal) continue;

    // alle Leerzeichen & Steuerzeichen entfernen
    const m = mareVal.replace(/\s+/g,"").trim();
    const h = stallVal.replace(/\s+/g,"").trim();
    if (!m.includes("|") || !h.includes("|")) continue;
    foundAny = true;

    // Front/Back trennen
    const [mFront, mBack] = m.split("|");
    const [hFront, hBack] = h.split("|");

    // Falls zu kurz → auffüllen
    const toPairs = (s) => (s.match(/.{1,2}/g) || []).slice(0,8);
    const mFrontPairs = toPairs(mFront.padEnd(8,"h"));
    const hFrontPairs = toPairs(hFront.padEnd(8,"h"));
    const mBackPairs = toPairs(mBack.padEnd(8,"h"));
    const hBackPairs = toPairs(hBack.padEnd(8,"h"));

    let traitBest = 0, traitWorst = 0;

    // FRONT (HH-Ziel)
    for (let i=0;i<4;i++){
      const {best,worst} = getPairScore(true,mFrontPairs[i],hFrontPairs[i]);
      traitBest += best; traitWorst += worst;
    }
    // BACK (hh-Ziel)
    for (let i=0;i<4;i++){
      const {best,worst} = getPairScore(false,mBackPairs[i],hBackPairs[i]);
      traitBest += best; traitWorst += worst;
    }

    totalBest += traitBest;
    totalWorst += traitWorst;
  }

  return foundAny ? {best:totalBest, worst:totalWorst} : {best:0, worst:0};
}

console.log("DEBUG", mare.Name, stallion.Name, {
  kopfMare: mare.Kopf,
  kopfHengst: stallion.Kopf
});

