let projSection = document.querySelector('.projects');
let cards = document.querySelectorAll('.proj-card');
let desc = document.querySelectorAll('.desc');
let ghostNumber = document.getElementById('projGhostNumber');
let progressFill = document.getElementById('projProgressFill');
let progressDots = document.querySelectorAll('.proj-progress-dot');

let lastActiveIndex = -1;
let autoHoverTimeout = null;
let autoHoverRaf = null;

// ---------------------------------------------------------------------
// Preloader
// ---------------------------------------------------------------------
(function () {
  document.body.classList.add('is-loading');
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const MIN_DISPLAY = 700;  // ms — avoids a jarring flash on fast loads
  const MAX_WAIT = 4000;    // ms — hard safety cap, never trust load() alone
  const start = Date.now();
  let done = false;

  function hidePreloader() {
    if (done) return;
    done = true;
    const elapsed = Date.now() - start;
    const wait = Math.max(0, MIN_DISPLAY - elapsed);
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.classList.remove('is-loading');
      setTimeout(() => preloader.remove(), 700);
    }, wait);
  }

  // Normal path: wait for full load
  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }

  // Safety net: if 'load' never fires (blocked request, slow analytics
  // script, etc.), force-hide anyway so the page is never stuck.
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

if (projSection && cards.length) {
  window.addEventListener('scroll', () => {
    const rect = projSection.getBoundingClientRect();
    let sectionTop = rect.top;
    const sectionHeight = rect.height - window.innerHeight;

    let progress = -sectionTop / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));

    const step = 1 / cards.length;
    // First card should appear almost the instant the section pins,
    // independent of section height or card count.
    const firstThreshold = 0.01;

    let activeIndex = -1;
    if (progress > firstThreshold) {
      if (progress <= step) {
        activeIndex = 0;
      } else {
        activeIndex = Math.floor(progress / step);
        activeIndex = Math.min(activeIndex, cards.length - 1);
      }
    }

    cards.forEach((card, index) => {
      const threshold = index === 0 ? firstThreshold : index * step;
      const isPast = progress > threshold;

      if (isPast) {
        card.classList.add('stack');
      } else {
        card.classList.remove('stack');
      }

      if (desc[index]) {
        if (isPast && index === activeIndex) {
          desc[index].classList.add('active-desc');
        } else {
          desc[index].classList.remove('active-desc');
        }
      }
    });

    // Ghost number behind the active card
    if (ghostNumber) {
      const num = (activeIndex === -1 ? 0 : activeIndex) + 1;
      ghostNumber.textContent = String(num).padStart(2, '0');
    }

    // Vertical progress rail: fill height + dot states
    if (progressFill) {
      progressFill.style.height = (progress * 100) + '%';
    }
    progressDots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
      dot.classList.toggle('is-done', activeIndex !== -1 && index < activeIndex);
    });

    if (activeIndex !== -1 && activeIndex !== lastActiveIndex) {
      triggerAutoHover(cards[activeIndex]);
    }
    lastActiveIndex = activeIndex;
  });
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
  // Disable custom cursor script on mobile and touch devices
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

    // Update left/top position so we don't overwrite the CSS transform/scale
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