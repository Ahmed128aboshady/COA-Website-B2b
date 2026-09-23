/**
 * COA EGYPT - EXECUTIVE DIGITAL HARBOR ARCHITECTURE ENGINE
 * Pure Vanilla JavaScript & Three.js/Canvas2D
 * Ultra Fast, Zero Framework Overhead, Cinematic Visuals & Rich Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'ar';
  const htmlEl = document.documentElement;

  // ========================================================
  // 1. DIGITAL HARBOR CINEMATIC 3D INTRO TOUR CONTROLLER
  // ========================================================
  const introEl = document.getElementById('dh-intro');
  const waveCanvas = document.getElementById('introWaveCanvas');
  const skipBtn = document.getElementById('dhSkipBtn');
  const enterBtn = document.getElementById('dhEnterBtn');
  const prevBtn = document.getElementById('dhPrevBtn');
  const nextBtn = document.getElementById('dhNextBtn');
  const dots = document.querySelectorAll('.dh-dot');
  const scenes = document.querySelectorAll('.dh-scene');
  const tourBar = document.getElementById('dhTourBar');

  let currentScene = 0;
  const totalScenes = scenes.length;
  let sceneTimer = null;
  let introActive = true;
  let waveAnimId = null;

  function showScene(idx) {
    if (!introActive) return;
    currentScene = (idx + totalScenes) % totalScenes;

    scenes.forEach((sc, i) => {
      sc.classList.toggle('active', i === currentScene);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('on', i === currentScene);
    });

    if (tourBar) {
      const progress = ((currentScene + 1) / totalScenes) * 100;
      tourBar.style.width = `${progress}%`;
    }

    // Reset slide progression timer
    clearTimeout(sceneTimer);
    sceneTimer = setTimeout(() => {
      if (introActive && currentScene < totalScenes - 1) {
        showScene(currentScene + 1);
      }
    }, 5500);
  }

  function dismissIntro() {
    if (!introEl || !introActive) return;
    introActive = false;
    clearTimeout(sceneTimer);
    if (waveAnimId) cancelAnimationFrame(waveAnimId);

    introEl.classList.add('dh-skip');
    setTimeout(() => {
      introEl.style.display = 'none';
    }, 950);
  }

  if (skipBtn) skipBtn.addEventListener('click', dismissIntro);
  if (enterBtn) enterBtn.addEventListener('click', dismissIntro);

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showScene(currentScene - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showScene(currentScene + 1);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIdx = parseInt(dot.getAttribute('data-dot'), 10);
      if (!isNaN(targetIdx)) showScene(targetIdx);
    });
  });

  // Clicking outside text advances scene or enters
  if (introEl) {
    introEl.addEventListener('click', (e) => {
      if (e.target.closest('.dh-tour-nav') || e.target.closest('.dh-skip-btn') || e.target.closest('.dh-enter-btn') || e.target.closest('.dh-pcard')) {
        return;
      }
      if (currentScene < totalScenes - 1) {
        showScene(currentScene + 1);
      } else {
        dismissIntro();
      }
    });
  }

  // 3D WebGL Wave / Particle Space (Three.js with 2D Canvas fallback)
  function initIntroVisuals() {
    if (!waveCanvas) return;
    const parent = document.getElementById('dh-eco') || introEl;
    let width = parent.clientWidth || window.innerWidth;
    let height = parent.clientHeight || window.innerHeight;

    if (typeof THREE !== 'undefined') {
      try {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x070b1c, 0.0035);

        const camera = new THREE.PerspectiveCamera(65, width / height, 1, 2000);
        camera.position.set(0, 160, 480);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
          canvas: waveCanvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        // Particle Grid
        const cols = 55;
        const rows = 45;
        const count = cols * rows;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const sepX = 26;
        const sepZ = 24;
        const offsetX = (cols * sepX) / 2;
        const offsetZ = (rows * sepZ) / 2;

        let idx = 0;
        for (let ix = 0; ix < cols; ix++) {
          for (let iz = 0; iz < rows; iz++) {
            const px = ix * sepX - offsetX;
            const pz = iz * sepZ - offsetZ;
            positions[idx * 3] = px;
            positions[idx * 3 + 1] = 0;
            positions[idx * 3 + 2] = pz;

            // Cyan & Red/Blue particle gradient
            if ((ix + iz) % 5 === 0) {
              colors[idx * 3] = 0.94; colors[idx * 3 + 1] = 0.02; colors[idx * 3 + 2] = 0.07; // Crimson Red
            } else {
              colors[idx * 3] = 0.0; colors[idx * 3 + 1] = 0.90; colors[idx * 3 + 2] = 1.0; // Electric Cyan
            }
            idx++;
          }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Canvas circular particle texture
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 32; pCanvas.height = 32;
        const pCtx = pCanvas.getContext('2d');
        const radGrd = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        radGrd.addColorStop(0, 'rgba(255, 255, 255, 1)');
        radGrd.addColorStop(0.3, 'rgba(0, 229, 255, 0.8)');
        radGrd.addColorStop(1, 'rgba(0, 229, 255, 0)');
        pCtx.fillStyle = radGrd;
        pCtx.fillRect(0, 0, 32, 32);

        const pTexture = new THREE.CanvasTexture(pCanvas);
        const material = new THREE.PointsMaterial({
          size: 7.5,
          vertexColors: true,
          map: pTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // 4 Glowing Discipline Orbit Nodes
        const nodeGeometry = new THREE.SphereGeometry(6, 16, 16);
        const nodeMatCyan = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
        const nodeMatRed = new THREE.MeshBasicMaterial({ color: 0xF00613 });
        const orbitNodes = [];
        for (let k = 0; k < 4; k++) {
          const mesh = new THREE.Mesh(nodeGeometry, k % 2 === 0 ? nodeMatCyan : nodeMatRed);
          scene.add(mesh);
          orbitNodes.push(mesh);
        }

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
          mouseX = (e.clientX - width / 2) * 0.15;
          mouseY = (e.clientY - height / 2) * 0.15;
        });

        let clock = 0;
        function renderThree() {
          if (!introActive) return;
          clock += 0.024;

          const posArr = geometry.attributes.position.array;
          let pIdx = 0;
          for (let ix = 0; ix < cols; ix++) {
            for (let iz = 0; iz < rows; iz++) {
              const x = ix * sepX - offsetX;
              const z = iz * sepZ - offsetZ;
              // Digital Harbor exact wave formula
              const y = (Math.sin(x * 0.016 + clock * 1.2) * 22) +
                        (Math.cos(z * 0.022 + clock * 0.9) * 18) +
                        (Math.sin((x + z) * 0.014 + clock * 1.5) * 12);
              posArr[pIdx * 3 + 1] = y;
              pIdx++;
            }
          }
          geometry.attributes.position.needsUpdate = true;

          // Orbit nodes
          orbitNodes.forEach((node, nIdx) => {
            const angle = clock * 0.6 + (nIdx * Math.PI / 2);
            node.position.x = Math.cos(angle) * 220;
            node.position.z = Math.sin(angle) * 180;
            node.position.y = Math.sin(clock * 1.2 + nIdx) * 35;
          });

          // Camera parallax
          camera.position.x += (mouseX - camera.position.x) * 0.04;
          camera.position.y += ((160 - mouseY) - camera.position.y) * 0.04;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);
          waveAnimId = requestAnimationFrame(renderThree);
        }
        renderThree();

        window.addEventListener('resize', () => {
          if (!introActive) return;
          width = parent.clientWidth || window.innerWidth;
          height = parent.clientHeight || window.innerHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        });
        return;
      } catch (err) {
        console.warn('Three.js failed, using 2D Canvas fallback:', err);
      }
    }

    // 2D Canvas Fallback
    const ctx = waveCanvas.getContext('2d');
    waveCanvas.width = width;
    waveCanvas.height = height;

    let time = 0;
    function render2DFallback() {
      if (!introActive) return;
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const cols2 = 36;
      const rows2 = 24;
      const stepX = width / cols2;
      const stepY = height / rows2;

      for (let i = 0; i <= cols2; i++) {
        for (let j = 0; j <= rows2; j++) {
          const x = i * stepX;
          const y = j * stepY + Math.sin(i * 0.3 + time) * 16 + Math.cos(j * 0.3 + time * 0.8) * 14;
          ctx.beginPath();
          ctx.arc(x, y, (i + j) % 6 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = (i + j) % 7 === 0 ? 'rgba(240, 6, 19, 0.7)' : 'rgba(0, 229, 255, 0.6)';
          ctx.fill();
        }
      }
      waveAnimId = requestAnimationFrame(render2DFallback);
    }
    render2DFallback();
  }

  initIntroVisuals();
  showScene(0);

  // ========================================================
  // 2. FULL-PAGE MOTHERBOARD BACKGROUND CANVAS (#dh-rain)
  // ========================================================
  function initMotherboardCircuit() {
    const rainHolder = document.getElementById('dh-rain');
    const canvas = document.getElementById('rainCanvas');
    if (!canvas || !rainHolder) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.6);
    let animFrame = null;

    // 45° Dogleg Routing
    function route(A, B) {
      const dx = B.x - A.x, dy = B.y - A.y;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      if (adx < 3 || ady < 3 || Math.abs(adx - ady) < 3) return [A, B];
      const m = Math.min(adx, ady);
      const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
      let P;
      if (Math.random() < 0.5) {
        P = { x: A.x + sx * m, y: A.y + sy * m };
      } else {
        P = (adx > ady) ? { x: B.x - sx * ady, y: A.y } : { x: A.x, y: B.y - sy * adx };
      }
      return [A, P, B];
    }

    function poly(pts) {
      const seg = [];
      let total = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const L = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
        seg.push(L);
        total += L;
      }
      return { seg, len: total };
    }

    let nodes = [], edges = [], chip = { x: 0, y: 0, s: 0 }, pulses = [];

    function generateBoard() {
      W = window.innerWidth;
      H = rainHolder.clientHeight || 1750;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      nodes = [];
      edges = [];
      pulses = [];

      const cx = W / 2;
      const cy = Math.min(Math.max(H * 0.28, 380), 520);
      const chipSize = Math.max(130, Math.min(200, Math.min(W, H) * 0.2));
      const hs = chipSize / 2;
      chip = { x: cx, y: cy, s: chipSize };

      function addNode(x, y, ring) {
        nodes.push({ x, y, ring: ring || 0 });
        return nodes.length - 1;
      }

      function addTrace(px, py, dx, dy, tx, ty) {
        const pin = addNode(px, py, 0);
        const stub = 20 + Math.random() * 35;
        const p1 = { x: px + dx * stub, y: py + dy * stub };
        const pad = addNode(tx, ty, 3 + Math.random() * 3);
        const pts = [nodes[pin]].concat(route(p1, { x: tx, y: ty }));
        const pl = poly(pts);
        edges.push({ pts, seg: pl.seg, len: pl.len, padIdx: pad });
      }

      const pinsPerSide = Math.max(8, Math.floor(chipSize / 12));
      const mTop = 30, mBot = H - 30, mLeft = 30, mRight = W - 30;

      // Top & Bottom pins
      for (let i = 0; i < pinsPerSide; i++) {
        const fx = (i + 0.5) / pinsPerSide;
        const px = cx - hs + fx * chipSize;
        const spread = 1.6 + Math.random() * 1.2;
        addTrace(px, cy - hs, 0, -1, Math.max(mLeft, Math.min(mRight, cx + (px - cx) * spread)), mTop + Math.random() * 50);
        addTrace(px, cy + hs, 0, 1, Math.max(mLeft, Math.min(mRight, cx + (px - cx) * spread)), mBot - Math.random() * 50);
      }

      // Left & Right pins
      for (let j = 0; j < pinsPerSide; j++) {
        const fy = (j + 0.5) / pinsPerSide;
        const py = cy - hs + fy * chipSize;
        const spread = 1.6 + Math.random() * 1.2;
        addTrace(cx - hs, py, -1, 0, mLeft + Math.random() * 50, Math.max(mTop, Math.min(mBot, cy + (py - cy) * spread)));
        addTrace(cx + hs, py, 1, 0, mRight - Math.random() * 50, Math.max(mTop, Math.min(mBot, cy + (py - cy) * spread)));
      }

      // Initialize moving pulse particles
      const pulseCount = Math.min(edges.length, 36);
      for (let k = 0; k < pulseCount; k++) {
        pulses.push({
          edgeIdx: Math.floor(Math.random() * edges.length),
          progress: Math.random(),
          speed: 0.0018 + Math.random() * 0.0035,
          color: Math.random() < 0.25 ? '#F00613' : '#00E5FF',
          size: 2.2 + Math.random() * 1.8
        });
      }
    }

    generateBoard();
    window.addEventListener('resize', generateBoard);

    let tick = 0;
    function drawCircuit() {
      tick += 0.02;
      ctx.clearRect(0, 0, W, H);

      // Draw traces
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.16)';
      edges.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(e.pts[0].x, e.pts[0].y);
        for (let i = 1; i < e.pts.length; i++) {
          ctx.lineTo(e.pts[i].x, e.pts[i].y);
        }
        ctx.stroke();
      });

      // Draw circular nodes & via rings
      nodes.forEach(n => {
        if (n.ring > 0) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.ring, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
          ctx.fill();
        }
      });

      // Central Processor Chip (CPU) Hardware Die
      const hs = chip.s / 2;
      const breathe = Math.sin(tick * 1.5) * 0.15 + 0.85;

      // Chip Radial Ambient Glow
      const glowGrad = ctx.createRadialGradient(chip.x, chip.y, chip.s * 0.2, chip.x, chip.y, chip.s * 1.4);
      glowGrad.addColorStop(0, `rgba(0, 229, 255, ${0.14 * breathe})`);
      glowGrad.addColorStop(0.5, `rgba(240, 6, 19, ${0.06 * breathe})`);
      glowGrad.addColorStop(1, 'rgba(7, 11, 28, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(chip.x - chip.s * 1.4, chip.y - chip.s * 1.4, chip.s * 2.8, chip.s * 2.8);

      // Chip Body Glass
      ctx.fillStyle = 'rgba(12, 18, 42, 0.5)';
      ctx.fillRect(chip.x - hs, chip.y - hs, chip.s, chip.s);

      // Outer Frame
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.45 * breathe})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(chip.x - hs, chip.y - hs, chip.s, chip.s);

      // Corner Registration Brackets
      const bLen = 14;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
      ctx.lineWidth = 2;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(chip.x - hs, chip.y - hs + bLen); ctx.lineTo(chip.x - hs, chip.y - hs); ctx.lineTo(chip.x - hs + bLen, chip.y - hs); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(chip.x + hs - bLen, chip.y - hs); ctx.lineTo(chip.x + hs, chip.y - hs); ctx.lineTo(chip.x + hs, chip.y - hs + bLen); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(chip.x - hs, chip.y + hs - bLen); ctx.lineTo(chip.x - hs, chip.y + hs); ctx.lineTo(chip.x - hs + bLen, chip.y + hs); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(chip.x + hs - bLen, chip.y + hs); ctx.lineTo(chip.x + hs, chip.y + hs); ctx.lineTo(chip.x + hs, chip.y + hs - bLen); ctx.stroke();

      // Inner Silicon Core
      const innerS = chip.s * 0.62;
      ctx.strokeStyle = `rgba(240, 6, 19, ${0.45 * breathe})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(chip.x - innerS / 2, chip.y - innerS / 2, innerS, innerS);

      // Micro Pins
      const pinCount = 6;
      for (let p = 0; p < pinCount; p++) {
        const pOffset = (p + 1) * (innerS / (pinCount + 1)) - innerS / 2;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
        ctx.fillRect(chip.x + pOffset - 1, chip.y - innerS / 2 - 4, 2, 4);
        ctx.fillRect(chip.x + pOffset - 1, chip.y + innerS / 2, 2, 4);
        ctx.fillRect(chip.x - innerS / 2 - 4, chip.y + pOffset - 1, 4, 2);
        ctx.fillRect(chip.x + innerS / 2, chip.y + pOffset - 1, 4, 2);
      }

      // Animate flowing pulses along edges
      pulses.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          p.edgeIdx = Math.floor(Math.random() * edges.length);
        }

        const e = edges[p.edgeIdx];
        if (!e) return;
        const targetDist = p.progress * e.len;
        let accum = 0;
        let curX = e.pts[0].x, curY = e.pts[0].y;

        for (let s = 0; s < e.seg.length; s++) {
          if (accum + e.seg[s] >= targetDist) {
            const frac = (targetDist - accum) / (e.seg[s] || 1);
            curX = e.pts[s].x + (e.pts[s + 1].x - e.pts[s].x) * frac;
            curY = e.pts[s].y + (e.pts[s + 1].y - e.pts[s].y) * frac;
            break;
          }
          accum += e.seg[s];
        }

        // Draw pulse particle & glow
        ctx.beginPath();
        ctx.arc(curX, curY, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#F00613' ? 'rgba(240, 6, 19, 0.25)' : 'rgba(0, 229, 255, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animFrame = requestAnimationFrame(drawCircuit);
    }
    drawCircuit();
  }

  initMotherboardCircuit();

  // ========================================================
  // 3. DYNAMIC TICKER ROTATION
  // ========================================================
  const tickerEl = document.getElementById('tickerItems');
  const tickerMessages = [
    {
      ar: '⚡ جاري تكامل وتفعيل الفاتورة الإلكترونية والربط الضريبي (ZATCA & ETA) لـ 18 منشأة تجارية وصناعية',
      en: '⚡ Active ZATCA Phase 2 & ETA E-Invoicing integrations currently underway across 18+ enterprises'
    },
    {
      ar: '🏆 COA Egypt معتمد رسمياً كـ Odoo Silver Partner في مصر والمملكة العربية السعودية',
      en: '🏆 COA Egypt officially certified as an Odoo Silver Partner across Egypt & Saudi Arabia'
    },
    {
      ar: '📈 اكتمال برنامج تأهيل وتدريب 45 محاسباً على منظومة Odoo Accounting بنجاح',
      en: '📈 Successful completion of hands-on Odoo Accounting training for 45 corporate accountants'
    },
    {
      ar: '🏭 إطلاق خطوط الإنتاج والربط المخزني التلقائي لشركتين صناعيتين جديدتين',
      en: '🏭 Live Go-Live achieved for manufacturing MRP & automated warehouse routing for 2 industrial clients'
    }
  ];
  let tickerIdx = 0;
  if (tickerEl) {
    setInterval(() => {
      tickerIdx = (tickerIdx + 1) % tickerMessages.length;
      tickerEl.style.opacity = '0';
      setTimeout(() => {
        const msg = tickerMessages[tickerIdx];
        tickerEl.textContent = currentLang === 'ar' ? msg.ar : msg.en;
        tickerEl.style.opacity = '1';
      }, 300);
    }, 5500);
  }

  // ========================================================
  // 4. LANGUAGE SWITCHER (AR <-> EN)
  // ========================================================
  const langSwitchBtn = document.getElementById('langSwitch');
  const langText = document.getElementById('langText');

  function setLanguage(lang) {
    currentLang = lang;
    htmlEl.setAttribute('lang', lang);
    htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (langText) langText.textContent = lang === 'ar' ? 'EN' : 'عربي';

    document.querySelectorAll('[data-ar]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    if (typeof updateCalculator === 'function') {
      updateCalculator();
    }
    localStorage.setItem('coa_lang', lang);
  }

  const savedLang = localStorage.getItem('coa_lang') || 'ar';
  if (savedLang !== 'ar') {
    setLanguage(savedLang);
  }

  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'ar' ? 'en' : 'ar';
      setLanguage(nextLang);
    });
  }

  // ========================================================
  // 5. THEME TOGGLE (DARK / LIGHT)
  // ========================================================
  const themeToggleBtn = document.getElementById('themeToggle');
  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('coa_theme', theme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const cur = htmlEl.getAttribute('data-theme') || 'dark';
      const nxt = cur === 'dark' ? 'light' : 'dark';
      setTheme(nxt);
    });
  }

  // Default to dark midnight theme like Digital Harbor
  const savedTheme = localStorage.getItem('coa_theme') || 'dark';
  setTheme(savedTheme);

  // ========================================================
  // 6. HERO VISUAL TABS (STACK CARD vs DASHBOARD vs TERMINAL)
  // ========================================================
  const tabBtnStack = document.getElementById('tabBtnStack');
  const tabBtnDashboard = document.getElementById('tabBtnDashboard');
  const tabBtnTerminal = document.getElementById('tabBtnTerminal');

  const panelStack = document.getElementById('panelStack');
  const panelDashboard = document.getElementById('panelDashboard');
  const panelTerminal = document.getElementById('panelTerminal');

  function switchHubTab(tabName) {
    [tabBtnStack, tabBtnDashboard, tabBtnTerminal].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    [panelStack, panelDashboard, panelTerminal].forEach(panel => {
      if (panel) panel.classList.remove('active');
    });

    if (tabName === 'stack' && panelStack) {
      if (tabBtnStack) tabBtnStack.classList.add('active');
      panelStack.classList.add('active');
    } else if (tabName === 'dashboard' && panelDashboard) {
      if (tabBtnDashboard) tabBtnDashboard.classList.add('active');
      panelDashboard.classList.add('active');
    } else if (tabName === 'terminal' && panelTerminal) {
      if (tabBtnTerminal) tabBtnTerminal.classList.add('active');
      panelTerminal.classList.add('active');
      runTerminalSimulation();
    }
  }

  if (tabBtnStack) tabBtnStack.addEventListener('click', () => switchHubTab('stack'));
  if (tabBtnDashboard) tabBtnDashboard.addEventListener('click', () => switchHubTab('dashboard'));
  if (tabBtnTerminal) tabBtnTerminal.addEventListener('click', () => switchHubTab('terminal'));

  // Hero Stack Card Row Hover/Click Interactions
  const stackRows = document.querySelectorAll('.dh-stack-row');
  const stackStatusText = document.getElementById('stackStatusText');
  const rowStatusNotes = [
    { ar: 'دقة استشارية مالية وضريبية بمستوى المحاسب القانوني المعتمد', en: 'Certified CPA precision & strategic financial control' },
    { ar: 'تطبيق موحد لكافة العمليات: مبيعات، مشتريات، مخازن، وتصنيع MRP', en: 'Unified Odoo operations: sales, procurement, inventory & MRP' },
    { ar: 'امتثال مؤكد 100% مع هيئة الزكاة (ZATCA فاز 2) ومصلحة الضرائب المصرية', en: '100% compliant with ZATCA Phase 2 & ETA E-Invoicing portals' },
    { ar: 'إعادة هندسة الإجراءات المؤسسية وتصفير كافة الاختناقات الورقية', en: 'End-to-end BPR eradicating manual spreadsheet bottlenecks' },
    { ar: 'أكاديمية COA لتدريب الكوادر المالية ونقل المعرفة المباشرة', en: 'COA Learning Academy hands-on enterprise workforce upskilling' },
    { ar: 'دعم وتشغيل ورعاية مستمرة 24/7 مع ضمان جاهزية 99.98%', en: '24/7 dedicated hypercare with guaranteed 99.98% uptime SLA' }
  ];

  stackRows.forEach((row, rIdx) => {
    row.addEventListener('mouseenter', () => {
      stackRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      if (stackStatusText && rowStatusNotes[rIdx]) {
        stackStatusText.textContent = currentLang === 'ar' ? rowStatusNotes[rIdx].ar : rowStatusNotes[rIdx].en;
      }
    });
  });

  // Terminal Simulation
  const terminalScreen = document.getElementById('terminalScreen');
  const runTerminalBtn = document.getElementById('runTerminalBtn');
  const terminalSteps = [
    { text: 'coa@enterprise:/opt/stack$ coa-engine --boot --partner "ODOO_SILVER"', cls: 'prompt-line' },
    { text: '[SYS] Initializing COA Enterprise Architecture v4.2...', cls: 'info-line' },
    { text: '[CPA] Chart of Accounts verified: IFRS & Local Tax Authority PASS', cls: 'success-line' },
    { text: '[ZATCA] Phase 2 Cryptographic Integration: Connected to Portal SECURE', cls: 'success-line' },
    { text: '[ERP] Mounting Modules: [Accounting, Multi-Branch POS, MRP, Inventory, HR]', cls: 'info-line' },
    { text: '[TRANSFORM] Legacy Excel sheets eradicated: 0 paper bottlenecks remaining', cls: 'success-line' },
    { text: '>>> SYSTEM READY: Operational ROI +40% | Close Cycle: 3 Days', cls: 'highlight-line' },
    { text: 'coa@enterprise:/opt/stack$ █', cls: 'cursor-line' }
  ];

  let termTimer = null;
  function runTerminalSimulation() {
    if (!terminalScreen) return;
    clearTimeout(termTimer);
    terminalScreen.innerHTML = '';
    let step = 0;
    function printNext() {
      if (step < terminalSteps.length) {
        const item = terminalSteps[step];
        const line = document.createElement('div');
        line.className = `term-line ${item.cls}`;
        line.textContent = item.text;
        terminalScreen.appendChild(line);
        terminalScreen.scrollTop = terminalScreen.scrollHeight;
        step++;
        termTimer = setTimeout(printNext, step === 1 ? 400 : 250);
      }
    }
    printNext();
  }
  if (runTerminalBtn) runTerminalBtn.addEventListener('click', runTerminalSimulation);

  // ========================================================
  // 7. EXPLORE THE STACK INTERACTIVE EXPLORER
  // ========================================================
  const expItems = document.querySelectorAll('.dh-exp-item');
  const expBadge = document.getElementById('expBadge');
  const expTitle = document.getElementById('expTitle');
  const expDesc = document.getElementById('expDesc');
  const expMeta = document.getElementById('expMeta');

  const stackDetails = [
    {
      badge: 'LAYER 01 • FINANCIAL EXCELLENCE',
      titleAr: 'الاستشارات والتدقيق المالي المحكم',
      titleEn: 'Financial & Tax Advisory Rigor',
      descAr: 'الأساس الذي تُبنى عليه كافة الأنظمة. نقوم بتدقيق شجرة الحسابات، ضبط مراكز التكلفة، وإعداد القوائم المالية وفقاً لمعايير المحاسبة الدولية (IFRS) والمصرية، مما يمنح الإدارة رؤية نقدية لحظية دقيقة.',
      descEn: 'The bedrock of every resilient business. We audit charts of accounts, configure multi-tier cost centers, and construct compliant financial statements (IFRS & EAS) for real-time executive cash visibility.',
      meta: [
        { label: 'LEADERSHIP', val: 'Chartered CPAs' },
        { label: 'STANDARDS', val: 'IFRS & EAS' },
        { label: 'OUTCOME', val: 'Zero Audit Risk' }
      ]
    },
    {
      badge: 'LAYER 02 • ODOO ENTERPRISE CORE',
      titleAr: 'تطبيق Odoo ERP والعمليات المركزية',
      titleEn: 'Odoo ERP Core Operations',
      descAr: 'بصفتنا شريك أودو الفضي المعتمد، نبني دورة العمل المتكاملة: المبيعات، المشتريات، نقاط البيع السريعة، وإدارة المستودعات والتصنيع MRP دون أي جزر بيانات منعزلة.',
      descEn: 'As a certified Odoo Silver Partner, we orchestrate seamless workflows: Sales, Procurement, high-speed POS, multi-location inventory, and MRP manufacturing with zero data silos.',
      meta: [
        { label: 'PARTNER', val: 'Odoo Silver' },
        { label: 'EDITION', val: 'v17 & v18 Ent' },
        { label: 'UPTIME', val: '99.98% SLA' }
      ]
    },
    {
      badge: 'LAYER 03 • REGULATORY COMPLIANCE',
      titleAr: 'الامتثال والفاتورة الإلكترونية (ZATCA & ETA)',
      titleEn: 'E-Invoicing & Tax Compliance',
      descAr: 'ربط مباشر ومشفر مع منظومة الفاتورة الإلكترونية المصرية وهيئة الزكاة والضريبة والجمارك بالمملكة (المرحلة الثانية الربط والتكامل) مع التحقق الفوري من التوقيع الرقمي والـ QR.',
      descEn: 'Cryptographic direct integration with the Egyptian Tax Authority (ETA) and Saudi ZATCA Phase 2 clearance, verifying digital signatures, UUIDs, and Phase 2 compliant QR codes.',
      meta: [
        { label: 'PORTALS', val: 'ETA & ZATCA' },
        { label: 'PHASE', val: 'Phase 2 Live' },
        { label: 'CLEARANCE', val: '100% Instant' }
      ]
    },
    {
      badge: 'LAYER 04 • BUSINESS PROCESS RE-ENGINEERING',
      titleAr: 'التحول الرقمي وهندسة العمليات (BPR)',
      titleEn: 'Business Process Re-engineering',
      descAr: 'لا نكتفي ببرمجة النظام، بل نعيد تصميم مسارات العمل اليومية لإلغاء أي هدر زمني، وتوحيد الدورات المستندية عبر كافة الفروع والمصانع لضمان أقصى كفاءة تشغيلية.',
      descEn: 'We dont just configure software; we streamline operational blueprints to eradicate cycle delays and unify standard operating procedures across multi-branch and factory operations.',
      meta: [
        { label: 'METHOD', val: 'Lean Six Sigma' },
        { label: 'CYCLE REDUCTION', val: '-40% Time' },
        { label: 'PAPERWORK', val: '0 Bottlenecks' }
      ]
    },
    {
      badge: 'LAYER 05 • WORKFORCE TRANSFORMATION',
      titleAr: 'أكاديمية COA وتدريب الكوادر المؤسسية',
      titleEn: 'COA Learning Hub & Staff Training',
      descAr: 'ضمان الاستدامة من خلال ورش تدريب تفاعلية وتطبيقية لفريق المحاسبة وإدارة المخازن، تسليم أدلة تشغيل موثقة، واختبارات قياس كفاءة تضمن استقلالية فريقك بعد التسليم.',
      descEn: 'We ensure long-term adoption through tailored corporate workshops for finance and warehouse operators, verified standard manuals, and hands-on qualification tests.',
      meta: [
        { label: 'ACADEMY', val: 'COA Learning' },
        { label: 'TRAINED', val: '450+ Users' },
        { label: 'HANDOVER', val: '100% Retained' }
      ]
    },
    {
      badge: 'LAYER 06 • HYPERCARE & INFRASTRUCTURE',
      titleAr: 'الرعاية المستمرة والتشغيل السحابي 24/7',
      titleEn: 'Managed Hypercare & Cloud Infrastructure',
      descAr: 'مرافقة تشغيلية مكثفة (Hypercare) لمدة 90 يوماً بعد الإطلاق الحي، مع استضافة سحابية عالية الأمان، نسخ احتياطي دوري، ودعم فني مخصص لحل أي طارئ دون توقف أعمالك.',
      descEn: '90-day intensive hypercare post Go-Live, backed by hardened cloud infrastructure, encrypted automated backups, and 24/7 dedicated engineer SLAs.',
      meta: [
        { label: 'COVERAGE', val: '24/7 SLA' },
        { label: 'HYPERCARE', val: '90 Days Post' },
        { label: 'RESPONSE', val: '< 15 Minutes' }
      ]
    }
  ];

  expItems.forEach(item => {
    item.addEventListener('click', () => {
      expItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const idx = parseInt(item.getAttribute('data-exp'), 10);
      const data = stackDetails[idx];
      if (!data) return;

      if (expBadge) expBadge.textContent = data.badge;
      if (expTitle) expTitle.textContent = currentLang === 'ar' ? data.titleAr : data.titleEn;
      if (expDesc) expDesc.textContent = currentLang === 'ar' ? data.descAr : data.descEn;

      if (expMeta) {
        expMeta.innerHTML = data.meta.map(m => `
          <div class="meta-pill">
            <small>${m.label}</small>
            <strong>${m.val}</strong>
          </div>
        `).join('');
      }
    });
  });

  // ========================================================
  // 8. SERVICES TABS CONTROLLER
  // ========================================================
  const tabButtons = document.querySelectorAll('.services-tab-nav .tab-btn');
  const tabPanes = document.querySelectorAll('.services-tab-content .tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // ========================================================
  // 9. PORTFOLIO CATEGORY FILTERS
  // ========================================================
  const filterBtns = document.querySelectorAll('.portfolio-filter-row .filter-btn');
  const caseCards = document.querySelectorAll('.case-studies-grid .case-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      caseCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  // ========================================================
  // 10. INTERACTIVE SCOPE ESTIMATOR & DYNAMIC RECOMMENDATIONS
  // ========================================================
  const userRadios = document.querySelectorAll('input[name="users"]');
  const serviceBoxes = document.querySelectorAll('input[name="services"]');
  const countryRadios = document.querySelectorAll('input[name="country"]');

  const pkgNameEl = document.getElementById('calcPackageName');
  const timeEstEl = document.getElementById('calcTimeEstimate');
  const supportEl = document.getElementById('calcSupportLevel');
  const compEl = document.getElementById('calcCompliance');
  const bulletsEl = document.getElementById('calcFeatureBullets');

  function updateEstimator() {
    let selectedUserSize = '1-5';
    userRadios.forEach(r => { if (r.checked) selectedUserSize = r.value; });

    let selectedCountry = 'egypt';
    countryRadios.forEach(r => { if (r.checked) selectedCountry = r.value; });

    const checkedServices = [];
    serviceBoxes.forEach(b => { if (b.checked) checkedServices.push(b.value); });

    const pkgData = {
      '1-5': {
        ar: { name: 'باقة الانطلاق السريع (Starter Core)', time: '2 إلى 3 أسابيع', support: 'دعم مباشر خلال الإطلاق' },
        en: { name: 'Starter Core Stack', time: '2 to 3 weeks', support: 'Launch Hypercare Support' }
      },
      '6-20': {
        ar: { name: 'باقة النمو المتكامل (Growth Stack)', time: '3 إلى 5 أسابيع', support: 'دعم مباشر ورعاية مكثفة (Hypercare)' },
        en: { name: 'Growth Stack', time: '3 to 5 weeks', support: 'Direct Hypercare & Live SLA' }
      },
      '21-50': {
        ar: { name: 'باقة التوسع المؤسسي (Scale & Automate)', time: '6 إلى 8 أسابيع', support: 'مدير حساب مخصص + رعاية 24/7' },
        en: { name: 'Scale & Automate Stack', time: '6 to 8 weeks', support: 'Dedicated Account Lead + 24/7 SLA' }
      },
      '50+': {
        ar: { name: 'باقة التحول المؤسسي الشامل (Enterprise Transformation)', time: '8 إلى 12 أسبوعاً', support: 'فريق استشاري مقيم + رعاية سحابية كاملة 24/7' },
        en: { name: 'Enterprise Transformation', time: '8 to 12 weeks', support: 'Resident CPA Squad + Full 24/7 SLA' }
      }
    };

    const curPkg = pkgData[selectedUserSize] || pkgData['6-20'];
    const p = currentLang === 'ar' ? curPkg.ar : curPkg.en;

    if (pkgNameEl) pkgNameEl.textContent = p.name;
    if (timeEstEl) timeEstEl.textContent = p.time;
    if (supportEl) supportEl.textContent = p.support;

    if (compEl) {
      if (selectedCountry === 'egypt') {
        compEl.textContent = currentLang === 'ar' ? 'متوافق 100% مع منظومة الفاتورة والإيصال الإلكتروني (ETA)' : '100% Egyptian ETA E-Invoicing & E-Receipt Ready';
      } else if (selectedCountry === 'ksa') {
        compEl.textContent = currentLang === 'ar' ? 'معتمد ومربوط مع هيئة الزكاة والضريبة والجمارك (ZATCA المرحلة 2)' : 'Certified ZATCA Phase 2 E-Invoicing Integration';
      } else {
        compEl.textContent = currentLang === 'ar' ? 'متوافق مع معايير IFRS والأنظمة الضريبية الإقليمية' : 'IFRS & GCC Regional Tax Regulations Compliant';
      }
    }

    if (bulletsEl) {
      const items = [];
      if (checkedServices.includes('accounting')) {
        items.push(currentLang === 'ar' ? 'تدقيق محاسبي لشجرة الحسابات والدورة المستندية' : 'Chart of accounts & financial workflows audit');
      }
      if (checkedServices.includes('zatca')) {
        items.push(currentLang === 'ar' ? 'ربط آلي مباشر للفواتير بضمان شهادة الامتثال' : 'Direct API integration with tax clearance');
      }
      if (checkedServices.includes('manufacturing')) {
        items.push(currentLang === 'ar' ? 'حساب دقيق لتكاليف أوامر التصنيع ومراكز التكلفة' : 'BOM costing & production center allocation');
      }
      if (checkedServices.includes('training')) {
        items.push(currentLang === 'ar' ? 'برنامج تدريب عملي معتمد لكوادر الشركة (COA Academy)' : 'Staff certification via COA Academy');
      }
      if (items.length === 0) {
        items.push(currentLang === 'ar' ? 'تخصيص شامل وضبط مالي وإداري محكم' : 'Full custom operational & financial deployment');
      }

      bulletsEl.innerHTML = items.map(it => `
        <div class="c-bullet" style="display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.88rem; color: var(--text-body);">
          <span class="c-check" style="color: #10B981; font-weight: bold;">✓</span>
          <span>${it}</span>
        </div>
      `).join('');
    }
  }

  [...userRadios, ...serviceBoxes, ...countryRadios].forEach(inp => {
    inp.addEventListener('change', updateEstimator);
  });
  updateEstimator();
  updateCalculator();

  // ========================================================
  // 11. FAQ ACCORDION
  // ========================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(f => f.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // ========================================================
  // 12. MOBILE DRAWER NAVIGATION
  // ========================================================
  const mobileToggleBtn = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerClose');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (mobileToggleBtn && mobileDrawer) {
    mobileToggleBtn.addEventListener('click', () => mobileDrawer.classList.add('open'));
  }
  if (drawerCloseBtn && mobileDrawer) {
    drawerCloseBtn.addEventListener('click', () => mobileDrawer.classList.remove('open'));
  }
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.remove('open');
    });
  });

  // ========================================================
  // 13. CLOCK TELEMETRY
  // ========================================================
  const sysTimeEl = document.getElementById('sysTime');
  if (sysTimeEl) {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      sysTimeEl.textContent = `ERP.COA.CLOUD • ${timeStr} GMT+3`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }
});
