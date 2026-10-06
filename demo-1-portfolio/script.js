/* =========================================================
   Echo Lin · 个人主页交互
   - 深色模式（localStorage 记忆）
   - 导航：滚动毛玻璃 / 当前区块高亮 / 移动端菜单
   - 滚动渐入、数字滚动、首屏视差
   - 作品详情弹窗、微信二维码、联系表单（纯前端演示）
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- 轻提示 ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------- 深色模式 ---------- */
  var themeBtn = $('#themeToggle');
  var themeMeta = $('meta[name="theme-color"]');

  function applyTheme(theme, save) {
    root.setAttribute('data-theme', theme);
    themeMeta.content = theme === 'dark' ? '#09090d' : '#fafafa';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    if (save) { try { localStorage.setItem('theme', theme); } catch (e) {} }
  }
  applyTheme(root.getAttribute('data-theme') || 'light', false);

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduceMotion) { applyTheme(next, true); return; }

    // 以按钮为圆心，圆形扩散切换主题
    var r = themeBtn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(function () { applyTheme(next, true); });
    vt.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
  });

  // 用户没手动选过主题时，跟随系统变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ---------- 导航：滚动状态 + 阅读进度 ---------- */
  var nav = $('#nav');
  var progress = $('.progress');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    progress.style.setProperty('--p', max > 0 ? Math.min(y / max, 1) : 0);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  var menuBtn = $('#menuToggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('#mobileMenu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  /* ---------- 当前区块高亮 ---------- */
  var navLinks = $$('.nav-links a, .mobile-menu a');
  var sections = $$('main section[id]').filter(function (s) { return s.id !== 'top'; });
  if ('IntersectionObserver' in window) {
    var current = '';
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) current = en.target.id;
        else if (en.target.id === current && en.boundingClientRect.top > 0) current = '';
      });
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 滚动渐入 ---------- */
  var reveals = $$('.reveal');
  reveals.forEach(function (el) {
    var siblings = $$(':scope > .reveal', el.parentElement);
    if (siblings.length > 1) el.style.setProperty('--i', siblings.indexOf(el) % 3);
  });

  function finishReveal(el) {
    el.classList.add('in');
    // 动画结束后移除 reveal，让卡片恢复自身的悬停过渡（不再带入场延迟）
    setTimeout(function () { el.classList.remove('reveal'); el.style.removeProperty('--i'); }, reduceMotion ? 0 : 1100);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { finishReveal(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(finishReveal);
  }

  /* ---------- 数字滚动 ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    if (reduceMotion) { el.textContent = to; return; }
    var start = null, dur = 1600;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // easeOutExpo
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }
  var counters = $$('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 首屏视差（仅桌面鼠标） ---------- */
  var hero = $('.hero');
  var visual = $('.hero-visual');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = visual.getBoundingClientRect();
        var mx = ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2;
        var my = ((e.clientY - (r.top + r.height / 2)) / innerHeight) * 2;
        visual.style.setProperty('--mx', Math.max(-1, Math.min(1, mx)).toFixed(3));
        visual.style.setProperty('--my', Math.max(-1, Math.min(1, my)).toFixed(3));
        raf = 0;
      });
    });
    hero.addEventListener('pointerleave', function () {
      visual.style.setProperty('--mx', 0);
      visual.style.setProperty('--my', 0);
    });
  }

  /* ---------- 作品详情弹窗 ---------- */
  var modal = $('#workModal');
  var works = $$('.work');
  var mCover = $('#modalCover'), mFacts = $('#modalFacts'), mHead = $('#modalHead');
  var mKicker = $('#modalKicker'), mTitle = $('#modalTitle'), mContent = $('#modalContent');
  var mCount = $('#modalCount'), mScroll = $('.modal-scroll', modal);
  var currentWork = 0, opener = null;

  function fillModal(i) {
    var work = works[i];
    var img = $('.work-cover img', work).cloneNode();
    img.removeAttribute('loading');
    mCover.replaceChildren(img);
    mKicker.textContent = work.getAttribute('data-kicker');
    mTitle.textContent = work.getAttribute('data-title');

    // 模板内容：导语放标题下，项目信息与成果放左栏，其余为正文
    var frag = $('template', work).content.cloneNode(true);
    var oldLead = $('.md-lead', mHead);
    if (oldLead) oldLead.remove();
    var lead = $('.md-lead', frag);
    if (lead) mHead.appendChild(lead);
    mFacts.replaceChildren();
    ['.md-meta', '.md-results'].forEach(function (sel) { var n = $(sel, frag); if (n) mFacts.appendChild(n); });
    mContent.replaceChildren(frag);

    mCount.textContent = (i + 1) + ' / ' + works.length;
    mScroll.scrollTop = 0;
    currentWork = i;
  }

  function openModal(i) {
    opener = document.activeElement;
    fillModal(i);
    root.classList.add('modal-open');
    modal.showModal();
  }

  function stepModal(dir) {
    var next = (currentWork + dir + works.length) % works.length;
    fillModal(next);
    if (!reduceMotion && mScroll.animate) {
      mScroll.animate([{ opacity: 0, transform: 'translateX(' + dir * 16 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
  }

  function closeModal() {
    if (!modal.open || modal.classList.contains('closing')) return;
    if (reduceMotion) { modal.close(); return; }
    modal.classList.add('closing');
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      modal.classList.remove('closing');
      modal.close();
    }
    modal.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 400); // 兜底
  }

  works.forEach(function (work, i) {
    $('.work-open', work).addEventListener('click', function () { openModal(i); });
  });
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalPrev').addEventListener('click', function () { stepModal(-1); });
  $('#modalNext').addEventListener('click', function () { stepModal(1); });
  modal.addEventListener('cancel', function (e) { e.preventDefault(); closeModal(); }); // Esc
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); }); // 点击遮罩
  modal.addEventListener('close', function () {
    root.classList.remove('modal-open');
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  });
  modal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') stepModal(1);
    if (e.key === 'ArrowLeft') stepModal(-1);
  });

  /* ---------- 微信二维码 ---------- */
  var wxBtn = $('#wechatBtn'), wxPop = $('#wechatPop');
  var WECHAT_ID = 'EchoLin_design';
  function setWx(open) {
    wxPop.classList.toggle('show', open);
    wxBtn.setAttribute('aria-expanded', String(open));
  }
  wxBtn.addEventListener('click', function (e) { e.stopPropagation(); setWx(!wxPop.classList.contains('show')); });
  wxPop.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { setWx(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setWx(false); });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      ok ? resolve() : reject();
    });
  }
  $('#copyWechat').addEventListener('click', function () {
    copyText(WECHAT_ID).then(
      function () { toast('微信号已复制：' + WECHAT_ID); },
      function () { toast('微信号：' + WECHAT_ID); }
    );
  });

  /* ---------- 联系表单（纯前端演示，不会真实发送） ---------- */
  var form = $('#contactForm');
  var success = $('#formSuccess');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    name: function (v) { return v ? '' : '请填写你的称呼'; },
    email: function (v) { return !v ? '请填写邮箱，方便我回复你' : (EMAIL_RE.test(v) ? '' : '邮箱格式好像不太对'); },
    message: function (v) { return !v ? '请简单描述一下你的项目' : (v.length < 10 ? '再多写几句吧（至少 10 个字）' : ''); }
  };

  function validate(input, shake) {
    var msg = rules[input.name](input.value.trim());
    var field = input.closest('.field');
    $('.err', field).textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg && shake) { field.classList.remove('invalid'); void field.offsetWidth; }
    field.classList.toggle('invalid', !!msg);
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { if (input.value.trim()) validate(input); });
    input.addEventListener('input', function () { if (input.closest('.field').classList.contains('invalid')) validate(input); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!validate(input, true) && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }

    var label = $('.btn-label', form);
    form.classList.add('sending');
    label.textContent = '发送中…';
    setTimeout(function () {
      $('#successName').textContent = form.elements.name.value.trim();
      $('#successEmail').textContent = form.elements.email.value.trim();
      form.classList.remove('sending');
      label.textContent = '发送消息';
      form.hidden = true;
      success.hidden = false;
      toast('消息已发送 ✓');
    }, 1000);
  });

  $('#formReset').addEventListener('click', function () {
    form.reset();
    $$('.field', form).forEach(function (f) { f.classList.remove('invalid'); var err = $('.err', f); if (err) err.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
