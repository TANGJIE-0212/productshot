(() => {
  "use strict";
  const canvas = document.getElementById("spatial-canvas");
  const status = document.getElementById("spatial-status");
  const motion = document.getElementById("spatial-motion");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    status.textContent = "浏览器不支持 Canvas，装饰场景不可用";
    status.hidden = false;
    canvas.hidden = true;
    motion.hidden = true;
    return;
  }

  let width = 0, height = 0, scale = 1, yaw = 0, layer = 0;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let phase = 0, frame = 0, lastTime = 0, paused = false, visible = false;
  const items = [];
  let stackOrder = null;
  const pt = (x, y, z) => [x, y, z];
  const materials = new Map();
  function material(hex) {
    if (!hex.startsWith("#")) return hex;
    if (materials.has(hex)) return materials.get(hex);
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const light = (r + g + b) / 3;
    let color;
    if (r > b + 17 && r > g + 16) color = light > 215 ? "#a67c85" : "#b37b97";
    else if (r > g + 16 && b > g + 2) color = light > 195 ? "#b783a8" : "#995c88";
    else if (b > r + 9 || b > g + 9) color = light > 217 ? "#526d85" : light > 169 ? "#789bb1" : "#a2bfd0";
    else color = light > 239 ? "#38465e" : light > 210 ? "#43556d" : "#7790a7";
    materials.set(hex, color);
    return color;
  }

  function project([x, y, z]) {
    const xr = x * Math.cos(yaw) - z * Math.sin(yaw);
    const zr = x * Math.sin(yaw) + z * Math.cos(yaw);
    const depth = xr + zr;
    const perspective = 1 - depth * .018;
    return { x: width * .50 + (xr - zr) * .77 * scale * perspective,
      y: height * .56 + ((xr + zr) * .39 - y * 1.02) * scale * perspective,
      depth };
  }

  function shape(vertices, color, stroke = "", lineWidth = 1) {
    const points = vertices.map(project);
    items.push({ points, color, stroke, lineWidth, layer,
      depth: stackOrder === null ? points.reduce((sum, point) => sum + point.depth, 0) / points.length : stackOrder++ });
  }
  function line(vertices, color, weight = 2) {
    shape(vertices, "", color, weight);
  }
  function box(x, y, z, w, h, d, top, front, side) {
    const b = pt(x + w, y, z), c = pt(x + w, y, z + d), e = pt(x, y, z + d);
    const A = pt(x, y + h, z), B = pt(x + w, y + h, z), C = pt(x + w, y + h, z + d), E = pt(x, y + h, z + d);
    // The isometric camera faces +x/+z: backfaces are never visible and must not
    // compete with front faces in the depth sort as the scene slowly turns.
    shape([b, c, C, B], front);
    shape([e, c, C, E], front);
    shape([A, B, C, E], top);
  }
  function ring(x, y, z, radius, axis, fill, stroke = "") {
    const vertices = Array.from({ length: 28 }, (_, i) => {
      const angle = 2 * Math.PI * i / 28;
      const a = Math.cos(angle) * radius, b = Math.sin(angle) * radius;
      return axis === "x" ? pt(x, y + a, z + b) : pt(x + a, y, z + b);
    });
    shape(vertices, fill, stroke, stroke ? 1.5 : 1);
  }
  function cylinderX(x1, x2, y, z, radius, color, rim) {
    const side = [];
    for (const x of [x1, x2]) {
      for (let i = 0; i < 24; i++) {
        const angle = i * Math.PI * 2 / 24;
        side.push(pt(x, y + Math.cos(angle) * radius, z + Math.sin(angle) * radius));
      }
    }
    for (let i = 0; i < 24; i++) {
      const j = (i + 1) % 24;
      const angle = (i + .5) * Math.PI * 2 / 24;
      if (Math.sin(angle) + Math.cos(angle) < 0) continue;
      shape([side[i], side[j], side[24 + j], side[24 + i]], color);
    }
    ring(x2 + .015, y, z, radius, "x", rim, "#7f9db0");
  }
  function scene(time) {
    items.length = 0;
    layer = 0;
    yaw = .10 + Math.sin(time * .00028) * .15;
    const float = Math.sin(time * .0014) * .09;

    // The pale floor is a modeled platform; every visible face follows the 3D projection.
    box(-3.10, -.28, -2.05, 6.15, .24, 4.45, "#fffdf9", "#c9e5f1", "#d9ecf4");
    box(-2.92, -.03, -1.87, 5.78, .075, 4.09, "#f2f9fb", "#d4eaf3", "#dceff5");
    for (let i = 0; i < 4; i++) {
      const z = -1.5 + i * .98;
      line([pt(-2.80, .052, z), pt(2.73, .052, z)], "#dfedf3", .8);
    }
    for (let i = 0; i < 6; i++) {
      const x = -2.64 + i * 1.03;
      line([pt(x, .052, -1.72), pt(x, .052, 2.04)], "#dfedf3", .8);
    }

    layer = 1;
    // Rear cyclorama, lit stage and the three product shot placements.
    box(.05, .05, -.95, 2.30, .16, 1.91, "#f7e7de", "#ebc6c2", "#f3d9d2");
    box(.20, .21, -.82, 2.00, .07, 1.62, "#fffefa", "#f5dbd2", "#fbe9df");
    box(.30, .27, -.79, .09, 1.83, .09, "#f8fbfc", "#d4e8ef", "#e3f1f5");
    box(.32, .27, -.79, 1.78, 1.75, .065, "#fff8f3", "#dfeaf0", "#fff0e9");
    // Concentric stacked surfaces cannot be sorted by average X/Z depth:
    // their equal centers let lower faces paint over upper faces during rotation.
    // For this non-intersecting stack and bounded camera angle, paint bottom-up,
    // with each box's sides followed by its top, as one ordered assembly.
    layer = 1.01;
    stackOrder = 0;
    box(.76, .29, -.22, 1.03, .20, .94, "#f1b8cc", "#da85a8", "#eaa7bf");
    box(.88, .49, -.12, .78, .07, .70, "#fffefa", "#f1e2d9", "#f9ede6");
    box(1.13, .56, .06, .30, .50, .30, "#e1f3f3", "#8fc9d5", "#b8e1e8");
    box(1.18, 1.06, .11, .20, .09, .20, "#da85a8", "#da85a8", "#da85a8");
    ring(1.28, 1.20, .21, .13, "y", "#da85a8");
    stackOrder = null;
    layer = 1;
    line([pt(.36, .29, .42), pt(.36, 1.50, .42)], "#b1d6e7", 2);
    ring(.36, 1.51, .42, .075, "y", "#fffefd", "#8bbbd1");

    // Studio camera on an articulated tripod, with a real cylindrical lens.
    const camY = 1.28 + Math.sin(time * .0009) * .018;
    for (const leg of [[-2.10, .91], [-1.38, 1.38], [-1.86, 1.73]]) {
      line([pt(-1.78, camY - .11, 1.27), pt(leg[0], .12, leg[1])], "#8099ae", 5);
      ring(leg[0], .11, leg[1], .09, "y", "#7094a9");
    }
    box(-1.87, camY - .18, 1.13, .35, .14, .32, "#95b8c7", "#6d98a9", "#84a8ba");
    box(-2.30, camY, .98, .80, .61, .62, "#ffffff", "#d8e9ef", "#e8f4f7");
    box(-2.19, camY + .59, 1.10, .42, .14, .39, "#f6b2c9", "#ce789f", "#eb9fbd");
    cylinderX(-1.50, -.98, camY + .31, 1.29, .225, "#638fa4", "#e5f3f7");
    ring(-.96, camY + .31, 1.29, .16, "x", "#355b76", "#a0cad7");
    ring(-.945, camY + .31, 1.29, .080, "x", "#85b2c4");
    box(-2.43, camY + .17, 1.13, .065, .22, .30, "#fce8f0", "#eaa1bc", "#eaa1bc");
    box(-2.07, camY + .76, 1.22, .08, .12, .08, "#667e98", "#667e98", "#667e98");

    // A high softbox points toward the stage; a thin beam is translucent, not a metric overlay.
    line([pt(-2.31, .10, -1.25), pt(-2.06, 2.53, -1.28)], "#93aabc", 5);
    line([pt(-2.06, .90, -1.28), pt(-2.45, .11, -1.60)], "#93aabc", 3);
    line([pt(-2.06, .90, -1.28), pt(-1.61, .11, -1.13)], "#93aabc", 3);
    box(-2.39, 2.33, -1.59, .66, .12, .67, "#fffefa", "#badce9", "#daedf4");
    box(-2.34, 2.12, -1.53, .56, .20, .57, "#fff8ec", "#ffe3bb", "#f9d5af");
    line([pt(-1.83, 2.14, -1.19), pt(.70, .42, -.25)], "#fff8db", 1.4);

    // Floating storyboard thumbnails and a small clapper are physical cards in 3D space.
    for (let i = 0; i < 3; i++) {
      const x = -.04 + i * .75;
      const y = 2.46 + float + (i === 1 ? .18 : 0);
      const z = -1.26 - i * .04;
      box(x, y, z, .59, .71, .055, "#fffefa", "#fffefa", "#cadee8");
      shape([pt(x + .06, y + .23, z + .058), pt(x + .53, y + .23, z + .058),
        pt(x + .53, y + .64, z + .058), pt(x + .06, y + .64, z + .058)],
      ["#f7c8d7", "#d4ecf4", "#fbe5cb"][i]);
      line([pt(x + .09, y + .13, z + .061), pt(x + .42, y + .13, z + .061)], "#a3bac9", 2);
      line([pt(x + .09, y + .09, z + .061), pt(x + .31, y + .09, z + .061)], "#b8cfda", 1.5);
    }
    box(.25, .05, 1.13, .82, .07, .55, "#49647b", "#334c65", "#53728a");
    box(.25, .12, 1.13, .82, .11, .14, "#fff7ed", "#f4c6b0", "#f6d6c5");
    for (let i = 0; i < 4; i++) {
      const x = .31 + i * .19;
      shape([pt(x, .235, 1.14), pt(x + .10, .235, 1.14),
        pt(x + .18, .235, 1.27), pt(x + .08, .235, 1.27)], "#526c82");
    }
    ring(-2.55, .07, 1.72, .085, "y", "#f3afc8");
    ring(2.53, .07, -.91, .07, "y", "#9ccbdc");
    items.sort((a, b) => a.layer - b.layer || a.depth - b.depth);
    for (const item of items) {
      const { points } = item;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      if (item.color) { ctx.closePath(); ctx.fillStyle = material(item.color); ctx.fill(); }
      if (item.stroke) {
        ctx.strokeStyle = material(item.stroke);
        ctx.lineWidth = item.lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
  }
  function render() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    scene(phase);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelsWide = Math.round(width * dpr), pixelsHigh = Math.round(height * dpr);
    // Reassigning canvas.width/height clears its bitmap. ResizeObserver can fire
    // without a size change, so only rebuild the bitmap when dimensions differ.
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    scale = Math.min(width / 8.4, height / 7.0);
    render();
  }
  new ResizeObserver(resize).observe(canvas);
  function active() {
    return document.documentElement.dataset.page === "0" && visible && !document.hidden && !paused && !reducedMotion.matches;
  }
  function tick(now) {
    frame = 0;
    if (!active()) return;
    phase += lastTime ? Math.min(now - lastTime, 48) : 0;
    lastTime = now;
    render();
    frame = requestAnimationFrame(tick);
  }
  function updateMotion() {
    motion.disabled = reducedMotion.matches;
    motion.textContent = reducedMotion.matches ? "已减少动态" : paused ? "播放动态" : "暂停动态";
    motion.setAttribute("aria-pressed", String(paused || reducedMotion.matches));
    if (active()) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }
  motion.addEventListener("click", () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateMotion);
  new MutationObserver(updateMotion).observe(document.documentElement, { attributes: true, attributeFilter: ["data-page"] });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateMotion(); }).observe(canvas);
  updateMotion();
})();
