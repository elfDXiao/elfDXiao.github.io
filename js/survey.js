/* =========================================================
   客户需求调查 · 交互逻辑
   - 分步问卷向导（进度导航 / 自动保存到本机）
   - 生成需求表预览（不含任何个人信息）
   - 导出 PDF（调用浏览器打印，可另存为 PDF）
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.SURVEY_DATA;
  var STORE_KEY = 'elfd_survey_v1';
  if (!DATA) return;

  var form = document.getElementById('surveyForm');
  var stepContainer = document.getElementById('stepContainer');
  var stepsList = document.getElementById('wizardSteps');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var btnSubmit = document.getElementById('btnSubmit');
  var tip = document.getElementById('formTip');
  var wizardView = document.getElementById('wizardView');
  var resultView = document.getElementById('resultSection');
  var docEl = document.getElementById('surveyDoc');
  var resultTip = document.getElementById('resultTip');
  if (!form || !stepContainer || !stepsList) return;

  var current = 0;
  var answeredCount = 0;
  var totalFields = 0;

  DATA.sections.forEach(function (s) { totalFields += s.fields.length; });

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fieldRoot(id) {
    return form.querySelector('[data-field="' + id + '"]');
  }

  function collectField(field) {
    var res = { v: '', o: '' };
    var root = fieldRoot(field.id);
    if (!root) return res;
    var other = root.querySelector('.other-input');
    if (other) res.o = other.value.trim();
    if (field.type === 'radio') {
      var checked = root.querySelector('input[type="radio"]:checked');
      res.v = checked ? checked.value : '';
    } else if (field.type === 'checkbox') {
      res.v = Array.prototype.map.call(root.querySelectorAll('input[type="checkbox"]:checked'), function (c) { return c.value; });
    } else {
      var el = form.querySelector('[name="' + field.id + '"]');
      res.v = el ? el.value.trim() : '';
    }
    return res;
  }

  function isAnswered(field, res) {
    if (field.type === 'checkbox') return res.v.length > 0 || res.o !== '';
    return res.v !== '' || res.o !== '';
  }

  function formatAnswer(field, res) {
    if (field.type === 'checkbox') {
      var parts = res.v.slice();
      if (res.o) parts.push('其他：' + res.o);
      return parts.join('、');
    }
    if (res.o) return res.v ? res.v + '（' + res.o + '）' : '其他：' + res.o;
    return res.v;
  }

  function allAnswers() {
    var map = {};
    DATA.sections.forEach(function (sec) {
      sec.fields.forEach(function (f) {
        var res = collectField(f);
        if (isAnswered(f, res)) map[f.id] = res;
      });
    });
    return map;
  }

  function countAnswered() {
    var n = 0;
    DATA.sections.forEach(function (sec) {
      sec.fields.forEach(function (f) {
        if (isAnswered(f, collectField(f))) n++;
      });
    });
    return n;
  }

  /* ---------- 渲染 ---------- */
  function renderField(field, index) {
    var label = '<label class="field-label"><span class="q-no">' + (index + 1) + '</span>' + esc(field.label) +
      (field.hint ? '<span class="hint">' + esc(field.hint) + '</span>' : '') + '</label>';
    var body = '';
    var ph = field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : '';

    if (field.type === 'textarea') {
      body = '<textarea name="' + field.id + '" rows="3"' + ph + '></textarea>';
    } else if (field.type === 'select') {
      body = '<select name="' + field.id + '"><option value="">请选择</option>' +
        field.options.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>';
    } else if (field.type === 'radio' || field.type === 'checkbox') {
      var input = field.type === 'radio' ? 'radio' : 'checkbox';
      body = '<div class="choice-grid">' + field.options.map(function (o) {
        return '<label class="choice"><input type="' + input + '" name="' + field.id + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>';
      }).join('') + '</div>';
      if (field.other) {
        body += '<input type="text" class="other-input" placeholder="其他 / 补充：">';
      }
    } else {
      body = '<input type="' + (field.type === 'number' ? 'number' : 'text') + '" name="' + field.id + '"' + ph + '>';
    }

    return '<div class="field" data-field="' + field.id + '">' + label + body + '</div>';
  }

  function render() {
    stepContainer.innerHTML = DATA.sections.map(function (sec, i) {
      return '<div class="step form-card" data-step="' + sec.id + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<h3><span>' + sec.no + '</span>' + esc(sec.title) + '</h3>' +
        (sec.note ? '<p class="step-note">' + esc(sec.note) + '</p>' : '') +
        sec.fields.map(renderField).join('') +
        '</div>';
    }).join('');

    stepsList.innerHTML = DATA.sections.map(function (sec, i) {
      return '<li><button type="button" class="step-link' + (i === 0 ? ' active' : '') + '" data-goto="' + i + '">' +
        '<span class="step-no">' + sec.no + '</span>' +
        '<span class="step-name">' + esc(sec.title) + '</span>' +
        '<span class="step-state" aria-hidden="true"></span></button></li>';
    }).join('');
  }

  function refreshProgress() {
    answeredCount = countAnswered();
    var bar = document.getElementById('progressBar');
    var num = document.getElementById('doneCount');
    var total = document.getElementById('totalCount');
    if (bar) bar.style.width = totalFields ? Math.round(answeredCount / totalFields * 100) + '%' : '0%';
    if (num) num.textContent = answeredCount;
    if (total) total.textContent = totalFields;

    DATA.sections.forEach(function (sec, i) {
      var has = sec.fields.some(function (f) { return isAnswered(f, collectField(f)); });
      var link = stepsList.querySelector('[data-goto="' + i + '"]');
      if (link) {
        var st = link.querySelector('.step-state');
        if (st) {
          st.textContent = has ? '✓' : '';
          st.classList.toggle('done', has);
        }
      }
    });
  }

  /* ---------- 步骤导航 ---------- */
  function showStep(i, noScroll) {
    current = Math.max(0, Math.min(DATA.sections.length - 1, i));
    var steps = stepContainer.querySelectorAll('.step');
    steps.forEach(function (el, idx) { el.hidden = idx !== current; });
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.hidden = current === DATA.sections.length - 1;
    if (btnSubmit) btnSubmit.hidden = current !== DATA.sections.length - 1;
    stepsList.querySelectorAll('.step-link').forEach(function (el, idx) {
      el.classList.toggle('active', idx === current);
    });
    try { localStorage.setItem(STORE_KEY + '_step', String(current)); } catch (e) {}
    refreshProgress();
    if (!noScroll) scrollToPanel();
  }

  /* 重新选择步骤时，让右侧面板回到屏幕中上方的位置 */
  function scrollToPanel() {
    var panel = document.querySelector('.wizard-panel');
    if (!panel) return;
    var top = panel.getBoundingClientRect().top + window.scrollY;
    var target = Math.max(0, top - Math.max(30, Math.round(window.innerHeight * 0.2)));
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  function gotoStep(i) { showStep(i); }

  /* ---------- 本地保存 ---------- */
  var saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(allAnswers())); } catch (e) {}
      refreshProgress();
    }, 250);
  }

  function restore() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
    if (!saved) return;
    DATA.sections.forEach(function (sec) {
      sec.fields.forEach(function (f) {
        var res = saved[f.id];
        if (!res) return;
        var root = fieldRoot(f.id);
        if (!root) return;
        var other = root.querySelector('.other-input');
        if (other) other.value = res.o || '';
        if (f.type === 'radio') {
          if (res.v) {
            var r = root.querySelector('input[type="radio"][value="' + esc(res.v) + '"]');
            if (r) r.checked = true;
          }
        } else if (f.type === 'checkbox') {
          (res.v || []).forEach(function (v) {
            var c = root.querySelector('input[type="checkbox"][value="' + esc(v) + '"]');
            if (c) c.checked = true;
          });
        } else {
          var el = form.querySelector('[name="' + f.id + '"]');
          if (el) el.value = res.v || '';
        }
      });
    });
    var step = parseInt(localStorage.getItem(STORE_KEY + '_step') || '0', 10);
    showStep(isNaN(step) ? 0 : step, true);
  }

  /* ---------- 需求表摘要 ---------- */
  function fmtDate() {
    var d = new Date();
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }
  function fmtNo() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    var rand = String(Math.floor(1000 + Math.random() * 9000));
    return '#' + ymd + '-' + rand;
  }

  function buildDocHTML() {
    var no = fmtNo();
    var html = '';
    var sectionCount = 0;
    DATA.sections.forEach(function (sec) {
      var rows = '';
      sec.fields.forEach(function (f, fi) {
        var res = collectField(f);
        if (!isAnswered(f, res)) return;
        rows += '<div class="doc-row">' +
          '<div class="doc-q">' + (fi + 1) + '. ' + esc(f.label) + '</div>' +
          '<div class="doc-a">' + esc(formatAnswer(f, res)) + '</div>' +
          '</div>';
      });
      if (!rows) return;
      sectionCount++;
      html += '<section class="doc-section">' +
        '<h2 class="doc-sec-title"><span>' + sec.no + '</span>' + esc(sec.title) + '</h2>' +
        rows +
        '</section>';
    });
    return {
      no: no,
      html:
        '<header class="doc-header">' +
          '<div class="doc-brand">' + esc(DATA.brand) + '<span>全案设计</span></div>' +
          '<h1>' + esc(DATA.docTitle) + '</h1>' +
          '<p class="doc-sub">' + esc(DATA.docSubtitle) + '</p>' +
          '<div class="doc-meta">' +
            '<span>编号：' + no + '</span>' +
            '<span>填写日期：' + fmtDate() + '</span>' +
          '</div>' +
        '</header>' +
        (sectionCount === 0 ? '<p class="doc-empty">还没有填写任何内容，请返回问卷填写后再生成。</p>' : html) +
        '<footer class="doc-footer">' +
          '<p>提需求是你的事，能不能实现是我们的事。</p>' +
          '<p>本表由客户在网页端填写，不含任何联系方式；内容仅保存在填写者自己的浏览器中，可自行导出或删除。</p>' +
        '</footer>'
    };
  }

  function buildPlainText() {
    var lines = [];
    lines.push(DATA.brand + ' · ' + DATA.docTitle);
    lines.push(DATA.docSubtitle + '　' + fmtDate());
    lines.push('----------------------------------------');
    DATA.sections.forEach(function (sec) {
      var rows = [];
      sec.fields.forEach(function (f, fi) {
        var res = collectField(f);
        if (isAnswered(f, res)) rows.push((fi + 1) + '. ' + f.label + '：' + formatAnswer(f, res));
      });
      if (!rows.length) return;
      lines.push('【' + sec.no + ' ' + sec.title + '】');
      lines = lines.concat(rows);
      lines.push('');
    });
    return lines.join('\n');
  }

  function showResult() {
    var built = buildDocHTML();
    docEl.innerHTML = built.html;
    wizardView.hidden = true;
    resultView.hidden = false;
    resultTip.textContent = '请先预览，确认无误后点击「导出 PDF」；在打印窗口把目标打印机选为「另存为 PDF」即可保存。';
    resultTip.className = 'result-tip no-print ok';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showWizard() {
    resultView.hidden = true;
    wizardView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 复制文本 ---------- */
  function copyText() {
    var text = buildPlainText();
    function done() {
      resultTip.textContent = '已复制文本，可直接粘贴到微信 / 备忘录。';
      resultTip.className = 'result-tip no-print ok';
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- 事件绑定 ---------- */
  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', scheduleSave);

  btnPrev.addEventListener('click', function () { showStep(current - 1); });
  btnNext.addEventListener('click', function () { showStep(current + 1); });

  stepsList.addEventListener('click', function (e) {
    var link = e.target.closest('.step-link');
    if (link) gotoStep(parseInt(link.getAttribute('data-goto'), 10));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (countAnswered() === 0) {
      tip.textContent = '还没有填写任何内容，建议至少填一下「项目概况」。';
      tip.className = 'form-tip err';
      return;
    }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(allAnswers())); } catch (err) {}
    showResult();
  });

  document.getElementById('btnBack').addEventListener('click', showWizard);
  document.getElementById('btnReset').addEventListener('click', function () {
    try {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(STORE_KEY + '_step');
    } catch (e) {}
    location.reload();
  });
  document.getElementById('btnExportPdf').addEventListener('click', function () {
    resultTip.textContent = '';
    resultTip.className = 'result-tip no-print';
    // 微信内置浏览器不支持 window.print()，需引导到系统浏览器
    if (/MicroMessenger/i.test(navigator.userAgent || '')) {
      resultTip.textContent = '微信内暂不支持直接打印：请点击右上角「···」→「在浏览器中打开」后，再点「导出 PDF」保存；也可以先点「复制文本」。';
      resultTip.className = 'result-tip no-print err';
      return;
    }
    // 给浏览器一点时间刷新提示后弹出打印窗口（目标选「另存为 PDF」）
    setTimeout(function () { window.print(); }, 50);
  });
  var btnCopy = document.getElementById('btnCopy');
  if (btnCopy) btnCopy.addEventListener('click', copyText);

  /* ---------- 初始化 ---------- */
  render();
  restore();
  refreshProgress();
  showStep(parseInt(localStorage.getItem(STORE_KEY + '_step') || '0', 10) || 0, true);
})();