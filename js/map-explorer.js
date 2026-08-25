/* =========================================================
   地图选城市 · 案例浏览组件
   用法：initMapExplorer({ type: 'furniture' })
   依赖：china-map-data.js / city-data.js / case-data.js / ph.js
   ========================================================= */
window.initMapExplorer = function (config) {
  'use strict';

  var type = config.type;
  var base = config.dataSource || window.CASE_DATA;
  if (!base || !window.CHINA_MAP || !window.CITY_DATA) return;
  var ds = base[type];
  if (!ds) return;

  var state = { prov: null, city: null };

  var mapEl = document.getElementById(config.mapId);
  var hintEl = document.getElementById(config.hintId);
  var crumbEl = document.getElementById(config.crumbId);
  var cityPanelEl = document.getElementById(config.cityId);
  var cityGridEl = document.getElementById(config.cityGridId);
  var caseSecEl = document.getElementById(config.caseSectionId);
  var caseTitleEl = document.getElementById(config.caseTitleId);
  var caseGridEl = document.getElementById(config.caseGridId);
  var caseEmptyEl = document.getElementById(config.caseEmptyId);

  // ---------- 渲染地图 ----------
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', window.CHINA_MAP.viewBox);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '中国地图，点击选择省份');

  var paths = {};
  window.CHINA_MAP.provinces.forEach(function (p) {
    var g = document.createElementNS(svgNS, 'g');
    g.setAttribute('data-adcode', p.adcode);
    g.setAttribute('class', 'province');
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', p.d);
    // 有案例数据的省份：添加 has-data 类（CSS 中以浅咖啡色标注，见 glass.css）
    path.setAttribute('class', ds.provinces[p.adcode] ? 'prov-path has-data' : 'prov-path');
    path.setAttribute('data-name', p.name);
    g.appendChild(path);
    if (p.cx !== null && p.cy !== null) {
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', p.cx);
      t.setAttribute('y', p.cy);
      t.setAttribute('class', 'prov-label');
      t.setAttribute('text-anchor', 'middle');
      t.textContent = p.name.length > 4 ? p.name.slice(0, 2) : p.name;
      g.appendChild(t);
    }
    g.addEventListener('click', function () { selectProvince(p.adcode); });
    g.addEventListener('mouseenter', function () { g.classList.add('prov-hover'); });
    g.addEventListener('mouseleave', function () { g.classList.remove('prov-hover'); });
    paths[p.adcode] = g;
    svg.appendChild(g);
  });
  mapEl.innerHTML = '';
  mapEl.appendChild(svg);

  // ---------- 选择省份 ----------
  function selectProvince(adcode) {
    state.prov = adcode;
    state.city = null;
    Object.keys(paths).forEach(function (k) { paths[k].classList.remove('active'); });
    var g = paths[adcode];
    if (g) g.classList.add('active');

    var pInfo = window.CITY_DATA[adcode];
    var pName = pInfo ? pInfo.name : adcode;

    if (crumbEl) {
      crumbEl.innerHTML =
        '当前：<b>' + pName + '</b>　<span class="muted">→</span>　请选择城市' +
        '<button type="button" data-reset="prov" style="margin-left:10px;">重新选择</button>';
      bindReset();
    }
    if (hintEl) hintEl.textContent = '已选择：' + pName + ' — 请在右侧选择城市';

    // 渲染城市
    var cities = pInfo ? pInfo.cities : [];
    cityGridEl.innerHTML = '';
    if (cities.length === 0) {
      cityGridEl.innerHTML = '<p class="city-empty">暂无城市数据</p>';
    } else {
      cities.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'city-btn';
        b.textContent = c.name;
        b.addEventListener('click', function () { selectCity(c); });
        cityGridEl.appendChild(b);
      });
    }
    cityPanelEl.classList.remove('is-hidden');
    cityPanelEl.style.display = '';

    // 隐藏案例区
    hideCases();

    if (window.innerWidth < 960) {
      cityPanelEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- 选择城市 ----------
  function selectCity(city) {
    state.city = city.adcode;
    Array.prototype.forEach.call(cityGridEl.querySelectorAll('.city-btn'), function (b) {
      b.classList.toggle('active', b.textContent === city.name);
    });

    var pInfo = window.CITY_DATA[state.prov];
    if (crumbEl) {
      crumbEl.innerHTML =
        '当前：<b>' + pInfo.name + '</b> / <b>' + city.name + '</b>' +
        '<button type="button" data-reset="city" style="margin-left:10px;">重新选择</button>';
      bindReset();
    }
    if (hintEl) hintEl.textContent = '已选择：' + pInfo.name + ' · ' + city.name;

    renderCases(state.prov, city.adcode);
    if (window.innerWidth < 960 && caseSecEl) {
      caseSecEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- 渲染案例 ----------
  function renderCases(provAd, cityAd) {
    var prov = ds.provinces[provAd];
    var city = prov && prov.cities[cityAd];
    var cases = city ? city.cases : [];
    if (caseSecEl) caseSecEl.style.display = '';
    if (caseTitleEl) {
      var pName = (window.CITY_DATA[provAd] || {}).name || '';
      var cName = city ? city.name : '';
      caseTitleEl.innerHTML = (pName + ' · ' + cName) + '　<span>' + cases.length + ' 个案例</span>';
    }
    caseGridEl.innerHTML = '';
    if (caseEmptyEl) caseEmptyEl.style.display = cases.length ? 'none' : '';
    if (caseEmptyEl) caseEmptyEl.innerHTML = cases.length ? '' : '该城市暂无案例，敬请期待。';

    cases.forEach(function (c, i) {
      var card = document.createElement('article');
      card.className = 'case-card' + (c.pano ? ' case-card-pano' : '');
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      var thumb = c.thumb || window.PH.image(1, ds.hue, ds.label);
      var meta = c.meta || (c.pano ? (c.brand || '') + ' · ' + (c.series || '') : '');
      card.innerHTML =
        '<div class="case-thumb">' +
          '<img src="' + escapeAttr(thumb) + '" alt="' + escapeAttr(c.title) + '">' +
          (c.pano ? '<span class="case-pano">360° 全景</span>' : '') +
          (c.images ? '<span class="img-count">' + c.images + ' 张</span>' : '') +
        '</div>' +
        '<div class="case-body">' +
          '<div class="meta">' + escapeHtml(meta) + '</div>' +
          '<h3>' + escapeHtml(c.title) + '</h3>' +
          '<div class="price">' + escapeHtml(c.price) + '<small>' + (c.pano ? '点击查看 360° 全景' : '点击查看详情') + '</small></div>' +
        '</div>';
      card.addEventListener('click', function () {
        if (c.pano && config.onOpenCase) config.onOpenCase(c, i, pName, cName);
        else openLightbox(c, i);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (c.pano && config.onOpenCase) config.onOpenCase(c, i, pName, cName);
          else openLightbox(c, i);
        }
      });
      caseGridEl.appendChild(card);
    });
  }

  function hideCases() {
    if (caseSecEl) caseSecEl.style.display = 'none';
  }

  // ---------- 面包屑重置 ----------
  function bindReset() {
    if (!crumbEl) return;
    Array.prototype.forEach.call(crumbEl.querySelectorAll('[data-reset]'), function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (btn.getAttribute('data-reset') === 'prov') {
          state.prov = null; state.city = null;
          Object.keys(paths).forEach(function (k) { paths[k].classList.remove('active'); });
          cityPanelEl.style.display = 'none';
          hideCases();
          if (hintEl) hintEl.textContent = '请点击地图上的省份开始浏览';
        } else {
          state.city = null;
          Array.prototype.forEach.call(cityGridEl.querySelectorAll('.city-btn.active'), function (b) {
            b.classList.remove('active');
          });
          hideCases();
          if (crumbEl) {
            crumbEl.innerHTML = '当前：<b>' + (window.CITY_DATA[state.prov] || {}).name + '</b>　请选择城市<button type="button" data-reset="prov" style="margin-left:10px;">重新选择</button>';
            bindReset();
          }
        }
      });
    });
  }

  // ---------- 灯箱 ----------
  var lb = document.getElementById(config.lightboxId);
  var lbMedia = document.getElementById(config.lbMediaId);
  var lbCount = document.getElementById(config.lbCountId);
  var lbBody = document.getElementById(config.lbBodyId);
  var current = null, currentIdx = 0;

  function openLightbox(c, startIdx) {
    current = c;
    currentIdx = Math.max(0, Math.min(startIdx || 0, c.images - 1));
    if (!lb) return;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderLb();
  }
  function renderLb() {
    if (!current) return;
    var n = current.images || 1;
    lbMedia.innerHTML = '<img src="' + window.PH.image(currentIdx + 1, ds.hue, ds.label) + '" alt="' + escapeAttr(current.title) + '">';
    if (lbCount) lbCount.textContent = (currentIdx + 1) + ' / ' + n;
    if (lbBody) {
      lbBody.innerHTML =
        '<div class="lb-meta">' + escapeHtml(current.meta) + '</div>' +
        '<h3>' + escapeHtml(current.title) + '</h3>' +
        '<div class="lb-price">' + escapeHtml(current.price) + '</div>' +
        '<div class="lb-price-note">' + escapeHtml(current.priceNote || '') + '</div>' +
        '<p class="lb-desc">' + escapeHtml(current.desc || '') + '</p>' +
        '<div class="lb-tags">' + (current.tags || []).map(function (t) { return '<span>' + escapeHtml(t) + '</span>'; }).join('') + '</div>';
    }
  }
  function lbNav(dir) {
    if (!current) return;
    var n = current.images || 1;
    currentIdx = (currentIdx + dir + n) % n;
    renderLb();
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    current = null;
  }
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    var prev = document.getElementById(config.lbPrevId);
    var next = document.getElementById(config.lbNextId);
    var close = document.getElementById(config.lbCloseId);
    if (prev) prev.addEventListener('click', function () { lbNav(-1); });
    if (next) next.addEventListener('click', function () { lbNav(1); });
    if (close) close.addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') lbNav(-1);
      if (e.key === 'ArrowRight') lbNav(1);
    });
  }

  // ---------- 工具 ----------
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(s) { return escapeHtml(s); }
};