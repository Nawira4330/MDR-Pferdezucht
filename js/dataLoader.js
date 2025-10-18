// ===============================
// Daten laden & filtern
// ===============================

// CSV-Quellen
const MARE_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZE4HXc1di-ym2n79-_9Rc-vxHbMMniRXmgq1woBSha0MjvANgvYFoqH4w7E2LA/pub?output=csv";
const STALLION_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvyxHFLsRMdLYcZR6VhzhDDHJX46TLp3WMUslb53ij2zzAY7R2o9rZjVHpani0cA/pub?output=csv";

let mares = [];
let stallions = [];

async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const [head, ...rows] = text
    .trim()
    .split("\n")
    .map((r) => r.split(","));
  return rows.map((r) =>
    Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ? r[i].trim() : ""]))
  );
}

async function loadData() {
  [mares, stallions] = await Promise.all([
    fetchCSV(MARE_CSV),
    fetchCSV(STALLION_CSV),
  ]);

  const TRAITS = [
    "Kopf", "Gebiss", "Hals", "Halsansatz", "Widerrist", "Schulter",
    "Brust", "Rückenlinie", "Rückenlänge", "Kruppe",
    "Beinwinkelung", "Beinstellung", "Fesseln", "Hufe"
  ];

  // Nur Hengste mit mindestens einem Merkmal behalten
  stallions = stallions.filter((stallion) => {
    return TRAITS.some((trait) => {
      const key = Object.keys(stallion).find(
        (k) => k.replace(/\s+/g, "").toLowerCase() === trait.toLowerCase()
      );
      const val = key ? (stallion[key] || "").trim() : "";
      return val !== "";
    });
  });

  fillDropdowns();
}
