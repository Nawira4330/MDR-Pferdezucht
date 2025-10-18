document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("infoToggle");
  const box = document.getElementById("infoBox");

  toggle.addEventListener("click", () => {
    box.classList.toggle("collapsed");
    toggle.textContent = box.classList.contains("collapsed")
      ? "ℹ️ Info & Score-Erklärung anzeigen"
      : "⬆️ Informationen ausblenden";
  });
});

function openTab(evt, tabId) {
  const contents = document.querySelectorAll(".tab-content");
  const buttons = document.querySelectorAll(".tab-btn");
  contents.forEach(c => c.classList.remove("active"));
  buttons.forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}
