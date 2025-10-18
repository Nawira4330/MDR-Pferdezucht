<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paarungsanalyse – Exterieur-Matching</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    🐴 Paarungsanalyse – Exterieur-Matching
  </header>

  <!-- ⚠️ Dauerhafte Warnbox -->
  <div class="warning-box">
    ⚠️ <strong>Wichtiger Hinweis:</strong> Inzucht und die doppelte Vererbung des Overo-Gens 
    werden in dieser Analyse <u>nicht</u> berücksichtigt.  
    Die Ergebnisse dienen ausschließlich der theoretischen Exterieur-Abschätzung.
  </div>

  <!-- 📘 Infobox mit Tabs -->
  <div class="info-tabs">
    <div class="tab-header">
      <button class="tab-btn active" data-tab="info">Info zur Berechnung</button>
      <button class="tab-btn" data-tab="score">Score-Erklärung</button>
    </div>

    <div class="tab-content active" id="info">
      <h2>Info zur Berechnung der Hengste</h2>
      <p>
        Die Top-3-Hengste für jede Stute werden anhand der Exterieur-Merkmale berechnet. 
        Ziel ist ein Fohlen mit idealer Kombination:
        <strong>HH HH HH HH | hh hh hh hh</strong>
      </p>
      <ul>
        <li>Stärken der Stute werden geschützt</li>
        <li>Schwächen werden ausgeglichen</li>
        <li>Bewertung erfolgt für 14 Exterieurmerkmale</li>
      </ul>
    </div>

    <div class="tab-content" id="score">
      <h2>Score-Berechnung und Interpretation</h2>
      <p>
        Jedes Merkmal hat 8 Genpaare – die vorderen 4 sollen „HH“ (stark), die hinteren 4 „hh“ (weich) ergeben.  
        Ein Merkmal kann bis zu <strong>32 Punkte</strong> bringen (8 × 4 Punkte).
      </p>
      <table>
        <tr><td>400–448</td><td>Nahezu perfekte genetische Ergänzung</td></tr>
        <tr><td>300–400</td><td>Sehr gute Kombination, empfohlen</td></tr>
        <tr><td>200–300</td><td>Solide Kombination mit Potenzial</td></tr>
        <tr><td>100–200</td><td>Genetisch eher ungünstig</td></tr>
        <tr><td>0–100</td><td>Nicht empfohlen</td></tr>
      </table>
      <p>Die Berechnung berücksichtigt sowohl die besten als auch die schlechtesten Vererbungsmöglichkeiten.</p>
    </div>
  </div>

  <!-- 🧩 Filter & Sortierung -->
  <div class="control-panel">
    <label for="mareSelect">Stute auswählen:</label>
    <select id="mareSelect">
      <option value="">– Stute wählen –</option>
    </select>

    <label for="ownerSelect">Besitzer auswählen:</label>
    <select id="ownerSelect">
      <option value="">– Besitzer wählen –</option>
    </select>

    <label for="sortSelect">Sortierung:</label>
    <select id="sortSelect">
      <option value="range">Kleinste Range (Differenz)</option>
      <option value="best">Bester Score (Best)</option>
      <option value="worst">Bester Score (Worst)</option>
    </select>

    <button id="showAll">Alle anzeigen</button>
  </div>

  <!-- 🧮 Ergebnisse -->
  <main id="results"></main>

  <footer>
    © 2025 MDR-Zucht | Entwickelt mit ❤️ für die Zuchtplanung
  </footer>

  <!-- 🔗 JS-Dateien -->
  <script src="js/dataloader.js"></script>
  <script src="js/genetics.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/main.js"></script>

  <!-- 💡 Tabs-Steuerung -->
  <script>
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });
  </script>
</body>
</html>
