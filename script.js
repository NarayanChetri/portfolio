let autoHoverTimeout = null;
let autoHoverRaf = null;

// ---------------------------------------------------------------------
// Entrance Animations — instant reveal, staggered via CSS
// ---------------------------------------------------------------------
(function () {
  // Trigger entrance animations once critical fonts are loaded
  let isRevealed = false;
  function reveal() {
    if (isRevealed) return;
    isRevealed = true;
    document.body.classList.add('is-revealed');
    startNavGreeting();
  }

  function initReveal() {
    if ('fonts' in document) {
      // Pre-request critical fonts and wait until fonts are ready (or max 800ms safety timeout)
      Promise.race([
        Promise.allSettled([
          document.fonts.load('400 48px Anton'),
          document.fonts.load('400 16px Inter'),
          document.fonts.load('600 16px Inter'),
          document.fonts.load('700 16px Inter'),
          document.fonts.load('800 16px Inter'),
          document.fonts.load('600 24px Caveat'),
          document.fonts.ready
        ]),
        new Promise(function (resolve) {
          setTimeout(resolve, 800);
        })
      ]).then(reveal).catch(reveal);
    } else {
      reveal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  // Progressive hero photo load — shimmer → fade-in
  var heroImg = document.getElementById('heroProfileImg');
  if (heroImg) {
    if (heroImg.complete && heroImg.naturalWidth > 0) {
      heroImg.classList.add('is-loaded');
    } else {
      heroImg.addEventListener('load', function () { heroImg.classList.add('is-loaded'); }, { once: true });
      heroImg.addEventListener('error', function () { heroImg.classList.add('is-loaded'); }, { once: true });
    }
  }

  // ----- Nav Greeting Sequence -----
  function startNavGreeting() {
    var nav = document.querySelector('.nav');
    var greeting = document.getElementById('navGreeting');
    var icon = document.getElementById('navGreetingIcon');
    var text = document.getElementById('navGreetingText');
    var navItems = document.querySelectorAll('.nav .nav-item');

    if (!greeting || !icon || !text) return;

    // Set initial greeting mode state with reflow trigger
    if (nav) {
      void nav.offsetWidth;
      nav.classList.add('nav-greeting-mode');
    }

    // Instant Inline SVG icons for zero font-loading latency
    var greetingSVGs = {
      sun: '<svg viewBox="0 0 512 512" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>',
      cloudMoon: '<svg viewBox="0 0 576 512" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M223.5 32C100 32 0 132.3 0 256c0 84.4 46.7 157.9 115.8 196.2A224 224 0 0 1 112 416c0-106 86-192 192-192c10.4 0 20.6 .8 30.5 2.4C322.2 144.5 277.9 77.2 223.5 32zM480 320a128 128 0 1 1 -256 0 128 128 0 1 1 256 0z"/></svg>',
      moon: '<svg viewBox="0 0 384 512" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>'
    };

    // Determine time-of-day
    var hour = new Date().getHours();
    var greetText, svgHtml, iconColorClass;

    if (hour >= 5 && hour < 12) {
      greetText = 'Good Morning';
      svgHtml = greetingSVGs.sun;
      iconColorClass = 'greeting-icon-morning';
    } else if (hour >= 12 && hour < 17) {
      greetText = 'Good Afternoon';
      svgHtml = greetingSVGs.sun;
      iconColorClass = 'greeting-icon-afternoon';
    } else if (hour >= 17 && hour < 21) {
      greetText = 'Good Evening';
      svgHtml = greetingSVGs.cloudMoon;
      iconColorClass = 'greeting-icon-evening';
    } else {
      greetText = 'Good Night';
      svgHtml = greetingSVGs.moon;
      iconColorClass = 'greeting-icon-night';
    }

    text.textContent = greetText;
    icon.className = 'nav-greeting-icon-wrap ' + iconColorClass;
    icon.innerHTML = svgHtml;

    // Timeline: show greeting → hold → hide → expand capsule → pop-in nav items (snappy, fast pace)
    setTimeout(function () {
      greeting.classList.add('is-visible');
    }, 200);

    // Hide greeting
    setTimeout(function () {
      greeting.classList.remove('is-visible');
      greeting.classList.add('is-hiding');
    }, 1400);

    // Expand width of capsule
    setTimeout(function () {
      if (nav) {
        nav.classList.remove('nav-greeting-mode');
        nav.classList.add('nav-expanded-mode');
      }
    }, 1700);

    // After capsule finishes expanding, pop in nav elements one-by-one with snappy stagger
    var popStart = 2200;
    var stagger = 90;
    navItems.forEach(function (item, i) {
      setTimeout(function () {
        item.classList.add('is-popped');
      }, popStart + i * stagger);
    });

    // Clean up greeting element after animation completes
    setTimeout(function () {
      greeting.remove();
    }, 2800);
  }
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