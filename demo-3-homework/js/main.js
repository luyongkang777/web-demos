/* ==========================================================================
   茶韵 · 中国茶文化 —— 全站公共脚本 main.js
   --------------------------------------------------------------------------
   5 个页面共用这一个文件。每个功能写成一个独立的函数，
   函数开头会先检查"这个页面有没有对应的元素"，没有就直接 return（跳过），
   所以首页的轮播图代码不会在留言页报错。

   功能列表：
    1. initHeaderShadow   导航栏滚动阴影
    2. initMobileNav      手机端汉堡菜单
    3. initCarousel       首页轮播图（自动播放 + 左右按钮 + 圆点 + 手机滑动）
    4. initGalleryFilter  图集分类筛选
    5. initLightbox       图集灯箱（点击放大 + 上一张/下一张 + Esc 关闭）
    6. initTeaList        名茶列表的搜索与筛选
    7. initContactForm    留言表单验证
    8. initBackToTop      回到顶部按钮
    9. initScrollReveal   滚动渐入动画
   ========================================================================== */

// 告诉页面 <head> 里的保险脚本：main.js 已经成功加载
window.mainScriptLoaded = true;


/* --------------------------------------------------------------------------
   1. 导航栏滚动阴影：页面往下滚动超过 10px 时，给导航栏加上 scrolled 类
   -------------------------------------------------------------------------- */
function initHeaderShadow() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  function updateShadow() {
    // window.scrollY：页面已经向下滚动了多少像素
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateShadow);
  updateShadow(); // 页面刚打开时也检查一次（比如刷新时停在页面中间）
}


/* --------------------------------------------------------------------------
   2. 手机端汉堡菜单：点击三条横线按钮，展开 / 收起导航
   -------------------------------------------------------------------------- */
function initMobileNav() {
  var header = document.querySelector('.site-header');
  var toggleButton = document.querySelector('.nav-toggle');
  if (!header || !toggleButton) return;

  // 打开或关闭菜单。isOpen 为 true 表示打开
  function setMenu(isOpen) {
    if (isOpen) {
      header.classList.add('nav-open');
    } else {
      header.classList.remove('nav-open');
    }
    // aria-expanded 告诉读屏软件菜单当前是展开还是收起
    toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleButton.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
  }

  // 点击按钮：如果现在是打开的就关闭，反之打开
  toggleButton.addEventListener('click', function () {
    var isOpen = header.classList.contains('nav-open');
    setMenu(!isOpen);
  });

  // 点击菜单里的任意链接后，自动收起菜单
  var links = header.querySelectorAll('.nav-list a');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false);
    });
  });

  // 按键盘 Esc 键也可以关闭菜单
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenu(false);
    }
  });
}


/* --------------------------------------------------------------------------
   3. 首页轮播图
   思路：用变量 currentIndex 记住"现在显示第几张"，
   切换时把 active 类从旧的那张移到新的那张，CSS 负责淡入淡出动画。
   -------------------------------------------------------------------------- */
function initCarousel() {
  var carousel = document.getElementById('carousel');
  if (!carousel) return; // 不是首页，没有轮播图，直接跳过

  var slides = carousel.querySelectorAll('.carousel-slide');    // 所有图片
  var dots = carousel.querySelectorAll('.carousel-dot');        // 所有小圆点
  var prevButton = carousel.querySelector('.carousel-prev');    // 上一张按钮
  var nextButton = carousel.querySelector('.carousel-next');    // 下一张按钮

  var currentIndex = 0;     // 当前显示的是第几张（从 0 开始数）
  var timer = null;         // 保存定时器，方便以后停止它
  var isHovering = false;   // 鼠标是否正停在轮播图上
  var INTERVAL = 4000;      // 自动播放间隔：4000 毫秒 = 4 秒

  // 显示第 index 张图片
  function showSlide(index) {
    // 处理首尾循环：
    // 在第一张再点"上一张" → index 为 -1 → 变成最后一张
    // 在最后一张再点"下一张" → index 等于总数 → 变成第一张
    if (index < 0) {
      index = slides.length - 1;
    }
    if (index >= slides.length) {
      index = 0;
    }

    // 先把旧的那张和旧圆点的 active 去掉
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    dots[currentIndex].removeAttribute('aria-current');

    // 再给新的那张和新圆点加上 active
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    dots[index].setAttribute('aria-current', 'true');

    currentIndex = index;
  }

  function showNext() {
    showSlide(currentIndex + 1);
  }

  function showPrev() {
    showSlide(currentIndex - 1);
  }

  // 开始自动播放：每隔 INTERVAL 毫秒执行一次 showNext
  function startAutoPlay() {
    stopAutoPlay(); // 先清掉旧的定时器，防止叠加出多个定时器
    timer = setInterval(showNext, INTERVAL);
  }

  // 停止自动播放
  function stopAutoPlay() {
    clearInterval(timer);
  }

  // 手动切换后重新计时，避免刚点完马上又自动跳走；
  // 但如果鼠标还停在轮播图上，就继续保持暂停
  function restartAutoPlay() {
    if (!isHovering) {
      startAutoPlay();
    }
  }

  // 点击左右按钮
  nextButton.addEventListener('click', function () {
    showNext();
    restartAutoPlay();
  });

  prevButton.addEventListener('click', function () {
    showPrev();
    restartAutoPlay();
  });

  // 点击小圆点，跳到对应的那一张
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartAutoPlay();
    });
  });

  // 鼠标移到轮播图上时暂停，移开后继续。
  // pointerType === 'mouse' 表示只处理鼠标，手机上手指点击不算"悬停"
  carousel.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') {
      isHovering = true;
      stopAutoPlay();
    }
  });

  carousel.addEventListener('pointerleave', function (event) {
    if (event.pointerType === 'mouse') {
      isHovering = false;
      startAutoPlay();
    }
  });

  // 键盘：焦点在轮播图里时，可以用左右方向键切换
  carousel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      showPrev();
      restartAutoPlay();
    } else if (event.key === 'ArrowRight') {
      showNext();
      restartAutoPlay();
    }
  });

  // 手机触摸滑动：记录手指按下和抬起时的横坐标，差值超过 50px 就算一次滑动
  var touchStartX = 0;

  carousel.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    stopAutoPlay();
  }, { passive: true }); // passive: true 告诉浏览器这里不会阻止页面滚动，滑动更流畅

  carousel.addEventListener('touchend', function (event) {
    var touchEndX = event.changedTouches[0].clientX;
    var distance = touchEndX - touchStartX;

    if (distance > 50) {
      showPrev();          // 手指向右滑 → 上一张
    } else if (distance < -50) {
      showNext();          // 手指向左滑 → 下一张
    }
    restartAutoPlay();
  });

  startAutoPlay(); // 页面打开后开始自动播放
}


/* --------------------------------------------------------------------------
   4. 图集分类筛选：点击"全部 / 茶山 / 茶器 / 茶事"按钮，只显示对应分类的图片
   -------------------------------------------------------------------------- */
function initGalleryFilter() {
  var filterBar = document.getElementById('gallery-filters');
  if (!filterBar) return;

  var buttons = filterBar.querySelectorAll('.filter-btn');
  var items = document.querySelectorAll('.gallery-item');
  var countText = document.getElementById('gallery-count');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      // data-filter 属性里写着这个按钮对应的分类，例如 data-filter="mountain"
      var category = button.dataset.filter;
      var shownCount = 0;

      // 1) 切换按钮的高亮状态
      buttons.forEach(function (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      // 2) 逐个检查图片：分类相同（或选了"全部"）就显示，否则隐藏
      items.forEach(function (item) {
        var match = category === 'all' || item.dataset.category === category;
        item.hidden = !match; // hidden = true 表示隐藏
        if (match) {
          shownCount++;
        }
      });

      // 3) 更新"共 X 张"的数字
      if (countText) {
        countText.textContent = shownCount;
      }
    });
  });
}


/* --------------------------------------------------------------------------
   5. 图集灯箱（Lightbox）：点击缩略图 → 黑色遮罩里显示大图
   -------------------------------------------------------------------------- */
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var links = document.querySelectorAll('.gallery-link');        // 所有可点击的图片链接
  var bigImage = lightbox.querySelector('.lightbox-img');         // 灯箱里的大图
  var caption = lightbox.querySelector('.lightbox-caption');      // 图片说明
  var counter = lightbox.querySelector('.lightbox-counter');      // "3 / 12" 计数
  var closeButton = lightbox.querySelector('.lightbox-close');
  var prevButton = lightbox.querySelector('.lightbox-prev');
  var nextButton = lightbox.querySelector('.lightbox-next');

  var visibleLinks = [];    // 当前没被筛选隐藏的图片（灯箱只在这些图片之间切换）
  var currentIndex = 0;     // 当前显示的是 visibleLinks 里的第几张
  var lastFocused = null;   // 记住打开灯箱前焦点在哪，关闭后还给它

  // 找出所有"没有被隐藏"的图片链接
  function getVisibleLinks() {
    var result = [];
    links.forEach(function (link) {
      var item = link.closest('.gallery-item'); // closest：向上找最近的 .gallery-item 父元素
      if (!item.hidden) {
        result.push(link);
      }
    });
    return result;
  }

  // 在灯箱里显示第 index 张
  function showImage(index) {
    // 首尾循环（同轮播图）
    if (index < 0) {
      index = visibleLinks.length - 1;
    }
    if (index >= visibleLinks.length) {
      index = 0;
    }
    currentIndex = index;

    var link = visibleLinks[index];
    var thumb = link.querySelector('img');

    // 大图地址就是链接的 href；标题和描述写在 data-title、data-desc 属性里
    bigImage.src = link.getAttribute('href');
    bigImage.alt = thumb.alt;
    caption.innerHTML = link.dataset.title + '<small>' + link.dataset.desc + '</small>';
    counter.textContent = (index + 1) + ' / ' + visibleLinks.length;
  }

  function openLightbox(index) {
    lastFocused = document.activeElement;
    visibleLinks = getVisibleLinks();
    showImage(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll'); // 禁止背后的页面滚动
    closeButton.focus();                       // 焦点移到关闭按钮，方便键盘操作
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocused) {
      lastFocused.focus(); // 焦点回到刚才点击的那张图片
    }
  }

  // 给每个缩略图链接绑定点击事件
  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault(); // 阻止浏览器默认行为（直接跳转到图片文件）
      var list = getVisibleLinks();
      openLightbox(list.indexOf(link)); // indexOf：找出这个链接排在第几个
    });
  });

  closeButton.addEventListener('click', closeLightbox);

  prevButton.addEventListener('click', function () {
    showImage(currentIndex - 1);
  });

  nextButton.addEventListener('click', function () {
    showImage(currentIndex + 1);
  });

  // 点击黑色背景（而不是图片本身）时关闭
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  // 键盘操作：Esc 关闭，左右方向键切换
  document.addEventListener('keydown', function (event) {
    if (!lightbox.classList.contains('open')) return; // 灯箱没打开时不处理

    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      showImage(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      showImage(currentIndex + 1);
    }
  });
}


/* --------------------------------------------------------------------------
   6. 名茶列表：按茶类筛选 + 关键词搜索（两个条件同时生效）
   -------------------------------------------------------------------------- */
function initTeaList() {
  var table = document.getElementById('tea-table');
  if (!table) return;

  var rows = table.querySelectorAll('tbody tr');                    // 每一行就是一种茶
  var buttons = document.querySelectorAll('#tea-filters .filter-btn');
  var searchInput = document.getElementById('tea-search');
  var countText = document.getElementById('tea-count');
  var emptyTip = document.getElementById('tea-empty');

  var currentType = 'all'; // 当前选中的茶类，'all' 表示全部

  // 根据"茶类 + 关键词"重新决定每一行显示还是隐藏
  function applyFilter() {
    // trim() 去掉首尾空格；toLowerCase() 转小写，搜索英文时不区分大小写
    var keyword = searchInput.value.trim().toLowerCase();
    var shownCount = 0;

    rows.forEach(function (row) {
      // 条件 1：茶类匹配（行上的 data-type 属性记录了茶类）
      var typeMatch = currentType === 'all' || row.dataset.type === currentType;
      // 条件 2：这一行的文字里包含关键词（indexOf 返回 -1 表示找不到）
      var text = row.textContent.toLowerCase();
      var keywordMatch = keyword === '' || text.indexOf(keyword) !== -1;

      var show = typeMatch && keywordMatch; // 两个条件都满足才显示
      row.hidden = !show;
      if (show) {
        shownCount++;
      }
    });

    countText.textContent = shownCount;
    emptyTip.hidden = shownCount !== 0; // 一条都没有时，显示"没有找到"的提示
  }

  // 点击茶类按钮
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      buttons.forEach(function (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      currentType = button.dataset.type;
      applyFilter();
    });
  });

  // 在搜索框里每输入一个字，就重新筛选一次
  searchInput.addEventListener('input', applyFilter);

  // 从首页卡片跳过来时，网址会带上 ?type=绿茶，这里读取它并自动筛选
  // URLSearchParams 是浏览器自带的工具，专门用来读取网址 ? 后面的参数
  var params = new URLSearchParams(window.location.search);
  var typeFromUrl = params.get('type');
  if (typeFromUrl) {
    buttons.forEach(function (button) {
      if (button.dataset.type === typeFromUrl) {
        button.click(); // 模拟点击对应的按钮
      }
    });
  }
}


/* --------------------------------------------------------------------------
   7. 留言表单验证
   规则：姓名、邮箱、主题、留言内容必填；手机号选填，但填了就必须是 11 位手机号。
   失去焦点（blur）时检查当前这一项；点击提交时检查全部。
   -------------------------------------------------------------------------- */
function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var successBox = document.getElementById('form-success');
  var successName = document.getElementById('success-name');
  var messageInput = document.getElementById('message');
  var charCount = document.getElementById('char-count');
  var MAX_LENGTH = 300; // 留言最多 300 字（和 HTML 里的 maxlength 一致）

  // 正则表达式：用来检查文字格式
  // 邮箱：xxx@xxx.xxx 的格式
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 手机号：1 开头，第二位是 3~9，后面再跟 9 位数字，一共 11 位
  var PHONE_PATTERN = /^1[3-9]\d{9}$/;

  // 需要验证的所有输入框
  var fields = form.querySelectorAll('input, select, textarea');

  // 检查一个输入框，返回错误提示文字；没有错误就返回空字符串 ''
  function getErrorMessage(field) {
    var value = field.value.trim();

    if (field.name === 'name') {
      if (value === '') return '请输入姓名';
      if (value.length < 2) return '姓名至少需要 2 个字';
    }

    if (field.name === 'email') {
      if (value === '') return '请输入邮箱';
      if (!EMAIL_PATTERN.test(value)) return '邮箱格式不正确，例如：name@example.com';
    }

    if (field.name === 'phone') {
      // 手机号是选填的：空着可以，填了就要格式正确
      if (value !== '' && !PHONE_PATTERN.test(value)) return '手机号格式不正确，请输入 11 位手机号';
    }

    if (field.name === 'topic') {
      if (value === '') return '请选择留言主题';
    }

    if (field.name === 'message') {
      if (value === '') return '请输入留言内容';
      if (value.length < 10) return '留言内容至少 10 个字（当前 ' + value.length + ' 个字）';
    }

    return ''; // 没有问题
  }

  // 在输入框下方显示（或清除）错误提示
  function showError(field, message) {
    var group = field.closest('.form-group');      // 找到这个输入框所在的那一组
    var tip = group.querySelector('.error-tip');   // 这一组里的错误提示 <span>

    tip.textContent = message;
    if (message) {
      group.classList.add('has-error');
      field.setAttribute('aria-invalid', 'true');
    } else {
      group.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
    }
  }

  // 检查一个输入框并显示结果；返回 true 表示通过
  function validateField(field) {
    var message = getErrorMessage(field);
    showError(field, message);
    return message === '';
  }

  // 给每个输入框绑定事件
  fields.forEach(function (field) {
    // 离开输入框（失去焦点）时检查
    field.addEventListener('blur', function () {
      validateField(field);
    });

    // 正在输入时：如果之前报过错，实时重新检查，改对了错误提示马上消失
    field.addEventListener('input', function () {
      if (field.closest('.form-group').classList.contains('has-error')) {
        validateField(field);
      }
    });

    // 下拉框选择后立刻检查
    field.addEventListener('change', function () {
      validateField(field);
    });
  });

  // 留言字数统计
  function updateCharCount() {
    charCount.textContent = messageInput.value.length + ' / ' + MAX_LENGTH;
  }
  messageInput.addEventListener('input', updateCharCount);

  // 点击"提交留言"
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // 阻止表单真的提交（刷新页面），我们用 JS 自己处理

    var firstInvalid = null; // 第一个出错的输入框

    fields.forEach(function (field) {
      var ok = validateField(field);
      if (!ok && firstInvalid === null) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      // 有错误：隐藏成功提示，把光标定位到第一个出错的地方
      successBox.hidden = true;
      firstInvalid.focus();
      return;
    }

    // 全部通过：显示成功提示（演示页面，不会真的发送到服务器）
    successName.textContent = document.getElementById('name').value.trim();
    successBox.hidden = false;
    form.reset();       // 清空表单
    updateCharCount();  // 字数归零

    // 页面滚动到成功提示的位置
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // 点击"重置"按钮时，同时清掉所有错误提示和成功提示
  form.addEventListener('reset', function () {
    // reset 事件发生在表单清空之前，所以用 setTimeout 等清空完成后再更新
    setTimeout(function () {
      fields.forEach(function (field) {
        showError(field, '');
      });
      updateCharCount();
    }, 0);
  });
}


/* --------------------------------------------------------------------------
   8. 回到顶部按钮：滚动超过 400px 时出现，点击平滑滚回顶部
   -------------------------------------------------------------------------- */
function initBackToTop() {
  var button = document.getElementById('back-to-top');
  if (!button) return;

  function toggleButton() {
    if (window.scrollY > 400) {
      button.classList.add('show');
    } else {
      button.classList.remove('show');
    }
  }

  window.addEventListener('scroll', toggleButton);
  toggleButton();

  button.addEventListener('click', function () {
    // behavior: 'smooth' 表示平滑滚动，而不是一下子跳上去
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* --------------------------------------------------------------------------
   9. 滚动渐入动画：带 reveal 类的元素滚动到屏幕里时，加上 visible 类淡入
   IntersectionObserver 是浏览器提供的"观察者"，元素进入可视区域时会通知我们
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (items.length === 0) return;

  // 老浏览器不支持 IntersectionObserver 时，直接全部显示
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) {
      item.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {               // 元素进入屏幕了
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);       // 只播放一次，之后不再观察
      }
    });
  }, {
    threshold: 0.12,                  // 元素露出 12% 时触发
    rootMargin: '0px 0px -40px 0px'   // 离屏幕底部还有 40px 时才算进入，效果更自然
  });

  items.forEach(function (item) {
    observer.observe(item);
  });
}


/* --------------------------------------------------------------------------
   启动：依次调用上面的所有功能
   （<script> 标签带有 defer 属性，会等 HTML 全部加载完再执行，所以能找到所有元素）
   -------------------------------------------------------------------------- */
initHeaderShadow();
initMobileNav();
initCarousel();
initGalleryFilter();
initLightbox();
initTeaList();
initContactForm();
initBackToTop();
initScrollReveal();
