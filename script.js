/* ═══════════════════════════════════════════════
   CHARLES ORISS — PORTFOLIO  /  script.js
═══════════════════════════════════════════════ */



// ══════════════════════════════════════════════
// PAGE LOADER — Developer terminal animation
// Lines appear one by one, progress bar fills,
// then the terminal slides out.
// ══════════════════════════════════════════════
(function() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // The terminal lines and when they appear (ms)
  const LINES = [
    { id: 'll1', delay: 300  },
    { id: 'll2', delay: 620  },
    { id: 'll3', delay: 900  },
    { id: 'll4', delay: 1080 },
    { id: 'll5', delay: 1240 },
    { id: 'll6', delay: 1420 },
    { id: 'll7', delay: 1700 },
    { id: 'll8', delay: 1950 },
  ];

  // Progress bar targets that match the line timings
  const PROGRESS = [
    { at: 500,  pct: 12  },
    { at: 700,  pct: 28  },
    { at: 950,  pct: 44  },
    { at: 1100, pct: 56  },
    { at: 1280, pct: 70  },
    { at: 1500, pct: 82  },
    { at: 1750, pct: 95  },
    { at: 2000, pct: 100 },
  ];

  const fill = document.getElementById('loader-fill');
  const pct  = document.getElementById('loader-pct');

  // Show each line at its scheduled time
  LINES.forEach(({ id, delay }) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('show');
    }, delay);
  });

  // Animate the progress bar
  PROGRESS.forEach(({ at, pct: p }) => {
    setTimeout(() => {
      if (fill) fill.style.width = p + '%';
      if (pct)  pct.textContent  = p + '%';
    }, at);
  });

  // Hide the loader after everything has played
  function hideLoader() {
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 750);
    }, 2500);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
    setTimeout(hideLoader, 4000); // failsafe
  }
})();




// ══════════════════════════════════════════════
// PARTICLE MESH (background canvas)
// mousemove lives here — this is what makes
// the dots react to your cursor position.
// No circle ring, just the dot/line effect.
// ══════════════════════════════════════════════
const cv  = document.getElementById('canvas');
const ctx = cv.getContext('2d');
let W, H, mouseX = -1000, mouseY = -1000, pts = [], t = 0;
const SPACING = 54, INFLUENCE = 170, REPEL = 88;

// Track mouse — drives both particle repulsion
// and the magnetic effects elsewhere in the file
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function resize() {
  W = cv.width  = window.innerWidth;
  H = cv.height = window.innerHeight;
  buildGrid();
}
function buildGrid() {
  pts = [];
  const cols = Math.ceil(W / SPACING) + 2;
  const rows = Math.ceil(H / SPACING) + 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pts.push({
        ox: c*SPACING-SPACING, oy: r*SPACING-SPACING,
        x:0, y:0, vx:0, vy:0,
        phase: Math.random()*Math.PI*2,
        size: Math.random()>.92 ? 2.2 : 1.2
      });
    }
  }
}
function drawParticles() {
  ctx.clearRect(0,0,W,H);
  t += 0.011;
  pts.forEach(p => {
    const bx = Math.sin(t+p.phase)*2.5, by = Math.cos(t*.7+p.phase)*2.5;
    const dx = p.ox-mouseX, dy = p.oy-mouseY;
    const dist = Math.sqrt(dx*dx+dy*dy);
    let tx = p.ox+bx, ty = p.oy+by;
    if (dist < INFLUENCE) {
      const f = 1-dist/INFLUENCE, a = Math.atan2(dy,dx);
      tx += Math.cos(a)*f*REPEL; ty += Math.sin(a)*f*REPEL;
    }
    p.vx += (tx-p.x)*.08; p.vy += (ty-p.y)*.08;
    p.vx *= .72; p.vy *= .72;
    p.x += p.vx; p.y += p.vy;
    const prox = Math.max(0, 1-dist/INFLUENCE);
    if (prox > .01) {
      ctx.fillStyle = `rgba(216,255,0,${0.11+prox*.55})`;
      ctx.shadowBlur = prox*9; ctx.shadowColor = 'rgba(216,255,0,.5)';
    } else {
      ctx.fillStyle = `rgba(240,237,230,${0.09+Math.sin(t+p.phase)*.03})`;
      ctx.shadowBlur = 0;
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size*(1+prox*.8), 0, Math.PI*2); ctx.fill();
  });
  ctx.shadowBlur = 0; ctx.lineWidth = 0.4;
  for (let i=0; i<pts.length; i++) {
    for (let j=i+1; j<pts.length; j++) {
      const a=pts[i], b=pts[j];
      if (Math.abs(a.ox-b.ox)>SPACING*1.5 || Math.abs(a.oy-b.oy)>SPACING*1.5) continue;
      const d = Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
      if (d > SPACING*1.6) continue;
      const al = Math.max(0, .06-(d/(SPACING*2))*.06);
      const pa = Math.max(0, 1-Math.sqrt((a.ox-mouseX)**2+(a.oy-mouseY)**2)/INFLUENCE);
      const pb = Math.max(0, 1-Math.sqrt((b.ox-mouseX)**2+(b.oy-mouseY)**2)/INFLUENCE);
      const prx = (pa+pb)/2;
      ctx.strokeStyle = prx>.05 ? `rgba(216,255,0,${al+prx*.22})` : `rgba(240,237,230,${al})`;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
  }
  requestAnimationFrame(drawParticles);
}
window.addEventListener('resize', resize);
resize();
drawParticles();


// ══════════════════════════════════════════════
// MOBILE NAV
// ══════════════════════════════════════════════
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}


// ══════════════════════════════════════════════
// TEXT SCRAMBLE
// Used on: award rows, nav links, hero name (hover)
// ══════════════════════════════════════════════
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

function scramble(el, finalText, delay = 0) {
  if (!el) return;
  let iter = 0;
  const len = finalText.length;
  setTimeout(() => {
    const id = setInterval(() => {
      el.textContent = finalText.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter)  return finalText[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      iter += 0.38;
      if (iter >= len) { el.textContent = finalText; clearInterval(id); }
    }, 38);
  }, delay);
}

// ── Load scramble — hero name on page load ──
setTimeout(() => {
  const f = document.getElementById('name-first');
  const l = document.getElementById('name-last');
  if (f) scramble(f, f.dataset.text, 0);
  if (l) scramble(l, l.dataset.text, 280);
}, 1000);

// ── Hover scramble — hero name ──
// Both lines scramble when you hover the name
const heroNameEl = document.querySelector('.hero-name');
if (heroNameEl) {
  let nameScrambling = false;
  heroNameEl.addEventListener('mouseenter', () => {
    if (nameScrambling) return;
    nameScrambling = true;
    const f = document.getElementById('name-first');
    const l = document.getElementById('name-last');
    scramble(f, 'CHARLES', 0);
    scramble(l, 'ORISS', 120);
    // Allow re-trigger after animation finishes
    setTimeout(() => { nameScrambling = false; }, 900);
  });
}

// ── Hover scramble — award rows ──
document.querySelectorAll('.aw-row').forEach(row => {
  const nm = row.querySelector('.aw-name');
  if (!nm) return;
  const orig = nm.textContent.trim();
  row.addEventListener('mouseenter', () => scramble(nm, orig.toUpperCase(), 0));
});

// ── Hover scramble — nav links ──
document.querySelectorAll('.nav-links a').forEach(link => {
  const orig = link.textContent.trim();
  let running = false;
  link.addEventListener('mouseenter', () => {
    if (running) return;
    running = true;
    let i = 0;
    const target = orig.toUpperCase();
    const id = setInterval(() => {
      link.textContent = target.split('').map((c, idx) => {
        if (c === ' ') return ' ';
        if (idx < i) return target[idx];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      i += 0.5;
      if (i >= target.length) {
        link.textContent = orig;
        clearInterval(id);
        running = false;
      }
    }, 36);
  });
});



// ══════════════════════════════════════════════
// 3D TILT
// ══════════════════════════════════════════════
function addTilt(selector, intensity=5) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX-r.left)/r.width - .5) * 2;
      const ny = ((e.clientY-r.top)/r.height - .5) * 2;
      el.style.transform = `rotateX(${ny*-intensity}deg) rotateY(${nx*intensity}deg) scale(1.02)`;
      el.style.transition = 'transform 0.1s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'rotateX(0) rotateY(0) scale(1)';
      el.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1)';
    });
  });
}
// Only apply tilt on non-touch devices
if (window.matchMedia('(hover: hover)').matches) {
  addTilt('.astat', 6);
  addTilt('.sk', 4);
  addTilt('.restaurant-card', 2.5);
  addTilt('.status-box', 6);
}





// ══════════════════════════════════════════════
// MAGNETIC EFFECT
// Applied to: buttons, social icons, hero stats
// Each element physically pulls toward the cursor
// ══════════════════════════════════════════════
if (window.matchMedia('(hover: hover)').matches) {

  // Helper — adds magnetic pull to any element
  function addMagnetic(el, intensity = 0.35) {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * intensity;
      const y = (e.clientY - r.top  - r.height / 2) * intensity;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.transition = 'transform 0.1s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.55s cubic-bezier(.16,1,.3,1)';
    });
  }

  // Buttons inside .magnetic wrappers
  // (the wrapper detects the hover zone, the inner btn moves)
  document.querySelectorAll('.magnetic').forEach(wrap => {
    const btn = wrap.querySelector('.icon-btn, .btn-submit, .cta-big-btn');
    if (!btn) return;
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.35;
      const y = (e.clientY - r.top  - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
      btn.style.transition = 'transform 0.1s ease';
    });
    wrap.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.55s cubic-bezier(.16,1,.3,1)';
    });
  });

  // Social icon squares — each pulls individually
  document.querySelectorAll('.soc-icon, .cp-soc').forEach(icon => {
    addMagnetic(icon, 0.38);
  });

  // ── HERO STATS — each stat pulls toward cursor ──
  // The number, label, and surrounding space all feel
  // physically connected and react to the mouse.
  document.querySelectorAll('.hstat').forEach(stat => {
    // Slightly lower intensity — they're in a flex row
    // so big movement would break the layout visually
    stat.addEventListener('mousemove', e => {
      const r = stat.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.28;
      const y = (e.clientY - r.top  - r.height / 2) * 0.28;
      stat.style.transform = `translate(${x}px, ${y}px)`;
      stat.style.transition = 'transform 0.1s ease';
    });
    stat.addEventListener('mouseleave', () => {
      stat.style.transform = 'translate(0, 0)';
      stat.style.transition = 'transform 0.6s cubic-bezier(.16,1,.3,1)';
    });
  });

}




// ══════════════════════════════════════════════
// COUNTING NUMBERS
// ══════════════════════════════════════════════
function countUp(el, target, duration=1800) {
  const num = parseInt(target);
  if (isNaN(num)) return;
  const suffix = el.dataset.suffix || '';
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const prog = Math.min((ts-start)/duration, 1);
    const eased = 1-(1-prog)**4;
    el.textContent = Math.floor(eased*num) + suffix;
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = num + suffix;
  }
  requestAnimationFrame(step);
}
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.hstat-num[data-count]').forEach(n => countUp(n, n.dataset.count));
      countObs.unobserve(e.target);
    }
  });
}, { threshold: .5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) countObs.observe(heroStats);


// ══════════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════════
const revObs = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) e.target.classList.add('V'); });
}, { threshold: .07 });
document.querySelectorAll('.R').forEach(el => revObs.observe(el));


// ══════════════════════════════════════════════
// SKILL BARS
// ══════════════════════════════════════════════
const barObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sk-bar').forEach(b => { b.style.width = b.dataset.w+'%'; });
      barObs.unobserve(e.target);
    }
  });
}, { threshold: .25 });
const sg = document.getElementById('skillsGrid');
if (sg) barObs.observe(sg);


// ══════════════════════════════════════════════
// PROGRESS BAR
// ══════════════════════════════════════════════
const pbObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      const fill = document.querySelector('.rc-progress-fill');
      if (fill) fill.style.width = fill.dataset.progress+'%';
      pbObs.unobserve(e.target);
    }
  });
}, { threshold: .3 });
const rc = document.querySelector('.restaurant-card');
if (rc) pbObs.observe(rc);


// ══════════════════════════════════════════════
// RESTAURANT PHOTO LOADER
// Checks if the image is already cached (loaded)
// or waits for the load event.
// Works on first visit AND on reload.
// ══════════════════════════════════════════════
function initRestaurantPhoto() {
  const rcPhoto = document.getElementById('rc-photo');
  const rcSVG   = document.getElementById('rc-svg-fallback');
  if (!rcPhoto) return;

  function showPhoto() {
    rcPhoto.classList.add('loaded');
    if (rcSVG) rcSVG.style.display = 'none';
  }

  function showFallback() {
    rcPhoto.style.display = 'none';
    if (rcSVG) rcSVG.style.display = '';
  }

  // If browser already has it cached, naturalWidth > 0 immediately
  if (rcPhoto.complete && rcPhoto.naturalWidth > 0) {
    showPhoto();
    return;
  }

  // Otherwise wait for it to load
  rcPhoto.addEventListener('load',  showPhoto,    { once: true });
  rcPhoto.addEventListener('error', showFallback, { once: true });
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRestaurantPhoto);
} else {
  initRestaurantPhoto();
}


// ══════════════════════════════════════════════
// EXPERIENCE TABS
// ══════════════════════════════════════════════
const expRows   = document.querySelectorAll('.exp-row');
const expDetail = document.getElementById('expDetail');
expRows.forEach(row => {
  row.addEventListener('click', () => {
    expRows.forEach(r => r.classList.remove('active'));
    row.classList.add('active');
    if (expDetail) {
      expDetail.style.opacity = '0';
      expDetail.style.transform = 'translateY(10px)';
      setTimeout(() => {
        expDetail.innerHTML = row.dataset.detail;
        expDetail.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        expDetail.style.opacity = '1';
        expDetail.style.transform = 'translateY(0)';
      }, 180);
    }
  });
});
if (expRows.length > 0) expRows[0].click();




// ══════════════════════════════════════════════
// PARALLAX + 3D NAME TILT (desktop only)
// The hero name physically tilts as you move
// the mouse — giving it real 3D depth.
// ══════════════════════════════════════════════
const heroName    = document.querySelector('.hero-name');
const heroOrbs    = document.querySelectorAll('.hero-orb');
const heroSection = document.getElementById('hero');

if (window.matchMedia('(hover: hover)').matches) {

  // Scroll parallax — name drifts up as you scroll
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (heroName) {
      heroName.style.transform = `translateY(${sy * 0.2}px)`;
    }
    heroOrbs.forEach((o, i) => {
      o.style.transform = `translateY(${sy * (0.08 + i * 0.04)}px)`;
    });
  }, { passive: true });

  // Mouse move — 3D tilt on the name + orb drift
  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const r  = heroSection.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;  // -0.5 to 0.5
      const ny = (e.clientY - r.top)  / r.height - 0.5;  // -0.5 to 0.5

      // 3D tilt on the name — rotates toward mouse
      if (heroName) {
        heroName.style.transform = `
          perspective(700px)
          rotateX(${ny * -10}deg)
          rotateY(${nx * 10}deg)
          translateZ(10px)
          translateY(${window.scrollY * 0.2}px)
        `;
        heroName.style.transition = 'transform 0.12s ease';
      }

      // Orbs drift (depth parallax layers)
      heroOrbs.forEach((o, i) => {
        o.style.transform = `translate(${nx * (10 + i * 5)}px, ${ny * (8 + i * 3)}px)`;
      });
    });

    // Reset on mouse leave
    heroSection.addEventListener('mouseleave', () => {
      if (heroName) {
        heroName.style.transform = `translateY(${window.scrollY * 0.2}px)`;
        heroName.style.transition = 'transform 0.6s cubic-bezier(.16,1,.3,1)';
      }
      heroOrbs.forEach(o => { o.style.transform = ''; });
    });
  }

}





// ══════════════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════════════
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) {
      form.style.animation = 'shake .4s cubic-bezier(.36,.07,.19,.97)';
      setTimeout(() => form.style.animation = '', 500);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.email.style.borderColor = 'rgba(255,60,60,.7)';
      setTimeout(() => form.email.style.borderColor = '', 1800);
      return;
    }
    submitBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Sending...`;
    submitBtn.style.pointerEvents = 'none';
    // ── Connect to Formspree or EmailJS here ──
    try {
      const res = await fetch('https://formspree.io/f/mreyvzwq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, message,
          subject: form.subject?.value || 'Portfolio Contact'
        })
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      submitBtn.innerHTML = 'Something went wrong — try emailing directly.';
      submitBtn.style.background = 'rgba(255,60,60,0.8)';
      submitBtn.style.pointerEvents = 'auto';
      return;
    }
    submitBtn.classList.add('sent');
    submitBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Message Sent!`;
    setTimeout(() => {
      form.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
    }, 1000);
  });
}


// ══════════════════════════════════════════════
// NAV — translucent on scroll + active state
// ══════════════════════════════════════════════
const navEl   = document.querySelector('nav');
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  // Translucent nav — no border, just glass blur
  if (navEl) {
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  }

  // Active link highlight
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navAs.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });