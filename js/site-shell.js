(() => {
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
      setupRadio(sidebar);
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

  function setupRadio(sidebar) {
    const playlistSelect = sidebar.querySelector("#playlist-select");
    if (!playlistSelect) return;
    const trackTitle = sidebar.querySelector("#track-title");
    const progressBar = sidebar.querySelector("#progress-bar");
    const progress = sidebar.querySelector("#progress-container");
    const time = sidebar.querySelector("#time-display");
    let player;
    let ready = false;
    let timer;

    const formatTime = (value) => `${Math.floor((value || 0) / 60)}:${String(Math.floor((value || 0) % 60)).padStart(2, "0")}`;
    const update = () => {
      if (!ready) return;
      const duration = player.getDuration() || 0;
      const current = player.getCurrentTime() || 0;
      progressBar.style.width = `${duration ? current / duration * 100 : 0}%`;
      time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    };

    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player("youtube-player", {
        width: "100%", height: "100%",
        playerVars: { listType: "playlist", list: playlistSelect.value, autoplay: 0, controls: 1, rel: 0 },
        events: {
          onReady: () => { ready = true; trackTitle.textContent = "Lista de reproducción cargada"; timer = setInterval(update, 1000); },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) trackTitle.textContent = player.getVideoData().title || "Reproduciendo";
            else if (event.data === YT.PlayerState.PAUSED) trackTitle.textContent = "En pausa";
            else if (event.data === YT.PlayerState.ENDED) trackTitle.textContent = "Canción finalizada";
            update();
          },
          onError: () => { trackTitle.textContent = "No se pudo cargar el video. Probá otra lista."; }
        }
      });
    };
    const api = document.createElement("script");
    api.src = "https://www.youtube.com/iframe_api";
    document.head.append(api);

    playlistSelect.addEventListener("change", () => {
      if (!ready) return;
      player.stopVideo();
      player.loadPlaylist({ listType: "playlist", list: playlistSelect.value, index: 0 });
      trackTitle.textContent = "Cargando lista...";
      progressBar.style.width = "0%";
      time.textContent = "0:00 / 0:00";
    });
    [["playBtn", "playVideo"], ["pauseBtn", "pauseVideo"], ["stopBtn", "stopVideo"], ["nextBtn", "nextVideo"], ["prevBtn", "previousVideo"]].forEach(([id, method]) => {
      sidebar.querySelector(`#${id}`)?.addEventListener("click", () => { if (ready) player[method](); });
    });
    progress.addEventListener("click", (event) => {
      if (!ready) return;
      const duration = player.getDuration() || 0;
      const bounds = progress.getBoundingClientRect();
      if (duration && bounds.width) player.seekTo(duration * Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), true);
      update();
    });
    window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
  }

  loadChrome();
})();
