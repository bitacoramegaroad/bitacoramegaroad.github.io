(() => {
  const toggle = document.querySelector("#share-toggle");
  const options = document.querySelector("#share-options");
  const status = document.querySelector("#share-status");
  if (!toggle || !options || !status) return;

  const getShareData = () => {
    const url = new URL(window.location.href);
    url.hash = "";
    return {
      url: url.href,
      title: document.querySelector("#note-title")?.textContent.trim() || document.title,
    };
  };

  toggle.addEventListener("click", () => {
    const opening = options.hidden;
    options.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
  });

  document.querySelectorAll("[data-share]").forEach((link) => {
    link.addEventListener("click", () => {
      const { url, title } = getShareData();
      const encodedUrl = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(title);
      if (link.dataset.share === "facebook") {
        link.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      } else if (link.dataset.share === "whatsapp") {
        link.href = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
      } else if (link.dataset.share === "x") {
        link.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      }
    });
  });

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("No se pudo copiar el enlace.");
  }

  options.querySelectorAll("[data-share-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const destination = button.dataset.shareCopy;
      try {
        await copyText(getShareData().url);
        status.textContent = destination === "Enlace"
          ? "Enlace copiado."
          : `Enlace copiado; ya podés pegarlo en ${destination}.`;
      } catch {
        status.textContent = "No se pudo copiar el enlace. Seleccionalo desde la barra de direcciones.";
      }
    });
  });
})();
