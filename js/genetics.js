// genetics.js – Mit Matching-Bias für Stutenspezifische Bewertung

const Genetics = {
  // 🔹 Holt das passende Feld auch bei leicht abweichender Schreibweise
  getField(obj, key) {
    const target = key.toLowerCase().replace(/\s/g, "");
    const found = Object.keys(obj).find(
      k => k.toLowerCase().replace(/\s/g, "") === target
    );
    return found ? obj[found] : "";
  },

  // 🔹 Nur H/h-Zeichen extrahieren und in 8 Genpaare schneiden
  getPairs(str) {
    if (!str) return [];
    const letters = String(str).replace(/[^Hh]/g, "");
    const pairs = [];
    for (let i = 0; i + 1 < letters.length && pairs.length < 8; i += 2) {
      pairs.push(letters[i] + letters[i + 1]);
    }
    return pairs;
  },

  // 🔹 Vereinfacht Genpaar auf HH, Hh oder hh
  normalizeGene(pair) {
    if (!pair) return "hh";
    const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const hCount = (clean.match(/H/g) || []).length;
    if (hCount >= 2) return "HH";
    if (hCount === 1) return "Hh";
    return "hh";
  },

  // 🔹 Bewertet vordere Genpaare (Ziel HH)
  frontScore(gene) {
    const map = { "HH": 2, "Hh": 1, "hh": 0 };
    return map[gene] ?? 0;
  },

  // 🔹 Bewertet hintere Genpaare (Ziel hh)
  backScore(gene) {
    const map = { "HH": 0, "Hh": 1, "hh": 2 };
    return map[gene] ?? 0;
  },

  // 🔹 Alle möglichen Kind-Gene nach Mendel kombinieren
  childOptions(m, s) {
    const ma = m.replace(/[^Hh]/g, "");
    const sa = s.replace(/[^Hh]/g, "");
    if (ma.length < 2 || sa.length < 2) return [];
    return [
      this.normalizeGene(ma[0] + sa[0]),
      this.normalizeGene(ma[0] + sa[1]),
      this.normalizeGene(ma[1] + sa[0]),
      this.normalizeGene(ma[1] + sa[1]),
    ];
  },

  // 🔹 Hauptberechnung
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

      const mPairs = this.getPairs(mareVal);
      const sPairs = this.getPairs(stallionVal);
      if (mPairs.length < 8 || sPairs.length < 8) continue;

      let bestSum = 0;
      let worstSum = 0;

      for (let i = 0; i < 8; i++) {
        const m = this.normalizeGene(mPairs[i]);
        const s = this.normalizeGene(sPairs[i]);
        const children = this.childOptions(m, s);
        if (!children.length) continue;

        const isFront = i < 4; // vordere oder hintere Hälfte
        let scores = [];

        for (const g of children) {
          const base = isFront ? this.frontScore(g) : this.backScore(g);
          let adjust = 1;

          // 🔹 Matching-Bias:
          if (isFront) {
            // Vorne → Stute schwach -> Hengst stark = Vorteil
            if (m === "hh" && g === "HH") adjust = 1.3;
            else if (m === "HH" && g === "HH") adjust = 0.9;
            else if (m === "hh" && g === "hh") adjust = 0.9;
          } else {
            // Hinten → Stute stark -> Hengst schwach = Vorteil
            if (m === "HH" && g === "hh") adjust = 1.3;
            else if (m === "hh" && g === "hh") adjust = 0.9;
            else if (m === "HH" && g === "HH") adjust = 0.9;
          }

          scores.push(base * adjust);
        }

        bestSum += Math.max(...scores);
        worstSum += Math.min(...scores);
      }

      totalBest += bestSum;
      totalWorst += worstSum;
      countedTraits++;
    }

    if (countedTraits === 0) return { best: 0, worst: 0 };

    // 🔹 Skala 0–16 über alle Merkmale
    const finalBest = (totalBest / (countedTraits * 8)) * 16;
    const finalWorst = (totalWorst / (countedTraits * 8)) * 16;

    return {
      best: +finalBest.toFixed(2),
      worst: +finalWorst.toFixed(2)
    };
  }
};

window.Genetics = Genetics;
