// genetics.js – Vererbungslogik (einheitliche Gewichtung, korrekt nach Vorgabe)

const Genetics = {
  FRONT: { HH: 2, Hh: 1, hh: 0 },
  BACK: { hh: 2, Hh: 1, HH: 0 },

   calculate(mare, stallion) {
    const TRAITS = [
      "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist",
      "Schulter", "Brust", "Rückenlinie", "Rückenlänge",
      "Kruppe", "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
    ];

    let totalBest = 0;
    let totalWorst = 0;
    let countedTraits = 0;

    for (const trait of TRAITS) {
      const mareVal = getField(mare, trait);
      const stallionVal = getField(stallion, trait);
      if (!mareVal || !stallionVal) continue;

      const mPairs = (mareVal.match(/.{1,2}/g) || []).slice(0, 8);
      const sPairs = (stallionVal.match(/.{1,2}/g) || []).slice(0, 8);
      if (mPairs.length < 8 || sPairs.length < 8) continue;

      let bestSum = 0;
      let worstSum = 0;

      for (let i = 0; i < 8; i++) {
        const m = normalizeGene(mPairs[i]);
        const s = normalizeGene(sPairs[i]);

        const bestFront = FRONT_SCORE[m + "-" + s] ?? 0;
        const bestBack  = BACK_SCORE[m + "-" + s] ?? 0;

        // Worst analog
        const worstFront = FRONT_SCORE[s + "-" + m] ?? 0;
        const worstBack  = BACK_SCORE[s + "-" + m] ?? 0;

        // 4 vorne + 4 hinten
        bestSum  += i < 4 ? bestFront : bestBack;
        worstSum += i < 4 ? worstFront : worstBack;
      }

      // 👉 Normalisieren auf Skala 0–2
      const avgBest = bestSum / 8;
      const avgWorst = worstSum / 8;

      totalBest += avgBest;
      totalWorst += avgWorst;
      countedTraits++;
    }

    // 👉 Mittelwert über alle Merkmale
    const finalBest = totalBest / countedTraits * 2;
    const finalWorst = totalWorst / countedTraits * 2;

    return { best: parseFloat(finalBest.toFixed(2)), worst: parseFloat(finalWorst.toFixed(2)) };
  }
};
  cross(p1, p2) {
    const alleles1 = p1.split("");
    const alleles2 = p2.split("");
    const combos = [];

    for (let a of alleles1) {
      for (let b of alleles2) {
        const g = a + b;
        combos.push(g.includes("H") && g.includes("h") ? "Hh" : g);
      }
    }

    return combos.map(c =>
      c === "hH" ? "Hh" : c === "HH" ? "HH" : "hh"
    );
  }
};

window.Genetics = Genetics;
