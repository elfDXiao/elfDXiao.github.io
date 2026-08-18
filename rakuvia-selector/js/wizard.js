/**
 * wizard.js — CleanUp rakuvia 整体浴室选型报价 UI（elf_D老肖的世界 风格，原格式：分步向导 + 报价单 两个标签页）
 *
 * 视图：选型向导（横向步骤条 + 选项区 + 右侧合计栏）/ 报价单（見積書）
 * 依赖：window.RAKUVIA_DATA、window.RAKUVIA.price、window.RAKUVIA.quote
 * 暴露：window.RAKUVIA.wizard = { init, renderAll, renderQuote, state }
 *
 * 事件绑定架构（避免监听器累积卡死）：
 *   - bindDelegated()：对持久容器 #wizBody 的 change/click 委托，仅 init 绑定一次
 *   - bindStatic()：静态按钮（导航/tab/语言/汇率/客户表单/打印），仅 init 绑定一次
 *   - 渲染函数绝不 addEventListener 到持久元素
 */
(function () {
  'use strict';

  var Q = null;      // RAKUVIA.quote
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

  /* ---------------- 初始化（事件只绑一次） ---------------- */
  function init(data) {
    Q = window.RAKUVIA.quote;
    P = window.RAKUVIA.price;
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

      // radio 维度
      if (tgt.name && tgt.name.indexOf('dim_') === 0) {
        var dimId = tgt.name.replace('dim_', '');
        var oid = tgt.getAttribute('data-oid');
        if (oid) {
          Q.state.sel[dimId] = oid;
          Q.autoFix(dimId, Number(oid.split('::')[1]));
        } else if (tgt.hasAttribute('data-item-oi')) {
          Q.state.sub[dimId] = { oi: Number(tgt.getAttribute('data-item-oi')), ii: Number(tgt.getAttribute('data-ii')) };
        } else if (tgt.hasAttribute('data-frame-oi')) {
          Q.state.sub[dimId] = {
            oi: Number(tgt.getAttribute('data-frame-oi')),
            finish: tgt.getAttribute('data-finish') || 'シーリング仕上げ',
            fi: Number(tgt.getAttribute('data-fi'))
          };
        } else if (tgt.hasAttribute('data-shift-mm')) {
          var mm = tgt.getAttribute('data-shift-mm');
          if (mm === '') delete Q.state.sub.door_shift;
          else Q.state.sub.door_shift = { mm: mm };
        } else if (tgt.hasAttribute('data-wall-mode')) {
          Q.state.sel.wall_mode = tgt.getAttribute('data-wall-mode');
          if (Q.state.sel.wall_mode !== 'アクセントカラー') delete Q.state.sel.wall_peri;
        }
        renderStep(); renderSummary();
        return;
      }

      if (tgt.name === 'doorPos') {
        Q.state.doorPos = tgt.getAttribute('data-pos');
        renderStep(); renderSummary();
        return;
      }

      if (tgt.hasAttribute('data-color-idx')) {
        var cOid = tgt.getAttribute('data-color-for') || Q.state.sel.door;
        var ci = Number(tgt.getAttribute('data-color-idx'));
        Q.state.sub.door = { oi: Number(cOid.split('::')[1]), colorIdx: ci };
        renderStep(); renderSummary();
        return;
      }

      if (tgt.hasAttribute('data-mirror-oi')) {
        Q.state.sub.mirror = { oi: Number(tgt.getAttribute('data-mirror-oi')), si: Number(tgt.getAttribute('data-si')) };
        renderStep(); renderSummary();
        return;
      }

      if (tgt.hasAttribute('data-grab-oi')) {
        Q.state.sub.grab_bar = { oi: Number(tgt.getAttribute('data-grab-oi')), ii: Number(tgt.getAttribute('data-ii')) };
        renderStep(); renderSummary();
        return;
      }

      if (tgt.hasAttribute('data-lattice')) {
        var ws = Q.state.sub.window_type || {};
        ws.lattice = tgt.getAttribute('data-lattice');
        Q.state.sub.window_type = ws;
        renderStep(); renderSummary();
        return;
      }
      if (tgt.hasAttribute('data-sash')) {
        var ws2 = Q.state.sub.window_type || {};
        ws2.sash = tgt.getAttribute('data-sash');
        Q.state.sub.window_type = ws2;
        renderStep(); renderSummary();
        return;
      }

      if (tgt.hasAttribute('data-toggle')) {
        var tid = tgt.getAttribute('data-toggle');
        if (tgt.checked) { Q.state.toggles[tid] = true; Q.autoFix(tid, 0); }
        else { delete Q.state.toggles[tid]; }
        renderStep(); renderSummary();
        return;
      }
    });

    body.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('[data-size]') : null;
      if (card) {
        Q.state.size = card.getAttribute('data-size');
        renderStep(); renderSummary();
      }
    });
  }

  /* ---------------- 静态事件（仅一次） ---------------- */
  function bindStatic() {
    if (els.btnPrev) els.btnPrev.addEventListener('click', function () { Q.state.step = Math.max(0, Q.state.step - 1); renderAll(); });
    if (els.btnNext) els.btnNext.addEventListener('click', function () { if (Q.state.step < 11) { Q.state.step += 1; renderAll(); } });
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
    var dims = Q.DIMS.filter(function (d) { return d.step === n && d.kind !== 'none'; });
    return dims.some(function (d) {
      if (d.kind === 'toggle') return !!Q.state.toggles[d.id];
      return Q.state.sel[d.id] != null || Q.state.sub[d.id] != null;
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
    var html = '<div class="wiz-step-head">' +
      '<span class="wiz-step-no">' + t('步骤 / STEP', 'ステップ') + ' ' + st.n + ' / 12</span>' +
      '<h3>' + (st.n === 0 ? t('基本套装', '基本プラン') : t(st.titleZh, st.title)) + '</h3>' +
      '<p class="wiz-note">' + esc(st.note) + '</p></div>';

    if (st.n === 0) {
      html += step0Info();
    } else {
      var dims = Q.DIMS.filter(function (d) { return d.step === st.n && d.kind !== 'none'; });
      dims.forEach(function (d) { html += dimensionHtml(d); });
      if (!dims.length) html += '<p class="muted">' + t('该步骤暂无选择项。', 'このステップに選択項目はありません。') + '</p>';
    }
    els.body.innerHTML = html;

    // 底部按钮 / 下载区显隐
    if (els.btnPrev) els.btnPrev.hidden = (st.n === 0);
    if (els.btnNext) els.btnNext.hidden = (st.n === 11);
    if (els.btnFinish) els.btnFinish.hidden = (st.n !== 11);
    if (els.dlRow) els.dlRow.hidden = (st.n !== 11);
  }

  function step0Info() {
    var html = '<div class="opt-block" style="margin-bottom:0;">' +
      '<div class="dim-title">' + t('基本セット価格（税抜・取付・設置費別・不含窗）', '基本セット価格（税抜・取付・設置費別）') + '</div>' +
      '<div class="size-grid">';
    Q.cat('size').options.forEach(function (o) {
      var on = o.code === Q.state.size ? ' on' : '';
      html += '<div class="size-card' + on + '" data-size="' + esc(o.code) + '">' +
        '<div class="size-code">' + esc(o.code) + '</div>' +
        '<div class="size-name">' + esc(o.name_zh || o.name_ja) + '</div>' +
        '<div class="size-price">' + P.yen(o.price) + '</div></div>';
    });
    html += '</div>';
    html += '<p class="base-meta">※ ' + t('1616 基本仕様默认配置：正面壁 Class02 ＋ 周辺壁 Class03、折戸（W800・白）、ストレートラグーン浴槽／FRP 等', 'SIZE1616 基本仕様：正面壁 Class02＋周辺壁 Class03、折戸（W800・白）、ストレートラグーン浴槽／FRP 等') + '</p>';
    html += '</div>';
    return html;
  }

  /* ---------------- 维度渲染 ---------------- */
  function dimensionHtml(d) {
    var html = '<div class="opt-block" data-dim="' + d.id + '">' +
      '<div class="dim-title">' + t(d.titleZh, d.titleJa) + '</div>';
    switch (d.kind) {
      case 'radio': html += radioHtml(d); break;
      case 'mirror': html += mirrorHtml(d); break;
      case 'grab': html += grabHtml(d); break;
      case 'shift': html += shiftHtml(d); break;
      case 'items': html += itemsHtml(d, false); break;
      case 'lidhook': html += itemsHtml(d, true); break;
      case 'frames': html += framesHtml(d); break;
      case 'toggle': html += toggleHtml(d); break;
      case 'custom': html += customHtml(d); break;
      case 'window': html += windowHtml(d); break;
      default: break;
    }
    html += '</div>';
    return html;
  }

  function optPriceClass(diff) {
    if (diff == null || isNaN(diff)) return '';
    if (diff > 0) return ' plus';
    if (diff < 0) return ' minus';
    return ' ok';
  }

  function optPriceText(d, oi, o) {
    if (!o) return '—';
    if (typeof o.priceDiff === 'number') return P.fmtDiff(o.priceDiff);
    if (o.isBasic === true) return t('基本', '基本仕様');
    if (o.priceMatrix || (Array.isArray(o.colorRows) && o.colorRows.length)) {
      var cell = P.matrixCell(o, Q.state.size, Q.state.doorPos, Q.doorColorIdx());
      if (cell != null) return cell;
      return t('按尺寸·位置', 'サイズ別');
    }
    if (o.pricesBySize) {
      var v = P.priceBySize(o, Q.state.size);
      if (v != null) return typeof v === 'number' ? P.fmtDiff(v) : String(v);
      return t('按尺寸', 'サイズ別');
    }
    if (o.prices) {
      var keys = Object.keys(o.prices);
      return keys.map(function (k) { return k + ' ' + P.fmtDiff(o.prices[k]); }).join(' ／ ');
    }
    if (d.id === 'wall_front' || d.id === 'wall_peri') {
      if (d.id === 'wall_front' || (Q.state.sel.wall_mode || 'フルカラー') === 'アクセントカラー') {
        return t('按 Class 查价', 'Class別');
      }
      return '—';
    }
    if (Array.isArray(o.options) && o.options.length) {
      var subs = o.options.map(function (s) { return s.price1620 != null ? s.price1620 : s.price; })
        .filter(function (v) { return v != null && String(v).indexOf('unknown') < 0; });
      return subs.length ? String(subs[0]) + t(' 起', '〜') : t('含组合', '組合あり');
    }
    return '—';
  }

  function priceNum(d, oi, o) {
    var v = optPriceText(d, oi, o);
    var m = String(v).match(/[＋－]?\s*￥\s*([\d,]+)/);
    if (!m) return null;
    var n = parseInt(m[1].replace(/,/g, ''), 10);
    return String(v).indexOf('－') >= 0 ? -n : n;
  }

  function colorRowHtml(d, oi, o) {
    return '<div class="sub-row">' + o.colorRows.map(function (r, ci) {
      var on = Q.doorColorIdx() === ci;
      return '<label class="sub-chip' + (on ? ' on' : '') + '" data-color-for="' + esc(Q.optionId(d.id, oi)) + '">' +
        '<input type="radio" name="color_' + esc(Q.optionId(d.id, oi)) + '" data-color-idx="' + ci + '"' + (on ? ' checked' : '') + '>' +
        esc(r.color_zh || r.color_ja) + '</label>';
    }).join('') + '</div>';
  }

  function optionLabel(d, oi, o) {
    var sel = Q.state.sel[d.id] === Q.optionId(d.id, oi) ? ' on' : '';
    var dis = Q.disabledReason(d.id, oi);
    var disCls = dis ? ' disabled' : '';
    var price = optPriceText(d, oi, o);
    var note = '';
    if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
    var code = o.code ? '<span class="opt-code">' + esc(o.code) + '</span>' : '';
    var extra = '';
    if (d.id === 'wall_front' || d.id === 'wall_peri') {
      var star = o.accentPerimeterOk ? ' ★' : '';
      extra = '<span class="opt-code">' + esc((o.class || '') + (o.kind ? ' / ' + o.kind : '') + star) + '</span>';
      if (d.id === 'wall_peri' && (Q.state.sel.wall_mode || 'フルカラー') !== 'アクセントカラー') {
        dis = t('フルカラー时周辺壁随正面壁', 'フルカラー時は周辺壁も同色');
        disCls = ' disabled';
      }
    }
    if (d.colorSub && Array.isArray(o.colorRows) && o.colorRows.length) {
      extra += colorRowHtml(d, oi, o);
    }
    return '<label class="opt-card' + sel + disCls + '">' +
      '<input type="radio" name="dim_' + d.id + '" data-oid="' + esc(Q.optionId(d.id, oi)) + '"' +
      (sel ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
      '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
      code + '<span class="opt-price' + optPriceClass(priceNum(d, oi, o)) + '">' + esc(price) + '</span>' +
      extra + note + '</label>';
  }

  function radioHtml(d) {
    var html = '<div class="opt-grid">';
    d.idxs.forEach(function (oi) {
      var o = Q.opt(d.id, oi);
      if (!o) return;
      html += optionLabel(d, oi, o);
    });
    html += '</div>';
    if (d.id === 'door') {
      html += '<div class="sub-row"><span class="dim-sub-title">' + t('门位置 / ドア位置：', 'ドア位置：') + '</span>' +
        ['R/L', 'CR/CL'].map(function (pos) {
          var on = Q.state.doorPos === pos;
          return '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="doorPos" data-pos="' + pos + '"' + (on ? ' checked' : '') + '>' + esc(pos) + '</label>';
        }).join('') + '</div>';
    }
    return html;
  }

  function mirrorHtml(d) {
    var html = '<div class="opt-grid">';
    d.idxs.forEach(function (oi) {
      var o = Q.opt(d.id, oi);
      if (!o) return;
      html += optionLabel(d, oi, o);
      if (Array.isArray(o.options) && o.options.length) {
        var oid = Q.optionId(d.id, oi);
        var s = Q.state.sub[d.id];
        var si = (s && s.oi === oi && typeof s.si === 'number') ? s.si : 0;
        html += '<div class="sub-row" style="grid-column:1/-1;">';
        o.options.forEach(function (sub, si2) {
          var v = sub.price1620 != null ? sub.price1620 : sub.price;
          var on = (s && s.oi === oi && s.si === si2);
          html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
            '<input type="radio" name="mirror_sub" data-mirror-oi="' + oi + '" data-si="' + si2 + '"' + (on ? ' checked' : '') + '>' +
            esc(sub.sub_ja || sub.sub || '') + ' <b>' + esc(v) + '</b></label>';
        });
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  function grabHtml(d) {
    var html = '<div class="opt-grid">';
    d.idxs.forEach(function (oi) {
      var o = Q.opt(d.id, oi);
      if (!o) return;
      html += optionLabel(d, oi, o);
      if (Array.isArray(o.items) && o.items.length) {
        var s = Q.state.sub[d.id];
        html += '<div class="sub-row" style="grid-column:1/-1;">';
        o.items.forEach(function (it, ii) {
          var dis = '';
          if (Q.state.size === '1216' && it.size === 'W800') dis = t('1216 不可选 W800', '1216はW800不可');
          if (Q.selOpt('mirror') && Q.selOpt('mirror').code === 'W' && it.size !== 'W600（台座あり）') dis = t('ワイド镜时仅 W600 メタル（台座あり）', 'ワイド鏡時はW600台座ありのみ');
          var on = s && s.oi === oi && s.ii === ii;
          var cells = [it.color, it.size, it.model].filter(Boolean).join(' ');
          html += '<label class="sub-chip' + (on ? ' on' : '') + (dis ? ' dis' : '') + '">' +
            '<input type="radio" name="grab_item" data-grab-oi="' + oi + '" data-ii="' + ii + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
            esc(cells) + ' <b>' + esc(typeof it.price === 'number' ? P.fmtDiff(it.price) : it.price) + '</b></label>';
        });
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  function shiftHtml(d) {
    var o = Q.shiftOption();
    if (!o || !o.prices) return '<p class="muted">' + t('该门型/尺寸无偏移选项。', 'この扉種/サイズはずらし不可。') + '</p>';
    var cur = Q.state.sub.door_shift;
    var html = '<div class="sub-row"><span class="dim-sub-title">' + t('偏移量 / ずらし：', 'ずらし幅：') + '</span>' +
      '<label class="sub-chip' + (!cur || !cur.mm ? ' on' : '') + '"><input type="radio" name="shift_mm" data-shift-mm=""' + (!cur || !cur.mm ? ' checked' : '') + '>' + t('无偏移', 'ずらしなし') + '</label>' +
      Object.keys(o.prices).map(function (key) {
        var mm = key.replace('mm', '');
        var on = cur && cur.mm === mm;
        return '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="shift_mm" data-shift-mm="' + esc(mm) + '"' + (on ? ' checked' : '') + '>' +
          esc(mm) + 'mm <b>' + esc(String(o.prices[key])) + '</b></label>';
      }).join('') + '</div>';
    return html;
  }

  function itemsHtml(d, isLidHook) {
    var o = Q.opt(d.id, d.optIdx);
    if (!o) return '';
    var html = '<div class="sub-row">';
    if (!isLidHook) {
      html += '<label class="sub-chip' + (!Q.state.sub[d.id] ? ' on' : '') + '">' +
        '<input type="radio" name="itm_' + d.id + '" data-item-oi="' + d.optIdx + '" data-ii="-1"' + (!Q.state.sub[d.id] ? ' checked' : '') + '>' +
        t('无', 'なし') + '</label>';
    }
    (o.items || []).forEach(function (it, ii) {
      var s = Q.state.sub[d.id];
      var on = s && s.oi === d.optIdx && s.ii === ii;
      var priceTxt = isLidHook ? lidHookPrice(o, ii) : (typeof it.price === 'number' ? P.fmtDiff(it.price) : (it.price || ''));
      html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
        '<input type="radio" name="itm_' + d.id + '" data-item-oi="' + d.optIdx + '" data-ii="' + ii + '"' + (on ? ' checked' : '') + '>' +
        esc((isLidHook ? (it.name_ja || it.code || '') : ([it.color, it.size, it.model].filter(Boolean).join(' '))) || '') +
        ' <b>' + esc(priceTxt) + '</b></label>';
    });
    html += '</div>';
    return html;
  }

  function lidHookPrice(o, ii) {
    var lid = Q.selOpt('bath_lid');
    var col = 'price2';
    if (lid && lid.code === 'B') col = 'price3';
    var it = (o.items || [])[ii];
    return it ? (it[col] != null ? it[col] : it.price) : '';
  }

  function framesHtml(d) {
    var o = Q.opt(d.id, d.optIdx);
    if (!o) return '';
    var finishes = Object.keys(o.finishes || {});
    var cur = Q.state.sub[d.id];
    var finish = (cur && cur.finish) || (finishes[0] || '');
    var html = '<div class="sub-row"><span class="dim-sub-title">' + t('仕上げ：', '仕上げ：') + '</span>' +
      finishes.map(function (f) {
        var on = finish === f;
        return '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="finish_' + d.id + '" data-finish-sel="' + esc(f) + '"' + (on ? ' checked' : '') + '>' + esc(f) + '</label>';
      }).join('') + '</div>';
    html += '<div class="sub-row">';
    (o.finishes[finish] || []).forEach(function (it, fi) {
      var on = cur && cur.oi === d.optIdx && cur.finish === finish && cur.fi === fi;
      html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
        '<input type="radio" name="itm_' + d.id + '" data-frame-oi="' + d.optIdx + '" data-finish="' + esc(finish) + '" data-fi="' + fi + '"' + (on ? ' checked' : '') + '>' +
        esc([it.code, it.size, it.color, it.dim].filter(Boolean).join(' ')) + ' <b>' + esc(typeof it.price === 'number' ? P.fmtDiff(it.price) : it.price) + '</b></label>';
    });
    html += '</div>';
    return html;
  }

  function toggleHtml(d) {
    var o = Q.opt(d.id, d.optIdx);
    if (!o) return '';
    var dis = Q.disabledReason(d.id, d.optIdx);
    var on = !!Q.state.toggles[d.id];
    var price = typeof o.priceDiff === 'number' ? P.fmtDiff(o.priceDiff) : '—';
    return '<label class="check-row' + (on ? ' on' : '') + (dis ? ' dis' : '') + '">' +
      '<input type="checkbox" data-toggle="' + d.id + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
      '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
      '<span class="opt-price' + optPriceClass(o.priceDiff) + '">' + esc(price) + '</span>' +
      (dis ? '<span class="opt-dis">⛔ ' + esc(dis) + '</span>' : '') + '</label>';
  }

  function customHtml(d) {
    if (d.id === 'wall_mode') {
      var mode = Q.state.sel.wall_mode || 'フルカラー';
      var html = '<div class="sub-row"><span class="dim-sub-title">' + t('配色方案 / ルームカラー：', 'ルームカラー：') + '</span>';
      [['フルカラー', '全色（整圈同色）'], ['アクセントカラー', '强调色（正面壁换色）']].forEach(function (m) {
        var on = mode === m[0];
        html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
          '<input type="radio" name="dim_wall_mode" data-wall-mode="' + esc(m[0]) + '"' + (on ? ' checked' : '') + '>' +
          esc(m[0]) + ' <span class="ja">' + esc(m[1]) + '</span></label>';
      });
      html += '</div>';
      return html;
    }
    return '';
  }

  function windowHtml(d) {
    var html = '<div class="opt-grid">';
    d.idxs.forEach(function (oi) {
      var o = Q.opt(d.id, oi);
      if (!o) return;
      html += optionLabel(d, oi, o);
      if (o.code && o.code !== 'Z' && o.prices) {
        var ws = Q.state.sub.window_type;
        var lattice = ws && ws.lattice === 'あり' ? 'あり' : 'なし';
        html += '<div class="sub-row" style="grid-column:1/-1;">' +
          ['なし', 'あり'].map(function (v) {
            var on = lattice === v;
            return '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="window_lattice" data-lattice="' + v + '"' + (on ? ' checked' : '') + '>面格子' + esc(v) + ' <b>' + esc(P.fmtDiff(o.prices['面格子' + (v === 'あり' ? 'あり' : 'なし')])) + '</b></label>';
          }).join('') + '</div>';
        var sash = ws && ws.sash ? ws.sash : 'ホワイト';
        html += '<div class="sub-row" style="grid-column:1/-1;"><span class="dim-sub-title">' + t('サッシ色：', 'サッシ色：') + '</span>' +
          (o.sashColors || ['ホワイト']).map(function (c) {
            var on = sash === c;
            return '<label class="sub-chip' + (on ? ' on' : '') + '"><input type="radio" name="window_sash" data-sash="' + esc(c) + '"' + (on ? ' checked' : '') + '>' + esc(c) + '</label>';
          }).join('') + '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  /* ---------------- 合计栏 ---------------- */
  function renderSummary() {
    var r = Q.computeQuote();
    var optTotal = r.totalEx - r.basePrice;
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
      '<div class="doc-sub">CleanUp rakuvia（クリナップ）システムバス ／ 整体浴室</div>' +
      '<div class="doc-meta">' +
      '<span>' + t('日期 / 日付：', '日付：') + esc(head.date || dateNow()) + '</span>' +
      '<span>' + t('尺寸 / サイズ：', 'サイズ：') + esc(r.size) + '</span>' +
      '<span>' + t('门位 / ドア位置：', 'ドア位置：') + esc(r.doorPos) + '</span>' +
      (head.customer ? '<span>' + t('客户 / お客様：', 'お客様：') + esc(head.customer) + '</span>' : '') +
      (head.phone ? '<span>' + t('电话 / TEL：', 'TEL：') + esc(head.phone) + '</span>' : '') +
      '</div></div>';

    var byStep = {};
    r.lines.forEach(function (l) { (byStep[l.step] = byStep[l.step] || []).push(l); });
    Object.keys(byStep).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (s) {
      var lines = byStep[s];
      var zh = lines[0].stepZh, ja = lines[0].stepJa;
      html += '<div class="doc-section">' +
        '<div class="doc-sec-title"><span>' + t('STEP ' + s, 'STEP ' + s) + '</span>' + (s === '0' ? t('基本套装', '基本プラン') : t(zh, ja)) + '</div>' +
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
      '<div class="doc-row big accent"><div class="doc-q">' + t('大陆地区价格（人民币 · 已含安装人工费）/ 中国本土価格（据付費込）', '中国本土価格（据付費込）') + '</div>' +
      '<div class="doc-a">' + (r.rmbAllIn != null ? '¥' + Number(r.rmbAllIn).toLocaleString() : t('请输入汇率', '為替を入力してください')) + '</div></div>' +
      (rate ? '<div class="doc-formula">' + t('使用汇率：1日元 = ' + rate + ' 人民币 ｜ 公式：大陆地区价格 = 日元税込 × 汇率 × 0.7（7折，已含安装人工费）', '為替：1円 = ' + rate + ' RMB ｜ 中国本土価格 = 税込 × 為替 × 0.7（据付費込み）') + '</div>' : '') +
      '</div>';

    if (r.unknown.length) {
      html += '<div class="doc-section"><div class="doc-sec-title"><span>⚠</span>' + t('未计价项 / 未計上', '未計上') + '</div>' +
        '<div class="doc-row"><div class="doc-q">' + t('以下项价格未标注/需查表，未计入合计：', '以下の項目は価格未記載のため合計に含まれません：') +
        r.unknown.map(function (u) { return esc(u.name); }).join('、') + '</div></div></div>';
    }

    html += '<div class="doc-footer">' +
      '<p>' + t('※ 所示价格为不含税参考价，最终以クリナップ正式見積書为准', '※ 表示価格は税抜きの参考価格です。正式な見積はお見積書でご確認ください') + '</p>' +
      '<p>※ ' + t('基本セット価格は取付・設置費別（不含安装费）／窓本体・窓枠は含まれません（不含窗本体/窗框）', '基本セット価格（取付・設置費別）／窓本体・窓枠は含まれません') + '</p>' +
      '<p>※ ' + t('大陸地区価格は税込 × 為替 × 0.7（7折）で算出し、据付人工費込みです（大陆地区价格=日元税込×汇率×0.7，已含安装人工费）', '中国本土価格は税込×為替×0.7で算出（据付人工費込み）') + '</p>' +
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
    var lines = ['【rakuvia 系统浴室 見積（报价）选型清单】'];
    lines.push('尺寸：' + r.size + ' ｜ 门位置：' + r.doorPos);
    lines.push('—'.repeat(30));
    r.lines.forEach(function (l) {
      lines.push((l.base ? '套装价  ' : '        ') + l.nameZh + (l.extra ? '（' + l.extra + '）' : '') + (l.base ? '' : '  ' + P.fmtDiff(l.diff)));
    });
    lines.push('—'.repeat(30));
    lines.push('日元合计（税抜）：' + P.yen(r.totalEx));
    lines.push('日元合计（税込）：' + P.yen(r.totalInc));
    if (r.rmbAllIn != null) lines.push('大陆地区价格（人民币含安装，7折）：¥' + Number(r.rmbAllIn).toLocaleString());
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
    a.download = 'rakuvia-quote.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.RAKUVIA = window.RAKUVIA || {};
  window.RAKUVIA.wizard = {
    init: init,
    renderAll: renderAll,
    renderQuote: renderQuote,
    renderSummary: renderSummary,
    setLang: function (l) { if (l === 'zh' || l === 'ja' || l === 'both') LANG = l; renderAll(); renderQuote(); },
    state: { get lang() { return LANG; } }
  };
})();
