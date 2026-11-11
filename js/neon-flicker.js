(() => {
  const sign = document.querySelector('.sign');
  const logoObject = document.getElementById('neon-logo');
  const sparkLayer = sign?.querySelector('.spark-layer');
  if (!sign || !logoObject) return;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clickSound = new Audio('snd/neon.ogg');
  const crashSound = new Audio('snd/neon_crash.ogg');
  [clickSound, crashSound].forEach(sound => { sound.preload = 'auto'; });

  let artDocument;
  let artRoot;
  let initialized = false;
  let clicks = 0;
  let broken = false;
  let breakQueued = false;
  let clickAnimationTimer;
  let lastPointerTimestamp = -Infinity;

  function play(sound) {
    sound.pause();
    sound.currentTime = 0;
    const playback = sound.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
  }

  function restartClickAnimation() {
    if (!artRoot) return;
    clearTimeout(clickAnimationTimer);
    artRoot.classList.remove('is-click-failing');
    void artRoot.getBoundingClientRect();
    artRoot.classList.add('is-click-failing');
    clickAnimationTimer = setTimeout(() => artRoot.classList.remove('is-click-failing'), 850);
  }

  function emitSparks() {
    if (!sparkLayer) return;
    const bounds = sign.getBoundingClientRect();
    const origins = [
      [0.22, 0.36], [0.75, 0.31], [0.28, 0.72], [0.71, 0.73],
      [0.5, 0.18], [0.84, 0.53], [0.16, 0.52], [0.43, 0.84]
    ];

    function burst(count) {
      if (!bounds.width || !bounds.height) return;
      const [ox, oy] = origins[random(0, origins.length - 1)];
      for (let i = 0; i < count; i += 1) {
        const spark = document.createElement('i');
        spark.className = 'spark';
        spark.style.setProperty('--sx', `${ox * 100 + random(-3, 3)}%`);
        spark.style.setProperty('--sy', `${oy * 100 + random(-3, 3)}%`);
        spark.style.setProperty('--sw', `${random(20, 34)}px`);
        spark.style.setProperty('--sh', `${random(4, 7)}px`);
        spark.style.setProperty('--angle', `${random(0, 359)}deg`);
        spark.style.setProperty('--distance', `${random(75, 145)}px`);
        spark.style.setProperty('--duration', `${random(300, 460)}ms`);
        sparkLayer.appendChild(spark);
        setTimeout(() => spark.remove(), 520);
      }
    }

    // Five dense bursts at shutdown, then two more after the blackout.
    for (let burstIndex = 0; burstIndex < 5; burstIndex += 1) {
      setTimeout(() => burst(random(8, 11)), burstIndex * 95);
    }
    setTimeout(() => burst(6), 650);
    setTimeout(() => burst(6), 820);
  }

  async function lateLetterFailure() {
    const candidates = [...artRoot.querySelectorAll(
      '#letters-face .letter-glyph:not(.flicker-b):not(.flicker-m):not(.flicker-g)'
    )];
    if (!candidates.length) return;

    const faceLetter = candidates[random(0, candidates.length - 1)];
    const suffix = faceLetter.id.replace(/^face-/, '');
    const glowLetters = ['halo', 'face', 'hot']
      .map(layer => artRoot.querySelector(`#letters-${layer} #${layer}-${suffix}`))
      .filter(Boolean);
    await wait(460);
    if (!broken) return;
    artRoot.classList.add('is-late-failure');
    glowLetters.forEach(glyph => glyph.classList.add('late-fault'));
    setTimeout(() => {
      glowLetters.forEach(glyph => glyph.classList.remove('late-fault'));
      artRoot.classList.remove('is-late-failure');
    }, 1150);
  }

  async function breakSign() {
    // Let the last fault sound finish before the sign cuts out.
    await wait(790);
    if (broken) return;
    broken = true;
    sign.classList.add('is-broken');
    sign.setAttribute('aria-disabled', 'true');
    artRoot.classList.remove('is-click-failing', 'is-dark');
    artRoot.classList.add('is-broken');
    play(crashSound);
    emitSparks();
    void lateLetterFailure();
  }

  function interact() {
    if (!artRoot || broken || breakQueued) return;
    clicks += 1;
    play(clickSound);
    restartClickAnimation();

    // Each click from the third onward gets a fresh random break decision;
    // the tenth click is guaranteed to finish the sequence.
    if (clicks >= 3) {
      const remainingPossibleTotals = 11 - clicks;
      const shouldBreak = clicks === 10 || Math.random() < 1 / remainingPossibleTotals;
      if (shouldBreak) {
        breakQueued = true;
        void breakSign();
      }
    }
  }

  function handleEmbeddedClick(event) {
    const timestamp = event.timeStamp || performance.now();
    if (timestamp - lastPointerTimestamp < 35) return;
    lastPointerTimestamp = timestamp;
    interact();
  }

  function initializeArtwork() {
    if (initialized) return;
    artDocument = logoObject.contentDocument;
    artRoot = artDocument?.documentElement;
    if (!artRoot) return;
    initialized = true;

    // Catch clicks inside the editable external SVG and the embedded object boundary.
    artDocument.addEventListener('click', handleEmbeddedClick);
    logoObject.addEventListener('click', handleEmbeddedClick);

    sign.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault();
        interact();
      } else if (event.key === ' ' && !event.repeat) {
        event.preventDefault();
      }
    });
    sign.addEventListener('keyup', event => {
      if (event.key === ' ') {
        event.preventDefault();
        interact();
      }
    });

    void startupSequence().then(() => {
      if (broken || reducedMotion.matches) return;
      wholeSignLoop();
      ['b', 'm', 'g'].forEach(letterLoop);
    });
  }

  async function startupSequence() {
    if (reducedMotion.matches) {
      artRoot.classList.add('frame-lit', 'ship-lit', 'title-lit');
      return;
    }
    artRoot.classList.add('is-starting', 'frame-lit');
    await wait(1000);
    if (broken) return;
    artRoot.classList.add('ship-lit');
    await wait(1000);
    if (broken) return;
    artRoot.classList.add('title-lit');
    artRoot.classList.remove('is-starting');
  }

  async function wholeSignLoop() {
    while (!broken) {
      await wait(random(7500, 16000));
      if (broken) return;
      const pulses = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < pulses; i += 1) {
        if (broken) return;
        artRoot.classList.add('is-dark');
        await wait(random(65, 145));
        artRoot.classList.remove('is-dark');
        if (i < pulses - 1) await wait(random(90, 220));
      }
    }
  }

  function letterLoop(letter) {
    const glyphs = [...artRoot.querySelectorAll(`.flicker-${letter}`)];
    if (!glyphs.length) return;
    (async () => {
      while (!broken) {
        await wait(random(6200, 17000));
        if (broken) return;
        const pulses = Math.random() < 0.22 ? 2 : 1;
        for (let i = 0; i < pulses; i += 1) {
          if (broken) return;
          glyphs.forEach(glyph => glyph.classList.add('is-out'));
          await wait(random(70, 180));
          glyphs.forEach(glyph => glyph.classList.remove('is-out'));
          if (i < pulses - 1) await wait(random(100, 250));
        }
      }
    })();
  }

  logoObject.addEventListener('load', initializeArtwork, { once: true });
  if (logoObject.contentDocument?.readyState === 'complete') initializeArtwork();
})();
