/**
 * ImageCropper - Canvas-based image crop & rotate editor
 * Usage: window.ImageCropper.open({ file, aspect, onConfirm, onCancel })
 */
window.ImageCropper = (() => {
  let overlay, canvas, ctx;
  let img = null, imgW = 0, imgH = 0;
  let rotation = 0;
  let crop = { x: 0, y: 0, w: 0, h: 0 };
  let canvasW = 0, canvasH = 0;
  let scale = 1;
  let aspectLock = null; // null = free, 1 = square
  let onConfirmCb = null, onCancelCb = null;

  // Drag state
  let dragging = false;
  let dragType = null; // 'move', 'nw','ne','sw','se','n','s','e','w'
  let dragStartX = 0, dragStartY = 0;
  let cropStart = { x: 0, y: 0, w: 0, h: 0 };

  const MIN_CROP = 30;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'cropper-overlay';
    overlay.innerHTML = `
      <div class="cropper-modal">
        <div class="cropper-canvas-wrap">
          <canvas id="cropper-canvas"></canvas>
        </div>
        <div class="cropper-toolbar">
          <button class="cropper-btn" data-action="rotate-left" title="左旋90°">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button class="cropper-btn" data-action="rotate-right" title="右旋90°">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
          </button>
          <div class="cropper-spacer"></div>
          <button class="cropper-btn cropper-btn-cancel" data-action="cancel">取消</button>
          <button class="cropper-btn cropper-btn-apply" data-action="apply">确定裁剪</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    canvas = document.getElementById('cropper-canvas');
    ctx = canvas.getContext('2d');

    // Events
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onMouseUp);

    overlay.querySelector('.cropper-toolbar').addEventListener('click', onToolbarClick);
  }

  function open(opts) {
    if (!overlay) createOverlay();
    aspectLock = opts.aspect || null; // 1 for square, null for free
    onConfirmCb = opts.onConfirm;
    onCancelCb = opts.onCancel;
    rotation = 0;

    const file = opts.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function loadImage(src) {
    img = new Image();
    img.onload = () => {
      overlay.style.display = 'flex';
      fitCanvas();
      resetCrop();
      draw();
    };
    img.src = src;
  }

  function fitCanvas() {
    const wrap = overlay.querySelector('.cropper-canvas-wrap');
    const maxW = wrap.clientWidth - 20;
    const maxH = wrap.clientHeight - 20;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    scale = Math.min(maxW / iw, maxH / ih, 1);
    canvasW = Math.round(iw * scale);
    canvasH = Math.round(ih * scale);
    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
  }

  function resetCrop() {
    const margin = 20;
    if (aspectLock === 1) {
      const size = Math.min(canvasW, canvasH) - margin * 2;
      crop = {
        x: (canvasW - size) / 2,
        y: (canvasH - size) / 2,
        w: size,
        h: size,
      };
    } else {
      crop = {
        x: margin,
        y: margin,
        w: canvasW - margin * 2,
        h: canvasH - margin * 2,
      };
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvasW, canvasH);

    ctx.save();
    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
    ctx.restore();

    // Dark overlay outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvasW, crop.y);
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, canvasW - crop.x - crop.w, crop.h);
    ctx.fillRect(0, crop.y + crop.h, canvasW, canvasH - crop.y - crop.h);

    // Crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const gx = crop.x + (crop.w / 3) * i;
      const gy = crop.y + (crop.h / 3) * i;
      ctx.beginPath();
      ctx.moveTo(gx, crop.y);
      ctx.lineTo(gx, crop.y + crop.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x, gy);
      ctx.lineTo(crop.x + crop.w, gy);
      ctx.stroke();
    }

    // Corner handles
    const hs = 10;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    [[crop.x, crop.y], [crop.x + crop.w, crop.y],
     [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h]].forEach(([hx, hy]) => {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    });
    ctx.shadowBlur = 0;
  }

  function getHitType(mx, my) {
    const hs = 14;
    const { x, y, w, h } = crop;
    if (mx >= x - hs && mx <= x + hs && my >= y - hs && my <= y + hs) return 'nw';
    if (mx >= x + w - hs && mx <= x + w + hs && my >= y - hs && my <= y + hs) return 'ne';
    if (mx >= x - hs && mx <= x + hs && my >= y + h - hs && my <= y + h + hs) return 'sw';
    if (mx >= x + w - hs && mx <= x + w + hs && my >= y + h - hs && my <= y + h + hs) return 'se';
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) return 'move';
    return null;
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onMouseDown(e) {
    const pos = getMousePos(e);
    dragType = getHitType(pos.x, pos.y);
    if (!dragType) return;
    dragging = true;
    dragStartX = pos.x;
    dragStartY = pos.y;
    cropStart = { ...crop };
    e.preventDefault();
  }

  function onMouseMove(e) {
    const pos = getMousePos(e);
    if (!dragging) {
      const hit = getHitType(pos.x, pos.y);
      canvas.style.cursor = hit === 'move' ? 'move' :
        (hit === 'nw' || hit === 'se') ? 'nwse-resize' :
        (hit === 'ne' || hit === 'sw') ? 'nesw-resize' : 'default';
      return;
    }

    const dx = pos.x - dragStartX;
    const dy = pos.y - dragStartY;

    if (dragType === 'move') {
      crop.x = clamp(cropStart.x + dx, 0, canvasW - crop.w);
      crop.y = clamp(cropStart.y + dy, 0, canvasH - crop.h);
    } else {
      resizeCrop(dx, dy);
    }
    draw();
  }

  function onMouseUp() {
    dragging = false;
    dragType = null;
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    onMouseDown({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault() });
  }

  function onTouchMove(e) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    onMouseMove({ clientX: t.clientX, clientY: t.clientY });
    e.preventDefault();
  }

  function resizeCrop(dx, dy) {
    let { x, y, w, h } = cropStart;

    if (dragType.includes('w')) {
      x = clamp(cropStart.x + dx, 0, cropStart.x + cropStart.w - MIN_CROP);
      w = cropStart.x + cropStart.w - x;
    }
    if (dragType.includes('e')) {
      w = clamp(cropStart.w + dx, MIN_CROP, canvasW - cropStart.x);
    }
    if (dragType.includes('n')) {
      y = clamp(cropStart.y + dy, 0, cropStart.y + cropStart.h - MIN_CROP);
      h = cropStart.y + cropStart.h - y;
    }
    if (dragType.includes('s')) {
      h = clamp(cropStart.h + dy, MIN_CROP, canvasH - cropStart.y);
    }

    if (aspectLock) {
      if (dragType === 'move') return;
      const side = Math.min(w, h);
      if (dragType.includes('n')) { y = cropStart.y + cropStart.h - side; h = side; }
      if (dragType.includes('s')) { h = side; }
      if (dragType.includes('w')) { x = cropStart.x + cropStart.w - side; w = side; }
      if (dragType.includes('e')) { w = side; }
      // Corner: use average
      if (['nw', 'ne', 'sw', 'se'].includes(dragType)) {
        const avg = (w + h) / 2;
        w = h = avg;
        if (dragType.includes('w')) x = cropStart.x + cropStart.w - w;
        if (dragType.includes('n')) y = cropStart.y + cropStart.h - h;
      }
    }

    crop = {
      x: clamp(x, 0, canvasW - MIN_CROP),
      y: clamp(y, 0, canvasH - MIN_CROP),
      w: clamp(w, MIN_CROP, canvasW - crop.x),
      h: clamp(h, MIN_CROP, canvasH - crop.y),
    };
  }

  function onToolbarClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'rotate-left') {
      rotation = (rotation - 90 + 360) % 360;
      [canvasW, canvasH] = [canvasH, canvasW];
      canvas.width = canvasW;
      canvas.height = canvasH;
      canvas.style.width = canvasW + 'px';
      canvas.style.height = canvasH + 'px';
      resetCrop();
      draw();
    } else if (action === 'rotate-right') {
      rotation = (rotation + 90) % 360;
      [canvasW, canvasH] = [canvasH, canvasW];
      canvas.width = canvasW;
      canvas.height = canvasH;
      canvas.style.width = canvasW + 'px';
      canvas.style.height = canvasH + 'px';
      resetCrop();
      draw();
    } else if (action === 'apply') {
      applyCrop();
    } else if (action === 'cancel') {
      close();
      if (onCancelCb) onCancelCb();
    }
  }

  function applyCrop() {
    // Map crop from canvas coords to original image coords
    const sx = crop.x / scale;
    const sy = crop.y / scale;
    const sw = crop.w / scale;
    const sh = crop.h / scale;

    const outW = Math.round(sw);
    const outH = Math.round(sh);
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');

    if (rotation % 360 !== 0) {
      outCtx.translate(outW / 2, outH / 2);
      outCtx.rotate((rotation * Math.PI) / 180);
      outCtx.translate(-outW / 2, -outH / 2);
    }

    outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    const dataUrl = outCanvas.toDataURL('image/png');
    close();
    if (onConfirmCb) onConfirmCb(dataUrl);
  }

  function close() {
    overlay.style.display = 'none';
    img = null;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  return { open, close };
})();
