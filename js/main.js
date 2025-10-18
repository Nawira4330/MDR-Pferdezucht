let mares = [], stallions = [];

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starte Datenimport...");
  const data = await DataLoader.load();
  mares = data.mares;
  stallions = data.stallions;

  const mareSel = document.getElementById("mareSelect");
  const ownerSel = document.getElementById("ownerSelect");
  const sortSel = document.getElementById("sortSelect");
  const showAll = document.getElementById("showAll");

  [...new Set(mares.map(m=>m.Name).filter(Boolean))].forEach(n=>{
    const o=document.createElement("option");o.value=n;o.textContent=n;mareSel.appendChild(o);
  });
  [...new Set(mares.map(m=>m.Besitzer).filter(Boolean))].forEach(n=>{
    const o=document.createElement("option");o.value=n;o.textContent=n;ownerSel.appendChild(o);
  });

  function update() {
    UI.render(mares, stallions, mareSel.value, ownerSel.value, sortSel.value);
  }

  mareSel.addEventListener("change", update);
  ownerSel.addEventListener("change", update);
  sortSel.addEventListener("change", update);
  showAll.addEventListener("click", () => UI.render(mares, stallions, "", "", sortSel.value));

  UI.render(mares, stallions, "", "", "best");
});

