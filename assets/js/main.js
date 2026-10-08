/* Lawn Doctor of Bel Air–Parkville — site behaviour. No dependencies. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  /* Where a confirmed ZIP should go to book. Leave empty to show the phone CTA instead.
     The ZIP is appended as ?zip=XXXXX. */
  const QUOTE_URL = '';
  const PHONE_DISPLAY = '800.845.0580';
  const PHONE_TEL = '+18008450580';

  /* ---------- Hero video ---------- */
  const hero = document.querySelector('[data-hero]');
  const video = document.querySelector('[data-hero-video]');
  const place = document.querySelector('[data-hero-place]');
  const toggle = document.querySelector('[data-hero-toggle]');
  const toggleText = document.querySelector('[data-hero-toggle-text]');

  const attachVideo = () => {
    if (!video || reducedMotion || saveData) return;
    video.querySelectorAll('source[data-src]').forEach((s) => {
      if (s.media && !window.matchMedia(s.media).matches) { s.remove(); return; }
      s.src = s.dataset.src;
    });
    video.load();
    const play = video.play();
    if (play && play.catch) play.catch(() => {});
  };
  if (document.readyState === 'complete') attachVideo();
  else window.addEventListener('load', attachVideo, { once: true });

  // "Now showing" captions follow the film.
  if (video && place && place.dataset.captions) {
    const captions = JSON.parse(place.dataset.captions);
    let current = place.textContent.trim();
    video.addEventListener('timeupdate', () => {
      const t = video.currentTime;
      let next = captions[0].text;
      for (const c of captions) if (t >= c.from) next = c.text;
      if (next === current) return;
      current = next;
      place.setAttribute('data-swapping', '');
      setTimeout(() => {
        place.textContent = next;
        place.removeAttribute('data-swapping');
      }, 350);
    });
  }

  if (toggle && video && hero) {
    toggle.addEventListener('click', () => {
      const paused = hero.dataset.paused === 'true';
      if (paused) { video.play().catch(() => {}); } else { video.pause(); }
      hero.dataset.paused = String(!paused);
      toggleText.textContent = paused ? 'Pause' : 'Play';
      toggle.setAttribute('aria-label', paused ? 'Pause background video' : 'Play background video');
    });
  }

  // Don't decode video nobody can see.
  if (video && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!video.currentSrc || hero.dataset.paused === 'true') return;
      if (entry.isIntersecting) video.play().catch(() => {}); else video.pause();
    }, { threshold: 0.05 }).observe(hero);
  }

  /* ---------- Header: transparent over the hero, solid after, hides on scroll down ---------- */
  const header = document.querySelector('[data-site-header]');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const heroBottom = hero ? hero.offsetHeight - 80 : 0;
    header.dataset.state = y > heroBottom ? 'solid' : 'over';
    const goingDown = y > lastY && y > heroBottom + 200;
    if (!document.documentElement.classList.contains('menu-open')) header.dataset.hidden = String(goingDown);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const setMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    if (open) header.dataset.hidden = 'false';
  };
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuToggle.focus(); } });
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Reviews marquee: clone the set once for a seamless loop ---------- */
  document.querySelectorAll('[data-marquee] .marquee__track').forEach((track) => {
    [...track.children].forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  /* ---------- ZIP check ---------- */
  const SERVICE_ZIPS = {
    '21014': 'Bel Air', '21015': 'Bel Air', '21234': 'Parkville & Carney', '21047': 'Fallston',
    '21050': 'Forest Hill', '21009': 'Abingdon', '21128': 'Perry Hall', '21087': 'Kingsville',
    '21085': 'Joppa', '21028': 'Churchville', '21084': 'Jarrettsville', '21236': 'Nottingham',
    '21057': 'Glen Arm', '21051': 'Fork', '21082': 'Hydes', '21162': 'White Marsh',
    '21206': 'Overlea', '21214': 'Hamilton', '21040': 'Edgewood', '21017': 'Belcamp',
  };

  const phoneLink = `<a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a>`;

  document.querySelectorAll('[data-zip-form]').forEach((form) => {
    const input = form.querySelector('input[name="zip"]');
    const result = form.querySelector('[data-zip-result]');

    input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 5); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const zip = input.value.trim();
      if (!/^\d{5}$/.test(zip)) {
        result.dataset.tone = 'error';
        result.textContent = 'Please enter a 5-digit ZIP code.';
        input.focus();
        return;
      }
      const town = SERVICE_ZIPS[zip];
      if (town) {
        if (QUOTE_URL) { window.location.href = `${QUOTE_URL}?zip=${zip}`; return; }
        result.dataset.tone = 'good';
        result.innerHTML = `Good news! ${town} (${zip}) is on our route. Call ${phoneLink} to book your free evaluation.`;
      } else if (/^21[0-9]{3}$/.test(zip)) {
        result.dataset.tone = 'near';
        result.innerHTML = `${zip} is just off our usual route. Call ${phoneLink} and we'll get you to the closest Lawn Doctor.`;
      } else {
        result.dataset.tone = 'near';
        result.innerHTML = `We serve Harford and Baltimore County, MD. Call ${phoneLink} and we'll find the Lawn Doctor nearest you.`;
      }
    });
  });

  /* ---------- Footer year ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
