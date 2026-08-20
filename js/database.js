/* 产品资料库：分类筛选 + 搜索 */
(function () {
  'use strict';
  var data = window.PRODUCT_DATA || [];
  var grid = document.getElementById('libGrid');
  var countEl = document.getElementById('libCount');
  var emptyEl = document.getElementById('libEmpty');
  var searchEl = document.getElementById('libSearch');
  var filtersEl = document.getElementById('libFilters');

  var cats = [];
  data.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
  cats.unshift('全部');

  var state = { cat: '全部', q: '' };

  // 渲染筛选按钮
  cats.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    if (c === state.cat) b.classList.add('active');
    b.addEventListener('click', function () {
      state.cat = c;
      Array.prototype.forEach.call(filtersEl.children, function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      render();
    });
    filtersEl.appendChild(b);
  });

  function match(p) {
    if (state.cat !== '全部' && p.cat !== state.cat) return false;
    if (state.q) {
      var q = state.q.toLowerCase();
      var hay = (p.name + ' ' + (p.brand || '') + ' ' + (p.note || '')).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  }

  function render() {
    var list = data.filter(match);
    grid.innerHTML = '';
    countEl.textContent = '共 ' + list.length + ' 项';
    emptyEl.style.display = list.length ? 'none' : '';
    list.forEach(function (p, i) {
      var card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML =
        '<div class="product-thumb">' +
          '<img src="' + (p.cover || window.PH.image(i + 1, p.hue || 25, 'PRODUCT')) + '" alt="' + esc(p.name) + '">' +
          '<span class="thumb-tag">' + esc(p.cat) + '</span>' +
        '</div>' +
        '<div class="product-body">' +
          '<div class="cat">' + esc(p.cat) + ' · ' + esc(p.brand || '') + '</div>' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<div class="price">' + (p.file ? '<a class="download-link" href="' + esc(p.file) + '" download>下载 PDF</a>' : '<small>参考价</small>') + '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  if (searchEl) {
    var timer = null;
    searchEl.addEventListener('input', function () {
      clearTimeout(timer);
      var v = searchEl.value.trim();
      timer = setTimeout(function () { state.q = v; render(); }, 150);
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  render();
})();