// genetics.js – Vererbungslogik für Stute × Hengst

const Genetics = {
  // 🔹 Idealtypische Bewertung je Position
  FRONT: { HH: 2, Hh: 1, hh: 0 },
  BACK: { hh: 2, Hh: 1, HH: 0 },

  // 🔹 Berechne Best und Worst Score
  calculate(mare, stallion) {
    const traits = [
      "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist",
      "Schulter", "Brust", "Rückenlinie", "Rückenlänge",
      "Kruppe", "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
    ];

    let totalBest = 0;
    let totalWorst = 0;
    const totalTraits = traits.length;

    traits.forEach(trait => {
      const mareVal = mare[trait] || "";
      const stallionVal = stallion[trait] || "";

      // Beide Genstränge trennen (vorne | hinten)
      const [mareFront, mareBack] = mareVal.split("|").map(s => s?.trim() || "");
      const [stallionFront, stallionBack] = stallionVal.split("|").map(s => s?.trim() || "");

      // Genlisten erzeugen
      const mareFrontGenes = mareFront.split(" ").filter(Boolean);
      const mareBackGenes = mareBack.split(" ").filter(Boolean);
      const stallionFrontGenes = stallionFront.split(" ").filter(Boolean);
      const stallionBackGenes = stallionBack.split(" ").filter(Boolean);

      let bestTrait = 0;
      let worstTrait = 0;

      // 8 Positionen (Gene-Paare)
      for (let i = 0; i < 8; i++) {
        const mFront = mareFrontGenes[i] || "hh";
        const sFront = stallionFrontGenes[i] || "hh";
        const mBack = mareBackGenes[i] || "hh";
        const sBack = stallionBackGenes[i] || "hh";

        // 🔹 Alle möglichen Kind-Kombinationen generieren (dominant)
        const combosFront = Genetics.cross(mFront, sFront);
        const combosBack = Genetics.cross(mBack, sBack);

        // 🔹 Bestes und schlechtestes Ergebnis ermitteln
        const bestFront = Math.max(...combosFront.map(g => Genetics.FRONT[g] ?? 0));
        const worstFront = Math.min(...combosFront.map(g => Genetics.FRONT[g] ?? 0));
        const bestBack = Math.max(...combosBack.map(g => Genetics.BACK[g] ?? 0));
        const worstBack = Math.min(...combosBack.map(g => Genetics.BACK[g] ?? 0));

        bestTrait += bestFront + bestBack;
        worstTrait += worstFront + worstBack;
      }

      // 🔹 Durchschnitt dieses Merkmals (alle 8 Genpaare gleich gewichtet)
      totalBest += bestTrait / 8;
      totalWorst += worstTrait / 8;
    });

    // 🔹 Endscore mitteln (alle Merkmale gleich gewichtet)
    const best = (totalBest / totalTraits).toFixed(2);
    const worst = (totalWorst / totalTraits).toFixed(2);

    return { best: parseFloat(best), worst: parseFloat(worst) };
  },

  // 🔹 Mendel’sche Kreuzung
  cross(parent1, parent2) {
    const alleles1 = parent1.split("");
    const alleles2 = parent2.split("");
    const combos = [];

    for (let a of alleles1) {
      for (let b of alleles2) {
        combos.push(a + b);
      }
    }

    // Normalize (z. B. hH -> Hh)
    return combos.map(c =>
      c.includes("H") && c.includes("h") ? "Hh" :
      c === "HH" ? "HH" :
      "hh"
    );
  }
};

window.Genetics = Genetics;
