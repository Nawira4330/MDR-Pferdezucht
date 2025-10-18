// Berechnet genetischen Score (Best/Worst)
const Genetics = {
  normalize(pair) {
    if (!pair) return "hh";
    const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const hCount = (clean.match(/H/g) || []).length;
    return hCount >= 2 ? "HH" : hCount === 1 ? "Hh" : "hh";
  },

  pairGenes(str) {
    if (!str) return [];
    return str.replace(/\s+/g, "").split("|").join("").match(/.{1,2}/g) || [];
  },

  geneValue(g, front) {
    if (front) return g === "HH" ? 2 : g === "Hh" ? 1 : 0;
    else return g === "hh" ? 2 : g === "Hh" ? 1 : 0;
  },

  calculate(mare, stallion) {
    const traits = ["Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust","Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"];
    let best = 0, worst = 0, count = 0;

    traits.forEach(tr => {
      const m = (mare[tr] || "").replace(/\s+/g, "");
      const h = (stallion[tr] || "").replace(/\s+/g, "");
      if (!m || !h) return;

      const mPairs = this.pairGenes(m).map(this.normalize);
      const hPairs = this.pairGenes(h).map(this.normalize);
      if (mPairs.length < 8 || hPairs.length < 8) return;

      for (let i = 0; i < 8; i++) {
        const front = i < 4;
        const foalBest = this.geneValue(hPairs[i], front);
        const foalWorst = 2 - foalBest;
        best += foalBest;
        worst += foalWorst;
      }
      count++;
    });

    const div = count || 1;
    return {
      best: Math.round((best / div) * 10) / 10,
      worst: Math.round((worst / div) * 10) / 10
    };
  }
};

window.Genetics = Genetics;
