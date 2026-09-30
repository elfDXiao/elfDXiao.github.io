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
    doc: 'M8.6 3.6h6.8v2.6H8.6zM8.6 5.4H5.8v15.2h12.4V5.4h-2.8M9.2 13.4l2.1 2.1 3.6-3.9'
  };
  var SKILLS = [
    { id: 'wh',   n: '全屋定制',   m: '等级 5/5 · 被动', d: '从户型到每一格柜体：木作、柜体、门窗、五金，按中国各地施工习惯出图。', cd: '施法时间：即时 · 冷却：无', href: 'furniture.html' },
    { id: 'bath', n: '整体浴室',   m: '等级 5/5 · 被动', d: '日系整体浴室（1418/1616/1624 系列）选型、落位、给排水与电气点位一次说完。', cd: '施法时间：即时 · 冷却：无', href: 'bathroom.html' },
    { id: 'kt',   n: '系统厨房',   m: '等级 4/5 · 被动', d: '系统厨房的动线、台面高度、收纳分区与设备尺寸核对，中日双语对照。', cd: '施法时间：即时 · 冷却：无', href: 'kitchen.html' },
    { id: 'db',   n: '部品资料库', m: '等级 4/5 · 被动', d: '系统厨房 / 卫浴 / 收纳部品的图文资料库，可按品牌与分类筛选检索。', cd: '施法时间：即时 · 冷却：无', href: 'database.html' },
    { id: 'mep',  n: '水电点位',   m: '等级 4/5 · 被动', d: '给水、排水、电气的点位与标高，按现场条件与设备要求反推，避免返工。', cd: '施法时间：即时 · 冷却：无', href: 'docs.html' },
    { id: 'qq',   n: '报价核算',   m: '等级 5/5 · 主动', d: '选完即出全含报价：主材、辅材、人工、运输、损耗一次算清，不留尾巴。', cd: '施法时间：1 个工作日 · 冷却：无', href: 'kitchen.html' },
    { id: 'sim',  n: '3D 仿真',    m: '等级 3/5 · 主动', d: '自研交互仿真：新风风量走向、公共烟道止逆阀与倒灌，先在浏览器里跑一遍。', cd: '施法时间：即时 · 冷却：无', href: 'airflow.html' },
    { id: 'doc',  n: '文档交付',   m: '等级 5/5 · 被动', d: '需求调查 → 测量 → 方案 → 报价 → 施工 → 验收，成套文档逐项确认并可导出 PDF。', cd: '施法时间：即时 · 冷却：无', href: 'docs.html' }
  ];

  /* ---------- 各页角色卡文案 ---------- */
  var BASE_STATS = [['落地项目', '320+'], ['覆盖城市', '46'], ['在线工具', '11 套'], ['文档模板', '120+']];
  var SECT = {
    home:      { sub: 'ELF D. XIAO · DESIGN WORKSHOP', role: '全屋定制 × 日系整体浴室 × 系统厨房 —— 设计 · 选型 · 文档 · 落地', now: 'wh' },
    furniture: { sub: 'WHOLE-HOUSE CUSTOM',   role: '把户型图变成能施工的图：每一面墙、每一格柜都有交代', now: 'wh' },
    studio:    { sub: 'STUDIO CASES',         role: '真实项目实景与造价：看得见做过的房子，也看得见花过的钱', now: 'qq' },
    kitchen:   { sub: 'KITCHEN & BATH',       role: '在线选型：中日双语对照，选完直接出大陆地区全含报价', now: 'kt' },
    database:  { sub: 'PRODUCT ARCHIVE',      role: '部品资料库：系统厨房・卫浴・收纳，按分类检索可查', now: 'db' },
    bathroom:  { sub: 'UNIT BATHROOM · CHINA',role: '日式整体浴室在中国的落地：360° 全景、型号尺寸与全含报价', now: 'bath' },
    docs:      { sub: 'DOCUMENTS',            role: '成套文档：从需求调查到施工交底，可在线逐项确认与导出', now: 'doc' },
    panorama:  { sub: '360° PANORAMA',        role: '整体浴室全景实拍：把现场搬进浏览器里转着看', now: 'bath' },
    inspection:{ sub: 'INSPECTION',           role: '验收巡检：每个节点留痕，问题清单一件件闭环', now: 'doc' },
    survey:    { sub: 'REQUIREMENT SURVEY',   role: '需求调查：把口头想法变成可逐项核对的清单', now: 'doc' },
    measure:   { sub: 'MEASUREMENT',          role: '现场测量：尺寸、标高、点位一次量准，不给返工留口子', now: 'mep' },
    shower:    { sub: 'SHOWER SELECTOR',      role: '淋浴房选型：型号、尺寸、玻璃与五金一次配齐', now: 'kt' },
    sinra:     { sub: 'TOTO シンラ SELECTOR', role: 'TOTO 系统浴室选型：类型 / 尺寸 / 墙地顶 / 设备，中日双语', now: 'bath' },
    kitchenSel:{ sub: 'KITCHEN SELECTOR',     role: '厨房选型工具：柜体、台面、五金与电器逐项配', now: 'kt' },
    tool:      { sub: 'SELECTOR TOOL',        role: '在线选型工具：按品牌与系列逐项选，选完直接出报价单', now: 'kt' }
  };

  var sect = (me.getAttribute('data-sect') || 'studio').toLowerCase();
  var cfg = SECT[sect] || SECT.studio;
  // 画像：可指定 data-portrait；默认用巫妖王（阿尔萨斯）；加载失败自动回落到「老」字印章
  var portrait = me.getAttribute('data-portrait') || (BASE + 'img/wow/arthas.jpg');

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
    var stats = BASE_STATS.map(function (x) { return '<div>' + x[0] + '<span>' + x[1] + '</span></div>'; }).join('');
    return el(
      '<div class="wchar-wrap">' +
        '<div class="wchar">' +
          '<div class="wchar-face">' + faceHTML() + '</div>' +
          '<div class="wchar-body">' +
            '<div class="wchar-name">老肖</div>' +
            '<div class="wchar-sub">' + cfg.sub + '</div>' +
            '<div class="wchar-role">' + cfg.role + '</div>' +
            '<div class="wbar"><i style="width:82%"></i><b>从业经验 18 年</b></div>' +
            '<div class="wbar blue"><i style="width:96%"></i><b>项目交付率 96%</b></div>' +
            '<div class="wchar-stats">' + stats + '</div>' +
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