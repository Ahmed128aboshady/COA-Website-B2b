/**
 * COA EGYPT - EXECUTIVE DIGITAL HARBOR ARCHITECTURE ENGINE
 * Pure Vanilla JavaScript & Three.js/Canvas2D
 * Ultra Fast, Zero Framework Overhead, Cinematic Visuals & Rich Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'en';
  const htmlEl = document.documentElement;

  // ========================================================
  // ========================================================
  // 1. DIGITAL HARBOR CINEMATIC 3D INTRO CONTROLLER
  // ========================================================
  const introEl = document.getElementById('dh-intro');
  const skipBtn = document.getElementById('dhSkipBtn');
  let introActive = true;

  try {
    sessionStorage.removeItem('coa_intro_done');
  } catch (e) {}

  if (introEl) {
    introEl.classList.remove('dh-skip');
    introEl.style.display = 'block';
    introEl.style.opacity = '1';
    introEl.style.visibility = 'visible';
  }

  function dismissIntroAndEnter(target = '#hero') {
    if (!introEl || !introActive) return;
    introActive = false;

    const frame = document.getElementById('introAstraFrame');
    if (frame) {
      try { frame.contentWindow?.postMessage('pause', '*'); } catch (err) {}
    }

    introEl.classList.add('dh-skip');
    setTimeout(() => {
      introEl.style.display = 'none';
      if (frame) {
        frame.src = 'about:blank'; // Free up GPU memory completely
      }
      const section = document.querySelector(target);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }, 450);
  }

  // Listen for dismiss_intro message from introAstraFrame
  window.addEventListener('message', (e) => {
    if (e.data && (e.data.action === 'dismiss_intro' || e.data === 'dismiss_intro')) {
      dismissIntroAndEnter('#hero');
    }
  });

  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissIntroAndEnter('#hero');
    });
  }

  // Intro visuals rendered via introAstraFrame

  // ========================================================
  // 1b. LENIS-STYLE JS SMOOTH SCROLL ENGINE
  // ========================================================
  (function initSmoothScroll() {
    // Only apply on mouse-capable devices (not touch-only)
    if (window.matchMedia('(hover: none)').matches) return;

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let rafId = null;
    let isScrolling = false;
    const EASE = 0.095; // lerp factor — lower = silkier

    // Override HTML scroll-behavior so our lerp controls everything
    document.documentElement.style.scrollBehavior = 'auto';

    function lerp(a, b, t) { return a + (b - a) * t; }

    function onWheel(e) {
      e.preventDefault();
      const delta = e.deltaY * (e.deltaMode === 1 ? 30 : e.deltaMode === 2 ? 300 : 1);
      targetScrollY = Math.max(0, Math.min(targetScrollY + delta, document.body.scrollHeight - window.innerHeight));
      if (!isScrolling) {
        isScrolling = true;
        loop();
      }
    }

    function loop() {
      currentScrollY = lerp(currentScrollY, targetScrollY, EASE);
      window.scrollTo(0, currentScrollY);
      if (Math.abs(targetScrollY - currentScrollY) > 0.5) {
        rafId = requestAnimationFrame(loop);
      } else {
        window.scrollTo(0, targetScrollY);
        currentScrollY = targetScrollY;
        isScrolling = false;
        rafId = null;
      }
    }

    // Keep targetScrollY in sync when scroll happens programmatically (scrollIntoView, etc.)
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        currentScrollY = window.scrollY;
        targetScrollY = window.scrollY;
      }
    }, { passive: true });

    window.addEventListener('wheel', onWheel, { passive: false });
  })();

  // ========================================================
  // 1c. NAVBAR SCROLLED-STATE (shadow + deeper blur on scroll)
  // ========================================================
  (function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let ticking = false;

    function updateNavbar() {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });
  })();

  // ========================================================
  // 1d. SCROLL-REVEAL — IntersectionObserver fade-in engine
  // ========================================================
  (function initScrollReveal() {
    const revealEls = document.querySelectorAll(
      '.section-header, .dh-pcard, .case-card, .methodology-step, ' +
      '.faq-item, .dh-exp-item, .stat-item, .service-badge, ' +
      '.coa-contact-split > *, .dh-stack-row, .testimonial-card, ' +
      '.hero-content > *, .calc-body > *, .footer-col'
    );

    revealEls.forEach((el, i) => {
      el.classList.add('sr-hidden');
      // Stagger siblings inside same parent (cards in a grid)
      const siblings = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.transitionDelay = `${Math.min(siblings * 60, 320)}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('sr-hidden');
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  })();

  // ========================================================
  // 2. FULL-PAGE GEOMETRIC GRID BACKGROUND (#dh-rain)
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
    let tick = 0;

    // Diamond / rhombus shapes drifting upward
    let diamonds = [];
    // Animated horizontal scanlines (data lines)
    let scanLines = [];
    // Floating data points
    let dataPoints = [];

    function setup() {
      W = window.innerWidth;
      H = rainHolder.clientHeight || 1750;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Generate diamonds (max 6 for buttery smooth 120fps)
      diamonds = [];
      const dCount = Math.min(6, Math.floor((W * H) / 120000) || 3);
      for (let i = 0; i < dCount; i++) {
        diamonds.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: 8 + Math.random() * 12,
          speed: 0.12 + Math.random() * 0.18,
          opacity: 0.08 + Math.random() * 0.12,
          red: Math.random() < 0.25,
          rotation: Math.random() * Math.PI
        });
      }

      // Generate horizontal scanlines (max 2)
      scanLines = [
        { y: H * 0.3, speed: 0.35, width: 140, opacity: 0.08, dir: 1 },
        { y: H * 0.7, speed: 0.45, width: 180, opacity: 0.08, dir: -1 }
      ];

      // Generate floating data points (max 12)
      dataPoints = [];
      for (let i = 0; i < 12; i++) {
        dataPoints.push({
          x: Math.random() * W,
          y: Math.random() * H,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
          size: 1.5 + Math.random() * 1.5,
          red: i % 4 === 0
        });
      }
    }

    setup();
    window.addEventListener('resize', setup);

    function drawGrid() {
      tick += 0.016;
      ctx.clearRect(0, 0, W, H);

      // ── 1. Diagonal crosshatch grid ──────────────────────────
      const gridSpacing = 72;
      ctx.lineWidth = 0.5;

      // Lines going ↘ (top-left to bottom-right)
      ctx.strokeStyle = 'rgba(0, 41, 85, 0.18)';
      ctx.beginPath();
      for (let x = -H; x < W + H; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + H, H);
      }
      ctx.stroke();

      // Lines going ↗ (top-right to bottom-left)
      ctx.strokeStyle = 'rgba(0, 41, 85, 0.12)';
      ctx.beginPath();
      for (let x = -H; x < W + H; x += gridSpacing) {
        ctx.moveTo(x + H, 0);
        ctx.lineTo(x, H);
      }
      ctx.stroke();

      // Subtle horizontal rules every 160px
      ctx.strokeStyle = 'rgba(240, 6, 19, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 80; y < H; y += 160) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();

      // ── 2. Floating data-point pulses ────────────────────────
      dataPoints.forEach(dp => {
        dp.pulse += dp.pulseSpeed;
        const glow = (Math.sin(dp.pulse) * 0.5 + 0.5);
        const r = dp.size * (1 + glow * 1.2);
        const alpha = 0.15 + glow * 0.45;

        if (dp.red) {
          // Red accent dot with halo
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 6, 19, ${alpha * 0.25})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 6, 19, ${alpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 65, 140, ${alpha * 0.6})`;
          ctx.fill();
        }
      });

      // ── 3. Drifting diamond shapes ────────────────────────────
      diamonds.forEach(d => {
        d.y -= d.speed;
        d.rotation += 0.002;
        if (d.y + d.size < 0) {
          d.y = H + d.size;
          d.x = Math.random() * W;
        }

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation + Math.PI / 4);
        ctx.strokeStyle = d.red
          ? `rgba(240, 6, 19, ${d.opacity})`
          : `rgba(0, 41, 85, ${d.opacity})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-d.size / 2, -d.size / 2, d.size, d.size);
        ctx.restore();
      });

      // ── 4. Horizontal scanning light beams ───────────────────
      scanLines.forEach(sl => {
        sl.y += sl.speed * sl.dir;
        if (sl.y > H + 40) { sl.y = -40; sl.dir = 1; }
        if (sl.y < -40)    { sl.y = H + 40; sl.dir = -1; }

        const grad = ctx.createLinearGradient(0, sl.y - 1, 0, sl.y + 1);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, `rgba(240, 6, 19, ${sl.opacity})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, sl.y - 1, W, 2);
      });

      // ── 5. COA Brand corner mark (bottom-right subtle) ───────
      const breathe = Math.sin(tick * 1.2) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(240, 6, 19, ${0.12 * breathe})`;
      ctx.lineWidth = 1;
      const mx = W - 60, my = H - 60, ms = 40;
      ctx.strokeRect(mx, my, ms, ms);
      // inner
      ctx.strokeStyle = `rgba(0, 41, 85, ${0.2 * breathe})`;
      ctx.strokeRect(mx + 8, my + 8, ms - 16, ms - 16);

      animFrame = requestAnimationFrame(drawGrid);
    }

    drawGrid();
  }

  initMotherboardCircuit();

  // ========================================================
  // 3. DYNAMIC TICKER ROTATION
  // ========================================================
  const tickerEl = document.getElementById('tickerItems');
  const tickerMessages = [
    {
      ar: 'جاري تكامل وتفعيل الفاتورة الإلكترونية والربط الضريبي (ZATCA & ETA) لـ 18 منشأة تجارية وصناعية',
      en: 'Active ZATCA Phase 2 & ETA E-Invoicing integrations currently underway across 18+ enterprises'
    },
    {
      ar: 'COA Egypt معتمد رسمياً كـ Odoo Silver Partner في مصر والمملكة العربية السعودية',
      en: 'COA Egypt officially certified as an Odoo Silver Partner across Egypt & Saudi Arabia'
    },
    {
      ar: 'اكتمال برنامج تأهيل وتدريب 45 محاسباً على منظومة Odoo Accounting بنجاح',
      en: 'Successful completion of hands-on Odoo Accounting training for 45 corporate accountants'
    },
    {
      ar: 'إطلاق خطوط الإنتاج والربط المخزني التلقائي لشركتين صناعيتين جديدتين',
      en: 'Live Go-Live achieved for manufacturing MRP & automated warehouse routing for 2 industrial clients'
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
  // 4. LANGUAGE — ENGLISH ONLY
  // ========================================================
  function setLanguage(lang) {
    currentLang = lang;
    htmlEl.setAttribute('lang', lang);
    htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

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

  // Always English — call immediately on load
  setLanguage('en');

  // ========================================================
  // 5. THEME TOGGLE (DARK / LIGHT)
  // ========================================================
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  
  function updateThemeButtonLabels(theme) {
    const isDark = theme === 'dark';
    const text = isDark ? 'Light' : 'Dark';
    const textAr = isDark ? 'لايت' : 'دارك';
    document.querySelectorAll('.theme-toggle-label, #themeToggleText').forEach(el => {
      el.textContent = currentLang === 'ar' ? textAr : text;
      el.setAttribute('data-en', text);
      el.setAttribute('data-ar', textAr);
    });
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('coa_theme', theme);
    updateThemeButtonLabels(theme);
  }

  function toggleThemeAction() {
    const cur = htmlEl.getAttribute('data-theme') || 'dark';
    const nxt = cur === 'dark' ? 'light' : 'dark';
    setTheme(nxt);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleThemeAction);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', toggleThemeAction);
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('coa_theme') || (htmlEl.getAttribute('data-theme') || 'dark');
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

  function loadExpPanel(idx) {
    const data = stackDetails[idx];
    if (!data) return;
    if (expBadge) expBadge.textContent = data.badge;
    if (expTitle) expTitle.textContent = data.titleEn;
    if (expDesc)  expDesc.textContent  = data.descEn;
    if (expMeta) {
      expMeta.innerHTML = data.meta.map(m => `
        <div class="meta-pill">
          <small>${m.label}</small>
          <strong>${m.val}</strong>
        </div>
      `).join('');
    }
  }

  expItems.forEach(item => {
    item.addEventListener('click', () => {
      expItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const idx = parseInt(item.getAttribute('data-exp'), 10);
      loadExpPanel(idx);
    });
  });

  // Load first panel in English on page load
  loadExpPanel(0);

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
  // 10. REFORMED EXACT WORKFORCE & PROJECT ESTIMATOR
  // ========================================================
  const usersInput = document.getElementById('calcUsersInput');
  const usersSlider = document.getElementById('calcUsersSlider');
  const decBtn = document.getElementById('calcUsersDec');
  const incBtn = document.getElementById('calcUsersInc');
  const presetBtns = document.querySelectorAll('#userPresets .preset-chip');
  const tierBadge = document.getElementById('calcTierBadge');
  const usersSummary = document.getElementById('calcUsersSummary');

  const pkgNameEl = document.getElementById('calcPackageName');
  const timeEstEl = document.getElementById('calcTimeEstimate');
  const supportEl = document.getElementById('calcSupportLevel');
  const compEl = document.getElementById('calcCompliance');
  const bulletsEl = document.getElementById('calcFeatureBullets');
  const submitBtn = document.getElementById('calcSubmitBtn');
  const serviceBoxes = document.querySelectorAll('input[name="services"]');
  const countryRadios = document.querySelectorAll('input[name="country"]');

  let currentUsers = 15;

  function setUsers(val) {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 1000) num = 1000;
    currentUsers = num;

    if (usersInput && usersInput.value != currentUsers) usersInput.value = currentUsers;
    if (usersSlider) usersSlider.value = Math.min(currentUsers, 250);

    // Update preset chip active states
    presetBtns.forEach(btn => {
      const p = parseInt(btn.getAttribute('data-users'), 10);
      btn.classList.toggle('active', p === currentUsers || (p === 200 && currentUsers >= 200));
    });

    updateEstimator();
  }

  if (usersInput) {
    usersInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) setUsers(val);
    });
  }

  if (usersSlider) {
    usersSlider.addEventListener('input', (e) => {
      setUsers(e.target.value);
    });
  }

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      const step = currentUsers > 50 ? 5 : 1;
      setUsers(Math.max(1, currentUsers - step));
    });
  }

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      const step = currentUsers >= 50 ? 5 : 1;
      setUsers(currentUsers + step);
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const u = parseInt(btn.getAttribute('data-users'), 10);
      setUsers(u);
    });
  });

  function updateEstimator() {
    let selectedCountry = 'egypt';
    countryRadios.forEach(r => { if (r.checked) selectedCountry = r.value; });

    const checkedServices = [];
    serviceBoxes.forEach(b => { if (b.checked) checkedServices.push(b.value); });
    const moduleCount = checkedServices.length;

    // Dynamic categorization based on exact user count
    let tierName = 'Growth Team';
    let pkgTitle = 'Growth & Scale Architecture';
    let timeEst = '3 to 5 Weeks';
    let squadText = 'Lead CPA + Certified Odoo Consultant';

    if (currentUsers <= 5) {
      tierName = 'Starter Core';
      pkgTitle = 'Starter Core Deployment';
      timeEst = moduleCount > 4 ? '3 to 4 Weeks' : '2 to 3 Weeks';
      squadText = 'Senior Consultant + CPA Verification';
    } else if (currentUsers <= 25) {
      tierName = 'Growth Team';
      pkgTitle = 'Growth & Scale Architecture';
      timeEst = moduleCount > 5 ? '4 to 6 Weeks' : '3 to 5 Weeks';
      squadText = '1 Lead CPA Auditor + 2 Certified Odoo Engineers';
    } else if (currentUsers <= 60) {
      tierName = 'Scale & Automate';
      pkgTitle = 'Scale & Multi-Branch Framework';
      timeEst = moduleCount > 5 ? '6 to 9 Weeks' : '5 to 7 Weeks';
      squadText = 'Dedicated Engagement Partner + Technical Squad';
    } else {
      tierName = 'Enterprise Scale';
      pkgTitle = 'Full Enterprise Digital Transformation';
      timeEst = moduleCount > 5 ? '10 to 14 Weeks' : '8 to 12 Weeks';
      squadText = 'Resident CPA Squad + Full 24/7 SLA Team';
    }

    if (tierBadge) tierBadge.textContent = tierName;
    if (usersSummary) usersSummary.textContent = `${currentUsers} Users Scope`;
    if (pkgNameEl) pkgNameEl.textContent = pkgTitle;
    if (timeEstEl) timeEstEl.textContent = timeEst;
    if (supportEl) supportEl.textContent = squadText;

    if (compEl) {
      if (selectedCountry === 'egypt') {
        compEl.textContent = '100% Egyptian ETA E-Invoicing & E-Receipt Ready';
      } else if (selectedCountry === 'ksa') {
        compEl.textContent = 'Certified ZATCA Phase 2 E-Invoicing Integration';
      } else {
        compEl.textContent = 'IFRS & GCC Regional Tax Regulations Compliant';
      }
    }

    if (bulletsEl) {
      const items = [];
      if (checkedServices.includes('accounting')) {
        items.push('Full financial audit, chart of accounts & balance migration');
      }
      if (checkedServices.includes('zatca')) {
        items.push(selectedCountry === 'ksa' ? 'Automated ZATCA Phase 2 cryptographic invoice clearance' : 'Automated ETA E-Invoicing & E-Receipt compliance portal');
      }
      if (checkedServices.includes('inventory')) {
        items.push('Multi-warehouse inventory routing, valuation & barcode sync');
      }
      if (checkedServices.includes('pos')) {
        items.push('Offline-ready multi-branch POS network with instant fiscal sync');
      }
      if (checkedServices.includes('manufacturing')) {
        items.push('BOM routing, WIP costing & automated work center scheduling');
      }
      if (checkedServices.includes('hr')) {
        items.push('Automated payroll formulas, shifts, biometric attendance & leaves');
      }
      if (checkedServices.includes('training')) {
        items.push('Hands-on staff certification workshops via COA Academy');
      }
      if (checkedServices.includes('cfo')) {
        items.push('Monthly strategic virtual CFO reviews & Board-level P&L dashboards');
      }
      if (items.length === 0) {
        items.push('Full custom operational, tax and financial Odoo architecture');
      }

      // Clean single checkmark badge, no double checkmark!
      bulletsEl.innerHTML = items.map(it => `
        <div class="c-bullet">
          <span class="c-check-icon">✓</span>
          <span>${it}</span>
        </div>
      `).join('');
    }
  }

  // Pre-fill consultation form on CTA click
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const notesField = document.getElementById('clientNotes');
      if (notesField) {
        let countryName = 'Egypt';
        countryRadios.forEach(r => { if (r.checked) countryName = r.value === 'ksa' ? 'Saudi Arabia' : (r.value === 'gcc' ? 'GCC / International' : 'Egypt'); });
        const selectedModules = [];
        serviceBoxes.forEach(b => { if (b.checked) selectedModules.push(b.parentElement.textContent.trim()); });
        notesField.value = `[Estimator Scope]: ${currentUsers} Users in ${countryName}. Modules: ${selectedModules.join(', ')}.`;
      }
    });
  }

  [...serviceBoxes, ...countryRadios].forEach(inp => {
    inp.addEventListener('change', updateEstimator);
  });
  setUsers(15);

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

  // ========================================================
  // 14. COA SIGNATURE RADIANT LIGHT ORB CURSOR CONTROLLER
  // ========================================================
  const cursorEl = document.getElementById('coaCursor');

  if (cursorEl) {
    let mouseX = -200, mouseY = -200;
    let currX = -200, currY = -200;
    let isTouch = false;
    let isVisible = false;

    window.addEventListener('touchstart', () => {
      isTouch = true;
      cursorEl.classList.remove('is-active');
      document.body.classList.remove('has-custom-cursor');
    }, { passive: true, once: true });

    window.addEventListener('mousemove', (e) => {
      if (isTouch) return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        currX = mouseX;
        currY = mouseY;
        document.body.classList.add('has-custom-cursor');
        cursorEl.classList.add('is-active');
      }
    });

    document.addEventListener('mouseleave', () => {
      cursorEl.classList.remove('is-active');
    });

    document.addEventListener('mouseenter', () => {
      if (isVisible && !isTouch) {
        cursorEl.classList.add('is-active');
      }
    });

    window.addEventListener('mousedown', () => {
      if (isVisible) cursorEl.classList.add('is-down');
    });
    window.addEventListener('mouseup', () => {
      if (isVisible) cursorEl.classList.remove('is-down');
    });

    // Hover detection for all interactive components
    const interactiveTarget = 'a, button, input, select, textarea, label, .btn, .dh-pcard, .dh-exp-item, .tab-btn, .case-card, .faq-item, .pill-radio, .pill-checkbox, .dh-skip-btn, .dh-enter-btn, .dh-nav-btn, .dh-dot, .dh-scroll-cue, .stat-pill, .meta-pill, .service-detail-grid, .author-avatar';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveTarget)) {
        cursorEl.classList.add('is-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveTarget)) {
        cursorEl.classList.remove('is-hover');
      }
    });

    // 120fps hardware-accelerated transform loop (instant & jitter-free)
    function renderCursor() {
      if (isVisible && !isTouch) {
        // Silky smooth trailing cursor (0.09 = luxurious lag, like liquid)
        currX += (mouseX - currX) * 0.09;
        currY += (mouseY - currY) * 0.09;
        cursorEl.style.transform = `translate3d(${currX}px, ${currY}px, 0)`;
      }
      requestAnimationFrame(renderCursor);
    }
    renderCursor();
  }

  // ========================================================
  // 15. COA ZERO-LAG UI ENGINE (PURE HARDWARE-ACCELERATED)
  // ========================================================
  const cyberCanvas = document.getElementById('cyberCanvas');
  if (cyberCanvas) {
    cyberCanvas.style.display = 'none';
  }
});

