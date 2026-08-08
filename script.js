//   // ============== Form submission and reset logic ============= //
document.addEventListener('DOMContentLoaded', function() {
  let locationFound = false; // flag to track if location was successfully found

  document.getElementById('contactform').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        document.getElementById('successMessage').style.display = 'block';
        form.reset();
        setTimeout(() => {
          document.getElementById('successMessage').style.display = 'none';
        }, 5000);
      } else {
        alert('Submission failed. Try again.');
      }
    } catch (error) {
      alert('Error submitting form.');
      console.error(error);
    }
  });


 });

// ============== Sticky profile card: swap face by active section ============== //
document.addEventListener('DOMContentLoaded', function () {
  const desktopQuery = window.matchMedia('(min-width: 1001px)');
  const sections = Array.from(document.querySelectorAll('[data-face]')).filter(
    el => el.tagName !== 'DIV' || !el.classList.contains('card-face')
  );
  const faces = document.querySelectorAll('.profileCard > .card-face');

  let observer = null;

  // Swap the active face; only one .active class lives at a time so the
  // CSS cross-fade transition handles the visual swap.
  function setActiveFace(name) {
    faces.forEach(face => {
      face.classList.toggle('active', face.dataset.face === name);
    });
  }

  function handleIntersections(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveFace(entry.target.dataset.face);
    });
  }

  function startObserving() {
    if (observer) return;
    // A thin band around the vertical center of the viewport, rather than
    // a raw 0.5 threshold, so sections taller than the viewport still
    // trigger correctly when their middle crosses the screen's middle.
    observer = new IntersectionObserver(handleIntersections, {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    });
    sections.forEach(section => observer.observe(section));
  }

  function stopObserving() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
    setActiveFace('about'); // reset to default when leaving desktop
  }

  function syncWithBreakpoint(e) {
    if (e.matches) startObserving();
    else stopObserving();
  }

  syncWithBreakpoint(desktopQuery);
  desktopQuery.addEventListener('change', syncWithBreakpoint);
});