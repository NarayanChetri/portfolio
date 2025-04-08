window.addEventListener('scroll', () => {
    const box = document.querySelector('.box');
    const boxTop = box.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight * 0.7;
  
    if (boxTop < triggerPoint) {
      box.classList.add('show');
    }
  });
  