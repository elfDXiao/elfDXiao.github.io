/* =========================================================
   文档产出 01 · 全案设计客户需求调查 · 交互逻辑
   - 分步问卷向导（进度导航 / 自动保存到本机）
   - 生成需求表预览（不含任何个人信息）
   - 导出 PDF（桌面/普通手机走系统打印出矢量 PDF；微信内退回 html2pdf 逐页拼装）
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.SURVEY_DATA;
  var STORE_KEY = 'elfd_survey_v1';

  function lsGet(k) { try { return window.localStorage ? window.localStorage.getItem(k) : null; } catch (e) { return null; } }
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
  var docNo = '';

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
    var step = parseInt(lsGet(STORE_KEY + '_step') || '0', 10);
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

  /* ---------- 导出稿：数据模型 ---------- */
  var SECTION_I18N = {
    overview:  { en: 'Project Overview', jp: 'プロジェクト概要' },
    residents: { en: 'Residents & Household', jp: '居住者・世帯構成' },
    entryway:  { en: 'Entryway', jp: '玄関' },
    kitchen:   { en: 'Kitchen', jp: 'キッチン' },
    bathroom:  { en: 'Bathroom', jp: '浴室・洗面' },
    bedroom:   { en: 'Bedroom & Walk-in Closet', jp: '寝室・ウォークインクローゼット' },
    hvac:      { en: 'HVAC, Ventilation & Water', jp: '空調・換気・給湯' },
    smart:     { en: 'Smart Home, AV & Lighting', jp: 'スマートホーム・AV・照明' },
    study:     { en: 'Study', jp: '書斎' },
    dining:    { en: 'Dining, Laundry & Housework', jp: 'ダイニング・家事動線' },
    cabinetry: { en: 'Custom Joinery & Storage', jp: '造作家具・収納' },
    special:   { en: 'One More Thing', jp: 'もうひとつ' },
    final:     { en: 'Furniture, Appliances & Notes', jp: '家具・家電・その他' }
  };

  function findField(id) {
    var found = null;
    DATA.sections.forEach(function (sec) {
      sec.fields.forEach(function (f) { if (f.id === id) found = f; });
    });
    return found;
  }

  function rawAnswer(id) {
    var f = findField(id);
    if (!f) return '';
    var res = collectField(f);
    return formatAnswer(f, res).trim();
  }

  function areaText(v) {
    if (!v) return '';
    return /㎡|m²|m2|平米|平方/.test(v) ? v : v + ' ㎡';
  }

  function dash(v) { return v || '—'; }

  function splitLongRows(rows) {
    var out = [];
    rows.forEach(function (row) {
      if (row.a.length <= 1200) { out.push(row); return; }
      var rest = row.a;
      var part = 0;
      while (rest.length > 600) {
        var cut = rest.lastIndexOf('\n', 600);
        if (cut < 300) cut = Math.max(
          rest.lastIndexOf('。', 600), rest.lastIndexOf('；', 600),
          rest.lastIndexOf('，', 600), rest.lastIndexOf(' ', 600)
        );
        if (cut < 300) cut = 600;
        out.push({ code: row.code, q: row.q + (part ? '（续）' : ''), a: rest.slice(0, cut + 1).trim() });
        rest = rest.slice(cut + 1).trim();
        part++;
      }
      if (rest) out.push({ code: row.code, q: row.q + (part ? '（续）' : ''), a: rest });
    });
    return out;
  }

  function buildDocModel() {
    var no = fmtNo();
    var date = fmtDate();
    var answered = 0;
    var total = 0;
    var sections = [];
    DATA.sections.forEach(function (sec) {
      var rows = [];
      var secTotal = sec.fields.length;
      sec.fields.forEach(function (f) {
        total++;
        var res = collectField(f);
        if (!isAnswered(f, res)) return;
        answered++;
        rows.push({
          code: sec.no + '-' + (rows.length + 1),
          q: f.label,
          a: formatAnswer(f, res)
        });
      });
      if (!rows.length) return;
      var i18n = SECTION_I18N[sec.id] || { en: '', jp: '' };
      sections.push({
        no: sec.no,
        title: sec.title,
        en: i18n.en,
        jp: i18n.jp,
        answered: rows.length,
        total: secTotal,
        rows: splitLongRows(rows)
      });
    });

    var pct = total ? Math.round(answered / total * 100) : 0;
    var houseType = rawAnswer('ov_houseType');
    var area = areaText(rawAnswer('ov_area'));
    var layout = rawAnswer('ov_layout');
    var budget = rawAnswer('ov_budget');
    var timeline = rawAnswer('ov_timeline');
    var propNote = [area, layout].filter(Boolean).join(' · ');

    return {
      no: no,
      date: date,
      answered: answered,
      total: total,
      pct: pct,
      sections: sections,
      cards: [
        {
          cn: '填写进度', en: 'COMPLETION',
          value: answered + ' / ' + total,
          note: pct + '% 完成'
        },
        {
          cn: '项目概况', en: 'PROPERTY',
          value: dash(houseType),
          note: propNote || '面积 / 户型待补充'
        },
        {
          cn: '预算与开工', en: 'BUDGET & TIMELINE',
          value: dash(budget),
          note: timeline ? timeline + '开工' : '开工时间待定'
        }
      ],
      notes: [
        '本表仅记录设计需求与生活习惯，不构成设计合同、报价或工期承诺。',
        '空白项表示本次未作答；可在后续沟通中补充，补充后建议重新导出最新版本。',
        '本问卷不收集姓名、电话、地址等个人信息，内容仅保存在填写者本机浏览器中。',
        '编号仅用于区分填写批次，不含个人信息；导出 PDF 后可自行保存、转发或删除。',
        '面积、预算等数字以客户填写为准，现场复核后可能调整。',
        '建议在方案沟通前完成本表：信息越完整，空间与预算的取舍越准确。'
      ]
    };
  }

  /* ---------- 导出稿：分页排版 ---------- */
  var lastModel = null;
  var resizeTimer = null;

  function qdEl(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }

  function qdMasthead(model) {
    var h = qdEl('header', 'qd-mast');
    h.appendChild(qdEl('h1', 'qd-title', esc(DATA.docTitle)));
    h.appendChild(qdEl('p', 'qd-sub-en', 'Client Design Brief &amp; Lifestyle Survey'));
    h.appendChild(qdEl('p', 'qd-sub-jp', '全案設計・クライアントヒアリングシート'));
    h.appendChild(qdEl('p', 'qd-meta',
      '编号 ' + esc(model.no) + '<i>｜</i>' +
      '填写日期 ' + esc(model.date) + '<i>｜</i>' +
      '已回答 ' + model.answered + ' / ' + model.total + ' 题'
    ));
    return h;
  }

  function qdCard(model) {
    var card = qdEl('div', 'qd-card');
    model.cards.forEach(function (row) {
      var r = qdEl('div', 'qd-card-row');
      r.appendChild(qdEl('div', 'qd-card-label',
        '<b>' + esc(row.cn) + '</b><span>' + esc(row.en) + '</span>'));
      r.appendChild(qdEl('div', 'qd-card-value', esc(row.value)));
      r.appendChild(qdEl('div', 'qd-card-note', esc(row.note)));
      card.appendChild(r);
    });
    return card;
  }

  function qdRunhead() {
    return qdEl('div', 'qd-runhead',
      '<span><b>' + esc(DATA.docTitle) + '</b> · Client Design Brief</span>' +
      '<span>DOC. 01 ｜ ' + esc(DATA.brand) + '</span>');
  }

  function qdSectionTitle(sec, cont) {
    var i18n = sec.en ? esc(sec.en) + (sec.jp ? ' / ' + esc(sec.jp) : '') : '';
    return qdEl('div', 'qd-sec-title',
      '<span class="qd-sec-no">' + esc(sec.no) + '</span>' +
      '<span class="qd-sec-cn">' + esc(sec.title) +
      (cont ? '<span class="qd-sec-cont">（续）</span>' : '') + '</span>' +
      '<span class="qd-sec-en">' + i18n + '</span>');
  }

  function qdTable() {
    var table = document.createElement('table');
    table.className = 'qd-table';
    table.innerHTML =
      '<colgroup><col class="qd-c-no"><col class="qd-c-q"><col></colgroup>' +
      '<thead><tr>' +
        '<th><span class="qd-th-cn">#</span><span class="qd-th-sub">No.</span></th>' +
        '<th><span class="qd-th-cn">问题</span><span class="qd-th-sub">Question / 質問</span></th>' +
        '<th><span class="qd-th-cn">回答</span><span class="qd-th-sub">Answer / 回答</span></th>' +
      '</tr></thead><tbody></tbody>';
    return table;
  }

  function qdRow(row) {
    var tr = document.createElement('tr');
    tr.appendChild(qdEl('td', 'qd-no', esc(row.code)));
    tr.appendChild(qdEl('td', 'qd-q', esc(row.q)));
    tr.appendChild(qdEl('td', 'qd-a', esc(row.a)));
    return tr;
  }

  function qdSubtotal(sec) {
    var n = sec.answered;
    var pct = sec.total ? Math.round(n / sec.total * 100) : 0;
    return qdEl('div', 'qd-subtotal',
      '<span>本节小计：已填 ' + n + ' / ' + sec.total + ' 题</span>' +
      '<span class="qd-sub-en">SECTION SUBTOTAL · ' + n + ' / ' + sec.total + ' ANSWERED · ' + pct + '%</span>');
  }

  function qdNotes(model) {
    var box = qdEl('div', 'qd-notes');
    box.appendChild(qdEl('div', 'qd-notes-title',
      '说明与备注<span>Notes &amp; Remarks / 注意事項</span>'));
    var ul = document.createElement('ul');
    model.notes.forEach(function (txt) {
      ul.appendChild(qdEl('li', '', esc(txt)));
    });
    box.appendChild(ul);
    box.appendChild(qdEl('p', 'qd-slogan', '提需求是你的事，能不能实现是我们的事。'));
    return box;
  }

  function qdPx(mm) { return mm * 96 / 25.4; }

  function qdApplyZoom() {
    if (!docEl) return;
    docEl.style.zoom = '1';
    var host = docEl.parentElement;
    if (!host) return;
    var z = Math.min(1, (host.clientWidth - 2) / (qdPx(210) + 36));
    if (!isFinite(z) || z <= 0) z = 1;
    if (z < 1) docEl.style.zoom = Math.max(0.28, z).toFixed(4);
  }

  function renderQuoteDoc(model) {
    docEl.innerHTML = '';
    docEl.style.zoom = '1';

    var pageNo = 0;
    var body = null;

    function newPage() {
      pageNo++;
      var sheet = qdEl('section', 'qd-sheet');
      body = qdEl('div', 'qd-body');
      sheet.appendChild(body);
      sheet.appendChild(qdEl('div', 'qd-foot'));
      docEl.appendChild(sheet);
      if (pageNo > 1) body.appendChild(qdRunhead());
    }

    function contentHeight() {
      var last = body.lastElementChild;
      if (!last) return 0;
      return last.getBoundingClientRect().bottom - body.getBoundingClientRect().top;
    }

    function fits(extra) {
      // 注意：.qd-body 有固定高度 + overflow:hidden，scrollHeight 会被钳到 clientHeight，
      // 不能用它判断“还能不能再放一行”；必须量最后一个子元素的真实底边。
      return contentHeight() + (extra || 0) <= body.clientHeight + 1;
    }

    newPage();
    body.appendChild(qdMasthead(model));
    body.appendChild(qdCard(model));

    if (!model.sections.length) {
      body.appendChild(qdEl('p', 'qd-empty', '还没有填写任何内容，请返回问卷填写后再生成。'));
    } else {
      model.sections.forEach(function (sec) {
        var wrap = null;
        var tbody = null;

        function startFragment(cont) {
          var top = pageNo > 1 && !body.querySelector('.qd-sec');
          wrap = qdEl('div', 'qd-sec' + (top ? ' qd-sec-top' : ''));
          wrap.appendChild(qdSectionTitle(sec, cont));
          var table = qdTable();
          wrap.appendChild(table);
          body.appendChild(wrap);
          tbody = table.querySelector('tbody');
        }

        startFragment(false);
        if (!fits()) {
          wrap.remove();
          newPage();
          startFragment(false);
        }

        sec.rows.forEach(function (row, ri) {
          var last = ri === sec.rows.length - 1;
          var reserve = last ? qdPx(8.6) : 0;
          var tr = qdRow(row);
          tbody.appendChild(tr);
          if (!fits(reserve)) {
            tr.remove();
            if (!tbody.children.length) {
              wrap.remove();
              newPage();
              startFragment(ri > 0);
              tbody.appendChild(tr);
            } else {
              newPage();
              startFragment(true);
              tbody.appendChild(tr);
            }
          }
        });

        wrap.appendChild(qdSubtotal(sec));
        if (!fits()) {
          var band = wrap.querySelector('.qd-subtotal');
          if (band) band.remove();
          newPage();
          startFragment(true);
          wrap.appendChild(qdSubtotal(sec));
        }
      });
    }

    var notes = qdNotes(model);
    body.appendChild(notes);
    if (!fits()) {
      notes.remove();
      newPage();
      notes.classList.add('qd-notes-top');
      body.appendChild(notes);
    }

    var sheets = docEl.querySelectorAll('.qd-sheet');
    var totalPages = sheets.length;
    for (var i = 0; i < totalPages; i++) {
      var foot = sheets[i].querySelector('.qd-foot');
      if (foot) {
        foot.textContent = DATA.docTitle + ' · ' + DATA.brand +
          ' ｜ Page ' + (i + 1) + ' / ' + totalPages;
      }
    }

    qdApplyZoom();
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
    var model = buildDocModel();
    docNo = model.no;
    lastModel = model;
    wizardView.hidden = true;
    resultView.hidden = false;
    renderQuoteDoc(model);
    resultTip.textContent = '请先预览；确认后点击「导出 PDF」，在打印窗口选择「另存为 PDF」即可。';
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
    var isWeChat = /MicroMessenger/i.test(navigator.userAgent || '');

    // 桌面 / 普通手机浏览器：走系统打印，输出矢量 PDF（文字可选中、放大不糊）
    if (!isWeChat && typeof window.print === 'function') {
      resultTip.textContent = '已打开打印窗口，请把「目标打印机」选为「另存为 PDF」。';
      resultTip.className = 'result-tip no-print ok';
      document.body.classList.add('print-doc');
      window.print();
      return;
    }

    // 微信内置浏览器：打印不可用，退回 html2pdf 直接下载
    if (typeof window.html2pdf !== 'function') {
      resultTip.textContent = 'PDF 生成组件加载失败，请刷新页面重试，或先使用「复制文本」。';
      resultTip.className = 'result-tip no-print err';
      return;
    }
    resultTip.textContent = '正在生成 PDF；如未自动下载，请点右上角「···」→「在浏览器中打开」后重试。';
    resultTip.className = 'result-tip no-print ok';
    var prevZoom = docEl.style.zoom;
    docEl.style.zoom = '1';
    docEl.classList.add('qd-capture');
    var restoreZoom = function () {
      docEl.classList.remove('qd-capture');
      docEl.style.zoom = prevZoom || '';
      qdApplyZoom();
    };
    var pdfOpt = {
      margin: 0,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff', windowWidth: qdPx(210), scrollX: 0, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: [] }
    };
    var filename = '全案设计客户需求调查-' + String(docNo || '').replace('#', '') + '.pdf';
    var sheets = docEl.querySelectorAll('.qd-sheet');
    var failPdf = function () {
      restoreZoom();
      resultTip.textContent = 'PDF 生成失败，请刷新重试，或先使用「复制文本」。';
      resultTip.className = 'result-tip no-print err';
    };
    var donePdf = function () {
      restoreZoom();
      resultTip.textContent = 'PDF 已生成下载，请查收（下载目录或浏览器下载栏）。';
      resultTip.className = 'result-tip no-print ok';
    };
    if (!sheets.length) { failPdf(); return; }
    // 微信里不用 html2pdf 整篇分页（会产生空白页）：逐张 A4 截图，再手工拼进同一个 PDF。
    window.html2pdf().set(pdfOpt).from(sheets[0]).toPdf().get('pdf').then(function (pdf) {
      // 单张 297mm 高的截图会被 html2pdf 多补一张空白页，先删掉
      while (pdf.getNumberOfPages() > 1) pdf.deletePage(pdf.getNumberOfPages());
      var idx = 1;
      var nextSheet = function () {
        if (idx >= sheets.length) {
          pdf.save(filename);
          donePdf();
          return;
        }
        window.html2pdf().set(pdfOpt).from(sheets[idx]).toCanvas().get('canvas').then(function (canvas) {
          var img = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addPage();
          pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
          idx++;
          nextSheet();
        }, failPdf);
      };
      nextSheet();
    }, failPdf);
  });
  var btnCopy = document.getElementById('btnCopy');
  if (btnCopy) btnCopy.addEventListener('click', copyText);

  /* ---------- 打印 / 缩放 ---------- */
  window.addEventListener('beforeprint', function () {
    if (!lastModel || resultView.hidden) return;
    renderQuoteDoc(lastModel);
    document.body.classList.add('print-doc');
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('print-doc');
    qdApplyZoom();
  });
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(qdApplyZoom, 160);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (lastModel && !resultView.hidden) renderQuoteDoc(lastModel);
    });
  }

  /* ---------- 初始化 ---------- */
  render();
  restore();
  refreshProgress();
  showStep(parseInt(lsGet(STORE_KEY + '_step') || '0', 10) || 0, true);
})();