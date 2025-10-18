const Genetics = {
  getField(obj, key) {
    const target = key.toLowerCase().replace(/\s/g, "");
    const found = Object.keys(obj).find(
      k => k.toLowerCase().replace(/\s/g, "") === target
    );
    return found ? obj[found] : "";
  },

  normalizeGene(pair) {
    if (!pair) return "hh";
    const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const hCount = (clean.match(/H/g) || []).length;
    if (hCount >= 2) return "HH";
    if (hCount === 1) return "Hh";
    return "hh";
  },

  frontScore(gene) {
    const map = { "HH": 2, "Hh": 1, "hh": 0 };
    return map[gene] ?? 0;
  },

  backScore(gene) {
    const map = { "HH": 0, "Hh": 1, "hh": 2 };
    return map[gene] ?? 0;
  },

  // 🧬 Hauptberechnung: Kombination beider Eltern
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
      const mareVal = this.getField(mare, trait);
      const stallionVal = this.getField(stallion, trait);
      if (!mareVal || !stallionVal) continue;

      const mPairs = (mareVal.replace(/\s+/g, "").match(/.{1,2}/g) || []).slice(0, 8);
      const sPairs = (stallionVal.replace(/\s+/g, "").match(/.{1,2}/g) || []).slice(0, 8);
      if (mPairs.length < 8 || sPairs.length < 8) continue;

      let bestSum = 0;
      let worstSum = 0;

      for (let i = 0; i < 8; i++) {
        const m = this.normalizeGene(mPairs[i]);
        const s = this.normalizeGene(sPairs[i]);

        // 👉 Kombination beider Eltern:
        // Mögliche Nachkommengene: HH, Hh, hh
        const childOptions = [
          this.normalizeGene(m[0] + s[0]),
          this.normalizeGene(m[0] + s[1]),
          this.normalizeGene(m[1] + s[0]),
          this.normalizeGene(m[1] + s[1]),
        ];

        // Bewertung der besten und schlechtesten Option
        const childScores = childOptions.map((g, idx) =>
          (i < 4 ? this.frontScore(g) : this.backScore(g))
        );

        const best = Math.max(...childScores);
        const worst = Math.min(...childScores);

        bestSum += best;
        worstSum += worst;
      }

      totalBest += bestSum;
      totalWorst += worstSum;
      countedTraits++;
    }

    if (countedTraits === 0) return { best: 0, worst: 0 };

    // 👉 Skalierung 0–16
    const finalBest = totalBest / countedTraits;
    const finalWorst = totalWorst / countedTraits;

    return {
      best: parseFloat(finalBest.toFixed(2)),
      worst: parseFloat(finalWorst.toFixed(2))
    };
  }
};

window.Genetics = Genetics;
