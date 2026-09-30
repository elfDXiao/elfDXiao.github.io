/* ============================================================
   wow-talent.js — 地精实验室 · 天赋树渲染
   <div id="talentPanel"></div> + <script src="js/wow-talent.js" defer>
   点亮的技能（live / beta）点击直接进入程序；在造的弹提示
   ============================================================ */
(function () {
  var G = {
    hvac:   'M12 3.4v17.2M4.6 7.7l14.8 8.6M19.4 7.7 4.6 16.3M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2',
    elec:   'M13.8 3.4 7.6 13.2h3.7l-.9 7.4 6.4-9.9h-3.8z',
    light:  'M9.4 17.6h5.2M10.2 20.4h3.6M12 3.6a5.6 5.6 0 0 1 3.4 10.1c-.6.5-.9 1.1-.9 1.8H9.5c0-.7-.3-1.3-.9-1.8A5.6 5.6 0 0 1 12 3.6z'
  };
  /* 天赋图标 */
  var ICON = {
    energy:  'M3.6 11.6 12 4.4l8.4 7.2M5.8 10.8V19.6h12.4v-8.8M9.4 16.6c2.6 0 3.4-1.4 3.6-3.2-1.8.2-3.4.9-3.6 3.2z',
    vrf:     'M3.6 6.6h16.8v10.8H3.6zM8.4 12a2.6 2.6 0 1 0 5.2 0 2.6 2.6 0 1 0-5.2 0M15.6 9.4h3.2M15.6 12h3.2M15.6 14.6h3.2',
    fresh:   'M3.6 8.6h11.2v6.8H3.6zM3.6 12h11.2M16.8 10.2h3.6M16.8 12h3.6M16.8 13.8h3.6',
    floorheat:'M4.4 17.6h15.2M6.6 17.6c0-3.8 5.6-3.4 5.6-6 0-1.9-3-2.2-3-.1 0 3.4 7.8 3.4 7.8-1.1',
    radiator:'M4.4 7.6h15.2v10.6H4.4zM7.4 7.6v10.6M10.6 7.6v10.6M13.8 7.6v10.6M17 7.6v10.6',
    hydro:   'M4.4 6.6h15.2M7.2 6.6v9.4M12 6.6v9.4M16.8 6.6v9.4M7.2 18.6c.8 1 .8 1.9.3 2.5-.6.6-1.5.4-1.5-.5 0-.6.5-1.3 1.2-2z',
    flue:    'M6.4 19.6V6.4h6.4v13.2M8.6 9.6h2M8.6 12.6h2M8.6 15.6h2M16.6 16.8V6.6M16.6 6.6l-1.8 2.2M16.6 6.6l1.8 2.2',
    hood:    'M4.4 12.4h15.2l-2.8-4.6H7.2zM12 12.4v3.4M8.4 18.6c1-1.2 2.4-1.2 3.4 0M13.6 18.6c1-1.2 2.4-1.2 3.4 0',
    av:      'M5.4 4.6h13.2v14.8H5.4zM8.6 9.6a3.4 3.4 0 1 0 6.8 0 3.4 3.4 0 1 0-6.8 0M9.6 16.2h4.8',
    wifi:    'M12 18.4h.01M8.6 15a5.2 5.2 0 0 1 6.8 0M6 11.8a9 9 0 0 1 12 0M3.6 8.6a12.6 12.6 0 0 1 16.8 0',
    smart:   'M4.4 11.6 12 5.4l7.6 6.2M6.4 10.8v8.8h11.2v-8.8M12 13.4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6M12 10.4v1.4M8.8 13.8l1 .8M15.2 13.8l-1 .8',
    lux:     'M9 4.6h6l4.2 14.4H4.8zM12 4.6v14.4M6.6 14.6h10.8',
    cct:     'M12 7.2a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8M12 3.4v2.2M12 18.4v2.2M5.6 12H3.4M20.6 12h-2.2M7.4 7.4 5.9 5.9M18.1 18.1l-1.5-1.5M16.6 7.4l1.5-1.5M5.9 18.1l1.5-1.5',
    strip:   'M3.6 8.6h7.2v6.8h8.8M16.4 15.4a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 0 0-4.4 0M18.6 12.4v.8',
    dimmer:  'M12 5.4a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2M12 12l4.2-3.4M12 8.6v1.2M15.4 12h-1.2M8.6 12h1.2M12 15.4v-1.2'
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
        { n: '新风仿真',       ic: 'fresh',    st: 'live', pips: [1, 1], row: 1, col: 1, par: 0, href: 'airflow.html',
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
        { n: '油烟机排烟仿真', ic: 'hood',  st: 'live', pips: [1, 2], row: 0, col: 2, href: '老肖油烟机排烟仿真.html',
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
    wip:  { t: '施工中 · 程序已完成，待接入本站', go: '还在接线，先点亮别的天赋' },
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
        '<svg viewBox="0 0 24 24"><path d="' + ICON[t.ic] + '"/></svg>' +
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
          '<svg viewBox="0 0 24 24"><path d="' + G[tr.icon] + '"/></svg>' +
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