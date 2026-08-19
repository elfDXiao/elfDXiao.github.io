/**
 * wizard.js — Cleanup STEDIA 系统厨房选型报价 UI（elf_D老肖的世界 风格，分步向导 + 报价单两个标签页）
 *
 * 视图：选型向导（横向步骤条 + 选项区 + 右侧合计栏）/ 报价单（見積書）
 * 依赖：window.KITCHEN_DATA、window.KITCHEN.price、window.KITCHEN.quote
 * 暴露：window.KITCHEN.wizard = { init, renderAll, renderQuote, state }
 *
 * 事件绑定架构（避免监听器累积卡死）：
 *   - bindDelegated()：对持久容器 #wizBody 的 change 委托，仅 init 绑定一次
 *   - bindStatic()：静态按钮（导航/tab/语言/汇率/客户表单/打印），仅 init 绑定一次
 *   - 渲染函数绝不 addEventListener 到持久元素
 *
 * 厨房版说明：
 *   - 步数完全由 Q.STEPS.length 动态计算（严禁硬编码）。
 *   - kind：layout/plan/size/depth/grade（基本价维）、door（扉カラー+取手）、
 *     faucet（水栓+地域）、peripheral（周辺収納+间口/奥行）、other（その他+30/45cm）、radio（通用）。
 *   - 基本价 = f(layout, plan, width, depth, grade)，切换任一维实时重算合计栏。
 */
(function () {
  'use strict';

  var Q = null;      // KITCHEN.quote
  var P = null;      // KITCHEN.price
  var DATA = null;   // KITCHEN_DATA
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
    Q = window.KITCHEN.quote;
    P = window.KITCHEN.price;
    DATA = data;
    Q.init(data);
    els = {
      tabs: document.querySelector('#mainTabs'),
      views: document.querySelectorAll('.view-panel'),
      stepper: document.querySelector('#wizStepper'),
      tip: document.querySelector('#wizTip'),
      body: document.querySelector('#wizBody'),
      rate: document.querySelector('#rate'),
      sumType: document.querySelector('#sumType'),
      sumLayout: document.querySelector('#sumLayout'),
      sumPlan: document.querySelector('#sumPlan'),
      sumSize: document.querySelector('#sumSize'),
      sumDepth: document.querySelector('#sumDepth'),
      sumDepthRow: document.querySelector('#sumDepthRow'),
      sumGrade: document.querySelector('#sumGrade'),
      sumWallWidth: document.querySelector('#sumWallWidth'),
      sumWallWidthRow: document.querySelector('#sumWallWidthRow'),
      sumCabWidth: document.querySelector('#sumCabWidth'),
      sumCabWidthRow: document.querySelector('#sumCabWidthRow'),
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
      var dim = tgt.getAttribute('data-dim');
      var val = tgt.getAttribute('data-val');

      // 取手（door handle）
      if (tgt.hasAttribute('data-handle')) {
        Q.state.doorHandle = tgt.getAttribute('data-handle');
        renderStep(); renderSummary();
        return;
      }
      // 水栓地域（一般地/寒冷地）
      if (tgt.hasAttribute('data-region')) {
        Q.state.sub.faucet = { region: tgt.getAttribute('data-region') };
        renderStep(); renderSummary();
        return;
      }
      // 周辺収納 间口/奥行 子选
      if (tgt.hasAttribute('data-peri-size')) {
        var p = Q.state.sub.peripheral || {};
        p.size = tgt.getAttribute('data-peri-size');
        Q.state.sub.peripheral = p;
        renderStep(); renderSummary();
        return;
      }
      if (tgt.hasAttribute('data-peri-depth')) {
        var p2 = Q.state.sub.peripheral || {};
        p2.depth = tgt.getAttribute('data-peri-depth');
        Q.state.sub.peripheral = p2;
        renderStep(); renderSummary();
        return;
      }
      // その他 30/45cm 子选
      if (tgt.hasAttribute('data-other-size')) {
        Q.state.sub.other = { size: tgt.getAttribute('data-other-size') };
        renderStep(); renderSummary();
        return;
      }
      // 多选（multi，如 cabinet 下柜加装）复选框
      if (tgt.hasAttribute('data-multi')) {
        var mid = tgt.getAttribute('data-multi');
        var mval = tgt.getAttribute('data-val');
        var toggles = Q.state.toggles[mid] || {};
        if (tgt.checked) {
          var mo = Q.cat(mid).options.find(function (x) { return x.code === mval; });
          // pricesBySize / items 项勾选后不默认子项，置空 sub（未选 → 待核不计价）
          if (mo && (mo.pricesBySize || (Array.isArray(mo.items) && mo.items.length))) toggles[mval] = {};
          else toggles[mval] = true;
        } else {
          delete toggles[mval];
        }
        Q.state.toggles[mid] = toggles;
        renderStep(); renderSummary();
        return;
      }
      // 多选项 柜体间口 子选（data-val="" 表示未选）
      if (tgt.hasAttribute('data-multi-w')) {
        var wdim = tgt.getAttribute('data-multi-w');
        var wcode = tgt.getAttribute('data-code');
        var wval = tgt.getAttribute('data-val');
        var togglesW = Q.state.toggles[wdim] || {};
        togglesW[wcode] = togglesW[wcode] || {};
        if (wval === '') delete togglesW[wcode].w;
        else togglesW[wcode].w = wval;
        Q.state.toggles[wdim] = togglesW;
        renderStep(); renderSummary();
        return;
      }
      // 多选项 items 子项 子选（data-val="" 表示未选）
      if (tgt.hasAttribute('data-multi-i')) {
        var idim = tgt.getAttribute('data-multi-i');
        var icode = tgt.getAttribute('data-code');
        var ivalRaw = tgt.getAttribute('data-val');
        var togglesI = Q.state.toggles[idim] || {};
        togglesI[icode] = togglesI[icode] || {};
        if (ivalRaw === '') delete togglesI[icode].i;
        else togglesI[icode].i = Number(ivalRaw);
        Q.state.toggles[idim] = togglesI;
        renderStep(); renderSummary();
        return;
      }

      // 上柜单元（wallunit，多单元列表）
      if (tgt.hasAttribute('data-wu-hood')) { Q.wuSetHood(Number(tgt.getAttribute('data-wu-idx')), tgt.checked); renderStep(); renderSummary(); return; }
      if (tgt.hasAttribute('data-wu-type')) { wuSetDefaults(Number(tgt.getAttribute('data-wu-idx')), tgt.getAttribute('data-wu-type')); renderStep(); renderSummary(); return; }
      if (tgt.hasAttribute('data-wu-width')) {
        var wu0 = wuUnit(Number(tgt.getAttribute('data-wu-idx')));
        wu0.width = tgt.getAttribute('data-wu-width');
        wuEyeAutoFix(wu0);
        renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-wu-height')) { var wu1 = wuUnit(Number(tgt.getAttribute('data-wu-idx'))); wu1.height = tgt.getAttribute('data-wu-height'); renderStep(); renderSummary(); return; }
      if (tgt.hasAttribute('data-wu-lighting')) { var wu2 = wuUnit(Number(tgt.getAttribute('data-wu-idx'))); wu2.lighting = tgt.getAttribute('data-wu-lighting'); renderStep(); renderSummary(); return; }
      if (tgt.hasAttribute('data-wu-subtype')) {
        var wu3 = wuUnit(Number(tgt.getAttribute('data-wu-idx')));
        wu3.subtype = tgt.getAttribute('data-wu-subtype');
        wuEyeAutoFix(wu3);
        renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-wu-rack')) {
        var wu4 = wuUnit(Number(tgt.getAttribute('data-wu-idx'))); wu4.racks = wu4.racks || {};
        var rk = tgt.getAttribute('data-wu-rack');
        if (tgt.checked) wu4.racks[rk] = true; else delete wu4.racks[rk];
        renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-wu-led')) {
        var wu5 = wuUnit(Number(tgt.getAttribute('data-wu-idx')));
        var lv = tgt.getAttribute('data-wu-led');
        if (lv === '') wu5.led = null;
        else {
          var ledDef = (DATA.wallCabinetUnits && DATA.wallCabinetUnits.led && DATA.wallCabinetUnits.led[lv]) || {};
          wu5.led = { code: lv, width: Object.keys(ledDef.pricesBySize || {})[0] || null };
        }
        renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-wu-led-width')) {
        var wu6 = wuUnit(Number(tgt.getAttribute('data-wu-idx'))); wu6.led = wu6.led || {}; wu6.led.width = tgt.getAttribute('data-wu-led-width');
        renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-wu-extra')) {
        var wu7 = wuUnit(Number(tgt.getAttribute('data-wu-idx'))); wu7.extras = wu7.extras || {};
        var ek = tgt.getAttribute('data-wu-extra');
        if (tgt.checked) wu7.extras[ek] = true; else delete wu7.extras[ek];
        renderStep(); renderSummary(); return;
      }
      // 下柜单元类型（cabunit）
      if (tgt.hasAttribute('data-cab-type')) {
        var cpos = tgt.getAttribute('data-cab-pos'); var cu = Q.state.cabunit || {}; cu[cpos] = cu[cpos] || {};
        cu[cpos].t = Number(tgt.getAttribute('data-cab-type')); Q.state.cabunit = cu; renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-cab-width')) {
        var cpos2 = tgt.getAttribute('data-cab-pos'); var cu2 = Q.state.cabunit || {}; cu2[cpos2] = cu2[cpos2] || {};
        cu2[cpos2].w = tgt.getAttribute('data-cab-width'); Q.state.cabunit = cu2; renderStep(); renderSummary(); return;
      }
      if (tgt.hasAttribute('data-cab-depth')) {
        var cpos3 = tgt.getAttribute('data-cab-pos'); var cu3 = Q.state.cabunit || {}; cu3[cpos3] = cu3[cpos3] || {};
        cu3[cpos3].d = tgt.getAttribute('data-cab-depth'); Q.state.cabunit = cu3; renderStep(); renderSummary(); return;
      }

      if (!dim) return;
      switch (dim) {
        case 'layout': Q.state.layout = val; Q.autoFix('layout'); break;
        case 'plan': Q.state.plan = val; Q.autoFix('plan'); break;
        case 'size': Q.state.width = val; break;
        case 'depth': Q.state.depth = val; break;
        case 'grade': Q.state.grade = val; Q.autoFix('grade'); break;
        case 'door':
          Q.state.doorColor = val;
          var co = Q.doorColorObj();
          Q.state.doorHandle = (co && co.handles && co.handles[0]) || null;
          break;
        default:
          if (val === '') delete Q.state.sel[dim];
          else Q.state.sel[dim] = val;
          Q.autoFix(dim);
          break;
      }
      renderStep(); renderSummary();
    });

    // 上柜单元 添加/删除（click 委托，仅绑一次）
    body.addEventListener('click', function (e) {
      var tgt = e.target;
      if (tgt.hasAttribute('data-wu-add')) {
        var units = Q.wuUnits();
        units.push({ type: 'standard', height: '70' });
        renderStep(); renderSummary();
        return;
      }
      if (tgt.hasAttribute('data-wu-del')) {
        var idx = Number(tgt.getAttribute('data-wu-del'));
        var us = Q.state.sub.wallcabinet && Q.state.sub.wallcabinet.units;
        if (us && us.length > 1) us.splice(idx, 1);
        renderStep(); renderSummary();
        return;
      }
    });
  }

  /* ---------------- 静态事件（仅一次） ---------------- */
  function bindStatic() {
    var last = Q.STEPS.length - 1;
    if (els.btnPrev) els.btnPrev.addEventListener('click', function () { Q.state.step = Math.max(0, Q.state.step - 1); renderAll(); });
    if (els.btnNext) els.btnNext.addEventListener('click', function () { if (Q.state.step < last) { Q.state.step += 1; renderAll(); } });
    if (els.btnFinish) els.btnFinish.addEventListener('click', function () { goTab('quote'); });
    if (els.sumToQuote) els.sumToQuote.addEventListener('click', function () { goTab('quote'); });
    if (els.sumCopy) els.sumCopy.addEventListener('click', copyList);
    if (els.btnBack) els.btnBack.addEventListener('click', function () { goTab('wizard'); });
    if (els.btnPrint) els.btnPrint.addEventListener('click', function () { window.print(); });
    if (els.btnCsv) els.btnCsv.addEventListener('click', exportCsv);

    if (els.stepper) els.stepper.addEventListener('click', function (e) {
      var b = e.target.closest('.wstep');
      if (!b) return;
      Q.state.step = Number(b.getAttribute('data-step'));
      renderAll();
    });

    if (els.tabs) els.tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.tab-btn');
      if (!b) return;
      goTab(b.getAttribute('data-view'));
    });

    if (els.langBar) els.langBar.addEventListener('click', function (e) {
      var b = e.target.closest('.lang-btn');
      if (!b) return;
      LANG = b.getAttribute('data-lang');
      els.langBar.querySelectorAll('.lang-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
      renderAll();
      renderQuote();
    });

    if (els.rate) els.rate.addEventListener('input', function () {
      Q.setRate(this.value);
      renderSummary();
      renderQuote();
    });

    if (els.customerName) els.customerName.addEventListener('input', function () { Q.setQuoteHead('customer', this.value); renderQuote(); });
    if (els.customerPhone) els.customerPhone.addEventListener('input', function () { Q.setQuoteHead('phone', this.value); renderQuote(); });
    if (els.customerNote) els.customerNote.addEventListener('input', function () { Q.setQuoteHead('remark', this.value); renderQuote(); });

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
    // 回到顶部（用 scrollTop 直设，避免 jsdom 的 window.scrollTo「Not implemented」报错）
    try {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    } catch (e) { /* ignore */ }
  }

  /* ---------------- 主渲染 ---------------- */
  function renderAll() {
    renderStepper();
    renderStep();
    renderSummary();
  }

  function stepState(n) {
    var dims = Q.DIMS.filter(function (d) { return d.step === n; });
    if (!dims.length) return true;
    return dims.some(function (d) {
      switch (d.kind) {
        case 'layout': return !!Q.state.layout;
        case 'plan': return !!Q.state.plan;
        case 'size': return Q.state.layout === 'tworow' || !!Q.state.width;
        case 'depth': return !Q.hasDepth() || !!Q.state.depth;
        case 'grade': return !!Q.state.grade;
        case 'door': return !!Q.state.doorColor;
        case 'multi': return Object.keys(Q.state.toggles[d.id] || {}).length > 0;
        case 'wallunit': return !!(Q.state.sub.wallcabinet && Q.state.sub.wallcabinet.type);
        case 'cabunit': return Object.keys(Q.state.cabunit || {}).length > 0;
        default: return Q.state.sel[d.id] != null;
      }
    });
  }

  function renderStepper() {
    if (!els.stepper) return;
    var cur = Q.state.step;
    var html = Q.STEPS.map(function (s) {
      var cls = 'wstep' + (s.n === cur ? ' active' : '') + (stepState(s.n) ? ' done' : '');
      return '<button type="button" class="' + cls + '" data-step="' + s.n + '" title="' +
        esc(s.titleZh + ' / ' + s.title) + '">' + s.n + '</button>';
    }).join('');
    els.stepper.innerHTML = html;
  }

  function renderStep() {
    var st = Q.STEPS[Q.state.step];
    var total = Q.STEPS.length;
    var last = total - 1;
    var html = '<div class="wiz-step-head">' +
      '<span class="wiz-step-no">' + t('步骤 / STEP', 'ステップ') + ' ' + st.n + ' / ' + total + '</span>' +
      '<h3>' + t(st.titleZh, st.title) + '</h3>' +
      '<p class="wiz-note">' + esc(st.note) + '</p></div>';

    var dims = Q.DIMS.filter(function (d) { return d.step === st.n; });
    dims.forEach(function (d) {
      var h = dimensionHtml(d);
      if (h) html += h;
    });
    if (!dims.length) html += '<p class="muted">' + t('该步骤暂无选择项。', 'このステップに選択項目はありません。') + '</p>';
    els.body.innerHTML = html;

    if (els.btnPrev) els.btnPrev.hidden = (st.n === 0);
    if (els.btnNext) els.btnNext.hidden = (st.n === last);
    if (els.btnFinish) els.btnFinish.hidden = (st.n !== last);
    if (els.dlRow) els.dlRow.hidden = (st.n !== last);
  }

  /* ---------------- 维度渲染 ---------------- */
  function dimensionHtml(d) {
    if (d.kind === 'depth' && !Q.hasDepth()) return '';
    var html = '<div class="opt-block" data-dim="' + d.id + '">' +
      '<div class="dim-title">' + t(d.titleZh, d.titleJa) + '</div>';
    switch (d.kind) {
      case 'layout': html += layoutHtml(d); break;
      case 'plan': html += planHtml(d); break;
      case 'size': html += sizeHtml(d); break;
      case 'depth': html += depthHtml(d); break;
      case 'grade': html += gradeHtml(d); break;
      case 'door': html += doorHtml(d); break;
      case 'faucet': html += faucetHtml(d); break;
      case 'peripheral': html += peripheralHtml(d); break;
      case 'other': html += otherHtml(d); break;
      case 'multi': html += multiHtml(d); break;
      case 'wallunit': html += wallunitHtml(d); break;
      case 'cabunit': html += cabunitHtml(d); break;
      case 'radio': html += radioHtml(d); break;
      default: html += '';
    }
    html += '</div>';
    return html;
  }

  function optCard(dimId, nameZh, nameJa, code, val, on, dis, priceHtml) {
    var disCls = dis ? ' disabled' : '';
    var codeHtml = code ? '<span class="opt-code">' + esc(code) + '</span>' : '';
    var note = dis ? '<span class="opt-dis">⛔ ' + esc(dis) + '</span>' : '';
    return '<label class="opt-card' + (on ? ' on' : '') + disCls + '">' +
      '<input type="radio" name="dim_' + dimId + '" data-dim="' + dimId + '" data-val="' + esc(val) + '"' +
      (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
      '<span class="opt-name">' + esc(nameZh) + '<em>' + esc(nameJa) + '</em></span>' +
      codeHtml + (priceHtml || '') + note + '</label>';
  }

  function priceNum(priceText) {
    var m = String(priceText).match(/[＋－]?\s*￥\s*([\d,]+)/);
    if (!m) return null;
    var n = parseInt(m[1].replace(/,/g, ''), 10);
    return String(priceText).indexOf('－') >= 0 ? -n : n;
  }
  function priceSpan(priceText) {
    var n = priceNum(priceText);
    var cls = (n == null) ? '' : (n > 0 ? ' plus' : (n < 0 ? ' minus' : ' ok'));
    return '<span class="opt-price' + cls + '">' + esc(priceText) + '</span>';
  }

  function optPriceText(d, oi, o) {
    if (!o) return '—';
    if (typeof o.priceDiff === 'number') return P.fmtDiff(o.priceDiff);
    if (o.priceDiff === null) return tp('价格待核', '価格未定');
    if (o.isBasic === true) return tp('基本', '基本仕様');
    if (o.pricesBySize) {
      // 台面差价是Ⅰ型基准；非Ⅰ型布局置「价格待核」（reviewer P1 方案 b）
      if (d.id === 'worktop' && Q.state.layout !== 'i') return tp('价格待核', '価格未定');
      var v = P.priceBySize(o, Q.state.width);
      if (v != null) return typeof v === 'number' ? P.fmtDiff(v) : String(v);
      // pricesBySize 缺当前间口格 → 待核（如 cabinet 配件按柜体自身间口，非厨房整体间口）
      return tp('价格待核', '価格未定');
    }
    if (o.priceMatrix) {
      var m = o.priceMatrix[Q.state.grade];
      if (m != null) return typeof m === 'number' ? P.fmtDiff(m) : String(m);
      return tp('按等级', 'グレード別');
    }
    if (o.prices) {
      var byG = o.prices[Q.state.grade];
      var w = byG && byG[Q.state.width];
      if (w != null) return typeof w === 'number' ? P.fmtDiff(w) : String(w);
      return tp('按等级·尺寸', 'グレード・サイズ別');
    }
    return '—';
  }

  function layoutHtml(d) {
    var html = '<div class="opt-grid">';
    Q.cat('layout').options.forEach(function (o) {
      var on = Q.state.layout === o.code;
      var plansZh = (Q.plansForLayout(o.code) || []).map(function (p) { return (DATA.meta.planNamesZh && DATA.meta.planNamesZh[p]) || p; }).join('/');
      html += optCard('layout', o.name_zh || o.name_ja, o.name_ja || '', plansZh, o.code, on, null, '');
    });
    html += '</div>';
    return html;
  }

  function planHtml(d) {
    var plans = Q.layoutPlans();
    var html = '<div class="opt-grid">';
    Q.cat('plan').options.forEach(function (o) {
      if (plans.indexOf(o.code) < 0) return;
      var on = Q.state.plan === o.code;
      html += optCard('plan', o.name_zh || o.name_ja, o.name_ja || '', o.code, o.code, on, null, '');
    });
    html += '</div>';
    if (plans.length === 1) html += '<p class="muted">' + t('该布局仅此一种套餐。', 'このレイアウトはこのプランのみです。') + '</p>';
    return html;
  }

  function widthName(w) {
    var o = Q.cat('size').options.find(function (x) { return x.code === w; });
    if (o) return { zh: o.name_zh || ('宽' + w + 'cm'), ja: o.name_ja || ('間口' + w + 'cm') };
    return { zh: '宽' + w + 'cm', ja: '間口' + w + 'cm' };
  }

  function sizeHtml(d) {
    var widths = Q.layoutWidths();
    if (!widths.length) return '';
    var html = '<div class="opt-grid">';
    widths.forEach(function (w) {
      var nm = widthName(w);
      var on = Q.state.width === w;
      html += optCard('size', nm.zh, nm.ja, w, w, on, null, '');
    });
    html += '</div>';
    if (Q.state.layout === 'tworow') {
      html += '<p class="muted">' + t('2列型为固定组合：コンロ側180cm＋シンク側181.5cm。', '2列型は固定組合せ（コンロ側180cm＋シンク側181.5cm）です。') + '</p>';
    }
    return html;
  }

  function depthHtml(d) {
    var html = '<div class="sub-row"><span class="dim-sub-title">' + t('深度 / 奥行：', '奥行：') + '</span>';
    Q.depthList().forEach(function (dp) {
      var on = Q.state.depth === dp;
      html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="depth_sel" data-dim="depth" data-val="' + esc(dp) + '"' + (on ? ' checked' : '') + '>' + esc(dp) + 'cm</label>';
    });
    html += '</div>';
    return html;
  }

  function gradeHtml(d) {
    var html = '<div class="opt-grid">';
    Q.cat('grade').options.forEach(function (o) {
      var on = Q.state.grade === o.code;
      html += optCard('grade', o.name_zh || o.name_ja, o.name_ja || '', o.code, o.code, on, null, '');
    });
    html += '</div>';
    return html;
  }

  function doorHtml(d) {
    var colors = Q.currentDoorColors();
    var html = '<div class="opt-grid">';
    colors.forEach(function (c) {
      var on = Q.state.doorColor === c.code;
      html += optCard('door', c.name_zh || c.name_ja, c.name_ja || '', c.code, c.code, on, null, '');
    });
    html += '</div>';
    var handles = Q.doorHandles();
    if (handles.length) {
      html += '<div class="sub-row"><span class="dim-sub-title">' + t('拉手 / 取手：', '取手：') + '</span>';
      handles.forEach(function (h) {
        var hn = Q.handleNames()[h] || {};
        var on = Q.state.doorHandle === h;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="door_handle" data-handle="' + esc(h) + '"' + (on ? ' checked' : '') + '>' + esc(h + ' ' + (hn.name_ja || '')) + '</label>';
      });
      html += '</div>';
    }
    return html;
  }

  function faucetPriceText(o) {
    var region = (Q.state.sub.faucet && Q.state.sub.faucet.region) || '一般地';
    if (region === '寒冷地' && o.priceDiffCold != null) {
      return typeof o.priceDiffCold === 'number' ? P.fmtDiff(o.priceDiffCold) : String(o.priceDiffCold);
    }
    if (typeof o.priceDiff === 'number') return P.fmtDiff(o.priceDiff);
    if (o.priceDiff === null) return tp('价格待核', '価格未定');
    if (o.isBasic) return tp('基本', '基本仕様');
    return '—';
  }

  function faucetHtml(d) {
    var region = (Q.state.sub.faucet && Q.state.sub.faucet.region) || '一般地';
    var html = '<div class="sub-row"><span class="dim-sub-title">' + t('地区 / 地域：', '地域：') + '</span>';
    ['一般地', '寒冷地'].forEach(function (r) {
      var on = region === r;
      html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="faucet_region" data-region="' + esc(r) + '"' + (on ? ' checked' : '') + '>' + esc(r) + '</label>';
    });
    html += '</div><div class="opt-grid">';
    Q.cat('faucet').options.forEach(function (o, oi) {
      var oid = Q.optionId('faucet', oi);
      var on = Q.state.sel.faucet === oid;
      html += optCard('faucet', o.name_zh || o.name_ja, o.name_ja || '', o.code, oid, on, null, priceSpan(faucetPriceText(o)));
    });
    html += '</div>';
    return html;
  }

  function peripheralPriceText(o) {
    if (!Q.peripheralTable(o)) return tp('价格未标注', '価格未記載');
    var v = Q.peripheralPrice(o);
    return v != null ? P.fmtDiff(v) : tp('按间口·等级', '間口・グレード別');
  }

  function peripheralHtml(d) {
    var html = '<div class="opt-grid">';
    var noneOn = Q.state.sel.peripheral == null;
    html += '<label class="opt-card' + (noneOn ? ' on' : '') + '">' +
      '<input type="radio" name="dim_peripheral" data-dim="peripheral" data-val=""' + (noneOn ? ' checked' : '') + '>' +
      '<span class="opt-name">' + t('不添加', 'なし') + '<em>なし</em></span></label>';
    Q.cat('peripheral').options.forEach(function (o, oi) {
      var oid = Q.optionId('peripheral', oi);
      var on = Q.state.sel.peripheral === oid;
      html += optCard('peripheral', o.name_zh || o.name_ja, o.name_ja || '', o.code, oid, on, null, priceSpan(peripheralPriceText(o)));
    });
    html += '</div>';

    var so = Q.selOption('peripheral');
    if (so) {
      var s = Q.state.sub.peripheral || {};
      var sizes = so.sizes || [];
      var depths = so.depth || [];
      if (sizes.length) {
        var curSize = s.size || sizes[0];
        html += '<div class="sub-row"><span class="dim-sub-title">' + t('间口 / 間口：', '間口：') + '</span>';
        sizes.forEach(function (sz) {
          var on = curSize === sz;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="peri_size" data-peri-size="' + esc(sz) + '"' + (on ? ' checked' : '') + '>' + esc(sz) + 'cm</label>';
        });
        html += '</div>';
      }
      if (depths.length) {
        var curDepth = s.depth || depths[0];
        html += '<div class="sub-row"><span class="dim-sub-title">' + t('深度 / 奥行：', '奥行：') + '</span>';
        depths.forEach(function (dp) {
          var on = curDepth === dp;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="peri_depth" data-peri-depth="' + esc(dp) + '"' + (on ? ' checked' : '') + '>' + esc(dp) + 'cm</label>';
        });
        html += '</div>';
      }
    }
    return html;
  }

  function otherPriceText(o) {
    var v = Q.otherPriceFor(o);
    return v != null ? P.fmtDiff(v) : '—';
  }

  function otherHtml(d) {
    var html = '<div class="opt-grid">';
    var noneOn = Q.state.sel.other == null;
    html += '<label class="opt-card' + (noneOn ? ' on' : '') + '">' +
      '<input type="radio" name="dim_other" data-dim="other" data-val=""' + (noneOn ? ' checked' : '') + '>' +
      '<span class="opt-name">' + t('不添加', 'なし') + '<em>なし</em></span></label>';
    Q.cat('other').options.forEach(function (o, oi) {
      var oid = Q.optionId('other', oi);
      var on = Q.state.sel.other === oid;
      html += optCard('other', o.name_zh || o.name_ja, o.name_ja || '', o.code, oid, on, null, priceSpan(otherPriceText(o)));
    });
    html += '</div>';

    var so = Q.selOption('other');
    if (so) {
      var cur = (Q.state.sub.other && Q.state.sub.other.size) || '30';
      html += '<div class="sub-row"><span class="dim-sub-title">' + t('尺寸 / サイズ：', 'サイズ：') + '</span>';
      ['30', '45'].forEach(function (sz) {
        var on = cur === sz;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="other_size" data-other-size="' + esc(sz) + '"' + (on ? ' checked' : '') + '>' + esc(sz) + 'cm</label>';
      });
      html += '</div>';
    }
    return html;
  }

  function radioHtml(d) {
    var html = '<div class="opt-grid">';
    Q.cat(d.cat).options.forEach(function (o, oi) {
      var oid = Q.optionId(d.id, oi);
      var on = Q.state.sel[d.id] === oid;
      var dis = Q.disabledReason(d.id, oi);
      html += optCard(d.id, o.name_zh || o.name_ja, o.name_ja || '', o.code, oid, on, dis, priceSpan(optPriceText(d, oi, o)));
    });
    html += '</div>';
    return html;
  }

  function multiPriceText(o, sub) {
    if (o.pricesBySize) {
      var w = sub && sub.w;
      if (w == null) return tp('价格待核', '価格未定');   // 未选间口
      var v = o.pricesBySize[w];
      return typeof v === 'number' ? P.fmtDiff(v) : tp('价格待核', '価格未定');
    }
    if (Array.isArray(o.items) && o.items.length) {
      var idx = (sub && typeof sub.i === 'number') ? sub.i : null;
      if (idx == null) return tp('价格待核', '価格未定');   // 未选子项
      var it = o.items[idx];
      return it && typeof it.price === 'number' ? P.fmtDiff(it.price) : tp('价格待核', '価格未定');
    }
    if (typeof o.priceDiff === 'number') return P.fmtDiff(o.priceDiff);
    if (o.priceDiff === null) return tp('价格待核', '価格未定');
    if (o.isBasic) return tp('基本', '基本仕様');
    return '—';
  }

  function multiHtml(d) {
    var html = '';
    Q.cat(d.cat).options.forEach(function (o, oi) {
      var sub = Q.multiSub(d.id, o.code);
      var checked = sub != null;
      var price = multiPriceText(o, sub);
      var codeHtml = o.code ? '<span class="opt-code">' + esc(o.code) + '</span>' : '';
      html += '<div class="multi-item">' +
        '<label class="check-row' + (checked ? ' on' : '') + '">' +
        '<input type="checkbox" data-multi="' + d.id + '" data-val="' + esc(o.code) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
        codeHtml + priceSpan(price) + '</label>';

      if (checked && o.pricesBySize) {
        var w = sub && sub.w;
        html += '<div class="sub-row multi-sub"><span class="dim-sub-title">' + t('柜体间口 / 間口：', '間口：') + '</span>';
        html += '<label class="sub-chip' + (w == null ? ' on' : '') + '"><input type="radio" name="multi_w_' + o.code + '" data-multi-w="' + d.id + '" data-code="' + esc(o.code) + '" data-val=""' + (w == null ? ' checked' : '') + '>' + t('未选', '未選択') + '</label>';
        Object.keys(o.pricesBySize).forEach(function (wk) {
          var on = w === wk;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="multi_w_' + o.code + '" data-multi-w="' + d.id + '" data-code="' + esc(o.code) + '" data-val="' + esc(wk) + '"' + (on ? ' checked' : '') + '>' + esc(wk) + 'cm</label>';
        });
        html += '</div>';
      }
      if (checked && Array.isArray(o.items) && o.items.length) {
        var i = (sub && typeof sub.i === 'number') ? sub.i : null;
        html += '<div class="sub-row multi-sub"><span class="dim-sub-title">' + t('子项 / タイプ：', 'タイプ：') + '</span>';
        html += '<label class="sub-chip' + (i == null ? ' on' : '') + '"><input type="radio" name="multi_i_' + o.code + '" data-multi-i="' + d.id + '" data-code="' + esc(o.code) + '" data-val=""' + (i == null ? ' checked' : '') + '>' + t('未选', '未選択') + '</label>';
        o.items.forEach(function (it, ii) {
          var on = i === ii;
          var p = typeof it.price === 'number' ? P.fmtDiff(it.price) : (it.price || '');
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="multi_i_' + o.code + '" data-multi-i="' + d.id + '" data-code="' + esc(o.code) + '" data-val="' + ii + '"' + (on ? ' checked' : '') + '>' + esc(it.name_zh || it.name_ja || '') + ' <b>' + esc(p) + '</b></label>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
    return html;
  }

  /* ---------------- 上柜单元（wallunit，多单元列表）+ 下柜单元（cabunit） ---------------- */
  function wuChips(idx, label, attr, values, cur, suffix, displayMap) {
    var html = '<div class="sub-row"><span class="dim-sub-title">' + esc(label) + '：</span>';
    (values || []).forEach(function (v) {
      var disp = (displayMap && displayMap[v]) ? displayMap[v] : v;
      var on = cur === v;
      html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="wu_' + idx + '_' + attr + '" data-wu-idx="' + idx + '" ' + attr + '="' + esc(v) + '"' + (on ? ' checked' : '') + '>' + esc(disp) + (suffix || '') + '</label>';
    });
    html += '</div>';
    return html;
  }
  function wuUnit(idx) {
    var s = Q.state.sub.wallcabinet;
    if (!s || !Array.isArray(s.units)) { s = { units: [] }; Q.state.sub.wallcabinet = s; }
    if (!s.units[idx]) s.units[idx] = { type: 'standard', height: '70' };
    return s.units[idx];
  }
  function wuSetDefaults(idx, type) {
    var WU = DATA.wallCabinetUnits || {};
    var u = wuUnit(idx);
    u.type = type;
    u.width = null; u.height = null; u.lighting = null; u.subtype = null;
    if (type === 'none') { u.racks = {}; u.led = null; u.extras = {}; return; }
    u.racks = u.racks || {}; u.extras = u.extras || {};
    if (type === 'handmove') { u.width = '75'; u.lighting = '照明無'; }
    else if (type === 'eyearea') { u.subtype = 'seasoning'; u.width = '75'; u.lighting = '照明無'; }
    else if (type === 'automove') { u.subtype = (WU.automove && WU.automove.types && WU.automove.types[0]) || null; u.width = '75'; }
    else if (type === 'standard') { u.height = '70'; }
    else if (type === 'seethrough') { u.width = '60'; u.height = '70'; }
    else if (type === 'movedown') { u.width = '60'; u.height = '70'; }
  }
  /** eyearea 间口/タイプ变化时校正 subtype/lighting（45cm 仅調味料棚、无照明付） */
  function wuEyeAutoFix(u) {
    if (u.type !== 'eyearea') return;
    var eye = (DATA.wallCabinetUnits || {}).eyearea;
    if (!eye || !eye.prices || !u.width) return;
    var subOpts = Object.keys(eye.prices[u.width] || {});
    if (!subOpts.length) return;
    if (subOpts.indexOf(u.subtype) < 0) u.subtype = subOpts[0];
    var lightingOpts = (eye.prices[u.width] && eye.prices[u.width][u.subtype]) ? Object.keys(eye.prices[u.width][u.subtype]) : [];
    if (lightingOpts.length && lightingOpts.indexOf(u.lighting) < 0) u.lighting = lightingOpts[0];
  }

  var WU_TYPE_OPTS = [
    { code: 'handmove', zh: '手动升降吊柜', ja: 'ハンドムーブ' },
    { code: 'eyearea', zh: '眼部区域收纳盒', ja: 'アイエリアボックス' },
    { code: 'automove', zh: '电动升降吊柜', ja: 'オートムーブ' },
    { code: 'standard', zh: '吊柜', ja: '吊戸棚' },
    { code: 'seethrough', zh: '透视吊柜', ja: 'シースルー吊戸棚' },
    { code: 'movedown', zh: '下拉吊柜', ja: 'ムーブダウン吊戸棚' },
    { code: 'none', zh: '不安装吊柜', ja: '吊戸棚なし' }
  ];

  function wuUnitCard(u, idx, total) {
    var WU = DATA.wallCabinetUnits || {};
    var html = '<div class="opt-sub" data-wu-card="' + idx + '">';
    html += '<div class="wu-head"><span class="wu-title">' + t('上柜单元', '上戸棚ユニット') + ' ' + (idx + 1) + '</span>';
    if (total > 1) html += '<button type="button" class="btn btn-line btn-sm" data-wu-del="' + idx + '">' + t('删除', '削除') + '</button>';
    html += '</div>';
    html += '<div class="sub-row"><span class="dim-sub-title">' + t('单元类型 / タイプ：', 'タイプ：') + '</span>';
    WU_TYPE_OPTS.forEach(function (tp) {
      var on = u.type === tp.code;
      html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="wu_type_' + idx + '" data-wu-idx="' + idx + '" data-wu-type="' + tp.code + '"' + (on ? ' checked' : '') + '>' + esc(tp.zh) + ' <span class="ja">' + esc(tp.ja) + '</span></label>';
    });
    html += '</div>';
    // 油烟机用标记（互斥，最多 1 个）
    html += '<div class="sub-row"><span class="dim-sub-title">' + t('油烟机用 / レンジフード用：', 'レンジフード用：') + '</span>';
    html += '<label class="check-row' + (u.isHood ? ' on' : '') + '" style="display:inline-flex;margin:0;padding:5px 12px;"><input type="checkbox" data-wu-idx="' + idx + '" data-wu-hood="1"' + (u.isHood ? ' checked' : '') + '>' + t('油烟机用（位于油烟机上方，最多1个）', 'レンジフード用（レンジフード上に設置、最大1個）') + '</label>';
    html += '</div>';

    var wt = u.type;
    if (wt === 'handmove') {
      html += wuChips(idx, '间口/間口', 'data-wu-width', WU.handmove.widths, u.width, 'cm');
      html += wuChips(idx, '照明', 'data-wu-lighting', WU.handmove.lighting, u.lighting, '');
    } else if (wt === 'eyearea') {
      var eye = WU.eyearea || {};
      var eyeTypes = eye.types || {};
      var widthOpts = Object.keys(eye.prices || {});                       // 45/75/90
      var curWidth = u.width || widthOpts[0];
      var subOpts = Object.keys(eye.prices[curWidth] || {});               // 45→仅 seasoning；75/90→seasoning+draining
      var curSub = u.subtype || subOpts[0];
      var lightingOpts = (eye.prices[curWidth] && eye.prices[curWidth][curSub]) ? Object.keys(eye.prices[curWidth][curSub]) : ['照明無'];
      html += wuChips(idx, 'タイプ', 'data-wu-subtype', subOpts, u.subtype, '', eyeTypes);
      html += wuChips(idx, '间口/間口', 'data-wu-width', widthOpts, u.width, 'cm');
      html += wuChips(idx, '照明', 'data-wu-lighting', lightingOpts, u.lighting, '');
    } else if (wt === 'automove') {
      html += wuChips(idx, 'タイプ', 'data-wu-subtype', WU.automove.types, u.subtype, '');
      html += wuChips(idx, '间口/間口', 'data-wu-width', WU.automove.widths, u.width, 'cm');
    } else if (wt === 'standard') {
      html += wuChips(idx, '高さ', 'data-wu-height', WU.standard.heights, u.height, 'cm');
    } else if (wt === 'seethrough') {
      html += wuChips(idx, '间口/間口', 'data-wu-width', WU.seethrough.widths, u.width, 'cm');
      html += wuChips(idx, '高さ', 'data-wu-height', WU.seethrough.heights, u.height, 'cm');
    } else if (wt === 'movedown') {
      html += wuChips(idx, '间口/間口', 'data-wu-width', WU.movedown.widths, u.width, 'cm');
      html += wuChips(idx, '高さ', 'data-wu-height', WU.movedown.heights, u.height, 'cm');
    }
    if (wt === 'automove' || wt === 'standard' || wt === 'seethrough' || wt === 'movedown') {
      html += '<p class="muted">' + t('基本仕様（价格含于套装，类型差价在别册，本系统暂不计价）', '基本仕様（価格はセットに含まれ、タイプ差額は別冊）') + '</p>';
    }
    if (wt === 'none') {
      html += '<p class="muted">' + t('不安装吊柜（按厨房间口 240/255/270cm 减价；其余间口价格待核不计价）', '吊戸棚なし（厨房間口240/255/270cm で減額；それ以外は価格未定）') + '</p>';
    }

    var racks = null;
    if (wt === 'handmove') racks = WU.handmove.racks;
    else if (wt === 'automove') racks = WU.automove.racks;
    if (racks) {
      html += '<div class="sub-row"><span class="dim-sub-title">' + t('拉篮 / ラック：', 'ラック：') + '</span>';
      Object.keys(racks).forEach(function (rk) {
        var on = !!(u.racks && u.racks[rk]);
        html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="checkbox" data-wu-idx="' + idx + '" data-wu-rack="' + esc(rk) + '"' + (on ? ' checked' : '') + '>' + esc(rk) + ' <b>' + esc(P.fmtDiff(racks[rk])) + '</b></label>';
      });
      html += '</div>';
    }

    if (wt !== 'none') {
      var ledOpts = WU.led || {};
      html += '<div class="sub-row"><span class="dim-sub-title">' + t('LED灯 / LED：', 'LED：') + '</span>';
      var ledNoneOn = !(u.led && u.led.code);
      html += '<label class="sub-chip' + (ledNoneOn ? ' on' : '') + '"><input type="radio" name="wu_led_' + idx + '" data-wu-idx="' + idx + '" data-wu-led=""' + (ledNoneOn ? ' checked' : '') + '>' + t('无', 'なし') + '</label>';
      Object.keys(ledOpts).forEach(function (lk) {
        var on = u.led && u.led.code === lk;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="wu_led_' + idx + '" data-wu-idx="' + idx + '" data-wu-led="' + lk + '"' + (on ? ' checked' : '') + '>' + esc(ledOpts[lk].name_zh || ledOpts[lk].name_ja || lk) + '</label>';
      });
      html += '</div>';
      if (u.led && u.led.code && ledOpts[u.led.code]) {
        var ledW = ledOpts[u.led.code].pricesBySize || {};
        html += '<div class="sub-row multi-sub"><span class="dim-sub-title">' + t('LED间口：', 'LED間口：') + '</span>';
        Object.keys(ledW).forEach(function (wk) {
          var on = u.led.width === wk;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="wu_led_w_' + idx + '" data-wu-idx="' + idx + '" data-wu-led-width="' + wk + '"' + (on ? ' checked' : '') + '>' + esc(wk) + 'cm <b>' + esc(P.fmtDiff(ledW[wk])) + '</b></label>';
        });
        html += '</div>';
      }
      html += '<div class="sub-row"><span class="dim-sub-title">' + t('配件 / オプション：', 'オプション：') + '</span>';
      Object.keys(WU.extras || {}).forEach(function (ek) {
        var on = !!(u.extras && u.extras[ek]);
        html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="checkbox" data-wu-idx="' + idx + '" data-wu-extra="' + esc(ek) + '"' + (on ? ' checked' : '') + '>' + esc(ek) + '</label>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function wallunitHtml(d) {
    var units = Q.wuUnits();
    var html = '';
    units.forEach(function (u, idx) {
      html += wuUnitCard(u, idx, units.length);
    });
    html += '<button type="button" class="btn btn-line" data-wu-add>' + t('＋ 添加上柜单元', '＋ 上戸棚ユニット追加') + '</button>';
    return html;
  }

  function cabunitHtml(d) {
    var CT = DATA.cabinetTypes || {};
    var html = '';
    var positions = [
      { code: 'sink', zh: '水槽柜', ja: 'シンクキャビネット' },
      { code: 'base', zh: '基础柜', ja: 'ベースキャビネット' },
      { code: 'cooktop', zh: '灶具柜', ja: 'コンロキャビネット' },
      { code: 'corner', zh: '转角柜', ja: 'コーナーキャビネット' }
    ];
    positions.forEach(function (pos) {
      var C = CT[pos.code];
      if (!C) return;
      var sel = Q.state.cabunit[pos.code] || {};
      html += '<div class="sub-row" style="margin-bottom:6px;"><span class="dim-sub-title">' + esc(pos.zh) + ' <span class="ja">' + esc(pos.ja) + '</span>：</span>';
      (C.types || []).forEach(function (tp, ti) {
        var on = sel.t === ti;
        html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="cab_' + pos.code + '_t" data-cab-pos="' + pos.code + '" data-cab-type="' + ti + '"' + (on ? ' checked' : '') + '>' + esc(tp.name_zh || tp.name_ja) + (tp.isBasic ? ' <b>基本</b>' : '') + '</label>';
      });
      html += '</div>';
      if (C.widths && C.widths.length) {
        html += '<div class="sub-row multi-sub"><span class="dim-sub-title">' + t('间口', '間口') + '：</span>';
        C.widths.forEach(function (wv) {
          var on = sel.w === wv;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="cab_' + pos.code + '_w" data-cab-pos="' + pos.code + '" data-cab-width="' + esc(wv) + '"' + (on ? ' checked' : '') + '>' + esc(wv) + 'cm</label>';
        });
        html += '</div>';
      }
      if (C.depth && C.depth.length) {
        html += '<div class="sub-row multi-sub"><span class="dim-sub-title">' + t('奥行', '奥行') + '：</span>';
        C.depth.forEach(function (dv) {
          var on = sel.d === dv;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="cab_' + pos.code + '_d" data-cab-pos="' + pos.code + '" data-cab-depth="' + esc(dv) + '"' + (on ? ' checked' : '') + '>' + esc(dv) + '</label>';
        });
        html += '</div>';
      }
    });
    html += '<p class="muted">' + t('以上单元类型均为基本仕様（无加减差价，类型差价在别册），仅记录于报价单。', '上記ユニットタイプはすべて基本仕様（差額なし）です。') + '</p>';
    return html;
  }

  /* ---------------- 合计栏 ---------------- */
  function renderSummary() {
    var r = Q.computeQuote();
    var optTotal = r.totalEx - (r.basePrice != null ? r.basePrice : 0);
    if (els.sumType) els.sumType.textContent = (DATA.meta && DATA.meta.series) || (DATA.meta && DATA.meta.product) || '';
    if (els.sumLayout) els.sumLayout.textContent = tp(Q.layoutNameZh(), Q.layoutNameJa());
    if (els.sumPlan) els.sumPlan.textContent = tp(Q.planNameZh(), Q.planNameJa());
    if (els.sumSize) els.sumSize.textContent = Q.state.layout === 'tworow' ? tp('固定组合', '固定組合せ') : (Q.state.width + 'cm');
    if (els.sumGrade) els.sumGrade.textContent = Q.gradeLabel();
    if (els.sumDepth) els.sumDepth.textContent = Q.hasDepth() ? (Q.state.depth + 'cm') : '—';
    if (els.sumDepthRow) els.sumDepthRow.hidden = !Q.hasDepth();
    // 上/下柜宽度适配（软提示，不阻止）
    var kitchenW = Q.parseWidthCm(Q.state.width);
    if (els.sumWallWidth) {
      var wuW = Q.sumWallUnitWidth();
      els.sumWallWidth.textContent = wuW + 'cm / 间口 ' + kitchenW + 'cm';
      if (els.sumWallWidthRow) els.sumWallWidthRow.classList.toggle('warn', wuW > kitchenW || (wuW > 0 && wuW < kitchenW * 0.6));
    }
    if (els.sumCabWidth) {
      var cbW = Q.sumCabUnitWidth();
      els.sumCabWidth.textContent = cbW + 'cm / 间口 ' + kitchenW + 'cm';
      if (els.sumCabWidthRow) els.sumCabWidthRow.classList.toggle('warn', cbW > kitchenW || (cbW > 0 && cbW < kitchenW * 0.6));
    }
    if (els.sumBase) els.sumBase.textContent = r.basePrice != null ? P.yen(r.basePrice) : '—';
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
    var meta = DATA.meta || {};
    var html = '';

    html += '<div class="doc-header">' +
      '<div class="doc-brand">elf_D老肖的世界<span>DESIGN STUDIO</span></div>' +
      '<h1>' + t('報 价 单', '見 積 書') + '</h1>' +
      '<div class="doc-sub">' + esc(meta.brand || 'クリナップ Cleanup') + ' ' + esc(meta.series || 'ステディア（STEDIA）') + ' システムキッチン ／ 系统厨房</div>' +
      '<div class="doc-meta">' +
      '<span>' + t('日期 / 日付：', '日付：') + esc(head.date || dateNow()) + '</span>' +
      '<span>' + t('布局 / レイアウト：', 'レイアウト：') + tp(Q.layoutNameZh(), Q.layoutNameJa()) + '</span>' +
      '<span>' + t('套餐 / プラン：', 'プラン：') + tp(Q.planNameZh(), Q.planNameJa()) + '</span>' +
      '<span>' + t('宽度 / 間口：', '間口：') + esc(Q.state.width) + 'cm</span>' +
      (Q.hasDepth() ? '<span>' + t('深度 / 奥行：', '奥行：') + esc(Q.state.depth) + 'cm</span>' : '') +
      '<span>' + t('等级 / グレード：', 'グレード：') + esc(Q.gradeLabel()) + '</span>' +
      (head.customer ? '<span>' + t('客户 / お客様：', 'お客様：') + esc(head.customer) + '</span>' : '') +
      (head.phone ? '<span>' + t('电话 / TEL：', 'TEL：') + esc(head.phone) + '</span>' : '') +
      '</div></div>';

    var byStep = {};
    r.lines.forEach(function (l) { (byStep[l.step] = byStep[l.step] || []).push(l); });
    Object.keys(byStep).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (s) {
      var lines = byStep[s];
      var zh = lines[0].stepZh, ja = lines[0].stepJa;
      html += '<div class="doc-section">' +
        '<div class="doc-sec-title"><span>STEP ' + s + '</span>' + t(zh, ja) + '</div>' +
        '<table class="quote-table"><thead><tr>' +
        '<th>' + t('品名', '品名') + '</th><th>' + t('記号', '記号') + '</th><th>' + t('型番', '型番') + '</th><th>' + t('仕様', '仕様') + '</th><th class="num">' + t('金额(税抜)', '金額(税抜)') + '</th>' +
        '</tr></thead><tbody>';
      lines.forEach(function (l) {
        var nameCell = l.base
          ? '<b>' + esc(l.nameZh) + '</b><div class="ja">' + esc(l.nameJa) + '</div>'
          : esc(l.nameZh) + '<div class="ja">' + esc(l.nameJa) + '</div>';
        var amount = l.base ? P.yen(r.basePrice != null ? r.basePrice : 0) : (l.diff > 0 ? '＋' : l.diff < 0 ? '－' : '') + P.yen(Math.abs(l.diff));
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
      '<div class="doc-row big accent"><div class="doc-q">' + t('大陆地区价格（人民币 · 纯物料）/ 中国本土価格（純物料）', '中国本土価格（純物料）') + '</div>' +
      '<div class="doc-a">' + (r.rmbAllIn != null ? '¥' + Number(r.rmbAllIn).toLocaleString() : t('请输入汇率', '為替を入力してください')) + '</div></div>' +
      (rate ? '<div class="doc-formula">' + t('使用汇率：1日元 = ' + rate + ' 人民币 ｜ 公式：大陆地区价格 = 日元税込 × 汇率（纯物料价格，不含安装/工事费）', '為替：1円 = ' + rate + ' RMB ｜ 中国本土価格 = 税込 × 為替（純物料価格、据付・工事費別）') + '</div>' : '') +
      '</div>';

    if (r.unknown.length) {
      html += '<div class="doc-section"><div class="doc-sec-title"><span>⚠</span>' + t('未计价项 / 未計上', '未計上') + '</div>' +
        '<div class="doc-row"><div class="doc-q">' + t('以下项价格未标注/需查表，未计入合计：', '以下の項目は価格未記載のため合計に含まれません：') +
        r.unknown.map(function (u) { return esc(u.name); }).join('、') + '</div></div></div>';
    }

    html += '<div class="doc-footer">' +
      '<p>' + t('※ 所示价格为不含税参考价，最终以クリナップ正式見積書为准', '※ 表示価格は税抜きの参考価格です。正式な見積はお見積書でご確認ください') + '</p>' +
      '<p>※ ' + t('基本セット価格は取付・設置費別（不含安装费）', '基本セット価格（取付・設置費別）') + '</p>' +
      '<p>※ ' + t('大陸地区価格 = 税込 × 為替（純物料価格，据付・工事費別です；大陆地区价格=日元税込×汇率，纯物料价格，不含安装/工事费）', '中国本土価格 = 税込×為替（純物料価格、据付・工事費別）') + '</p>' +
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
    var lines = ['【Cleanup STEDIA 系统厨房 見積（报价）选型清单】'];
    lines.push('布局：' + Q.layoutNameZh() + ' / ' + Q.layoutNameJa() +
      ' ｜ 套餐：' + Q.planNameZh() + ' / ' + Q.planNameJa() +
      ' ｜ 间口：' + (Q.state.layout === 'tworow' ? '固定组合' : Q.state.width + 'cm') +
      (Q.hasDepth() ? ' ｜ 奥行：' + Q.state.depth + 'cm' : '') +
      ' ｜ 等级：' + Q.gradeLabel());
    lines.push('—'.repeat(30));
    r.lines.forEach(function (l) {
      lines.push((l.base ? '套装价  ' : '        ') + l.nameZh + (l.extra ? '（' + l.extra + '）' : '') + (l.base ? '' : '  ' + P.fmtDiff(l.diff)));
    });
    lines.push('—'.repeat(30));
    lines.push('日元合计（税抜）：' + P.yen(r.totalEx));
    lines.push('日元合计（税込）：' + P.yen(r.totalInc));
    if (r.rmbAllIn != null) lines.push('大陆地区价格（人民币，纯物料）：¥' + Number(r.rmbAllIn).toLocaleString());
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
    a.download = 'kitchen-quote.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.KITCHEN = window.KITCHEN || {};
  window.KITCHEN.wizard = {
    init: init,
    renderAll: renderAll,
    renderQuote: renderQuote,
    renderSummary: renderSummary,
    setLang: function (l) { if (l === 'zh' || l === 'ja' || l === 'both') LANG = l; renderAll(); renderQuote(); },
    state: { get lang() { return LANG; } }
  };
})();
