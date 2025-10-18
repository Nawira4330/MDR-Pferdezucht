// genetics.js – Berechnet Best/Worst Score für jede Stute-Hengst-Kombination

const Genetics = {
  normalize(pair) {
    if (!pair) return "hh";
    const clean = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const count = (clean.match(/H/g) || []).length;
    return count === 2 ? "HH" : count === 1 ? "Hh" : "hh";
  },

  value(gene, front) {
    // Punktevergabe gemäß deiner Vorgabe
    if (front) {
      if (gene === "HH") return 2;
      if (gene === "Hh") return 1;
      return 0;
    } else {
      if (gene === "HH") return 0;
      if (gene === "Hh") return 1;
      return 2;
    }
  },

  calculate(mare, stallion) {
    const TRAITS = [
      "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter",
      "Brust","Rückenlinie","Rückenlänge","Kruppe",
      "Beinwinkelung","Beinstellung","Fesseln","Hufe"
    ];

    let totalBest = 0;
    let totalWorst = 0;
    let validTraits = 0;

    for (const trait of TRAITS) {
      const mRaw = mare[trait] || "";
      const sRaw = stallion[trait] || "";
      if (!mRaw || !sRaw) continue;

      // Leerzeichen entfernen und 8 Paare bilden
      const mGenes = mRaw.replace(/\s+/g, "").split("|").join("");
      const sGenes = sRaw.replace(/\s+/g, "").split("|").join("");
      const mPairs = (mGenes.match(/.{1,2}/g) || []).slice(0, 8);
      const sPairs = (sGenes.match(/.{1,2}/g) || []).slice(0, 8);

      if (mPairs.length < 8 || sPairs.length < 8) continue;
      validTraits++;

      // Bestes & schlechtestes Fohlen simulieren (Mendel)
      let bestScore = 0;
      let worstScore = 0;

      for (let i = 0; i < 8; i++) {
        const front = i < 4;
        const mGene = this.normalize(mPairs[i]);
        const sGene = this.normalize(sPairs[i]);

        // Beste mögliche Kombination → ideal gen
        const ideal = front ? "HH" : "hh";

        // Simuliere Fohlen-Gen: Wenn beide H tragen → HH, etc.
        const combos = [mGene[0], sGene[0]]; // beide Eltern
        const hasH = combos.filter(c => c === "H").length;

        const foalGeneBest =
          hasH >= 2 ? "HH" : hasH === 1 ? "Hh" : "hh";
        const foalGeneWorst =
          hasH === 0 ? "HH" : hasH === 1 ? "Hh" : "hh"; // invers gedacht

        bestScore += this.value(foalGeneBest, front);
        worstScore += this.value(foalGeneWorst, front);
      }

      totalBest += bestScore;
      totalWorst += worstScore;
    }

    // Durchschnitt pro Merkmal (max. 16 Punkte)
    if (validTraits === 0) return { best: 0, worst: 0 };
    return {
      best: totalBest / validTraits,
      worst: totalWorst / validTraits
    };
  }
};

window.Genetics = Genetics;
