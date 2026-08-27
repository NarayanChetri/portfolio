let autoHoverTimeout = null;
let autoHoverRaf = null;

// ---------------------------------------------------------------------
// Entrance Animations — instant reveal, staggered via CSS
// ---------------------------------------------------------------------
(function () {
  // Trigger entrance animations as soon as DOM is ready
  function reveal() {
    document.body.classList.add('is-revealed');
    startNavGreeting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    reveal();
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

    // Determine time-of-day
    var hour = new Date().getHours();
    var greetText, iconClass, iconColorClass;

    if (hour >= 5 && hour < 12) {
      greetText = 'Good Morning';
      iconClass = 'fa-solid fa-sun';
      iconColorClass = 'greeting-icon-morning';
    } else if (hour >= 12 && hour < 17) {
      greetText = 'Good Afternoon';
      iconClass = 'fa-solid fa-sun';
      iconColorClass = 'greeting-icon-afternoon';
    } else if (hour >= 17 && hour < 21) {
      greetText = 'Good Evening';
      iconClass = 'fa-solid fa-cloud-moon';
      iconColorClass = 'greeting-icon-evening';
    } else {
      greetText = 'Good Night';
      iconClass = 'fa-solid fa-moon';
      iconColorClass = 'greeting-icon-night';
    }

    text.textContent = greetText;
    icon.className = iconClass + ' ' + iconColorClass;

    // Timeline: show greeting → hold → hide → expand capsule → pop-in nav items
    setTimeout(function () {
      greeting.classList.add('is-visible');
    }, 400);

    // Hide greeting
    setTimeout(function () {
      greeting.classList.remove('is-visible');
      greeting.classList.add('is-hiding');
    }, 2200);

    // Expand width of capsule
    setTimeout(function () {
      if (nav) {
        nav.classList.remove('nav-greeting-mode');
        nav.classList.add('nav-expanded-mode');
      }
    }, 2600);

    // After capsule finishes expanding, pop in nav elements one-by-one
    var popStart = 3800;
    var stagger = 150;
    navItems.forEach(function (item, i) {
      setTimeout(function () {
        item.classList.add('is-popped');
      }, popStart + i * stagger);
    });

    // Clean up greeting element after animation completes
    setTimeout(function () {
      greeting.remove();
    }, 4800);
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