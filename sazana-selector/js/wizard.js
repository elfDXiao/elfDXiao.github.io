/**
 * wizard.js — TOTO Sazana（サザナ）整体浴室选型报价 UI（elf_D老肖的世界 风格，分步向导 + 报价单 两个标签页）
 *
 * 视图：选型向导（横向步骤条 + 选项区 + 右侧合计栏）/ 报价单（見積書）
 * 依赖：window.SAZANA_DATA、window.SAZANA.price、window.SAZANA.quote
 * 暴露：window.SAZANA.wizard = { init, renderAll, renderQuote, state }
 *
 * ★ 人民币说明规范：页面任何可见位置（rate-hint/sec-sub/报价单/复制清单）不显示计算系数或算式，
 *   仅描述「大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み」。
 *
 * 事件绑定架构（避免监听器累积卡死）：
 *   - bindDelegated()：对持久容器 #wizBody 的 change/click 委托，仅 init 绑定一次
 *   - bindStatic()：静态按钮（导航/tab/语言/汇率/客户表单/打印），仅 init 绑定一次
 *   - 渲染函数绝不 addEventListener 到持久元素
 */
(function () {
  'use strict';

  var Q = null;      // SAZANA.quote
  var P = null;
  var els = {};
  var LANG = 'both'; // both | zh | ja

  /* ---------------- 双语 ---------------- */
  function t(zh, ja) {
    if (LANG === 'ja') return esc(ja);
    if (LANG === 'zh') return esc(zh);
    return esc(zh) + ' <span class="ja">' + esc(ja) + '</span>';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function tp(zh, ja) {
    if (LANG === 'ja') return ja;
    if (LANG === 'zh') return zh;
    return zh + ' / ' + ja;
  }

  /* ---------------- 初始化（事件只绑一次） ---------------- */
  function init(data) {
    Q = window.SAZANA.quote;
    P = window.SAZANA.price;
    Q.init(data);
    els = {
      tabs: document.querySelector('#mainTabs'),
      views: document.querySelectorAll('.view-panel'),
      stepper: document.querySelector('#wizStepper'),
      tip: document.querySelector('#wizTip'),
      body: document.querySelector('#wizBody'),
      rate: document.querySelector('#rate'),
      sumType: document.querySelector('#sumType'),
      sumSize: document.querySelector('#sumSize'),
      sumDoor: document.querySelector('#sumDoor'),
      sumBase: document.querySelector('#sumBase'),
      sumOpt: document.querySelector('#sumOpt'),
      sumJPY: document.querySelector('#sumJPY'),
      sumInc: document.querySelector('#sumInc'),
      sumRMB: document.querySelector('#sumRMB'),
      btnPrev: document.querySelector('#btnPrev'),
      btnNext: document.querySelector('#btnNext'),
      btnFinish: document.querySelector('#btnFinish'),
      dlRow: document.querySelector('#dlRow'),
      sumToQuote: document.querySelector('#sumToQuote'),
      sumCopy: document.querySelector('#sumCopy'),
      btnPrint: document.querySelector('#btnPrint'),
      btnCsv: document.querySelector('#btnCsv'),
      btnBack: document.querySelector('#btnBack'),
      customerName: document.querySelector('#customerName'),
      customerPhone: document.querySelector('#customerPhone'),
      customerNote: document.querySelector('#customerNote'),
      quoteDoc: document.querySelector('#quoteDoc'),
      langBar: document.querySelector('#langBar'),
      navToggle: document.querySelector('#navToggle'),
      navLinks: document.querySelector('#navLinks'),
      year: document.querySelector('#year')
    };
    bindDelegated();
    bindStatic();
    if (els.year) els.year.textContent = new Date().getFullYear();
    renderAll();
  }

  /* ---------------- 委托事件（#wizBody，仅一次） ---------------- */
  function bindDelegated() {
    var body = els.body;

    body.addEventListener('change', function (e) {
      var tgt = e.target;
      if (tgt.hasAttribute('data-size')) { return; }

      // radio 维度（data-dim + data-code / data-basic / data-none）
      if (tgt.name && tgt.name.indexOf('dim_') === 0) {
        var dimId = tgt.name.replace('dim_', '');
        if (tgt.hasAttribute('data-code')) {
          var code = tgt.getAttribute('data-code');
          Q.state.sel[dimId] = code;
          if (dimId === 'wall') { delete Q.state.sub.wall_pattern; delete Q.state.sub.wall_surround; delete Q.state.sub.wall_surround_pattern; }
          Q.autoFix(dimId, code);
        } else if (tgt.hasAttribute('data-basic')) {
          var vb = Q.virtualBasicOf(Q.dim(dimId));
          if (vb) Q.state.sel[dimId] = vb.code;
        } else if (tgt.hasAttribute('data-none')) {
          delete Q.state.sel[dimId];
        }
        renderStep(); renderSummary();
        return;
      }

      // 壁柄花纹（第二段：4面同色クラス柄 / アクセント柄）
      if (tgt.hasAttribute('data-wall-pattern')) {
        var pcode = tgt.getAttribute('data-wall-pattern');
        if (pcode) Q.state.sub.wall_pattern = pcode;
        else delete Q.state.sub.wall_pattern;
        renderStep(); renderSummary();
        return;
      }
      // 墙面三模式（4SAME/FRONT_ACCENT/SIDE_ACCENT）切换：清 wall 选项与第二段
      if (tgt.hasAttribute('data-wall-plan')) {
        var plan = tgt.getAttribute('data-wall-plan');
        Q.state.sub.wall_plan = plan;
        delete Q.state.sel.wall;
        delete Q.state.sub.wall_pattern;
        delete Q.state.sub.wall_surround;
        delete Q.state.sub.wall_surround_pattern;
        renderStep(); renderSummary();
        return;
      }
      // 壁柄周辺グレード（アクセントプラン）
      if (tgt.hasAttribute('data-wall-surround')) {
        var scode = tgt.getAttribute('data-wall-surround');
        if (scode) { Q.state.sub.wall_surround = scode; delete Q.state.sub.wall_surround_pattern; }
        else delete Q.state.sub.wall_surround;
        renderStep(); renderSummary();
        return;
      }
      // 壁柄周辺柄
      if (tgt.hasAttribute('data-wall-surround-pattern')) {
        var spcode = tgt.getAttribute('data-wall-surround-pattern');
        if (spcode) Q.state.sub.wall_surround_pattern = spcode;
        else delete Q.state.sub.wall_surround_pattern;
        renderStep(); renderSummary();
        return;
      }

      // multi 维度（复选框）
      if (tgt.name && tgt.name.indexOf('multi_') === 0) {
        var mid = tgt.name.replace('multi_', '');
        var mcode = tgt.getAttribute('data-code');
        if (!Q.state.multi[mid]) Q.state.multi[mid] = {};
        if (tgt.checked) { Q.state.multi[mid][mcode] = true; Q.autoFix(mid, mcode); }
        else { delete Q.state.multi[mid][mcode]; }
        renderStep(); renderSummary();
        return;
      }
    });

    body.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('[data-size]') : null;
      if (card) {
        Q.setSize(card.getAttribute('data-size'));
        renderStep(); renderSummary();
      }
    });
  }

  /* ---------------- 静态事件（仅一次） ---------------- */
  function bindStatic() {
    var lastStep = Q.STEPS.length - 1;
    if (els.btnPrev) els.btnPrev.addEventListener('click', function () { Q.state.step = Math.max(0, Q.state.step - 1); renderAll(); });
    if (els.btnNext) els.btnNext.addEventListener('click', function () { if (Q.state.step < lastStep) { Q.state.step += 1; renderAll(); } });
    if (els.btnFinish) els.btnFinish.addEventListener('click', function () { goTab('quote'); });
    if (els.sumToQuote) els.sumToQuote.addEventListener('click', function () { goTab('quote'); });
    if (els.sumCopy) els.sumCopy.addEventListener('click', copyList);
    if (els.btnBack) els.btnBack.addEventListener('click', function () { goTab('wizard'); });
    if (els.btnPrint) els.btnPrint.addEventListener('click', function () { window.print(); });
    if (els.btnCsv) els.btnCsv.addEventListener('click', exportCsv);

    // 横向步骤条跳转（持久元素，仅绑一次）
    if (els.stepper) els.stepper.addEventListener('click', function (e) {
      var b = e.target.closest('.wstep');
      if (!b) return;
      Q.state.step = Number(b.getAttribute('data-step'));
      renderAll();
    });

    // 顶部 tab
    if (els.tabs) els.tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.tab-btn');
      if (!b) return;
      goTab(b.getAttribute('data-view'));
    });

    // 语言
    if (els.langBar) els.langBar.addEventListener('click', function (e) {
      var b = e.target.closest('.lang-btn');
      if (!b) return;
      LANG = b.getAttribute('data-lang');
      els.langBar.querySelectorAll('.lang-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
      renderAll();
      renderQuote();
    });

    // 汇率
    if (els.rate) els.rate.addEventListener('input', function () {
      Q.setRate(this.value);
      renderSummary();
      renderQuote();
    });

    // 客户表单
    if (els.customerName) els.customerName.addEventListener('input', function () { Q.setQuoteHead('customer', this.value); renderQuote(); });
    if (els.customerPhone) els.customerPhone.addEventListener('input', function () { Q.setQuoteHead('phone', this.value); renderQuote(); });
    if (els.customerNote) els.customerNote.addEventListener('input', function () { Q.setQuoteHead('remark', this.value); renderQuote(); });

    // 移动端导航
    if (els.navToggle && els.navLinks) {
      els.navToggle.addEventListener('click', function () {
        var open = els.navLinks.classList.toggle('open');
        els.navToggle.classList.toggle('open', open);
        els.navToggle.setAttribute('aria-expanded', open);
      });
    }
  }

  /* ---------------- tab 切换 ---------------- */
  function goTab(name) {
    if (els.tabs) els.tabs.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-view') === name);
    });
    els.views.forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
    if (name === 'quote') renderQuote();
    try { window.scrollTo(0, 0); } catch (e) { /* jsdom 无 scrollTo */ }
  }

  /* ---------------- 主渲染 ---------------- */
  function renderAll() {
    renderStepper();
    renderStep();
    renderSummary();
  }

  function stepState(n) {
    if (n === 0) return true;
    var dims = Q.DIMS.filter(function (d) { return d.step === n; });
    return dims.some(function (d) {
      if (d.kind === 'multi') {
        var m = Q.state.multi[d.id];
        return m && Object.keys(m).some(function (k) { return m[k]; });
      }
      return Q.state.sel[d.id] != null;
    });
  }

  function renderStepper() {
    if (!els.stepper) return;
    var cur = Q.state.step;
    var html = Q.STEPS.map(function (s) {
      var cls = 'wstep' + (s.n === cur ? ' active' : '') + (stepState(s.n) ? ' done' : '');
      var label = s.n === 0 ? t('基本', '基本') : s.n;
      return '<button type="button" class="' + cls + '" data-step="' + s.n + '" title="' +
        esc(s.titleZh + ' / ' + s.title) + '">' + label + '</button>';
    }).join('');
    els.stepper.innerHTML = html;
  }

  function renderStep() {
    var st = Q.STEPS[Q.state.step];
    var total = Q.STEPS.length;
    var html = '<div class="wiz-step-head">' +
      '<span class="wiz-step-no">' + t('步骤 / STEP', 'ステップ') + ' ' + st.n + ' / ' + total + '</span>' +
      '<h3>' + (st.n === 0 ? t('尺寸与型号', 'サイズ・タイプ') : t(st.titleZh, st.title)) + '</h3>' +
      '<p class="wiz-note">' + esc(st.note) + '</p></div>';

    if (st.n === 0) {
      html += step0Info();
    } else {
      var dims = Q.DIMS.filter(function (d) { return d.step === st.n; });
      dims.forEach(function (d) { html += dimensionHtml(d); });
      if (!dims.length) html += '<p class="muted">' + t('该步骤暂无选择项。', 'このステップに選択項目はありません。') + '</p>';
    }
    els.body.innerHTML = html;

    var lastStep = Q.STEPS.length - 1;
    if (els.btnPrev) els.btnPrev.hidden = (st.n === 0);
    if (els.btnNext) els.btnNext.hidden = (st.n === lastStep);
    if (els.btnFinish) els.btnFinish.hidden = (st.n !== lastStep);
    if (els.dlRow) els.dlRow.hidden = (st.n !== lastStep);
  }

  /* 步骤 0：尺寸卡片 + タイプ选项（套装价 = タイプ×サイズ矩阵） */
  function step0Info() {
    var html = '<div class="opt-block" style="margin-bottom:0;">' +
      '<div class="dim-title">' + t('本体価格（税抜・タイプ×サイズ・組立費別）', '本体価格（税抜・タイプ×サイズ・組立費別）') + '</div>' +
      '<div class="size-grid">';
    Q.cat('size').options.forEach(function (o) {
      var on = o.code === Q.state.size ? ' on' : '';
      var byType = o.pricesByType ? o.pricesByType[Q.typeCode()] : null;
      var price = (byType && typeof byType === 'object') ? byType[o.code] : byType;
      var priceTxt, hint = '';
      if (typeof price === 'number') {
        priceTxt = P.yen(price);
      } else {
        var alt = Q.sizeAltPrice(o.code);
        if (alt) {
          priceTxt = P.yen(alt.price);
          hint = '<span class="size-alt">' + esc(tp('当前型号无 ' + Q.typeCode() + 'タイプ，最低可用 ' + alt.type + 'タイプ', 'このタイプには設定なし、最低 ' + alt.type + ' タイプ')) + '</span>';
        } else {
          priceTxt = tp('无该型号', '—');
        }
      }
      html += '<div class="size-card' + on + '" data-size="' + esc(o.code) + '">' +
        '<div class="size-code">' + esc(o.code) + '</div>' +
        '<div class="size-name">' + esc(o.name_zh || o.name_ja) + '</div>' +
        '<div class="size-price">' + priceTxt + '</div>' + hint + '</div>';
    });
    html += '</div>';
    html += '<p class="base-meta">※ ' + t('1620 Tタイプ 本体価格 ¥1,449,000（税抜）；F タイプ仅 1620/1616/1618、N タイプ无 1220', '1620 Tタイプ 本体価格 ¥1,449,000（税抜）；F タイプは 1620/1616/1618 のみ、N タイプは 1220 なし') + '</p>';
    html += '</div>';

    var d = Q.dim('type');
    html += '<div class="opt-block" data-dim="type">' +
      '<div class="dim-title">' + t(d.titleZh, d.titleJa) + '（' + tp('决定本体价', '本体価格を決定') + '）</div>';
    html += '<div class="opt-grid">';
    Q.codesOf(d).forEach(function (code) {
      var o = Q.opt('type', code);
      if (!o) return;
      html += typeLabel(d, code, o);
    });
    html += '</div></div>';

    // 地域区分（step 0 的其他维度）
    var rd = Q.dim('region');
    if (rd) html += dimensionHtml(rd);

    return html;
  }

  /* タイプ 选项卡（带基本配置快照） */
  function typeLabel(d, code, o) {
    var sel = Q.typeCode() === code ? ' on' : '';
    var dis = Q.disabledReason(d.id, code);
    var disCls = dis ? ' disabled' : '';
    var note = '';
    if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
    return '<label class="opt-card' + sel + disCls + '">' +
      '<input type="radio" name="dim_' + d.id + '" data-code="' + esc(code) + '"' +
      (sel ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
      '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
      '<span class="opt-code">' + esc(code) + 'タイプ</span>' +
      (o.snapshot ? '<span class="opt-dis" style="color:var(--ink-3);">' + esc(o.snapshot) + '</span>' : '') +
      note + '</label>';
  }

  /* ---------------- 维度渲染 ---------------- */
  function dimensionHtml(d) {
    var html = '<div class="opt-block" data-dim="' + d.id + '">' +
      '<div class="dim-title">' + t(d.titleZh, d.titleJa) + '</div>';
    switch (d.kind) {
      case 'radio': html += radioHtml(d); break;
      case 'multi': html += multiHtml(d); break;
      default: break;
    }
    // 壁柄：花纹级第二段选择
    if (d.id === 'wall') html += wallPatternHtml(d);
    html += '</div>';
    return html;
  }

  /** 壁柄花纹第二段（4 类：4面同色柄信息 / クラス柄 / アクセント×周辺 / 周辺柄） */
  function wallPatternHtml(d) {
    var wallCode = Q.state.sel.wall;
    if (!wallCode) return '';
    var html = '';
    var cur = Q.state.sub.wall_pattern;
    var curSg = Q.state.sub.wall_surround;
    var curSp = Q.state.sub.wall_surround_pattern;

    // 0) 4SAME 模式：柄已在第一段直接选择（39 柄卡片），仅 Premium 镜面柄显示确认信息
    if (Q.wallPlan() === '4SAME') {
      if (wallCode === 'EGAA1' || wallCode === 'EGAC3' || wallCode === 'EGAH6' || wallCode === 'EGAW4') {
        var o4 = Q.opt('wall', wallCode);
        if (o4) {
          html += '<p class="muted" style="margin-top:10px;">' + t('壁柄：' + (o4.name_zh || o4.name_ja || wallCode), '壁柄：' + (o4.name_ja || wallCode)) + ' ／ 品番 ' + wallCode + '</p>';
        }
      }
      return html;
    }

    // 1) 4面同色柄（EGAA1 等）：直接显示柄信息（价格已含），无 chips
    if (wallCode === 'EGAA1' || wallCode === 'EGAC3' || wallCode === 'EGAH6' || wallCode === 'EGAW4') {
      var o = Q.opt('wall', wallCode);
      if (o) {
        html += '<p class="muted" style="margin-top:10px;">' + t('壁柄：' + (o.name_zh || o.name_ja || wallCode), '壁柄：' + (o.name_ja || wallCode)) + ' ／ 品番 ' + wallCode + '</p>';
      }
      return html;
    }

    // 2) アクセントプラン（ACC_*）：跳色柄（先选，按模式方向 code_front/code_side）→ 周辺グレード → 周辺柄（四面墙板）
    if (Q.WALL_ACC_GRADE[wallCode]) {
      var accGrade = Q.WALL_ACC_GRADE[wallCode];
      var accList = Q.sazanaWallPatterns().filter(function (p) { return p.class === accGrade; });
      var dirCode = function (p) { return Q.wallPlan() === 'SIDE_ACCENT' ? (p.code_side || p.code_front) : (p.code_front || p.code_side); };
      // 跳色柄 chips（先选）
      html += '<div class="dim-group-title">' + t('跳色花纹（先选）/ アクセント柄（先に選択）', 'アクセント柄（先に選択）') + '</div>';
      html += '<div class="sub-row" style="margin-top:4px;"><span class="dim-sub-title">' + t('跳色面板花纹（' + (Q.wallPlan() === 'SIDE_ACCENT' ? '浴槽横' : '器具面') + '）：', 'アクセントパネル柄：') + '</span>';
      accList.forEach(function (p) {
        var dc = dirCode(p);
        var on = cur === dc;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
          '<input type="radio" name="wall_pattern" data-wall-pattern="' + esc(dc) + '"' + (on ? ' checked' : '') + '>' +
          esc(p.name_zh || p.name_ja || dc) + ' <span class="ja">' + esc(p.name_ja || '') + '</span>' +
          (p.finish ? '（' + esc(p.finish) + '）' : '') +
          (p.lightingLimited ? ' ⚠照明限定' : '') + '</label>';
      });
      html += '</div>';
      // 周辺グレード chips（四面墙板等级）
      html += '<div class="dim-group-title">' + t('四面墙板等级 / 周辺グレード', '周辺グレード') + '</div>';
      html += '<div class="sub-row" style="margin-top:4px;"><span class="dim-sub-title">' + t('周辺グレード / 周边等级：', '周辺グレード：') + '</span>';
      ['周辺ハイグレードⅡ', '周辺ハイグレードⅠ', '周辺ベーシックグレード'].forEach(function (g2) {
        var o2 = Q.opt('wall', wallCode);
        var price = (o2 && o2.priceBySurround && o2.priceBySurround[g2] != null) ? P.fmtDiff(o2.priceBySurround[g2]) : '—';
        var on2 = curSg === g2;
        var gZh = { '周辺ハイグレードⅡ': '高级Ⅱ', '周辺ハイグレードⅠ': '高级Ⅰ', '周辺ベーシックグレード': '基础' }[g2] || g2;
        var gJa = g2.replace('周辺', '');
        html += '<label class="sub-chip' + (on2 ? ' on' : '') + '">' +
          '<input type="radio" name="wall_surround" data-wall-surround="' + esc(g2) + '"' + (on2 ? ' checked' : '') + '>' +
          esc(gZh) + ' <span class="ja">' + esc(gJa) + '</span> <b>' + esc(price) + '</b></label>';
      });
      html += '</div>';
      // 周辺柄 chips（四面墙板色，按周辺グレード）
      if (curSg) {
        var sgKey = curSg.replace('周辺', '');
        var surList = Q.sazanaSurroundPatterns().filter(function (p) { return p.class === sgKey; });
        html += '<div class="dim-group-title">' + t('四面墙板色 / 周辺パネル色', '周辺パネル色') + '</div>';
        html += '<div class="sub-row" style="margin-top:4px;"><span class="dim-sub-title">' + t('周辺パネル柄 / 周边面板花纹：', '周辺パネル柄：') + '</span>';
        surList.forEach(function (p) {
          var on3 = curSp === p.code;
          html += '<label class="sub-chip' + (on3 ? ' on' : '') + '">' +
            '<input type="radio" name="wall_surround_pattern" data-wall-surround-pattern="' + esc(p.code) + '"' + (on3 ? ' checked' : '') + '>' +
            esc(p.name_zh || p.name_ja || p.code) + ' <span class="ja">' + esc(p.name_ja || '') + '</span></label>';
        });
        html += '</div>';
      }
      // 品番提示（按方向 code_front/code_side）
      if (cur && curSg) {
        var ap = Q.sazanaAccentPattern(cur);
        var sp = curSp ? Q.sazanaSurroundPattern(curSp) : null;
        var pn = (ap ? dirCode(ap) : cur) + (sp ? '+' + sp.code : '');
        html += '<p class="muted" style="margin-top:6px;">' + t('品番：' + pn, '品番：' + pn) + '</p>';
      }
      return html;
    }

    // 3) SHUHEN_*：周辺柄 chips
    if (Q.WALL_SHUHEN_GRADE[wallCode]) {
      var shGrade = Q.WALL_SHUHEN_GRADE[wallCode].replace('周辺', '');
      var shList = Q.sazanaSurroundPatterns().filter(function (p) { return p.class === shGrade; });
      html += '<div class="sub-row" style="margin-top:10px;"><span class="dim-sub-title">' + t('周辺パネル柄 / 周边面板花纹：', '周辺パネル柄：') + '</span>';
      shList.forEach(function (p) {
        var on = cur === p.code;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
          '<input type="radio" name="wall_pattern" data-wall-pattern="' + esc(p.code) + '"' + (on ? ' checked' : '') + '>' +
          esc(p.name_zh || p.name_ja || p.code) + ' <span class="ja">' + esc(p.name_ja || '') + '</span></label>';
      });
      html += '</div>';
      return html;
    }

    // 4) HⅡ/HⅠ/BASIC クラス：note 解析 4面同色柄 chips
    var fourList = Q.fourSamePatterns(wallCode);
    if (fourList.length) {
      html += '<div class="sub-row" style="margin-top:10px;"><span class="dim-sub-title">' + t('壁柄（' + fourList.length + ' 柄）：', '壁柄（' + fourList.length + ' 柄）：') + '</span>';
      fourList.forEach(function (p) {
        var on = cur === p.code;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
          '<input type="radio" name="wall_pattern" data-wall-pattern="' + esc(p.code) + '"' + (on ? ' checked' : '') + '>' +
          esc(p.name_zh || p.name_ja || p.code) + ' <span class="ja">' + esc(p.name_ja || '') + '</span> <b>' + esc(p.code) + '</b></label>';
      });
      html += '</div>';
      if (cur) html += '<p class="muted" style="margin-top:6px;">' + t('品番：' + cur, '品番：' + cur) + '</p>';
    }
    return html;
  }

  function optPriceClass(diff) {
    if (diff == null || isNaN(diff)) return '';
    if (diff > 0) return ' plus';
    if (diff < 0) return ' minus';
    return ' ok';
  }

  function priceNum(d, code, o) {
    if (Q.isVirtualBasic(code)) return 0;
    var v = P.priceFor(o, Q.typeCode(), Q.sizeCode());
    return (typeof v === 'number') ? v : null;
  }

  function optionLabel(d, code, o) {
    var sel = Q.state.sel[d.id] === code ? ' on' : '';
    var dis = Q.disabledReason(d.id, code);
    var disCls = dis ? ' disabled' : '';
    var s = P.optionPriceSummary(o, Q.typeCode(), Q.sizeCode());
    var price = (s.type === 'basic') ? tp('基本', '基本仕様') : s.text;
    var note = '';
    if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
    return '<label class="opt-card' + sel + disCls + '">' +
      '<input type="radio" name="dim_' + d.id + '" data-code="' + esc(code) + '"' +
      (sel ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
      '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
      '<span class="opt-price' + optPriceClass(priceNum(d, code, o)) + '">' + esc(price) + '</span>' +
      note + '</label>';
  }

  /** なし / 基本 虚拟项 chips */
  function pseudoChips(d) {
    var html = '';
    var vb = Q.virtualBasicOf(d);
    if (vb) {
      var on = Q.state.sel[d.id] === vb.code;
      var dis = Q.disabledReason(d.id, vb.code);
      html += '<label class="sub-chip' + (on ? ' on' : '') + (dis ? ' dis' : '') + '">' +
        '<input type="radio" name="dim_' + d.id + '" data-basic="1"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
        esc(vb.nameZh) + '</label>';
    }
    if (d.none) {
      var on2 = !Q.state.sel[d.id];
      html += '<label class="sub-chip' + (on2 ? ' on' : '') + '">' +
        '<input type="radio" name="dim_' + d.id + '" data-none="1"' + (on2 ? ' checked' : '') + '>' +
        t('无', 'なし') + '</label>';
    }
    return html;
  }

  function radioHtml(d) {
    // 壁柄（wall）：三模式（4SAME 四面同色 / FRONT_ACCENT 正面跳色 / SIDE_ACCENT 浴缸侧跳色）
    if (d.id === 'wall') {
      var plan = Q.wallPlan();
      var typeCode = Q.typeCode();
      var html = '';
      // 模式 chips（三模式，双语；4SAME 仅 P/T タイプ可选）
      html += '<div class="sub-row" style="margin-top:-2px;"><span class="dim-sub-title">' + t('墙面模式 / 配色方案：', '壁面モード：') + '</span>';
      [['4SAME', '四面同色', '4面同色'],
        ['FRONT_ACCENT', '跳色器具面侧', '正面アクセント'],
        ['SIDE_ACCENT', '跳色浴缸侧', '浴槽横アクセント']].forEach(function (m) {
        var on = plan === m[0];
        var dis = (m[0] === '4SAME' && (typeCode === 'S' || typeCode === 'N' || typeCode === 'F'));
        html += '<label class="sub-chip' + (on ? ' on' : '') + (dis ? ' dis' : '') + '"' + (dis ? ' title="' + esc('四面同色仅 P/T タイプ可选（S/N/F 请选跳色）') + '"' : '') + '>' +
          '<input type="radio" name="wall_plan" data-wall-plan="' + m[0] + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
          esc(m[1]) + ' <span class="ja">' + esc(m[2]) + '</span></label>';
      });
      html += '</div>';
      if (plan === '4SAME') {
        // 四面同色：39 柄按グレード分组渲染（第一段直接选柄）
        var fours = Q.sazanaFourSame();
        var groups = {};
        fours.forEach(function (f) { (groups[f.class] = groups[f.class] || []).push(f); });
        var gradeNames = {
          'プレミアムグレード': ['プレミアム', '高端'],
          'ハイグレードⅡ': ['ハイグレードⅡ', '高级Ⅱ'],
          'ハイグレードⅠ': ['ハイグレードⅠ', '高级Ⅰ'],
          'ベーシックグレード': ['ベーシック', '基础']
        };
        ['プレミアムグレード', 'ハイグレードⅡ', 'ハイグレードⅠ', 'ベーシックグレード'].forEach(function (g) {
          var list = groups[g] || [];
          if (!list.length) return;
          var gn = gradeNames[g] || [g, g];
          html += '<div class="dim-group-title">' + t('四面同色·' + gn[1] + ' / ' + gn[0] + '（' + list.length + ' 柄）', gn[0] + '柄（' + list.length + ' 種）') + '</div>';
          html += '<div class="opt-grid">';
          list.forEach(function (f) { html += optionLabel(d, f.code, f); });
          html += '</div>';
        });
      } else {
        // 跳色：先选跳色グレード（ACC_* 4 档）→ 第二段选柄（wallPatternHtml）
        var accs = (Q.cat('wall') && Q.cat('wall').options.filter(function (o) { return String(o.code).indexOf('ACC_') === 0; })) || [];
        var accTitle = plan === 'FRONT_ACCENT' ? '跳色グレード（器具面側）' : '跳色グレード（浴槽側）';
        html += '<p class="muted" style="margin:-2px 0 8px;">' +
          t('先选跳色花纹，再选四面墙板色（同页两段选择）', '先にアクセント柄、次に周辺パネル色を選択してください（同ページで2段階選択）') + '</p>';
        html += '<div class="dim-group-title">' + t(accTitle + ' / ' + (plan === 'FRONT_ACCENT' ? '正面アクセント' : '浴槽横アクセント'), plan === 'FRONT_ACCENT' ? '正面アクセント' : '浴槽横アクセント') + '</div>';
        html += '<div class="opt-grid">';
        accs.forEach(function (o) { html += optionLabel(d, o.code, o); });
        html += '</div>';
      }
      var chips = pseudoChips(d);
      if (chips) html += '<div class="sub-row">' + chips + '</div>';
      return html;
    }
    var html2 = '<div class="opt-grid">';
    var codes2 = Q.codesOf(d);
    codes2.forEach(function (code) {
      var o = Q.opt(d.id, code);
      if (!o) return;
      html2 += optionLabel(d, code, o);
    });
    html2 += '</div>';
    var chips2 = pseudoChips(d);
    if (chips2) html2 += '<div class="sub-row">' + chips2 + '</div>';
    return html2;
  }

  /** multi：复选框行（单品/可叠加项） */
  function multiHtml(d) {
    var html = '<div class="opt-grid">';
    var codes = Q.codesOf(d);
    codes.forEach(function (code) {
      var o = Q.opt(d.id, code);
      if (!o) return;
      var on = Q.state.multi[d.id] && Q.state.multi[d.id][code];
      var dis = Q.disabledReason(d.id, code);
      var disCls = dis ? ' disabled' : '';
      var s = P.optionPriceSummary(o, Q.typeCode(), Q.sizeCode());
      var price = (s.type === 'basic') ? tp('基本', '基本仕様') : s.text;
      var note = '';
      if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
      html += '<label class="opt-card' + (on ? ' on' : '') + disCls + '">' +
        '<input type="checkbox" name="multi_' + d.id + '" data-code="' + esc(code) + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
        '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
        '<span class="opt-price' + optPriceClass(priceNum(d, code, o)) + '">' + esc(price) + '</span>' +
        note + '</label>';
    });
    html += '</div>';
    return html;
  }

  /* ---------------- 合计栏 ---------------- */
  function renderSummary() {
    var r = Q.computeQuote();
    var optTotal = r.totalEx - r.basePrice;
    if (els.sumType) els.sumType.textContent = r.type + 'タイプ';
    if (els.sumSize) els.sumSize.textContent = r.size;
    if (els.sumDoor) els.sumDoor.textContent = r.doorPos;
    if (els.sumBase) els.sumBase.textContent = P.yen(r.basePrice);
    if (els.sumOpt) els.sumOpt.textContent = optTotal !== 0 ? P.yen(optTotal) : '—';
    if (els.sumJPY) els.sumJPY.textContent = P.yen(r.totalEx);
    if (els.sumInc) els.sumInc.textContent = P.yen(r.totalInc);
    if (els.sumRMB) {
      els.sumRMB.textContent = r.rmbAllIn != null ? '¥' + Number(r.rmbAllIn).toLocaleString() : '—';
      els.sumRMB.parentNode.classList.toggle('has-rmb', r.rmbAllIn != null);
    }
  }

  /* ---------------- 报价单（見積書） ---------------- */
  function renderQuote() {
    if (!els.quoteDoc) return;
    var r = Q.computeQuote();
    var head = Q.state.quoteHead;
    var rate = Q.getRate();
    var html = '';

    html += '<div class="doc-header">' +
      '<div class="doc-brand">elf_D老肖的世界<span>DESIGN STUDIO</span></div>' +
      '<h1>' + t('報 价 单', '見 積 書') + '</h1>' +
      '<div class="doc-sub">TOTO Sazana（サザナ）／ 整体浴室</div>' +
      '<div class="doc-meta">' +
      '<span>' + t('日期 / 日付：', '日付：') + esc(head.date || dateNow()) + '</span>' +
      '<span>' + t('尺寸 / サイズ：', 'サイズ：') + esc(r.size) + '</span>' +
      '<span>' + t('型号 / タイプ：', 'タイプ：') + esc(r.type) + '</span>' +
      '<span>' + t('门位 / ドア位置：', 'ドア位置：') + esc(r.doorPos) + '</span>' +
      '<span>' + t('品番 / 品番：', '品番：') + esc(Q.productNo()) + '</span>' +
      (head.customer ? '<span>' + t('客户 / お客様：', 'お客様：') + esc(head.customer) + '</span>' : '') +
      (head.phone ? '<span>' + t('电话 / TEL：', 'TEL：') + esc(head.phone) + '</span>' : '') +
      '</div></div>';

    var byStep = {};
    r.lines.forEach(function (l) { (byStep[l.step] = byStep[l.step] || []).push(l); });
    Object.keys(byStep).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (s) {
      var lines = byStep[s];
      var zh = lines[0].stepZh, ja = lines[0].stepJa;
      html += '<div class="doc-section">' +
        '<div class="doc-sec-title"><span>' + t('STEP ' + s, 'STEP ' + s) + '</span>' + (s === '0' ? t('尺寸与型号', 'サイズ・タイプ') : t(zh, ja)) + '</div>' +
        '<table class="quote-table"><thead><tr>' +
        '<th>' + t('品名', '品名') + '</th><th>' + t('記号', '記号') + '</th><th>' + t('型番', '型番') + '</th><th>' + t('仕様', '仕様') + '</th><th class="num">' + t('金额(税抜)', '金額(税抜)') + '</th>' +
        '</tr></thead><tbody>';
      lines.forEach(function (l) {
        var nameCell = l.base
          ? '<b>' + esc(l.nameZh) + '</b><div class="ja">' + esc(l.nameJa) + '</div>'
          : esc(l.nameZh) + '<div class="ja">' + esc(l.nameJa) + '</div>';
        var amount = l.base ? P.yen(r.basePrice) : (l.diff > 0 ? '＋' : l.diff < 0 ? '－' : '') + P.yen(Math.abs(l.diff));
        html += '<tr>' +
          '<td>' + nameCell + '</td>' +
          '<td>' + esc(l.code || '') + '</td>' +
          '<td>' + esc(l.model || '') + '</td>' +
          '<td>' + esc(l.extra || '') + '</td>' +
          '<td class="num">' + amount + '</td></tr>';
      });
      html += '</tbody></table></div>';
    });

    html += '<div class="doc-section">' +
      '<div class="doc-sec-title"><span>SUM</span>' + t('合计 / 合計', '合計') + '</div>' +
      '<div class="doc-row big"><div class="doc-q">' + t('日元合计（税抜）/ 本体価格（税抜）', '本体価格（税抜）') + '</div><div class="doc-a">' + P.yen(r.totalEx) + '</div></div>' +
      '<div class="doc-row big"><div class="doc-q">' + t('消費税（10%）/ 消费税（10%）', '消費税（10%）') + '</div><div class="doc-a">' + P.yen(r.tax) + '</div></div>' +
      '<div class="doc-row big"><div class="doc-q">' + t('日元合计（税込）/ 税込合計', '税込合計') + '</div><div class="doc-a">' + P.yen(r.totalInc) + '</div></div>' +
      '<div class="doc-row big"><div class="doc-q">' + t('合計（漢数字大写）', '合計（漢数字）') + '</div><div class="doc-a">' + esc(Q.kanjiYen(r.totalInc)) + '</div></div>' +
      '<div class="doc-row big accent"><div class="doc-q">' + t('大陆地区价格（人民币 · 已含安装人工费）/ 中国本土価格（据付人工費込み）', '中国本土価格（据付人工費込み）') + '</div>' +
      '<div class="doc-a">' + (r.rmbAllIn != null ? '¥' + Number(r.rmbAllIn).toLocaleString() : t('请输入汇率', '為替を入力してください')) + '</div></div>' +
      '</div>';

    if (r.unknown.length) {
      html += '<div class="doc-section"><div class="doc-sec-title"><span>⚠</span>' + t('未计价项 / 未計上', '未計上') + '</div>' +
        '<div class="doc-row"><div class="doc-q">' + t('以下项价格未标注/需查表，未计入合计：', '以下の項目は価格未記載のため合計に含まれません：') +
        r.unknown.map(function (u) { return esc(u.name); }).join('、') + '</div></div></div>';
    }

    html += '<div class="doc-footer">' +
      '<p>' + t('※ 所示价格为不含税参考价，最终以 TOTO 正式見積書为准', '※ 表示価格は税抜きの参考価格です。正式な見積はお見積書でご確認ください') + '</p>' +
      '<p>※ ' + t('基本セット価格は取付・設置費別（不含安装费）', '基本セット価格（取付・設置費別）') + '</p>' +
      '<p>※ ' + t('大陆地区价格已含安装人工费 / 中国本土価格は据付人工費込み', '中国本土価格は据付人工費込み') + '</p>' +
      (head.remark ? '<p>' + t('備考：' + head.remark, '備考：' + head.remark) + '</p>' : '') +
      '</div>';

    els.quoteDoc.innerHTML = html;
  }

  function dateNow() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------------- 复制选型清单 ---------------- */
  function copyList() {
    var r = Q.computeQuote();
    var lines = ['【TOTO Sazana（サザナ）見積（报价）选型清单】'];
    lines.push('品番：' + Q.productNo());
    lines.push('尺寸：' + r.size + ' ｜ 型号：' + r.type + 'タイプ ｜ 门位置：' + r.doorPos);
    lines.push('—'.repeat(30));
    r.lines.forEach(function (l) {
      lines.push((l.base ? '套装价  ' : '        ') + l.nameZh + (l.extra ? '（' + l.extra + '）' : '') + (l.base ? '' : '  ' + P.fmtDiff(l.diff)));
    });
    lines.push('—'.repeat(30));
    lines.push('日元合计（税抜）：' + P.yen(r.totalEx));
    lines.push('日元合计（税込）：' + P.yen(r.totalInc));
    if (r.rmbAllIn != null) lines.push('大陆地区价格（人民币 · 已含安装人工费）：¥' + Number(r.rmbAllIn).toLocaleString());
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash('已复制到剪贴板'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      flash('已复制到剪贴板');
    }
  }

  function flash(msg) {
    if (!els.tip) return;
    els.tip.textContent = msg;
  }

  /* ---------------- CSV 导出 ---------------- */
  function exportCsv() {
    var csv = Q.toCSV();
    if (csv == null) return;
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sazana-quote.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.SAZANA = window.SAZANA || {};
  window.SAZANA.wizard = {
    init: init,
    renderAll: renderAll,
    renderQuote: renderQuote,
    renderSummary: renderSummary,
    setLang: function (l) { if (l === 'zh' || l === 'ja' || l === 'both') LANG = l; renderAll(); renderQuote(); },
    state: { get lang() { return LANG; } }
  };
})();
