(() => {
  const returnLabel = "Regresar a la Bitácora";
  document.querySelectorAll('.nav-bottom a[href="index.html"], .nav-bottom a[href="https://bitacoramegaroad.github.io/"], footer a[href="index.html"], footer a[href="https://bitacoramegaroad.github.io/"], a#btnBitacora, a#close-button')
    .forEach((link) => { link.textContent = returnLabel; link.classList.add("site-return-button"); });

  document.addEventListener("click", (event) => {
    const contactLink = event.target.closest?.('.main-nav a[href="#contacto"]');
    const dialog = document.querySelector("#contact-modal");
    if (contactLink && dialog) {
      event.preventDefault();
      if (!dialog.open) dialog.showModal();
      dialog.querySelector("input")?.focus();
      return;
    }
    if (!dialog?.open) return;
    if (event.target.closest?.("[data-close-contact]")) {
      dialog.close();
      return;
    }
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });

  setupContentProtection();

  function setupContentProtection() {
    if (!document.querySelector("#note-content")) return;
    const message = "Contenido protegido - La Bitácora del Megaroad";
    const gifUrl = new URL("img/Alysia-anticopia.gif", document.baseURI).href;
    const warning = document.createElement("div");
    warning.id = "content-copy-warning";
    warning.hidden = true;
    warning.setAttribute("role", "status");
    warning.setAttribute("aria-label", message);

    const warningImage = document.createElement("img");
    warningImage.alt = message;
    warningImage.draggable = false;
    warning.appendChild(warningImage);
    document.body.appendChild(warning);
    document.body.classList.add("copy-protection-active");

    let warningTimer;
    let gifPromise;
    let gifObjectUrl;

    function isEditable(target) {
      const element = target?.nodeType === Node.TEXT_NODE ? target.parentElement : target;
      return Boolean(element?.closest?.("input, textarea, select, [contenteditable='true']"));
    }

    function isProtectedMedia(target) {
      const element = target?.nodeType === Node.TEXT_NODE ? target.parentElement : target;
      return Boolean(element?.closest?.("img, picture, canvas"));
    }

    function stripGifLoopMetadata(buffer) {
      const bytes = new Uint8Array(buffer);
      const signature = String.fromCharCode(...bytes.subarray(0, 6));
      if (signature !== "GIF87a" && signature !== "GIF89a") return bytes;

      const removedRanges = [];
      let offset = 13;
      const screenPacked = bytes[10];
      if (screenPacked & 0x80) offset += 3 * (1 << ((screenPacked & 0x07) + 1));

      function skipDataBlocks(position) {
        while (position < bytes.length) {
          const size = bytes[position++];
          if (size === 0) return position;
          position += size;
          if (position > bytes.length) return -1;
        }
        return -1;
      }

      while (offset < bytes.length) {
        const marker = bytes[offset];
        if (marker === 0x3b) break;

        if (marker === 0x21) {
          const extensionStart = offset;
          const label = bytes[offset + 1];
          offset += 2;

          if (label === 0xff) {
            const applicationSize = bytes[offset++];
            if (!applicationSize || offset + applicationSize > bytes.length) return bytes;
            const application = String.fromCharCode(...bytes.subarray(offset, offset + applicationSize));
            offset += applicationSize;
            const extensionEnd = skipDataBlocks(offset);
            if (extensionEnd < 0) return bytes;
            if (application === "NETSCAPE2.0" || application === "ANIMEXTS1.0") {
              removedRanges.push([extensionStart, extensionEnd]);
            }
            offset = extensionEnd;
            continue;
          }

          const extensionEnd = skipDataBlocks(offset);
          if (extensionEnd < 0) return bytes;
          offset = extensionEnd;
          continue;
        }

        if (marker === 0x2c) {
          const imagePacked = bytes[offset + 9];
          offset += 10;
          if (imagePacked & 0x80) offset += 3 * (1 << ((imagePacked & 0x07) + 1));
          offset += 1;
          offset = skipDataBlocks(offset);
          if (offset < 0) return bytes;
          continue;
        }

        return bytes;
      }

      if (!removedRanges.length) return bytes;
      const removedLength = removedRanges.reduce((sum, [start, end]) => sum + end - start, 0);
      const singlePlayGif = new Uint8Array(bytes.length - removedLength);
      let sourceOffset = 0;
      let destinationOffset = 0;
      for (const [start, end] of removedRanges) {
        const kept = bytes.subarray(sourceOffset, start);
        singlePlayGif.set(kept, destinationOffset);
        destinationOffset += kept.length;
        sourceOffset = end;
      }
      const remainder = bytes.subarray(sourceOffset);
      singlePlayGif.set(remainder, destinationOffset);
      return singlePlayGif;
    }

    function replayWarningGif() {
      if (!gifPromise) {
        gifPromise = fetch(gifUrl, { cache: "force-cache" })
          .then(async response => {
            if (!response.ok) throw new Error("No se pudo cargar el GIF de protección.");
            const buffer = await response.arrayBuffer();
            return new Blob([stripGifLoopMetadata(buffer)], { type: "image/gif" });
          })
          .catch(() => null);
      }

      gifPromise.then(blob => {
        if (!blob) {
          warningImage.removeAttribute("src");
          return;
        }
        const nextUrl = URL.createObjectURL(blob);
        const previousUrl = gifObjectUrl;
        gifObjectUrl = nextUrl;
        warningImage.src = nextUrl;
        if (previousUrl) URL.revokeObjectURL(previousUrl);
      });
    }

    function showWarning() {
      warning.hidden = false;
      replayWarningGif();
      clearTimeout(warningTimer);
      warningTimer = setTimeout(() => {
        warning.hidden = true;
      }, 6000);
    }

    function blockCopy(event) {
      if (isEditable(event.target)) return;
      event.preventDefault();
      if (event.clipboardData) event.clipboardData.setData("text/plain", message);
      showWarning();
    }

    document.addEventListener("copy", blockCopy, true);
    document.addEventListener("cut", blockCopy, true);

    document.addEventListener("selectstart", event => {
      if (isEditable(event.target)) return;
      event.preventDefault();
      showWarning();
    }, true);

    document.addEventListener("dragstart", event => {
      if (!isEditable(event.target) && isProtectedMedia(event.target)) {
        event.preventDefault();
        showWarning();
      }
    }, true);

    document.addEventListener("contextmenu", event => {
      const element = event.target?.nodeType === Node.TEXT_NODE ? event.target.parentElement : event.target;
      if (!element?.closest?.("#note-content")) return;
      event.preventDefault();
      showWarning();
    }, true);

    document.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();
      const devToolsShortcut =
        (event.ctrlKey && event.shiftKey && ["i", "j", "c", "k", "u"].includes(key)) ||
        (event.metaKey && event.altKey && ["i", "j", "c", "u"].includes(key)) ||
        ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && key === "u");

      if (event.key === "F12" || devToolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
        showWarning();
        return;
      }

      if (isEditable(event.target) || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
      if (!["a", "c", "x"].includes(key)) return;
      event.preventDefault();
      event.stopPropagation();
      showWarning();
    }, true);

    window.addEventListener("pagehide", () => {
      if (gifObjectUrl) URL.revokeObjectURL(gifObjectUrl);
    }, { once: true });
  }
  const isHome = document.body.classList.contains("home-page");
  const isFold = document.body.classList.contains("fold-page-body");
  if (document.body.classList.contains("logo-only-page")) return;
  const homeWrapper = isHome ? document.querySelector(".home-page > .wrapper") : null;
  let page = isHome ? null : document.querySelector("main.document-page");
  if (!isHome && !page && document.querySelector("#alysia-wrapper")) {
    const app = document.querySelector("#alysia-wrapper");
    page = document.createElement("main");
    page.className = "document-page alysia-page";
    app.replaceWith(page);
    page.append(app);
  }
  if (isFold) {
    const viewport = document.querySelector(".viewport-3d");
    if (viewport) {
      page = document.createElement("main");
      page.className = "fold-page-main";
      viewport.replaceWith(page);
      page.append(viewport);
    }
  }
  if (!homeWrapper && !page) return;

  async function loadChrome() {
    try {
      const response = await fetch("includes/site-shell.html");
      if (!response.ok) throw new Error("No se pudo cargar la estructura compartida del sitio.");
      const fragment = new DOMParser().parseFromString(await response.text(), "text/html");
      const header = fragment.querySelector(".main-header");
      const navigation = fragment.querySelector(".main-nav");
      const search = fragment.querySelector(".site-search");
      const sidebar = fragment.querySelector(".sidebar");
      const donations = fragment.querySelector("#overlay-donaciones");
      if (!header || !navigation || !search || !sidebar || !donations) throw new Error("La estructura compartida del sitio está incompleta.");

      const layout = isHome ? homeWrapper.querySelector(".main-layout") : null;
      if (isHome && !layout) throw new Error("No se encontró el área principal de Inicio.");

      if (isHome) {
        homeWrapper.querySelector(".main-header, .main-nav, .site-search")?.remove();
        layout.querySelector(".sidebar")?.remove();
        homeWrapper.insertBefore(header, layout);
        homeWrapper.insertBefore(navigation, layout);
        homeWrapper.insertBefore(search, layout);
        layout.append(sidebar);
      } else if (isFold) {
        page.before(header, navigation, search);
        page.after(sidebar);
      } else {
        const oldHeader = document.querySelector(".macross-header");
        const pageHeading = oldHeader?.querySelector("h1");
        if (pageHeading) page.prepend(pageHeading);
        const documentLayout = document.createElement("div");
        documentLayout.className = "document-site-layout";
        documentLayout.append(page, sidebar);
        page.classList.add("document-page-in-layout");
        navigation.classList.add("page-site-nav");

        const siteWrapper = document.createElement("div");
        siteWrapper.className = "wrapper document-site-wrapper";
        document.body.insertBefore(siteWrapper, oldHeader || page);
        oldHeader?.remove();
        siteWrapper.append(header, navigation, search, documentLayout);
      }
      document.body.append(donations);

      setupMenu(sidebar);
      if (!isHome) setupCategoryLinks(sidebar);
      setupSearch(search);
      setupCursor();
      setupHoverSound();
      setupDonations();
      if (window.setupMegaroadRadio) window.setupMegaroadRadio(sidebar);
      else if (!document.querySelector('script[src="js/radio.js"]')) {
        const radioScript = document.createElement("script");
        radioScript.src = "js/radio.js";
        document.body.append(radioScript);
      }
      if (!document.querySelector('script[src="js/favicons.js"]')) {
        const faviconScript = document.createElement("script");
        faviconScript.src = "js/favicons.js";
        document.body.append(faviconScript);
      }
      setupTwitterWidgets(sidebar);
      window.dispatchEvent(new CustomEvent("site-shell:loaded"));
    } catch (error) {
      console.error(error);
    }
  }

  function setupDonations() {
    document.addEventListener("click", (event) => {
      const overlay = document.querySelector("#overlay-donaciones");
      if (!overlay) return;
      if (event.target.closest("#btn-donaciones")) overlay.removeAttribute("hidden");
      else if (event.target.closest("#close-popup") || event.target === overlay) overlay.setAttribute("hidden", "");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") document.querySelector("#overlay-donaciones")?.setAttribute("hidden", "");
    });
  }

  function setupTwitterWidgets(sidebar) {
    if (!sidebar.querySelector(".twitter-timeline")) return;
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(sidebar);
      return;
    }
    if (document.querySelector('script[src="https://platform.x.com/widgets.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://platform.x.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.append(script);
  }

  function setupSearch(search) {
    if (isHome) return;
    const form = search.querySelector("#site-search-form");
    const input = search.querySelector("#search-query");
    const filters = ["type", "works", "genres", "formats"];
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const destination = new URL("index.html", window.location.href);
      if (input.value.trim()) destination.searchParams.set("q", input.value.trim());
      filters.forEach((key) => {
        const value = search.querySelector(`#filter-${key}`).value;
        if (value) destination.searchParams.set(key === "type" ? "filterType" : `filter${key[0].toUpperCase()}${key.slice(1)}`, value);
      });
      destination.hash = "buscador";
      window.location.href = destination.href;
    });
    fetch("data/publicaciones.json")
      .then((response) => response.ok ? response.json() : [])
      .then((publications) => {
        const groups = {
          type: ["Institucional", "Informe", "Crítica", "Análisis", ...publications.flatMap((item) => item.type || [])],
          works: publications.flatMap((item) => item.works || []),
          genres: publications.flatMap((item) => item.genres || []),
          formats: publications.flatMap((item) => item.formats || [])
        };
        filters.forEach((key) => {
          const select = search.querySelector(`#filter-${key}`);
          const label = select.options[0].textContent;
          const values = [...new Set(groups[key])].sort((a, b) => a.localeCompare(b, "es"));
          select.innerHTML = `<option value="">${label}</option>${values.map((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            return option.outerHTML;
          }).join("")}`;
        });
      })
      .catch(() => {});
  }

  function setupMenu(sidebar) {
    sidebar.querySelectorAll(".menu-header").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".menu-item");
        const opening = !item.classList.contains("active");
        Array.from(item.parentElement.children).forEach((sibling) => {
          if (sibling === item || !sibling.classList.contains("menu-item")) return;
          closeMenu(sibling);
        });
        item.classList.toggle("active", opening);
        button.setAttribute("aria-expanded", String(opening));
        const icon = button.querySelector(".toggle-icon");
        if (icon) icon.textContent = opening ? "−" : "+";
      });
    });
  }

  function closeMenu(item) {
    item.classList.remove("active");
    const button = item.querySelector(":scope > .menu-header");
    if (button) {
      button.setAttribute("aria-expanded", "false");
      const icon = button.querySelector(".toggle-icon");
      if (icon) icon.textContent = "+";
    }
    item.querySelectorAll(":scope > .submenu > .menu-item").forEach(closeMenu);
  }

  function setupCategoryLinks(sidebar) {
    sidebar.querySelectorAll("a[data-filter-type], a[data-filter-tag]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const destination = new URL("index.html", window.location.href);
        if (link.dataset.filterType) destination.searchParams.set("filterType", link.dataset.filterType);
        if (link.dataset.filterTag) destination.searchParams.set("filterTag", link.dataset.filterTag);
        destination.hash = "buscador";
        window.location.href = destination.href;
      });
    });
  }

  function setupCursor() {
    const cursor = document.querySelector(".custom-cursor");
    if (!cursor) return;
    document.addEventListener("mousemove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    document.addEventListener("mouseover", (event) => {
      if (event.target.closest("a, button, summary, input, select")) cursor.classList.add("hover");
    });
    document.addEventListener("mouseout", (event) => {
      const target = event.target.closest("a, button, summary, input, select");
      if (target && !target.contains(event.relatedTarget)) cursor.classList.remove("hover");
    });
  }

  function setupHoverSound() {
    const sound = new Audio("snd/s02.ogg");
    sound.volume = 0.4;
    document.addEventListener("mouseover", (event) => {
      if (!event.target.closest(".main-nav a, .main-nav summary, .sidebar .menu-header, .sidebar .submenu a")) return;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    });
  }

  loadChrome();
})();
