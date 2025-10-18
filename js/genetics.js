// genetics.js – Stutenspezifische Kreuzung nach Mendel (Best/Worst über alle 8×14 Gene)

const Genetics = {
  getField(obj, key) {
    const target = key.toLowerCase().replace(/\s/g, "");
    const found = Object.keys(obj).find(
      k => k.toLowerCase().replace(/\s/g, "") === target
    );
    return found ? obj[found] : "";
  },

  // Holt 8 Genpaare (nur H/h-Zeichen)
  toPairs(str) {
    if (!str) return [];
    const letters = str.replace(/[^Hh]/g, "");
    const pairs = [];
    for (let i = 0; i < letters.length; i += 2) {
      if (pairs.length >= 8) break;
      pairs.push(letters[i] + (letters[i + 1] || ""));
    }
    return pairs;
  },

  // HH / Hh / hh vereinheitlichen
  normalize(pair) {
    const p = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const H = (p.match(/H/g) || []).length;
    if (H >= 2) return "HH";
    if (H === 1) return "Hh";
    return "hh";
  },

  // Kind-Gene bilden (alle 4 Möglichkeiten)
  cross(m, s) {
    const ma = m.replace(/[^Hh]/g, "");
    const sa = s.replace(/[^Hh]/g, "");
    if (ma.length < 2 || sa.length < 2) return [];
    const kids = [
      ma[0] + sa[0], ma[0] + sa[1],
      ma[1] + sa[0], ma[1] + sa[1]
    ];
    return kids.map(k => this.normalize(k));
  },

  // Bewertung: vorne HH optimal, hinten hh optimal
  scoreGene(gene, front = true) {
    if (front) return gene === "HH" ? 2 : gene === "Hh" ? 1 : 0;
    else return gene === "hh" ? 2 : gene === "Hh" ? 1 : 0;
  },

  calculate(mare, stallion) {
    const TRAITS = [
      "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist",
      "Schulter", "Brust", "Rückenlinie", "Rückenlänge",
      "Kruppe", "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
    ];

    let totalBest = 0;
    let totalWorst = 0;
    let traitsUsed = 0;

    for (const trait of TRAITS) {
      const mareVal = this.getField(mare, trait);
      const stallVal = this.getField(stallion, trait);
      if (!mareVal || !stallVal) continue;

      const mPairs = this.toPairs(mareVal);
      const sPairs = this.toPairs(stallVal);
      if (mPairs.length < 8 || sPairs.length < 8) continue;

      let traitBest = 0;
      let traitWorst = 0;

      for (let i = 0; i < 8; i++) {
        const m = this.normalize(mPairs[i]);
        const s = this.normalize(sPairs[i]);
        const children = this.cross(m, s);
        if (!children.length) continue;

        const isFront = i < 4; // erste 4 vordere Gene, zweite 4 hintere

        const scores = children.map(g => this.scoreGene(g, isFront));
        const bestGene = Math.max(...scores);
        const worstGene = Math.min(...scores);

        traitBest += bestGene;
        traitWorst += worstGene;
      }

      totalBest += traitBest;
      totalWorst += traitWorst;
      traitsUsed++;
    }

    if (traitsUsed === 0) return { best: 0, worst: 0 };

    // Normierung 0–16
    const finalBest = (totalBest / traitsUsed);
    const finalWorst = (totalWorst / traitsUsed);

    return {
      best: parseFloat(finalBest.toFixed(2)),
      worst: parseFloat(finalWorst.toFixed(2))
    };
  }
};

window.Genetics = Genetics;
