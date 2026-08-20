/**
 * price.js — TOTO Synla（シンラ）价格解析工具（纯函数，无 DOM 依赖）
 *
 * 挂载为 window.SYNLA.price。处理 Synla 价格表示：
 *  1. 数字 priceDiff：固定差价（正=加价 负=减价 0=基本）
 *  2. price：单品绝对价（オプション单品/セット）
 *  3. priceByType：タイプ別差价，键多样（{G,BR,DC} / {G,BRDC} / {GBR,DC} / {GBRD,C} / {GR,B,DC} / {GRDC,B} 等）
 *     匹配规则：优先精确键（==typeCode），否则取「含 typeCode 字符」中最短键；值 null = 该タイプ不可选
 *  4. pricesBySize：尺寸档差价（键为尺寸或尺寸组 "1624/1620/1618"，支持 全サイズ）
 *  5. priceMatrix { "G 1624": "＋￥..." }：タイプ×サイズ 文本矩阵（备用）
 *  6. isBasic / priceDiff:0：基本仕様（0 元）
 *
 * 文本单元格格式："＋￥10,000" / "－￥5,000" / "基本仕様" / "-" / "unknown" / 纯数字。
 */
(function () {
  'use strict';

  /** 解析文本价格单元格 → 结构化对象 */
  function parseCell(str) {
    if (str == null) return { type: 'empty' };
    str = String(str).trim();
    if (str === '') return { type: 'empty' };
    if (str === '-') return { type: 'na' };                 // 不可选
    if (/^unknown$/i.test(str)) return { type: 'unknown' }; // 手册未标注
    if (/基本仕様|基本/.test(str)) return { type: 'basic', text: str };
    var m = str.match(/^([＋－±])\s*￥\s*([\d,]+)$/);
    if (m) {
      var sign = m[1] === '－' ? -1 : 1;
      var amount = parseInt(m[2].replace(/,/g, ''), 10);
      return { type: 'num', sign: sign, amount: amount * sign, text: str };
    }
    var n = parseInt(str.replace(/[^\d-]/g, ''), 10);
    if (!isNaN(n)) return { type: 'num', sign: n >= 0 ? 1 : -1, amount: n, text: str };
    return { type: 'text', text: str };
  }

  /** 数字差价 → 显示文本（10000 → "＋￥10,000"，-5000 → "－￥5,000"，0 → "基本仕様"） */
  function fmtDiff(n) {
    if (n == null || isNaN(n)) return '—';
    if (n === 0) return '基本仕様';
    var abs = Math.abs(n).toLocaleString('ja-JP');
    return (n > 0 ? '＋￥' : '－￥') + abs;
  }

  /** タイプ code → タイプ别3列组（G ｜ B/R ｜ D/C）；未知返回 null */
  function typeGroupOf(typeCode) {
    if (typeCode === 'G') return 'G';
    if (typeCode === 'B' || typeCode === 'R') return 'BR';
    if (typeCode === 'D' || typeCode === 'C') return 'DC';
    return null;
  }

  /**
   * priceByType 多样键取值：
   *   优先完全等于 typeCode 的键；否则在所有「含 typeCode 字符」的键中取最短（更精确）键。
   *   例：{G:0,BRDC:293300} B→BRDC；{GBR:0,DC:65000} D→DC；{GBRD:0,C:211000} G→GBRD；{GR:25000,B:25000,DC:0} G→GR。
   *   值 null → 该タイプ不可选（返回 null，与无键区分需调用方判断 hasOwnProperty）。
   */
  function priceByTypeValue(option, typeCode) {
    if (!option || !option.priceByType) return null;
    var p = option.priceByType;
    if (Object.prototype.hasOwnProperty.call(p, typeCode)) return p[typeCode];
    var best = null;
    var bestLen = Infinity;
    Object.keys(p).forEach(function (k) {
      if (k.indexOf(typeCode) >= 0 && k.length < bestLen) { best = k; bestLen = k.length; }
    });
    return best != null ? p[best] : null;
  }

  /** 尺寸组匹配：pricesBySize 的键可能是 "1624/1620/1618"、"全サイズ" 或单尺寸 */
  function sizeKeyMatches(key, size) {
    if (key === '全サイズ' || key === '全尺寸') return true;
    return String(key).split('/').some(function (s) { return s.trim() === size; });
  }

  /** 取 pricesBySize 中某尺寸的价格（数字或文本） */
  function priceBySize(option, size) {
    var pbs = option.pricesBySize;
    if (!pbs) return null;
    var keys = Object.keys(pbs);
    for (var i = 0; i < keys.length; i++) {
      if (sizeKeyMatches(keys[i], size)) return pbs[keys[i]];
    }
    return null;
  }

  /** 数字/文本统一转差价数字；null 表示无法确定；'基本仕様'/'0' → 0 */
  function toAmount(v) {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    var c = parseCell(v);
    if (c.type === 'num') return c.amount;
    if (c.type === 'basic') return 0;
    return null;
  }

  /**
   * 统一取选项差价（数字）：优先级
   *   priceDiff → priceByType → pricesBySize → price → isBasic(0) → null
   * 返回数字或 null（null=未选/无法确定/该タイプ不可选）。
   */
  function priceFor(option, typeCode, size) {
    if (!option) return null;
    if (typeof option.priceDiff === 'number') return option.priceDiff;
    var v = priceByTypeValue(option, typeCode);
    if (v != null) return toAmount(v);
    if (option.pricesBySize && size) {
      v = priceBySize(option, size);
      if (v != null) return toAmount(v);
    }
    if (typeof option.price === 'number') return option.price;
    if (option.isBasic === true) return 0;
    return null;
  }

  /**
   * 选项价格摘要（卡片显示）：返回 { text, type }。
   */
  function optionPriceSummary(option, typeCode, size) {
    if (!option) return { text: '—', type: 'empty' };
    if (typeof option.priceDiff === 'number') {
      if (option.priceDiff === 0) return { text: '基本仕様', type: 'basic' };
      return { text: fmtDiff(option.priceDiff), type: 'num' };
    }
    if (option.priceByType) {
      var v = priceByTypeValue(option, typeCode);
      if (v != null) {
        if (typeof v === 'number') return { text: v === 0 ? '基本仕様' : fmtDiff(v), type: v === 0 ? 'basic' : 'num' };
        var c0 = parseCell(v);
        if (c0.type === 'num') return { text: c0.text, type: 'num' };
        if (c0.type === 'basic') return { text: '基本仕様', type: 'basic' };
        return { text: String(v), type: 'text' };
      }
      return { text: tp('该タイプ不可选', '該タイプ不可'), type: 'na' };
    }
    if (option.pricesBySize && size) {
      var v2 = priceBySize(option, size);
      if (v2 != null) {
        if (typeof v2 === 'number') return { text: v2 === 0 ? '基本仕様' : fmtDiff(v2), type: v2 === 0 ? 'basic' : 'num' };
        var c1 = parseCell(v2);
        if (c1.type === 'num') return { text: c1.text, type: 'num' };
        if (c1.type === 'basic') return { text: '基本仕様', type: 'basic' };
        return { text: String(v2), type: 'text' };
      }
    }
    if (typeof option.price === 'number') return { text: '￥' + option.price.toLocaleString('ja-JP'), type: 'num' };
    if (option.isBasic === true) return { text: '基本仕様', type: 'basic' };
    return { text: '—', type: 'empty' };
  }

  /** 双语占位（wizard 传入的简版；避免循环依赖） */
  function tp(zh, ja) { return zh; }

  /** 格式化日元金额 */
  function yen(n) {
    return '￥' + Number(n).toLocaleString('ja-JP');
  }

  window.SHOWER = window.SHOWER || {};
  window.SHOWER.price = {
    parseCell: parseCell,
    fmtDiff: fmtDiff,
    typeGroupOf: typeGroupOf,
    priceByTypeValue: priceByTypeValue,
    sizeKeyMatches: sizeKeyMatches,
    priceBySize: priceBySize,
    toAmount: toAmount,
    priceFor: priceFor,
    optionPriceSummary: optionPriceSummary,
    yen: yen
  };
})();
