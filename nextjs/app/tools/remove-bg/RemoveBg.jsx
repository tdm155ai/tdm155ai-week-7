"use client";

// The background remover, in the browser: pick or drop a photo, cut the subject out on this computer (rembg) or
// with Nano Banana on OpenRouter, check the result over a checkerboard, put it on a new background, and save.
// The work happens in app/api/remove-bg/; files are listed, uploaded, and saved through app/api/photo/.
//
// To change first: the background colors in SWATCHES, and the method labels.
import { useEffect, useRef, useState } from "react";

const SWATCHES = ["#ffffff", "#111111", "#f2b544", "#2f6fdf", "#e44d3a", "#3fa66b"];

function money(dollars) {
  if (dollars === null || dollars === undefined) return "";
  return dollars < 0.01 ? `$${dollars.toFixed(4)}` : `$${dollars.toFixed(3)}`;
}

export default function RemoveBg({ initialPhoto }) {
  const canvas = useRef(null);
  const [status, setStatus] = useState(null); // what's installed, the models, the photos
  const [photo, setPhoto] = useState(initialPhoto);
  const [method, setMethod] = useState("rembg");
  const [rembgModel, setRembgModel] = useState("u2netp");
  const [model, setModel] = useState("");
  const [backdrop, setBackdrop] = useState("green");
  const [fuzz, setFuzz] = useState(12);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [background, setBackground] = useState({ type: "none" }); // none | color | photo
  const [saved, setSaved] = useState(null);

  async function refresh() {
    const data = await fetch("/api/remove-bg").then((response) => response.json());
    setStatus(data);
    setModel((current) => current || data.openrouter.models[0]?.id || "");
    setPhoto((current) => current || data.photos.find((item) => !/-(rembg|nano-banana|cutout)/.test(item.name))?.name || data.photos[0]?.name || "");
    return data;
  }
  useEffect(() => { refresh().catch(() => setError("Couldn't reach the app's server.")); }, []);

  async function upload(file) {
    if (!file) return;
    setBusy("Uploading…"); setError("");
    const data = await fetch(`/api/photo?name=${encodeURIComponent(file.name)}`, { method: "PUT", body: file }).then((response) => response.json());
    setBusy("");
    if (data.error) { setError(data.error); return; }
    await refresh();
    setPhoto(data.name); setResult(null);
  }

  async function remove(useMethod = method, source = photo) {
    setBusy(useMethod === "nano" ? "Asking Nano Banana… (this can take half a minute)" : useMethod === "flat" ? "Cutting out the flat background…" : "Running rembg… (the first run downloads its model)");
    setError(""); setSaved(null);
    try {
      const response = await fetch("/api/remove-bg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photo: source, method: useMethod, rembgModel, model, backdrop, fuzz }) });
      const data = await response.json();
      if (data.error) { setError(data.error + (data.command ? `\n\nCommand: ${data.command}` : "")); return; }
      // A flat cut-out finishes a Nano Banana result: keep that result's cost and command alongside.
      setResult((previous) => (useMethod === "flat" && previous ? { ...data, from: previous } : data));
      refresh();
    } catch {
      setError("The request stopped before it finished.");
    } finally {
      setBusy("");
    }
  }

  // Draw the cut-out over the chosen background, at the cut-out's full size.
  useEffect(() => {
    if (!result || !canvas.current) return;
    let cancelled = false;
    const load = (src) => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
    (async () => {
      const cutout = await load(`${result.src}?v=${result.size}`);
      const behind = background.type === "photo" ? await load(background.src) : null;
      if (cancelled) return;
      const c = canvas.current;
      c.width = cutout.naturalWidth; c.height = cutout.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      if (background.type === "color") { ctx.fillStyle = background.color; ctx.fillRect(0, 0, c.width, c.height); }
      if (behind) {
        // Cover: scale the background photo to fill the frame, centered, cropping what's outside.
        const scale = Math.max(c.width / behind.naturalWidth, c.height / behind.naturalHeight);
        const w = behind.naturalWidth * scale, h = behind.naturalHeight * scale;
        ctx.drawImage(behind, (c.width - w) / 2, (c.height - h) / 2, w, h);
      }
      ctx.drawImage(cutout, 0, 0);
    })().catch(() => setError("Couldn't draw the result."));
    return () => { cancelled = true; };
  }, [result, background]);

  async function saveComposite() {
    const label = background.type === "color" ? background.color.slice(1) : background.name.replace(/\.[^.]+$/, "");
    const blob = await new Promise((resolve) => canvas.current.toBlob(resolve, "image/png"));
    const name = `${result.name.replace(/\.png$/, "")}-on-${label}.png`;
    const data = await fetch(`/api/photo?name=${encodeURIComponent(name)}`, { method: "PUT", body: blob }).then((response) => response.json());
    if (data.error) setError(data.error); else { setSaved(data); refresh(); }
  }

  if (!status) return <p className="rb-note">{error || "Loading…"}</p>;
  const photos = status.photos;
  const chosen = status.openrouter.models.find((item) => item.id === model);

  return (
    <div className="rb">
      <section className="rb-step">
        <h2>1. Choose a photo</h2>
        <div className="rb-photos">
          {photos.map((item) => (
            <button key={item.name} className="rb-thumb" aria-pressed={item.name === photo} onClick={() => { setPhoto(item.name); setResult(null); }} title={item.name}>
              <img src={item.src} alt="" loading="lazy" /><span>{item.name}</span>
            </button>
          ))}
          <label className="rb-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); upload(event.dataTransfer.files[0]); }}>
            <span>Drop a photo here, or choose one</span>
            <input type="file" accept="image/*,.heic,.heif" onChange={(event) => upload(event.target.files[0])} />
          </label>
        </div>
      </section>

      <section className="rb-step">
        <h2>2. Remove the background</h2>
        <div className="rb-methods" role="radiogroup" aria-label="Method">
          <label className={method === "rembg" ? "rb-on" : ""}>
            <input type="radio" name="method" checked={method === "rembg"} onChange={() => setMethod("rembg")} />
            <strong>On this computer</strong>
            <span>rembg, a free local model. Nothing leaves your machine.</span>
          </label>
          <label className={method === "nano" ? "rb-on" : ""}>
            <input type="radio" name="method" checked={method === "nano"} onChange={() => setMethod("nano")} />
            <strong>Nano Banana</strong>
            <span>Google's image model on OpenRouter. Sends the photo; costs a few cents.</span>
          </label>
        </div>

        {method === "rembg" && (status.rembg.available ? (
          <label className="rb-field">Model
            <select value={rembgModel} onChange={(event) => setRembgModel(event.target.value)}>
              {status.rembg.models.map((name) => <option key={name}>{name}</option>)}
            </select>
            <span className="rb-note">u2netp is small and quick; the others are bigger downloads the first time and often cleaner.</span>
          </label>
        ) : (
          <div className="rb-warn">
            <p>rembg isn't installed on this computer. Install it once from a terminal, then reload this page:</p>
            <pre>{status.rembg.install}</pre>
          </div>
        ))}

        {method === "nano" && (status.openrouter.key ? (
          <div className="rb-row">
            <label className="rb-field">Model
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                {status.openrouter.models.map((item) => <option key={item.id} value={item.id}>{item.name} · ${item.perMillion} per million image tokens</option>)}
              </select>
            </label>
            <label className="rb-field">Backdrop it's asked for
              <select value={backdrop} onChange={(event) => setBackdrop(event.target.value)}>
                {status.openrouter.backdrops.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <p className="rb-note">Nano Banana can't return transparency, so it's asked for a flat {backdrop} background, which you then cut out here. Pick a color that isn't in your subject. {chosen && <code>{chosen.id}</code>}</p>
          </div>
        ) : (
          <div className="rb-warn">
            <p>No OpenRouter key yet. Copy <code>.env.example</code> at the repo root to <code>.env</code>, put your key after <code>OPENROUTER_API_KEY=</code>, and reload this page. The key stays on your computer; the page never sees it.</p>
          </div>
        ))}

        {!status.magick.available && <div className="rb-warn"><p>The background remover also needs ImageMagick:</p><pre>{status.magick.install}</pre></div>}

        <button className="rb-go" disabled={!photo || !!busy || (method === "rembg" && !status.rembg.available) || (method === "nano" && !status.openrouter.key)} onClick={() => remove()}>
          Remove the background{photo ? ` of ${photo}` : ""}
        </button>
        {busy && <p className="rb-note" role="status">{busy}</p>}
        {error && <p className="rb-error" role="alert">{error}</p>}
      </section>

      {result && (
        <section className="rb-step">
          <h2>3. Check it, and give it a new background</h2>
          <div className="rb-result">
            <div className="rb-stage"><canvas ref={canvas} /></div>
            <div className="rb-side">
              <p><a href={result.src} target="_blank" rel="noreferrer">{result.path}</a></p>
              <p className="rb-note">{result.width}×{result.height} · {result.opaque ? "no transparency" : `${Math.round(result.transparent * 100)}% transparent`}
                {result.from?.cost !== undefined && result.from?.cost !== null ? ` · Nano Banana cost ${money(result.from.cost)}` : result.cost !== null && result.cost !== undefined ? ` · cost ${money(result.cost)}` : ""}</p>
              {(result.from?.command || result.command) && <pre className="rb-command">{[result.from?.command, result.command].filter(Boolean).join("\n\n")}</pre>}

              {result.opaque && (
                <div className="rb-warn">
                  <p>This came back with a solid background, not a transparent one. If it's one flat color, cut it out:</p>
                  <label className="rb-field">How close a color counts as background: {fuzz}%
                    <input type="range" min="1" max="40" value={fuzz} onChange={(event) => setFuzz(Number(event.target.value))} />
                  </label>
                  <button className="rb-go" disabled={!!busy} onClick={() => remove("flat", result.name)}>Cut out the flat background</button>
                </div>
              )}

              <fieldset className="rb-backgrounds">
                <legend>New background</legend>
                <button aria-pressed={background.type === "none"} onClick={() => setBackground({ type: "none" })}>None</button>
                {SWATCHES.map((color) => (
                  <button key={color} className="rb-swatch" style={{ background: color }} aria-label={color} aria-pressed={background.type === "color" && background.color === color} onClick={() => setBackground({ type: "color", color })} />
                ))}
                <input type="color" aria-label="Any color" value={background.type === "color" ? background.color : "#888888"} onChange={(event) => setBackground({ type: "color", color: event.target.value })} />
                <select aria-label="A photo as the background" value={background.type === "photo" ? background.name : ""} onChange={(event) => {
                  const item = photos.find((p) => p.name === event.target.value);
                  setBackground(item ? { type: "photo", name: item.name, src: item.src } : { type: "none" });
                }}>
                  <option value="">A photo…</option>
                  {photos.filter((item) => item.name !== result.name).map((item) => <option key={item.name}>{item.name}</option>)}
                </select>
              </fieldset>
              <button className="rb-go" disabled={background.type === "none"} onClick={saveComposite}>Save with this background</button>
              {saved && <p className="rb-note">Saved <a href={saved.src} target="_blank" rel="noreferrer">{saved.path}</a></p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
