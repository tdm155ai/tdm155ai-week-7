"use client";

// The photo editor, all in the browser: open a photo from _media/photos/ (or drop one in), crop it (free or a fixed
// ratio), rotate and flip, resize, adjust exposure, brightness, contrast, saturation, and warmth, or pick a preset.
// Saving makes a new file in _media/photos/ (through PUT /api/photo); the original is never changed.
//
// The pipeline, in render(): turn and flip -> crop -> resize -> adjust the pixels (adjust()).
// To change first: PRESETS, the slider ranges in SLIDERS, and the formulas in adjust().
import { useEffect, useRef, useState } from "react";

const NEUTRAL = { exposure: 0, brightness: 0, contrast: 0, saturation: 0, warmth: 0 };

const SLIDERS = [
  ["exposure", "Exposure", -2, 2, 0.05, "stops"],
  ["brightness", "Brightness", -0.5, 0.5, 0.01, ""],
  ["contrast", "Contrast", -0.6, 1, 0.01, ""],
  ["saturation", "Saturation", -1, 1, 0.01, ""],
  ["warmth", "Warmth", -1, 1, 0.01, ""],
];

const PRESETS = {
  "None": NEUTRAL,
  "Bright": { ...NEUTRAL, exposure: 0.35, contrast: 0.08, saturation: 0.08 },
  "Punchy": { ...NEUTRAL, contrast: 0.35, saturation: 0.3 },
  "Warm": { ...NEUTRAL, warmth: 0.45, saturation: 0.08 },
  "Cool": { ...NEUTRAL, warmth: -0.45 },
  "Faded": { ...NEUTRAL, brightness: 0.06, contrast: -0.25, saturation: -0.3 },
  "Black & white": { ...NEUTRAL, contrast: 0.2, saturation: -1 },
};

const RATIOS = { Free: null, "1:1": 1, "4:5": 4 / 5, "16:9": 16 / 9, "9:16": 9 / 16 };

// Change the pixels of an ImageData in place. Each value is 0–255; the Uint8ClampedArray keeps results in range.
function adjust(imageData, s) {
  if (Object.keys(NEUTRAL).every((key) => !s[key])) return;
  const d = imageData.data;
  const gain = 2 ** s.exposure; // one stop doubles the light
  const lift = s.brightness * 255;
  const contrast = 1 + s.contrast;
  const saturation = 1 + s.saturation;
  const warm = s.warmth * 30; // more red, less blue
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] * gain + lift, g = d[i + 1] * gain + lift, b = d[i + 2] * gain + lift;
    r = (r - 128) * contrast + 128; g = (g - 128) * contrast + 128; b = (b - 128) * contrast + 128;
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = gray + (r - gray) * saturation; g = gray + (g - gray) * saturation; b = gray + (b - gray) * saturation;
    d[i] = r + warm; d[i + 1] = g; d[i + 2] = b - warm;
  }
}

// The photo's size once turned: a quarter turn swaps width and height.
function turnedSize(image, rotate) {
  return rotate % 180 ? [image.naturalHeight, image.naturalWidth] : [image.naturalWidth, image.naturalHeight];
}

// Draw the edited photo onto a new canvas. crop is { x, y, w, h } as fractions of the turned photo (or null for all
// of it); width is the output width in pixels (or 0 to keep the crop's own width).
function render(image, edit, crop, width) {
  const [tw, th] = turnedSize(image, edit.rotate);
  const box = crop || { x: 0, y: 0, w: 1, h: 1 };
  const cw = box.w * tw, ch = box.h * th;
  const outW = Math.max(1, Math.round(width || cw));
  const outH = Math.max(1, Math.round((ch * outW) / cw));
  const canvas = document.createElement("canvas");
  canvas.width = outW; canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.scale(outW / cw, outH / ch);
  ctx.translate(-box.x * tw, -box.y * th);
  ctx.translate(tw / 2, th / 2);
  ctx.rotate((edit.rotate * Math.PI) / 180);
  ctx.scale(edit.flipH ? -1 : 1, edit.flipV ? -1 : 1);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  const pixels = ctx.getImageData(0, 0, outW, outH);
  adjust(pixels, edit);
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

const PREVIEW = 1100; // the preview's longest side, in pixels

export default function PhotoEditor({ initialPhoto }) {
  const preview = useRef(null);
  const frame = useRef(null);
  const drag = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [name, setName] = useState(initialPhoto);
  const [image, setImage] = useState(null);
  const [edit, setEdit] = useState({ rotate: 0, flipH: false, flipV: false, ...NEUTRAL });
  const [crop, setCrop] = useState(null);
  const [ratio, setRatio] = useState("Free");
  const [width, setWidth] = useState(0);
  const [before, setBefore] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const data = await fetch("/api/photo").then((response) => response.json());
    setPhotos(data.photos);
    setName((current) => current || data.photos[0]?.name || "");
  }
  useEffect(() => { refresh().catch(() => setMessage("Couldn't reach the app's server.")); }, []);

  // Open a photo: load it, and start from no edits.
  useEffect(() => {
    if (!name) return;
    window.history.replaceState(null, "", `?photo=${encodeURIComponent(name)}`);
    const next = new Image();
    next.onload = () => { setImage(next); setEdit({ rotate: 0, flipH: false, flipV: false, ...NEUTRAL }); setCrop(null); setRatio("Free"); setWidth(0); setBefore(false); };
    next.onerror = () => setMessage(`The browser couldn't open ${name}.`);
    next.src = `/media/photos/${encodeURIComponent(name)}`;
  }, [name]);

  // Redraw the preview: the whole turned photo with the adjustments (the crop is drawn on top as a box).
  useEffect(() => {
    if (!image || !preview.current) return;
    const [tw, th] = before ? [image.naturalWidth, image.naturalHeight] : turnedSize(image, edit.rotate);
    const scale = Math.min(1, PREVIEW / Math.max(tw, th));
    const drawn = before ? render(image, { rotate: 0, flipH: false, flipV: false, ...NEUTRAL }, null, tw * scale) : render(image, edit, null, tw * scale);
    const c = preview.current;
    c.width = drawn.width; c.height = drawn.height;
    c.getContext("2d").drawImage(drawn, 0, 0);
  }, [image, edit, before]);

  const set = (change) => setEdit((current) => ({ ...current, ...change }));
  // Turning or flipping changes what the crop box covers, so it starts over.
  const turn = (change) => { set(change); setCrop(null); };

  function chooseRatio(label) {
    setRatio(label);
    if (!RATIOS[label] || !image) { setCrop(null); return; }
    // The largest centered box of that ratio.
    const [tw, th] = turnedSize(image, edit.rotate);
    let w = 1, h = (tw / RATIOS[label]) / th;
    if (h > 1) { h = 1; w = (th * RATIOS[label]) / tw; }
    setCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  }

  // Drag on the photo to draw a crop box; drag inside the box to move it.
  function point(event) {
    const rect = frame.current.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) };
  }
  function onPointerDown(event) {
    if (before || !image) return;
    const p = point(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    const inside = crop && p.x > crop.x && p.x < crop.x + crop.w && p.y > crop.y && p.y < crop.y + crop.h;
    drag.current = inside ? { mode: "move", start: p, box: crop } : { mode: "draw", start: p };
  }
  function onPointerMove(event) {
    if (!drag.current) return;
    const p = point(event);
    const { mode, start, box } = drag.current;
    if (mode === "move") {
      setCrop({ ...box, x: Math.min(1 - box.w, Math.max(0, box.x + p.x - start.x)), y: Math.min(1 - box.h, Math.max(0, box.y + p.y - start.y)) });
      return;
    }
    let w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y);
    const fixed = RATIOS[ratio];
    if (fixed) {
      const [tw, th] = turnedSize(image, edit.rotate);
      h = (w * tw) / fixed / th; // keep the box at the ratio, in pixels
      const room = p.y >= start.y ? 1 - start.y : start.y;
      if (h > room) { h = room; w = (h * th * fixed) / tw; }
    }
    setCrop({ x: p.x >= start.x ? start.x : start.x - w, y: p.y >= start.y ? start.y : start.y - h, w, h });
  }
  function onPointerUp() {
    if (drag.current?.mode === "draw" && crop && (crop.w < 0.02 || crop.h < 0.02)) setCrop(null);
    drag.current = null;
  }

  async function upload(file) {
    if (!file) return;
    setBusy(true); setMessage("Uploading…");
    const data = await fetch(`/api/photo?name=${encodeURIComponent(file.name)}`, { method: "PUT", body: file }).then((response) => response.json());
    setBusy(false);
    if (data.error) { setMessage(data.error); return; }
    setMessage(data.converted || "");
    await refresh();
    setName(data.name);
  }

  async function save() {
    setBusy(true); setMessage("Saving…");
    const png = /\.(png|webp|gif)$/i.test(name);
    const canvas = render(image, edit, crop, width);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, png ? "image/png" : "image/jpeg", 0.92));
    const newName = `${name.replace(/\.[^.]+$/, "")}-edit.${png ? "png" : "jpg"}`;
    const data = await fetch(`/api/photo?name=${encodeURIComponent(newName)}`, { method: "PUT", body: blob }).then((response) => response.json());
    setBusy(false);
    if (data.error) { setMessage(data.error); return; }
    setMessage(`Saved ${data.path} (${canvas.width}×${canvas.height}).`);
    refresh();
  }

  const [tw, th] = image ? turnedSize(image, edit.rotate) : [0, 0];
  const cropW = Math.round((crop?.w ?? 1) * tw), cropH = Math.round((crop?.h ?? 1) * th);
  const outW = width || cropW, outH = cropW ? Math.round((cropH * outW) / cropW) : 0;

  return (
    <div className="pe">
      <div className="pe-open">
        <label>Photo
          <select value={name} onChange={(event) => setName(event.target.value)} disabled={!photos.length}>
            {!photos.length && <option value="">No photos in _media/photos/ yet</option>}
            {photos.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
        </label>
        <label className="pe-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); upload(event.dataTransfer.files[0]); }}>
          <span>Drop a photo here, or choose one (iPhone HEIC is converted to JPEG)</span>
          <input type="file" accept="image/*,.heic,.heif" onChange={(event) => upload(event.target.files[0])} />
        </label>
      </div>

      {message && <p className="pe-note" role="status">{message}</p>}

      {image && (
        <div className="pe-work">
          <div className="pe-stage">
            <div className="pe-frame" ref={frame} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
              <canvas ref={preview} />
              {crop && !before && <div className="pe-crop" style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }} />}
            </div>
            <p className="pe-note">{before ? "Before: the original." : crop ? "Drag inside the box to move it, or outside to draw a new one." : "Drag across the photo to crop."}</p>
          </div>

          <div className="pe-panel">
            <section>
              <h2>Crop</h2>
              <div className="pe-buttons">
                {Object.keys(RATIOS).map((label) => <button key={label} aria-pressed={ratio === label} onClick={() => chooseRatio(label)}>{label}</button>)}
                <button onClick={() => { setCrop(null); setRatio("Free"); }} disabled={!crop}>Clear</button>
              </div>
            </section>
            <section>
              <h2>Turn</h2>
              <div className="pe-buttons">
                <button onClick={() => turn({ rotate: (edit.rotate + 270) % 360 })}>⟲ Left</button>
                <button onClick={() => turn({ rotate: (edit.rotate + 90) % 360 })}>⟳ Right</button>
                <button aria-pressed={edit.flipH} onClick={() => turn({ flipH: !edit.flipH })}>Flip ↔</button>
                <button aria-pressed={edit.flipV} onClick={() => turn({ flipV: !edit.flipV })}>Flip ↕</button>
              </div>
            </section>
            <section>
              <h2>Adjust</h2>
              <div className="pe-buttons">
                {Object.entries(PRESETS).map(([label, values]) => <button key={label} onClick={() => set(values)}>{label}</button>)}
              </div>
              {SLIDERS.map(([key, label, min, max, step, unit]) => (
                <label key={key} className="pe-slider">
                  <span>{label} <output>{edit[key] > 0 ? "+" : ""}{edit[key].toFixed(2)} {unit}</output></span>
                  <input type="range" min={min} max={max} step={step} value={edit[key]} onChange={(event) => set({ [key]: Number(event.target.value) })} onDoubleClick={() => set({ [key]: 0 })} />
                </label>
              ))}
            </section>
            <section>
              <h2>Size</h2>
              <label className="pe-size">Width
                <input type="number" min="1" max={cropW} placeholder={String(cropW)} value={width || ""} onChange={(event) => setWidth(Math.min(cropW, Number(event.target.value) || 0))} />
                <span>× {outH} px</span>
              </label>
            </section>
            <div className="pe-buttons pe-actions">
              <button aria-pressed={before} onClick={() => setBefore(!before)}>{before ? "Show after" : "Show before"}</button>
              <button className="pe-go" onClick={save} disabled={busy}>Save as a new file</button>
            </div>
            <p className="pe-note">Saves {outW}×{outH} as <code>{name.replace(/\.[^.]+$/, "")}-edit</code> in <code>_media/photos/</code>.</p>
          </div>
        </div>
      )}
    </div>
  );
}
