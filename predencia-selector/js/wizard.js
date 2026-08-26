/**
 * wizard.js — TAKARA STANDARD プレデンシア（Predencia）选型报价 UI（elf_D老肖的世界 风格，分步向导 + 报价单 两个标签页）
 *
 * 视图：选型向导（横向步骤条 + 选项区 + 右侧合计栏）/ 报价单（見積書）
 * 依赖：window.PREDENCIA_DATA、window.PREDENCIA.price、window.PREDENCIA.quote
 * 暴露：window.PREDENCIA.wizard = { init, renderAll, renderQuote, state }
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

  var Q = null;      // PREDENCIA.quote
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
    Q = window.PREDENCIA.quote;
    P = window.PREDENCIA.price;
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
      if (tgt.hasAttribute('data-pitari-col')) {
        Q.state.pitariCol = tgt.getAttribute('data-pitari-col');
        renderStep(); renderSummary();
        return;
      }
      if (tgt.hasAttribute('data-pitari-row')) {
        Q.state.pitariRow = tgt.getAttribute('data-pitari-row');
        Q.autoFix('pitari_row', Q.state.pitariRow);
        renderStep(); renderSummary();
        return;
      }

      // radio 维度（data-dim + data-code / data-basic / data-none）
      if (tgt.name && tgt.name.indexOf('dim_') === 0) {
        var dimId = tgt.name.replace('dim_', '');
        if (tgt.hasAttribute('data-code')) {
          var code = tgt.getAttribute('data-code');
          // mode 是独立状态（Q.state.mode），且为 radio 语义
          if (dimId === 'mode') {
            Q.state.mode = code;
            Q.state.sel.mode = code;
            Q.autoFix('mode', code);
          } else {
            Q.state.sel[dimId] = code;
            Q.autoFix(dimId, code);
          }
        } else if (tgt.hasAttribute('data-basic')) {
          var vb = Q.virtualBasicOf(Q.dim(dimId));
          if (vb) Q.state.sel[dimId] = vb.code;
        } else if (tgt.hasAttribute('data-none')) {
          delete Q.state.sel[dimId];
        }
        renderStep(); renderSummary();
        return;
      }

      // 壁柄周辺柄（2TONE 第二段）
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
      if (d.id === 'bathtub' && Q.isPitari()) return true;   // ぴったりは浴槽行で決定
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
      '<h3>' + (st.n === 0 ? t('尺寸选择', 'サイズ選択') : t(st.titleZh, st.title)) + '</h3>' +
      '<p class="wiz-note">' + esc(st.note) + '</p></div>';

    if (st.n === 0) {
      html += step0Info();
    } else {
      var dims = Q.DIMS.filter(function (d) { return d.step === st.n; });
      dims.forEach(function (d) {
        if (d.id === 'bathtub' && Q.isPitari()) return;   // ぴったりモード：形状は浴槽行
        html += dimensionHtml(d);
      });
      if (!dims.length) html += '<p class="muted">' + t('该步骤暂无选择项。', 'このステップに選択項目はありません。') + '</p>';
    }
    els.body.innerHTML = html;

    var lastStep = Q.STEPS.length - 1;
    if (els.btnPrev) els.btnPrev.hidden = (st.n === 0);
    if (els.btnNext) els.btnNext.hidden = (st.n === lastStep);
    if (els.btnFinish) els.btnFinish.hidden = (st.n !== lastStep);
    if (els.dlRow) els.dlRow.hidden = (st.n !== lastStep);
  }

  /* 步骤 0：モード切替 + 尺寸卡片 / ぴったり間口×浴槽行（无套餐预设，按手册 LET'S MAKE A BATHROOM 流程） */
  function step0Info() {
    var html = '';
    // モード選択
    var md = Q.dim('mode');
    html += '<div class="opt-block" data-dim="mode">' +
      '<div class="dim-title">' + t('尺寸模式 / サイズモード', 'サイズモード') + '</div>' +
      '<div class="sub-row">';
    Q.codesOf(md).forEach(function (code) {
      var o = Q.opt('mode', code);
      if (!o) return;
      var on = Q.state.mode === code ? ' on' : '';
      var note = o.note ? ' <span class="ja">' + esc(o.note) + '</span>' : '';
      html += '<label class="sub-chip' + on + '">' +
        '<input type="radio" name="dim_mode" data-code="' + esc(code) + '"' + (on ? ' checked' : '') + '>' +
        esc(o.name_zh || o.name_ja) + ' <span class="ja">' + esc(o.name_ja || '') + '</span>' + note + '</label>';
    });
    html += '</div></div>';

    if (Q.isPitari()) {
      html += pitariSelect();
    } else {
      html += sizeSelect();
    }
    return html;
  }

  /* 規格モード：尺寸 6 種カード（套装基准价＝基本套餐・ベーシック構成） */
  function sizeSelect() {
    var html = '';
    html += '<div class="opt-block" style="margin-bottom:0;">' +
      '<div class="dim-title">' + t('套装基准价（税抜・取付設置費別）', '套装基準価格（税抜・取付設置費別）') + '</div>' +
      '<div class="size-grid">';
    Q.cat('size').options.forEach(function (o) {
      var on = o.code === Q.state.size ? ' on' : '';
      var pp = window.PREDENCIA_DATA.meta.planPrices;
      var price = (pp && pp.basic) ? pp.basic[o.code] : null;
      var priceTxt, hint = '';
      if (typeof price === 'number') {
        priceTxt = P.yen(price);
      } else {
        var alt = Q.sizeAltPrice(o.code);
        if (alt) {
          priceTxt = P.yen(alt.price);
          hint = '<span class="size-alt">' + esc(tp('基准套装未定价，按最低参考价显示', '基準セット未定価、最低参考価格で表示')) + '</span>';
        } else {
          priceTxt = tp('—', '—');
        }
      }
      html += '<div class="size-card' + on + '" data-size="' + esc(o.code) + '">' +
        '<div class="size-code">' + esc(o.code) + '</div>' +
        '<div class="size-name">' + esc(o.name_zh || o.name_ja) + '</div>' +
        '<div class="size-price">' + priceTxt + '</div>' + hint + '</div>';
    });
    html += '</div>';
    html += '<p class="base-meta">※ ' + t('套装基准价＝基本配置（ベーシック構成）：人造大理石カウンター・洗い場側水栓タイプ基準（税抜・取付費別）。1620 は戸建て用のみ；1216/1317/1418 はマンション・戸建階上用のみ；1616/S1216 は両用。', '套装基準価格＝基本構成（ベーシック）。人造大理石カウンター・洗い場側水栓基準（税抜・取付費別）。1620 は戸建て用のみ；1216/1317/1418 はマンション・戸建階上用のみ；1616/S1216 は両用。') + '</p>';
    html += '</div>';
    return html;
  }

  /* ぴったりモード：間口 13 区分 × 浴槽行 9 種 */
  function pitariSelect() {
    var m = window.PREDENCIA_DATA.meta.pitariMatrix;
    if (!m) return '<p class="muted">ぴったりサイズ価格表データなし</p>';
    var html = '';

    // 浴槽行（9 種）
    html += '<div class="opt-block" data-dim="pitari_row">' +
      '<div class="dim-title">' + t('浴槽行 / 浴槽行', '浴槽行（形状×奥行）') + '</div>' +
      '<div class="opt-grid">';
    m.rows.forEach(function (r, i) {
      var code = 'R' + i;
      var on = Q.state.pitariRow === r.code ? ' on' : '';
      var priceTxt = typeof r.prices[Q.pitariColIdx()] === 'number' ? P.yen(r.prices[Q.pitariColIdx()]) : tp('—', '—');
      html += '<label class="opt-card' + on + '">' +
        '<input type="radio" name="pitari_row" data-pitari-row="' + esc(r.code) + '"' + (on ? ' checked' : '') + '>' +
        '<span class="opt-name">' + esc(r.name_zh) + '<em>' + esc(r.name_ja) + '</em></span>' +
        '<span class="opt-price">' + priceTxt + '</span></label>';
    });
    html += '</div></div>';

    // 間口区分（13 種）
    html += '<div class="opt-block" data-dim="pitari_col">' +
      '<div class="dim-title">' + t('間口区分 / 间口分区', '間口区分') + '</div>' +
      '<div class="opt-grid">';
    m.cols.forEach(function (c, i) {
      var code = 'C' + i;
      var on = Q.state.pitariCol === code ? ' on' : '';
      var priceTxt = typeof m.rows[Q.pitariRowIdx()].prices[i] === 'number' ? P.yen(m.rows[Q.pitariRowIdx()].prices[i]) : tp('—', '—');
      html += '<label class="opt-card' + on + '">' +
        '<input type="radio" name="pitari_col" data-pitari-col="' + code + '"' + (on ? ' checked' : '') + '>' +
        '<span class="opt-name">' + esc(c.name_ja) + '<em>' + esc('間口 ' + c.name_ja + 'mm') + '</em></span>' +
        '<span class="opt-price">' + priceTxt + '</span></label>';
    });
    html += '</div></div>';

    html += '<p class="base-meta">※ ' + t('ぴったりサイズは受注生産品（納期要問合せ）。価格は人造大理石製カウンターあり・洗い場側水栓タイプ基準（税抜・取付費別）。間口2175〜2450 はマンション・階上低床タイプ非対応。', 'ぴったりサイズは受注生産品。価格は人造大理石カウンターあり基準（税抜・取付費別）。間口2175〜2450 はマンション・階上低床タイプ非対応。') + '</p>';
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
    if (o.priceUnknown) return null;
    var v = P.priceFor(o, Q.planCode(), Q.isPitari() ? null : Q.sizeCode());
    return (typeof v === 'number') ? v : null;
  }

  function optionLabel(d, code, o) {
    var sel = Q.state.sel[d.id] === code ? ' on' : '';
    var dis = Q.disabledReason(d.id, code);
    var disCls = dis ? ' disabled' : '';
    var s = P.optionPriceSummary(o, Q.planCode(), Q.isPitari() ? null : Q.sizeCode());
    var price = (s.type === 'basic') ? tp('基本', '基本仕様') : s.text;
    // 壁柄：按当前模式×クラス显示参考差价（2TONE 待周辺选择）
    if (d.id === 'wall_panel') {
      var wMode = Q.state.sel.wall_design;
      if (wMode === '2TONE') {
        price = tp('周辺选择后计价', '周辺選択で価格確定');
      } else if (wMode) {
        var wdO = Q.opt('wall_design', wMode);
        var clsK = o.cls === 'premium' ? 'P' : 'H';
        var v = wdO && wdO.priceByClass ? wdO.priceByClass[clsK] : null;
        price = (v == null) ? '—' : P.fmtDiff(v);
      }
    }
    if (o.priceUnknown) price = t('価格未掲載', '価格未掲載');
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

  /* 壁柄：プレミアム/ハイ クラス分组 + 2TONE 两段式（先カウンター面柄 → 周辺柄） */
  function wallPanelHtml(d) {
    var mode = Q.state.sel.wall_design;
    var codes = Q.codesOf(d);
    var prem = [], high = [];
    codes.forEach(function (code) {
      var o = Q.opt(d.id, code);
      if (!o) return;
      if (o.cls === 'premium') prem.push(code); else high.push(code);
    });
    var html = '';
    // 引导文案（Sazana 式：先选模式，再选花纹；2TONE 先跳色后四面）
    if (mode === '2TONE') {
      html += '<p class="muted" style="margin:-4px 0 8px;">' +
        t('双色整面：先选台面侧花纹（カウンター面），再选周边花纹（周辺パネル）', '2トーン：先にカウンター面柄、次に周辺柄を選択してください') + '</p>';
    } else {
      html += '<p class="muted" style="margin:-4px 0 8px;">' +
        t('选择墙面色纹（价格按所选等级计算）', '壁柄を選択してください（価格は選択クラスで計算）') + '</p>';
    }
    if (prem.length) {
      html += '<div class="dim-group-title">' + t('花纹·プレミアムクラス（＋15,000・' + prem.length + ' 柄）', 'プレミアムクラス（＋15,000・' + prem.length + ' 柄）') + '</div>';
      html += '<div class="opt-grid">';
      prem.forEach(function (code) {
        var o = Q.opt(d.id, code);
        if (o) html += optionLabel(d, code, o);
      });
      html += '</div>';
    }
    if (high.length) {
      html += '<div class="dim-group-title">' + t('花纹·ハイクラス（基本仕様・' + high.length + ' 柄）', 'ハイクラス（基本仕様・' + high.length + ' 柄）') + '</div>';
      html += '<div class="opt-grid">';
      high.forEach(function (code) {
        var o = Q.opt(d.id, code);
        if (o) html += optionLabel(d, code, o);
      });
      html += '</div>';
    }
    // 2TONE：周辺柄 chips（カウンター面ハイ時プレミアム不可）
    if (mode === '2TONE') {
      var cp = Q.state.sel.wall_panel;
      var cpCls = cp ? Q.wallClsOf(cp) : null;
      html += '<div class="dim-group-title">' + t('周边花纹（四面墙板）·' + (prem.length + high.length) + ' 柄', '周辺柄（四面パネル）') + '</div>';
      html += '<div class="sub-row" style="margin-top:4px;">';
      codes.forEach(function (code) {
        var o = Q.opt(d.id, code);
        if (!o) return;
        var dis = (cpCls === 'H' && o.cls === 'premium');
        var on = Q.state.sel.wall_surround === code;
        html += '<label class="sub-chip' + (on ? ' on' : '') + (dis ? ' dis' : '') + '"' + (dis ? ' title="' + esc('カウンター面ハイクラス時、周辺にプレミアム不可') + '"' : '') + '>' +
          '<input type="radio" name="wall_surround" data-wall-surround="' + esc(code) + '"' + (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
          esc(o.name_zh || o.name_ja || code) + ' <span class="ja">' + esc(o.name_ja || '') + '</span></label>';
      });
      html += '</div>';
    }
    var chips = pseudoChips(d);
    if (chips) html += '<div class="sub-row">' + chips + '</div>';
    return html;
  }

  /* カウンター連動：洗い場用水栓（規格: counterFor で絞る） */
  function faucetHtml(d) {
    var counterSel = Q.state.sel.counter;
    var codes = Q.codesOf(d);
    var shown = codes.filter(function (code) {
      var o = Q.opt(d.id, code);
      if (!o) return false;
      if (counterSel == null) return true;
      var cf = o.counterFor;
      if (Q.isPitari()) {
        if (counterSel === 'QS_dual_p') return cf === 'QS_dual';
        if (counterSel === 'QS_p') return cf === 'QS';
        if (counterSel === 'ART_p' || counterSel === 'cover_p') return cf === 'ART';
        if (counterSel === 'none') return cf === 'none';
        return true;
      }
      if (counterSel === 'QS_dual') return cf === 'QS_dual';
      if (counterSel === 'QS' || counterSel === 'ART') return cf === 'QS_ART';
      if (counterSel === 'none') return cf === 'none';
      return true;
    });
    var html = '';
    if (counterSel == null) {
      html += '<p class="muted" style="margin:-4px 0 8px;">' +
        t('先选择台面，水龙头将自动联动显示。', '先にカウンターを選択してください（水栓は連動表示）。') + '</p>';
    }
    html += '<div class="opt-grid">';
    shown.forEach(function (code) {
      var o = Q.opt(d.id, code);
      if (o) html += optionLabel(d, code, o);
    });
    html += '</div>';
    var chips = pseudoChips(d);
    if (chips) html += '<div class="sub-row">' + chips + '</div>';
    return html;
  }

  function radioHtml(d) {
    // 壁デザインパターン：三模式 chips（1面/整面同色4面/双色2トーン，Sazana 式）
    if (d.id === 'wall_design') {
      var cur = Q.state.sel.wall_design || 'ALL4';
      var html = '<p class="muted" style="margin:-4px 0 8px;">' +
        t('先选墙面模式，再选花纹（双色：先选台面侧花纹，再选周边花纹）', '先にモード、次に柄を選択（2トーン：先にカウンター面柄、次に周辺柄）') + '</p>';
      html += '<div class="sub-row">';
      [['1FACE', '单面设计（台面侧）', '1面デザイン（カウンター面）'],
        ['ALL4', '整面同色（4面）', '全面デザイン（4面同色）'],
        ['2TONE', '双色整面（2トーン）', '全面デザイン（2トーン）']].forEach(function (m) {
        var on = cur === m[0];
        html += '<label class="sub-chip' + (on ? ' on' : '') + '">' +
          '<input type="radio" name="dim_wall_design" data-code="' + m[0] + '"' + (on ? ' checked' : '') + '>' +
          esc(m[1]) + ' <span class="ja">' + esc(m[2]) + '</span></label>';
      });
      html += '</div>';
      var chips0 = pseudoChips(d);
      if (chips0) html += '<div class="sub-row">' + chips0 + '</div>';
      return html;
    }
    // 壁柄分组
    if (d.id === 'wall_panel') return wallPanelHtml(d);
    // 水栓連動
    if (d.id === 'faucet') return faucetHtml(d);
    var html = '<div class="opt-grid">';
    var codes = Q.codesOf(d);
    codes.forEach(function (code) {
      var o = Q.opt(d.id, code);
      if (!o) return;
      html += optionLabel(d, code, o);
    });
    html += '</div>';
    var chips = pseudoChips(d);
    if (chips) html += '<div class="sub-row">' + chips + '</div>';
    return html;
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
      var s = P.optionPriceSummary(o, Q.planCode(), Q.isPitari() ? null : Q.sizeCode());
      var price = (s.type === 'basic') ? tp('基本', '基本仕様') : s.text;
      if (o.priceUnknown) price = t('価格未掲載', '価格未掲載');
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
    if (els.sumType) els.sumType.textContent = r.plan;
    if (els.sumSize) els.sumSize.textContent = Q.isPitari() ? (Q.pitariColName() + '×' + Q.state.pitariRow) : r.size;
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
      '<div class="doc-sub">TAKARA STANDARD プレデンシア（Predencia）／ 系统浴室</div>' +
      '<div class="doc-meta">' +
      '<span>' + t('日期 / 日付：', '日付：') + esc(head.date || dateNow()) + '</span>' +
      '<span>' + t('尺寸 / サイズ：', 'サイズ：') + esc(Q.isPitari() ? (Q.pitariColName() + '×' + Q.pitariRowName()) : r.size) + '</span>' +
      '<span>' + t('构成 / 構成：', '構成：') + esc(Q.isPitari() ? 'ぴったりサイズ' : r.plan) + '</span>' +
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
        '<div class="doc-sec-title"><span>' + t('STEP ' + s, 'STEP ' + s) + '</span>' + (s === '0' ? t('尺寸选择', 'サイズ選択') : t(zh, ja)) + '</div>' +
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
      '<p>' + t('※ 所示价格为不含税参考价，最终以 TAKARA STANDARD 正式見積書为准', '※ 表示価格は税抜きの参考価格です。正式な見積はお見積書でご確認ください') + '</p>' +
      '<p>※ ' + t('套装价は取付・設置費別（不含安装费）', '套装価格（取付・設置費別）') + '</p>' +
      '<p>※ ' + t('ぴったりサイズは受注生産品（納期要問合せ）', 'ぴったりサイズは受注生産品（納期要問合せ）') + '</p>' +
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
    var lines = ['【TAKARA STANDARD プレデンシア（Predencia）見積（报价）选型清单】'];
    lines.push('品番：' + Q.productNo());
    lines.push('尺寸：' + (Q.isPitari() ? (Q.pitariColName() + '×' + Q.pitariRowName()) : r.size) + ' ｜ 构成：' + (Q.isPitari() ? 'ぴったりサイズ' : r.plan));
    lines.push('—'.repeat(30));
    r.lines.forEach(function (l) {
      lines.push((l.base ? '基准套装  ' : '        ') + l.nameZh + (l.extra ? '（' + l.extra + '）' : '') + (l.base ? '' : '  ' + P.fmtDiff(l.diff)));
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
    a.download = 'predencia-quote.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.PREDENCIA = window.PREDENCIA || {};
  window.PREDENCIA.wizard = {
    init: init,
    renderAll: renderAll,
    renderQuote: renderQuote,
    renderSummary: renderSummary,
    setLang: function (l) { if (l === 'zh' || l === 'ja' || l === 'both') LANG = l; renderAll(); renderQuote(); },
    state: { get lang() { return LANG; } }
  };
})();
