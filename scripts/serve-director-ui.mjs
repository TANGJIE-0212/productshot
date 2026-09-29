import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const option = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const port = Number(option("--port", "3020"));
const variant = option("--variant", "neo");
const variants = { morandi: "index.html", studio: "studio.html", neo: "neo.html", glass: "glass.html", spatial: "spatial.html" };
if (!Object.hasOwn(variants, variant)) throw new Error("Unknown UI variant. Use morandi, studio, neo, glass or spatial.");
const mediaArg = option("--media-dir", "");
const media = mediaArg ? path.resolve(mediaArg) : null;
const assets = new Map([
  ["/", [variants[variant], "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/studio.css", ["studio.css", "text/css; charset=utf-8"]],
  ["/studio-poster.svg", ["studio-poster.svg", "image/svg+xml"]],
  ["/neo.css", ["neo.css", "text/css; charset=utf-8"]],
  ["/glass.css", ["glass.css", "text/css; charset=utf-8"]],
  ["/glass-landscape.svg", ["glass-landscape.svg", "image/svg+xml"]],
  ["/spatial.css", ["spatial.css", "text/css; charset=utf-8"]],
  ["/spatial.js", ["spatial.js", "text/javascript; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]]
]);
const recordings = new Map([
  ["video.mp4", "biztable-concept-preview.mp4"], ["empty.png", "01-empty-app.png"],
  ["structure.png", "02-empty-structure.png"], ["before.png", "03-dashboard-before.png"],
  ["form.png", "04-filled-form.png"], ["readback.png", "06-record-readback.png"], ["after.png", "07-dashboard-after.png"]
]);
const ready = () => !!media && [...recordings.values()].every(name => fs.existsSync(path.join(media, name)));
http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const url = new URL(req.url, "http://127.0.0.1");
  const headers = {
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    "Referrer-Policy": "no-referrer"
  };
  if (url.pathname === "/demo-assets/status") {
    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    res.end(req.method === "HEAD" ? undefined : JSON.stringify({ available: ready() })); return;
  }
  const asset = assets.get(url.pathname);
  const mediaName = url.pathname.startsWith("/demo-assets/") ? recordings.get(url.pathname.slice(13)) : null;
  const filename = asset ? path.join(root, "public", "director-ui", asset[0]) : media && mediaName ? path.join(media, mediaName) : null;
  if (!filename) { res.writeHead(404, headers); res.end(); return; }
  fs.stat(filename, (error, stat) => {
    if (error || !stat.isFile()) {
      const status = error && error.code !== "ENOENT" ? 500 : 404;
      if (status === 500) console.error(error);
      res.writeHead(status, headers); res.end(); return;
    }
    const type = asset ? asset[1] : filename.endsWith(".mp4") ? "video/mp4" : "image/png";
    let start = 0, end = stat.size - 1, status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if (!match || Number(match[1]) >= stat.size || (match[2] && Number(match[2]) < Number(match[1]))) {
        res.writeHead(416, { ...headers, "Content-Range": `bytes */${stat.size}` }); res.end(); return;
      }
      start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end; status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
    }
    res.writeHead(status, { ...headers, "Content-Type": type, "Content-Length": end - start + 1, "Accept-Ranges": "bytes" });
    if (req.method === "HEAD") { res.end(); return; }
    const stream = fs.createReadStream(filename, { start, end });
    stream.on("error", err => { console.error(err); res.destroy(err); });
    res.on("close", () => stream.destroy());
    stream.pipe(res);
  });
}).listen(port, "127.0.0.1", () => console.log(`ProductShot UI: http://127.0.0.1:${port}/ · ${variant} · reference media ${ready() ? "available" : "not configured"}`));
