
let projSection = document.querySelector('.projects');
let cards = document.querySelectorAll('.proj-card');
let desc = document.querySelectorAll('.desc');


let lastActiveIndex = -1;
let autoHoverTimeout = null;
let autoHoverRaf = null;

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

    let activeIndex = -1;
    if (progress > 0) {
      activeIndex = Math.floor(progress / step);
      activeIndex = Math.min(activeIndex, cards.length - 1);
    }

    cards.forEach((card, index) => {
      if (progress > index * step) {
        card.classList.add('stack');
      } else {
        card.classList.remove('stack');
      }

      if (desc[index]) {
        if (index === activeIndex) {
          desc[index].classList.add('active-desc');
        } else {
          desc[index].classList.remove('active-desc');
        }
      }
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