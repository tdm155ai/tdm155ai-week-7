"use client";

// The trimmer, in the browser: choose or drop a video, play and scrub it, mark segments, and export them as clips.
// It talks to three routes: GET/POST /api/trim (probe a source, export clips), PUT /api/trim/upload (add a source),
// and PUT /api/trim/segments (save the segment list beside the source, after every change).
//
// Keys (when you aren't typing in a box): Space play/pause · J back, K stop, L forward (press J or L again to go faster)
// · ← → one frame (Shift: one second) · I mark in · O mark out · Enter add the segment.
//
// To change first: the keys in onKey(), what a new segment is called in addSegment(), and the export modes in MODES.
import { useCallback, useEffect, useRef, useState } from "react";

const MODES = {
  fast: "Fast: copies the video as it is, in seconds and with no loss, but a clip may start at the keyframe before your in point.",
  exact: "Exact: re-encodes to H.264/AAC, so each clip starts on the frame you marked; slower.",
};

// 75.5 -> "1:15.500"
function clock(seconds) {
  if (!Number.isFinite(seconds)) return "–";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds - minutes * 60).toFixed(3).padStart(6, "0")}`;
}

const mediaUrl = (name) => `/media/sources/${encodeURIComponent(name)}`;
let nextId = 1;
const withIds = (segments) => segments.map((segment) => ({ ...segment, id: nextId++ }));

export default function Trimmer({ initialSources, initialSource }) {
  const video = useRef(null);
  const shuttle = useRef({ speed: 0, frame: 0 }); // J/L speed: negative is backwards, played by stepping
  const stopAt = useRef(null); // when previewing a segment, where to stop
  const loaded = useRef(false); // don't save the list back while it's still loading

  const [sources, setSources] = useState(initialSources);
  const [source, setSource] = useState(initialSource);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [segments, setSegments] = useState([]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [markIn, setMarkIn] = useState(null);
  const [markOut, setMarkOut] = useState(null);
  const [mode, setMode] = useState("fast");
  const [exports, setExports] = useState({});
  const [exporting, setExporting] = useState(false);
  const [upload, setUpload] = useState(null);
  const [dragging, setDragging] = useState(false);

  const duration = info?.duration || 0;
  const frame = 1 / (info?.fps || 30);

  // Load a source: probe it and bring back its saved segments.
  useEffect(() => {
    loaded.current = false;
    setInfo(null); setError(""); setSegments([]); setExports({}); setMarkIn(null); setMarkOut(null); setTime(0);
    if (!source) return;
    window.history.replaceState(null, "", `?source=${encodeURIComponent(source)}`);
    let cancelled = false;
    fetch(`/api/trim?source=${encodeURIComponent(source)}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) { setError(data.error); return; }
        setInfo(data.info);
        setSegments(withIds(data.segments));
        loaded.current = true;
      })
      .catch(() => !cancelled && setError("Couldn't reach the app's server."));
    return () => { cancelled = true; };
  }, [source]);

  // Save the segment list after each change (half a second after the last one).
  useEffect(() => {
    if (!loaded.current || !source) return;
    const timer = setTimeout(() => {
      fetch("/api/trim/segments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, segments }) })
        .catch(() => setError("The segment list didn't save."));
    }, 500);
    return () => clearTimeout(timer);
  }, [segments, source]);

  const seek = useCallback((seconds) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration || v.duration || 0, seconds));
    setTime(v.currentTime);
  }, [duration]);

  const stopShuttle = useCallback(() => {
    cancelAnimationFrame(shuttle.current.frame);
    shuttle.current.speed = 0;
    if (video.current) video.current.playbackRate = 1;
  }, []);

  const pause = useCallback(() => { stopShuttle(); stopAt.current = null; video.current?.pause(); }, [stopShuttle]);
  const play = useCallback(() => { stopShuttle(); video.current?.play(); }, [stopShuttle]);

  // Browsers can't play backwards, so J steps the playhead back on every animation frame.
  const backwards = useCallback((speed) => {
    const v = video.current;
    if (!v) return;
    v.pause();
    cancelAnimationFrame(shuttle.current.frame);
    shuttle.current.speed = -speed;
    let last = performance.now();
    const step = (now) => {
      v.currentTime = Math.max(0, v.currentTime - ((now - last) / 1000) * speed);
      last = now;
      setTime(v.currentTime);
      if (v.currentTime > 0 && shuttle.current.speed < 0) shuttle.current.frame = requestAnimationFrame(step);
    };
    shuttle.current.frame = requestAnimationFrame(step);
  }, []);

  const addSegment = useCallback(() => {
    const start = markIn ?? 0;
    const end = markOut ?? video.current?.currentTime ?? 0;
    if (!(end > start)) { setError("Mark an in point (I) before an out point (O) first."); return; }
    setError("");
    setSegments((list) => [...list, { id: nextId++, name: `segment ${list.length + 1}`, in: start, out: end }]);
    setMarkIn(null); setMarkOut(null);
  }, [markIn, markOut]);

  const updateSegment = (id, change) => setSegments((list) => list.map((segment) => (segment.id === id ? { ...segment, ...change } : segment)));
  const removeSegment = (id) => setSegments((list) => list.filter((segment) => segment.id !== id));

  // Play one segment and stop at its out point. The playhead is checked every animation frame, since the video's own
  // timeupdate event only fires about four times a second and would overshoot.
  const preview = (segment) => {
    const v = video.current;
    if (!v) return;
    stopShuttle();
    seek(segment.in);
    stopAt.current = segment.out;
    v.play();
    const check = () => {
      if (stopAt.current === null) return;
      if (v.currentTime >= stopAt.current) { v.pause(); v.currentTime = stopAt.current; stopAt.current = null; setTime(v.currentTime); return; }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  };

  // The keyboard. Ignored while you're typing in a box.
  useEffect(() => {
    function onKey(event) {
      if (event.target.closest?.("input, textarea, select") || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.closest?.("button") && (event.key === " " || event.key === "Enter")) return; // a focused button's own keys
      const v = video.current;
      if (!v || !info) return;
      const key = event.key.toLowerCase();
      if (key === " ") { if (v.paused && shuttle.current.speed >= 0) play(); else pause(); }
      else if (key === "k") pause();
      else if (key === "l") {
        stopAt.current = null;
        const speed = shuttle.current.speed > 0 ? Math.min(shuttle.current.speed * 2, 8) : 1;
        stopShuttle(); shuttle.current.speed = speed; v.playbackRate = speed; v.play();
      } else if (key === "j") {
        stopAt.current = null;
        backwards(shuttle.current.speed < 0 ? Math.min(-shuttle.current.speed * 2, 8) : 1);
      } else if (key === "arrowleft" || key === "arrowright") { pause(); seek(v.currentTime + (key === "arrowleft" ? -1 : 1) * (event.shiftKey ? 1 : frame)); }
      else if (key === "i") setMarkIn(v.currentTime);
      else if (key === "o") setMarkOut(v.currentTime);
      else if (key === "enter") addSegment();
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [info, frame, play, pause, seek, backwards, stopShuttle, addSegment]);

  function onTimeUpdate() {
    const v = video.current;
    setTime(v.currentTime);
    if (stopAt.current !== null && v.currentTime >= stopAt.current) { v.pause(); stopAt.current = null; }
  }

  // Upload a dropped or chosen file into _media/sources/. XMLHttpRequest, not fetch, because it reports progress.
  function uploadFile(file) {
    if (!file) return;
    setError("");
    const request = new XMLHttpRequest();
    request.open("PUT", `/api/trim/upload?name=${encodeURIComponent(file.name)}`);
    request.upload.onprogress = (event) => event.lengthComputable && setUpload({ name: file.name, progress: event.loaded / event.total });
    request.onload = async () => {
      setUpload(null);
      const data = JSON.parse(request.responseText || "{}");
      if (data.error) { setError(data.error); return; }
      const list = await fetch("/api/trim").then((response) => response.json());
      setSources(list.sources.map((item) => item.name));
      setSource(data.name);
    };
    request.onerror = () => { setUpload(null); setError("The upload didn't finish."); };
    setUpload({ name: file.name, progress: 0 });
    request.send(file);
  }

  // Export every segment. The server answers with one JSON line per update, read here as they arrive.
  async function exportClips() {
    pause();
    setExporting(true); setError("");
    setExports(Object.fromEntries(segments.map((segment, index) => [index, { status: "waiting", progress: 0 }])));
    try {
      const response = await fetch("/api/trim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, mode, segments }) });
      if (!response.ok) { setError((await response.json()).error || "The export didn't start."); return; }
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines.filter(Boolean)) {
          const update = JSON.parse(line);
          setExports((all) => ({ ...all, [update.index]: update }));
        }
      }
    } catch {
      setError("The export stopped before it finished.");
    } finally {
      setExporting(false);
    }
  }

  const percent = (seconds) => `${duration ? (seconds / duration) * 100 : 0}%`;

  return (
    <div className="trim">
      <section
        className={`trim-sources${dragging ? " trim-dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); uploadFile(event.dataTransfer.files[0]); }}
      >
        <label>
          <span>Source</span>
          <select value={source} onChange={(event) => setSource(event.target.value)} disabled={!sources.length}>
            {!sources.length && <option value="">No videos in _media/sources/ yet</option>}
            {sources.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="trim-upload">
          <span>{upload ? `Uploading ${upload.name}: ${Math.round(upload.progress * 100)}%` : "Drop a video here, or choose one"}</span>
          <input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.m4v,.mov,.webm" disabled={!!upload} onChange={(event) => uploadFile(event.target.files[0])} />
        </label>
      </section>

      {error && <p className="trim-error" role="alert">{error}</p>}

      {source && (
        <section className="trim-player">
          <video key={source} ref={video} src={mediaUrl(source)} preload="auto" playsInline onClick={() => (video.current.paused ? play() : pause())}
            onTimeUpdate={onTimeUpdate} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          {info && (
            <p className="trim-info">
              {clock(info.duration)} · {info.fps} fps · {info.width}×{info.height} · {info.video || "no video"}{info.audio ? ` + ${info.audio}` : ", no audio"}
            </p>
          )}

          <div className="trim-timeline" aria-hidden="true">
            {segments.map((segment, index) => (
              <button key={segment.id} tabIndex={-1} className="trim-bar" style={{ left: percent(segment.in), width: percent(segment.out - segment.in) }} title={segment.name} onClick={() => seek(segment.in)}>{index + 1}</button>
            ))}
            {markIn !== null && <span className="trim-mark" style={{ left: percent(markIn) }} />}
            {markOut !== null && <span className="trim-mark trim-mark-out" style={{ left: percent(markOut) }} />}
            <span className="trim-playhead" style={{ left: percent(time) }} />
          </div>
          <input className="trim-scrub" type="range" min="0" max={duration || 0} step="any" value={time} aria-label="Playhead"
            onChange={(event) => { pause(); seek(Number(event.target.value)); }} />

          <div className="trim-controls">
            <button onClick={() => seek(time - frame)} title="One frame back (←)">◀︎ frame</button>
            <button className="trim-play" onClick={() => (playing ? pause() : play())}>{playing ? "Pause" : "Play"}</button>
            <button onClick={() => seek(time + frame)} title="One frame on (→)">frame ▶︎</button>
            <span className="trim-time">{clock(time)}</span>
            <button onClick={() => setMarkIn(time)}>Mark in (I){markIn !== null && `: ${clock(markIn)}`}</button>
            <button onClick={() => setMarkOut(time)}>Mark out (O){markOut !== null && `: ${clock(markOut)}`}</button>
            <button className="trim-go" onClick={addSegment}>Add segment (Enter)</button>
          </div>
          <p className="trim-hint">Keys: Space play/pause · J back, K stop, L forward (again for faster) · ← → one frame, Shift for a second · I in · O out · Enter add.</p>
        </section>
      )}

      {source && (
        <section className="trim-segments">
          <h2>Segments <span>{segments.length}</span></h2>
          {!segments.length && <p className="trim-hint">None yet. Mark an in and an out point, then add the segment. The list saves itself beside the video.</p>}
          <ol>
            {segments.map((segment, index) => {
              const result = exports[index];
              return (
                <li key={segment.id}>
                  <span className="trim-number">{String(index + 1).padStart(2, "0")}</span>
                  <input className="trim-name" value={segment.name} aria-label={`Segment ${index + 1} name`} onChange={(event) => updateSegment(segment.id, { name: event.target.value })} />
                  <Point label="In" value={segment.in} frame={frame} onSet={(value) => updateSegment(segment.id, { in: Math.max(0, Math.min(value, segment.out - frame)) })} now={time} />
                  <Point label="Out" value={segment.out} frame={frame} onSet={(value) => updateSegment(segment.id, { out: Math.min(duration || value, Math.max(value, segment.in + frame)) })} now={time} />
                  <span className="trim-length">{(segment.out - segment.in).toFixed(2)} s</span>
                  <button onClick={() => preview(segment)}>Preview</button>
                  <button className="trim-delete" onClick={() => removeSegment(segment.id)} aria-label={`Delete segment ${index + 1}`}>Delete</button>
                  {result && <ExportStatus result={result} />}
                </li>
              );
            })}
          </ol>

          {segments.length > 0 && (
            <div className="trim-export">
              <fieldset>
                <legend>Export</legend>
                {Object.entries(MODES).map(([key, copy]) => (
                  <label key={key}><input type="radio" name="mode" value={key} checked={mode === key} onChange={() => setMode(key)} /> {copy}</label>
                ))}
              </fieldset>
              <button className="trim-go" onClick={exportClips} disabled={exporting}>{exporting ? "Exporting…" : `Export ${segments.length} clip${segments.length === 1 ? "" : "s"}`}</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// An in or out point: its time, nudge a frame either way, or set it to the playhead.
function Point({ label, value, frame, onSet, now }) {
  return (
    <span className="trim-point">
      <span>{label} {clock(value)}</span>
      <button onClick={() => onSet(value - frame)} aria-label={`${label} one frame earlier`}>−</button>
      <button onClick={() => onSet(value + frame)} aria-label={`${label} one frame later`}>+</button>
      <button onClick={() => onSet(now)} title="Set to the playhead">here</button>
    </span>
  );
}

function ExportStatus({ result }) {
  if (result.status === "done") return <span className="trim-status trim-done"><a href={result.src} target="_blank" rel="noreferrer">{result.path}</a></span>;
  if (result.status === "failed") return <span className="trim-status trim-failed">Failed: {result.error}</span>;
  if (result.status === "working") return <span className="trim-status"><progress max="1" value={result.progress || 0} /> cutting…</span>;
  return <span className="trim-status">waiting</span>;
}
