(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const title = document.querySelector("#note-title");
  const content = document.querySelector("#note-content");
  const status = document.querySelector("#note-status");

  function sanitize(html, baseUrl) {
    const documentFragment = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const wrapper = documentFragment.body.firstElementChild;
    wrapper.querySelectorAll("script, style, iframe, object, embed, form, button, noscript").forEach(node => node.remove());
    wrapper.querySelectorAll("*").forEach(node => {
      [...node.attributes].forEach(attribute => {
        const name = attribute.name.toLowerCase();
        if (name.startsWith("on") || name === "style" || name === "srcset") {
          node.removeAttribute(attribute.name);
          return;
        }
        if ((name === "href" || name === "src") && attribute.value) {
          try {
            const url = new URL(attribute.value, baseUrl);
            if (!["http:", "https:", "mailto:"].includes(url.protocol) || (name === "src" && url.protocol === "mailto:")) node.removeAttribute(attribute.name);
            else node.setAttribute(attribute.name, url.href);
          } catch { node.removeAttribute(attribute.name); }
        }
      });
    });
    return wrapper.innerHTML;
  }

  async function load() {
    try {
      if (!id) throw new Error("No se indicó qué publicación mostrar.");
      const catalogResponse = await fetch("data/publicaciones.json");
      if (!catalogResponse.ok) throw new Error("No se pudo cargar el catálogo.");
      const catalog = await catalogResponse.json();
      const item = catalog.find(entry => entry.id === id);
      if (!item || !item.contentUrl) throw new Error("No encontramos esa publicación.");

      const articleResponse = await fetch(item.contentUrl);
      if (!articleResponse.ok) throw new Error("La publicación no está disponible en este momento.");
      const source = new DOMParser().parseFromString(await articleResponse.text(), "text/html");
      const sourceContent = source.querySelector(".document-content");
      if (!sourceContent) throw new Error("El texto de la publicación no tiene el formato esperado.");

      const heading = source.querySelector("h1");
      const articleTitle = heading?.textContent.trim() || item.title;
      title.textContent = articleTitle;
      document.title = `${articleTitle} | La Bitácora del Megaroad`;
      const description = source.querySelector('meta[name="description"]')?.content;
      if (description) document.querySelector('meta[name="description"]').content = description;
      content.innerHTML = sanitize(sourceContent.innerHTML, item.contentUrl);
    } catch (error) {
      title.textContent = "Publicación no disponible";
      status.textContent = error.message || "No se pudo cargar la publicación.";
      console.error(error);
    }
  }

  load();
})();
