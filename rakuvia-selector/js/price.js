/**
 * price.js — rakuvia 价格矩阵解析工具（纯函数，无 DOM 依赖）
 *
 * 处理三类价格表示：
 *  1. 数字 priceDiff：相对基本仕様的差价（正=加价 负=减价 0=基本）
 *  2. 文本价格单元格："＋￥10,000" / "－￥5,000" / "基本仕様" / "-" / "unknown" / "＋￥0"
 *  3. 矩阵 priceMatrix：14 列 = 7尺寸 × (R/L, CR/CL)，字段键如 "1620 R/L"
 *
 * 用法（作为全局命名空间 RAKUVIA.price 挂载）：
 *   在 <script src="js/price.js"> 之后 window.RAKUVIA = window.RAKUVIA || {}; RAKUVIA.price = {...}
 */
(function () {
  'use strict';

  /** 解析文本价格单元格 → 结构化对象 */
  function parseCell(str) {
    if (str == null) return { type: 'empty' };
    str = String(str).trim();
    if (str === '' ) return { type: 'empty' };
    if (str === '-') return { type: 'na' };                 // 不可选
    if (/^unknown$/i.test(str)) return { type: 'unknown' }; // 手册未标注
    if (/基本仕様|基本/.test(str)) return { type: 'basic', text: str };
    var m = str.match(/^([＋－±])\s*￥\s*([\d,]+)$/);
    if (m) {
      var sign = m[1] === '－' ? -1 : 1;
      var amount = parseInt(m[2].replace(/,/g, ''), 10);
      return { type: 'num', sign: sign, amount: amount * sign, text: str };
    }
    // 兜底：纯数字
    var n = parseInt(str.replace(/[^\d-]/g, ''), 10);
    if (!isNaN(n)) return { type: 'num', sign: n >= 0 ? 1 : -1, amount: n, text: str };
    return { type: 'text', text: str };
  }

  /** 数字差价 → 显示文本（如 10000 → "＋￥10,000"，-5000 → "－￥5,000"，0 → "基本仕様"） */
  function fmtDiff(n) {
    if (n == null || isNaN(n)) return '—';
    if (n === 0) return '基本仕様';
    var abs = Math.abs(n).toLocaleString('ja-JP');
    return (n > 0 ? '＋￥' : '－￥') + abs;
  }

  /**
   * 取 priceMatrix 中某尺寸×位置的价格单元格文本。
   * option 可能含 colorRows（门/墙色），此时返回第一行（默认颜色）的单元格；
   * 若传 colorIdx 则取指定行。
   */
  function matrixCell(option, size, position, colorIdx) {
    var pm = null;
    if (option.priceMatrix) {
      pm = option.priceMatrix;
    } else if (Array.isArray(option.colorRows) && option.colorRows.length) {
      var idx = (colorIdx == null) ? 0 : Math.max(0, Math.min(option.colorRows.length - 1, colorIdx));
      pm = option.colorRows[idx].priceMatrix;
    }
    if (!pm) return null;
    var key = size + ' ' + position;
    if (Object.prototype.hasOwnProperty.call(pm, key)) return pm[key];
    // 兼容无空格写法
    key = size + ' ' + position;
    return Object.prototype.hasOwnProperty.call(pm, key) ? pm[key] : null;
  }

  /** 尺寸组匹配：pricesBySize / sizes 的键可能是 "1620/1618/1616" 或 "全サイズ" */
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

  /** 判断某选项是否适用于某尺寸（sizes 字段 / 矩阵列 / pricesBySize 键） */
  function optionAppliesToSize(option, size) {
    if (option.sizes) {
      if (Array.isArray(option.sizes)) {
        for (var i = 0; i < option.sizes.length; i++) {
          if (sizeKeyMatches(option.sizes[i], size)) return true;
        }
        return false;
      }
      if (typeof option.sizes === 'object') {
        return Object.keys(option.sizes).some(function (k) { return sizeKeyMatches(k, size); });
      }
    }
    if (option.priceMatrix) {
      return option.priceMatrix[size + ' R/L'] != null || option.priceMatrix[size + ' CR/CL'] != null;
    }
    if (option.colorRows && option.colorRows.length) {
      var pm0 = option.colorRows[0].priceMatrix || {};
      return pm0[size + ' R/L'] != null || pm0[size + ' CR/CL'] != null;
    }
    if (option.pricesBySize) return priceBySize(option, size) != null;
    return true; // 无尺寸限制
  }

  /**
   * 选项的价格摘要（用于卡片显示）：
   * 优先级：数字 priceDiff → 基本仕様标记 → 尺寸×位置矩阵单元格 → pricesBySize → 子选项最低价 → 无
   * 返回 { text, type }，type ∈ num/basic/na/unknown/text
   */
  function optionPriceSummary(option, size, position) {
    if (typeof option.priceDiff === 'number') {
      if (option.priceDiff === 0) return { text: '基本仕様', type: 'basic' };
      return { text: fmtDiff(option.priceDiff), type: 'num' };
    }
    if (option.priceDiff == null && option.isBasic === true) {
      return { text: '基本仕様', type: 'basic' };
    }
    // 有矩阵：按当前尺寸×位置取单元格
    if (option.priceMatrix || (Array.isArray(option.colorRows) && option.colorRows.length)) {
      if (size && position) {
        var cell = matrixCell(option, size, position, 0);
        var c = parseCell(cell);
        if (c.type === 'num') return { text: c.text, type: 'num' };
        if (c.type === 'basic') return { text: '基本仕様', type: 'basic' };
        if (c.type === 'na') return { text: '该组合不可选', type: 'na' };
        if (c.type === 'unknown') return { text: '价格未标注', type: 'unknown' };
        if (cell) return { text: cell, type: 'text' };
      }
      return { text: '按尺寸·位置查价', type: 'matrix' };
    }
    if (option.pricesBySize && size) {
      var v = priceBySize(option, size);
      if (v != null) {
        if (typeof v === 'number') return { text: fmtDiff(v), type: 'num' };
        var c2 = parseCell(v);
        if (c2.type === 'num') return { text: c2.text, type: 'num' };
        return { text: String(v), type: 'text' };
      }
      return { text: '按尺寸查价', type: 'matrix' };
    }
    if (Array.isArray(option.options) && option.options.length) {
      // 子选项（如镜子防汚加工）：取第一个非 unknown 的最低价
      var minNum = null;
      for (var i = 0; i < option.options.length; i++) {
        var sub = option.options[i];
        var vv = sub.price1620 != null ? sub.price1620 : sub.price;
        var c3 = parseCell(vv);
        if (c3.type === 'num') {
          if (minNum === null || c3.amount < minNum) minNum = c3.amount;
        }
      }
      if (minNum !== null) return { text: fmtDiff(minNum) + ' 起', type: 'num' };
      return { text: '含可选组合', type: 'text' };
    }
    if (option.price != null) return { text: fmtDiff(option.price), type: 'num' };
    return { text: '—', type: 'empty' };
  }

  /** 格式化日元金额（含税说明由调用方负责） */
  function yen(n) {
    return '￥' + Number(n).toLocaleString('ja-JP');
  }

  window.RAKUVIA = window.RAKUVIA || {};
  window.RAKUVIA.price = {
    parseCell: parseCell,
    fmtDiff: fmtDiff,
    matrixCell: matrixCell,
    priceBySize: priceBySize,
    sizeKeyMatches: sizeKeyMatches,
    optionAppliesToSize: optionAppliesToSize,
    optionPriceSummary: optionPriceSummary,
    yen: yen
  };
})();
