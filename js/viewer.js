/* 加密阅读器：密码门 + 内置 PDF 阅读（无下载/打印，禁右键/选择，加水印） */
(function () {
  'use strict';
  var cfg = window.VIEWER_CONFIG || { password: 'laoxiao2026', watermark: '', sessionKey: 'viewer_auth' };
  var params = new URLSearchParams(location.search);
  var file = params.get('file');
  var name = params.get('name') || '产品手册';

  var gate = document.getElementById('gate');
  var viewer = document.getElementById('viewer');
  var pwInput = document.getElementById('pwInput');
  var pwBtn = document.getElementById('pwBtn');
  var pwMsg = document.getElementById('pwMsg');
  var canvas = document.getElementById('vcanvas');
  var ctx = canvas.getContext('2d');

  var pdfDoc = null, pageNum = 1, scale = 1.5;

  document.getElementById('wmText').textContent = cfg.watermark || '';
  if (!file) { pwMsg.textContent = '缺少文件参数。'; gate.style.display = 'flex'; return; }

  // ---------- 密码门 ----------
  function tryEnter() {
    if (pwInput.value.trim() === cfg.password) {
      sessionStorage.setItem(cfg.sessionKey, '1');
      openViewer();
    } else {
      pwMsg.textContent = '密码不正确，请重试。';
      pwInput.value = '';
    }
  }
  pwBtn.addEventListener('click', tryEnter);
  pwInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryEnter(); });

  // ---------- 打开阅读器 ----------
  function openViewer() {
    gate.style.display = 'none';
    viewer.style.display = 'flex';
    document.getElementById('vTitle').textContent = name;
    loadPdf(file);
  }

  function loadPdf(url) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
    pdfjsLib.getDocument(url).promise.then(function (pdf) {
      pdfDoc = pdf;
      pageNum = 1;
      updateInfo();
      renderPage(pageNum);
    }).catch(function () {
      document.getElementById('pageInfo').textContent = '加载失败';
    });
  }

  function renderPage(num) {
    if (!pdfDoc) return;
    pdfDoc.getPage(num).then(function (page) {
      var viewport = page.getViewport({ scale: scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      return page.render({ canvasContext: ctx, viewport: viewport }).promise;
    }).then(function () { updateInfo(); });
  }

  function updateInfo() {
    if (!pdfDoc) return;
    document.getElementById('pageInfo').textContent = pageNum + ' / ' + pdfDoc.numPages;
    document.getElementById('pageJump').max = pdfDoc.numPages;
    document.getElementById('zoomInfo').textContent = Math.round(scale / 1.5 * 100) + '%';
    document.getElementById('prevPage').disabled = pageNum <= 1;
    document.getElementById('nextPage').disabled = pageNum >= pdfDoc.numPages;
    var st = document.getElementById('vstage');
    st.scrollTop = 0; st.scrollLeft = 0;
  }

  function goTo(n) {
    if (!pdfDoc || n < 1 || n > pdfDoc.numPages) return;
    pageNum = n;
    renderPage(pageNum);
  }

  // ---------- 控制 ----------
  document.getElementById('prevPage').addEventListener('click', function () { goTo(pageNum - 1); });
  document.getElementById('nextPage').addEventListener('click', function () { goTo(pageNum + 1); });
  document.getElementById('pageJump').addEventListener('change', function () {
    var v = parseInt(this.value, 10);
    if (isNaN(v)) { this.value = ''; return; }
    goTo(v);
  });
  document.getElementById('zoomIn').addEventListener('click', function () { scale = Math.min(5, +(scale * 1.2).toFixed(2)); if (pdfDoc) renderPage(pageNum); });
  document.getElementById('zoomOut').addEventListener('click', function () { scale = Math.max(0.4, +(scale / 1.2).toFixed(2)); if (pdfDoc) renderPage(pageNum); });

  document.addEventListener('keydown', function (e) {
    if (gate.style.display !== 'none') return;
    if (e.key === 'ArrowLeft') goTo(pageNum - 1);
    if (e.key === 'ArrowRight') goTo(pageNum + 1);
    if (e.key === '+' || e.key === '=') { scale = Math.min(5, +(scale * 1.2).toFixed(2)); if (pdfDoc) renderPage(pageNum); }
    if (e.key === '-') { scale = Math.max(0.4, +(scale / 1.2).toFixed(2)); if (pdfDoc) renderPage(pageNum); }
  });

  // ---------- 尽力防护 ----------
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 'p' || k === 's' || k === 'u')) e.preventDefault();
  });

  // ---------- 初始化 ----------
  if (sessionStorage.getItem(cfg.sessionKey) === '1') {
    openViewer();
  } else {
    gate.style.display = 'flex';
    setTimeout(function () { pwInput.focus(); }, 100);
  }
})();