(function() {

  /* ── Mobile Drawer ── */
  const hamburger = document.getElementById('hamburger');
  const hamIcon   = document.getElementById('hamIcon');
  const drawer    = document.getElementById('drawer');
  const overlay   = document.getElementById('overlay');
  const closeBtn  = document.getElementById('closeBtn');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    hamIcon.className = 'bi bi-x-lg';
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    hamIcon.className = 'bi bi-list';
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
  }
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay)  overlay.addEventListener('click', closeDrawer);

  /* Close drawer on nav link click */
  document.querySelectorAll('.m-nav-btn').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ── Review Carousel ── */
  (function() {
    const track    = document.getElementById('reviewTrack');
    const dotsWrap = document.getElementById('reviewDots');
    const prevBtn  = document.getElementById('reviewPrev');
    const nextBtn  = document.getElementById('reviewNext');
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.review-card');
    let current = 0;
    let visibleCount = getVisible();
    const total = cards.length;

    function getVisible() {
      if (window.innerWidth < 576) return 1;
      if (window.innerWidth < 768) return 2;
      if (window.innerWidth < 1400) return 3;
      return 6;
    }

    function getPageCount() {
      return Math.max(1, total - visibleCount + 1);
    }

    function getCardStep() {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function buildDots() {
      visibleCount = getVisible();
      dotsWrap.innerHTML = '';
      const pages = getPageCount();
      for (let i = 0; i < pages; i++) {
        const d = document.createElement('button');
        d.className = 'review-dot' + (i === current ? ' active' : '');
        d.type = 'button';
        d.setAttribute('aria-label', `Show review page ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function goTo(index) {
      visibleCount = getVisible();
      const pages = getPageCount();
      current = Math.max(0, Math.min(index, pages - 1));
      track.scrollTo({ left: getCardStep() * current, behavior: 'smooth' });
      dotsWrap.querySelectorAll('.review-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1 < getPageCount() ? current + 1 : 0); }
    function prev() { goTo(current > 0 ? current - 1 : getPageCount() - 1); }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    track.addEventListener('scroll', () => {
      current = Math.min(Math.round(track.scrollLeft / getCardStep()), getPageCount() - 1);
      dotsWrap.querySelectorAll('.review-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    });

    window.addEventListener('resize', () => { buildDots(); goTo(0); });

    buildDots();
  })();

  /* ── Projects Carousel ── */
  (function() {
    let currentSlide = 0;
    let autoPlayTimer = null;
    let isDragging = false;
    let dragStartX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    const wrapper = document.getElementById('carouselWrapper');
    const dots    = document.querySelectorAll('.dot');
    if (!wrapper || !dots.length) return;

    const cards   = wrapper.querySelectorAll('.project-card');
    const total   = cards.length;

    function isMobile() { return window.innerWidth <= 991; }

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function goToSlide(index) {
      currentSlide = ((index % total) + total) % total;
      const cardWidth = cards[0].offsetWidth + 16;
      wrapper.scrollTo({ left: cardWidth * currentSlide, behavior: 'smooth' });
      updateDots();
    }

    window.slideCarousel = function(dir) { goToSlide(currentSlide + dir); resetAutoPlay(); };
    window.goToSlide = goToSlide;

    wrapper.addEventListener('scroll', () => {
      const cardWidth = cards[0].offsetWidth + 16;
      currentSlide = Math.round(wrapper.scrollLeft / cardWidth);
      updateDots();
    });

    wrapper.addEventListener('mousedown', (e) => {
      isDragging  = true;
      hasDragged  = false;
      dragStartX  = e.pageX;
      scrollStart = wrapper.scrollLeft;
      wrapper.style.cursor = 'grabbing';
      wrapper.style.userSelect = 'none';
      clearInterval(autoPlayTimer);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const delta = dragStartX - e.pageX;
      if (Math.abs(delta) > 5) hasDragged = true;
      wrapper.scrollLeft = scrollStart + delta;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      wrapper.style.cursor = '';
      wrapper.style.userSelect = '';
      const cardWidth = cards[0].offsetWidth + 16;
      currentSlide = Math.round(wrapper.scrollLeft / cardWidth);
      goToSlide(currentSlide);
      startAutoPlay();
      if (hasDragged) e.stopPropagation();
    });

    wrapper.addEventListener('touchstart', () => clearInterval(autoPlayTimer), { passive: true });
    wrapper.addEventListener('touchend', startAutoPlay, { passive: true });

    function startAutoPlay() {
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 3000);
    }
    function resetAutoPlay() { clearInterval(autoPlayTimer); startAutoPlay(); }

    function toggleControls() {
      document.querySelectorAll('.carousel-arrow, .carousel-dots').forEach(el => {
        el.style.display = isMobile() ? '' : 'none';
      });
    }

    toggleControls();
    window.addEventListener('resize', toggleControls);
    startAutoPlay();
  })();

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();

  /* --- Boat Scroll Animation --- */
  const projectsSection = document.getElementById('projects');
  const boatLeft = document.querySelector('.scroll-boat--left');
  const boatRight = document.querySelector('.scroll-boat--right');
  const trackPathLeft = document.querySelector('.boat-track--left .boat-track-path');
  const trackPathRight = document.querySelector('.boat-track--right .boat-track-path');
  const trackLeft = document.querySelector('.boat-track--left');
  const trackRight = document.querySelector('.boat-track--right');
  
  if (projectsSection && boatLeft && boatRight) {
    let ticking = false;

    function updateBoats() {
      const rect = projectsSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the section has scrolled through the viewport
      let progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      
      if (progress >= 0 && progress <= 1) {
        // Opacity logic
        let opacity = 0;
        if (progress > 0.05 && progress < 0.95) opacity = 1;
        else if (progress > 0 && progress <= 0.05) opacity = progress / 0.05;
        else if (progress >= 0.95 && progress < 1) opacity = (1 - progress) / 0.05;

        boatLeft.style.opacity = opacity;
        boatRight.style.opacity = opacity;
        if (trackLeft) trackLeft.style.opacity = opacity;
        if (trackRight) trackRight.style.opacity = opacity;
        
        // Position Y
        const topY = progress * 100;
        boatLeft.style.top = `${topY}%`;
        boatRight.style.top = `${topY}%`;
        
        // Position X (Sine wave)
        const cycle = progress * Math.PI * 4;
        const xOffset = Math.sin(cycle) * 40; 
        
        // Rotation
        const slope = Math.cos(cycle);
        const rotation = 180 + (slope * -20);
        
        boatLeft.style.transform = `translateX(${xOffset}px) rotate(${rotation}deg)`;
        boatRight.style.transform = `translateX(${-xOffset}px) rotate(${180 - (slope * -20)}deg)`;
        
        // Update SVG Trails (wake)
        if (trackPathLeft && trackPathRight) {
          const currentY = progress * rect.height;
          let dLeft = `M 50 0`;
          let dRight = `M 50 0`;
          
          for (let y = 0; y <= currentY; y += 15) {
            let p = y / rect.height;
            let cyc = p * Math.PI * 4;
            let xOff = Math.sin(cyc) * 40;
            dLeft += ` L ${50 + xOff} ${y}`;
            dRight += ` L ${50 - xOff} ${y}`;
          }
          // Connect perfectly to the boat center
          dLeft += ` L ${50 + xOffset} ${currentY}`;
          dRight += ` L ${50 - xOffset} ${currentY}`;
          
          trackPathLeft.setAttribute('d', dLeft);
          trackPathRight.setAttribute('d', dRight);
        }
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBoats);
        ticking = true;
      }
    }, { passive: true });
    
    // Initial call
    updateBoats();
  }
