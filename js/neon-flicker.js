(() => {
  const sign = document.querySelector('.sign');
  if (!sign) return;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  if (reducedMotion.matches) {
    sign.classList.add('frame-lit', 'ship-lit', 'title-lit');
    return;
  }

  async function startupSequence() {
    sign.classList.add('is-starting', 'frame-lit');
    await wait(1000);
    sign.classList.add('ship-lit');
    await wait(1000);
    sign.classList.add('title-lit');
    sign.classList.remove('is-starting');
  }

  async function wholeSignLoop() {
    await wait(random(7500, 16000));
    const pulses = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < pulses; i++) {
      sign.classList.add('is-dark');
      await wait(random(65, 145));
      sign.classList.remove('is-dark');
      if (i < pulses - 1) await wait(random(90, 220));
    }
    wholeSignLoop();
  }

  function letterLoop(letter) {
    const glyphs = [...sign.querySelectorAll(`.flicker-${letter}`)];
    if (!glyphs.length) return;

    (async () => {
      while (true) {
        await wait(random(6200, 17000));
        const pulses = Math.random() < 0.22 ? 2 : 1;
        for (let i = 0; i < pulses; i++) {
          glyphs.forEach(glyph => glyph.classList.add('is-out'));
          await wait(random(70, 180));
          glyphs.forEach(glyph => glyph.classList.remove('is-out'));
          if (i < pulses - 1) await wait(random(100, 250));
        }
      }
    })();
  }

  startupSequence().then(() => {
    wholeSignLoop();
    ['b', 'm', 'g'].forEach(letterLoop);
  });
})();
