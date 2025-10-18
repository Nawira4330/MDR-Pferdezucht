document.addEventListener("DOMContentLoaded", () => {
  // Tabs steuern
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Info-Box ein- und ausklappen
  const infoBox = document.getElementById("infoBox");
  const toggle = document.getElementById("infoToggle");

  toggle.addEventListener("click", () => {
    const isCollapsed = infoBox.classList.contains("collapsed");
    infoBox.classList.toggle("collapsed", !isCollapsed);
    infoBox.classList.toggle("open", isCollapsed);

    // Text wechseln
    toggle.querySelector("span").textContent = isCollapsed
      ? "🔽 Info & Score-Interpretation ausblenden"
      : "ℹ️ Info & Score-Interpretation anzeigen";
  });
});
