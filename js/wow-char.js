/* ============================================================
   wow-char.js — 给页面注入「角色卡 + 技能栏」（魔兽风单位框 / 法术书）
   用法（一行）：  <script src="js/wow-char.js" data-sect="studio" defer></script>
   子目录页面用：  <script src="../js/wow-char.js" data-sect="studio" defer></script>
   可选属性：      data-portrait="img/portrait/laoxiao.jpg"  换成真人画像
   回退：删掉这一行即可，页面恢复原样
   ============================================================ */
(function () {
  var me = document.currentScript || (function () {
    var a = document.getElementsByTagName('script');
    return a[a.length - 1];
  })();
  var BASE = me.src.replace(/js\/wow-char\.js.*$/, '');

  /* ---------- 技能表（图标 / 说明 / 跳转） ---------- */
  var G = {
    wh:  'M3 11.5 12 4l9 7.5M5.6 10.6V20h12.8v-9.4M10.3 20v-5.2h3.4V20',
    bath:'M3.5 12.2h17v2.9a3.1 3.1 0 0 1-3.1 3.1H6.6a3.1 3.1 0 0 1-3.1-3.1zM8 12.2V6.6a2.6 2.6 0 0 1 5.2 0M6.2 18.4v1.8M17.8 18.4v1.8',
    kt:  'M3.6 7h16.8v13H3.6zM3.6 13.4h16.8M7.2 10.2h.01M11 10.2h.01M14.8 10.2h.01M9.4 16.6h5.2',
    db:  'M4 9.2h7.2v10.6H4zM12.8 6.4h7.2v13.4h-7.2zM6.6 12.6h2M15.4 9.8h2',
    mep: 'M13.8 3.4 7.6 13.2h3.7l-.9 7.4 6.4-9.9h-3.8zM4.6 18.6c1.4-1 2.6-1 4 0s2.6 1 4 0',
    qq:  'M6.4 3.6h11.2v17l-1.9-1.3-1.9 1.3-1.9-1.3-1.9 1.3-1.9-1.3-1.7 1.3zM9.2 8.2h5.6M9.2 11.6h5.6M9.2 15h3.2',
    sim: 'M12 3.2 20 7.6v8.9L12 20.9 4 16.5V7.6zM4 7.6 12 12l8-4.4M12 12v8.9',
    doc: 'M8.6 3.6h6.8v2.6H8.6zM8.6 5.4H5.8v15.2h12.4V5.4h-2.8M9.2 13.4l2.1 2.1 3.6-3.9',
    st:  'M3.6 5.6h16.8v12.8H3.6zM6.4 15.4l3.4-4.1 2.8 3 2.1-2.3 2.9 3.4M15.4 9.6h.01',
    lab: 'M9.4 3.6h5.2v5.1l4.2 8.7a2.2 2.2 0 0 1-2 3.1H7.2a2.2 2.2 0 0 1-2-3.1l4.2-8.7zM7.2 14.8h9.6'
  };
  var SKILLS = [
    { id: 'st',   n: '设计案例', m: '等级 4/5 · 被动', d: '按省份与城市看真实落地项目：现场照片、面积与造价，带 360° 的可转着看。', cd: '施法时间：即时 · 冷却：无', href: 'studio.html' },
    { id: 'wh',   n: '定制案例',   m: '等级 5/5 · 被动', d: '从户型到每一格柜体：木作、柜体、门窗、五金，按各地施工习惯出图。', cd: '施法时间：即时 · 冷却：无', href: 'furniture.html' },
    { id: 'bath', n: '浴室案例',   m: '等级 5/5 · 被动', d: '日系整体浴室的落位、给排水与电气点位一次说完，实拍全景对照。', cd: '施法时间：即时 · 冷却：无', href: 'bathroom.html' },
    { id: 'db',   n: '产品资料库', m: '等级 5/5 · 被动', d: '系统厨房、整体卫浴等产品资料，按分类检索可查。', cd: '施法时间：即时 · 冷却：无', href: 'database.html' },
    { id: 'kt',   n: '选型系统',   m: '等级 5/5 · 主动', d: '日系厨房与整体浴室在线选型，中日双语对照，选完直接出全含报价。', cd: '施法时间：1 个工作日 · 冷却：无', href: 'kitchen.html' },
    { id: 'doc',  n: '卡拉赞图书馆',   m: '等级 5/5 · 被动', d: '需求调查 → 测量 → 方案 → 报价 → 施工 → 验收，成套文档在线确认可导出。', cd: '施法时间：即时 · 冷却：无', href: 'docs.html' },
    { id: 'lab',  n: '地精实验室', m: '等级 3/5 · 主动', d: '自研小工具与仿真：新风走向、公共烟道止逆阀与倒灌，先在浏览器里跑一遍。', cd: '施法时间：即时 · 冷却：无', href: 'lab.html' }
  ];

  /* ---------- 各页角色卡文案 ---------- */
  var SECT = {
    home:      { face: 'img/wow/portraits/lab.jpg', name: 'elf_D老肖的世界', sub: 'ELF D. XIAO · DESIGN WORKSHOP', now: 'db',
                 role: '设计案例 · 定制案例 · 浴室案例 · 产品资料库 · 选型系统 · 卡拉赞图书馆 · 地精实验室' },
    database:  { face: 'img/wow/portraits/database.jpg', name: '日系产品资料库', sub: 'PRODUCT ARCHIVE', now: 'db',
                 role: '系统厨房，整体卫浴等检索可查' },
    furniture: { face: 'img/wow/portraits/furniture.jpg', name: '定制案例', sub: 'WHOLE-HOUSE CUSTOM', now: 'wh',
                 role: '把户型图变成能施工的图：每一面墙、每一格柜都有交代' },
    kitchen:   { face: 'img/wow/portraits/kitchen.jpg', name: '选型系统', sub: 'SELECTOR', now: 'kt',
                 role: '日系厨房 / 整体浴室在线选型：中日双语，选完直接出全含报价' },
    studio:    { face: 'img/wow/portraits/studio.jpg', name: '设计案例', sub: 'STUDIO CASES', now: 'st',
                 role: '真实项目实景与造价：看得见做过的房子，也看得见花过的钱' },
    bathroom:  { face: 'img/wow/portraits/bathroom.jpg', name: '浴室案例', sub: 'UNIT BATHROOM · CHINA', now: 'bath',
                 role: '日式整体浴室在中国的落地：360° 全景、型号尺寸与全含报价' },
    docs:      { face: 'img/wow/portraits/docs.jpg', name: '麦迪文', sub: 'KARAZHAN LIBRARY', now: 'doc',
                 role: '成套文档：从需求调查到施工交底，可在线逐项确认与导出' },
    lab:       { face: 'img/wow/portraits/lab.jpg', name: '地精实验室', sub: 'GOBLIN LAB', now: 'lab',
                 role: '自研小工具与仿真：新风、烟道、选型，先在浏览器里跑一遍再落地' }
  };
  /* 工具页/子页归到最近的板块（名字与专精跟着走） */
  SECT.panorama = SECT.bathroom; SECT.inspection = SECT.docs; SECT.survey = SECT.docs;
  SECT.measure = SECT.docs; SECT.shower = SECT.bathroom; SECT.sinra = SECT.bathroom;
  SECT.kitchensel = SECT.kitchen; SECT.kitchenSel = SECT.kitchen; SECT.tool = SECT.kitchen;

  var sect = (me.getAttribute('data-sect') || 'studio').toLowerCase();
  var cfg = SECT[sect] || SECT.studio;
  // 画像：优先 data-portrait，其次按板块（每页不同），都没有才用阿尔萨斯；加载失败回落「老」字印章
  var portrait = me.getAttribute('data-portrait') ||
                 (cfg.face ? BASE + cfg.face : BASE + 'img/wow/arthas.jpg');

  /* ---------- 样式表 ---------- */
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = BASE + 'css/wow-char.css';
  document.head.appendChild(link);

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function sealHTML() {
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' +
      '<defs><radialGradient id="wcPg" cx="50%" cy="36%"><stop offset="0" stop-color="#f0e2bd"/>' +
      '<stop offset="1" stop-color="#c4a97a"/></radialGradient></defs>' +
      '<rect width="100" height="100" fill="url(#wcPg)"/>' +
      '<g fill="none" stroke="#8a6a34" stroke-width="1.3" opacity=".55">' +
      '<circle cx="50" cy="50" r="33"/><circle cx="50" cy="50" r="41"/></g>' +
      '<text x="50" y="67" text-anchor="middle" font-size="50" fill="#4a3316" ' +
      'font-family="Ma Shan Zheng, STKaiti, KaiTi, serif">老</text></svg>' +
      '<span class="hint">换画像</span>';
  }

  function faceHTML() {
    if (portrait) {
      return '<img src="' + portrait + '" alt="角色画像"><span class="hint">换画像</span>';
    }
    return sealHTML();
  }

  function skillsHTML() {
    return SKILLS.map(function (s) {
      var glyph = '<svg viewBox="0 0 24 24"><path d="' + G[s.id] + '"/></svg>';
      var tag = s.href ? 'a' : 'div';
      var attr = s.href ? ' href="' + s.href + '"' : ' tabindex="0"';
      var tip = '<span class="wtip"><h4>' + s.n + '</h4><span class="meta">' + s.m + '</span>' +
        '<p>' + s.d + '</p><span class="cd">' + s.cd + '</span>' +
        (s.href ? '<span class="go">点击进入 →</span>' : '') + '</span>';
      return '<' + tag + ' class="wsk' + (s.id === cfg.now ? ' now' : '') + '"' + attr + ' aria-label="' + s.n + '">' +
        glyph + '<span class="lab">' + s.n + '</span>' + tip + '</' + tag + '>';
    }).join('');
  }

  function build() {
    return el(
      '<div class="wchar-wrap">' +
        '<div class="wchar">' +
          '<div class="wchar-face">' + faceHTML() + '</div>' +
          '<div class="wchar-body">' +
            '<div class="wchar-name">' + cfg.name + '</div>' +
            '<div class="wchar-sub">' + cfg.sub + '</div>' +
            '<div class="wchar-role">' + cfg.role + '</div>' +
            '<div class="wbar"><i style="width:100%"></i><b>统一更新于 2026 年 9 月 1 日</b></div>' +
            '<div class="wbar blue"><i style="width:96%"></i><b>年平均交付数量 1200 套</b></div>' +

          '</div>' +
        '</div>' +
        '<div class="wskills-head"><span>SKILLS · 技能</span></div>' +
        '<div class="wskills">' + skillsHTML() + '</div>' +
      '</div>'
    );
  }

  /* ---------- 板块内容面板化（魔兽面板） ---------- */
  var PANEL_SEL = [
    '.doc-card', '.select-card', '.cta-box', '.sel-box', '.lib-toolbar', '.map-box',
    '.product-grid > *', '.case-grid > *', '.city-grid > *',
    '.doc-list > .doc-card', '.select-grid > .select-card'
  ];
  function panelize(root) {
    root = root || document;
    PANEL_SEL.forEach(function (sel) {
      try {
        [].forEach.call(root.querySelectorAll(sel), function (el) {
          if (!el.classList.contains('wow-panel')) el.classList.add('wow-panel');
        });
      } catch (e) { /* 选择器不被支持就跳过 */ }
    });
  }

  function mount() {
    var node = build();
    var anchor = document.querySelector('main .page-hero') ||
                 document.querySelector('.page-hero') ||
                 document.querySelector('.about-strip') ||
                 document.querySelector('[data-char-anchor]') ||
                 document.querySelector('main');
    if (anchor) { anchor.insertAdjacentElement('afterend', node); }
    else { document.body.insertBefore(node, document.body.firstChild); }
    // 画像加载失败 → 回落到「老」字印章
    var im = node.querySelector('.wchar-face img');
    if (im) {
      im.addEventListener('error', function () {
        var face = im.parentNode;
        if (face) face.innerHTML = sealHTML();
      });
    }
    // 技能栏底部要给标签留空间
    node.querySelector('.wskills').style.marginBottom = '26px';
    // 内容面板化（含 JS 动态生成的卡片）
    panelize(document);
    try {
      var t = null;
      new MutationObserver(function (muts) {
        var hasNew = muts.some(function (m) { return m.addedNodes && m.addedNodes.length; });
        if (!hasNew) return;
        clearTimeout(t);
        t = setTimeout(function () { panelize(document); }, 160);
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* 老浏览器忽略 */ }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', mount); }
  else { mount(); }
})();