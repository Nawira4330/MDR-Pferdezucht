// ===============================
// Initialisierung & Event-Handling
// ===============================
document.getElementById("mareSelect").addEventListener("change", () => {
  const mName = document.getElementById("mareSelect").value;
  const m = mares.find((x) => x.Name === mName);
  currentMares = m ? [m] : [];
  if (currentMares.length) showResults(currentMares);
});

document.getElementById("ownerSelect").addEventListener("change", () => {
  const o = document.getElementById("ownerSelect").value;
  currentMares = mares.filter((m) => m.Besitzer === o);
  if (currentMares.length) showResults(currentMares);
});

document.getElementById("showAll").addEventListener("click", () => {
  currentMares = mares;
  showResults(currentMares);
});

document.getElementById("sortSelect").addEventListener("change", () => {
  if (currentMares.length) showResults(currentMares);
});

// Info Tabs
document.getElementById("toggleInfo").addEventListener("click", () => {
  document.getElementById("infoTabs").classList.toggle("hidden");
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const id = tab.dataset.tab;
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  });
});

// Start
loadData();
