/* =========================================================
   个人主页交互脚本
   ========================================================= */

(function () {
  'use strict';

  // ---------- 1. 打字机效果（首页名字） ----------
  var fullName = '你的名字';            // ← 在这里改成你的名字
  var typedName = document.getElementById('typedName');
  var typeTimer = null;

  function typeName() {
    if (!typedName) return;
    typedName.textContent = '';
    var i = 0;
    clearInterval(typeTimer);
    typeTimer = setInterval(function () {
      typedName.textContent = fullName.slice(0, ++i);
      if (i >= fullName.length) clearInterval(typeTimer);
    }, 130);
  }
  typeName();

  // ---------- 2. 顶部导航：滚动后加阴影 ----------
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 3. 移动端菜单 ----------
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    // 点击菜单项后自动收起
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- 4. 当前区块高亮 ----------
  var sections = document.querySelectorAll('section[id]');
  var menuAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function highlightNav() {
    var pos = window.scrollY + 120;
    var currentId = 'home';
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) currentId = sec.id;
    });
    menuAnchors.forEach(function (a) {
      var isActive = a.getAttribute('href') === '#' + currentId;
      a.classList.toggle('active', isActive);
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  // ---------- 5. 滚动出现动画 ----------
  var revealEls = document.querySelectorAll('.section, .skill-card, .project-card');
  revealEls.forEach(function (el) {
    if (el.classList.contains('section')) el.classList.add('reveal');
    else el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---------- 6. 留言表单（GitHub Pages 无后端，走邮件链接） ----------
  var form = document.getElementById('contactForm');
  var tip = document.getElementById('formTip');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cName').value.trim();
      var email = document.getElementById('cEmail').value.trim();
      var msg = document.getElementById('cMsg').value.trim();

      if (!name || !email || !msg) {
        showTip('请把称呼、邮箱和留言都填写完整哦。', false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showTip('邮箱格式好像不太对，请检查一下。', false);
        return;
      }
      var subject = encodeURIComponent('来自个人主页的留言 - ' + name);
      var body = encodeURIComponent('称呼：' + name + '\n邮箱：' + email + '\n\n' + msg);
      window.location.href = 'mailto:your@email.com?subject=' + subject + '&body=' + body;
      showTip('已为你打开邮件应用，点“发送”即可把留言发给我，谢谢！', true);
      form.reset();
    });
  }

  function showTip(text, ok) {
    if (!tip) return;
    tip.textContent = text;
    tip.className = 'form-tip ' + (ok ? 'ok' : 'err');
  }

  // ---------- 7. 页脚年份 ----------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();