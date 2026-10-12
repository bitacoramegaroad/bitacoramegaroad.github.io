(() => {
  const normalize = value => (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
  const groups = { type: "Tipo de texto", works: "Obra o franquicia", genres: "Género", formats: "Formato" };
  const form = document.querySelector("#site-search-form");
  const input = document.querySelector("#search-query");
  const filters = Object.fromEntries(Object.keys(groups).map(key => [key, document.querySelector(`#filter-${key}`)]));
  const output = document.querySelector("#publication-list");
  const status = document.querySelector("#publication-feed-status");
  const clearButton = document.querySelector("#clear-search");
  let publications = [];
  const pageParams = new URLSearchParams(window.location.search);
  let activeMenuTag = pageParams.get("filterTag") || "";
  const initialTypeFilter = pageParams.get("filterType") || "";
  const standardTypes = ["Institucional", "Informe", "Crítica", "Análisis"];

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function fillFilters() {
    for (const [key, label] of Object.entries(groups)) {
      const values = [...new Set([...(key === "type" ? standardTypes : []), ...publications.flatMap(item => item[key] || [])])].sort((a, b) => a.localeCompare(b, "es"));
      const emptyLabel = key === "works" ? "Todas" : "Todos";
      filters[key].innerHTML = `<option value="">${emptyLabel}</option>${values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
      filters[key].setAttribute("aria-label", label);
    }
  }
  function safeContentHtml(html, baseUrl) {
    const resolvedBase = new URL(baseUrl, document.baseURI).href;
    const fragmentDoc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const wrapper = fragmentDoc.body.firstElementChild;
    wrapper.querySelectorAll("script, style, iframe, object, embed, form, button, noscript").forEach(node => node.remove());
    wrapper.querySelectorAll("*").forEach(node => {
      [...node.attributes].forEach(attribute => {
        const name = attribute.name.toLowerCase();
        if (name.startsWith("on") || name === "style" || name === "srcset") node.removeAttribute(attribute.name);
        else if ((name === "href" || name === "src") && attribute.value) {
          if (/^\s*javascript:/i.test(attribute.value)) node.removeAttribute(attribute.name);
          else {
            try { node.setAttribute(attribute.name, new URL(attribute.value, resolvedBase).href); } catch { node.removeAttribute(attribute.name); }
          }
        }
      });
    });
    return wrapper.innerHTML;
  }
  function renderPublication(item) {
    const isExternal = /^https?:\/\//.test(item.url);
    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    const tags = Object.entries(groups).filter(([key]) => key !== "type").flatMap(([key, label]) => (item[key] || []).map(tag => `<span class="search-tag"><span>${label}:</span> ${escapeHtml(tag)}</span>`)).join("");
    const body = item.contentHtml || `<p>${escapeHtml(item.summary || "")}</p>`;
    return `<article class="publication-entry"><h2><a href="${escapeHtml(item.url)}"${target}>${escapeHtml(item.title)}</a></h2><div class="post-body-mock publication-body document-content">${body}</div>${tags ? `<div class="search-tags">${tags}</div>` : ""}</article>`;
  }
  function renderPublicationCard(item) {
    return `<a class="publication-card" href="${escapeHtml(item.url)}" aria-label="Abrir nota: ${escapeHtml(item.title)}"><svg class="publication-card-insignia" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M50 3 C49 27 41 47 15 70 C32 70 44 79 50 97 C56 79 68 70 85 70 C59 47 51 27 50 3 Z" /><path class="publication-card-insignia-gap" d="M50 3 V97" /></svg><span>${escapeHtml(item.title)}</span></a>`;
  }
  function renderFeaturedPublication(item) {
    const preview = item.previewHtml || escapeHtml(item.summary || "");
    const author = item.author ? `<p class="featured-publication-author"><strong>Autor:</strong> ${escapeHtml(item.author)}</p>` : "";
    return `<article class="featured-publication"><h2><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h2>${author}<p class="featured-publication-preview">${preview}</p><a class="featured-publication-more" href="${escapeHtml(item.url)}">Leer nota completa <span aria-hidden="true">›</span></a></article>`;
  }
  function render() {
    const query = normalize(input.value).split(/\s+/).filter(Boolean);
    const hasFilter = Object.values(filters).some(select => select.value);
    const isBrowsing = query.length || hasFilter || activeMenuTag;
    const orderedPublications = [...publications].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
    const matches = orderedPublications.filter(item => {
      if (Object.entries(filters).some(([key, select]) => select.value && !(item[key] || []).includes(select.value))) return false;
      if (activeMenuTag && !(item.menuTags || []).includes(activeMenuTag)) return false;
      const haystack = normalize([item.title, item.text || item.summary, ...(item.type || []), ...(item.works || []), ...(item.genres || []), ...(item.formats || []), ...(item.menuTags || [])].join(" "));
      return query.every(word => haystack.includes(word));
    });
    const visible = isBrowsing ? matches : matches.filter(item => !(item.type || []).includes("Institucional")).slice(0, 1);
    output.classList.toggle("publication-catalog-list", Boolean(isBrowsing));
    output.innerHTML = visible.length
      ? (isBrowsing ? visible.map(renderPublicationCard) : [renderFeaturedPublication(visible[0])]).join("")
      : '<p class="search-empty">No encontramos publicaciones con esos términos y etiquetas.</p>';
    if (isBrowsing) {
      status.textContent = `${visible.length} ${visible.length === 1 ? "publicación encontrada" : "publicaciones encontradas"}`;
      clearButton.hidden = false;
    } else {
      status.textContent = visible.length ? "Última publicación" : "Todavía no hay publicaciones.";
      clearButton.hidden = true;
    }
  }
  document.querySelectorAll(".sidebar-mock-list a[data-filter-type], .sidebar-mock-list a[data-filter-tag]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      activeMenuTag = link.dataset.filterTag || "";
      filters.type.value = link.dataset.filterType || "";
      input.value = "";
      render();
      document.querySelectorAll(".sidebar-mock-list .menu-item.active").forEach(item => {
        item.classList.remove("active");
        const button = item.querySelector(":scope > .menu-header");
        if (button) { button.setAttribute("aria-expanded", "false"); const icon = button.querySelector(".toggle-icon"); if (icon) icon.textContent = "+"; }
      });
      document.querySelector("#publication-feed").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  clearButton.addEventListener("click", () => {
    input.value = ""; Object.values(filters).forEach(select => select.value = ""); activeMenuTag = ""; render();
  });
  async function load() {
    try {
      const response = await fetch("data/publicaciones.json");
      if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
      publications = await response.json();
      await Promise.all(publications.map(async item => {
        try {
          const contentUrl = item.contentUrl || item.url;
          const page = await fetch(contentUrl);
          if (!page.ok) return;
          const source = new DOMParser().parseFromString(await page.text(), "text/html");
          const content = source.querySelector(".document-content") || source.querySelector("main") || source.body;
          item.text = [...content.querySelectorAll("h1, h2, h3, h4, p, li, blockquote")].map(node => node.textContent).join(" ").replace(/\s+/g, " ").trim();
          const authorNode = content.querySelector(".document-author") || [...content.querySelectorAll("p")].find(node => /^Autor\s*:/i.test(node.textContent.trim()));
          item.author = authorNode?.textContent.replace(/^\s*Autor\s*:\s*/i, "").trim() || item.author || "";
          const displayContent = content.cloneNode(true);
          displayContent.querySelectorAll(".article-tags, .document-kicker, .document-author").forEach(node => node.remove());
          [...displayContent.querySelectorAll("p")].filter(node => /^Autor\s*:/i.test(node.textContent.trim())).forEach(node => node.remove());
          const firstHeading = displayContent.querySelector("h1");
          if (firstHeading && normalize(firstHeading.textContent) === normalize(item.title)) firstHeading.remove();
          item.contentHtml = safeContentHtml(displayContent.innerHTML, contentUrl);
          item.previewHtml = safeContentHtml([...displayContent.querySelectorAll("p")].map(node => node.innerHTML).join(" "), contentUrl);
        } catch { item.text = item.summary || ""; }
      }));
      fillFilters();
      if (initialTypeFilter && [...filters.type.options].some(option => option.value === initialTypeFilter)) {
        filters.type.value = initialTypeFilter;
      }
      render();
    } catch { status.textContent = "No se pudo cargar el catálogo de publicaciones."; }
  }
  form.addEventListener("submit", event => { event.preventDefault(); render(); });
  input.addEventListener("input", render);
  Object.values(filters).forEach(select => select.addEventListener("change", render));
  fillFilters();
  load();
})();
