// genetics.js – Best/Worst = tatsächlich best-/schlechtest-mögliches Fohlen
// Skala 0..16; stutenspezifisch je Hengst; robustes Parsing (Leerzeichen/| ignorieren)

const Genetics = {
  // Feld robust holen (Groß/Klein/Spaces egal)
  getField(obj, key) {
    const target = key.toLowerCase().replace(/\s/g, "");
    const found = Object.keys(obj).find(
      k => k.toLowerCase().replace(/\s/g, "") === target
    );
    return found ? obj[found] : "";
  },

  // Gen-String -> 8 Zweierpaare (nur H/h)
  toPairs(str) {
    if (!str) return [];
    const letters = String(str).replace(/[^Hh]/g, ""); // alles außer H/h raus
    const pairs = [];
    for (let i = 0; i + 1 < letters.length && pairs.length < 8; i += 2) {
      pairs.push(letters[i] + letters[i + 1]);
    }
    return pairs;
  },

  // Paar auf HH/Hh/hh normalisieren
  norm(pair) {
    if (!pair) return "hh";
    const p = pair.replace(/[^Hh]/g, "").slice(0, 2);
    const H = (p.match(/H/g) || []).length;
    return H >= 2 ? "HH" : H === 1 ? "Hh" : "hh";
  },

  // Front (Ziel HH) – Punkte je Kind-Gen
  frontPoints(g) {
    return g === "HH" ? 2 : g === "Hh" ? 1 : 0;
  },
  // Back (Ziel hh) – Punkte je Kind-Gen
  backPoints(g) {
    return g === "hh" ? 2 : g === "Hh" ? 1 : 0;
  },

  // 4 Kind-Genoptionen nach Mendel
  children(m, s) {
    const ma = m.replace(/[^Hh]/g, "");
    const sa = s.replace(/[^Hh]/g, "");
    if (ma.length < 2 || sa.length < 2) return [];
    return [
      this.norm(ma[0] + sa[0]),
      this.norm(ma[0] + sa[1]),
      this.norm(ma[1] + sa[0]),
      this.norm(ma[1] + sa[1]),
    ];
  },

  // Hauptscore
  calculate(mare, stallion) {
    const TRAITS = [
      "Kopf","Gebiss","Hals","Halsansatz","Widerrist","Schulter","Brust",
      "Rückenlinie","Rückenlänge","Kruppe","Beinwinkelung","Beinstellung","Fesseln","Hufe"
    ];

    let totalBest = 0;   // Summe trait-weise (je 0..16)
    let totalWorst = 0;
    let usedTraits = 0;

    for (const t of TRAITS) {
      const mRaw = this.getField(mare, t);
      const sRaw = this.getField(stallion, t);
      if (!mRaw || !sRaw) continue;

      const mPairs = this.toPairs(mRaw);
      const sPairs = this.toPairs(sRaw);
      if (mPairs.length < 8 || sPairs.length < 8) continue;

      // pro Merkmal: 8 Paare → je 0..2 → Summe 0..16
      let bestTrait = 0;
      let worstTrait = 0;

      for (let i = 0; i < 8; i++) {
        const m = this.norm(mPairs[i]);
        const s = this.norm(sPairs[i]);
        const kids = this.children(m, s);
        if (!kids.length) continue;

        const scorer = i < 4 ? this.frontPoints.bind(this) : this.backPoints.bind(this);
        const points = kids.map(scorer);
        bestTrait  += Math.max(...points); // bestmögliches Kind an dieser Position
        worstTrait += Math.min(...points); // schlechtestmögliches Kind an dieser Position
      }

      totalBest  += bestTrait;   // 0..16
      totalWorst += worstTrait;  // 0..16
      usedTraits++;
    }

    if (!usedTraits) return { best: 0, worst: 0 };

    // Normierung: Mittelwert über Merkmale ⇒ 0..16
    const best = +(totalBest  / usedTraits).toFixed(2);
    const worst= +(totalWorst / usedTraits).toFixed(2);

    return { best, worst };
  }
};

window.Genetics = Genetics;
