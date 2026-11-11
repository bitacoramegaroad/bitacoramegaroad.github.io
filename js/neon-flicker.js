(() => {
  const sign = document.querySelector('.sign');
  if (!sign) return;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sparkLayer = sign.querySelector('.spark-layer');
  const clickSound = new Audio('snd/neon.ogg');
  const crashSound = new Audio('snd/neon_crash.ogg');
  const crowdReactions = [
    new Audio('snd/crowd-shocked.mp3'),
    new Audio('snd/crowd-disappointment.mp3'),
    new Audio('snd/mama-cortaste-toda-la-loz.mp3')
  ];
  [clickSound, crashSound, ...crowdReactions].forEach(sound => { sound.preload = 'auto'; });

  let clicks = 0;
  let broken = false;
  let breakQueued = false;
  let clickAnimationTimer;

  function play(sound) {
    sound.pause();
    sound.currentTime = 0;
    const playback = sound.play();
    if (playback && typeof playback.catch === 'function') playback.catch(() => {});
  }

  function restartClickAnimation() {
    clearTimeout(clickAnimationTimer);
    sign.classList.remove('is-click-failing');
    void sign.offsetWidth;
    sign.classList.add('is-click-failing');
    clickAnimationTimer = setTimeout(() => sign.classList.remove('is-click-failing'), 850);
  }

  function emitSparks() {
    if (!sparkLayer) return;
    const bounds = sign.getBoundingClientRect();
    const origin = [
      [0.22, 0.36], [0.75, 0.31], [0.28, 0.72], [0.71, 0.73],
      [0.5, 0.18], [0.84, 0.53], [0.16, 0.52]
    ];

    function burst(count) {
      if (bounds.width === 0 || bounds.height === 0) return;
      const [ox, oy] = origin[random(0, origin.length - 1)];
      for (let i = 0; i < count; i += 1) {
        const spark = document.createElement('i');
        spark.className = 'spark';
        spark.style.setProperty('--sx', `${ox * 100 + random(-2, 2)}%`);
        spark.style.setProperty('--sy', `${oy * 100 + random(-2, 2)}%`);
        spark.style.setProperty('--sw', `${random(12, 20)}px`);
        spark.style.setProperty('--sh', `${random(3, 5)}px`);
        spark.style.setProperty('--angle', `${random(0, 359)}deg`);
        spark.style.setProperty('--distance', `${random(44, 96)}px`);
        spark.style.setProperty('--duration', `${random(250, 390)}ms`);
        sparkLayer.appendChild(spark);
        setTimeout(() => spark.remove(), 450);
      }
    }

    // Four quick bursts, then two isolated sparks after the blackout.
    for (let burstIndex = 0; burstIndex < 4; burstIndex += 1) {
      setTimeout(() => burst(random(3, 4)), burstIndex * 105);
    }
    setTimeout(() => burst(1), 560);
    setTimeout(() => burst(1), 720);
  }

  async function lateLetterFailure() {
    const candidates = [...sign.querySelectorAll('#letters-face .letter-glyph:not(.flicker-b):not(.flicker-m):not(.flicker-g)')];
    if (!candidates.length) return;

    const faceLetter = candidates[random(0, candidates.length - 1)];
    const suffix = faceLetter.id.replace(/^face-/, '');
    const glowLetters = ['halo', 'face', 'hot']
      .map(layer => sign.querySelector(`#letters-${layer} #${layer}-${suffix}`))
      .filter(Boolean);
    await wait(460);
    if (!broken) return;
    sign.classList.add('is-late-failure');
    glowLetters.forEach(glyph => glyph.classList.add('late-fault'));
    setTimeout(() => {
      glowLetters.forEach(glyph => glyph.classList.remove('late-fault'));
      sign.classList.remove('is-late-failure');
    }, 1150);
  }

  async function breakSign() {
    // Let the final malfunction sound play before the crash and blackout.
    await wait(790);
    if (broken) return;
    broken = true;
    sign.classList.remove('is-click-failing', 'is-dark');
    sign.classList.add('is-broken');
    sign.setAttribute('aria-disabled', 'true');
    play(crashSound);
    // Let the impact begin, then layer in one of the two crowd reactions.
    setTimeout(() => play(crowdReactions[random(0, crowdReactions.length - 1)]), 420);
    emitSparks();
    void lateLetterFailure();
  }

  function interact() {
    if (broken || breakQueued) return;
    clicks += 1;
    play(clickSound);
    restartClickAnimation();

    // Re-roll after every tap: the first three cannot break it, and the
    // tenth tap is guaranteed to do so. This makes every total from 3 to 10 possible.
    if (clicks >= 3) {
      const remainingPossibleTotals = 11 - clicks;
      const shouldBreak = clicks === 10 || Math.random() < 1 / remainingPossibleTotals;
      if (shouldBreak) {
        breakQueued = true;
        void breakSign();
      }
    }
  }

  sign.addEventListener('click', interact);
  sign.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.repeat) {
      event.preventDefault();
      sign.click();
    }
    if (event.key === ' ' && !event.repeat) {
      event.preventDefault();
      sign.classList.add('is-key-pressed');
    }
  });
  sign.addEventListener('keyup', event => {
    if (event.key === ' ') {
      event.preventDefault();
      sign.classList.remove('is-key-pressed');
      sign.click();
    }
  });

  async function startupSequence() {
    if (reducedMotion.matches) {
      sign.classList.add('frame-lit', 'ship-lit', 'title-lit');
      return;
    }
    sign.classList.add('is-starting', 'frame-lit');
    await wait(1000);
    if (broken) return;
    sign.classList.add('ship-lit');
    await wait(1000);
    if (broken) return;
    sign.classList.add('title-lit');
    sign.classList.remove('is-starting');
  }

  async function wholeSignLoop() {
    while (!broken) {
      await wait(random(7500, 16000));
      if (broken) return;
      const pulses = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < pulses; i += 1) {
        if (broken) return;
        sign.classList.add('is-dark');
        await wait(random(65, 145));
        sign.classList.remove('is-dark');
        if (i < pulses - 1) await wait(random(90, 220));
      }
    }
  }

  function letterLoop(letter) {
    const glyphs = [...sign.querySelectorAll(`.flicker-${letter}`)];
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

  startupSequence().then(() => {
    if (broken) return;
    wholeSignLoop();
    ['b', 'm', 'g'].forEach(letterLoop);
  });
})();
