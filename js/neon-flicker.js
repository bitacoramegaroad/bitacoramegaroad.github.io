(() => {
  const svg = document.getElementById('neonTraces');
  const mask = document.getElementById('steadyNeonMask');
  const clips = document.getElementById('svgDefs');
  const letterLayer = document.getElementById('independentLetters');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';

  const glyphs = [
    ['top-l', '268,291 309,270 352,315 333,359 281,373 260,348'],
    ['top-a1', '310,258 339,249 382,273 383,311 353,336 314,322 299,296'],
    ['top-b', '363,179 397,161 433,176 446,211 433,241 401,250 372,229 356,204'],
    ['top-i', '420,148 454,136 480,160 485,191 468,216 439,220 417,194'],
    ['top-t', '477,112 513,101 547,117 556,147 542,176 510,190 486,164'],
    ['top-a2', '531,86 565,72 601,88 614,119 605,150 576,171 542,149 524,119'],
    ['top-c', '598,68 631,57 670,67 688,94 685,126 661,155 628,163 600,143 588,111'],
    ['top-o', '674,59 709,53 748,66 766,97 760,128 739,154 707,161 678,144 665,112'],
    ['top-r', '750,65 786,67 819,87 830,116 817,146 793,169 765,154 748,125'],
    ['top-a3', '818,78 852,78 884,97 899,128 889,158 867,181 837,172 812,144'],
    ['top-d', '880,91 914,96 944,117 961,146 955,174 934,198 905,184 883,155'],
    ['top-e', '947,127 975,125 1003,145 1015,173 1008,197 986,214 959,201 942,173'],
    ['top-l2', '986,178 1007,174 1022,194 1024,220 1012,240 990,229'],
    ['bottom-m', '471,852 498,842 533,850 563,882 568,913 552,940 523,931 490,912'],
    ['bottom-e', '548,868 579,862 612,875 638,898 635,927 610,948 577,940 551,916'],
    ['bottom-g', '622,884 652,876 688,883 714,903 720,933 705,959 674,971 644,962 622,939 613,910'],
    ['bottom-a1', '703,877 734,866 772,873 800,897 807,929 789,957 756,963 725,945 702,914'],
    ['bottom-r', '789,856 819,842 851,849 879,870 887,900 868,927 837,943 809,926 790,898'],
    ['bottom-o', '863,821 897,806 931,809 959,830 967,861 955,890 928,916 898,913 873,888 858,856'],
    ['bottom-a2', '941,787 973,774 1007,780 1035,802 1042,832 1026,864 997,892 968,883 945,855 931,821'],
    ['bottom-d', '1014,742 1047,727 1081,736 1108,758 1116,789 1104,819 1081,851 1053,847 1028,823 1011,790']
  ];

  function makeSvg(name, attrs = {}) {
    const node = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  }

  const groups = [];
  for (const [id, points] of glyphs) {
    const pointsForMask = makeSvg('polygon', { points, fill: 'black' });
    mask.appendChild(pointsForMask);

    const clipId = `clip-${id}`;
    const clipPath = makeSvg('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' });
    clipPath.appendChild(makeSvg('polygon', { points }));
    clips.appendChild(clipPath);

    const group = makeSvg('g', {
      class: 'letter-neon',
      'data-glyph': id,
      'clip-path': `url(#${clipId})`
    });
    group.appendChild(makeSvg('use', { href: '#neonLinesSource' }));
    letterLayer.appendChild(group);
    groups.push(group);
  }

  // Only the L in DEL and the O in MEGAROAD ever flicker.
  const flickerIds = new Set(['top-l2', 'bottom-o']);
  const flickeringLetters = new Set(groups.filter((group) => flickerIds.has(group.dataset.glyph)));
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pause = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const timers = new Map();

  function schedule(group, delay) {
    window.clearTimeout(timers.get(group));
    if (reducedMotion.matches) return;
    timers.set(group, window.setTimeout(() => flicker(group), delay));
  }

  async function flicker(group) {
    if (document.hidden) {
      schedule(group, random(1200, 2800));
      return;
    }
    const pulses = Math.random() < 0.28 ? random(2, 3) : 1;
    for (let pulse = 0; pulse < pulses; pulse += 1) {
      group.classList.add('is-flickering');
      await pause(random(95, 190));
      group.classList.remove('is-flickering');
      if (pulse < pulses - 1) await pause(random(110, 260));
    }
    schedule(group, random(6500, 17000));
  }

  for (const group of flickeringLetters) schedule(group, random(900, 6500));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      for (const group of flickeringLetters) schedule(group, random(900, 2800));
    }
  });
  reducedMotion.addEventListener?.('change', () => {
    if (!reducedMotion.matches) {
      for (const group of flickeringLetters) schedule(group, random(900, 2800));
    } else {
      for (const timer of timers.values()) window.clearTimeout(timer);
    }
  });
})();



