/* =========================================================
   文档产出 · 通用表单引擎（交底 / 确认单）
   用法：页面按顺序加载 js/city-data.js（可选，用于省市联动）、
         js/doc-xxx-data.js（window.DOC_FORM = {...}）、本脚本。
   能力：
   - gate：进入时先弹「项目信息 + 登录者身份」登记框（国家/省/市/小区/楼栋/门牌 + 身份三选一）
   - 分步逐项确认；strictOrder=true 时本章未确认完不能进入下一章
   - sign：最后一步弹出「手写签字」画板（鼠标/触屏/手写笔），签名图写入文档结尾
   - 生成文档预览 + 导出 PDF（html2pdf.js 直接下载）
   - 未填写项不隐藏，输出「待确认」，交底单打印出来始终是完整一张表
   - 全部数据（含签名图）只存在填写者本机 localStorage，不发服务器
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.DOC_FORM;
  if (!CFG || !CFG.sections || !CFG.sections.length) return;

  var STORE = CFG.storageKey || 'elfd_doc_form';
  var K_META = STORE + '_meta';
  var K_SIGN = STORE + '_sign';
  var K_SIGNNAME = STORE + '_signname';
  var GATE = CFG.gate || null;
  var SIGN = CFG.sign || null;
  var STRICT = !!CFG.strictOrder;

  var form = document.getElementById('docForm');
  var stepContainer = document.getElementById('stepContainer');
  var stepsList = document.getElementById('wizardSteps');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var btnSubmit = document.getElementById('btnSubmit');
  var tip = document.getElementById('formTip');
  var wizardView = document.getElementById('wizardView');
  var resultView = document.getElementById('resultSection');
  var docEl = document.getElementById('docSheet');
  var resultTip = document.getElementById('resultTip');
  if (!form || !stepContainer || !stepsList || !docEl) return;

  var current = 0, totalFields = 0, docNo = '', signData = '';

  CFG.sections.forEach(function (s) { totalFields += (s.fields || []).length; });

  /* ---------------- 基础工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* localStorage 在 file:// 与隐私模式下可能抛错，统一走安全包装 */
  function lsGet(k) { try { return window.localStorage ? window.localStorage.getItem(k) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { if (window.localStorage) window.localStorage.setItem(k, v); } catch (e) { /* 静默降级 */ } }
  function lsDel(k) { try { if (window.localStorage) window.localStorage.removeItem(k); } catch (e) { /* 静默降级 */ } }
  function savedStep() { var n = parseInt(lsGet(STORE + '_step'), 10); return isNaN(n) ? 0 : n; }
  function fieldRoot(id) { return form.querySelector('[data-field="' + id + '"]'); }
  function fmtDate(d) { return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }
  function fmtNo() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    return '#' + (CFG.noPrefix || 'DOC') + '-' + ymd + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }

  /* ---------------- 项目信息（gate） ---------------- */
  var meta = (function () {
    try { return JSON.parse(lsGet(K_META) || 'null') || {}; } catch (e) { return {}; }
  })();

  var GATE_FIELDS = [
    { key: 'country', label: '国家', def: '中国', required: true },
    { key: 'province', label: '省份', type: 'province', required: true },
    { key: 'city', label: '城市', type: 'city', required: true },
    { key: 'estate', label: '小区名称', placeholder: '如：棠林路 99 弄', required: true },
    { key: 'building', label: '楼栋号', placeholder: '如：30 号 / 12 栋', required: true },
    { key: 'room', label: '门牌号', placeholder: '如：502 室', required: true }
  ];
  var ROLES = (GATE && GATE.roles) || ['业主', '设计师', '项目经理'];

  function provinceList() {
    var data = window.CITY_DATA;
    if (!data) return null;
    return Object.keys(data).map(function (code) { return data[code].name; }).sort(function (a, b) { return a.localeCompare(b, 'zh-Hans-CN'); });
  }
  function cityList(prov) {
    var data = window.CITY_DATA;
    if (!data || !prov) return null;
    var hit = null;
    Object.keys(data).forEach(function (code) { if (data[code].name === prov) hit = data[code]; });
    if (!hit) return null;
    return hit.cities.map(function (c) { return c.name; });
  }
  function gateValues() {
    var box = document.getElementById('gateBox');
    if (!box) return {};
    var out = {};
    GATE_FIELDS.forEach(function (f) {
      var el = box.querySelector('[name="g_' + f.key + '"]');
      if (el) out[f.key] = String(el.value).trim();
    });
    var role = box.querySelector('input[name="g_role"]:checked');
    out.role = role ? role.value : '';
    return out;
  }
  function gateMissing(v) {
    var need = [];
    GATE_FIELDS.forEach(function (f) { if (!v[f.key]) need.push(f.label); });
    if (!v.role) need.push('登录者身份');
    return need;
  }
  function gateHTML() {
    var provs = provinceList();
    var body = '<div class="gate-grid">';
    GATE_FIELDS.forEach(function (f) {
      var val = meta[f.key] || (f.key === 'country' ? ((GATE && GATE.countryDefault) || '中国') : '');
      if (f.type === 'province' && provs) {
        body += '<label class="gate-cell"><span>' + f.label + '</span><select name="g_province"><option value="">请选择</option>' +
          provs.map(function (p) { return '<option' + (p === val ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('') + '</select></label>';
      } else if (f.type === 'city') {
        var cs = cityList(meta.province);
        if (cs) {
          body += '<label class="gate-cell"><span>' + f.label + '</span><select name="g_city"><option value="">请选择</option>' +
            cs.map(function (c) { return '<option' + (c === val ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>';
        } else {
          body += '<label class="gate-cell"><span>' + f.label + '</span><input type="text" name="g_city" value="' + esc(val) + '" placeholder="' + esc(f.placeholder || '') + '"></label>';
        }
      } else {
        body += '<label class="gate-cell"><span>' + f.label + '</span><input type="text" name="g_' + f.key + '" value="' + esc(val) + '" placeholder="' + esc(f.placeholder || '') + '"></label>';
      }
    });
    body += '</div>';
    var role = '<div class="gate-cell wide"><span>登录者身份（三选一）</span><div class="state-grid">' +
      ROLES.map(function (r) {
        return '<label class="state' + (meta.role === r ? ' picked' : '') + '"><input type="radio" name="g_role" value="' + esc(r) + '"' + (meta.role === r ? ' checked' : '') + '><span>' + esc(r) + '</span></label>';
      }).join('') + '</div></div>';
    return '<div id="gateMask" class="elfd-mask">' +
      '<div class="elfd-card" role="dialog" aria-modal="true" aria-labelledby="gateTitle">' +
        '<h3 class="elfd-title" id="gateTitle">' + esc((GATE && GATE.title) || '项目信息与登录身份') + '</h3>' +
        '<p class="elfd-note">' + esc((GATE && GATE.intro) || '先登记项目信息与你的身份，生成的 PDF 抬头与签字确认会带上这些内容。') + '</p>' +
        '<div id="gateBox">' + body + role + '</div>' +
        '<p class="elfd-err" id="gateErr">还有必填项没填完</p>' +
        '<div class="elfd-actions"><button type="button" class="btn btn-accent" id="gateOk">确认并进入</button>' +
        '<button type="button" class="btn btn-line gate-skip" hidden>稍后填写</button></div>' +
      '</div></div>';
  }
  function openGate(editing) {
    closeGate();
    var wrap = document.createElement('div');
    wrap.innerHTML = gateHTML();
    var mask = wrap.firstChild;
    document.body.appendChild(mask);
    if (editing) { var skip = mask.querySelector('.gate-skip'); if (skip) skip.hidden = false; }
    var box = mask.querySelector('#gateBox');
    box.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'g_province') {
        var cs = cityList(e.target.value);
        var cityCell = box.querySelector('[name="g_city"]');
        if (cs && cityCell && cityCell.tagName === 'INPUT') {
          var sel = document.createElement('select');
          sel.name = 'g_city';
          sel.innerHTML = '<option value="">请选择</option>' + cs.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
          cityCell.parentNode.replaceChild(sel, cityCell);
        } else if (!cs && cityCell && cityCell.tagName === 'SELECT') {
          var inp = document.createElement('input');
          inp.type = 'text'; inp.name = 'g_city';
          cityCell.parentNode.replaceChild(inp, cityCell);
        }
      }
      var st = e.target && e.target.closest ? e.target.closest('.state') : null;
      if (st && e.target.type === 'radio') {
        var grp = e.target.closest('.state-grid');
        Array.prototype.forEach.call(grp.querySelectorAll('.state'), function (l) {
          var i = l.querySelector('input'); l.classList.toggle('picked', !!(i && i.checked));
        });
      }
    });
    mask.querySelector('#gateOk').addEventListener('click', function () {
      var v = gateValues(), miss = gateMissing(v);
      var err = mask.querySelector('#gateErr');
      if (miss.length) {
        err.textContent = '请先填写：' + miss.join('、');
        err.style.display = 'block';
        return;
      }
      meta = v; meta.ts = Date.now();
      lsSet(K_META, JSON.stringify(meta));
      closeGate();
      refreshMetaLine();
    });
    var skipBtn = mask.querySelector('.gate-skip');
    if (skipBtn) skipBtn.addEventListener('click', closeGate);
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var first = mask.querySelector('input:not([type=radio]),select');
      if (first && !first.value) { try { first.focus(); } catch (e) {} }
    }, 60);
  }
  function closeGate() {
    var m = document.getElementById('gateMask');
    if (m) m.remove();
    document.body.style.overflow = '';
  }
  function addrLine() {
    var seen = [];
    [meta.country, meta.province, meta.city, meta.estate, meta.building, meta.room].forEach(function (x) {
      if (!x) return;
      if (seen[seen.length - 1] === x) return;   // 直辖市省市同名，只写一次
      seen.push(x);
    });
    return seen.join(' ');
  }
  function refreshMetaLine() {
    var el = document.getElementById('metaLine');
    if (!el) return;
    if (meta.role || meta.estate) {
      el.innerHTML = '<b>已登记：</b>' + esc(addrLine() || '（地址未填）') + '　·　<b>提交人身份：</b>' + esc(meta.role || '未选择') +
        '　<a href="#" id="editMeta">修改</a>';
      var a = el.querySelector('#editMeta');
      if (a) a.addEventListener('click', function (e) { e.preventDefault(); openGate(true); });
    } else {
      el.innerHTML = '<a href="#" id="editMeta">登记项目信息与登录身份</a>';
      var b = el.querySelector('#editMeta');
      if (b) b.addEventListener('click', function (e) { e.preventDefault(); openGate(true); });
    }
    el.hidden = false;
  }
  /* ---------------- 答案收集 ---------------- */
  function collectField(field) {
    var res = { v: '', o: '', r: '' };
    var root = fieldRoot(field.id);
    if (!root) return res;
    var other = root.querySelector('.other-input');
    if (other) res.o = other.value.trim();
    var remark = root.querySelector('.remark-input');
    if (remark) res.r = remark.value.trim();
    if (field.type === 'radio' || field.type === 'confirm') {
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
  function isFilled(field, res) {
    if (field.type === 'checkbox') return res.v.length > 0 || res.o !== '';
    return res.v !== '' || res.o !== '' || res.r !== '';
  }
  /* 强制依次确认时：备注与「其他」不算正式确认，必须给出选择或数值 */
  function isConfirmed(field, res) {
    if (field.optional) return true;
    if (field.type === 'checkbox') return res.v.length > 0;
    return res.v !== '';
  }
  function answerText(field, res) {
    var main = res.v;
    if (field.type === 'checkbox') main = res.v.join('、');
    if (res.o) main = main ? main + '（其他：' + res.o + '）' : '其他：' + res.o;
    if (res.r) main = main ? main + '｜备注：' + res.r : '备注：' + res.r;
    return main;
  }
  function allAnswers() {
    var map = {};
    CFG.sections.forEach(function (sec) {
      (sec.fields || []).forEach(function (f) {
        var res = collectField(f);
        if (isFilled(f, res)) map[f.id] = res;
      });
    });
    return map;
  }
  function countFilled() {
    var n = 0;
    CFG.sections.forEach(function (sec) {
      (sec.fields || []).forEach(function (f) { if (isFilled(f, collectField(f))) n++; });
    });
    return n;
  }
  function chapterMissing(sec) {
    var miss = [];
    (sec.fields || []).forEach(function (f) {
      var res = collectField(f);
      if (!isConfirmed(f, res)) miss.push(f.label.replace(/[？?]\s*$/, ''));
    });
    return miss;
  }
  function stateClass(field, res) {
    var v = String(res.v);
    if (field.type === 'checkbox') v = res.v[0] || '';
    if (/^(不适用|不需要|无需|无此项|不涉及|暂无|无特殊)/.test(v)) return 'na';
    if (/待定|待确认|待补|待测|待复核|另定|商量|不确定|不清楚|需进一步|待现场/.test(v)) return 'na';
    if (/^(不符合|未完成|未|缺|不满足|不是|否|冲突|偏长|偏短|偏低|偏高|超长|需整改|需返工|被遮挡|有冲突|有改动|未提交|未开辟|未裸露)/.test(v)) return 'bad';
    if (/^(符合|满足|已完成|已确认|已确定|已到位|已预留|已弹线|已办理|已报备|已约定|已复核|已提交|已开辟|已裸露|已记录|已单独接入|已保温|已设置|已处理|通过|正常|可以|可通过|无冲突|无改动|无需改动|无此项风险|是|OK)/.test(v)) return 'ok';
    return '';
  }

  /* ---------------- 渲染表单 ---------------- */
  function renderField(field, index) {
    var label = '<label class="field-label"><span class="q-no">' + (index + 1) + '</span>' + esc(field.label) +
      (field.hint ? '<span class="hint">' + esc(field.hint) + '</span>' : '') +
      (field.optional ? '<span class="opt-tag">可选</span>' : '') + '</label>';
    var body = '';
    var ph = field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : '';
    if (field.std) body += '<p class="std-line"><span class="std-tag">备注</span>' + esc(field.std) + '</p>';

    if (field.type === 'textarea') {
      body += '<textarea name="' + field.id + '" rows="3"' + ph + '></textarea>';
    } else if (field.type === 'select') {
      body += '<select name="' + field.id + '"><option value="">请选择</option>' +
        (field.options || []).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>';
    } else if (field.type === 'confirm') {
      var opts = field.options || ['符合', '不符合', '待确认', '不适用'];
      body += '<div class="state-grid">' + opts.map(function (o) {
        return '<label class="state"><input type="radio" name="' + field.id + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>';
      }).join('') + '</div>';
      body += '<input type="text" class="remark-input" placeholder="现场记录（尺寸、问题、责任人…）">';
    } else if (field.type === 'radio' || field.type === 'checkbox') {
      var input = field.type === 'radio' ? 'radio' : 'checkbox';
      body += '<div class="choice-grid">' + (field.options || []).map(function (o) {
        return '<label class="choice"><input type="' + input + '" name="' + field.id + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>';
      }).join('') + '</div>';
      if (field.other) body += '<input type="text" class="other-input" placeholder="其他 / 补充：">';
    } else {
      var t = field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : 'text');
      body += '<input type="' + t + '" name="' + field.id + '"' + ph + '>';
    }
    return '<div class="field" data-field="' + field.id + '">' + label + body + '</div>';
  }

  function render() {
    stepContainer.innerHTML = CFG.sections.map(function (sec, i) {
      var extra = '';
      if (sec.lead) extra += '<p class="sec-lead">' + esc(sec.lead) + '</p>';
      if (sec.tips && sec.tips.length) {
        extra += '<ul class="sec-tips">' + sec.tips.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      }
      return '<div class="step form-card doc-step"' + (i === 0 ? '' : ' hidden') + ' data-step="' + i + '">' +
        '<h3><span>' + esc(sec.no) + '</span>' + esc(sec.title) + '</h3>' +
        (sec.note ? '<p class="step-note">' + esc(sec.note) + '</p>' : '') + extra +
        (sec.fields || []).map(renderField).join('') +
        '</div>';
    }).join('');

    stepsList.innerHTML = CFG.sections.map(function (sec, i) {
      return '<li><button type="button" class="step-link' + (i === 0 ? ' active' : '') + '" data-goto="' + i + '">' +
        '<span class="step-no">' + esc(sec.no) + '</span>' +
        '<span class="step-name">' + esc(sec.title) + '</span>' +
        '<span class="step-state" aria-hidden="true"></span></button></li>';
    }).join('');
  }

  function refreshProgress() {
    var done = countFilled();
    var bar = document.getElementById('progressBar');
    var num = document.getElementById('doneCount');
    var total = document.getElementById('totalCount');
    if (bar) bar.style.width = totalFields ? Math.round(done / totalFields * 100) + '%' : '0%';
    if (num) num.textContent = done;
    if (total) total.textContent = totalFields;
    CFG.sections.forEach(function (sec, i) {
      var miss = chapterMissing(sec).length;
      var link = stepsList.querySelector('[data-goto="' + i + '"]');
      if (!link) return;
      var st = link.querySelector('.step-state');
      if (st) { st.textContent = miss === 0 ? '✓' : (miss + ''); st.classList.toggle('done', miss === 0); }
      link.classList.toggle('locked', i > 0 && chapterMissing(CFG.sections[i - 1]).length > 0 && STRICT);
    });
  }
  /* ---------------- 步骤切换（可强制依次确认） ---------------- */
  function canLeave(i) {
    if (!STRICT) return true;
    var miss = chapterMissing(CFG.sections[i]);
    if (!miss.length) return true;
    if (tip) {
      tip.textContent = '本章还有 ' + miss.length + ' 项未确认：' + miss.slice(0, 4).join('；') + (miss.length > 4 ? ' 等' : '');
      tip.className = 'form-tip err';
    }
    refreshProgress();
    return false;
  }
  function showStep(i, noScroll) {
    var target = Math.max(0, Math.min(CFG.sections.length - 1, i || 0));
    if (target > current) {
      for (var k = current; k < target; k++) { if (!canLeave(k)) return; }
    }
    current = target;
    Array.prototype.forEach.call(stepContainer.querySelectorAll('.step'), function (el, idx) {
      el.hidden = idx !== current;
    });
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.hidden = current === CFG.sections.length - 1;
    if (btnSubmit) btnSubmit.hidden = current !== CFG.sections.length - 1;
    Array.prototype.forEach.call(stepsList.querySelectorAll('.step-link'), function (el, idx) {
      el.classList.toggle('active', idx === current);
    });
    lsSet(STORE + '_step', String(current));
    refreshProgress();
    if (tip && tip.classList.contains('err')) { tip.textContent = ''; tip.className = 'form-tip'; }
    if (!noScroll) scrollToPanel();
  }
  function scrollToPanel() {
    var panel = document.querySelector('.wizard-panel');
    if (!panel) return;
    var top = panel.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - Math.max(30, Math.round(window.innerHeight * 0.2))), behavior: 'smooth' });
  }

  /* ---------------- 本机保存 / 恢复 ---------------- */
  var saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      lsSet(STORE, JSON.stringify(allAnswers()));
      refreshProgress();
    }, 250);
  }
  function restore() {
    var saved = null;
    try { saved = JSON.parse(lsGet(STORE) || 'null'); } catch (e) {}
    if (!saved) return;
    CFG.sections.forEach(function (sec) {
      (sec.fields || []).forEach(function (f) {
        var res = saved[f.id]; if (!res) return;
        var root = fieldRoot(f.id); if (!root) return;
        var other = root.querySelector('.other-input'); if (other) other.value = res.o || '';
        var remark = root.querySelector('.remark-input'); if (remark) remark.value = res.r || '';
        if (f.type === 'radio' || f.type === 'confirm') {
          if (res.v) {
            var r = root.querySelector('input[type="radio"][value="' + esc(res.v) + '"]');
            if (r) { r.checked = true; var lab = r.closest('.state'); if (lab) lab.classList.add('picked'); }
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
  }

  /* ---------------- 手写签字板 ---------------- */
  function signHTML() {
    return '<div id="signMask" class="elfd-mask">' +
      '<div class="elfd-card wide" role="dialog" aria-modal="true" aria-labelledby="signTitle">' +
        '<h3 class="elfd-title" id="signTitle">' + esc((SIGN && SIGN.title) || '手写签字确认') + '</h3>' +
        '<p class="elfd-note">' + esc((SIGN && SIGN.note) || '请在下方区域手写签名，签名将写入文档结尾的「签字确认」。') + '</p>' +
        '<div class="sig-box"><canvas id="sigPad" width="1000" height="300" aria-label="手写签名区域"></canvas>' +
          '<span class="sig-hint" id="sigHint">在此签名（鼠标 / 触屏 / 手写笔）</span></div>' +
        '<label class="gate-cell sig-name"><span>' + esc((SIGN && SIGN.nameLabel) || '签名人姓名（可选）') + '</span>' +
          '<input type="text" id="sigName" value="' + esc(lsGet(K_SIGNNAME) || '') + '"></label>' +
        '<p class="elfd-err" id="signErr">还没有签名，请先在上方写一下</p>' +
        '<div class="elfd-actions">' +
          '<button type="button" class="btn btn-line" id="sigClear">清除重写</button>' +
          '<button type="button" class="btn btn-accent" id="sigOk">确认签字并生成文档</button>' +
        '</div>' +
      '</div></div>';
  }
  function openSign() {
    closeSign();
    var wrap = document.createElement('div');
    wrap.innerHTML = signHTML();
    var mask = wrap.firstChild;
    document.body.appendChild(mask);
    document.body.style.overflow = 'hidden';
    var cv = mask.querySelector('#sigPad');
    var hint = mask.querySelector('#sigHint');
    var ctx = cv.getContext('2d');
    var drawing = false, dirty = false, last = null;
    ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#211f1b';
    function pos(e) {
      var r = cv.getBoundingClientRect();
      var t = (e.touches && e.touches[0]) || e;
      return { x: (t.clientX - r.left) * (cv.width / r.width), y: (t.clientY - r.top) * (cv.height / r.height) };
    }
    function start(e) { drawing = true; last = pos(e); e.preventDefault(); }
    function move(e) {
      if (!drawing) return;
      var p = pos(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      if (!dirty) { dirty = true; hint.style.display = 'none'; }
      e.preventDefault();
    }
    function end(e) { if (drawing) { drawing = false; if (e && e.preventDefault) e.preventDefault(); } }
    cv.addEventListener('mousedown', start); cv.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    cv.addEventListener('touchstart', start, { passive: false });
    cv.addEventListener('touchmove', move, { passive: false });
    cv.addEventListener('touchend', end);
    mask.querySelector('#sigClear').addEventListener('click', function () {
      ctx.clearRect(0, 0, cv.width, cv.height); dirty = false; hint.style.display = '';
    });
    mask.querySelector('#sigOk').addEventListener('click', function () {
      if (!dirty) {
        var err = mask.querySelector('#signErr');
        err.style.display = 'block';
        return;
      }
      try { signData = cv.toDataURL('image/png'); } catch (e) { signData = ''; }
      if (!signData) {
        mask.querySelector('#signErr').textContent = '这台浏览器不允许导出签名画板，请改用鼠标签名或换浏览器';
        mask.querySelector('#signErr').style.display = 'block';
        return;
      }
      lsSet(K_SIGN, signData);
      var nm = mask.querySelector('#sigName');
      lsSet(K_SIGNNAME, nm ? nm.value.trim() : '');
      closeSign();
      showResult();
    });
    if (signData) {
      var pre = new Image();
      pre.onload = function () { try { ctx.drawImage(pre, 0, 0, cv.width, cv.height); dirty = true; hint.style.display = 'none'; } catch (e) {} };
      pre.src = signData;
    }
    setTimeout(function () { try { cv.focus(); } catch (e) {} }, 60);
  }
  function closeSign() {
    var m = document.getElementById('signMask');
    if (m) m.remove();
    document.body.style.overflow = '';
  }
  /* ---------------- 生成文档 ---------------- */
  function renderRow(field, fi, res, filled) {
    var q = '<div class="doc-q"><span class="doc-no">' + (fi + 1) + '</span>' + esc(field.label) +
      (field.std ? '<span class="doc-std">备注：' + esc(field.std) + '</span>' : '') + '</div>';
    var a;
    if (!filled) {
      a = '<div class="doc-a"><span class="st wait">待确认</span></div>';
    } else if (field.type === 'checkbox') {
      a = '<div class="doc-a"><span class="doc-tags">' + res.v.map(function (v) {
        return '<span class="doc-tag">' + esc(v) + '</span>';
      }).join('') + '</span>' + (res.o ? '<span class="doc-note-txt">其他：' + esc(res.o) + '</span>' : '') +
        (res.r ? '<span class="doc-note-txt">备注：' + esc(res.r) + '</span>' : '') + '</div>';
    } else if (field.type === 'confirm' || field.type === 'radio') {
      var cls = field.type === 'confirm' ? (stateClass(field, res) || 'wait') : '';
      var tail = [];
      if (res.o) tail.push('其他：' + esc(res.o));
      if (res.r) tail.push('备注：' + esc(res.r));
      a = '<div class="doc-a">' + (res.v ? (field.type === 'confirm' ? '<span class="st ' + cls + '">' + esc(res.v) + '</span>' : esc(res.v)) : '') +
        (tail.length ? '<span class="doc-note-txt">' + tail.join('　') + '</span>' : '') + '</div>';
    } else {
      a = '<div class="doc-a">' + esc(answerText(field, res)) + '</div>';
    }
    return '<div class="doc-row' + (filled ? '' : ' is-wait') + '">' + q + a + '</div>';
  }

  function signSectionHTML() {
    var sig = CFG.signature;
    if (!sig || !sig.columns) return '';
    var hand = '';
    if (signData) {
      var nm = lsGet(K_SIGNNAME) || '';
      var match = (GATE && GATE.roleMatch && meta.role) ? GATE.roleMatch[meta.role] : '';
      hand = '<div class="sign-hand">' +
        '<p class="sign-hand-cap">提交人手写签字' + (meta.role ? '（身份：' + esc(meta.role) + '）' : '') + '</p>' +
        '<img class="sign-hand-img" src="' + signData + '" alt="手写签名">' +
        '<p class="sign-hand-info">' + (nm ? '签名人：' + esc(nm) + '　' : '') + '日期：' + fmtDate(new Date()) + '</p>' +
        '</div>';
      if (match) {
        sig = { no: sig.no, title: sig.title, note: sig.note, columns: sig.columns.filter(function (c) {
          return String(c.role).indexOf(match) === -1;
        }) };
      }
    }
    return '<section class="doc-section doc-sign">' +
      '<h2 class="doc-sec-title"><span>' + esc(sig.no || '—') + '</span>' + esc(sig.title || '签字确认') + '</h2>' +
      (sig.note ? '<p class="doc-lead">' + esc(sig.note) + '</p>' : '') +
      hand +
      (sig.columns && sig.columns.length ? '<div class="sign-grid">' + sig.columns.map(function (c) {
        return '<div class="sign-cell"><p class="sign-role">' + esc(c.role) + '</p>' +
          '<p class="sign-line">签字：</p><p class="sign-line">日期：</p></div>';
      }).join('') + '</div>' : '') +
      '</section>';
  }

  function buildDocHTML() {
    var no = fmtNo();
    var html = '';
    CFG.sections.forEach(function (sec) {
      var rows = '';
      (sec.fields || []).forEach(function (f, fi) {
        var res = collectField(f);
        rows += renderRow(f, fi, res, isFilled(f, res));
      });
      html += '<section class="doc-section">' +
        '<h2 class="doc-sec-title"><span>' + esc(sec.no) + '</span>' + esc(sec.title) + '</h2>' +
        (sec.lead ? '<p class="doc-lead">' + esc(sec.lead) + '</p>' : '') +
        rows +
        (sec.tips && sec.tips.length ? '<ul class="doc-tips">' + sec.tips.map(function (x) {
          return '<li>' + esc(x) + '</li>';
        }).join('') + '</ul>' : '') +
        '</section>';
    });

    var foot = CFG.footer && CFG.footer.length ? CFG.footer : [
      '本单由现场交底时逐项确认，未确认项以「待确认」列出，须在复尺 / 下单前补齐。',
      '内容仅保存在填写者自己的浏览器中，导出 PDF 后可按需删除。'
    ];
    var byline = '';
    if (meta.role || meta.estate) {
      byline = '<p class="doc-byline"><span>项目地址：' + esc(addrLine() || '（未登记）') + '</span>' +
        '<span>本单由 <b>' + esc(meta.role || '未登记身份') + '</b> 提交确认</span></p>';
    }

    return {
      no: no,
      html:
        '<header class="doc-header">' +
          '<div class="doc-brand">' + esc(CFG.brand || 'ELF.D') + '<span>' + esc(CFG.docTag || '文档产出') + '</span></div>' +
          '<h1>' + esc(CFG.docTitle) + '</h1>' +
          '<p class="doc-sub">' + esc(CFG.docSubtitle || '') + '</p>' +
          byline +
          '<div class="doc-meta">' +
            '<span>编号：' + no + '</span>' +
            '<span>生成日期：' + fmtDate(new Date()) + '</span>' +
            (signData ? '<span>已手写签字</span>' : '<span>未签字</span>') +
          '</div>' +
        '</header>' +
        (CFG.printNotes && CFG.printNotes.length ? '<div class="doc-alert"><b>使用说明</b>' +
          CFG.printNotes.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' : '') +
        (CFG.standards && CFG.standards.length ? '<div class="doc-std-box"><b>本文件规范依据</b>' +
          CFG.standards.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
        html +
        (CFG.issues && CFG.issues.length ? '<div class="doc-issue"><b>典型问题（历次返工主因）</b>' +
          CFG.issues.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' : '') +
        signSectionHTML() +
        '<footer class="doc-footer">' + foot.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</footer>'
    };
  }

  function buildPlainText() {
    var lines = [
      (CFG.brand || 'ELF.D') + ' · ' + CFG.docTitle,
      (CFG.docSubtitle || '') + '　' + fmtDate(new Date())
    ];
    if (meta.role || meta.estate) {
      lines.push('项目地址：' + addrLine());
      lines.push('提交人身份：' + (meta.role || '未登记'));
    }
    lines.push('----------------------------------------');
    CFG.sections.forEach(function (sec) {
      lines.push('【' + sec.no + ' ' + sec.title + '】');
      if (sec.lead) lines.push('说明：' + sec.lead);
      (sec.fields || []).forEach(function (f, fi) {
        var res = collectField(f);
        var filled = isFilled(f, res);
        lines.push((fi + 1) + '. ' + f.label + '：' + (filled ? answerText(f, res) : '待确认'));
      });
      if (sec.tips && sec.tips.length) sec.tips.forEach(function (x) { lines.push('· ' + x); });
      lines.push('');
    });
    if (CFG.signature) {
      lines.push('【' + (CFG.signature.title || '签字确认') + '】');
      if (signData) lines.push('提交人手写签字：' + (lsGet(K_SIGNNAME) || '') + '（' + (meta.role || '') + '）已写入 PDF');
      CFG.signature.columns.forEach(function (c) { lines.push(c.role + '：＿＿＿＿＿＿　日期：＿＿＿＿＿＿'); });
    }
    return lines.join('\n');
  }

  function showResult() {
    var built = buildDocHTML();
    docNo = built.no;
    docEl.innerHTML = built.html;
    wizardView.hidden = true;
    resultView.hidden = false;
    ensureResultButtons();
    resultTip.textContent = signData
      ? '手写签字已写入文档，点「导出 PDF」即可下载（抬头含项目地址与提交人身份，结尾是签字确认）。'
      : '请点「手写签字」补上签名，再点「导出 PDF」下载。';
    resultTip.className = 'result-tip no-print ok';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showWizard() {
    resultView.hidden = true;
    wizardView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function ensureResultButtons() {
    var bar = resultView.querySelector('.result-actions');
    if (!bar || bar.querySelector('[data-role="sign"]')) return;
    if (SIGN) {
      var b1 = document.createElement('button');
      b1.type = 'button'; b1.className = 'btn btn-line'; b1.setAttribute('data-role', 'sign');
      b1.textContent = signData ? '重新手写签字' : '手写签字';
      b1.addEventListener('click', openSign);
      bar.insertBefore(b1, bar.firstChild);
    }
    if (GATE) {
      var b2 = document.createElement('button');
      b2.type = 'button'; b2.className = 'btn btn-line'; b2.setAttribute('data-role', 'meta');
      b2.textContent = '修改项目信息';
      b2.addEventListener('click', function () { openGate(true); });
      bar.appendChild(b2);
    }
  }
  function copyText() {
    var text = buildPlainText();
    function done() {
      resultTip.textContent = '已复制文本，可直接粘贴到微信 / 备忘录。';
      resultTip.className = 'result-tip no-print ok';
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  /* ---------------- 事件 ---------------- */
  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', scheduleSave);
  /* 确认态选中高亮 */
  form.addEventListener('change', function (e) {
    var el = e.target;
    if (!el || el.type !== 'radio' || !el.closest || !el.closest('.state-grid')) return;
    var root = el.closest('.field') || form;
    Array.prototype.forEach.call(root.querySelectorAll('.state'), function (l) {
      var inp = l.querySelector('input');
      l.classList.toggle('picked', !!(inp && inp.checked));
    });
  });

  if (btnPrev) btnPrev.addEventListener('click', function () { showStep(current - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { showStep(current + 1); });
  stepsList.addEventListener('click', function (e) {
    var link = e.target.closest('.step-link');
    if (link) showStep(parseInt(link.getAttribute('data-goto'), 10));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (STRICT) {
      for (var k = 0; k < CFG.sections.length - 1; k++) {
        if (chapterMissing(CFG.sections[k]).length) { showStep(k); canLeave(k); return; }
      }
      if (!canLeave(current)) return;
    }
    lsSet(STORE, JSON.stringify(allAnswers()));
    if (SIGN && SIGN.mode === 'hand') { openSign(); return; }
    showResult();
  });

  var btnBack = document.getElementById('btnBack');
  if (btnBack) btnBack.addEventListener('click', showWizard);
  var btnReset = document.getElementById('btnReset');
  if (btnReset) btnReset.addEventListener('click', function () {
    lsDel(STORE); lsDel(STORE + '_step');
    location.reload();
  });
  var btnCopy = document.getElementById('btnCopy');
  if (btnCopy) btnCopy.addEventListener('click', copyText);

  var btnPdf = document.getElementById('btnExportPdf');
  if (btnPdf) btnPdf.addEventListener('click', function () {
    if (typeof window.html2pdf !== 'function') {
      resultTip.textContent = 'PDF 生成组件加载失败，请刷新页面重试，或先使用「复制文本」。';
      resultTip.className = 'result-tip no-print err';
      return;
    }
    if (SIGN && SIGN.mode === 'hand' && !signData) {
      resultTip.textContent = '还没有手写签字，请先补上签名再导出。';
      resultTip.className = 'result-tip no-print err';
      openSign();
      return;
    }
    resultTip.textContent = '正在生成 PDF，请稍候…';
    resultTip.className = 'result-tip no-print ok';
    if (/MicroMessenger/i.test(navigator.userAgent || '')) {
      resultTip.textContent = '正在生成 PDF；如未自动下载，请点右上角「···」→「在浏览器中打开」后重试。';
    }
    var name = (CFG.pdfPrefix || CFG.docTitle || '交底文档') + '-' + String(docNo || '').replace(/[^0-9A-Za-z\-]/g, '') + '.pdf';
    window.html2pdf().set({
      margin: [12, 10, 14, 10],
      filename: name,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: '.doc-row' }
    }).from(docEl).save().then(function () {
      resultTip.textContent = 'PDF 已生成下载，请查收（下载目录或浏览器下载栏）。';
      resultTip.className = 'result-tip no-print ok';
    }).catch(function () {
      resultTip.textContent = 'PDF 生成失败，请刷新重试，或先使用「复制文本」。';
      resultTip.className = 'result-tip no-print err';
    });
  });

  /* ---------------- 初始化 ---------------- */
  signData = lsGet(K_SIGN) || '';
  render();
  restore();
  refreshMetaLine();
  showStep(savedStep(), true);
  refreshProgress();
  if (GATE && gateMissing(meta).length) openGate(false);
})();