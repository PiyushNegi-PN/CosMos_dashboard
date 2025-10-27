(() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');

  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W = 0, H = 0;

  const STAR_COUNT = 220;     // base star count (auto-scales with area)
  const METEOR_RATE = 0.05; // probability per frame to spawn a meteor
  const METEOR_MAX = 12;       // at most this many meteors at once

  let stars = [];
  let meteors = [];

  function resize() {
    const cssW = canvas.clientWidth = window.innerWidth;
    const cssH = canvas.clientHeight = window.innerHeight;
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    W = canvas.width;
    H = canvas.height;

    const area = (W * H) / (1200 * 700); // scale factor vs baseline
    const count = Math.floor(STAR_COUNT * Math.max(0.7, area));
    stars = Array.from({ length: count }, () => makeStar());
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(0.6, 1.8) * dpr, // radius
      baseAlpha: rand(0.15, 0.5),
      twinkleSpeed: rand(0.05, 0.2),
      twinklePhase: Math.random() * Math.PI * 2
    };
  }

  function drawStar(s, t) {
    const a = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.15;
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  function makeMeteor() {
    const angleDeg = -rand(20, 35);
    const angle = angleDeg * Math.PI / 180;

    // Start slightly offscreen so it slides in naturally
    const edge = Math.random() < 0.6 ? 'top' : 'left';
    let x, y;
    if (edge === 'top') {
      x = rand(-0.1 * W, 0.8 * W);
      y = -rand(0.02 * H, 0.12 * H);
    } else {
      x = -rand(0.02 * W, 0.12 * W);
      y = rand(0.0 * H, 0.6 * H);
    }

    const speed = rand(500, 800) * dpr; // px per second
    const life = rand(1.3, 1.99);         // seconds
    const length = rand(199, 304) * dpr; // trail length
    const width = rand(1.36, 2.45) * dpr;  // stroke width

    return {
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life, age: 0, length, width
    };
  }

  function drawMeteor(m) {
    // direction vector
    const len = Math.hypot(m.vx, m.vy);
    const ux = m.vx / len, uy = m.vy / len;

    const tailX = m.x - ux * m.length;
    const tailY = m.y - uy * m.length;

    // meteor life
    const lifeLeft = Math.max(0, (m.life - m.age) / m.life);
    const alpha = Math.min(1, Math.max(0, lifeLeft)) * 0.9;

    // meteor tail
    const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.4, `rgba(255,255,255,${alpha * 0.35})`);
    grad.addColorStop(1, `rgba(255,255,255,${alpha})`);

    ctx.lineWidth = m.width;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();

    // meteor head
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.width * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  let last = performance.now() / 1000;

  function tick(nowMs) {
    const now = nowMs / 1000;
    let dt = now - last;
    if (dt > 0.05) dt = 0.05; // clamp for stability 
    last = now;

    // transparent
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // starfield
    for (const s of stars) drawStar(s, now);

    // meteors
    if (meteors.length < METEOR_MAX && Math.random() < METEOR_RATE) {
      meteors.push(makeMeteor());
    }

    // draw meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      drawMeteor(m);

      //removes the offscreen
      if (m.age > m.life || m.x < -200 * dpr || m.x > W + 200 * dpr || m.y > H + 200 * dpr) {
        meteors.splice(i, 1);
      }
    }

    requestAnimationFrame(tick);
  }

  // resize and start 
  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(tick);
})();
