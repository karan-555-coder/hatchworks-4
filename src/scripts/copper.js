/* COPPER OBSIDIAN · motion layer
 * Cinematic curtain (page intro + transitions), clip-path scroll reveals, cursor light,
 * cursor-lit card edges, copper button sheen and a scroll progress hairline.
 * Adds .co-* classes and decorative aria-hidden nodes only; never moves or removes content. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  function el(tag, cls, parent) { var n = doc.createElement(tag); n.className = cls; n.setAttribute('aria-hidden', 'true'); (parent || doc.body).appendChild(n); return n; }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- curtain veil ------------------------------------------------------------ */
  var veil = null;
  if (!reduced) {
    veil = el('div', 'co-veil');
    veil.innerHTML = '<i></i><b></b><i></i>';
    var arrived = ss.get('co-nav') === '1', first = !ss.get('co-seen');
    ss.set('co-nav', '0'); ss.set('co-seen', '1');
    if (arrived || first) {
      veil.classList.add('closed');
      setTimeout(function () { veil.classList.add('open'); veil.classList.remove('closed'); }, first ? 650 : 120);
    } else {
      veil.classList.add('open');
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) { veil.classList.remove('closing', 'closed'); veil.classList.add('open'); } });

    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url; try { url = new URL(a.href, location.href); } catch (er) { return; }
      if (url.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute('href'))) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // in-page / hash links
      if (/\.(pdf|zip|jpg|png|mp4)$/i.test(url.pathname)) return;
      e.preventDefault();
      ss.set('co-nav', '1');
      veil.classList.remove('open'); veil.classList.add('closing', 'closed');
      setTimeout(function () { location.href = url.href; }, 560);
    });
  }

  /* ---------- scroll progress --------------------------------------------------------- */
  var bar = el('div', 'co-progress'), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var max = root.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- copper sheen on buttons ------------------------------------------------- */
  all('.hwh-cta, .hw-btn--cta, .hwf-cta, .hwh-work-cta, .elementor-button, .hs-button').forEach(function (b) {
    if (b.querySelector(':scope > .co-sheen')) return;
    b.classList.add('co-shine'); el('span', 'co-sheen', b);
  });
  all('.hwh-index-title, .hwh-leader-h').forEach(function (h) { h.classList.add('co-head-hover'); });

  /* ---------- cards: cursor-lit edges ------------------------------------------------- */
  var CARDS = '.hwh-bx, .hwh-ccard, .hwh-mcard, .hwh-suite-card, .hwh-award, .hwh-eng-card, .hwh-belief, ' +
              '.elementor-widget-call-to-action .elementor-cta, .e-loop-item, .elementor-post, .hwh-res a';
  var cards = all(CARDS).filter(function (c) { return !c.closest('header, footer, nav, .hw-header'); });
  cards.forEach(function (c) {
    c.classList.add('co-card');
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    if (fine) el('span', 'co-glow', c);
  });
  if (fine) {
    doc.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.co-card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- cursor light ------------------------------------------------------------ */
  if (fine && !reduced) {
    var light = el('div', 'co-light'), tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, running = false;
    var loop = function () {
      x += (tx - x) * .12; y += (ty - y) * .12;
      light.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) + Math.abs(ty - y) > .5) requestAnimationFrame(loop); else running = false;
    };
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; light.classList.add('on');
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    doc.addEventListener('pointerleave', function () { light.classList.remove('on'); });
  }

  /* ---------- scroll reveals ---------------------------------------------------------- */
  if (reduced || !('IntersectionObserver' in window)) return;
  var main = function (n) { return !n.closest('header.hw-header, .hw-header, nav, .hwh-hero, .co-veil, [aria-hidden="true"], .elementor-location-header'); };

  var heads = all('h2, .elementor-widget-heading .elementor-heading-title, .hwh-leader-h').filter(main);
  var media = all('.hwh-ccard-media, .hwh-pos-media, .elementor-widget-image .elementor-widget-container').filter(main);
  var lines = all('main > section, body > section, .e-con.e-parent, .elementor-section.elementor-top-section').filter(function (s) { return main(s) && s.offsetHeight > 200; });

  heads.forEach(function (h) { h.classList.add('co-rv-h'); });
  media.forEach(function (m) { m.classList.add('co-rv-m'); });
  lines.slice(1).forEach(function (s) { s.classList.add('co-rv-line'); });
  cards.forEach(function (c) {
    if (c.closest('.hwh-trust-marquee')) return;
    var sibs = c.parentElement ? Array.prototype.indexOf.call(c.parentElement.children, c) : 0;
    c.classList.add('co-rv-c'); c.style.setProperty('--d', (Math.min(sibs, 6) * 0.09).toFixed(2) + 's');
  });

  root.classList.add('co-js');
  var proxy;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('co-in'); io.unobserve(en.target);
      (proxy.get(en.target) || []).forEach(function (h, i) { h.style.setProperty('--d', (i * .08) + 's'); h.classList.add('co-in'); });
      // clear the stagger once played so hover states respond instantly
      setTimeout(function () { en.target.style.removeProperty('--d'); }, 1800);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  // A clipped heading has zero visible area, so watch its parent and reveal the heading.
  proxy = new Map();
  heads.forEach(function (h) { var p = h.parentElement || h; (proxy.get(p) || proxy.set(p, []).get(p)).push(h); });
  proxy.forEach(function (list, p) { io.observe(p); });
  all('.co-rv-m, .co-rv-c, .co-rv-line').forEach(function (n) { io.observe(n); });
})();
