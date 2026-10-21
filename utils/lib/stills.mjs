import {join} from 'node:path';

// Pure helpers for utils/stills.mjs, kept here so they can be unit tested without calling ffmpeg.

// Evenly spaced timestamps (seconds) across [0, duration), one per frame, centered in its slice.
export function evenTimestamps(duration, n) {
  if (!(duration > 0) || !Number.isInteger(n) || n < 1) throw new Error('duration must be positive and n a positive integer.');
  return Array.from({length: n}, (_, i) => (i + 0.5) * duration / n);
}

// Timestamps every `every` seconds, starting at 0, up to (not including) duration.
export function everyTimestamps(duration, every) {
  if (!(duration > 0) || !(every > 0)) throw new Error('duration and every must be positive numbers.');
  const stamps = [];
  for (let t = 0; t < duration; t += every) stamps.push(t);
  return stamps;
}

export function formatTimestamp(seconds) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`;
}

export function parseTimestamp(value) {
  const parts = String(value).split(':');
  if (parts.length !== 3 || parts.some(p => !p.trim())) throw new Error('--at must be HH:MM:SS (or HH:MM:SS.mmm).');
  const [h, m, s] = parts.map(Number);
  if (![h, m, s].every(Number.isFinite) || h < 0 || m < 0 || m >= 60 || s < 0 || s >= 60) throw new Error('--at must be HH:MM:SS (or HH:MM:SS.mmm).');
  return h * 3600 + m * 60 + s;
}

// One ffmpeg extraction command per timestamp. Fast seek: -ss before -i.
export function frameCommands(video, timestamps, framesDir) {
  return timestamps.map((t, i) => ({
    frame: i + 1,
    timestamp: t,
    file: join(framesDir, `frame-${String(i + 1).padStart(2, '0')}.jpg`),
    command: ['ffmpeg', '-y', '-ss', formatTimestamp(t), '-i', video, '-frames:v', '1', join(framesDir, `frame-${String(i + 1).padStart(2, '0')}.jpg`)],
  }));
}

export function tileGrid(n) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return {cols, rows};
}

// One ffmpeg tile command that combines the extracted frames into a contact sheet.
export function contactSheetCommand(framesDir, n, sheetFile) {
  const {cols, rows} = tileGrid(n);
  return {
    cols, rows,
    command: ['ffmpeg', '-y', '-i', join(framesDir, 'frame-%02d.jpg'), '-filter_complex', `tile=${cols}x${rows}`, sheetFile],
  };
}

export function durationCommand(video) {
  return ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', video];
}
