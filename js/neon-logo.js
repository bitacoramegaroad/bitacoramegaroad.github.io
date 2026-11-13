/* ==========================================
   LOGO NEÓN INTERACTIVO — La Bitácora del Megaroad
   Reemplaza el logo de la cabecera (.main-header .logo-container img).
   Lo carga js/site-shell.js después de inyectar la estructura del sitio.
   Sonidos: snd/neon.ogg (clic) y snd/neon_crash.ogg (rotura)
   ========================================== */
(() => {
  const SIGN_MARKUP = `<svg id="neon-art" class="neon-art" viewBox="0 0 4533 3160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo de La Bitácora del Megaroad">
        <defs>
          <path id="plate-shape" d="M 3863.0,1062.4 C 3864.0,1063.4 3859.0,1067.9 3869.0,1068.4 C 3879.1,1068.9 3894.7,1069.4 3923.4,1065.4 C 3952.0,1061.4 4014.4,1047.8 4041.1,1044.3 C 4067.7,1040.8 4070.7,1039.2 4083.3,1044.3 C 4095.9,1049.3 4110.5,1063.4 4116.5,1074.5 C 4122.6,1085.5 4121.5,1098.6 4119.5,1110.7 C 4117.5,1122.8 4111.0,1136.3 4104.4,1146.9 C 4097.9,1157.5 4111.5,1159.0 4080.3,1174.1 C 4049.1,1189.1 3958.6,1219.8 3917.3,1237.4 C 3876.1,1255.0 3869.0,1270.6 3832.8,1279.7 C 3796.6,1288.7 3736.8,1281.2 3700.0,1291.8 C 3663.3,1302.3 3641.2,1323.5 3612.5,1343.1 C 3583.8,1362.7 3544.6,1392.4 3528.0,1409.5 C 3511.4,1426.6 3514.4,1409.0 3512.9,1445.7 C 3511.4,1482.4 3519.0,1595.1 3519.0,1629.8 C 3519.0,1664.5 3514.4,1635.3 3512.9,1653.9 C 3511.4,1672.6 3513.4,1708.3 3509.9,1741.5 C 3506.4,1774.7 3499.8,1812.9 3491.8,1853.1 C 3483.8,1893.4 3478.2,1930.6 3461.6,1982.9 C 3445.0,2035.2 3416.9,2111.2 3392.2,2167.0 C 3367.6,2222.9 3337.4,2276.7 3313.7,2317.9 C 3290.1,2359.2 3279.0,2376.3 3250.4,2414.5 C 3221.7,2452.7 3174.9,2510.1 3141.7,2547.3 C 3108.5,2584.5 3091.4,2602.6 3051.2,2637.9 C 3010.9,2673.1 2944.0,2726.9 2900.3,2758.6 C 2856.5,2790.3 2827.3,2806.4 2788.6,2828.0 C 2749.9,2849.6 2707.1,2870.8 2667.9,2888.4 C 2628.7,2906.0 2589.9,2920.6 2553.2,2933.6 C 2516.5,2946.7 2501.9,2954.8 2447.6,2966.8 C 2393.3,2978.9 2278.1,2998.5 2227.3,3006.1 C 2176.5,3013.6 2191.6,3012.1 2142.8,3012.1 C 2094.0,3012.1 1989.3,3010.1 1934.5,3006.1 C 1879.7,3002.1 1857.6,2996.5 1813.8,2988.0 C 1770.0,2979.4 1719.2,2968.9 1672.0,2954.8 C 1624.7,2940.7 1577.9,2923.6 1530.1,2903.5 C 1482.3,2883.3 1430.5,2858.7 1385.3,2834.0 C 1340.0,2809.4 1297.7,2782.7 1258.5,2755.6 C 1219.3,2728.4 1186.1,2702.2 1149.8,2671.1 C 1113.6,2639.9 1075.4,2604.2 1041.2,2568.4 C 1007.0,2532.7 973.8,2494.0 944.6,2456.8 C 915.5,2419.5 888.3,2379.3 866.2,2345.1 C 844.0,2310.9 830.4,2286.7 811.8,2251.5 C 793.2,2216.3 772.6,2179.1 754.5,2133.8 C 736.4,2088.6 717.3,2005.6 703.2,1979.9 C 689.1,1954.3 696.6,1975.9 670.0,1979.9 C 643.3,1983.9 571.9,1999.5 543.2,2004.0 C 514.6,2008.6 512.6,2010.1 498.0,2007.1 C 483.4,2004.0 468.8,1994.5 455.7,1985.9 C 442.6,1977.4 427.0,1963.3 419.5,1955.8 C 412.0,1948.2 412.0,1969.8 410.4,1940.7 C 408.9,1911.5 398.9,1815.9 410.4,1780.7 C 422.0,1745.5 457.7,1742.5 479.9,1729.4 C 502.0,1716.3 530.7,1706.8 543.2,1702.2 C 555.8,1697.7 549.8,1705.3 555.3,1702.2 C 560.8,1699.2 572.4,1688.7 576.4,1684.1 C 580.5,1679.6 580.5,1682.1 579.5,1675.1 C 578.4,1668.0 580.5,1654.4 570.4,1641.9 C 560.3,1629.3 528.1,1609.7 519.1,1599.6 C 510.0,1589.6 514.6,1598.6 516.1,1581.5 C 517.6,1564.4 521.6,1515.1 528.1,1497.0 C 534.7,1478.9 538.2,1481.9 555.3,1472.9 C 572.4,1463.8 614.2,1452.2 630.8,1442.7 C 647.4,1433.1 649.4,1434.6 654.9,1415.5 C 660.4,1396.4 659.9,1355.1 664.0,1328.0 C 668.0,1300.8 666.0,1299.3 679.0,1252.5 C 692.1,1205.7 720.8,1105.1 742.4,1047.3 C 764.1,989.4 788.2,945.7 808.8,905.4 C 829.4,865.2 848.1,835.0 866.2,805.8 C 884.3,776.7 897.3,757.6 917.5,730.4 C 937.6,703.2 959.2,674.6 986.9,642.9 C 1014.5,611.2 1053.3,569.9 1083.5,540.2 C 1113.6,510.6 1137.3,489.9 1168.0,464.8 C 1198.6,439.6 1231.3,414.0 1267.5,389.3 C 1303.8,364.7 1349.0,337.5 1385.3,316.9 C 1421.5,296.3 1449.6,281.7 1484.8,265.6 C 1520.1,249.5 1559.8,233.4 1596.5,220.3 C 1633.2,207.2 1667.9,197.2 1705.2,187.1 C 1742.4,177.1 1777.1,167.5 1819.8,160.0 C 1862.6,152.4 1903.3,145.4 1961.7,141.9 C 2020.0,138.3 2116.1,137.3 2169.9,138.8 C 2223.7,140.3 2248.4,145.9 2284.6,150.9 C 2320.8,155.9 2348.0,160.0 2387.2,169.0 C 2426.5,178.1 2480.8,193.2 2520.0,205.2 C 2559.2,217.3 2583.4,224.9 2622.6,241.5 C 2661.9,258.1 2716.7,284.7 2755.4,304.8 C 2794.1,325.0 2821.3,340.5 2855.0,362.2 C 2888.7,383.8 2924.4,409.0 2957.6,434.6 C 2990.8,460.3 3023.5,487.9 3054.2,516.1 C 3084.9,544.3 3110.5,568.9 3141.7,603.6 C 3172.9,638.3 3212.6,686.1 3241.3,724.4 C 3270.0,762.6 3292.6,797.3 3313.7,833.0 C 3334.9,868.7 3356.0,919.5 3368.1,938.6 C 3380.1,957.8 3372.1,946.7 3386.2,947.7 C 3400.3,948.7 3433.5,944.2 3452.6,944.7 C 3471.7,945.2 3470.2,951.7 3500.9,950.7 C 3531.5,949.7 3605.5,943.2 3636.7,938.6 C 3667.8,934.1 3671.4,927.1 3688.0,923.6 C 3704.6,920.0 3709.6,919.5 3736.3,917.5 C 3762.9,915.5 3826.3,911.0 3847.9,911.5 C 3869.5,912.0 3860.0,913.0 3866.0,920.5 C 3872.1,928.1 3882.6,941.7 3884.1,956.8 C 3885.6,971.8 3881.1,994.0 3875.1,1011.1 C 3869.0,1028.2 3852.4,1051.3 3847.9,1059.4 Z M 1005.5,1571.5 C 1005.5,977.1 1487.3,495.3 2081.7,495.3 C 2676.1,495.3 3157.9,977.1 3157.9,1571.5 C 3157.9,2165.9 2676.1,2647.7 2081.7,2647.7 C 1487.3,2647.7 1005.5,2165.9 1005.5,1571.5 Z" fill-rule="evenodd"/>
          <path id="outer-ring-route" d="M 3863.0,1062.4 C 3864.0,1063.4 3859.0,1067.9 3869.0,1068.4 C 3879.1,1068.9 3894.7,1069.4 3923.4,1065.4 C 3952.0,1061.4 4014.4,1047.8 4041.1,1044.3 C 4067.7,1040.8 4070.7,1039.2 4083.3,1044.3 C 4095.9,1049.3 4110.5,1063.4 4116.5,1074.5 C 4122.6,1085.5 4121.5,1098.6 4119.5,1110.7 C 4117.5,1122.8 4111.0,1136.3 4104.4,1146.9 C 4097.9,1157.5 4111.5,1159.0 4080.3,1174.1 C 4049.1,1189.1 3958.6,1219.8 3917.3,1237.4 C 3876.1,1255.0 3869.0,1270.6 3832.8,1279.7 C 3796.6,1288.7 3736.8,1281.2 3700.0,1291.8 C 3663.3,1302.3 3641.2,1323.5 3612.5,1343.1 C 3583.8,1362.7 3544.6,1392.4 3528.0,1409.5 C 3511.4,1426.6 3514.4,1409.0 3512.9,1445.7 C 3511.4,1482.4 3519.0,1595.1 3519.0,1629.8 C 3519.0,1664.5 3514.4,1635.3 3512.9,1653.9 C 3511.4,1672.6 3513.4,1708.3 3509.9,1741.5 C 3506.4,1774.7 3499.8,1812.9 3491.8,1853.1 C 3483.8,1893.4 3478.2,1930.6 3461.6,1982.9 C 3445.0,2035.2 3416.9,2111.2 3392.2,2167.0 C 3367.6,2222.9 3337.4,2276.7 3313.7,2317.9 C 3290.1,2359.2 3279.0,2376.3 3250.4,2414.5 C 3221.7,2452.7 3174.9,2510.1 3141.7,2547.3 C 3108.5,2584.5 3091.4,2602.6 3051.2,2637.9 C 3010.9,2673.1 2944.0,2726.9 2900.3,2758.6 C 2856.5,2790.3 2827.3,2806.4 2788.6,2828.0 C 2749.9,2849.6 2707.1,2870.8 2667.9,2888.4 C 2628.7,2906.0 2589.9,2920.6 2553.2,2933.6 C 2516.5,2946.7 2501.9,2954.8 2447.6,2966.8 C 2393.3,2978.9 2278.1,2998.5 2227.3,3006.1 C 2176.5,3013.6 2191.6,3012.1 2142.8,3012.1 C 2094.0,3012.1 1989.3,3010.1 1934.5,3006.1 C 1879.7,3002.1 1857.6,2996.5 1813.8,2988.0 C 1770.0,2979.4 1719.2,2968.9 1672.0,2954.8 C 1624.7,2940.7 1577.9,2923.6 1530.1,2903.5 C 1482.3,2883.3 1430.5,2858.7 1385.3,2834.0 C 1340.0,2809.4 1297.7,2782.7 1258.5,2755.6 C 1219.3,2728.4 1186.1,2702.2 1149.8,2671.1 C 1113.6,2639.9 1075.4,2604.2 1041.2,2568.4 C 1007.0,2532.7 973.8,2494.0 944.6,2456.8 C 915.5,2419.5 888.3,2379.3 866.2,2345.1 C 844.0,2310.9 830.4,2286.7 811.8,2251.5 C 793.2,2216.3 772.6,2179.1 754.5,2133.8 C 736.4,2088.6 717.3,2005.6 703.2,1979.9 C 689.1,1954.3 696.6,1975.9 670.0,1979.9 C 643.3,1983.9 571.9,1999.5 543.2,2004.0 C 514.6,2008.6 512.6,2010.1 498.0,2007.1 C 483.4,2004.0 468.8,1994.5 455.7,1985.9 C 442.6,1977.4 427.0,1963.3 419.5,1955.8 C 412.0,1948.2 412.0,1969.8 410.4,1940.7 C 408.9,1911.5 398.9,1815.9 410.4,1780.7 C 422.0,1745.5 457.7,1742.5 479.9,1729.4 C 502.0,1716.3 530.7,1706.8 543.2,1702.2 C 555.8,1697.7 549.8,1705.3 555.3,1702.2 C 560.8,1699.2 572.4,1688.7 576.4,1684.1 C 580.5,1679.6 580.5,1682.1 579.5,1675.1 C 578.4,1668.0 580.5,1654.4 570.4,1641.9 C 560.3,1629.3 528.1,1609.7 519.1,1599.6 C 510.0,1589.6 514.6,1598.6 516.1,1581.5 C 517.6,1564.4 521.6,1515.1 528.1,1497.0 C 534.7,1478.9 538.2,1481.9 555.3,1472.9 C 572.4,1463.8 614.2,1452.2 630.8,1442.7 C 647.4,1433.1 649.4,1434.6 654.9,1415.5 C 660.4,1396.4 659.9,1355.1 664.0,1328.0 C 668.0,1300.8 666.0,1299.3 679.0,1252.5 C 692.1,1205.7 720.8,1105.1 742.4,1047.3 C 764.1,989.4 788.2,945.7 808.8,905.4 C 829.4,865.2 848.1,835.0 866.2,805.8 C 884.3,776.7 897.3,757.6 917.5,730.4 C 937.6,703.2 959.2,674.6 986.9,642.9 C 1014.5,611.2 1053.3,569.9 1083.5,540.2 C 1113.6,510.6 1137.3,489.9 1168.0,464.8 C 1198.6,439.6 1231.3,414.0 1267.5,389.3 C 1303.8,364.7 1349.0,337.5 1385.3,316.9 C 1421.5,296.3 1449.6,281.7 1484.8,265.6 C 1520.1,249.5 1559.8,233.4 1596.5,220.3 C 1633.2,207.2 1667.9,197.2 1705.2,187.1 C 1742.4,177.1 1777.1,167.5 1819.8,160.0 C 1862.6,152.4 1903.3,145.4 1961.7,141.9 C 2020.0,138.3 2116.1,137.3 2169.9,138.8 C 2223.7,140.3 2248.4,145.9 2284.6,150.9 C 2320.8,155.9 2348.0,160.0 2387.2,169.0 C 2426.5,178.1 2480.8,193.2 2520.0,205.2 C 2559.2,217.3 2583.4,224.9 2622.6,241.5 C 2661.9,258.1 2716.7,284.7 2755.4,304.8 C 2794.1,325.0 2821.3,340.5 2855.0,362.2 C 2888.7,383.8 2924.4,409.0 2957.6,434.6 C 2990.8,460.3 3023.5,487.9 3054.2,516.1 C 3084.9,544.3 3110.5,568.9 3141.7,603.6 C 3172.9,638.3 3212.6,686.1 3241.3,724.4 C 3270.0,762.6 3292.6,797.3 3313.7,833.0 C 3334.9,868.7 3356.0,919.5 3368.1,938.6 C 3380.1,957.8 3372.1,946.7 3386.2,947.7 C 3400.3,948.7 3433.5,944.2 3452.6,944.7 C 3471.7,945.2 3470.2,951.7 3500.9,950.7 C 3531.5,949.7 3605.5,943.2 3636.7,938.6 C 3667.8,934.1 3671.4,927.1 3688.0,923.6 C 3704.6,920.0 3709.6,919.5 3736.3,917.5 C 3762.9,915.5 3826.3,911.0 3847.9,911.5 C 3869.5,912.0 3860.0,913.0 3866.0,920.5 C 3872.1,928.1 3882.6,941.7 3884.1,956.8 C 3885.6,971.8 3881.1,994.0 3875.1,1011.1 C 3869.0,1028.2 3852.4,1051.3 3847.9,1059.4 Z"/>
          <path id="inner-ring-route" d="M 1005.5,1571.5 C 1005.5,977.1 1487.3,495.3 2081.7,495.3 C 2676.1,495.3 3157.9,977.1 3157.9,1571.5 C 3157.9,2165.9 2676.1,2647.7 2081.7,2647.7 C 1487.3,2647.7 1005.5,2165.9 1005.5,1571.5 Z"/>
          <path id="title-top-route" d="M 797 1571 A 1285 1285 0 0 1 3366 1571"/>
          <path id="title-bottom-route" d="M 797 1571 A 1285 1285 0 0 0 3366 1571"/>
          <filter id="plate-blur" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="34"/></filter>
        </defs>

        <g id="plate">
          <use id="plate-fill" href="#plate-shape" fill="#858b89"/>
          <use id="plate-light" href="#plate-shape" fill="#f1fff8" opacity="0"/>
          <use href="#outer-ring-route" class="plate-edge"/>
          <use href="#inner-ring-route" class="plate-edge"/>
        </g>

        <g id="green-lights" class="light-set" aria-hidden="true">
          <g class="green-ring">
            <use href="#outer-ring-route" class="tube-halo"/>
            <use href="#outer-ring-route" class="tube-body"/>
            <use href="#outer-ring-route" class="tube-core"/>
          </g>
          <g class="green-ring">
            <use href="#inner-ring-route" class="tube-halo"/>
            <use href="#inner-ring-route" class="tube-body"/>
            <use href="#inner-ring-route" class="tube-core"/>
          </g>
        </g>

        <g id="title-off" class="title-off" aria-hidden="true">
          <text class="off-title" text-anchor="middle"><textPath href="#title-top-route" startOffset="50%" textLength="2480" lengthAdjust="spacingAndGlyphs"><tspan>L</tspan><tspan>A</tspan><tspan>&#160;</tspan><tspan class="flicker-b">B</tspan><tspan>I</tspan><tspan>T</tspan><tspan>A</tspan><tspan>C</tspan><tspan>O</tspan><tspan>R</tspan><tspan>A</tspan><tspan>&#160;</tspan><tspan>D</tspan><tspan>E</tspan><tspan>L</tspan></textPath></text>
          <text class="off-title" text-anchor="middle"><textPath href="#title-bottom-route" startOffset="50%" textLength="1700" lengthAdjust="spacingAndGlyphs"><tspan class="flicker-m">M</tspan><tspan>E</tspan><tspan class="flicker-g">G</tspan><tspan>A</tspan><tspan>R</tspan><tspan>O</tspan><tspan>A</tspan><tspan>D</tspan></textPath></text>
          <text class="off-tm" x="2745" y="2240" text-anchor="middle">TM</text>
        </g>

        <g id="ship" aria-hidden="true">
          <image id="ship-off" x="337.97665" y="936.60114" width="3763.7229" height="1233.2032" href="img/mega_off.webp" transform="matrix(0.9999379,-0.01114399,0.01169103,0.99993166,0,0)"/>
          <image id="ship-on" x="337.97665" y="936.60114" width="3763.7229" height="1233.2032" href="img/mega_on.webp" transform="matrix(0.9999379,-0.01114399,0.01169103,0.99993166,0,0)"/>
        </g>

        <g id="title-neon" class="light-set" aria-hidden="true">
          <text class="neon-title" text-anchor="middle"><textPath href="#title-top-route" startOffset="50%" textLength="2480" lengthAdjust="spacingAndGlyphs"><tspan>L</tspan><tspan>A</tspan><tspan>&#160;</tspan><tspan class="flicker-b">B</tspan><tspan>I</tspan><tspan>T</tspan><tspan>A</tspan><tspan>C</tspan><tspan>O</tspan><tspan>R</tspan><tspan>A</tspan><tspan>&#160;</tspan><tspan>D</tspan><tspan>E</tspan><tspan>L</tspan></textPath></text>
          <text class="neon-title" text-anchor="middle"><textPath href="#title-bottom-route" startOffset="50%" textLength="1700" lengthAdjust="spacingAndGlyphs"><tspan class="flicker-m">M</tspan><tspan>E</tspan><tspan class="flicker-g">G</tspan><tspan>A</tspan><tspan>R</tspan><tspan>O</tspan><tspan>A</tspan><tspan>D</tspan></textPath></text>
          <text class="neon-tm" x="2745" y="2240" text-anchor="middle">TM</text>
        </g>
      </svg>`;
  const LOGO_SELECTOR = ".main-header .logo-container img, .main-header img.blog-logo";

  function mountNeonLogo() {
    if (document.querySelector(".neon-logo")) return;
    const logo = document.querySelector(LOGO_SELECTOR);
    if (!logo) return;

    const sign = document.createElement("div");
    sign.className = "neon-logo";
    sign.setAttribute("role", "button");
    sign.tabIndex = 0;
    sign.setAttribute("aria-label", "Logo luminoso de La Bitácora del Megaroad (interactivo)");
    sign.innerHTML = SIGN_MARKUP + '<div class="nl-spark-layer" aria-hidden="true"></div>';

    // Si el logo estaba dentro de un enlace, se reemplaza el enlace completo para que el clic no navegue.
    (logo.closest("a") || logo).replaceWith(sign);
    initSign(sign);
  }

  function initSign(sign) {
    const art = sign.querySelector(".neon-art");
    const sparkLayer = sign.querySelector(".nl-spark-layer");
    if (!art || !sparkLayer) return;

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
    const alive = () => !broken && sign.isConnected;

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
        spark.className = "nl-spark";
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
        setTimeout(() => burst(random(9, 12), points[random(0, points.length - 1)]), burstIndex * 90);
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
      while (alive()) {
        await wait(random(8000, 16000));
        if (!alive()) return;
        const pulses = Math.random() < .28 ? 2 : 1;
        for (let i = 0; i < pulses && alive(); i += 1) {
          art.classList.add("is-dark");
          await wait(random(65, 145));
          art.classList.remove("is-dark");
          if (i < pulses - 1) await wait(random(100, 240));
        }
      }
    }

    function letterLoop(letter) {
      const glyph = art.querySelector("#title-neon .flicker-" + letter);
      if (!glyph) return;
      (async () => {
        while (alive()) {
          await wait(random(6500, 17500));
          if (!alive()) return;
          const pulses = Math.random() < .22 ? 2 : 1;
          for (let i = 0; i < pulses && alive(); i += 1) {
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

    // Retícula personalizada del sitio: se agranda al pasar sobre el logo, como con los botones
    sign.addEventListener("mouseenter", () => document.querySelector(".custom-cursor")?.classList.add("hover"));
    sign.addEventListener("mouseleave", () => document.querySelector(".custom-cursor")?.classList.remove("hover"));

    sign.addEventListener("click", interact);
    sign.addEventListener("keydown", event => {
      if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
        event.preventDefault();
        interact();
      }
    });
    void startup();
  }

  window.mountNeonLogo = mountNeonLogo;
})();
