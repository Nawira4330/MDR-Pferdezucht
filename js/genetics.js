// genetics.js – Berechnet individuelle Scores für jede Stute-Hengst-Kombination

const Genetics = {
  // 🔹 Holt das passende Feld, auch wenn Schreibweise abweicht
  getField(obj, key) {
    const target = key.toLowerCase().replace(/\s/g, "");
    const found = Object.keys(obj).find(
      k => k.toLowerCase().replace(/\s/g, "") === target
    );
    return found ? obj[found] : "";
  },

  // 🔹 Vereinfacht ein Genpaar auf HH, Hh oder hh
  normalizeGene(pair) {
    if (!pair) return "hh";
    const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const hCount = (clean.match(/H/g) || []).length;
    if (hCount >= 2) return "HH";
    if (hCount === 1) return "Hh";
    return "hh";
  },

  // 🔹 Bewertet vordere Genpaare (Ziel = HH)
  frontScore(gene) {
    const map = { "HH": 2, "Hh": 1, "hh": 0 };
    return map[gene] ?? 0;
  },

  // 🔹 Bewertet hintere Genpaare (Ziel = hh)
  backScore(gene) {
    const map = { "HH": 0, "Hh": 1, "hh": 2 };
    return map[gene] ?? 0;
  },

  // 🔹 Hauptberechnung für eine Stute–Hengst-Kombination
  calculate(mare, stallion) {
    const TRAITS = [
      "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
      "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
      "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
    ];

    let totalBest = 0;
    let totalWorst = 0;
    let validTraits = 0;

    TRAITS.forEach(trait => {
      const rawM = this.getField(mare, trait);
      const rawH = this.getField(stallion, trait);
      if (!rawM || !rawH) return;

      // 🔸 Leerzeichen & Sonderzeichen entfernen
      const mClean = rawM.replace(/\s+/g, "").replace(/\|/g, "");
      const hClean = rawH.replace(/\s+/g, "").replace(/\|/g, "");

      const mPairs = (mClean.match(/.{1,2}/g) || []).slice(0, 8).map(this.normalizeGene);
      const hPairs = (hClean.match(/.{1,2}/g) || []).slice(0, 8).map(this.normalizeGene);
      if (mPairs.length < 8 || hPairs.length < 8) return;

      let bestTraitScore = 0;
      let worstTraitScore = 0;

      // 🔹 Vordere 4 Paare → Ziel HH
      for (let i = 0; i < 4; i++) {
        const possible = this.combineGenes(mPairs[i], hPairs[i]);
        const best = Math.max(...possible.map(g => this.frontScore(g)));
        const worst = Math.min(...possible.map(g => this.frontScore(g)));
        bestTraitScore += best;
        worstTraitScore += worst;
      }

      // 🔹 Hintere 4 Paare → Ziel hh
      for (let i = 4; i < 8; i++) {
        const possible = this.combineGenes(mPairs[i], hPairs[i]);
        const best = Math.max(...possible.map(g => this.backScore(g)));
        const worst = Math.min(...possible.map(g => this.backScore(g)));
        bestTraitScore += best;
        worstTraitScore += worst;
      }

      totalBest += bestTraitScore;
      totalWorst += worstTraitScore;
      validTraits++;
    });

    // 🔹 Durchschnitt pro Merkmal (max. 16)
    const avgBest = validTraits > 0 ? totalBest / validTraits : 0;
    const avgWorst = validTraits > 0 ? totalWorst / validTraits : 0;

    // 🔹 Ergebnis auf 2 Nachkommastellen runden
    return {
      best: Math.round(avgBest * 100) / 100,
      worst: Math.round(avgWorst * 100) / 100
    };
  },

  // 🔹 Kombiniert die Gene der Eltern nach Mendel
  combineGenes(mGene, hGene) {
    const mAlleles = mGene.split("");
    const hAlleles = hGene.split("");
    const combinations = [];

    mAlleles.forEach(m => {
      hAlleles.forEach(h => {
        combinations.push(this.normalizeGene(m + h));
      });
    });

    return combinations;
  }
};

window.Genetics = Genetics;
