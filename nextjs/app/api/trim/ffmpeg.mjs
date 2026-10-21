// Running ffprobe and ffmpeg for the trimmer. Both are started with spawn() and an argument array, never a shell
// string, so a filename can't turn into a command. Set FFMPEG or FFPROBE in the environment if they aren't on PATH.
//
// To change first: the two export recipes in clipArgs() (codec, quality, audio bitrate).
import { spawn } from "node:child_process";

const ffmpeg = process.env.FFMPEG || "ffmpeg";
const ffprobe = process.env.FFPROBE || "ffprobe";

// Run a program and collect what it prints. onLine gets each line of stdout as it arrives (ffmpeg's -progress).
// Rejects with the last lines of stderr if it fails. Pass an AbortSignal to stop it.
export function run(program, args, { onLine, signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { stdio: ["ignore", "pipe", "pipe"], signal });
    let stdout = "";
    let stderr = "";
    let pending = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (!onLine) return;
      pending += chunk;
      const lines = pending.split("\n");
      pending = lines.pop();
      lines.forEach(onLine);
    });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-8000); });
    child.on("error", (error) => reject(error.code === "ENOENT" ? new Error(`${program} isn't installed or isn't on PATH.`) : error));
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr.trim().split("\n").slice(-6).join("\n") || `${program} exited with code ${code}.`));
    });
  });
}

// "30000/1001" -> 29.97
function rate(text) {
  const [a, b] = String(text || "").split("/").map(Number);
  return a && b ? a / b : a || 0;
}

// What the trimmer needs to know about a source: { duration, fps, width, height, video, audio }.
export async function probe(file) {
  const out = await run(ffprobe, ["-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,avg_frame_rate,r_frame_rate", "-of", "json", file]);
  const { format = {}, streams = [] } = JSON.parse(out);
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  return {
    duration: Number(format.duration) || 0,
    fps: Math.round((rate(video?.avg_frame_rate) || rate(video?.r_frame_rate)) * 1000) / 1000,
    width: video?.width || 0,
    height: video?.height || 0,
    video: video?.codec_name || "",
    audio: audio?.codec_name || "",
  };
}

// The ffmpeg arguments for one clip. "fast" copies the streams as they are: quick and lossless, but a cut can only
// start on a keyframe, so the clip may begin a little before your in point. "exact" re-encodes to H.264/AAC, which
// starts on the exact frame and plays everywhere, and takes longer.
export function clipArgs(input, start, duration, output, mode) {
  const args = ["-hide_banner", "-nostdin", "-n", "-ss", start.toFixed(3), "-i", input, "-t", duration.toFixed(3), "-map", "0:v:0?", "-map", "0:a:0?"];
  if (mode === "exact") args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k");
  else args.push("-c", "copy", "-avoid_negative_ts", "make_zero");
  args.push("-movflags", "+faststart", "-progress", "pipe:1", "-nostats", output);
  return args;
}

// Cut one clip. onProgress(fraction) is called as ffmpeg reports how far it has got.
export async function cutClip({ input, start, duration, output, mode, onProgress, signal }) {
  await run(ffmpeg, clipArgs(input, start, duration, output, mode), {
    signal,
    onLine: (line) => {
      const match = /^out_time_us=(\d+)/.exec(line);
      if (match && onProgress) onProgress(Math.min(1, Number(match[1]) / 1e6 / duration));
    },
  });
}
