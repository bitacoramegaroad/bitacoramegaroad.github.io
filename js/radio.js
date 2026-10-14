(() => {
  const files = [
    { id: "cowboy-bebop", file: "data/radio/cowboy-bebop.json" },
    { id: "ghost-in-the-shell", file: "data/radio/ghost-in-the-shell.json" },
    { id: "half-life", file: "data/radio/half-life.json" },
    { id: "james-bond", file: "data/radio/james-bond.json" },
    { id: "macross", file: "data/radio/macross.json" },
    { id: "robotech", file: "data/radio/robotech.json" },
    { id: "stalker", file: "data/radio/stalker.json" },
    { id: "vision-of-escaflowne", file: "data/radio/vision-of-escaflowne.json" }
  ];

  window.setupMegaroadRadio = async (root = document) => {
    const radio = root.matches?.("#megaroad-radio") ? root : root.querySelector?.("#megaroad-radio");
    if (!radio || radio.dataset.initialized === "true") return;
    radio.dataset.initialized = "true";

    const franchiseSelect = radio.querySelector("#franchise-select");
    const playlistSelect = radio.querySelector("#playlist-select");
    const trackTitle = radio.querySelector("#track-title");
    const progressBar = radio.querySelector("#progress-bar");
    const progress = radio.querySelector("#progress-container");
    const time = radio.querySelector("#time-display");
    const setOption = (select, value, label) => select.replaceChildren(new Option(label, value));
    const playlistIdFromLink = (value) => {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" || !["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname.toLowerCase()) || url.pathname !== "/playlist") return "";
        return url.searchParams.get("list") || "";
      } catch { return ""; }
    };

    let player = null;
    let apiReady = false;
    let ready = false;
    let currentPlaylist = "";
    let timer = null;

    const formatTime = (value) => `${Math.floor((value || 0) / 60)}:${String(Math.floor((value || 0) % 60)).padStart(2, "0")}`;
    const resetProgress = () => {
      progressBar.style.width = "0%";
      time.textContent = "0:00 / 0:00";
    };
    const update = () => {
      if (!ready || !player) return;
      const duration = player.getDuration() || 0;
      const current = player.getCurrentTime() || 0;
      progressBar.style.width = `${duration ? current / duration * 100 : 0}%`;
      time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    };

    const createPlayer = () => {
      if (!apiReady || !currentPlaylist) return;
      ready = false;
      if (player) {
        const previousPlayer = player;
        player = null;
        previousPlayer.destroy();
      }

      const video = radio.querySelector(".radio-video");
      video.replaceChildren();
      const target = document.createElement("div");
      target.id = "youtube-player";
      video.appendChild(target);

      const instance = new YT.Player(target, {
        width: "100%", height: "100%",
        playerVars: { listType: "playlist", list: currentPlaylist, autoplay: 0, controls: 1, rel: 0 },
        events: {
          onReady: () => {
            if (player !== instance) return;
            ready = true;
            trackTitle.textContent = "Lista de reproducción cargada";
            if (!timer) timer = setInterval(update, 1000);
            update();
          },
          onStateChange: (event) => {
            if (player !== instance) return;
            if (event.data === YT.PlayerState.PLAYING) trackTitle.textContent = player.getVideoData().title || "Reproduciendo";
            else if (event.data === YT.PlayerState.PAUSED) trackTitle.textContent = "En pausa";
            else if (event.data === YT.PlayerState.ENDED) trackTitle.textContent = "Canción finalizada";
            update();
          },
          onError: () => {
            if (player === instance) trackTitle.textContent = "No se pudo cargar la playlist. Probá otra.";
          }
        }
      });
      player = instance;
    };

    const loadPlaylist = (playlistId) => {
      currentPlaylist = playlistId || "";
      ready = false;
      resetProgress();
      if (!currentPlaylist) {
        if (player) {
          const previousPlayer = player;
          player = null;
          previousPlayer.destroy();
        }
        radio.querySelector(".radio-video").replaceChildren();
        trackTitle.textContent = "Todavía no hay playlists para esta franquicia";
        return;
      }
      trackTitle.textContent = "Cargando lista...";
      createPlayer();
    };

    let catalogs;
    try {
      catalogs = await Promise.all(files.map(async ({ id, file }) => {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`${file} (${response.status})`);
        const data = await response.json();
        return { id, title: data.franquicia || id, playlists: Array.isArray(data.playlists) ? data.playlists : [] };
      }));
    } catch (error) {
      console.error("No se pudieron cargar las playlists de Megaroad Radio:", error);
      setOption(franchiseSelect, "", "Catálogo no disponible");
      setOption(playlistSelect, "", "No se pudieron cargar las playlists");
      franchiseSelect.disabled = true;
      playlistSelect.disabled = true;
      trackTitle.textContent = "No se pudo cargar el catálogo de música";
      return;
    }

    catalogs.forEach((catalog) => franchiseSelect.add(new Option(catalog.title, catalog.id)));
    const updatePlaylists = () => {
      const catalog = catalogs.find((item) => item.id === franchiseSelect.value);
      const playlists = (catalog?.playlists || [])
        .map((item) => ({ title: item.titulo, id: playlistIdFromLink(item.link) }))
        .filter((item) => item.title && item.id);
      playlistSelect.replaceChildren();
      if (!playlists.length) {
        playlistSelect.add(new Option("Todavía no hay playlists", ""));
        playlistSelect.disabled = true;
        loadPlaylist("");
        return;
      }
      playlists.forEach((playlist) => playlistSelect.add(new Option(playlist.title, playlist.id)));
      playlistSelect.disabled = false;
      playlistSelect.value = playlists[0].id;
      loadPlaylist(playlistSelect.value);
    };

    franchiseSelect.value = catalogs[0]?.id || "";
    updatePlaylists();
    franchiseSelect.addEventListener("change", updatePlaylists);
    playlistSelect.addEventListener("change", () => loadPlaylist(playlistSelect.value));

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      createPlayer();
    };
    const api = document.createElement("script");
    api.src = "https://www.youtube.com/iframe_api";
    document.head.append(api);

    [["playBtn", "playVideo"], ["pauseBtn", "pauseVideo"], ["stopBtn", "stopVideo"], ["nextBtn", "nextVideo"], ["prevBtn", "previousVideo"]].forEach(([id, method]) => {
      radio.querySelector(`#${id}`)?.addEventListener("click", () => { if (ready && player) player[method](); });
    });
    progress.addEventListener("click", (event) => {
      if (!ready || !player) return;
      const duration = player.getDuration() || 0;
      const bounds = progress.getBoundingClientRect();
      if (duration && bounds.width) player.seekTo(duration * Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), true);
      update();
    });
    window.addEventListener("pagehide", () => {
      if (timer) clearInterval(timer);
      if (player) player.destroy();
    }, { once: true });
  };
  if (document.querySelector("#megaroad-radio")) window.setupMegaroadRadio(document);
})();