/* =========================================================
   360° 全景查看器（等距柱状投影 / equirectangular）
   基于 Three.js（js/lib/three.min.js），无其他依赖。
   用法：window.PanoViewer.open({
            title, date,
            province, city,        // 安装省份 / 安装城市
            brand, series,         // 浴室品牌 / 浴室系列
            price, priceNote,      // 含安装人民币价格 / 说明
            desc, tags,            // 说明 / 标签
            image                  // 360 全景图路径
          })
   交互：拖拽 = 第一人称环顾；滚轮/双指 = 缩放；按钮 = 自动旋转/重置/全屏
   ========================================================= */
window.PanoViewer = (function () {
  'use strict';

  var THREE = window.THREE;

  var root, stage, canvasWrap, toolbar, infoEl;
  var spinner, hint, errEl;
  var renderer, scene, camera, mesh, texture;
  var rafId = 0, lastT = 0;
  var yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
  var vYaw = 0, vPitch = 0;
  var fov = 75, targetFov = 75;
  var autoRotate = true, idleT = 0;
  var dragging = false, pointers = {}, pinchDist = 0, pinchFov = 75;
  var opened = false, disposed = true, loaded = false, interacted = false;

  // ---------- DOM ----------
  function build() {
    root = document.createElement('div');
    root.className = 'pano-modal';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', '360 度全景查看');
    root.innerHTML =
      '<div class="pano-backdrop"></div>' +
      '<div class="pano-card">' +
        '<div class="pano-stage" id="panoStage">' +
          '<div class="pano-spinner"><span></span><i>全景图加载中…</i></div>' +
          '<div class="pano-error" style="display:none"></div>' +
          '<div class="pano-hint">按住拖拽旋转视角 · 滚轮 / 双指缩放</div>' +
          '<div class="pano-toolbar">' +
            '<button type="button" class="pano-btn" data-act="rotate" title="自动旋转">自动旋转</button>' +
            '<button type="button" class="pano-btn" data-act="reset" title="重置视角">重置</button>' +
            '<button type="button" class="pano-btn" data-act="fullscreen" title="全屏">全屏</button>' +
            '<button type="button" class="pano-btn pano-close" data-act="close" title="关闭">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="pano-info"></div>' +
      '</div>';
    document.body.appendChild(root);
    stage = root.querySelector('.pano-stage');
    canvasWrap = stage;
    infoEl = root.querySelector('.pano-info');
    spinner = root.querySelector('.pano-spinner');
    hint = root.querySelector('.pano-hint');
    errEl = root.querySelector('.pano-error');

    root.querySelector('.pano-backdrop').addEventListener('click', close);
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    Array.prototype.forEach.call(root.querySelectorAll('.pano-btn'), function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); onAction(b.getAttribute('data-act')); });
    });
    document.addEventListener('fullscreenchange', function () {
      var btn = root.querySelector('[data-act="fullscreen"]');
      if (btn) btn.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
    });
  }

  function onAction(act) {
    if (act === 'close') { close(); return; }
    if (!opened || disposed) return;
    if (act === 'rotate') {
      autoRotate = !autoRotate;
      syncRotateBtn();
      idleT = 0;
    } else if (act === 'reset') {
      targetYaw = 0; targetPitch = 0; vYaw = 0; vPitch = 0;
      targetFov = 75; fov = 75;
      if (camera) { camera.fov = fov; camera.updateProjectionMatrix(); }
    } else if (act === 'fullscreen') {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen();
    }
  }

  // ---------- 信息面板 ----------
  function renderInfo(cfg) {
    var tags = (cfg.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    infoEl.innerHTML =
      '<div class="pano-title">' + esc(cfg.title || '') +
        (cfg.date ? '<span class="pano-date">' + esc(cfg.date) + ' 年安装</span>' : '') +
      '</div>' +
      '<div class="pano-fields">' +
        '<div class="pano-field"><span>安装省份</span><b>' + esc(cfg.province || '—') + '</b></div>' +
        '<div class="pano-field"><span>安装城市</span><b>' + esc(cfg.city || '—') + '</b></div>' +
        '<div class="pano-field"><span>浴室品牌</span><b>' + esc(cfg.brand || '—') + '</b></div>' +
        '<div class="pano-field"><span>浴室系列</span><b>' + esc(cfg.series || '—') + '</b></div>' +
        '<div class="pano-field pano-price"><span>含安装人民币价格</span><b>' + esc(cfg.price || '—') + '</b></div>' +
      '</div>' +
      (cfg.priceNote ? '<div class="pano-price-note">' + esc(cfg.priceNote) + '</div>' : '') +
      (cfg.desc ? '<p class="pano-desc">' + esc(cfg.desc) + '</p>' : '') +
      (tags ? '<div class="pano-tags">' + tags + '</div>' : '');
  }

  // ---------- Three.js ----------
  function startThree(cfg) {
    if (!THREE) {
      showErr('360 查看器组件（Three.js）未加载，请检查网络后刷新。');
      return;
    }
    var dom;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      showErr('当前浏览器不支持 WebGL，无法打开 360° 全景。');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    dom = renderer.domElement;
    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.display = 'block';
    dom.setAttribute('aria-label', '360 度全景视图，可拖拽旋转');
    stage.appendChild(dom);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(fov, 1, 1, 1100);
    camera.rotation.order = 'YXZ';

    var geo = new THREE.SphereGeometry(500, 60, 40);
    var mat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    loaded = false;
    texture = new THREE.TextureLoader().load(
      cfg.image,
      function (tex) {
        loaded = true;
        mat.map = tex;
        mat.needsUpdate = true;
        hideSpinner();
        if (!interacted && hint) hint.style.opacity = '1';
      },
      undefined,
      function () {
        hideSpinner();
        showErr('360 全景图加载失败：' + esc(cfg.image) + '<br>请确认图片已上传到正确位置。');
      }
    );
    bindEvents();
    resize();
    if (window.ResizeObserver) {
      new ResizeObserver(function () { if (opened && !disposed) resize(); }).observe(stage);
    }
    rafId = requestAnimationFrame(tick);
  }

  function bindEvents() {
    var dom = renderer.domElement;
    dom.style.cursor = 'grab';
    dom.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      try { dom.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件等场景下无活动指针 */ }
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(pointers).length === 1) {
        dragging = true; vYaw = 0; vPitch = 0; autoRotate = false;
        idleT = 0;
        dom.style.cursor = 'grabbing';
      } else if (Object.keys(pointers).length === 2) {
        var pts = Object.keys(pointers).map(function (k) { return pointers[k]; });
        pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchFov = targetFov;
      }
      markInteract();
    });
    dom.addEventListener('pointermove', function (e) {
      if (!(e.pointerId in pointers)) return;
      var prev = pointers[e.pointerId];
      var dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var n = Object.keys(pointers).length;
      if (n === 1 && dragging) {
        targetYaw -= dx * 0.0035;
        targetPitch -= dy * 0.0035;
        targetPitch = clamp(targetPitch, -1.45, 1.45);
        vYaw = -dx * 0.0035 * 8; vPitch = -dy * 0.0035 * 8;
        idleT = 0;
      } else if (n === 2) {
        var pts = Object.keys(pointers).map(function (k) { return pointers[k]; });
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (pinchDist > 0) targetFov = clamp(pinchFov * pinchDist / d, 25, 100);
      }
    });
    function endPointer(e) {
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length === 0) {
        dragging = false;
        if (renderer && renderer.domElement) renderer.domElement.style.cursor = 'grab';
      }
    }
    dom.addEventListener('pointerup', endPointer);
    dom.addEventListener('pointercancel', endPointer);
    dom.addEventListener('wheel', function (e) {
      e.preventDefault();
      targetFov = clamp(targetFov + e.deltaY * 0.05, 25, 100);
      idleT = 0;
      markInteract();
    }, { passive: false });
    dom.addEventListener('dblclick', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen();
    });
  }

  function markInteract() {
    if (!interacted) {
      interacted = true;
      if (hint) hint.style.opacity = '0';
    }
    syncRotateBtn();
  }

  function syncRotateBtn() {
    if (!root) return;
    var btn = root.querySelector('[data-act="rotate"]');
    if (!btn) return;
    btn.textContent = autoRotate ? '自动旋转' : '自动旋转：关';
    btn.classList.toggle('is-off', !autoRotate);
  }

  function tick(t) {
    if (!opened || disposed) return;
    rafId = requestAnimationFrame(tick);
    if (!lastT) lastT = t;
    var dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    var n = Object.keys(pointers).length;

    idleT += dt;
    if (autoRotate && n === 0 && !dragging && idleT > 2.5) targetYaw += dt * 0.6;
    if (n === 0 && !dragging) {
      targetYaw += vYaw * dt; vYaw *= Math.pow(0.02, dt);
      targetPitch += vPitch * dt; vPitch *= Math.pow(0.02, dt);
    }
    targetPitch = clamp(targetPitch, -1.45, 1.45);
    yaw += (targetYaw - yaw) * Math.min(1, dt * 12);
    pitch += (targetPitch - pitch) * Math.min(1, dt * 12);
    fov += (targetFov - fov) * Math.min(1, dt * 8);

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer || !camera || !stage) return;
    var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---------- 状态 ----------
  function showSpinner() { if (spinner) spinner.style.display = ''; }
  function hideSpinner() { if (spinner) spinner.style.display = 'none'; }
  function showErr(msg) {
    if (!errEl) return;
    errEl.innerHTML = '<p>' + msg + '</p><button type="button" class="pano-btn">关闭</button>';
    errEl.style.display = '';
    var btn = errEl.querySelector('button');
    if (btn) btn.addEventListener('click', close);
  }
  function hideErr() { if (errEl) { errEl.style.display = 'none'; errEl.innerHTML = ''; } }

  function disposeThree() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (renderer) {
      renderer.dispose();
      var dom = renderer.domElement;
      if (dom && dom.parentNode) dom.parentNode.removeChild(dom);
      renderer = null;
    }
    if (mesh) {
      mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      mesh = null;
    }
    if (texture) { texture.dispose(); texture = null; }
    scene = null; camera = null;
    pointers = {};
    dragging = false;
    disposed = true;
  }

  // ---------- 对外 ----------
  function open(cfg) {
    if (!root) build();
    if (opened && !disposed) close();
    cfg = cfg || {};
    opened = true;
    disposed = false;
    loaded = false;
    interacted = false;
    autoRotate = true;
    idleT = 0;
    yaw = 0; pitch = 0; targetYaw = 0; targetPitch = 0; vYaw = 0; vPitch = 0;
    fov = 75; targetFov = 75;
    lastT = 0;
    hideErr();
    showSpinner();
    if (hint) hint.style.opacity = '1';
    renderInfo(cfg);
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    var btn = root.querySelector('[data-act="rotate"]');
    if (btn) { btn.textContent = '自动旋转'; btn.classList.remove('is-off'); }
    startThree(cfg);
    if (stage) stage.focus();
  }

  function close() {
    if (!opened) return;
    opened = false;
    disposeThree();
    if (root) root.classList.remove('open');
    document.body.style.overflow = '';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  return { open: open, close: close };
})();
