// Lädt CSV aus Google Sheets
const DataLoader = {
  async loadCSV(url) {
    const res = await fetch(url);
    const text = await res.text();
    return this.parseCSV(text);
  },

  parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map(h => h.trim().replace(/\uFEFF/g, ""));
    return lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map(v => v.replace(/^"|"$/g, "").trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i] || "");
      return obj;
    });
  },

  clean(data) {
    return data.map(row => {
      const cleaned = {};
      for (const key in row) {
        const nk = key.replace(/\uFEFF/g, "").trim();
        cleaned[nk] = String(row[key] || "").trim();
      }
      return cleaned;
    });
  },

  async load() {
    const maresUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
    const stallionsUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

    const [maresRaw, stallionsRaw] = await Promise.all([
      this.loadCSV(maresUrl),
      this.loadCSV(stallionsUrl)
    ]);

    const mares = this.clean(maresRaw);
    const stallions = this.clean(stallionsRaw).filter(s =>
      Object.values(s).some(v => v && v !== "")
    );

    return { mares, stallions };
  }
};

window.DataLoader = DataLoader;
