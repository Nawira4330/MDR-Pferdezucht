// genetics.js – Vererbungslogik (einheitliche Gewichtung, korrekt nach Vorgabe)

const Genetics = {
  FRONT: { HH: 2, Hh: 1, hh: 0 },
  BACK: { hh: 2, Hh: 1, HH: 0 },

  calculate(mare, stallion) {
    const traits = [
      "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist",
      "Schulter", "Brust", "Rückenlinie", "Rückenlänge",
      "Kruppe", "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
    ];

    let totalBest = 0;
    let totalWorst = 0;

    traits.forEach(trait => {
      const mareVal = mare[trait] || "";
      const stallionVal = stallion[trait] || "";

      const [mareFront, mareBack] = mareVal.split("|").map(s => s?.trim() || "");
      const [stallionFront, stallionBack] = stallionVal.split("|").map(s => s?.trim() || "");

      const mareFrontGenes = mareFront.split(" ").filter(Boolean);
      const mareBackGenes = mareBack.split(" ").filter(Boolean);
      const stallionFrontGenes = stallionFront.split(" ").filter(Boolean);
      const stallionBackGenes = stallionBack.split(" ").filter(Boolean);

      let bestTrait = 0;
      let worstTrait = 0;

      for (let i = 0; i < 8; i++) {
        const mF = mareFrontGenes[i] || "hh";
        const sF = stallionFrontGenes[i] || "hh";
        const mB = mareBackGenes[i] || "hh";
        const sB = stallionBackGenes[i] || "hh";

        const combosF = Genetics.cross(mF, sF);
        const combosB = Genetics.cross(mB, sB);

        const bestF = Math.max(...combosF.map(g => Genetics.FRONT[g] ?? 0));
        const worstF = Math.min(...combosF.map(g => Genetics.FRONT[g] ?? 0));
        const bestB = Math.max(...combosB.map(g => Genetics.BACK[g] ?? 0));
        const worstB = Math.min(...combosB.map(g => Genetics.BACK[g] ?? 0));

        bestTrait += bestF + bestB;
        worstTrait += worstF + worstB;
      }

      // Pro Merkmal: Summe der 8 Genpaare
      totalBest += bestTrait;
      totalWorst += worstTrait;
    });

    // Gesamtwert: Summe aller Merkmale / 14 (Durchschnitt pro Merkmal)
    const best = (totalBest / 14).toFixed(2);
    const worst = (totalWorst / 14).toFixed(2);

    return {
      best: parseFloat(best),
      worst: parseFloat(worst)
    };
  },

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
