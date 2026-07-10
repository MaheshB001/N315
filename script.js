/* ==========================================================================
   FRIENDSHIP DAY — a short interactive film
   Two manual beats only: opening the gift, and the final heart.
   Everything else advances on its own, timed to the music.
   Edit MESSAGES / CLOSING_MESSAGE below to change the words.
   ========================================================================== */

(() => {
  'use strict';

  /* ---------------- CONTENT — edit freely ---------------- */
  const MESSAGES = [
    "Among billions of people in this world...",
    "Somehow, I found you.",
    "And somehow, you became someone who means more to me than I ever expected.",
    "I don't think you realize how much your presence has mattered.",
    "In moments when the world felt heavy...",
    "Having someone like you made it a little easier to keep going.",
    "Thank you for every moment you gave me.",
    "Every time you were there.",
    "Every memory that became something I will carry with me.",
    "Life moves faster than we realize.",
    "People enter our lives, leave their mark, and change us forever.",
    "And I know that no matter where life takes us...",
    "I will always be grateful that, in this enormous world...",
    "I got the chance to know you.",
    "You are not just a chapter in my story.",
    "You are one of the pages I will always come back to."
  ];

  const CLOSING_MESSAGE =
`One day, we might look back at this moment from completely different places.
Different lives.
Different versions of ourselves.

But I hope you remember this:
Out of all the paths that could have crossed...
Ours did.

And that will always mean something to me.
Thank you for being a part of my life.

Happy Friendship Day ❤️
Love ya`;

  /* ---------------- TIMING (ms) — paced against the track ---------------- */
  const T = {
    boxOpenHold: 1600,        // box lid lifts, light escapes
    envelopeRise: 2000,       // envelope rises out of the box
    stage3Hold: 3600,         // envelope -> letter unfold, reading the intro
    messageIn: 1300,          // fade/blur/rise-in duration for each message
    messageHold: 2000,        // time fully visible before it starts leaving
    messageOut: 900,          // fade-out duration
    nightTransition: 2600,    // sky shifts to night before closing text
    closingHold: 11000,       // time to read the closing message before the button appears
  };

  /* ---------------- STATE ---------------- */
  const audio = document.getElementById('bgm');
  const soundToggle = document.getElementById('soundToggle');
  let audioStarted = false;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     CANVAS — starfield (static-ish twinkle) + drifting particles
     ============================================================ */
  const starCanvas = document.getElementById('stars');
  const partCanvas = document.getElementById('particles');
  const sctx = starCanvas.getContext('2d');
  const pctx = partCanvas.getContext('2d');
  let stars = [];
  let particles = [];
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    W = window.innerWidth;
    H = window.innerHeight;
    [starCanvas, partCanvas].forEach(c => {
      c.width = W * DPR;
      c.height = H * DPR;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
    });
    sctx.setTransform(DPR,0,0,DPR,0,0);
    pctx.setTransform(DPR,0,0,DPR,0,0);
    buildStars();
  }

  function buildStars(){
    const count = Math.floor((W * H) / 9000);
    stars = Array.from({length: count}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.1 + 0.2,
      baseA: Math.random() * 0.5 + 0.15,
      speed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function buildParticles(){
    const count = Math.floor((W * H) / 26000);
    particles = Array.from({length: count}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.12 + 0.03),
      vx: (Math.random() - 0.5) * 0.05,
      a: Math.random() * 0.35 + 0.08
    }));
  }

  let brightness = 1; // upshifts slightly once night sky kicks in
  let t0 = performance.now();
  function loop(now){
    const dt = now - t0; t0 = now;

    sctx.clearRect(0,0,W,H);
    for (const s of stars){
      s.phase += s.speed;
      const a = s.baseA + Math.sin(s.phase) * 0.22;
      sctx.beginPath();
      sctx.fillStyle = `rgba(236,234,245,${Math.max(0, a * brightness)})`;
      sctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      sctx.fill();
    }

    pctx.clearRect(0,0,W,H);
    for (const p of particles){
      p.y += p.vy * (dt/16.6);
      p.x += p.vx * (dt/16.6);
      if (p.y < -10){ p.y = H + 10; p.x = Math.random() * W; }
      pctx.beginPath();
      pctx.fillStyle = `rgba(200,195,235,${p.a})`;
      pctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      pctx.fill();
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  buildParticles();
  if (!reducedMotion) requestAnimationFrame(loop);
  else { // draw a single static frame
    loop(performance.now());
  }

  /* ---------------- Fireflies (DOM, appear at night stage) ---------------- */
  function spawnFireflies(){
    const wrap = document.getElementById('fireflies');
    const count = window.innerWidth < 600 ? 14 : 22;
    for (let i = 0; i < count; i++){
      const f = document.createElement('div');
      f.className = 'firefly';
      f.style.left = Math.random() * 100 + '%';
      f.style.top = (40 + Math.random() * 55) + '%';
      f.style.animationDuration = (6 + Math.random() * 6) + 's, ' + (2 + Math.random()*2) + 's';
      f.style.animationDelay = (Math.random() * -8) + 's, ' + (Math.random() * -3) + 's';
      wrap.appendChild(f);
    }
    wrap.classList.add('on');
  }

  /* ============================================================
     SUBTLE PARALLAX — mouse (desktop) / gyroscope-free touch drift
     ============================================================ */
  let px = 0, py = 0;
  function applyParallax(x, y){
    px += (x - px) * 0.06;
    py += (y - py) * 0.06;
    starCanvas.style.transform = `translate(${px*6}px, ${py*6}px)`;
    partCanvas.style.transform = `translate(${px*12}px, ${py*12}px)`;
    requestAnimationFrame(() => applyParallax(x, y));
  }
  if (!reducedMotion){
    let raf = null;
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      px += (nx - px) * 0.08; py += (ny - py) * 0.08;
      starCanvas.style.transform = `translate(${px*6}px, ${py*6}px)`;
      partCanvas.style.transform = `translate(${px*12}px, ${py*12}px)`;
    });
  }

  /* ============================================================
     RIPPLE — on any .cta / .heart-btn tap
     ============================================================ */
  function attachRipple(el){
    el.addEventListener('pointerdown', (e) => {
      const rect = el.getBoundingClientRect();
      const r = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.4;
      r.className = 'ripple';
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size/2) + 'px';
      r.style.top = (e.clientY - rect.top - size/2) + 'px';
      el.appendChild(r);
      setTimeout(() => r.remove(), 720);
    });
  }
  document.querySelectorAll('.cta, .heart-btn').forEach(attachRipple);

  /* ============================================================
     AUDIO — begins on first interaction, then continues seamlessly
     ============================================================ */
  function startAudio(){
    if (audioStarted) return;
    audioStarted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.catch){
      p.then(fadeAudioIn).catch(() => {
        // Autoplay blocked even after gesture — surface toggle so the
        // person can start it manually with one more tap.
        soundToggle.hidden = false;
        soundToggle.classList.add('show');
        soundToggle.classList.add('muted');
      });
    } else {
      fadeAudioIn();
    }
  }

  function fadeAudioIn(){
    soundToggle.hidden = false;
    requestAnimationFrame(() => soundToggle.classList.add('show'));
    let v = 0;
    const target = 0.75;
    const iv = setInterval(() => {
      v += 0.04;
      audio.volume = Math.min(target, v);
      if (v >= target) clearInterval(iv);
    }, 60);
  }

  soundToggle.addEventListener('click', () => {
    if (audio.paused){
      audio.play().catch(()=>{});
      soundToggle.classList.remove('muted');
    } else if (audio.muted || audio.volume === 0){
      audio.muted = false;
      fadeAudioIn();
      soundToggle.classList.remove('muted');
    } else {
      audio.muted = true;
      soundToggle.classList.add('muted');
    }
  });

  /* ============================================================
     STAGE ENGINE — simple, linear, timer-driven
     ============================================================ */
  const stages = {
    1: document.getElementById('stage-1'),
    2: document.getElementById('stage-2'),
    3: document.getElementById('stage-3'),
    4: document.getElementById('stage-4'),
    final: document.getElementById('stage-final'),
  };

  function goTo(stageKey){
    Object.values(stages).forEach(s => {
      if (s.classList.contains('active')){
        s.classList.remove('active');
        s.classList.add('leaving');
        setTimeout(() => s.classList.remove('leaving'), 1200);
      }
    });
    const next = stages[stageKey];
    // slight delay so the outgoing stage has begun fading first
    requestAnimationFrame(() => next.classList.add('active'));
  }

  /* ---------- Stage 1: reveal copy + box + button on load ---------- */
  function runStage1(){
    document.querySelectorAll('#stage-1 .reveal').forEach(el => {
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('in'), delay);
    });
  }

  const openBtn = document.getElementById('openBtn');
  openBtn.addEventListener('click', () => {
    startAudio();
    openBtn.disabled = true;
    // lift the lid right where the user is looking, then move on
    document.getElementById('giftBox').classList.add('open');
    document.querySelector('#stage-1 .box-lid').classList.add('lifted');
    setTimeout(() => {
      goTo(2);
      runStage2();
    }, 500);
  }, { once: true });

  /* ---------- Stage 2: light escapes, envelope rises ---------- */
  function runStage2(){
    setTimeout(() => {
      document.getElementById('envelope').classList.add('rise');
    }, 300);
    setTimeout(() => {
      goTo(3);
      runStage3();
    }, T.boxOpenHold + T.envelopeRise);
  }

  /* ---------- Stage 3: envelope opens into a letter ---------- */
  function runStage3(){
    setTimeout(() => {
      document.getElementById('paper').classList.add('open');
    }, 300);
    setTimeout(() => {
      goTo(4);
      runStage4(0);
    }, T.stage3Hold);
  }

  /* ---------- Stage 4: message sequence, auto-advancing ---------- */
  const messageEl = document.getElementById('messageText');
  const threadEl = document.getElementById('progressThread');

  function runStage4(i){
    if (i >= MESSAGES.length){
      setTimeout(() => {
        goTo('final');
        runFinal();
      }, 600);
      return;
    }
    messageEl.textContent = MESSAGES[i];
    messageEl.classList.remove('out');
    // force reflow so the 'in' transition replays each time
    void messageEl.offsetWidth;
    messageEl.classList.add('in');

    threadEl.classList.add('tick');
    threadEl.style.setProperty('--p', ((i+1) / MESSAGES.length).toFixed(3));

    setTimeout(() => {
      messageEl.classList.remove('in');
      messageEl.classList.add('out');
      setTimeout(() => runStage4(i + 1), T.messageOut);
    }, T.messageIn + T.messageHold);
  }

  /* ---------- Final stage: night sky, closing message, hearts ---------- */
  const closingEl = document.getElementById('closingText');
  const heartBtn = document.getElementById('heartBtn');

  function runFinal(){
    document.querySelector('.atmosphere').classList.add('night');
    brightness = 1.3;
    spawnFireflies();

    setTimeout(() => {
      closingEl.textContent = CLOSING_MESSAGE;
      closingEl.classList.add('in');
    }, T.nightTransition);

    setTimeout(() => {
      heartBtn.hidden = false;
      requestAnimationFrame(() => heartBtn.classList.add('show'));
    }, T.nightTransition + T.closingHold);
  }

  heartBtn.addEventListener('click', () => {
    burstHearts();
    heartBtn.disabled = true;
    heartBtn.style.pointerEvents = 'none';
  });

  function burstHearts(){
    const wrap = document.getElementById('heartBurst');
    const glyphs = ['❤','♡','✦'];
    const total = window.innerWidth < 600 ? 46 : 70;

    for (let i = 0; i < total; i++){
      const h = document.createElement('span');
      h.className = 'floating-heart';
      h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const left = Math.random() * 100;
      h.style.left = left + 'vw';
      h.style.setProperty('--size', (14 + Math.random() * 22) + 'px');
      h.style.setProperty('--dur', (5 + Math.random() * 4) + 's');
      h.style.setProperty('--delay', (Math.random() * 1.8) + 's');
      h.style.setProperty('--drift', ((Math.random() - 0.5) * 160) + 'px');
      h.style.setProperty('--rot', ((Math.random() - 0.5) * 60) + 'deg');
      wrap.appendChild(h);
      setTimeout(() => h.remove(), 11000);
    }

    // soft confetti — muted violet / gold / silver, never loud
    const colors = ['#8c7ff2', '#f0c88a', '#eceaf5'];
    for (let i = 0; i < total * 0.7; i++){
      const c = document.createElement('span');
      c.className = 'confetto';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.setProperty('--s', (4 + Math.random() * 5) + 'px');
      c.style.setProperty('--c', colors[Math.floor(Math.random()*colors.length)]);
      c.style.setProperty('--dur', (4 + Math.random() * 3) + 's');
      c.style.setProperty('--delay', (Math.random() * 1.5) + 's');
      c.style.setProperty('--drift', ((Math.random() - 0.5) * 200) + 'px');
      c.style.setProperty('--rot', (Math.random() * 360) + 'deg');
      wrap.appendChild(c);
      setTimeout(() => c.remove(), 9000);
    }

    // a gentle second wave for a fuller, less mechanical finish
    setTimeout(() => {
      for (let i = 0; i < total * 0.5; i++){
        const h = document.createElement('span');
        h.className = 'floating-heart';
        h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        h.style.left = Math.random() * 100 + 'vw';
        h.style.setProperty('--size', (14 + Math.random() * 20) + 'px');
        h.style.setProperty('--dur', (5 + Math.random() * 4) + 's');
        h.style.setProperty('--delay', (Math.random() * 1.2) + 's');
        h.style.setProperty('--drift', ((Math.random() - 0.5) * 160) + 'px');
        h.style.setProperty('--rot', ((Math.random() - 0.5) * 60) + 'deg');
        wrap.appendChild(h);
        setTimeout(() => h.remove(), 11000);
      }
    }, 2400);
  }

  /* ---------------- boot ---------------- */
  runStage1();
})();
