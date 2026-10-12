(() => {
  const normalize = (value) => (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
  const groups = { type: "Tipo de texto", works: "Obra o franquicia", genres: "Género", formats: "Formato" };
  const input = document.querySelector("#search-query");
  const filters = Object.fromEntries(Object.keys(groups).map(key => [key, document.querySelector(`#filter-${key}`)]));
  const results = document.querySelector("#search-results");
  const status = document.querySelector("#search-status");
  let publications = [];

  function fillFilters() {
    for (const [key, label] of Object.entries(groups)) {
      const values = [...new Set(publications.flatMap(item => item[key] || []))].sort((a, b) => a.localeCompare(b, "es"));
      filters[key].innerHTML = `<option value="">Todos</option>${values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
      filters[key].setAttribute("aria-label", label);
    }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function tagMarkup(item) {
    return Object.entries(groups).flatMap(([key, label]) => (item[key] || []).map(tag => `<span class="search-tag" data-group="${key}"><span>${label}:</span> ${escapeHtml(tag)}</span>`)).join("");
  }
  function render() {
    const query = normalize(input.value).split(/\s+/).filter(Boolean);
    const filtered = publications.filter(item => {
      if (Object.entries(filters).some(([key, select]) => select.value && !(item[key] || []).includes(select.value))) return false;
      const haystack = normalize([item.title, item.text, ...(item.type || []), ...(item.works || []), ...(item.genres || []), ...(item.formats || [])].join(" "));
      return query.every(word => haystack.includes(word));
    });
    results.innerHTML = filtered.length ? filtered.map(item => `<article class="search-result"><p class="search-result-type">${escapeHtml((item.type || []).join(" · "))}</p><h2><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h2><p class="search-result-excerpt">${escapeHtml(item.text).slice(0, 260)}${item.text.length > 260 ? "…" : ""}</p><div class="search-tags">${tagMarkup(item)}</div><a class="search-open" href="${escapeHtml(item.url)}">Leer texto <span aria-hidden="true">›</span></a></article>`).join("") : '<p class="search-empty">No encontramos textos con esos términos y filtros. Probá con otras palabras o quitá algún filtro.</p>';
    status.textContent = `${filtered.length} ${filtered.length === 1 ? "texto encontrado" : "textos encontrados"}`;
  }
  async function load() {
    try {
      const response = await fetch("data/publicaciones.json");
      if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
      publications = await response.json();
      await Promise.all(publications.map(async item => {
        try {
          const page = await fetch(item.url);
          if (!page.ok) return;
          const source = new DOMParser().parseFromString(await page.text(), "text/html");
          const content = source.querySelector(".document-content") || source.querySelector("main");
          item.text = [...(content?.querySelectorAll("h1, h2, h3, p, li, blockquote") || [])].map(node => node.textContent).join(" ").replace(/\s+/g, " ").trim();
        } catch { item.text = ""; }
      }));
      fillFilters();
      render();
    } catch {
      status.textContent = "No se pudo cargar el catálogo de textos.";
      results.innerHTML = '<p class="search-empty">Recargá la página dentro del sitio para volver a intentarlo.</p>';
    }
  }
  input.addEventListener("input", render);
  Object.values(filters).forEach(select => select.addEventListener("change", render));
  document.querySelector("#clear-search").addEventListener("click", () => {
    input.value = "";
    Object.values(filters).forEach(select => select.value = "");
    render();
    input.focus();
  });
  load();
})();



