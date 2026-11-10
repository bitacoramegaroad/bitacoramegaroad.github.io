(() => {
  const art = document.getElementById('neonArt');
  const start = () => {
    const svg = art.contentDocument;
    if (!svg) return;
    const systems = ['neon-system', 'ship-neon-system'].map(id => svg.getElementById(id)).filter(Boolean);
    const independent = ['flicker-b', 'flicker-m', 'flicker-g'].map(id => svg.getElementById(id)).filter(Boolean);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    async function pulse(targets, count = 1) {
      for (let i=0; i<count; i++) {
        targets.forEach(target => { target.style.opacity = '0.04'; });
        await wait(random(75, 170));
        targets.forEach(target => { target.style.opacity = ''; });
        if (i < count - 1) await wait(random(90, 230));
      }
    }
    if (reduced.matches) return;
    async function wholeSign() {
      await wait(random(7000, 16000));
      await pulse(systems, Math.random() < 0.3 ? 2 : 1);
      wholeSign();
    }
    function letterLoop(letter) {
      const loop = async () => {
        await wait(random(5000, 15000));
        await pulse([letter], Math.random() < 0.24 ? 2 : 1);
        loop();
      };
      loop();
    }
    wholeSign();
    independent.forEach(letterLoop);
  };
  if (art.contentDocument?.documentElement) start();
  else art.addEventListener('load', start, { once: true });
})();
