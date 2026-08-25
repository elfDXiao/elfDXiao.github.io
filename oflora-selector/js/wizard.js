/**
 * wizard.js — Panasonic オフローラ（Oflora）整体浴室选型报价 UI（elf_D老肖的世界 风格，分步向导 + 报价单 两个标签页）
 *
 * 视图：选型向导（横向步骤条 + 选项区 + 右侧合计栏）/ 报价单（見積書）
 * 依赖：window.OFLORA_DATA、window.OFLORA.price、window.OFLORA.quote
 * 暴露：window.OFLORA.wizard = { init, renderAll, renderQuote, state }
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

  var Q = null;      // OFLORA.quote
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
    Q = window.OFLORA.quote;
    P = window.OFLORA.price;
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

      // 壁柄周囲パネル柄（跳色模式第二段）
      if (tgt.hasAttribute('data-wall-surround')) {
        var scode = tgt.getAttribute('data-wall-surround');
        if (scode) Q.state.sel.wall_surround = scode;
        else delete Q.state.sel.wall_surround;
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
      '<h3>' + (st.n === 0 ? t('方案·尺寸', 'プラン・サイズ') : t(st.titleZh, st.title)) + '</h3>' +
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

  /* 步骤 0：プラン选项卡 + 尺寸卡片 + 照片套餐 */
  function step0Info() {
    var html = '';
    // プラン（4 种）
    var pd = Q.dim('plan');
    html += '<div class="opt-block" data-dim="plan">' +
      '<div class="dim-title">' + t(pd.titleZh, pd.titleJa) + '（' + tp('决定套装价', '套装価格を決定') + '）</div>' +
      '<div class="opt-grid">';
    Q.codesOf(pd).forEach(function (code) {
      var o = Q.opt('plan', code);
      if (!o) return;
      var sel = Q.planCode() === code ? ' on' : '';
      var dis = Q.disabledReason('plan', code);
      var disCls = dis ? ' disabled' : '';
      var price = o.pricesBySize ? o.pricesBySize[Q.sizeCode()] : null;
      var priceTxt = typeof price === 'number' ? P.yen(price) : tp('无该型号', '—');
      var note = '';
      if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
      html += '<label class="opt-card' + sel + disCls + '">' +
        '<input type="radio" name="dim_plan" data-code="' + esc(code) + '"' + (sel ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
        '<span class="opt-name">' + esc(o.name_zh || o.name_ja) + '<em>' + esc(o.name_ja || '') + '</em></span>' +
        '<span class="opt-price">' + esc(priceTxt) + '</span>' +
        (o.note ? '<span class="opt-dis" style="color:var(--ink-3);">' + esc(o.note) + '</span>' : '') +
        note + '</label>';
    });
    html += '</div></div>';

    // 尺寸卡片
    html += '<div class="opt-block" style="margin-bottom:0;">' +
      '<div class="dim-title">' + t('套装价（税抜・プラン×サイズ・取付設置費別）', '套装価格（税抜・プラン×サイズ・取付設置費別）') + '</div>' +
      '<div class="size-grid">';
    Q.cat('size').options.forEach(function (o) {
      var on = o.code === Q.state.size ? ' on' : '';
      var byType = o.pricesByType ? o.pricesByType[Q.planCode()] : null;
      var price = (byType && typeof byType === 'object') ? byType[o.code] : byType;
      var priceTxt, hint = '';
      if (typeof price === 'number') {
        priceTxt = P.yen(price);
      } else {
        var alt = Q.sizeAltPrice(o.code);
        if (alt) {
          priceTxt = P.yen(alt.price);
          hint = '<span class="size-alt">' + esc(tp('当前方案无 ' + Q.planCode() + '，最低可用 ' + alt.plan + 'プラン', 'このプランには設定なし、最低 ' + alt.plan + ' プラン')) + '</span>';
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
    html += '<p class="base-meta">※ ' + t('1616 ベースプラン ¥1,273,250（税抜）；プラン×サイズ 4×6 全组合有价', '1616 ベースプラン ¥1,273,250（税抜）；プラン×サイズ 4×6 全組合せ有効') + '</p>';
    html += '</div>';

    // 照片套餐（参考）
    var ps = Q.dim('photo_set');
    if (ps) html += dimensionHtml(ps);

    return html;
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
    html += '</div>';
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
    var v = P.priceFor(o, Q.planCode(), Q.sizeCode());
    return (typeof v === 'number') ? v : null;
  }

  function optionLabel(d, code, o) {
    var sel = Q.state.sel[d.id] === code ? ' on' : '';
    var dis = Q.disabledReason(d.id, code);
    var disCls = dis ? ' disabled' : '';
    var s = P.optionPriceSummary(o, Q.planCode(), Q.sizeCode());
    var price = (s.type === 'basic') ? tp('基本', '基本仕様') : s.text;
    var note = '';
    if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
    if (o.note && /★|受注終了/.test(o.note)) note += '<span class="opt-dis" style="color:#b03a2e;">⚠受注終了</span>';
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
    // 壁アクセント位置：三模式引导文案（A 四面同花 / B 跳色器具面侧=正面 / C 跳色浴缸侧=侧面）
    if (d.id === 'wall_accent') {
      var html = '<p class="muted" style="margin:-4px 0 8px;">' +
        t('先选墙面模式，再选花纹（跳色：先选跳色色，再选四面墙板色）', '先にモード、次に柄を選択（アクセント：先にアクセント色、次に周囲パネル色）') + '</p>';
      html += '<div class="opt-grid">';
      Q.codesOf(d).forEach(function (code) {
        var o = Q.opt(d.id, code);
        if (!o) return;
        html += optionLabel(d, code, o);
      });
      html += '</div>';
      var chips0 = pseudoChips(d);
      if (chips0) html += '<div class="sub-row">' + chips0 + '</div>';
      return html;
    }
    // 壁柄（wall_pattern）：按壁アクセント位置两段式——A 四面同柄单段；B/C 跳色先选跳色面板柄再选周囲面板柄
    if (d.id === 'wall_pattern') {
      var mode = Q.state.sel.wall_accent || 'B';
      var codesAll = Q.codesOf(d);
      var bCodes = [], dCodes = [];
      codesAll.forEach(function (code) {
        if (/^D[A-D]$/.test(String(code))) dCodes.push(code);
        else bCodes.push(code);
      });
      var html = '';
      if (mode === 'A') {
        // 四面同柄：单段（B 级 + D 级 DC/DD；DA/DB 仅跳色禁用）
        html += '<p class="muted" style="margin:-4px 0 8px;">' +
          t('四面同花：直接选择 4 面同一花纹（B 级 +¥79,200／D 级 −¥29,150）', '全面同柄：4面同一の柄を選択（Bグレード +¥79,200／Dグレード −¥29,150）') + '</p>';
        html += '<div class="dim-group-title">' + t('花纹·B グレード（' + bCodes.length + ' 柄）', 'Bグレード柄（' + bCodes.length + ' 種）') + '</div>';
        html += '<div class="opt-grid">';
        bCodes.forEach(function (code) {
          var o = Q.opt(d.id, code);
          if (!o) return;
          html += optionLabel(d, code, o);
        });
        html += '</div>';
        var dOk = dCodes.filter(function (code) { return code === 'DC' || code === 'DD'; });
        if (dOk.length) {
          html += '<div class="dim-group-title">' + t('花纹·D グレード（' + dOk.length + ' 柄）', 'Dグレード柄（' + dOk.length + ' 種）') + '</div>';
          html += '<div class="opt-grid">';
          dOk.forEach(function (code) {
            var o = Q.opt(d.id, code);
            if (!o) return;
            html += optionLabel(d, code, o);
          });
          html += '</div>';
        }
      } else {
        // 跳色（B 正面/C 側面）：先选跳色面板柄（アクセント柄）→ 再选周囲面板柄
        html += '<p class="muted" style="margin:-4px 0 8px;">' +
          t('先选跳色花纹，再选四面墙板色（跳色面板 B 级 ±0／D 级 −¥29,150）', '先にアクセント柄、次に周囲パネル色を選択（アクセント Bグレード ±0／Dグレード −¥29,150）') + '</p>';
        html += '<div class="dim-group-title">' + t('跳色花纹（先选）·B グレード（' + bCodes.length + ' 柄）', 'アクセント柄（先に選択）·Bグレード（' + bCodes.length + ' 種）') + '</div>';
        html += '<div class="opt-grid">';
        bCodes.forEach(function (code) {
          var o = Q.opt(d.id, code);
          if (!o) return;
          html += optionLabel(d, code, o);
        });
        html += '</div>';
        html += '<div class="dim-group-title">' + t('跳色花纹（先选）·D グレード（アクセント専用）', 'アクセント柄（先に選択）·Dグレード（アクセント専用）') + '</div>';
        html += '<div class="opt-grid">';
        dCodes.forEach(function (code) {
          if (code !== 'DA' && code !== 'DB') return;
          var o = Q.opt(d.id, code);
          if (!o) return;
          html += optionLabel(d, code, o);
        });
        html += '</div>';
        // 周囲面板柄（四面墙板色，D 级 DC/DD）
        html += '<div class="dim-group-title">' + t('四面墙板色 / 周囲パネル色', '周囲パネル色') + '</div>';
        html += '<div class="sub-row" style="margin-top:4px;">';
        ['DC', 'DD'].forEach(function (code) {
          var o = Q.opt(d.id, code);
          if (!o) return;
          var on = Q.state.sel.wall_surround === code;
          html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
            '<input type="radio" name="wall_surround" data-wall-surround="' + esc(code) + '"' + (on ? ' checked' : '') + '>' +
            esc(o.name_zh || o.name_ja || code) + ' <span class="ja">' + esc(o.name_ja || '') + '</span></label>';
        });
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
      var s = P.optionPriceSummary(o, Q.planCode(), Q.sizeCode());
      var price = (s.type === 'basic') ? tp('基本', '基本仕様') : s.text;
      var note = '';
      if (dis) note = '<span class="opt-dis">⛔ ' + esc(dis) + '</span>';
      if (o.note && /★|受注終了/.test(o.note)) note += '<span class="opt-dis" style="color:#b03a2e;">⚠受注終了</span>';
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
    if (els.sumType) els.sumType.textContent = r.plan + 'プラン';
    if (els.sumSize) els.sumSize.textContent = r.size;
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
    var html = '';

    html += '<div class="doc-header">' +
      '<div class="doc-brand">elf_D老肖的世界<span>DESIGN STUDIO</span></div>' +
      '<h1>' + t('報 价 单', '見 積 書') + '</h1>' +
      '<div class="doc-sub">Panasonic オフローラ（Oflora）／ 整体浴室</div>' +
      '<div class="doc-meta">' +
      '<span>' + t('日期 / 日付：', '日付：') + esc(head.date || dateNow()) + '</span>' +
      '<span>' + t('尺寸 / サイズ：', 'サイズ：') + esc(r.size) + '</span>' +
      '<span>' + t('方案 / プラン：', 'プラン：') + esc(r.plan) + '</span>' +
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
        '<div class="doc-sec-title"><span>' + t('STEP ' + s, 'STEP ' + s) + '</span>' + (s === '0' ? t('方案·尺寸', 'プラン・サイズ') : t(zh, ja)) + '</div>' +
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
      '<p>' + t('※ 所示价格为不含税参考价，最终以 Panasonic 正式見積書为准', '※ 表示価格は税抜きの参考価格です。正式な見積はお見積書でご確認ください') + '</p>' +
      '<p>※ ' + t('套装价は取付・設置費別（不含安装费）', '套装価格（取付・設置費別）') + '</p>' +
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
    var lines = ['【Panasonic オフローラ（Oflora）見積（报价）选型清单】'];
    lines.push('品番：' + Q.productNo());
    lines.push('尺寸：' + r.size + ' ｜ 方案：' + r.plan + 'プラン');
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
    a.download = 'oflora-quote.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.OFLORA = window.OFLORA || {};
  window.OFLORA.wizard = {
    init: init,
    renderAll: renderAll,
    renderQuote: renderQuote,
    renderSummary: renderSummary,
    setLang: function (l) { if (l === 'zh' || l === 'ja' || l === 'both') LANG = l; renderAll(); renderQuote(); },
    state: { get lang() { return LANG; } }
  };
})();
