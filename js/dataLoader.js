// js/dataLoader.js
// Lädt und bereinigt CSV-Daten aus Google Sheets – robust gegen BOM, Anführungszeichen & unsichtbare Zeichen

console.log("🚀 DataLoader geladen");

// 🔹 CSV-Dateien laden
async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

// 🔹 CSV-Parser mit stabilem Komma-Splitting (unterstützt Anführungszeichen)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0]
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) // sichert korrektes Spalten-Splitting
    .map(h => h.trim().replace(/\uFEFF/g, ""));

  return lines.slice(1).map(line => {
    const values = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(v => v.replace(/^"|"$/g, "").trim());

    // Fehlende Werte auffüllen
    while (values.length < headers.length) values.push("");

    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));
    return obj;
  });
}

// 🔹 Unsichtbare Steuerzeichen & BOMs entfernen
function cleanCSVData(data) {
  return data.map(row => {
    const cleaned = {};
    for (const key in row) {
      // Entfernt BOM, Nullbreite-Zeichen, Tabs, Steuerzeichen
      const newKey = key
        .replace(/[^\P{C}\n\r\t]+/gu, "")
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

// 🔹 Hauptfunktion zum Laden der Daten
async function loadData() {
  console.log("📥 Lade Daten von Google Sheets ...");

  const maresUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
  const stallionsUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

  const [maresRaw, stallionsRaw] = await Promise.all([
    loadCSV(maresUrl),
    loadCSV(stallionsUrl),
  ]);

  // 🔹 Bereinigung
  const mares = cleanCSVData(maresRaw);
  const stallions = cleanCSVData(stallionsRaw).filter(s => {
    // Nur Hengste behalten, die Werte in Exterieur-Spalten haben
    const hasData = Object.values(s).some(v => v && v.trim() !== "");
    return hasData && s.Name && s.Name.trim() !== "";
  });

  // Debug-Ausgabe
  console.log("✅ Stuten geladen:", mares.length, mares);
  console.log("✅ Hengste geladen:", stallions.length, stallions);

  // Beispiel-Keys prüfen (zur Fehlersuche)
  if (stallions[0]) console.log("🧬 Beispiel-Hengst Keys:", Object.keys(stallions[0]));
  if (mares[0]) console.log("🐎 Beispiel-Stute Keys:", Object.keys(mares[0]));

  return { mares, stallions };
}

// 🔹 Global verfügbar machen
window.DataLoader = { loadData };
