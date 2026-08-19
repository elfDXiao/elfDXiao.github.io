/**
 * quote.js — Cleanup STEDIA 系统厨房报价引擎：维度配置 + 状态 + 计价 + 组合约束
 *
 * 纯逻辑（无 DOM 依赖），供 wizard.js 调用；挂 window.KITCHEN.quote。
 * 依赖：window.KITCHEN_DATA（products.js）、window.KITCHEN.price（price.js）。
 *
 * 计价模型（厨房，比浴室多「レイアウト×プラン」两层）：
 *   基本セット価格（税抜） = f(layout, plan, width, depth?, grade)
 *     - Ⅰ型/L型：basePrices[layout][plan].prices[grade][width 列索引]
 *     - フラット対面/デュアルトップ対面：先选 depth(80/98)，再查 prices["depth"+depth][grade][width]
 *     - 2列型：prices[grade] 为直接合计价（コンロ側180 + シンク側181.5）
 *   本体価格（税抜） = 基本セット価格 + Σ选项差价（＋加/－减）
 *   税込 = 本体 × 1.10；人民币 = 税込 × 汇率（纯物料价格，不含安装/工事费）
 *
 * STEPS / DIMS 完全由 categories 的 step/name 驱动（不硬编码步数）：
 *   14 个 category → 13 个 distinct step（size+grade 同 step 2；depth 为合成维，仅 flat/dual）。
 * kind 体系（厨房）：
 *   layout / plan / size / depth / grade —— 基本价维度（单选，决定基本セット価格）
 *   door   —— 扉カラー（按 grade 过滤）+ 取手联动（含于套装价，不计差价）
 *   faucet —— 水栓（含 一般地/寒冷地 地区切换，priceDiff / priceDiffCold）
 *   peripheral —— 周辺収納（加购：なし + 选项 + 间口/奥行子选，单价表查 peripheralPrices）
 *   other  —— その他・資料（加购：なし + 选项 + 30/45cm 子选，绝对单价）
 *   radio  —— 通用单选（worktop/sink/dishwasher/cooktop/hood/wallcabinet）
 */
(function () {
  'use strict';

  var DATA = null;
  var P = null;

  var STEPS = [];
  var DIMS = [];

  /* ---------------- 状态 ---------------- */
  var state = {
    step: 0,
    layout: 'i',            // レイアウト code（i/l/flat/dual/tworow）
    plan: 'basic',          // パッケージプラン code（basic/stylish/kirei）
    width: '255',           // 間口（cm 字符串）
    depth: '98',            // 奥行（仅 flat/dual："80"/"98"）
    grade: 'class5',        // 扉グレード（class1..class5）
    doorColor: null,        // 扉カラー code
    doorHandle: null,       // 取手 code
    sel: {},                // { catId: optionId } 单选选项维度（worktop/sink/.../peripheral/other）
    sub: {},                // { faucet:{region}, peripheral:{size,depth}, other:{size}, wallcabinet:{type,width,height,lighting,subtype,racks:{},led:{code,width},extras:{}} }
    toggles: {},            // { catId: { optionCode: true } } 多选维度（如 cabinet 下柜加装）
    cabunit: {},            // { sink:{t,w,d}, base:{t,w,d}, cooktop:{t,w,d}, corner:{t,w,d} } 下柜单元类型选择（基本仕様）
    rate: null,             // 汇率（1日元=人民币）；<=0/null 时不计算人民币
    quoteHead: {            // 报价单头部（可编辑）
      no: '', date: '', valid: '', customer: '', address: '', dealer: '', person: '', remark: ''
    }
  };

  /* 各 layout 切换时的推荐间口（优先落在该 layout 的列内） */
  var PREFERRED_WIDTH = { i: '255', l: '255', flat: '258', dual: '257.5', tworow: '181.5' };

  /* ---------------- 工具 ---------------- */
  function cat(id) { return DATA.categories.find(function (c) { return c.id === id; }); }
  function catOption(catId, oi) { var c = cat(catId); return c ? c.options[oi] : null; }
  function optionId(catId, oi) { return catId + '::' + oi; }
  function selOptIdx(catId) {
    var oid = state.sel[catId];
    if (oid == null) return null;
    var m = String(oid).split('::');
    return m.length === 2 ? Number(m[1]) : null;
  }
  function selOption(catId) { var i = selOptIdx(catId); return i == null ? null : catOption(catId, i); }

  function layoutOpt() { return cat('layout').options.find(function (o) { return o.code === state.layout; }); }
  /** 某 layout 可选 plan：从 sizes[] 推导（该 layout 出现的 distinct plan，按 meta.plans 排序） */
  function plansForLayout(layout) {
    var list = DATA.sizes || [];
    var present = {};
    list.forEach(function (s) { if (s.layout === layout) present[s.plan] = true; });
    var plans = (DATA.meta.plans || []).filter(function (p) { return present[p]; });
    return plans.length ? plans : ['basic'];
  }
  function layoutPlans() { return plansForLayout(state.layout); }
  function layoutWidths() { return (DATA.meta.layoutWidths && DATA.meta.layoutWidths[state.layout]) || []; }
  function hasDepth() { return depthList().length > 0; }
  function depthList() { return (DATA.meta.layoutDepths && DATA.meta.layoutDepths[state.layout]) || []; }
  /** sizes[] 中匹配当前 (layout, plan, width, depth) 的行 */
  function sizeRow() {
    var list = DATA.sizes || [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (s.layout === state.layout && s.plan === state.plan && s.width === state.width &&
          (s.depth == null || s.depth === state.depth)) return s;
    }
    return null;
  }

  function layoutNameJa() { return (DATA.meta.layoutNames && DATA.meta.layoutNames[state.layout]) || state.layout; }
  function layoutNameZh() { return (DATA.meta.layoutNamesZh && DATA.meta.layoutNamesZh[state.layout]) || state.layout; }
  function planNameJa() { return (DATA.meta.planNames && DATA.meta.planNames[state.plan]) || state.plan; }
  function planNameZh() { return (DATA.meta.planNamesZh && DATA.meta.planNamesZh[state.plan]) || state.plan; }
  function gradeLabel() { return (DATA.meta.gradeNames && DATA.meta.gradeNames[state.grade]) || state.grade; }

  function currentDoorColors() { return (DATA.doorColors && DATA.doorColors[state.grade]) || []; }
  function doorColorObj() { return currentDoorColors().find(function (c) { return c.code === state.doorColor; }) || null; }
  function doorHandles() { var c = doorColorObj(); return (c && Array.isArray(c.handles)) ? c.handles : []; }
  function handleNames() { return DATA.handles || {}; }

  /* ---------------- STEPS / DIMS 派生（数据驱动） ---------------- */
  function buildStepsAndDims() {
    var stepMap = {};
    DATA.categories.forEach(function (c) {
      if (!stepMap[c.step]) stepMap[c.step] = { n: c.step, ja: [], zh: [], note: [] };
      stepMap[c.step].ja.push(c.name_ja);
      stepMap[c.step].zh.push(c.name_zh);
      stepMap[c.step].note.push(c.description_zh || '');
    });
    var keys = Object.keys(stepMap).map(Number).sort(function (a, b) { return a - b; });
    STEPS.length = 0;
    keys.forEach(function (k) {
      var s = stepMap[k];
      STEPS.push({ n: k, title: s.ja.join('・'), titleZh: s.zh.join('・'), note: s.note[0] });
    });

    var KIND = { layout: 'layout', plan: 'plan', size: 'size', grade: 'grade', door: 'door', faucet: 'faucet', peripheral: 'peripheral', other: 'other', wallcabinet: 'wallunit' };
    DIMS.length = 0;
    DATA.categories.forEach(function (c) {
      if (c.id === 'cabinet') return;   // 下柜配件已并入 cabunit，不再单独渲染
      // additive:true 的分类 = 多选加购，其余按 KIND 映射，缺省 radio
      var kind = c.additive === true ? 'multi' : (KIND[c.id] || 'radio');
      DIMS.push({ id: c.id, step: c.step, cat: c.id, kind: kind, titleJa: c.name_ja, titleZh: c.name_zh });
    });
    // 合成「奥行」维（仅 flat/dual 显示），插到 size 之后、grade 之前
    var sizeIdx = DIMS.findIndex(function (d) { return d.id === 'size'; });
    if (sizeIdx >= 0) {
      DIMS.splice(sizeIdx + 1, 0, { id: 'depth', step: DIMS[sizeIdx].step, cat: null, kind: 'depth', titleJa: '奥行', titleZh: '深度' });
    }
    // 合成「下柜单元」维（多单元列表），放在原 cabinet step 位置（cabinet 分类已跳过渲染）
    var cabCat = cat('cabinet');
    if (cabCat) {
      var cabStep = cabCat.step;
      var cabIdx = DIMS.findIndex(function (d) { return d.step > cabStep; });
      var cabDim = { id: 'cabunit', step: cabStep, cat: null, kind: 'cabunit', titleJa: '下柜（フロアキャビネット）', titleZh: '下柜' };
      if (cabIdx < 0) DIMS.push(cabDim);
      else DIMS.splice(cabIdx, 0, cabDim);
    }
  }
  function dim(id) { return DIMS.find(function (d) { return d.id === id; }); }
  function stepMeta(n) { return STEPS.find(function (s) { return s.n === n; }) || { n: n, title: '', titleZh: '' }; }

  /* ---------------- 计价 ---------------- */

  /** 基本セット価格；null 表示数据缺失（如 dual stylish 未读全） */
  function basePrice() {
    var row = sizeRow();
    if (!row || !row.prices) return null;
    var v = row.prices[state.grade];
    return typeof v === 'number' ? v : null;   // null cell → 未计价
  }

  /** 解析价格单元格 → 数字差价；null 无法确定。'基本仕様' 视为 0 */
  function cellAmount(cell) {
    if (cell == null) return null;
    var c = P.parseCell(cell);
    if (c.type === 'num') return c.amount;
    if (c.type === 'basic') return 0;
    return null;
  }

  /** 通用选项差价（priceDiff / isBasic / pricesBySize / priceMatrix / prices） */
  function optionDiff(o) {
    if (!o) return null;
    if (typeof o.priceDiff === 'number') return o.priceDiff;
    if (o.priceDiff === null) return null;            // 显式「差价待核」
    if (o.isBasic === true) return 0;                 // 基本仕様 → 0
    if (o.pricesBySize) {
      var v = P.priceBySize(o, state.width);
      if (typeof v === 'number') return v;
      return cellAmount(v);
    }
    if (o.priceMatrix) {                              // 键 = grade（如 hood 深型按 class 递变）
      var m = o.priceMatrix[state.grade];
      if (typeof m === 'number') return m;
      return cellAmount(m);
    }
    if (o.prices) {                                   // 键 = grade → width（如 wallcabinet）
      var byGrade = o.prices[state.grade];
      if (byGrade && typeof byGrade === 'object') {
        var w = byGrade[state.width];
        if (typeof w === 'number') return w;
        return cellAmount(w);
      }
      if (typeof byGrade === 'number') return byGrade;
      return null;
    }
    return null;
  }

  function faucetContribution() {
    var o = selOption('faucet');
    if (!o) return null;
    var region = (state.sub.faucet && state.sub.faucet.region) || '一般地';
    if (region === '寒冷地' && o.priceDiffCold != null) {
      if (typeof o.priceDiffCold === 'number') return o.priceDiffCold;
      return cellAmount(o.priceDiffCold);
    }
    return optionDiff(o);
  }

  /** 台面差价：pricesBySize 是Ⅰ型基准（键 180–300）；非Ⅰ型布局差价待核 → null 不计价（reviewer P1 方案 b） */
  function worktopContribution() {
    var o = selOption('worktop');
    if (!o) return null;
    if (o.isBasic === true) return 0;         // 基本台面（basic plan 基准），任何布局 0
    if (state.layout !== 'i') return null;    // 非Ⅰ型：Ⅰ型基准差价不适用，置 null 待核
    return optionDiff(o);
  }

  /** 周辺収納单价表查找：ref 形如 "peripheralPrices.pantry_basic" */
  function peripheralTable(o) {
    if (!o || !o.ref) return null;
    var key = String(o.ref).replace(/^peripheralPrices\./, '');
    return (DATA.peripheralPrices && DATA.peripheralPrices[key]) || null;
  }
  /** 周辺収納单价（绝对加购价）；ref 缺失或表中无该格 → null */
  function peripheralPrice(o) {
    if (!o || !o.ref) return null;
    var table = peripheralTable(o);
    if (!table) return null;
    var s = state.sub.peripheral || {};
    var size = s.size || (Array.isArray(o.sizes) ? o.sizes[0] : null);
    var depth = s.depth || (Array.isArray(o.depth) ? o.depth[0] : null) || '45';
    var byGrade = table['depth' + depth];
    if (!byGrade) byGrade = table;
    if (!byGrade || !Array.isArray(byGrade[state.grade])) return null;
    var arr = byGrade[state.grade];
    var idx = (table.columns || []).indexOf(size);
    if (idx < 0) return null;
    var v = arr[idx];
    return typeof v === 'number' ? v : null;
  }
  function peripheralContribution() {
    var o = selOption('peripheral');
    if (!o) return null;                 // なし
    return peripheralPrice(o);
  }

  /** その他（リンクシェルフ）绝对加购价：30cm=price / 45cm=price45 */
  function otherContribution() {
    var o = selOption('other');
    if (!o) return null;
    return otherPriceFor(o);
  }
  /** 给定「その他」选项的当前绝对单价（按 30/45cm 子选） */
  function otherPriceFor(o) {
    if (!o) return null;
    var size = (state.sub.other && state.sub.other.size) || '30';
    var v = size === '45' && o.price45 != null ? o.price45 : o.price;
    if (typeof v === 'number') return v;
    return cellAmount(v);
  }

  /* ---- 多选维度（multi，additive:true，如 cabinet 下柜加装）----
   * state.toggles[catId] = { code: sub }；sub 可为：
   *   true            —— 固定差价（priceDiff / priceDiff:null 待核）
   *   { w: "90" }     —— pricesBySize 项（w=柜体自身间口）
   *   { i: 0 }        —— items 项（i=子项索引）
   */
  function multiSub(dimId, code) { return (state.toggles[dimId] || {})[code]; }
  /** 单个多选项的差价（含子选） */
  function multiOptionDiff(o, sub) {
    if (!o) return null;
    if (o.pricesBySize) {
      var w = sub && sub.w;
      if (w == null) return null;                 // 未选间口 → 待核不计价
      var v = o.pricesBySize[w];
      return typeof v === 'number' ? v : cellAmount(v);
    }
    if (Array.isArray(o.items) && o.items.length) {
      var idx = (sub && typeof sub.i === 'number') ? sub.i : null;
      if (idx == null) return null;               // 未选子项 → 待核不计价
      var it = o.items[idx];
      return it ? (typeof it.price === 'number' ? it.price : cellAmount(it.price)) : null;
    }
    return optionDiff(o);
  }
  /** 勾选的多选项（含子选状态） */
  function checkedMulti(dimId) {
    var toggles = state.toggles[dimId] || {};
    var c = cat(dimId);
    if (!c) return [];
    return c.options.filter(function (o) { return toggles[o.code] != null; })
      .map(function (o) { return { option: o, sub: toggles[o.code] }; });
  }
  function checkedOptions(dimId) { return checkedMulti(dimId).map(function (p) { return p.option; }); }
  /** 多选维度已知差价之和（未知项跳过，不计入） */
  function multiContribution(dimId) {
    var sum = 0;
    checkedMulti(dimId).forEach(function (p) {
      var v = multiOptionDiff(p.option, p.sub);
      if (typeof v === 'number') sum += v;
    });
    return sum;
  }
  /** 多选维度中勾选但差价待核的项 */
  function multiUnknown(dimId) {
    return checkedMulti(dimId)
      .filter(function (p) { return multiOptionDiff(p.option, p.sub) == null; })
      .map(function (p) { return { dimId: dimId, name: p.option.name_zh || p.option.name_ja || p.option.code, detail: p.option.note || '' }; });
  }
  /** 多选项显示名（含间口/子项子选） */
  function multiLabel(o, sub, lang) {
    var name = lang === 'ja' ? (o.name_ja || o.code) : (o.name_zh || o.name_ja || o.code);
    if (o.pricesBySize && sub && sub.w) name += ' ' + sub.w + 'cm';
    if (Array.isArray(o.items) && sub && typeof sub.i === 'number') {
      var it = o.items[sub.i];
      if (it) name += '（' + (lang === 'ja' ? (it.name_ja || '') : (it.name_zh || it.name_ja || '')) + '）';
    }
    return name;
  }

  /* ---- 上柜单元（wallunit，wallcabinet 分类，多单元列表）+ 下柜单元（cabunit） ---- */
  function wu() { return DATA.wallCabinetUnits || {}; }
  /** 上柜单元列表：state.sub.wallcabinet = { units: [ {type,width,height,lighting,subtype,racks:{},led:{code,width},extras:{}}, ... ] } */
  function wuUnits() { return (state.sub.wallcabinet && state.sub.wallcabinet.units) || []; }
  /** 单个上柜单元基本价：handmove/eyearea 查表，none 查旧吊戸棚なし减价表，其余基本仕様=0；未选子项/间口缺格 → null 待核 */
  function wallUnitBasePrice(s) {
    var W = wu(), t = s.type;
    if (t === 'handmove') {
      var p = W.handmove && W.handmove.prices && W.handmove.prices[state.grade];
      var w = p && p[s.width], v = w && w[s.lighting];
      return typeof v === 'number' ? v : null;
    }
    if (t === 'eyearea') {
      var p2 = W.eyearea && W.eyearea.prices;
      var w2 = p2 && p2[s.width], ty = w2 && w2[s.subtype], v2 = ty && ty[s.lighting];
      return typeof v2 === 'number' ? v2 : null;
    }
    if (t === 'none') {
      // 旧 wallcabinet none 选项：prices[class][厨房间口 240/255/270] 减价；间口不在表内 → null 待核
      var noneOpt = cat('wallcabinet').options.find(function (o) { return o.code === 'none'; });
      if (!noneOpt || !noneOpt.prices || !noneOpt.prices[state.grade]) return null;
      var nv = noneOpt.prices[state.grade][state.width];
      return typeof nv === 'number' ? nv : null;
    }
    return 0;   // automove/standard/seethrough/movedown → 基本仕様
  }
  function wallUnitRacksPrice(s) {
    var W = wu();
    var racks = null;
    if (s.type === 'handmove') racks = W.handmove && W.handmove.racks;
    else if (s.type === 'automove') racks = W.automove && W.automove.racks;
    if (!racks) return 0;
    var sum = 0;
    Object.keys(s.racks || {}).forEach(function (k) { if (s.racks[k] && typeof racks[k] === 'number') sum += racks[k]; });
    return sum;
  }
  function wallUnitLedPrice(s) {
    var W = wu();
    if (!s.led || !s.led.code) return 0;
    var led = W.led && W.led[s.led.code];
    if (!led || !led.pricesBySize) return 0;
    var v = led.pricesBySize[s.led.width];
    return typeof v === 'number' ? v : 0;
  }
  /** 单个上柜单元的差价（base + racks + led） */
  function wallUnitPriceFor(s) {
    var base = wallUnitBasePrice(s);
    if (base == null) return null;
    return base + wallUnitRacksPrice(s) + wallUnitLedPrice(s);
  }
  /** 全部上柜单元差价之和 */
  function wallUnitContribution() {
    var sum = 0;
    wuUnits().forEach(function (s) {
      var v = wallUnitPriceFor(s);
      if (typeof v === 'number') sum += v;
    });
    return sum;
  }
  function wallUnitTypeName(code, lang) {
    if (code === 'none') return lang === 'ja' ? '吊戸棚なし' : '不安装吊柜';
    var W = wu(), t = W[code];
    if (!t) return code;
    return lang === 'ja' ? (t.name_ja || code) : (t.name_zh || t.name_ja || code);
  }
  function wallUnitLabelFor(s, lang) {
    var W = wu();
    var parts = [wallUnitTypeName(s.type, lang)];
    if (s.subtype && s.type === 'eyearea') parts.push(W.eyearea && W.eyearea.types && W.eyearea.types[s.subtype] ? W.eyearea.types[s.subtype] : s.subtype);
    else if (s.subtype) parts.push(s.subtype);
    if (s.width) parts.push(s.width + 'cm');
    if (s.height) parts.push('高さ' + s.height + 'cm');
    if (s.lighting) parts.push(s.lighting);
    var label = parts.join('・');
    if (s.isHood) label += (lang === 'ja' ? '（レンジフード用）' : '（油烟机用）');
    return label;
  }
  /** 互斥设置油烟机用标记：最多 1 个单元 isHood=true（勾选时自动取消旧的） */
  function wuSetHood(idx, checked) {
    var units = wuUnits();
    if (checked) {
      units.forEach(function (u, i) { u.isHood = (i === idx); });
    } else if (units[idx]) {
      units[idx].isHood = false;
    }
  }
  function wallUnitExtraLabelFor(s) {
    var extras = [];
    Object.keys(s.racks || {}).forEach(function (k) { if (s.racks[k]) extras.push(k); });
    if (s.led && s.led.code) {
      var ledName = (wu().led && wu().led[s.led.code]) ? (wu().led[s.led.code].name_ja || s.led.code) : s.led.code;
      extras.push(ledName + (s.led.width ? ' ' + s.led.width + 'cm' : ''));
    }
    Object.keys(s.extras || {}).forEach(function (k) { if (s.extras[k]) extras.push(k); });
    return extras.join('、');
  }
  /** 宽度解析（cm，取首个数字；"90×75"→90） */
  function parseWidthCm(w) {
    if (w == null) return 0;
    var m = String(w).match(/\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : 0;
  }
  /** 上柜单元宽度总和 */
  function sumWallUnitWidth() {
    var sum = 0;
    wuUnits().forEach(function (s) { sum += parseWidthCm(s.width); });
    return sum;
  }
  /** 下柜单元宽度总和（数组各单元间口） */
  function sumCabUnitWidth() {
    var sum = 0;
    (state.cabunit || []).forEach(function (u) { sum += parseWidthCm(u.w); });
    return sum;
  }

  /* ---- 下柜单元（cabunit，多单元列表，对齐 wallunit） ----
   * state.cabunit = [ { pos, t, w, d, acc:{code:sub} }, ... ]；pos∈sink/base/cooktop/corner
   * 类型（t）为基本仕様 0 差价；配件（acc，来自 cabinet category 9 项）按类型显示并计价。
   */
  var CAB_ACC_TYPES = { sink_outlet: ['sink'], cooktop_drawer: ['cooktop'], frypan_rack: ['cooktop'] };
  function cabUnitPositions() { return ['sink', 'base', 'cooktop', 'corner']; }
  function cabUnitPosName(pos, lang) {
    var CT = DATA.cabinetTypes || {}, C = CT[pos];
    if (!C) return pos;
    return lang === 'ja' ? (C.name_ja || pos) : (C.name_zh || C.name_ja || pos);
  }
  /** 某位置可用的配件（cabinet category 选项按 CAB_ACC_TYPES 过滤） */
  function cabAccessoriesFor(pos) {
    return cat('cabinet').options.filter(function (o) {
      var types = CAB_ACC_TYPES[o.code];
      return !types || types.indexOf(pos) >= 0;
    });
  }
  /** 单个下柜单元的差价 = Σ配件价（类型本身 0） */
  function cabUnitContribution(unit) {
    var sum = 0;
    var acc = unit.acc || {};
    cat('cabinet').options.forEach(function (o) {
      if (acc[o.code] == null) return;
      var v = multiOptionDiff(o, acc[o.code]);
      if (typeof v === 'number') sum += v;
    });
    return sum;
  }
  /** 全部下柜单元差价之和 */
  function cabUnitTotal() {
    var sum = 0;
    (state.cabunit || []).forEach(function (u) { sum += cabUnitContribution(u); });
    return sum;
  }
  /** 新增下柜单元：宽度硬约束（加入后总宽 > 厨房间口则阻止），返回 true/false */
  function cabAddUnit(unit) {
    var units = state.cabunit || [];
    var newW = parseWidthCm(unit.w);
    var kitchenW = parseWidthCm(state.width);
    if (newW > 0 && kitchenW > 0 && sumCabUnitWidth() + newW > kitchenW) return false;
    units.push(unit);
    state.cabunit = units;
    return true;
  }
  function cabDelUnit(idx) {
    var units = state.cabunit || [];
    if (units.length > 1) units.splice(idx, 1);
    state.cabunit = units;
  }
  function cabUnitLabelFor(unit, lang) {
    var CT = DATA.cabinetTypes || {};
    var C = CT[unit.pos];
    var parts = [cabUnitPosName(unit.pos, lang)];
    if (C && C.types && C.types[unit.t]) {
      var tp = C.types[unit.t];
      parts.push(lang === 'ja' ? (tp.name_ja || '') : (tp.name_zh || tp.name_ja || ''));
    }
    if (unit.w) parts.push(unit.w + 'cm');
    if (unit.d) parts.push('奥行' + String(unit.d).replace(/^D/, '') + 'cm');
    var acc = unit.acc || {};
    cat('cabinet').options.forEach(function (o) {
      if (acc[o.code] == null) return;
      parts.push(multiLabel(o, acc[o.code], lang));
    });
    return parts.join('・');
  }

  function contributionFor(dimId) {
    var d = dim(dimId);
    if (!d) return null;
    switch (d.kind) {
      case 'layout': case 'plan': case 'size': case 'depth': case 'grade': return null; // 基本价维度
      case 'door': return 0;               // 扉カラー含于套装价
      case 'faucet': return faucetContribution();
      case 'peripheral': return peripheralContribution();
      case 'other': return otherContribution();
      case 'multi': return multiContribution(dimId);
      case 'wallunit': return wallUnitContribution();
      case 'cabunit': return cabUnitTotal();   // 下柜单元差价 = Σ配件价
      case 'radio': {
        if (dimId === 'worktop') return worktopContribution();
        var o = selOption(dimId);
        return optionDiff(o);
      }
      default: return null;
    }
  }

  /** 当前维度所选「行」描述（报价单明细用） */
  function describe(dimId) {
    var d = dim(dimId);
    var out = { nameZh: '', nameJa: '', code: '', model: '', diff: null, extra: '' };
    if (!d) return out;
    switch (d.kind) {
      case 'door': {
        var co = doorColorObj();
        if (co) { out.nameZh = co.name_zh || co.name_ja || ''; out.nameJa = co.name_ja || ''; out.code = co.code || ''; }
        var h = handleNames()[state.doorHandle];
        if (h) out.extra = '取手 ' + (h.name_zh || h.name_ja || '') + ' / ' + (h.name_ja || '');
        out.diff = 0;
        return out;
      }
      case 'radio': case 'faucet': {
        var o = selOption(dimId);
        if (!o) return out;
        out.nameZh = o.name_zh || o.name_ja || '';
        out.nameJa = o.name_ja || '';
        out.code = o.code || '';
        out.model = o.model || '';
        out.extra = o.note || '';
        out.diff = contributionFor(dimId);
        return out;
      }
      case 'peripheral': {
        var o2 = selOption('peripheral');
        if (!o2) return out;
        out.nameZh = o2.name_zh || o2.name_ja || '';
        out.nameJa = o2.name_ja || '';
        out.code = o2.code || '';
        var s = state.sub.peripheral || {};
        var size = s.size || (Array.isArray(o2.sizes) ? o2.sizes[0] : '');
        var depth = s.depth || (Array.isArray(o2.depth) ? o2.depth[0] : '');
        var missing = !peripheralTable(o2);
        out.extra = (size ? '間口' + size + 'cm' : '') + (depth ? ' / 奥行' + depth + 'cm' : '') + (missing ? '（价格未标注）' : '');
        out.diff = contributionFor('peripheral');
        return out;
      }
      case 'other': {
        var o3 = selOption('other');
        if (!o3) return out;
        out.nameZh = o3.name_zh || o3.name_ja || '';
        out.nameJa = o3.name_ja || '';
        out.code = o3.code || '';
        out.model = o3.model || '';
        var sz = (state.sub.other && state.sub.other.size) || '30';
        out.extra = '間口' + sz + 'cm';
        out.diff = contributionFor('other');
        return out;
      }
      case 'multi': {
        var checked = checkedMulti(dimId);
        if (!checked.length) return out;
        var nz = [], nj = [], cs = [];
        checked.forEach(function (p) {
          var o = p.option;
          nz.push(multiLabel(o, p.sub, 'zh'));
          nj.push(multiLabel(o, p.sub, 'ja'));
          cs.push(o.code);
        });
        out.nameZh = nz.join('、');
        out.nameJa = nj.join('、');
        out.code = cs.join(',');
        out.diff = multiContribution(dimId);
        return out;
      }
      case 'wallunit': {
        // 多单元列表在 computeQuote 里逐单元出明细行；此处返回聚合（供外部/合计展示用）
        var units = wuUnits();
        if (!units.length) return out;
        var nz = [], nj = [];
        units.forEach(function (u) { nz.push(wallUnitLabelFor(u, 'zh')); nj.push(wallUnitLabelFor(u, 'ja')); });
        out.nameZh = nz.join('、');
        out.nameJa = nj.join('、');
        out.code = 'wallunit';
        out.diff = wallUnitContribution();
        return out;
      }
      case 'cabunit': {
        // 多单元列表在 computeQuote 里逐单元出明细行；此处返回聚合（供外部/合计展示用）
        var units = state.cabunit || [];
        if (!units.length) return out;
        var nz = [], nj = [];
        units.forEach(function (u) { nz.push(cabUnitLabelFor(u, 'zh')); nj.push(cabUnitLabelFor(u, 'ja')); });
        out.nameZh = nz.join('、');
        out.nameJa = nj.join('、');
        out.code = 'cabunit';
        out.diff = cabUnitTotal();
        return out;
      }
      default: return out;
    }
  }

  /** 基本价规格文字（报价单/合计用） */
  function baseSpecText() {
    var g = gradeLabel();
    if (state.layout === 'tworow') return '固定組合せ（コンロ側180cm＋シンク側181.5cm）・' + g;
    var s = '間口' + state.width + 'cm・' + g;
    if (hasDepth()) s += '・奥行' + state.depth + 'cm';
    return s;
  }

  /** 汇总计算 */
  function computeQuote() {
    var base = basePrice();
    var total = base != null ? base : 0;
    var lines = [];
    var unknown = [];

    lines.push({
      step: 0, stepZh: stepMeta(0).titleZh, stepJa: stepMeta(0).title,
      nameZh: layoutNameZh() + ' · ' + planNameZh(),
      nameJa: layoutNameJa() + ' ' + planNameJa(),
      code: state.layout, model: '', extra: baseSpecText() + '（取付・設置費別）',
      diff: 0, base: true
    });
    if (base == null) {
      unknown.push({ dimId: 'base', name: '基本セット価格', detail: state.layout + '/' + state.plan + '/' + state.width + '/' + state.depth + '/' + state.grade });
    }

    DIMS.forEach(function (d) {
      if (d.kind === 'layout' || d.kind === 'plan' || d.kind === 'size' || d.kind === 'depth' || d.kind === 'grade') return;
      // 多选维度：已知项求和计入，未知项进未计价清单
      if (d.kind === 'multi') {
        var checked = checkedMulti(d.id);
        if (!checked.length) return;
        var sum = 0, nz = [], nj = [], cs = [];
        checked.forEach(function (p) {
          var o = p.option;
          var v = multiOptionDiff(o, p.sub);
          if (v == null) {
            unknown.push({ dimId: d.id, name: o.name_zh || o.name_ja || o.code, detail: o.note || '' });
          } else {
            sum += v;
            nz.push(multiLabel(o, p.sub, 'zh'));
            nj.push(multiLabel(o, p.sub, 'ja'));
            cs.push(o.code);
          }
        });
        if (nz.length) {
          var msm = stepMeta(d.step);
          lines.push({
            step: d.step, stepZh: msm.titleZh, stepJa: msm.title,
            nameZh: nz.join('、'), nameJa: nj.join('、'), code: cs.join(','), model: '',
            extra: '', diff: sum, base: false
          });
        }
        total += sum;
        return;
      }
      // 上柜多单元：逐单元出明细行
      if (d.kind === 'wallunit') {
        var units = wuUnits();
        var wsm = stepMeta(d.step);
        units.forEach(function (u) {
          var v = wallUnitPriceFor(u);
          if (v == null) {
            unknown.push({ dimId: d.id, name: wallUnitLabelFor(u, 'zh'), detail: '' });
          } else {
            total += v;
            lines.push({
              step: d.step, stepZh: wsm.titleZh, stepJa: wsm.title,
              nameZh: wallUnitLabelFor(u, 'zh'), nameJa: wallUnitLabelFor(u, 'ja'),
              code: 'wallunit:' + u.type, model: '', extra: wallUnitExtraLabelFor(u), diff: v, base: false
            });
          }
        });
        return;
      }
      // 下柜多单元：逐单元出明细行
      if (d.kind === 'cabunit') {
        var cunits = state.cabunit || [];
        var csm = stepMeta(d.step);
        cunits.forEach(function (u) {
          var v = cabUnitContribution(u);
          total += v;
          lines.push({
            step: d.step, stepZh: csm.titleZh, stepJa: csm.title,
            nameZh: cabUnitLabelFor(u, 'zh'), nameJa: cabUnitLabelFor(u, 'ja'),
            code: 'cabunit:' + u.pos, model: '', extra: '', diff: v, base: false
          });
        });
        return;
      }
      var desc = describe(d.id);
      if (!desc.nameZh && !desc.nameJa) return;
      var diff = desc.diff;
      if (diff == null) {
        unknown.push({ dimId: d.id, name: desc.nameZh || desc.nameJa, detail: desc.extra });
        return;
      }
      total += diff;
      var sm = stepMeta(d.step);
      lines.push({
        step: d.step, stepZh: sm.titleZh, stepJa: sm.title,
        nameZh: desc.nameZh, nameJa: desc.nameJa, code: desc.code, model: desc.model,
        extra: desc.extra, diff: diff, base: false
      });
    });

    var taxRate = DATA.meta && DATA.meta.taxRate != null ? DATA.meta.taxRate : 0.10;
    var tax = Math.round(total * taxRate);
    var totalInc = total + tax;
    var rmbAllIn = (state.rate && state.rate > 0) ? Math.round(totalInc * state.rate) : null;
    return {
      basePrice: base, totalEx: total, tax: tax, totalInc: totalInc, rmbAllIn: rmbAllIn,
      lines: lines, unknown: unknown,
      layout: state.layout, plan: state.plan, width: state.width, depth: state.depth, grade: state.grade
    };
  }

  /* ---------------- 组合约束 ---------------- */

  function disabledReason(dimId, oi) {
    var o = catOption(dimId, oi);
    if (!o) return null;

    // シンク 対応間口（数据 sizes 字段；SY/SA 已含，其余按手册 §4 无数据不额外硬编码）
    if (dimId === 'sink' && Array.isArray(o.sizes) && o.sizes.length) {
      if (o.sizes.indexOf(state.width) < 0) {
        return '该间口不可选此水槽（対応間口 ' + o.sizes.join('/') + 'cm）';
      }
    }
    // 食洗機：间口 240cm 未满不可（L型シンク側同理，均以 width 判断）
    if (dimId === 'dishwasher' && o.code !== 'none' && Number(state.width) < 240) {
      return '间口 240cm 未满不可安装洗碗机';
    }
    return null;
  }

  /** 选中后的自动修复（推荐组合 / 联动重置） */
  function autoFix(dimId) {
    if (dimId === 'layout' || dimId === 'plan') {
      var plans = layoutPlans();
      if (plans.indexOf(state.plan) < 0) state.plan = plans[0];
      var widths = layoutWidths();
      if (widths.indexOf(state.width) < 0) {
        var pref = PREFERRED_WIDTH[state.layout];
        state.width = (pref && widths.indexOf(pref) >= 0) ? pref : (widths[0] || '255');
      }
      if (hasDepth()) {
        var depths = depthList();
        if (!state.depth || depths.indexOf(state.depth) < 0) state.depth = depths[0];
      }
    }
    if (dimId === 'grade') {
      var colors = currentDoorColors();
      if (colors.length && colors.every(function (c) { return c.code !== state.doorColor; })) {
        state.doorColor = colors[0].code;
        state.doorHandle = (colors[0].handles && colors[0].handles[0]) || null;
      }
    }
  }

  /* ---------------- 漢数字（合计大写） ---------------- */
  var KANJI = ['零', '壱', '弐', '参', '肆', '伍', '陸', '柒', '捌', '玖'];
  function seg4(n) {
    if (n === 0) return '零';
    var digs = [Math.floor(n / 1000) % 10, Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
    var units = ['仟', '佰', '拾', ''];
    var r = '', prevZero = false;
    for (var i = 0; i < 4; i++) {
      var dgt = digs[i];
      if (dgt > 0) {
        if (prevZero && r) r += '零';
        r += KANJI[dgt] + units[i];
        prevZero = false;
      } else {
        prevZero = true;
      }
    }
    return r;
  }
  function kanjiYen(n) {
    n = Math.round(Number(n) || 0);
    if (n < 0) return 'マイナス' + kanjiYen(-n);
    if (n === 0) return '零円';
    var yi = Math.floor(n / 100000000);
    var man = Math.floor((n % 100000000) / 10000);
    var rest = n % 10000;
    var s = '';
    if (yi > 0) s += seg4(yi) + '億';
    if (man > 0) s += seg4(man) + '万';
    else if (yi > 0 && rest > 0) s += '零';
    if (rest > 0 || (yi === 0 && man === 0)) s += seg4(rest);
    return s + '円';
  }

  /* ---------------- CSV ---------------- */
  function toCSV() {
    var r = computeQuote();
    var rows = [
      ['見積No', state.quoteHead.no], ['日付', state.quoteHead.date], ['有効期限', state.quoteHead.valid],
      ['顧客名', state.quoteHead.customer], ['施工住所', state.quoteHead.address],
      ['販売店/担当', (state.quoteHead.dealer || '') + ' ' + (state.quoteHead.person || '')],
      ['レイアウト', layoutNameJa()], ['プラン', planNameJa()],
      ['間口(cm)', state.width], ['奥行(cm)', hasDepth() ? state.depth : '—'], ['グレード', gradeLabel()],
      ['', ''], ['区分', '品名（日）', '品名（中）', '記号', '型番', '仕様', '差額(税抜)', '金額']
    ];
    r.lines.forEach(function (l) {
      rows.push([l.stepZh, l.nameJa, l.nameZh, l.code, l.model, l.extra,
        l.base ? '' : l.diff, l.base ? String(r.basePrice != null ? r.basePrice : 0) : String(l.diff)]);
    });
    rows.push(['', '', '', '', '', '本体価格（税抜）', r.totalEx]);
    rows.push(['', '', '', '', '', '消費税（10%）', r.tax]);
    rows.push(['', '', '', '', '', '税込合計', r.totalInc]);
    var csv = rows.map(function (row) {
      return row.map(function (v) {
        v = String(v == null ? '' : v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(',');
    }).join('\r\n');
    return '\ufeff' + csv;
  }

  /* ---------------- 对外 API ---------------- */
  window.KITCHEN = window.KITCHEN || {};
  window.KITCHEN.quote = {
    init: function (data) {
      DATA = data; P = window.KITCHEN.price;
      buildStepsAndDims();
      state.layout = 'i'; state.plan = 'basic'; state.width = '255'; state.depth = '98'; state.grade = 'class5';
      state.sel = {}; state.sub = {}; state.toggles = {};
      state.cabunit = [{ pos: 'sink', t: 0, w: '75', d: 'D650', acc: {} }];
      state.sub.wallcabinet = { units: [{ type: 'standard', height: '70' }] };
      var colors = currentDoorColors();
      if (colors.length) {
        state.doorColor = colors[0].code;
        state.doorHandle = (colors[0].handles && colors[0].handles[0]) || null;
      }
    },
    STEPS: STEPS, DIMS: DIMS,
    state: state,
    cat: cat, catOption: catOption, selOption: selOption, optionId: optionId, selOptIdx: selOptIdx,
    layoutPlans: layoutPlans, plansForLayout: plansForLayout, layoutWidths: layoutWidths, hasDepth: hasDepth, depthList: depthList, sizeRow: sizeRow,
    layoutNameJa: layoutNameJa, layoutNameZh: layoutNameZh, planNameJa: planNameJa, planNameZh: planNameZh, gradeLabel: gradeLabel,
    currentDoorColors: currentDoorColors, doorColorObj: doorColorObj, doorHandles: doorHandles, handleNames: handleNames,
    basePrice: basePrice, baseSpecText: baseSpecText,
    computeQuote: computeQuote, contributionFor: contributionFor, describe: describe, optionDiff: optionDiff,
    checkedOptions: checkedOptions, checkedMulti: checkedMulti, multiSub: multiSub, multiOptionDiff: multiOptionDiff, multiContribution: multiContribution, multiUnknown: multiUnknown, multiLabel: multiLabel,
    peripheralPrice: peripheralPrice, peripheralTable: peripheralTable, otherPriceFor: otherPriceFor,
    wu: wu, wuUnits: wuUnits, wuSetHood: wuSetHood, wallUnitBasePrice: wallUnitBasePrice, wallUnitRacksPrice: wallUnitRacksPrice, wallUnitLedPrice: wallUnitLedPrice, wallUnitPriceFor: wallUnitPriceFor, wallUnitContribution: wallUnitContribution, wallUnitTypeName: wallUnitTypeName, wallUnitLabelFor: wallUnitLabelFor, wallUnitExtraLabelFor: wallUnitExtraLabelFor,
    parseWidthCm: parseWidthCm, sumWallUnitWidth: sumWallUnitWidth, sumCabUnitWidth: sumCabUnitWidth,
    cabUnitPositions: cabUnitPositions, cabUnitPosName: cabUnitPosName, cabAccessoriesFor: cabAccessoriesFor, cabUnitContribution: cabUnitContribution, cabUnitTotal: cabUnitTotal, cabAddUnit: cabAddUnit, cabDelUnit: cabDelUnit, cabUnitLabelFor: cabUnitLabelFor,
    disabledReason: disabledReason, autoFix: autoFix,
    kanjiYen: kanjiYen, toCSV: toCSV,
    reset: function () {
      state.sel = {}; state.sub = {}; state.toggles = {};
      state.cabunit = [{ pos: 'sink', t: 0, w: '75', d: 'D650', acc: {} }];
      state.sub.wallcabinet = { units: [{ type: 'standard', height: '70' }] };
      state.layout = 'i'; state.plan = 'basic'; state.width = '255'; state.depth = '98'; state.grade = 'class5';
      var colors = currentDoorColors();
      if (colors.length) {
        state.doorColor = colors[0].code;
        state.doorHandle = (colors[0].handles && colors[0].handles[0]) || null;
      }
    },
    setQuoteHead: function (k, v) { state.quoteHead[k] = v; },
    setRate: function (v) {
      var n = Number(v);
      state.rate = isFinite(n) && n > 0 ? n : null;
    },
    getRate: function () { return state.rate; }
  };
})();
