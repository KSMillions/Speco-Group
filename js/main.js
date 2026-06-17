/* ============================================================
   SPECO GROUP — main.js
   - Navbar scroll effect
   - Mobile menu toggle
   - Scroll reveal (IntersectionObserver)
   - Hero particle/pipeline canvas
   - Sector Selector tab switching
   - DocuFlow Pro dashboard animations (laptop + phone canvas)
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAVBAR SCROLL ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ── 2. MOBILE MENU ─────────────────────────────────────── */
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const navLinks   = document.getElementById('nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('active');
      mobileBtn.classList.toggle('active', open);
      mobileBtn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileBtn.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* ── 3. SCROLL REVEAL ───────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }


  /* ── 4. HERO CANVAS — Teal Pipeline Network ─────────────── */
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    initHeroCanvas(heroCanvas);
  }


  /* ── 5. SECTOR SELECTOR ─────────────────────────────────── */
  const sectorTabs    = document.querySelectorAll('.sector-tab');
  const sectorPanels  = document.querySelectorAll('.sector-content');
  if (sectorTabs.length) {
    sectorTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.sector;
        sectorTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        sectorPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const activePanel = document.getElementById('sector-' + target);
        if (activePanel) activePanel.classList.add('active');
      });
    });
  }


  /* ── 6. DOCUFLOW PRO CANVAS ANIMATIONS ──────────────────── */
  const laptopCanvas = document.getElementById('laptop-canvas');
  const phoneCanvas  = document.getElementById('phone-canvas');
  if (laptopCanvas) initLaptopDashboard(laptopCanvas);
  if (phoneCanvas)  initPhoneDashboard(phoneCanvas);

}); // end DOMContentLoaded


/* ══════════════════════════════════════════════════════════
   HERO CANVAS — animated teal particle network
══════════════════════════════════════════════════════════ */
function initHeroCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, nodes, animId;

  const TEAL   = 'rgba(0, 229, 195,';
  const BLUE   = 'rgba(0, 153, 255,';
  const NODE_COUNT = 55;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildNodes();
  }

  function buildNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.8,
      pulse: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, H * 0.9);
    grad.addColorStop(0, 'rgba(10, 20, 35, 1)');
    grad.addColorStop(1, 'rgba(7, 9, 15, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const GRID = 60;
    for (let x = 0; x < W; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const t = performance.now() / 1000;

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      n.pulse += 0.015;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    const CONN_DIST = 160;

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONN_DIST) {
          const alpha = (1 - dist / CONN_DIST) * 0.25;
          // Alternate between teal and blue for lines
          const col = (i + j) % 3 === 0 ? BLUE : TEAL;
          ctx.strokeStyle = col + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach((n, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
      const col = i % 4 === 0 ? BLUE : TEAL;
      // Glow
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5 * pulse);
      grd.addColorStop(0, col + 0.35 + ')');
      grd.addColorStop(1, col + '0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5 * pulse, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = col + (0.7 + 0.3 * pulse) + ')';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  draw();
}


/* ══════════════════════════════════════════════════════════
   LAPTOP DASHBOARD — DocuFlow Pro animated interface
══════════════════════════════════════════════════════════ */
function initLaptopDashboard(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, animId, startTime;

  // Document queue items
  const QUEUE = [
    { label: 'INV-2024-0891', status: 'Processing', color: '#0099FF', progress: 0.72 },
    { label: 'CTR-LEGAL-044',  status: 'In Review',  color: '#F59E0B', progress: 0.45 },
    { label: 'KYC-FIN-2201',   status: 'Approved',   color: '#00E5C3', progress: 1.0  },
    { label: 'RPT-OPS-1103',   status: 'Queued',     color: '#7A8299', progress: 0.12 },
    { label: 'SHP-LOG-7744',   status: 'Routing',    color: '#A855F7', progress: 0.6  },
  ];
  let counter = 1247;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, W, H);

    // ── Top bar
    ctx.fillStyle = '#0E1117';
    ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = '#00E5C3';
    ctx.font = `bold ${W * 0.045}px 'Outfit', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('DocuFlow Pro', W * 0.04, 15);
    // Pulsing dot
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.5);
    ctx.fillStyle = `rgba(0,229,195,${0.5 + 0.5 * pulse})`;
    ctx.beginPath();
    ctx.arc(W - W * 0.06, 11, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7A8299';
    ctx.font = `${W * 0.035}px Inter, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('LIVE', W - W * 0.09, 15);

    // ── Stats row
    const statY = 35;
    const stats = [
      { label: 'Processed', value: String(counter + Math.floor(elapsed * 0.3)), color: '#00E5C3' },
      { label: 'Routing',   value: '23',   color: '#0099FF' },
      { label: 'Pending',   value: '8',    color: '#F59E0B' },
    ];
    stats.forEach((s, i) => {
      const x = W * 0.04 + i * (W * 0.32);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, x, statY, W * 0.28, H * 0.15, 4);
      ctx.fill();
      ctx.fillStyle = s.color;
      ctx.font = `bold ${W * 0.07}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(s.value, x + W * 0.14, statY + H * 0.09);
      ctx.fillStyle = '#4A5168';
      ctx.font = `${W * 0.036}px Inter, sans-serif`;
      ctx.fillText(s.label, x + W * 0.14, statY + H * 0.13);
    });

    // ── Pipeline flow diagram
    const flowY = statY + H * 0.2;
    const NODES = ['Ingest', 'Parse', 'Route', 'Review', 'Approve'];
    const nodeW = W / (NODES.length + 1);
    NODES.forEach((label, i) => {
      const nx = nodeW * (i + 1);
      const ny = flowY + H * 0.06;
      const active = i <= (Math.floor(elapsed * 0.8) % (NODES.length + 1));

      // connector line
      if (i < NODES.length - 1) {
        const nx2 = nodeW * (i + 2);
        const prog = active ? 1 : 0;
        // background line
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(nx + 12, ny);
        ctx.lineTo(nx2 - 12, ny);
        ctx.stroke();
        // animated fill
        if (active) {
          const grad = ctx.createLinearGradient(nx + 12, 0, nx2 - 12, 0);
          grad.addColorStop(0, '#00E5C3');
          grad.addColorStop(1, '#0099FF');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(nx + 12, ny);
          ctx.lineTo(nx2 - 12, ny);
          ctx.stroke();
        }
      }

      // node circle
      const nodeColor = active ? (i === 4 ? '#00E5C3' : '#0099FF') : '#1A1D26';
      const glowAlpha = active ? 0.3 + 0.15 * Math.sin(elapsed * 3 + i) : 0;
      if (glowAlpha > 0) {
        const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, 22);
        grd.addColorStop(0, `rgba(0,229,195,${glowAlpha})`);
        grd.addColorStop(1, 'rgba(0,229,195,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(nx, ny, 22, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = active ? 'rgba(0,229,195,0.12)' : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = active ? '#00E5C3' : '#1A1D26';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(nx, ny, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      ctx.fillStyle = active ? '#00E5C3' : '#2A2D38';
      ctx.font = `${W * 0.038}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, nx, ny + H * 0.095);
    });

    // ── Document queue list
    const queueY = flowY + H * 0.23;
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    roundRect(ctx, W * 0.04, queueY, W * 0.92, H * 0.44, 6);
    ctx.fill();

    ctx.fillStyle = '#4A5168';
    ctx.font = `600 ${W * 0.036}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Document Queue', W * 0.06, queueY + H * 0.05);

    const rowH = (H * 0.38) / QUEUE.length;
    QUEUE.forEach((doc, i) => {
      const ry = queueY + H * 0.09 + i * rowH;
      // Animate progress slightly
      const animProgress = Math.min(1, doc.progress + 0.05 * Math.sin(elapsed * 1.5 + i));

      // row bg on hover sim
      if (i === Math.floor(elapsed) % QUEUE.length) {
        ctx.fillStyle = 'rgba(0,229,195,0.04)';
        roundRect(ctx, W * 0.045, ry - rowH * 0.1, W * 0.91, rowH * 0.85, 4);
        ctx.fill();
      }

      // label
      ctx.fillStyle = '#EEF0F8';
      ctx.font = `500 ${W * 0.036}px 'Inter', sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(doc.label, W * 0.065, ry + rowH * 0.35);

      // status badge
      ctx.fillStyle = doc.color + '22';
      roundRect(ctx, W * 0.36, ry, W * 0.2, rowH * 0.6, 10);
      ctx.fill();
      ctx.fillStyle = doc.color;
      ctx.font = `600 ${W * 0.033}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(doc.status, W * 0.36 + W * 0.1, ry + rowH * 0.38);

      // progress bar
      const barX = W * 0.6;
      const barW = W * 0.32;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, barX, ry + rowH * 0.22, barW, rowH * 0.2, 3);
      ctx.fill();
      if (animProgress > 0) {
        const grad = ctx.createLinearGradient(barX, 0, barX + barW * animProgress, 0);
        grad.addColorStop(0, doc.color);
        grad.addColorStop(1, doc.color + 'AA');
        ctx.fillStyle = grad;
        roundRect(ctx, barX, ry + rowH * 0.22, barW * animProgress, rowH * 0.2, 3);
        ctx.fill();
      }
      ctx.fillStyle = '#4A5168';
      ctx.font = `${W * 0.03}px Inter, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(animProgress * 100) + '%', W - W * 0.04, ry + rowH * 0.38);
    });

    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  startTime = null;
  animId = requestAnimationFrame(draw);
}


/* ══════════════════════════════════════════════════════════
   PHONE DASHBOARD — DocuFlow Pro mobile view
══════════════════════════════════════════════════════════ */
function initPhoneDashboard(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, animId, startTime;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = '#0E1117';
    ctx.fillRect(0, 0, W, H * 0.1);
    ctx.fillStyle = '#00E5C3';
    ctx.font = `bold ${W * 0.13}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('DFP', W / 2, H * 0.072);

    // ── Circular progress rings
    const cx = W / 2;
    const cy = H * 0.32;
    const radii = [W * 0.28, W * 0.21, W * 0.14];
    const colors = ['#00E5C3', '#0099FF', '#A855F7'];
    const progresses = [
      0.72 + 0.05 * Math.sin(elapsed * 0.8),
      0.45 + 0.08 * Math.sin(elapsed * 1.1 + 1),
      0.91 + 0.02 * Math.sin(elapsed * 1.5 + 2),
    ];

    radii.forEach((r, i) => {
      // Track
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = W * 0.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 1.5);
      ctx.stroke();
      // Fill
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = W * 0.045;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progresses[i]);
      ctx.stroke();
    });

    // Center text
    ctx.fillStyle = '#EEF0F8';
    ctx.font = `bold ${W * 0.16}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(progresses[0] * 100) + '%', cx, cy + W * 0.06);
    ctx.fillStyle = '#4A5168';
    ctx.font = `${W * 0.09}px Inter, sans-serif`;
    ctx.fillText('Routed', cx, cy + W * 0.15);

    // ── Status chips
    const chips = [
      { label: 'Active',    count: '23', color: '#00E5C3' },
      { label: 'Pending',   count: '8',  color: '#F59E0B' },
    ];
    const chipY = H * 0.58;
    chips.forEach((chip, i) => {
      const cx2 = W * 0.27 + i * W * 0.47;
      ctx.fillStyle = chip.color + '18';
      roundRect(ctx, cx2 - W * 0.2, chipY, W * 0.4, H * 0.1, 8);
      ctx.fill();
      ctx.strokeStyle = chip.color + '44';
      ctx.lineWidth = 1;
      roundRect(ctx, cx2 - W * 0.2, chipY, W * 0.4, H * 0.1, 8);
      ctx.stroke();
      ctx.fillStyle = chip.color;
      ctx.font = `bold ${W * 0.14}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(chip.count, cx2, chipY + H * 0.065);
      ctx.fillStyle = '#4A5168';
      ctx.font = `${W * 0.085}px Inter, sans-serif`;
      ctx.fillText(chip.label, cx2, chipY + H * 0.092);
    });

    // ── Mini bar chart
    const barY = H * 0.73;
    const bars = [0.6, 0.8, 0.5, 0.9, 0.7, 0.85, 1.0];
    const barW2 = W * 0.08;
    bars.forEach((h, i) => {
      const animated = h * (0.85 + 0.15 * Math.sin(elapsed * 1.2 + i));
      const bx = W * 0.06 + i * (barW2 + W * 0.02);
      const bh = H * 0.14 * animated;
      const grad = ctx.createLinearGradient(0, barY + H * 0.14 - bh, 0, barY + H * 0.14);
      grad.addColorStop(0, '#00E5C3');
      grad.addColorStop(1, '#0099FF');
      ctx.fillStyle = grad;
      roundRect(ctx, bx, barY + H * 0.14 - bh, barW2, bh, 2);
      ctx.fill();
    });
    ctx.fillStyle = '#4A5168';
    ctx.font = `${W * 0.08}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Weekly throughput', W * 0.06, barY - H * 0.01);

    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  startTime = null;
  animId = requestAnimationFrame(draw);
}


/* ── Utility: rounded rectangle ─────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
