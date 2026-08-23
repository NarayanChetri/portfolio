let autoHoverTimeout = null;
let autoHoverRaf = null;

// ---------------------------------------------------------------------
// Preloader — real progress driven by actual <img> load state
// ---------------------------------------------------------------------
(function () {
  document.body.classList.add('is-loading');
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const fill = document.getElementById('preloaderProgressFill');
  const text = document.getElementById('preloaderProgressText');

  const MIN_DISPLAY = 800;   // ms — avoid a jarring flash on fast loads
  const MAX_WAIT = 6000;     // ms — hard safety cap, never trust image events alone
  const HOLD_AT_100 = 300;   // ms — let the bar visibly reach 100% before hiding
  const start = Date.now();

  let done = false;
  let target = 0;      // real progress, 0–100
  let displayed = 0;   // smoothed value actually shown on screen

  function setTarget(pct) {
    target = Math.max(target, Math.min(100, pct));
  }

  function tick() {
    if (done && displayed >= target) return;
    displayed += (target - displayed) * 0.15;
    if (target - displayed < 0.15) displayed = target;
    const val = Math.round(displayed);
    if (fill) fill.style.width = val + '%';
    if (text) text.textContent = val + '%';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const images = Array.from(document.images);
  const total = images.length;
  let loadedCount = 0;

  function checkDone() {
    if (loadedCount >= total) hidePreloader();
  }

  function onImageSettled() {
    loadedCount++;
    const pct = total > 0 ? (loadedCount / total) * 90 : 90;
    setTarget(pct);
    checkDone();
  }

  function hidePreloader() {
    if (done) return;
    done = true;
    setTarget(100);
    const elapsed = Date.now() - start;
    const wait = Math.max(0, MIN_DISPLAY - elapsed) + HOLD_AT_100;
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.classList.remove('is-loading');
      setTimeout(() => preloader.remove(), 700);
    }, wait);
  }

  if (total === 0) {
    hidePreloader();
  } else {
    images.forEach((img) => {
      if (img.complete) {
        onImageSettled();
      } else {
        img.addEventListener('load', onImageSettled, { once: true });
        img.addEventListener('error', onImageSettled, { once: true });
      }
    });
  }

  setTimeout(hidePreloader, MAX_WAIT);
})();

function triggerAutoHover(card) {
  if (autoHoverTimeout) clearTimeout(autoHoverTimeout);
  if (autoHoverRaf) cancelAnimationFrame(autoHoverRaf);

  card.classList.remove('auto-hover');
  void card.offsetWidth;

  autoHoverRaf = requestAnimationFrame(() => {
    autoHoverRaf = requestAnimationFrame(() => {
      card.classList.add('auto-hover');
      autoHoverTimeout = setTimeout(() => {
        card.classList.remove('auto-hover');
      }, 200);
    });
  });
}

// ---------------------------------------------------------------------
// Project Scroll Spy (Swaps Descriptions on Scroll)
// ---------------------------------------------------------------------
const projectCards = document.querySelectorAll('.proj-card');
const projectDescs = document.querySelectorAll('.desc');

if (projectCards.length > 0 && projectDescs.length > 0) {
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px', 
    threshold: 0
  };

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeIndex = entry.target.getAttribute('data-index');

        projectDescs.forEach(desc => {
          if (desc.getAttribute('data-index') === activeIndex) {
            desc.classList.add('active-desc');
          } else {
            desc.classList.remove('active-desc');
          }
        });

        triggerAutoHover(entry.target);
      }
    });
  }, observerOptions);

  projectCards.forEach(card => projectObserver.observe(card));
}

// ---------------------------------------------------------------------
// Generic reveal-on-scroll
// ---------------------------------------------------------------------
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealEls.forEach((el) => revealObserver.observe(el));

// ---------------------------------------------------------------------
// Custom cursor — smooth follow + hover state + click-through
// ---------------------------------------------------------------------
(function () {
  if (window.innerWidth <= 980 || window.matchMedia("(hover: none)").matches) {
    return;
  }

  const cursor = document.getElementById('customCursor');
  const hoverCards = document.querySelectorAll('.proj-card, .cert-card');
  if (!cursor || !hoverCards.length) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  const ease = 0.18;
  let rafStarted = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafStarted) {
      rafStarted = true;
      requestAnimationFrame(animateCursor);
    }
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    requestAnimationFrame(animateCursor);
  }

  hoverCards.forEach((card) => {
    const isCertCard = card.classList.contains('cert-card');

    card.addEventListener('mouseenter', () => {
      cursor.classList.add('is-visible');
      if (isCertCard) {
        cursor.classList.add('is-small');
      }
    });

    card.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      cursor.classList.remove('is-clicking');
      if (isCertCard) {
        cursor.classList.remove('is-small');
      }
    });

    card.addEventListener('mousedown', () => {
      cursor.classList.add('is-clicking');
    });

    card.addEventListener('mouseup', () => {
      cursor.classList.remove('is-clicking');
    });

    card.addEventListener('click', () => {
      const link = card.getAttribute('data-link');
      if (link) {
        window.open(link, '_blank', 'noopener');
      }
    });
  });
})();

// ---------------------------------------------------------------------
// Nav scroll-spy + "Home"/logo click scrolls to top
// ---------------------------------------------------------------------
(function () {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const homeLink = document.querySelector('.nav-links a[href="#hero-fixed"]');
  if (homeLink) homeLink.addEventListener('click', scrollToTop);

  const logoLink = document.querySelector('.nav .logo');
  if (logoLink) logoLink.addEventListener('click', scrollToTop);

  const sections = Array.from(navLinks).map((link) => {
    const id = link.getAttribute('href').slice(1);
    const el = id === 'hero-fixed' ? null : document.getElementById(id);
    return { link, el };
  });

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120; // nav height + buffer
    let current = sections[0]; // default: home

    sections.forEach((section) => {
      if (section.el && section.el.offsetTop <= scrollPos) {
        current = section;
      }
    });

    sections.forEach((section) => {
      section.link.classList.toggle('active', section === current);
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();
})();

// ---------------------------------------------------------------------
// Footer year
// ---------------------------------------------------------------------
(function () {
  const yearEl = document.getElementById('footerYear');
  if (yearEl && !yearEl.textContent) {
    yearEl.textContent = new Date().getFullYear();
  }
})();