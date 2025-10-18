// ==========================
// 📦 dataloader.js
// Lädt & säubert CSV-Daten aus Google Sheets
// ==========================

async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

// 🔹 Robustes CSV-Parsing (beachtet Anführungszeichen)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim().replace(/\uFEFF/g, ""));

  return lines.slice(1).map(line => {
    const values = line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map(v => v.replace(/^"|"$/g, "").trim());
    while (values.length < headers.length) values.push("");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));
    return obj;
  });
}

// 🔹 Entfernt BOM & Leerzeichen
function cleanCSVData(data) {
  return data.map(row => {
    const cleaned = {};
    for (const key in row) {
      const newKey = key
        .replace(/[^\P{C}\n\r\t]+/gu, "") // entfernt alle unsichtbaren Steuerzeichen
        .replace(/\uFEFF/g, "")
        .trim();
      let value = String(row[key] || "")
        .replace(/[^\P{C}\n\r\t]+/gu, "")
        .replace(/^"|"$/g, "")
        .replace(/\uFEFF/g, "")
        .trim();
      cleaned[newKey] = value;
    }
    return cleaned;
  });
}


// 🔹 Lädt Stuten & Hengste (ignoriert unvollständige Hengste)
async function loadData() {
  const maresUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
  const stallionsUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

  const [maresRaw, stallionsRaw] = await Promise.all([
    loadCSV(maresUrl),
    loadCSV(stallionsUrl),
  ]);

  const mares = cleanCSVData(maresRaw);
  const stallions = cleanCSVData(stallionsRaw).filter(s =>
    Object.values(s).some(v => v && v !== "")
  );

  console.log("✅ Mares geladen:", mares);
  console.log("✅ Stallions geladen:", stallions);

  return { mares, stallions };
}

// 🔹 Export für globale Nutzung
window.DataLoader = { loadData };
