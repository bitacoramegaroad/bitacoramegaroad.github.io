(() => {
  "use strict";

  const ROUND_SIZE = { general: 50, macross: 30, robotech: 30 };
  const CATEGORY_NAMES = {
    general: "Mega Trivia",
    macross: "Trivia Deculture",
    robotech: "Trivia Reflex"
  };
  const QUESTION_FILES = {
    general: "data/trivias/trivia-general.json",
    macross: "data/trivias/trivia-macross.json",
    robotech: "data/trivias/trivia-robotech.json"
  };
  const RECORDS_FILE = "data/trivias/records.json";
  const PREVIEW_STORAGE_KEY = "megaroad-trivia-preview-scores";

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

  let defaults = null;
  let selectedCategory = null;
  let questions = [];
  let questionIndex = 0;
  let nick = "";
  let score = 0;
  let timerHandle = null;
  let transitionHandle = null;
  let questionStartedAt = 0;
  let locked = false;

  const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  function readPreviewScores() {
    try {
      const stored = JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY) || "{}");
      return stored.month === currentMonth() && stored.scores ? stored.scores : {};
    } catch {
      return {};
    }
  }

  function writePreviewScore(category, result) {
    const monthly = readPreviewScores();
    monthly[category] = Array.isArray(monthly[category]) ? monthly[category] : [];
    monthly[category].push(result);
    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ month: currentMonth(), scores: monthly }));
  }

  async function loadDefaults() {
    const response = await fetch(RECORDS_FILE, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudieron cargar los récords iniciales.");
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
    const localBest = readPreviewScores()[category] || [];
    const combinedBest = [...fixedBest, ...localBest]
      .sort((a, b) => Number(b.puntaje) - Number(a.puntaje))
      .slice(0, 10);

    addRankingSection("Mejores puntajes", combinedBest, "Todavía no hay puntajes.");

    const worst = initial.peor;
    if (worst) {
    addRankingSection("Mención deshonrosa", [worst], "");
    }
  }

  async function chooseCategory(category) {
    selectedCategory = category;
    homeMessage.textContent = "Cargando preguntas y récords…";
    try {
      if (!defaults) await loadDefaults();
      questions = await loadPool(category);
      document.getElementById("setup-title").textContent = CATEGORY_NAMES[category];
      document.getElementById("setup-summary").textContent = `${ROUND_SIZE[category]} preguntas seleccionadas al azar. Cada una tiene un límite de 20 segundos.`;
      renderRanking(category);
      nickInput.value = "";
      showView("setup");
      nickInput.focus();
    } catch (error) {
      homeMessage.textContent = error.message || "No se pudo preparar la trivia. Intentá de nuevo.";
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
    document.getElementById("game-category").textContent = CATEGORY_NAMES[selectedCategory];
    document.getElementById("game-progress").textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
    document.getElementById("trivia-question").textContent = question.pregunta;
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
    const bar = document.getElementById("timer-bar");
    number.textContent = "20";
    bar.style.width = "100%";
    bar.classList.remove("is-low");
    timerHandle = window.setInterval(() => {
      const elapsed = performance.now() - questionStartedAt;
      const remainingMs = Math.max(0, 20_000 - elapsed);
      const seconds = Math.ceil(remainingMs / 1000);
      number.textContent = String(seconds);
      bar.style.width = `${(remainingMs / 20_000) * 100}%`;
      bar.classList.toggle("is-low", remainingMs <= 5_000);
      if (remainingMs <= 0) answerQuestion(null);
    }, 80);
  }

  function awardForTime(remainingMs) {
    const seconds = Math.ceil(remainingMs / 1000);
    if (seconds >= 15) return 3;
    if (seconds >= 9) return 2;
    return seconds > 0 ? 1 : 0;
  }

  function answerQuestion(choiceIndex) {
    if (locked) return;
    locked = true;
    clearInterval(timerHandle);
    const question = questions[questionIndex];
    const remainingMs = choiceIndex === null ? 0 : Math.max(0, 20_000 - (performance.now() - questionStartedAt));
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
    try {
      writePreviewScore(selectedCategory, result);
      document.getElementById("results-save-message").textContent = "Puntaje guardado.";
    } catch {
      document.getElementById("results-save-message").textContent = "No se pudo guardar el puntaje.";
    }
    document.getElementById("results-heading").textContent = `¡Bien jugado, ${nick}!`;
    document.getElementById("results-score").textContent = `${score} ${score === 1 ? "punto" : "puntos"}`;
    renderRanking(selectedCategory);
    showView("results");
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
    homeMessage.textContent = error.message || "No se pudieron cargar los récords.";
  });
})();
