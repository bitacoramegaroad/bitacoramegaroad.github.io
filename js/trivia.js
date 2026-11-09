(() => {
  "use strict";

  const ROUND_SIZE = { general: 50, macross: 30, robotech: 30 };
  const BEST_SIZE = { general: 10, macross: 4, robotech: 4 };
  const QUESTION_TIME_MS = 30_000;
  const CATEGORY_NAMES = {
    general: "Mega Trivia",
    macross: "Macross Deculture Quiz",
    robotech: "Robotech Reflex Trivia"
  };
  const QUESTION_FILES = {
    general: "data/trivias/trivia-general.json",
    macross: "data/trivias/trivia-macross.json",
    robotech: "data/trivias/trivia-robotech.json"
  };
  const RECORDS_FILE = "data/trivias/records.json";
  const SCORES_API_URL = "https://script.google.com/macros/s/AKfycbxT5HTSx-wxrxqDS5RfCpDkCKfgwcIkM0a5JggoY2WSeRo_7WRwlLrcrMJ5_RWgJQoAaQ/exec";

  const views = {
    categories: document.getElementById("trivia-categories"),
    setup: document.getElementById("trivia-setup"),
    game: document.getElementById("trivia-game"),
    results: document.getElementById("trivia-results")
  };
  const ranking = document.getElementById("trivia-ranking");
  const rankingContent = document.getElementById("ranking-content");
  const rankingCategory = document.getElementById("ranking-category");
  const homeMessage = document.getElementById("trivia-home-message");
  const nameForm = document.getElementById("trivia-name-form");
  const nickInput = document.getElementById("trivia-nick");

  const customCursor = document.querySelector(".custom-cursor");
  if (customCursor) {
    document.addEventListener("mousemove", (event) => {
      customCursor.style.left = `${event.clientX}px`;
      customCursor.style.top = `${event.clientY}px`;
    });
    document.addEventListener("mouseover", (event) => {
      if (event.target.closest("a, button, summary, input, select")) customCursor.classList.add("hover");
    });
    document.addEventListener("mouseout", (event) => {
      const target = event.target.closest("a, button, summary, input, select");
      if (target && !target.contains(event.relatedTarget)) customCursor.classList.remove("hover");
    });
  }

  let defaults = null;
  let sharedScores = [];
  let rankingRequestId = 0;
  let selectedCategory = null;
  let questions = [];
  let questionIndex = 0;
  let nick = "";
  let score = 0;
  let timerHandle = null;
  let transitionHandle = null;
  let questionStartedAt = 0;
  let locked = false;

  function loadSharedScores() {
    return new Promise((resolve, reject) => {
      const callbackName = `triviaRankingCallback${Date.now()}${++rankingRequestId}`;
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => finish(new Error("Tiempo de espera agotado.")), 15000);

      function finish(error, data) {
        window.clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
        if (error) reject(error);
        else resolve(Array.isArray(data?.puntajes) ? data.puntajes : []);
      }

      window[callbackName] = (data) => {
        if (!data?.ok) finish(new Error("No se pudieron cargar los puntajes."));
        else finish(null, data);
      };
      script.onerror = () => finish(new Error("No se pudo conectar con el ranking."));
      script.src = `${SCORES_API_URL}?callback=${callbackName}&_=${Date.now()}`;
      document.head.append(script);
    });
  }

  async function saveSharedScore(result) {
    await fetch(SCORES_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(result)
    });

    sharedScores = await loadSharedScores();
    const wasSaved = sharedScores.some((entry) =>
      entry.categoria === result.categoria &&
      String(entry.nick).trim().toLocaleLowerCase("es") === result.nick.trim().toLocaleLowerCase("es") &&
      Number(entry.puntaje) === Number(result.puntaje)
    );
    if (!wasSaved) throw new Error("No se pudo confirmar el registro.");
  }

  async function loadDefaults() {
    const response = await fetch(RECORDS_FILE, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudieron cargar los puntajes.");
    defaults = await response.json();
  }

  async function loadPool(category) {
    const response = await fetch(QUESTION_FILES[category], { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar el banco de preguntas.");
    const pool = await response.json();
    if (!Array.isArray(pool) || pool.length < ROUND_SIZE[category]) {
      throw new Error(`El banco de ${CATEGORY_NAMES[category]} no tiene suficientes preguntas para esta partida.`);
    }
    return shuffle(pool).slice(0, ROUND_SIZE[category]);
  }

  function shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function showView(name) {
    Object.entries(views).forEach(([key, element]) => { element.hidden = key !== name; });
    ranking.hidden = name === "game";
  }

  function addRankingSection(title, entries, emptyText) {
    const section = document.createElement("section");
    section.className = "trivia-ranking-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.append(heading);

    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "trivia-ranking-empty";
      empty.textContent = emptyText;
      section.append(empty);
      rankingContent.append(section);
      return;
    }

    const list = document.createElement("ol");
    list.className = "trivia-ranking-list";
    entries.forEach((entry, index) => {
      const row = document.createElement("li");
      const place = document.createElement("span");
      const name = document.createElement("span");
      const points = document.createElement("span");
      place.className = "rank-place";
      name.className = "rank-name";
      points.className = "rank-score";
      place.textContent = `${index + 1}.`;
      name.textContent = entry.nick;
      points.textContent = String(entry.puntaje);
      row.append(place, name, points);
      list.append(row);
    });
    section.append(list);
    rankingContent.append(section);
  }

  function renderRanking(category) {
    rankingCategory.textContent = CATEGORY_NAMES[category];
    rankingContent.replaceChildren();
    const initial = defaults?.[category]?.predeterminados || {};
    const fixedBest = Array.isArray(initial.mejores) ? initial.mejores : [];
    const localScores = sharedScores.filter((entry) => entry.categoria === category);

    // Cada participante ocupa un solo lugar, conservando su mejor resultado.
    const bestByPlayer = new Map();
    localScores.forEach((entry) => {
      const key = String(entry.nick || "").trim().toLocaleLowerCase("es");
      const previous = bestByPlayer.get(key);
      if (!previous || Number(entry.puntaje) > Number(previous.puntaje)) {
        bestByPlayer.set(key, entry);
      }
    });
    const playerBest = [...bestByPlayer.values()];

    // Si el jugador iguala un puntaje de muestra, reemplaza ese nombre predeterminado.
    const remainingDefaults = [...fixedBest];
    playerBest.forEach((entry) => {
      const tiedDefault = remainingDefaults.findIndex(
        (fixed) => Number(fixed.puntaje) === Number(entry.puntaje)
      );
      if (tiedDefault !== -1) remainingDefaults.splice(tiedDefault, 1);
    });

    const combinedBest = [...remainingDefaults, ...playerBest]
      .sort((a, b) => Number(b.puntaje) - Number(a.puntaje))
      .slice(0, BEST_SIZE[category]);

    addRankingSection("Mejores puntajes", combinedBest, "Todavía no hay puntajes.");

    const worst = localScores.reduce((lowest, entry) => {
      if (!lowest || Number(entry.puntaje) <= Number(lowest.puntaje)) return entry;
      return lowest;
    }, initial.peor || null);
    if (worst) {
    addRankingSection("Mención deshonrosa", [worst], "");
    }
  }

  async function chooseCategory(category) {
    selectedCategory = category;
    homeMessage.textContent = "Cargando preguntas y puntajes…";
    try {
      if (!defaults) await loadDefaults();
      try {
        sharedScores = await loadSharedScores();
      } catch {
        sharedScores = [];
      }
      questions = await loadPool(category);
      document.getElementById("setup-title").textContent = CATEGORY_NAMES[category];
      document.getElementById("setup-summary").textContent = `${ROUND_SIZE[category]} preguntas seleccionadas al azar. Cada una tiene un límite de 30 segundos.`;
      renderRanking(category);
      nickInput.value = "";
      showView("setup");
      nickInput.focus();
    } catch (error) {
      homeMessage.textContent = error.message || "No se pudo preparar la trivia. Inténtalo de nuevo.";
    }
  }

  function startGame() {
    nick = nickInput.value.trim().slice(0, 11);
    if (!nick) {
      nickInput.focus();
      return;
    }
    questionIndex = 0;
    score = 0;
    showView("game");
    renderQuestion();
  }

  function renderQuestion() {
    clearInterval(timerHandle);
    clearTimeout(transitionHandle);
    locked = false;
    const question = questions[questionIndex];
    const gameLabel = selectedCategory === "general" && question.franquicia
      ? `Franquicia: ${question.franquicia}`
      : CATEGORY_NAMES[selectedCategory];
    document.getElementById("game-category").textContent = gameLabel;
    document.getElementById("game-progress").textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
    const questionHeading = document.getElementById("trivia-question");
    questionHeading.textContent = question.pregunta;
    const gameCard = views.game;
    gameCard.classList.remove("is-question-change");
    void gameCard.offsetWidth;
    gameCard.classList.add("is-question-change");
    const answers = document.getElementById("trivia-answers");
    answers.replaceChildren();
    question.opciones.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => answerQuestion(index));
      answers.append(button);
    });
    startTimer();
  }

  function startTimer() {
    questionStartedAt = performance.now();
    const number = document.getElementById("timer-number");
    const gameCard = views.game;
    number.textContent = "30";
    gameCard.classList.remove("is-time-yellow", "is-time-orange");
    timerHandle = window.setInterval(() => {
      const elapsed = performance.now() - questionStartedAt;
      const remainingMs = Math.max(0, QUESTION_TIME_MS - elapsed);
      const seconds = Math.ceil(remainingMs / 1000);
      number.textContent = String(seconds);
      gameCard.classList.toggle("is-time-yellow", remainingMs <= 20_000 && remainingMs > 10_000);
      gameCard.classList.toggle("is-time-orange", remainingMs <= 10_000);
      if (remainingMs <= 0) answerQuestion(null);
    }, 80);
  }

  function awardForTime(remainingMs) {
    const seconds = Math.ceil(remainingMs / 1000);
    if (seconds >= 20) return 3;
    if (seconds >= 10) return 2;
    return seconds > 0 ? 1 : 0;
  }

  function answerQuestion(choiceIndex) {
    if (locked) return;
    locked = true;
    clearInterval(timerHandle);
    const question = questions[questionIndex];
    const remainingMs = choiceIndex === null ? 0 : Math.max(0, QUESTION_TIME_MS - (performance.now() - questionStartedAt));
    const answerButtons = [...document.querySelectorAll("#trivia-answers button")];
    answerButtons.forEach((button) => { button.disabled = true; });
    if (choiceIndex !== null) {
      if (choiceIndex === question.correcta) score += awardForTime(remainingMs);
      else score -= 1;
    }

    transitionHandle = window.setTimeout(() => {
      questionIndex += 1;
      if (questionIndex >= questions.length) finishGame();
      else renderQuestion();
    }, choiceIndex === null ? 800 : 950);
  }

  function finishGame() {
    clearInterval(timerHandle);
    const result = { nick, puntaje: score, categoria: selectedCategory, fecha: new Date().toISOString() };
    const saveMessage = document.getElementById("results-save-message");
    saveMessage.textContent = "Enviando puntaje…";
    document.getElementById("results-heading").textContent = `¡Bien hecho, ${nick}!`;
    document.getElementById("results-score").textContent = `${score} ${score === 1 ? "punto" : "puntos"}`;
    renderRanking(selectedCategory);
    showView("results");

    saveSharedScore(result).then(() => {
      if (!views.results.hidden && selectedCategory === result.categoria) {
        saveMessage.textContent = "Puntaje registrado.";
        renderRanking(result.categoria);
      }
    }).catch(() => {
      if (!views.results.hidden && selectedCategory === result.categoria) {
        saveMessage.textContent = "No se pudo confirmar el registro. La partida terminó correctamente.";
      }
    });
  }

  document.querySelectorAll(".trivia-category").forEach((button) => {
    button.addEventListener("click", () => chooseCategory(button.dataset.category));
  });

  nameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startGame();
  });

  document.querySelectorAll('[data-action="categories"]').forEach((button) => {
    button.addEventListener("click", () => {
      clearInterval(timerHandle);
      clearTimeout(transitionHandle);
      selectedCategory = null;
      showView("categories");
    });
  });

  loadDefaults().catch((error) => {
    homeMessage.textContent = error.message || "No se pudieron cargar los puntajes.";
  });
})();
