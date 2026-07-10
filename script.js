/* ==========================================================================
   for Isabel — a memory, opened by accident.
   Exactly two moments of contact: the first touch that wakes it,
   and the orb at the end. Everything between drifts on its own.
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

  /* ---------------- TIMING (ms) — paced against the track (~80s) ---------------- */
  const T = {
    surfaceHold: 5200,        // intro line + name, half in focus, before fading under
    fragmentIn: 2200,         // time for a fragment to struggle into focus
    fragmentHold: 2600,       // fully-visible hold before it starts slipping away
    fragmentOut: 1600,        // time to dissolve back into haze
    nightTransition: 3200,    // haze deepens before the closing text
    closingHold: 12000,       // reading time before the orb appears
  };

  /* ---------------- STATE ---------------- */
  const audio = document.getElementById('bgm');
  const soundToggle = document.getElementById('soundToggle');
  let audioStarted = false;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let brightness = 1;

  /* ============================================================
     CANVAS — soft stars + dust motes drifting through the haze
     ============================================================ */
  const starCanvas = document.getElementById('stars');
  const partCanvas = document.getElementById('particles');
  const sctx = starCanvas.getContext('2d');
  const pctx = partCanvas.getContext('2d');
  let stars = [], particles = [];
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    W = window.innerWidth; H = window.innerHeight;
    [starCanvas, partCanvas].forEach(c => {
      c.width = W * DPR; c.height = H * DPR;
      c.style.width = W + 'px'; c.style.height = H + 'px';
    });
    sctx.setTransform(DPR,0,0,DPR,0,0);
    pctx.setTransform(DPR,0,0,DPR,0,0);
    buildStars();
  }
  function buildStars(){
    const count = Math.floor((W * H) / 7000);
    stars = Array.from({length: count}, () => ({
      x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2 + 0.2,
      baseA: Math.random()*0.4 + 0.1, speed: Math.random()*0.02 + 0.006, phase: Math.random()*Math.PI*2
    }));
  }
  function buildParticles(){
    const count = Math.floor((W * H) / 16000);
    particles = Array.from({length: count}, () => ({
      x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.6 + 0.4,
      vy: -(Math.random()*0.16 + 0.04), vx: (Math.random()-0.5)*0.07, a: Math.random()*0.34 + 0.08
    }));
  }

  let t0 = performance.now();
  function loop(now){
    const dt = now - t0; t0 = now;
    sctx.clearRect(0,0,W,H);
    for (const s of stars){
      s.phase += s.speed;
      const a = s.baseA + Math.sin(s.phase) * 0.18;
      sctx.beginPath();
      sctx.fillStyle = `rgba(236,230,218,${Math.max(0, a * brightness)})`;
      sctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      sctx.fill();
    }
    pctx.clearRect(0,0,W,H);
    for (const p of particles){
      p.y += p.vy * (dt/16.6);
      p.x += p.vx * (dt/16.6);
      if (p.y < -10){ p.y = H + 10; p.x = Math.random()*W; }
      pctx.beginPath();
      pctx.fillStyle = `rgba(217,190,160,${p.a})`;
      pctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      pctx.fill();
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize(); buildParticles();
  if (!reducedMotion) requestAnimationFrame(loop); else loop(performance.now());

  function spawnFireflies(){
    const wrap = document.getElementById('fireflies');
    const count = window.innerWidth < 600 ? 12 : 20;
    for (let i = 0; i < count; i++){
      const f = document.createElement('div');
      f.className = 'firefly';
      f.style.left = Math.random()*100 + '%';
      f.style.top = (35 + Math.random()*55) + '%';
      f.style.animationDuration = (7 + Math.random()*6) + 's, ' + (2.5 + Math.random()*2) + 's';
      f.style.animationDelay = (Math.random()*-8) + 's, ' + (Math.random()*-3) + 's';
      wrap.appendChild(f);
    }
    wrap.classList.add('on');
  }

  /* subtle parallax on the haze clouds — barely perceptible, dreamlike */
  if (!reducedMotion){
    let px = 0, py = 0;
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      px += (nx - px) * 0.05; py += (ny - py) * 0.05;
      starCanvas.style.transform = `translate(${px*4}px, ${py*4}px)`;
      partCanvas.style.transform = `translate(${px*9}px, ${py*9}px)`;
    });
  }

  /* ============================================================
     AUDIO — tries to start the instant the page loads. Browsers
     block unmuted autoplay without a gesture, so if that attempt
     is rejected, the very first touch/click/key/scroll anywhere
     on the page (not just the wake tap) starts it instead.
     ============================================================ */
  const AUDIO_TARGET = 0.6; // 60%, per request

  function startAudio(){
    if (audioStarted) return;
    audioStarted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.catch){
      p.then(fadeAudioIn).catch(() => {
        audioStarted = false; // let a real gesture retry it
      });
    } else fadeAudioIn();
  }
  function fadeAudioIn(){
    soundToggle.hidden = false;
    requestAnimationFrame(() => soundToggle.classList.add('show'));
    let v = 0;
    const iv = setInterval(() => {
      v += 0.03; audio.volume = Math.min(AUDIO_TARGET, v);
      if (v >= AUDIO_TARGET) clearInterval(iv);
    }, 60);
  }
  soundToggle.addEventListener('click', () => {
    if (audio.paused){ audio.play().catch(()=>{}); soundToggle.classList.remove('muted'); }
    else if (audio.muted || audio.volume === 0){ audio.muted = false; fadeAudioIn(); soundToggle.classList.remove('muted'); }
    else { audio.muted = true; soundToggle.classList.add('muted'); }
  });

  // Attempt immediately on load.
  startAudio();
  // Fallback: the first gesture of any kind, anywhere, starts it if the
  // load-time attempt was blocked. Harmless no-op once audio has begun.
  const gestureEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
  gestureEvents.forEach(evt => {
    window.addEventListener(evt, startAudio, { once: true, passive: true });
  });

  /* ============================================================
     TEXT SCATTER — breaks a line (or multi-line block) into words,
     each with its own random offset/rotation and entrance delay,
     so the sentence visibly assembles rather than sitting static.
     ============================================================ */
  function renderWords(el, text, spacingMs = 55){
    el.innerHTML = '';
    const lines = text.split('\n');
    let idx = 0;
    const spans = [];
    lines.forEach((line, li) => {
      if (li > 0) el.appendChild(document.createElement('br'));
      if (line.trim() === '') return;
      const words = line.split(' ');
      words.forEach((w, wi) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        const wx = (Math.random()-0.5) * 30;
        const wy = 8 + Math.random() * 16;
        const wr = (Math.random()-0.5) * 12;
        span.style.setProperty('--wx', wx.toFixed(1) + 'px');
        span.style.setProperty('--wy', wy.toFixed(1) + 'px');
        span.style.setProperty('--wr', wr.toFixed(1) + 'deg');
        span.style.setProperty('--wd', (idx * spacingMs) + 'ms');
        span.style.setProperty('--wd-out', (idx * (spacingMs*0.6)) + 'ms');
        el.appendChild(span);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
        spans.push(span);
        idx++;
      });
    });
    return spans;
  }

  function renderLetters(el, text, spacingMs = 45){
    el.innerHTML = '';
    const spans = [];
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      const wx = (Math.random()-0.5) * 16;
      const wy = 6 + Math.random() * 10;
      const wr = (Math.random()-0.5) * 16;
      span.style.setProperty('--wx', wx.toFixed(1) + 'px');
      span.style.setProperty('--wy', wy.toFixed(1) + 'px');
      span.style.setProperty('--wr', wr.toFixed(1) + 'deg');
      span.style.setProperty('--wd', (i * spacingMs) + 'ms');
      span.style.setProperty('--wd-out', (i * (spacingMs*0.6)) + 'ms');
      el.appendChild(span);
      spans.push(span);
    });
    return spans;
  }

  /* ============================================================
     STAGE ENGINE
     ============================================================ */
  const stages = {
    dormant: document.getElementById('stage-dormant'),
    surface: document.getElementById('stage-surface'),
    fragments: document.getElementById('stage-fragments'),
    clarity: document.getElementById('stage-clarity'),
  };

  function goTo(key){
    Object.values(stages).forEach(s => {
      if (s.classList.contains('active')){
        s.classList.remove('active'); s.classList.add('leaving');
        setTimeout(() => s.classList.remove('leaving'), 1800);
      }
    });
    requestAnimationFrame(() => stages[key].classList.add('active'));
  }

  /* ---------- DORMANT — first touch, anywhere, wakes it ---------- */
  const dormantStage = document.getElementById('stage-dormant');
  function wake(){
    dormantStage.removeEventListener('pointerdown', wake);
    startAudio();
    document.getElementById('whisper').style.transition = 'opacity 1.2s ease';
    document.getElementById('whisper').style.opacity = '0';
    setTimeout(() => {
      goTo('surface');
      runSurface();
    }, 900);
  }
  dormantStage.addEventListener('pointerdown', wake, { once: true });

  /* ---------- SURFACING ---------- */
  function runSurface(){
    const intro = document.getElementById('fragmentIntro');
    const name = document.getElementById('fragmentName');
    intro.classList.add('blur-in');
    name.classList.add('blur-in');
    setTimeout(() => intro.classList.add('in'), 300);
    setTimeout(() => name.classList.add('in'), 1900);
    setTimeout(() => {
      intro.classList.add('out'); intro.classList.remove('in');
      name.classList.add('out'); name.classList.remove('in');
    }, T.surfaceHold);
    setTimeout(() => {
      goTo('fragments');
      runFragments(0);
    }, T.surfaceHold + 1600);
  }

  /* ---------- FRAGMENTS — the message sequence ---------- */
  const messageEl = document.getElementById('messageText');
  function runFragments(i){
    if (i >= MESSAGES.length){
      setTimeout(() => { goTo('clarity'); runClarity(); }, 800);
      return;
    }
    messageEl.textContent = MESSAGES[i];
    messageEl.classList.remove('out', 'in', 'blur-in');
    void messageEl.offsetWidth;
    messageEl.classList.add('blur-in');
    requestAnimationFrame(() => messageEl.classList.add('in'));

    setTimeout(() => {
      messageEl.classList.remove('in');
      messageEl.classList.add('out');
      setTimeout(() => runFragments(i + 1), T.fragmentOut);
    }, T.fragmentIn + T.fragmentHold);
  }

  /* ---------- CLARITY — the one place that fully resolves ---------- */
  const closingEl = document.getElementById('closingText');
  const orb = document.getElementById('orb');

  function runClarity(){
    document.querySelector('.atmosphere').classList.add('night');
    brightness = 1.3;
    spawnFireflies();

    setTimeout(() => {
      closingEl.classList.add('in');
    }, T.nightTransition);

    setTimeout(() => {
      orb.hidden = false;
      requestAnimationFrame(() => orb.classList.add('show'));
    }, T.nightTransition + T.closingHold);
  }
  closingEl.textContent = CLOSING_MESSAGE;

  orb.addEventListener('click', () => {
    bloom();
    orb.style.pointerEvents = 'none';
  }, { once: true });

  function bloom(){
    const wrap = document.getElementById('lightBurst');
    const total = window.innerWidth < 600 ? 40 : 62;

    for (let i = 0; i < total; i++){
      const h = document.createElement('span');
      h.className = 'floating-heart';
      h.textContent = Math.random() < 0.7 ? '❤' : '♡';
      h.style.left = Math.random()*100 + 'vw';
      h.style.setProperty('--size', (13 + Math.random()*20) + 'px');
      h.style.setProperty('--dur', (6 + Math.random()*4) + 's');
      h.style.setProperty('--delay', (Math.random()*2) + 's');
      h.style.setProperty('--drift', ((Math.random()-0.5)*160) + 'px');
      h.style.setProperty('--rot', ((Math.random()-0.5)*50) + 'deg');
      wrap.appendChild(h);
      setTimeout(() => h.remove(), 12000);
    }
    for (let i = 0; i < total; i++){
      const m = document.createElement('span');
      m.className = 'mote';
      m.style.left = Math.random()*100 + 'vw';
      m.style.setProperty('--s', (2 + Math.random()*3) + 'px');
      m.style.setProperty('--dur', (5 + Math.random()*3) + 's');
      m.style.setProperty('--delay', (Math.random()*1.6) + 's');
      m.style.setProperty('--drift', ((Math.random()-0.5)*120) + 'px');
      wrap.appendChild(m);
      setTimeout(() => m.remove(), 10000);
    }
    setTimeout(() => {
      for (let i = 0; i < total*0.5; i++){
        const h = document.createElement('span');
        h.className = 'floating-heart';
        h.textContent = Math.random() < 0.7 ? '❤' : '♡';
        h.style.left = Math.random()*100 + 'vw';
        h.style.setProperty('--size', (13 + Math.random()*18) + 'px');
        h.style.setProperty('--dur', (6 + Math.random()*4) + 's');
        h.style.setProperty('--delay', (Math.random()*1.2) + 's');
        h.style.setProperty('--drift', ((Math.random()-0.5)*160) + 'px');
        h.style.setProperty('--rot', ((Math.random()-0.5)*50) + 'deg');
        wrap.appendChild(h);
        setTimeout(() => h.remove(), 12000);
      }
    }, 2600);
  }

})();
