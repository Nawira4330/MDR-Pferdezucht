// genetics.js – Berechnung der genetischen Kompatibilität

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

  // 🔹 Hauptfunktion zur Score-Berechnung
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

      // Leerzeichen entfernen und in 8 Paare teilen
      const mPairs = (mareVal.replace(/\s+/g, "").match(/.{1,2}/g) || []).slice(0, 8);
      const sPairs = (stallionVal.replace(/\s+/g, "").match(/.{1,2}/g) || []).slice(0, 8);
      if (mPairs.length < 8 || sPairs.length < 8) continue;

      let bestSum = 0;
      let worstSum = 0;

      for (let i = 0; i < 8; i++) {
        const m = this.normalizeGene(mPairs[i]);
        const s = this.normalizeGene(sPairs[i]);

        // Beste mögliche Kombination
        const bestValue = i < 4 ? this.frontScore(s) : this.backScore(s);

        // Schlechteste mögliche Kombination
        const worstValue = i < 4 ? this.frontScore(m) : this.backScore(m);

        bestSum += bestValue;
        worstSum += worstValue;
      }

      totalBest += bestSum;
      totalWorst += worstSum;
      countedTraits++;
    }

    if (countedTraits === 0) return { best: 0, worst: 0 };

    // 👉 Durchschnitt über alle 14 Merkmale → Skala 0–16
    const finalBest = totalBest / countedTraits;
    const finalWorst = totalWorst / countedTraits;

    return {
      best: parseFloat(finalBest.toFixed(2)),
      worst: parseFloat(finalWorst.toFixed(2))
    };
  }
};

window.Genetics = Genetics;
