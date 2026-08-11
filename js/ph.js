/* 占位图生成器：在真实照片补充前，生成简约风格的示意图片 */
window.PH = (function () {
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function svg(idx, hue, label) {
    var h = hue || 25;
    var w = 800, hh = 500;
    var s =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + hh + '" viewBox="0 0 ' + w + ' ' + hh + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + h + ',32%,94%)"/>' +
      '<stop offset="1" stop-color="hsl(' + h + ',26%,84%)"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + w + '" height="' + hh + '" fill="url(#g)"/>' +
      '<circle cx="' + (w - 90) + '" cy="' + (hh - 90) + '" r="150" fill="none" stroke="rgba(33,31,27,0.10)" stroke-width="1"/>' +
      '<circle cx="' + (w - 90) + '" cy="' + (hh - 90) + '" r="105" fill="none" stroke="rgba(33,31,27,0.10)" stroke-width="1"/>' +
      '<text x="' + (w - 150) + '" y="' + (hh - 80) + '" font-family="Georgia, serif" font-size="120" fill="rgba(33,31,27,0.16)" text-anchor="middle" textLength="80">' + esc(idx) + '</text>' +
      '<text x="40" y="70" font-family="sans-serif" font-size="22" letter-spacing="6" fill="rgba(33,31,27,0.55)">' + esc(label) + '</text>' +
      '<text x="40" y="100" font-family="sans-serif" font-size="13" letter-spacing="3" fill="rgba(33,31,27,0.35)">PHOTO PLACEHOLDER</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  return {
    image: function (idx, hue, label) { return svg(idx, hue, label || '案例影像'); }
  };
})();