(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var useGsap = !!(window.gsap && window.ScrollTrigger) && !reduceMotion;
  var lenis = null;

  /* ---------- Header: border once scrolled ---------- */
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Smooth scrolling (Lenis) ---------- */
  if (useGsap && window.Lenis) {
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({ duration: 1.15 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute('href');
      var target = hash === '#top' ? 0 : document.querySelector(hash);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -(header.offsetHeight + 16) });
      history.pushState(null, '', hash);
    });
  } else if (useGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var label = toggle.querySelector('.nav-toggle-label');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    label.textContent = open ? 'Close' : 'Menu';
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open && useGsap) {
      gsap.fromTo(nav.querySelectorAll('li'), { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out', stagger: .05, delay: .08, overwrite: true });
    }
  }
  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 920px)').addEventListener('change', function () {
    setNav(false);
    if (useGsap) gsap.set(nav.querySelectorAll('li'), { clearProps: 'all' });
  });

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Animation ---------- */
  if (useGsap) {
    root.classList.add('gsap');

    // Hero entrance
    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('.hero .eyebrow', { autoAlpha: 0, y: 12, duration: .7 }, .1)
      .from('.hero h1 .line > *', { yPercent: 115, duration: 1.15, stagger: .13 }, .2)
      .from('.hero-foot', { autoAlpha: 0, duration: .8 }, .8)
      .from('.hero-foot > *', { autoAlpha: 0, y: 18, duration: .9, stagger: .12 }, .9);
    root.classList.add('ready');

    // Sections fade up as they enter, staggered in groups
    gsap.set('.reveal', { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12, overwrite: true });
      }
    });

    // Portrait: slow drift inside its frame
    gsap.fromTo('.portrait img', { scale: 1.12, yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.portrait', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // Keyboard dividers slide sideways with the scroll
    gsap.utils.toArray('.keys').forEach(function (el, i) {
      gsap.fromTo(el, { '--shift': i % 2 ? '-84px' : '0px' }, {
        '--shift': i % 2 ? '0px' : '-84px', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Numbers count up
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = Number(el.dataset.count);
      var counter = { value: 0 };
      gsap.to(counter, {
        value: end, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = Math.round(counter.value); }
      });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    root.classList.add('ready');
    // No animation library (or reduced motion): simple fade, or nothing at all.
    if ('IntersectionObserver' in window && !reduceMotion) {
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { reveal.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- Tap-through reviews under the portrait ---------- */
  (function () {
    var slider = document.getElementById('quote-slider');
    if (!slider) return;
    var slides = slider.querySelectorAll('.quote-slide');
    var current = slider.querySelector('#quote-current');
    var index = 0, timer = null, autoplay = !reduceMotion, paused = false;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      current.textContent = index + 1;
    }
    function byHand(dir) {                       // once a visitor takes over, stop auto-advancing
      autoplay = false; clearInterval(timer);
      slider.querySelector('.quote-slides').setAttribute('aria-live', 'polite');
      show(index + dir);
    }

    slider.querySelectorAll('.quote-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { byHand(Number(btn.dataset.dir)); });
    });
    slider.querySelector('.quote-slides').addEventListener('click', function () { byHand(1); });
    ['mouseenter', 'focusin'].forEach(function (e) { slider.addEventListener(e, function () { paused = true; }); });
    ['mouseleave', 'focusout'].forEach(function (e) { slider.addEventListener(e, function () { paused = false; }); });

    show(0);
    if (autoplay) {
      timer = setInterval(function () { if (!paused && !document.hidden) show(index + 1); }, 7000);
    }
  })();

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Inquiry form ---------- */
  var form = document.getElementById('inquiry-form');
  var statusEl = document.getElementById('form-status');
  var success = document.getElementById('form-success');
  var previewNote = document.getElementById('preview-note');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn.querySelector('.btn-label');

  var rules = {
    parent_name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name.'; },
    student_age: function (v) {
      var n = Number(v.trim());
      return /^\d{1,3}$/.test(v.trim()) && n >= 1 && n <= 110 ? '' : 'Please enter the student’s age as a number.';
    },
    experience: function (v) { return v ? '' : 'Please choose the option that fits best.'; },
    location: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your city or neighborhood.'; },
    phone: function (v) {
      var digits = v.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15 ? '' : 'Please enter a phone number with area code, for example 425 555 0123.';
    },
    email: function (v) {
      if (!v.trim()) return '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address, or leave it blank.';
    }
  };

  function setError(input, message) {
    var errorEl = document.getElementById(input.id + '-error');
    if (!errorEl) return;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var message = rule(input.value);
    setError(input, message);
    return !message;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
    input.addEventListener('change', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  function showSuccess(isPreview) {
    form.hidden = true;
    previewNote.hidden = !isPreview;
    success.hidden = false;
    success.focus({ preventScroll: true });
    var top = success.closest('.form-card');
    if (lenis) lenis.scrollTo(top, { offset: -(header.offsetHeight + 24) });
    else top.scrollIntoView({ block: 'center' });
    if (useGsap) {
      gsap.from(success.children, { autoAlpha: 0, y: 16, duration: .7, ease: 'power3.out', stagger: .1 });
      ScrollTrigger.refresh();
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.hidden = true;

    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    // Spam trap: real visitors never fill this in.
    if (form.elements._gotcha.value) { showSuccess(false); return; }

    var endpoint = (form.dataset.endpoint || '').trim();
    var accessKey = (form.dataset.accessKey || '').trim();
    var needsKey = endpoint.indexOf('web3forms.com') !== -1;
    if (!endpoint || (needsKey && !accessKey)) { showSuccess(true); return; }   // not connected yet: preview only

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';

    var data = new FormData(form);
    data.delete('_gotcha');
    if (accessKey) data.append('access_key', accessKey);
    data.append('subject', 'New lesson inquiry from ' + form.elements.parent_name.value.trim());
    data.append('from_name', 'Piano with Pariya website');

    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        showSuccess(false);
      })
      .catch(function () {
        statusEl.textContent = 'Sorry, your inquiry could not be sent. Please check your connection and try again.';
        statusEl.hidden = false;
        submitBtn.disabled = false;
        submitLabel.textContent = 'Send inquiry';
      });
  });
})();
