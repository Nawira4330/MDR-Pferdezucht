// genetics.js – robuste, stutenindividuelle Berechnung (Skala 0–16)

const Genetics = {
  // passendes Feld tolerant finden
  getField(obj, key) {
    const target = key.toLowerCase().replace(/\s/g, "");
    const found = Object.keys(obj).find(
      k => k.toLowerCase().replace(/\s/g, "") === target
    );
    return found ? obj[found] : "";
  },

  // nur H/h extrahieren, in 8 Paare (16 Buchstaben) schneiden
  getPairs(str) {
    if (!str) return [];
    const letters = String(str).replace(/[^Hh]/g, ""); // ALLES außer H/h entfernen (inkl. '|', Leerz., Kommas)
    const pairs = [];
    for (let i = 0; i + 1 < letters.length && pairs.length < 8; i += 2) {
      pairs.push(letters[i] + letters[i + 1]);
    }
    return pairs; // max. 8 Einträge
  },

  // HH/Hh/hh normalisieren
  normalizeGene(pair) {
    if (!pair) return "hh";
    const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const hCount = (clean.match(/H/g) || []).length;
    if (hCount >= 2) return "HH";
    if (hCount === 1) return "Hh";
    return "hh";
  },

  // Front-Punkte (Ziel HH)
  frontScore(gene) {
    const map = { "HH": 2, "Hh": 1, "hh": 0 };
    return map[gene] ?? 0;
  },

  // Back-Punkte (Ziel hh)
  backScore(gene) {
    const map = { "HH": 0, "Hh": 1, "hh": 2 };
    return map[gene] ?? 0;
  },

  // Mendel-Kreuzung: aus Elternpaar (m, s) alle 4 möglichen Kind-Paare
  childOptions(m, s) {
    // m und s sind "HH" | "Hh" | "hh"
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

  // Hauptberechnung
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

        // je nach Position (0–3 vorne, 4–7 hinten) bewerten
        const scores = children.map(g =>
          (i < 4 ? this.frontScore(g) : this.backScore(g))
        );

        bestSum  += Math.max(...scores); // beste mögliche Ausprägung
        worstSum += Math.min(...scores); // schlechteste mögliche Ausprägung
      }

      totalBest  += bestSum;  // Bereich 0–16 pro Merkmal
      totalWorst += worstSum;
      countedTraits++;
    }

    if (countedTraits === 0) return { best: 0, worst: 0 };

    // ⬇️ Mittelwert über Merkmale -> Skala 0–16
    const finalBest  = totalBest  / countedTraits;
    const finalWorst = totalWorst / countedTraits;

    return {
      best:  +finalBest.toFixed(2),
      worst: +finalWorst.toFixed(2)
    };
  }
};

window.Genetics = Genetics;
