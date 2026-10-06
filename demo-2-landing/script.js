/* =====================================================================
   云舟 FlowSail · 落地页交互
   1. 导航：滚动毛玻璃 / 深浅切换 / 当前区块高亮 / 移动端菜单
   2. 首屏产品图：随滚动“立起来”
   3. 滚动渐入
   4. 数字滚动
   5. 月付 / 年付切换
   6. FAQ 手风琴
   7. 试用表单（纯前端演示，不会真正提交）
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---------------- 1. 导航 ---------------- */
  var nav = $('#nav');
  var hero = $('.hero');
  var heroBg = $('.hero__bg');
  var toggle = $('.nav__toggle');
  var navLinks = $$('.nav__links a, .mobile-menu nav a');
  var sections = ['features', 'stats', 'customers', 'pricing', 'faq']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setMenu(open) {
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('menu-open')); });
  $$('.mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  var mock = $('.mock');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var navH = nav.offsetHeight;

    // 离开顶部 → 毛玻璃；导航条下方不再是深色背景 → 切换为浅色
    nav.classList.toggle('is-scrolled', y > 8);
    var darkBottom = heroBg.getBoundingClientRect().bottom;
    var overStats = (function () {
      var s = document.getElementById('stats').getBoundingClientRect();
      return s.top < navH && s.bottom > navH;
    })();
    nav.classList.toggle('is-light', darkBottom < navH && !overStats);

    // 当前区块高亮
    var current = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= navH + 120) current = s.id; });
    if ((window.innerHeight + y) >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1].id;
    navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });

    // 产品图倾角：首屏滚动时从 14° 逐渐立直
    if (mock && !reduceMotion) {
      var r = mock.getBoundingClientRect();
      var p = Math.min(Math.max((window.innerHeight - r.top) / (window.innerHeight * 0.75), 0), 1);
      mock.style.setProperty('--tilt', (14 * (1 - easeOut(p))).toFixed(2) + 'deg');
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------- 2/3. 滚动渐入 + 数字滚动 ---------------- */
  function formatNum(v, decimals) {
    return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function countUp(el) {
    var to = parseFloat(el.dataset.to);
    var from = parseFloat(el.dataset.from || '0');
    var dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) { el.textContent = formatNum(to, dec); return; }
    var dur = 1800, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      el.textContent = formatNum(from + (to - from) * easeOut(t), dec);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = formatNum(to, dec);
    }
    el.textContent = formatNum(from, dec);
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { revealIO.observe(el); });

    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); countIO.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$('.count-up').forEach(function (el) { countIO.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- 4. 月付 / 年付切换 ---------------- */
  var billingSwitch = $('#billing-switch');
  var pricing = $('#pricing');

  function tweenPrice(el, to) {
    var from = parseFloat(el.textContent) || 0;
    if (from === to || reduceMotion) { el.textContent = to; return; }
    var dur = 450, start = null;
    el.classList.add('is-ticking');
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(from + (to - from) * easeOut(t));
      if (t < 1) requestAnimationFrame(frame);
      else { el.textContent = to; el.classList.remove('is-ticking'); }
    }
    requestAnimationFrame(frame);
  }

  function setBilling(yearly) {
    billingSwitch.setAttribute('aria-checked', String(yearly));
    pricing.classList.toggle('is-yearly', yearly);
    $$('.billing__opt').forEach(function (o) {
      o.classList.toggle('is-active', (o.dataset.billing === 'yearly') === yearly);
    });
    $$('.plan__num[data-monthly]').forEach(function (el) {
      tweenPrice(el, parseFloat(yearly ? el.dataset.yearly : el.dataset.monthly));
    });
    $$('.plan__note[data-note-monthly]').forEach(function (el) {
      el.textContent = yearly ? el.dataset.noteYearly : el.dataset.noteMonthly;
    });
  }
  billingSwitch.addEventListener('click', function () {
    setBilling(billingSwitch.getAttribute('aria-checked') !== 'true');
  });
  $$('.billing__opt').forEach(function (o) {
    o.addEventListener('click', function () { setBilling(o.dataset.billing === 'yearly'); });
  });

  /* ---------------- 5. FAQ 手风琴（同一时间只展开一项） ---------------- */
  var faqItems = $$('.faq__item');
  faqItems.forEach(function (item) {
    var btn = $('.faq__q', item);
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------- 6. 试用表单（演示用，不发送数据） ---------------- */
  var form = $('#trial-form');
  var input = $('#trial-email');
  var msg = $('#trial-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    form.classList.remove('is-invalid');
    msg.className = 'cta__msg';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      void form.offsetWidth; // 重新触发抖动动画
      form.classList.add('is-invalid');
      msg.classList.add('is-error');
      msg.textContent = v ? '邮箱格式好像不对，请检查一下～' : '请先填写你的工作邮箱';
      input.focus();
      return;
    }
    msg.classList.add('is-ok');
    msg.textContent = '✓ 已发送开通链接至 ' + v + '，请在 5 分钟内查收（演示站点，不会真实发送）';
    input.value = '';
  });
  input.addEventListener('input', function () { form.classList.remove('is-invalid'); });
})();
