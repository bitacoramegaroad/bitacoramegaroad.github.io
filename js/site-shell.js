(() => {
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
  const header = document.querySelector(".macross-header");
  const page = document.querySelector("main.document-page");
  if (!header || !page) return;

  async function loadChrome() {
    try {
      const response = await fetch("includes/site-shell.html");
      if (!response.ok) throw new Error("No se pudo cargar la navegación del sitio.");
      const fragment = new DOMParser().parseFromString(await response.text(), "text/html");
      const navigation = fragment.querySelector(".main-nav");
      const sidebar = fragment.querySelector(".sidebar");
      if (!navigation || !sidebar) throw new Error("La navegación compartida está incompleta.");

      navigation.classList.add("page-site-nav");
      header.after(navigation);

      const layout = document.createElement("div");
      layout.className = "document-site-layout";
      page.before(layout);
      layout.append(page, sidebar);
      page.classList.add("document-page-in-layout");

      // Las páginas institucionales usan el mismo contenedor central que Inicio.
      const siteWrapper = document.createElement("div");
      siteWrapper.className = "wrapper document-site-wrapper";
      document.body.insertBefore(siteWrapper, header);
      siteWrapper.append(header, navigation, layout);

      setupMenu(sidebar);
      setupCategoryLinks(sidebar);
      setupCursor();
      setupHoverSound();
      window.setupMegaroadRadio?.(sidebar);
    } catch (error) {
      console.error(error);
    }
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
      if (!event.target.closest(".page-site-nav a, .page-site-nav summary, .sidebar .menu-header, .sidebar .submenu a")) return;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    });
  }

  loadChrome();
})();
