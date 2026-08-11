/* =========================================================
   全局交互：导航 / 滚动动画 / 页脚年份
   ========================================================= */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var isOnPage = document.body.classList.contains('page');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
    if (navLinks && navLinks.classList.contains('open') && window.innerWidth <= 680) {
      // 滚动时收起移动端菜单
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 滚动出现动画
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // 页脚年份
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 表单提示
  var form = document.getElementById('contactForm');
  var tip = document.getElementById('formTip');
  if (form && tip) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cName');
      var email = document.getElementById('cEmail');
      var msg = document.getElementById('cMsg');
      if (!name || !email || !msg) return;
      if (!name.value.trim() || !email.value.trim() || !msg.value.trim()) {
        tip.textContent = '请把称呼、邮箱和留言填写完整。';
        tip.className = 'form-tip err';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        tip.textContent = '邮箱格式不正确，请检查。';
        tip.className = 'form-tip err';
        return;
      }
      var subject = encodeURIComponent('来自网站的咨询 - ' + name.value.trim());
      var body = encodeURIComponent('称呼：' + name.value.trim() + '\n邮箱：' + email.value.trim() + '\n\n' + msg.value.trim());
      window.location.href = 'mailto:your@email.com?subject=' + subject + '&body=' + body;
      tip.textContent = '已打开邮件应用，发送即可，谢谢！';
      tip.className = 'form-tip ok';
      form.reset();
    });
  }
})();