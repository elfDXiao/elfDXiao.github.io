/* ============================================================
   wow-talent.js — 地精实验室 · 天赋树渲染
   <div id="talentPanel"></div> + <script src="js/wow-talent.js" defer>
   点亮的技能（live / beta）点击直接进入程序；在造的弹提示
   ============================================================ */
(function () {
  var G = {   /* 树头图标（分层：f 面 / l 线 / h 高光） */
    hvac:   '<circle class="f" cx="12" cy="12" r="3.4"/><path class="l" d="M12 3.4v17.2M4.6 7.7l14.8 8.6M19.4 7.7 4.6 16.3M12 8.5a3.5 3.5 0 1 0 .01 0M12 3.4l-1.5 1.9M12 3.4l1.5 1.9M12 20.6l-1.5-1.9M12 20.6l1.5-1.9M4.6 7.7l2.4.3M4.6 7.7l.3-2.4M19.4 16.3l-2.4-.3M19.4 16.3l-.3 2.4"/><circle class="h" cx="12" cy="12" r=".9"/>',
    elec:   '<path class="f" d="M13.8 3.4 7.6 13.2h3.7l-.9 7.4 6.4-9.9h-3.8z"/><path class="l" d="M13.8 3.4 7.6 13.2h3.7l-.9 7.4 6.4-9.9h-3.8z"/><path class="h" d="M12.4 6.4 9.8 10.8h2"/>',
    light:  '<path class="f" d="M12 3.6a5.6 5.6 0 0 1 3.4 10.1c-.6.5-.9 1.1-.9 1.8H9.5c0-.7-.3-1.3-.9-1.8A5.6 5.6 0 0 1 12 3.6z"/><path class="l" d="M12 3.6a5.6 5.6 0 0 1 3.4 10.1c-.6.5-.9 1.1-.9 1.8H9.5c0-.7-.3-1.3-.9-1.8A5.6 5.6 0 0 1 12 3.6zM9.4 17.6h5.2M10.2 20.4h3.6"/><path class="h" d="M10.4 8.8c.9-1 2.3-1 3.2 0"/>'
  };
  /* 天赋图标 */
  var ICON = {
    /* 每项为分层 SVG 片段：f=形体面（半透明） l=主线稿 h=高光细部 */
    energy:   '<path class="f" d="M5.2 10.6v8.8h13.6v-8.8z"/><path class="l" d="M3.4 11.4 12 4.2l8.6 7.2M5.2 10.4v9h13.6v-9M9.2 19.4v-4.8h5.6v4.8"/><circle class="h" cx="12" cy="16.8" r=".9"/>',
    vrf:      '<path class="f" d="M3.6 13.2h7.6v5.8H3.6zM14.6 4.6h5.8v3.8h-5.8z"/><path class="l" d="M3.6 13.2h7.6v5.8H3.6zM7.4 16.1a1.9 1.9 0 1 0 .01 0M14.6 4.6h5.8v3.8h-5.8M15 6.5h5M11.2 15h1.6c1.8 0 1.8-1.9 1.8-3.3M11.2 18.6h3c2.6 0 2.8-4 2.8-7.6"/><circle class="h" cx="7.4" cy="16.1" r=".65"/>',
    fresh:    '<path class="f" d="M3.6 8.4h9.2v7.2H3.6z"/><path class="l" d="M3.6 8.4h9.2v7.2H3.6zM3.6 12h9.2M15.4 9.6c1.6-.8 2.4.4 3.4.4s1.8-1.2 3-1.2M15.4 14.4c1.6-.8 2.4.4 3.4.4s1.8-1.2 3-1.2"/><path class="h" d="M8.2 12h.5"/>',
    floorheat:'<path class="f" d="M3.4 16.6h17.2v3.4H3.4z"/><path class="l" d="M3.4 16.6h17.2v3.4H3.4zM5.6 7h12.8M5.6 7v2.9M5.6 9.9h12.8M18.4 9.9v2.9M18.4 12.8H5.6"/><path class="h" d="M11.4 18.3h1.2"/>',
    radiator:'<path class="f" d="M5.4 12.8h13.2v6H5.4z"/><path class="l" d="M5.4 12.8h13.2v6H5.4zM7.8 12.8v6M10.2 12.8v6M12.6 12.8v6M15 12.8v6M17.4 12.8v6M4.4 20.4h15.2M7.4 4.6h9.2v5.2H7.4zM12 4.6v5.2"/><path class="h" d="M9.2 7.2h1.6"/>',
    hydro:    '<path class="f" d="M3.6 6.6h16.8v2.6H3.6z"/><path class="l" d="M3.6 6.6h16.8v2.6H3.6zM7 9.2v6.2M12 9.2v6.2M17 9.2v6.2M12 17.2c1 1.2 1 2.3.3 3-.7.7-1.8.3-1.8-.6 0-.7.7-1.4 1.5-2.4z"/><circle class="h" cx="7" cy="17.2" r=".6"/><circle class="h" cx="17" cy="17.2" r=".6"/>',
    flue:     '<path class="f" d="M5 6.4h7.6v13.2H5z"/><path class="l" d="M5 6.4h7.6v13.2H5zM5 10.6h7.6M5 14.8h7.6M16.2 17.6V6.8M16.2 6.8l-1.8 2.1M16.2 6.8l1.8 2.1M13.4 20h2.8"/><path class="h" d="M16.2 12h.5M16.2 15h.5"/>',
    hood:     '<path class="f" d="M8.8 2.8h6.4v6.1H8.8zM4.6 8.9h14.8v2.6H4.6zM4.6 11.5 2.5 18.7h19l-2.1-7.2z"/><path class="l" d="M8.8 2.8h6.4v6.1H8.8zM4.6 8.9h14.8v2.6H4.6zM4.6 11.5 2.5 18.7h19l-2.1-7.2M4.3 14.3h15.4M10.4 18.7v1.4h3.2v-1.4"/><path class="h" d="M9.8 10.2h.5M11.75 10.2h.5M13.7 10.2h.5"/>',
    av:       '<path class="f" d="M5.4 4.6h8.2v14.8H5.4z"/><path class="l" d="M5.4 4.6h8.2v14.8H5.4zM9.5 7.6a2.4 2.4 0 1 0 .01 0M9.5 15a1 1 0 1 0 .01 0M16 8.8c1.1 1 1.1 3.6 0 4.6M18.6 6.9c1.9 1.7 1.9 6.3 0 8"/><circle class="h" cx="9.5" cy="7.6" r=".7"/>',
    wifi:     '<path class="f" d="M6.6 15.6h10.8v2.8H6.6z"/><path class="l" d="M6.6 15.6h10.8v2.8H6.6zM8.4 12.8a5.2 5.2 0 0 1 7.2 0M6.4 10a8.4 8.4 0 0 1 11.2 0M4.6 7.2a11.4 11.4 0 0 1 14.8 0M12 19.2h.01"/><path class="h" d="M9.8 17h4.4"/>',
    smart:    '<path class="f" d="M5.6 11v8.4h12.8V11z"/><path class="l" d="M4 11.6 12 5l8 6.6M5.6 11v8.4h12.8V11M12 13.6a1.4 1.4 0 1 0 .01 0M12 10.8v1.4M15 14.9h-1.2M9 14.9h1.2M12 17.6v-1.4"/><circle class="h" cx="12" cy="14.9" r=".55"/>',
    lux:      '<path class="f" d="M8.6 4.8h6.8l3 6H5.6z"/><path class="l" d="M8.6 4.8h6.8l3 6H5.6zM12 4.8V2.8M3.4 14.4l-1 1.4M7 14.4l-.6 1.5M12 14.4v1.6M17 14.4l.6 1.5M20.6 14.4l1 1.4"/><circle class="h" cx="12" cy="12" r=".7"/>',
    cct:      '<path class="f" d="M12 6.6a4.8 4.8 0 1 0 .01 9.6 4.8 4.8 0 0 0-.01-9.6z"/><path class="l" d="M12 6.6a4.8 4.8 0 1 0 .01 9.6 4.8 4.8 0 0 0-.01-9.6M10.2 17.6h3.6M10.6 19.8h2.8M12 4.4V2.6M5.2 11.4H3.4M20.6 11.4h-1.8M7.2 6.6 5.9 5.3M16.8 6.6l1.3-1.3"/><circle class="h" cx="12" cy="11.4" r="1.1"/>',
    strip:    '<path class="f" d="M3.6 9.2h8.6v5.6H3.6zM12.2 11.2h8.2v3.6h-8.2z"/><path class="l" d="M3.6 9.2h8.6v5.6H3.6zM12.2 11.2h8.2v3.6h-8.2M12.2 13h-8.6"/><path class="h" d="M5.4 12h.5M7.4 12h.5M9.4 12h.5M14.4 13h.5M16.8 13h.5M19.2 13h.5"/>',
    dimmer:   '<path class="f" d="M12 6.4a5.6 5.6 0 1 0 .01 11.2A5.6 5.6 0 0 0 12 6.4z"/><path class="l" d="M12 6.4a5.6 5.6 0 1 0 .01 11.2A5.6 5.6 0 0 0 12 6.4M12 12l3.2-3.2M12 4.2v1.2M19.8 12h-1.2M12 19.8v-1.2M4.2 12h1.2M17.5 6.5l-.85.85M6.5 17.5l.85-.85"/><circle class="h" cx="12" cy="12" r=".9"/>'
  };

  /* ====== 天赋数据（名字按老肖给的） ====== */
  var TREES = [
    {
      id: 'hvac', name: '暖通空调', en: 'HVAC', icon: 'hvac',
      talents: [
        { n: '建筑节能分析',   ic: 'energy',   st: 'todo', pips: [0, 3], row: 0, col: 1,
          d: '围护结构、门窗与体形系数对全年能耗的影响，先算清楚再决定这笔钱花不花。' },
        { n: '氟机多联机选型', ic: 'vrf',      st: 'todo', pips: [0, 2], row: 1, col: 0, par: 0,
          d: '按房间冷热负荷选室内机型号与配比，核对室外机能力、管长与落差衰减。' },
        { n: '新风仿真',       ic: 'fresh',    st: 'wip', pips: [0, 1], row: 1, col: 1, par: 0,
          d: '上传户型图 → 画房间/门窗 → 布送风回风口 → 2D 风速图 + 3D 粒子流，可导出 PDF 报告。' },
        { n: '地暖敷设优化',   ic: 'floorheat',st: 'todo', pips: [0, 2], row: 1, col: 2, par: 0,
          d: '盘管间距、分集水器回路划分与地面温度分布，避免一间热一间凉。' },
        { n: '暖气片布置优化', ic: 'radiator', st: 'todo', pips: [0, 2], row: 2, col: 0, par: 1,
          d: '窗下还是外墙？片数、进出水方式与散热量，按房间算件数而不是按经验报。' },
        { n: '水力分配系统',   ic: 'hydro',    st: 'todo', pips: [0, 3], row: 2, col: 2, par: 3,
          d: '各回路流量与阻力平衡，末端与主机匹配，杜绝近热远冷、水泵白做功。' }
      ]
    },
    {
      id: 'elec', name: '电器设备', en: 'ELECTRICAL', icon: 'elec',
      talents: [
        { n: '公共烟道仿真',   ic: 'flue',  st: 'live', pips: [1, 3], row: 0, col: 0, href: '老肖公共烟道仿真V1.0.html',
          d: '整栋楼共用一个烟道时，楼层压差、止逆阀开度与邻居开机状况如何互相影响，倒灌多少。' },
        { n: '油烟机排烟仿真', ic: 'hood',  st: 'live', pips: [1, 2], row: 0, col: 2, href: 'hood-sim.html'  /* 新文件名绕开 CDN 缓存 */,
          d: '不同机型、锅位、墙距与风量下的捕集率：油烟到底抓没抓住，看得见。' },
        { n: '视听环境仿真',   ic: 'av',    st: 'todo', pips: [0, 2], row: 1, col: 1, par: 0,
          d: '音箱摆位、听音位与房间比例，先算一遍再决定沙发和插座在哪。' },
        { n: 'WiFi 信号仿真',  ic: 'wifi',  st: 'todo', pips: [0, 2], row: 2, col: 0, par: 2,
          d: '承重墙、金属柜与楼层对信号的衰减，AP 放哪儿覆盖最省、死角最少。' },
        { n: '家居智能化',     ic: 'smart', st: 'todo', pips: [0, 3], row: 2, col: 2, par: 2,
          d: '灯光、窗帘、空调、新风与安防的场景联动编排，一键回家 / 离家 / 观影。' }
      ]
    },
    {
      id: 'light', name: '灯光照明', en: 'LIGHTING', icon: 'light',
      talents: [
        { n: '照度模拟',       ic: 'lux',    st: 'todo', pips: [0, 3], row: 0, col: 1,
          d: '按面积与用途算需要多少光通量，落到灯具数量、瓦数与分布间距。' },
        { n: '色温与显色搭配', ic: 'cct',    st: 'todo', pips: [0, 2], row: 1, col: 0, par: 0,
          d: '客厅、餐桌、橱柜下与镜前灯的色温与显色指数怎么配才不打架。' },
        { n: '灯带长度与电源', ic: 'strip',  st: 'todo', pips: [0, 2], row: 1, col: 2, par: 0,
          d: '灯带长度、功率与电源位置，压降、接头与检修口一次算清。' },
        { n: '回路分组与调光', ic: 'dimmer', st: 'todo', pips: [0, 2], row: 2, col: 1, par: 0,
          d: '哪些灯一组、能不能调、开关放哪儿，按生活动线而不是按图纸分。' }
      ]
    }
  ];

  var STT = {
    live: { t: '已上线 · 点击进入程序', go: '点击进入系统 →' },
    beta: { t: '测试中 · 可以进，数值可能有出入', go: '进入实验分支 →' },
    wip:  { t: '施工中 · 改版重制中', go: '推倒重做中，先点亮别的天赋' },
    todo: { t: '排队中 · 还没开始造', go: '还在排队，先点亮别的天赋' }
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function nodeHTML(t, ti, idx) {
    var pip = '';
    for (var i = 0; i < t.pips[1]; i++) pip += '<i class="' + (i < t.pips[0] ? 'on' : '') + '"></i>';
    var req = t.par === undefined ? '天赋树第 ' + (t.row + 1) + ' 层 · 前置：无' : '天赋树第 ' + (t.row + 1) + ' 层 · 需投入 ' + (t.par + 1) + ' 点';
    var rank = t.pips[0] + ' / ' + t.pips[1] + (t.pips[0] === t.pips[1] && t.pips[1] ? ' · 已点满' : '');
    return '<div class="tw-node ' + t.st + '" data-ti="' + ti + '" data-i="' + idx + '" data-name="' + esc(t.n) + '"' +
      (t.href ? ' data-href="' + t.href + '"' : '') + '>' +
      '<div class="tw-ic" tabindex="0" role="button" aria-label="' + esc(t.n) + '">' +
        '<svg viewBox="0 0 24 24">' + ICON[t.ic] + '</svg>' +
      '</div>' +
      '<div class="tw-pips">' + pip + '</div>' +
      '<div class="tw-tip"><h4>' + esc(t.n) + '</h4>' +
        '<span class="req">' + req + '</span>' +
        '<span class="rank' + (t.pips[0] === t.pips[1] && t.pips[1] ? ' max' : '') + '">等级 ' + rank + '</span>' +
        '<p>' + esc(t.d) + '</p>' +
        '<span class="st">' + STT[t.st].t + '</span>' +
        '<span class="go' + (t.href ? '' : ' wait') + '">' + STT[t.st].go + '</span>' +
      '</div></div>';
  }

  function render(host) {
    var totalLive = 0, totalAll = 0;
    TREES.forEach(function (tr) {
      tr.live = tr.talents.filter(function (t) { return t.st === 'live' || t.st === 'beta'; }).length;
      totalLive += tr.live; totalAll += tr.talents.length;
    });

    var html = '<div class="tw-bar">' +
      '<h2>天赋 · 地精实验室</h2>' +
      '<span class="tw-pts">已点亮 <b>' + totalLive + '</b> / ' + totalAll + ' 点</span>' +
      '<span class="tw-spacer"></span>' +
      '<span class="tw-side">点亮的天赋可以直接进程序</span>' +
      '<button class="tw-reset" type="button">重置天赋</button>' +
      '</div><div class="tw-trees">';

    TREES.forEach(function (tr, ti) {
      html += '<div class="tw-tree" data-ti="' + ti + '">' +
        '<svg class="tw-svg"></svg>' +
        '<div class="tw-tree-head">' +
          '<svg viewBox="0 0 24 24">' + G[tr.icon] + '</svg>' +
          '<span class="tw-tree-name">' + esc(tr.name) + '</span>' +
          '<span class="tw-tree-pts">' + tr.live + ' / ' + tr.talents.length + '</span>' +
        '</div>' +
        '<div class="tw-grid">' + tr.talents.map(function (t, i) { return nodeHTML(t, ti, i); }).join('') + '</div>' +
        '</div>';
    });
    html += '</div>' +
      '<div class="tw-legend">' +
        '<span><i class="on"></i><b>已点亮</b> = 程序能跑，点进去就能用</span>' +
        '<span><i></i><b>暗的</b> = 在造或排队，点一下会有提示</span>' +
        '<span>想先要哪一个？说一声，我按你的顺序造。</span>' +
      '</div>';
    host.classList.add('tw-panel');
    host.innerHTML = html;
    drawLinks(host);
  }

  /* 树线：父 → 子 的直角连线 */
  function drawLinks(host) {
    TREES.forEach(function (tr, ti) {
      var treeEl = host.querySelector('.tw-tree[data-ti="' + ti + '"]');
      var svg = treeEl.querySelector('.tw-svg');
      var nodes = treeEl.querySelectorAll('.tw-node');
      var base = treeEl.getBoundingClientRect();
      var centers = [];
      [].forEach.call(nodes, function (n) {
        var r = n.getBoundingClientRect();
        centers.push({ x: r.left - base.left + r.width / 2, cy: r.top - base.top + 8 + 34 });
      });
      var d = '';
      tr.talents.forEach(function (t, i) {
        if (t.par === undefined) return;
        var a = centers[t.par], b = centers[i];
        var midY = (a.cy + 34 + b.cy - 34) / 2;
        var on = (t.st === 'live' || t.st === 'beta') ? ' class="on"' : '';
        d += '<path' + on + ' d="M' + a.x + ' ' + (a.cy + 34) + ' V' + midY + ' H' + b.x + ' V' + (b.cy - 34) + '"/>';
      });
      svg.setAttribute('viewBox', '0 0 ' + base.width + ' ' + base.height);
      svg.setAttribute('width', base.width); svg.setAttribute('height', base.height);
      svg.innerHTML = d;
    });
  }

  /* 提示条 */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'tw-toast'; document.body.appendChild(toastEl); }
    toastEl.innerHTML = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function bind(host) {
    /* 靠近屏幕顶部的天赋，提示框翻到下方显示 */
    host.addEventListener('mouseover', function (e) {
      var ic = e.target.closest ? e.target.closest('.tw-ic') : null;
      if (!ic) return;
      var node = ic.parentNode;
      node.classList.toggle('tip-below', ic.getBoundingClientRect().top < 340);
    });
    host.addEventListener('click', function (e) {
      var ic = e.target.closest ? e.target.closest('.tw-ic') : null;
      if (!ic) return;
      var node = ic.parentNode;
      var name = node.dataset.name, href = node.dataset.href;
      if (href) { location.href = href; return; }
      toast('「<b>' + name + '</b>」还在锻造中 —— 等它上线，先试试已点亮的天赋。');
      var tip = node.querySelector('.tw-tip');
      if (tip) tip.classList.add('pin');
      setTimeout(function () { if (tip) tip.classList.remove('pin'); }, 1800);
    });
    var reset = host.querySelector('.tw-reset');
    if (reset) reset.addEventListener('click', function () {
      var nodes = host.querySelectorAll('.tw-node.live, .tw-node.beta');
      [].forEach.call(nodes, function (n) { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; });
      toast('天赋已重置 · <b>' + nodes.length + '</b> 个已点亮的天赋重新闪了一下');
    });
  }

  function start() {
    var host = document.getElementById('talentPanel');
    if (!host) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'css/wow-talent.css';
    document.head.appendChild(link);
    render(host);
    bind(host);
    // 样式/字体加载完再画一次连线（否则量到的是没样式的尺寸）
    var redraw = function () { drawLinks(host); };
    if (link.addEventListener) link.addEventListener('load', redraw);
    if (window.requestAnimationFrame) requestAnimationFrame(redraw);
    window.addEventListener('load', redraw);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(redraw);
    setTimeout(redraw, 260);
    setTimeout(redraw, 900);
    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(redraw, 150);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();