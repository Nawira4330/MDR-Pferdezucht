// ==========================
// 📦 dataloader.js
// Lädt CSV-Daten von Google Sheets und wandelt sie in JSON um
// ==========================

// CSV-URLs (deine aktuellen Freigabe-Links)
const MARES_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const STALLIONS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

// --- CSV zu JSON Konverter ---
function parseCSV(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const entry = {};
    headers.forEach((header, i) => (entry[header] = values[i] || ""));
    return entry;
  });
}

// --- Daten laden ---
async function loadCSVData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fehler beim Laden von ${url}`);
    const text = await res.text();
    return parseCSV(text);
  } catch (err) {
    console.error("❌ CSV-Fehler:", err);
    return [];
  }
}

// --- Hauptladefunktion ---
async function loadAllData() {
  const mares = await loadCSVData(MARES_CSV);
  const stallions = await loadCSVData(STALLIONS_CSV);
  console.log("✅ Daten geladen:", { mares, stallions });
  return { mares, stallions };
}

// --- Dropdowns füllen ---
function populateDropdowns(mares) {
  const mareSelect = document.getElementById("mareSelect");
  const ownerSelect = document.getElementById("ownerSelect");

  // Stutenliste
  mares.forEach((mare) => {
    const opt = document.createElement("option");
    opt.value = mare["Name"];
    opt.textContent = mare["Name"];
    mareSelect.appendChild(opt);
  });

  // Besitzerliste
  const owners = [...new Set(mares.map((m) => m["Besitzer"]).filter(Boolean))];
  owners.forEach((owner) => {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    ownerSelect.appendChild(opt);
  });
}

// --- Globale Daten speichern ---
window.DataLoader = {
  loadAllData,
  populateDropdowns,
};
