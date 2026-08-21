/**
 * wizard.js — LIXIL シャワーユニット NS整体浴室选型报价 UI（elf_D老肖的世界 风格，分步向导 + 报价单 两个标签页）
 *
 * 视图：选型向导（横向步骤条 + 选项区 + 右侧合计栏）/ 报价单（見積書）
 * 依赖：window.LSHOWER_DATA、window.LSHOWER.price、window.LSHOWER.quote
 * 暴露：window.LSHOWER.wizard = { init, renderAll, renderQuote, state }
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

  var Q = null;      // LSHOWER.quote
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
    Q = window.LSHOWER.quote;
    P = window.LSHOWER.price;
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

      // 壁パネルベース（第二段）
      if (tgt.hasAttribute('data-wall-base')) {
        var bcode = tgt.getAttribute('data-wall-base');
        if (bcode) {
          Q.state.sub.wall_base = bcode;
          // 当前花纹若与新ベース不兼容则清空
          var pc = Q.state.sub.wall_pattern;
          if (pc && Q.wallPatternDisabled(pc)) delete Q.state.sub.wall_pattern;
        } else delete Q.state.sub.wall_base;
        renderStep(); renderSummary();
        return;
      }

      // 壁パネル花纹（第二段选择）
      if (tgt.hasAttribute('data-wall-pattern')) {
        var pcode = tgt.getAttribute('data-wall-pattern');
        if (pcode) Q.state.sub.wall_pattern = pcode;
        else delete Q.state.sub.wall_pattern;
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
      '<h3>' + (st.n === 0 ? t('尺寸·型号·地域', 'サイズ・タイプ・地域') : t(st.titleZh, st.title)) + '</h3>' +
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

  /* 步骤 0：尺寸卡片 + タイプ选项 + 地域 + 写真セット（套装价 = タイプ×サイズ矩阵） */
  function step0Info() {
    var html = '<div class="opt-block" style="margin-bottom:0;">' +
      '<div class="dim-title">' + t('標準仕様価格（税抜・タイプ×サイズ・取付費別途）', '標準仕様価格（税抜・タイプ×サイズ・取付費別途）') + '</div>' +
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
    html += '<p class="base-meta">※ ' + t('1216 UXタイプ 標準仕様価格 ¥1,053,000（税抜）；UZ＞UX＞FZ＞FX（同サイズ）；寒冷地 ＋¥5,000', '1216 UXタイプ 標準仕様価格 ¥1,053,000（税抜）；UZ＞UX＞FZ＞FX（同サイズ）；寒冷地 ＋¥5,000') + '</p>';
    html += '</div>';

    var d = Q.dim('type');
    html += '<div class="opt-block" data-dim="type">' +
      '<div class="dim-title">' + t(d.titleZh, d.titleJa) + '（' + tp('决定套装价', '標準仕様価格を決定') + '）</div>';
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
    // 写真セット（step 0 参考套餐）
    var ps = Q.dim('photo_set');
    if (ps) html += dimensionHtml(ps);

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
      (o.note ? '<span class="opt-dis" style="color:var(--ink-3);">' + esc(o.note) + '</span>' : '') +
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
    // 壁パネル：第二段ベース＋花纹选择
    if (d.id === 'wall') html += wallPatternHtml(d);
    html += '</div>';
    return html;
  }

  /* 壁パネル花纹第二段：全面張り → 花纹；アクセント → ベース + 花纹（按クラス分组） */
  function wallPatternHtml(d) {
    var w = Q.wallMode();
    if (w == null) return '';
    var html = '';

    // アクセント：ベースパネル chips（5 種，价格按当前花纹动态）
    if (w === '1') {
      var bases = [
        { code: 'HN301', name: '鏡面ホワイト/HN301（ハイクラス）' },
        { code: 'HT541', name: 'ランダムウッド/HT541（ハイクラス）' },
        { code: 'HT613', name: 'スタッコベージュ/HT613（ハイクラス）' },
        { code: 'HT611', name: 'シルバーグレー/HT611（ハイクラス）' },
        { code: 'LE301', name: 'マットホワイト/LE301（ベーシック）' }
      ];
      var curBase = Q.wallBase();
      var wallOpt = Q.opt('wall', w);
      var curPat = Q.state.sub.wall_pattern ? Q.wallPattern(Q.state.sub.wall_pattern) : null;
      html += '<div class="sub-row" style="margin-top:12px;"><span class="dim-sub-title">' +
        t('ベースパネル / 基底面板：', 'ベースパネル：') + '</span>';
      bases.forEach(function (b) {
        var on = curBase === b.code;
        var dis = Q.wallBaseDisabled(b.code);
        var priceTxt = b.name.indexOf('ベーシック') >= 0 ? 'ベーシック' : 'ハイクラス';
        if (curPat && curPat.accentCodeByBase) {
          var combo = curPat.accentCodeByBase[b.code];
          if (combo && combo !== 'fullwall') {
            var key = curPat.class + 'X' + (b.code === 'LE301' ? 'basic' : 'high');
            var v = wallOpt && wallOpt.priceByCombo ? wallOpt.priceByCombo[key] : null;
            if (typeof v === 'number') priceTxt = P.fmtDiff(v);
          }
        }
        html += '<label class="sub-chip' + (on ? ' on' : '') + (dis ? ' dis' : '') + '"' +
          (dis ? ' title="' + esc(dis) + '"' : '') + '>' +
          '<input type="radio" name="wall_base" data-wall-base="' + esc(b.code) + '"' +
          (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
          esc(b.name) + ' <b>' + esc(priceTxt) + '</b></label>';
      });
      html += '</div>';
    }

    // 花纹 chips（プレミアムⅠ / ハイ / ベーシック 分组）
    var patterns = Q.wallPatterns();
    var cur = Q.state.sub.wall_pattern;
    var premList = patterns.filter(function (p) { return p.class === 'premium1'; });
    var highList = patterns.filter(function (p) { return p.class === 'high'; });
    var basicList = patterns.filter(function (p) { return p.class === 'basic'; });

    function patChips(list) {
      var h = '<div class="opt-grid" style="margin-top:4px;">';
      list.forEach(function (p) {
        var on = cur === p.code;
        var dis = Q.wallPatternDisabled(p.code);
        var price = Q.wallPatternPrice(p.code);
        var priceTxt = price == null ? '—' : P.fmtDiff(price);
        h += '<label class="opt-card small' + (on ? ' on' : '') + (dis ? ' disabled' : '') + '"' +
          (dis ? ' title="' + esc(dis) + '"' : '') + '>' +
          '<input type="radio" name="wall_pattern" data-wall-pattern="' + esc(p.code) + '"' +
          (on ? ' checked' : '') + (dis ? ' disabled' : '') + '>' +
          '<span class="opt-name">' + esc(p.code + ' ' + (p.name_ja || '')) + '</span>' +
          '<span class="opt-price">' + esc(priceTxt) + '</span></label>';
      });
      h += '</div>';
      return h;
    }

    html += '<div class="dim-group-title">' + t('花纹·プレミアムⅠ / 高档Ⅰ柄（' + premList.length + ' 種）', 'プレミアムⅠ柄（' + premList.length + ' 種）') + '</div>';
    html += patChips(premList);
    html += '<div class="dim-group-title">' + t('花纹·ハイクラス / 高级柄（' + highList.length + ' 種）', 'ハイクラス柄（' + highList.length + ' 種）') + '</div>';
    html += patChips(highList);
    html += '<div class="dim-group-title">' + t('花纹·ベーシッククラス / 基础柄（' + basicList.length + ' 種）', 'ベーシッククラス柄（' + basicList.length + ' 種）') + '</div>';
    html += patChips(basicList);

    if (cur) {
      var pat = Q.wallPattern(cur);
      if (pat) {
        var pn = Q.wallPatternPartNo(cur);
        if (pn) html += '<p class="muted" style="margin-top:6px;">' + t('品番：' + pn, '品番：' + pn) + '</p>';
        if (pat.note) html += '<p class="muted" style="margin-top:2px;">※ ' + esc(pat.note) + '</p>';
        if (w !== '0' && pat.accentCodeByBase) {
          var base2 = Q.wallBase();
          var combo = pat.accentCodeByBase[base2];
          if (combo && combo !== 'fullwall') {
            html += '<p class="muted" style="margin-top:2px;">' + t('组合注文コード：' + combo + '（ベース ' + base2 + '）', '組合せ注文コード：' + combo + '（ベース ' + base2 + '）') + '</p>';
          }
        }
      }
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
    if (d.id === 'door_towel_bar') {
      // 门外毛巾架：按当前门宽
      var dw = currentDoorWidth();
      var v = (o && o.pricesByDoorWidth && dw) ? o.pricesByDoorWidth[dw] : null;
      return typeof v === 'number' ? v : null;
    }
    if (d.id === 'photo_set') {
      var ps = o && o.photoSetPrice != null ? o.photoSetPrice : null;
      return typeof ps === 'number' ? ps - Q.basePrice() : null;
    }
    if (o.priceByType) {
      var tv = P.priceByTypeValue(o, Q.typeCode());
      if (tv != null) return P.toAmount(tv);
      return null;
    }
    var v2 = P.priceFor(o, Q.typeCode(), Q.sizeCode());
    return (typeof v2 === 'number') ? v2 : null;
  }

  /** 当前门宽（door 选项名 800W/700W/600W → '800'/'700'/'600'） */
  function currentDoorWidth() {
    var o = Q.selOpt('door');
    if (!o) return null;
    var m = String(o.name_ja || '').match(/(\d{3})W/);
    return m ? m[1] : null;
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
      '<div class="doc-sub">LIXIL シャワーユニット NS／ シャワーユニット（淋浴单元）</div>' +
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
        '<div class="doc-sec-title"><span>' + t('STEP ' + s, 'STEP ' + s) + '</span>' + (s === '0' ? t('尺寸·型号·地域', 'サイズ・タイプ・地域') : t(zh, ja)) + '</div>' +
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
      '<p>' + t('※ 所示价格为不含税参考价，最终以 LIXIL 正式見積書为准', '※ 表示価格は税抜きの参考価格です。正式な見積はお見積書でご確認ください') + '</p>' +
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
    var lines = ['【LIXIL シャワーユニット NS（淋浴单元）見積（报价）选型清单】'];
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
    a.download = 'LSHOWER-quote.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.LSHOWER = window.LSHOWER || {};
  window.LSHOWER.wizard = {
    init: init,
    renderAll: renderAll,
    renderQuote: renderQuote,
    renderSummary: renderSummary,
    setLang: function (l) { if (l === 'zh' || l === 'ja' || l === 'both') LANG = l; renderAll(); renderQuote(); },
    state: { get lang() { return LANG; } }
  };
})();
