(() => {
  const sign = document.querySelector(".sign");
  const art = document.getElementById("neon-art");
  const sparkLayer = document.querySelector(".spark-layer");
  if (!sign || !art) return;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const clickSound = new Audio("snd/neon.ogg");
  const crashSound = new Audio("snd/neon_crash.ogg");
  [clickSound, crashSound].forEach(sound => { sound.preload = "auto"; });

  let clicks = 0;
  let broken = false;
  let breakQueued = false;
  let clickTimer;

  function play(sound) {
    sound.pause();
    sound.currentTime = 0;
    const playback = sound.play();
    if (playback && typeof playback.catch === "function") playback.catch(() => {});
  }

  function burst(count, origin) {
    const [ox, oy] = origin;
    for (let i = 0; i < count; i += 1) {
      const spark = document.createElement("i");
      spark.className = "spark";
      spark.style.setProperty("--sx", (ox * 100 + random(-4, 4)) + "%");
      spark.style.setProperty("--sy", (oy * 100 + random(-4, 4)) + "%");
      spark.style.setProperty("--sw", random(24, 42) + "px");
      spark.style.setProperty("--sh", random(5, 9) + "px");
      spark.style.setProperty("--angle", random(0, 359) + "deg");
      spark.style.setProperty("--distance", random(90, 170) + "px");
      spark.style.setProperty("--duration", random(260, 430) + "ms");
      sparkLayer.appendChild(spark);
      setTimeout(() => spark.remove(), 480);
    }
  }

  function emitSparks() {
    const points = [[.22,.36],[.75,.31],[.28,.72],[.71,.73],[.5,.18],[.84,.53],[.16,.52],[.43,.84]];
    for (let burstIndex = 0; burstIndex < 5; burstIndex += 1) {
      setTimeout(() => burst(random(9,12), points[random(0, points.length - 1)]), burstIndex * 90);
    }
    setTimeout(() => burst(7, points[random(0, points.length - 1)]), 620);
    setTimeout(() => burst(7, points[random(0, points.length - 1)]), 800);
  }

  function restartFailure() {
    clearTimeout(clickTimer);
    art.classList.remove("is-click-failing");
    void art.getBoundingClientRect();
    art.classList.add("is-click-failing");
    clickTimer = setTimeout(() => art.classList.remove("is-click-failing"), 850);
  }

  async function breakSign() {
    await wait(210);
    broken = true;
    art.classList.add("is-broken");
    play(crashSound);
    emitSparks();
    const letters = [...art.querySelectorAll("#title-neon .neon-title tspan:not(.flicker-b):not(.flicker-m):not(.flicker-g)")].filter(glyph => glyph.textContent.trim());
    const letter = letters[random(0, Math.max(0, letters.length - 1))];
    await wait(460);
    if (letter) {
      letter.classList.add("late-fault");
      art.classList.add("late-failure");
      setTimeout(() => { letter.classList.remove("late-fault"); art.classList.remove("late-failure"); }, 900);
    }
  }

  function interact() {
    if (broken || breakQueued) return;
    clicks += 1;
    play(clickSound);
    restartFailure();
    if (clicks >= 3) {
      const remaining = 11 - clicks;
      if (clicks === 10 || Math.random() < 1 / remaining) {
        breakQueued = true;
        void breakSign();
      }
    }
  }

  async function startup() {
    if (reducedMotion.matches) {
      art.classList.add("frame-lit", "ship-lit", "title-lit");
      return;
    }
    art.classList.add("is-starting", "frame-lit");
    await wait(1000);
    if (broken) return;
    art.classList.add("ship-lit");
    await wait(1000);
    if (broken) return;
    art.classList.add("title-lit");
    art.classList.remove("is-starting");
    beginFaultLoops();
  }

  async function wholeSignLoop() {
    while (!broken) {
      await wait(random(8000, 16000));
      if (broken) return;
      const pulses = Math.random() < .28 ? 2 : 1;
      for (let i = 0; i < pulses && !broken; i += 1) {
        art.classList.add("is-dark");
        await wait(random(65, 145));
        art.classList.remove("is-dark");
        if (i < pulses - 1) await wait(random(100, 240));
      }
    }
  }

  function letterLoop(letter) {
    const glyph = art.querySelector("#title-neon .flicker-" + letter);
    (async () => {
      while (!broken) {
        await wait(random(6500, 17500));
        if (broken) return;
        const pulses = Math.random() < .22 ? 2 : 1;
        for (let i = 0; i < pulses && !broken; i += 1) {
          glyph.classList.add("is-out");
          await wait(random(75, 180));
          glyph.classList.remove("is-out");
          if (i < pulses - 1) await wait(random(100, 260));
        }
      }
    })();
  }

  function beginFaultLoops() {
    void wholeSignLoop();
    ["b", "m", "g"].forEach(letterLoop);
  }

  sign.addEventListener("click", interact);
  sign.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
      event.preventDefault();
      interact();
    }
  });
  void startup();
})();