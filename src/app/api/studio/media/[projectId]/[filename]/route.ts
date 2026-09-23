import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import { authorizedMedia, localOrigin, studioFailure, StudioError } from "@/lib/studio/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: { projectId: string; filename: string } };

async function serve(request: Request, { params }: Context, head: boolean) {
  try {
    localOrigin(request);
    const file = await authorizedMedia(params.projectId, params.filename);
    const info = await fs.lstat(file);
    if (!info.isFile() || info.isSymbolicLink()) throw new StudioError("Media not found.", 404);
    const headers = new Headers({
      "Content-Type": params.filename.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4",
      "Accept-Ranges": "bytes", "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "same-origin",
    });
    let start = 0, end = info.size - 1, status = 200;
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const invalid = () => new Response(null, { status: 416, headers: { ...Object.fromEntries(headers), "Content-Range": `bytes */${info.size}` } });
      if (!match || (!match[1] && !match[2])) return invalid();
      if (!match[1]) {
        const suffix = Number(match[2]);
        if (!Number.isSafeInteger(suffix) || suffix <= 0) return invalid();
        start = Math.max(0, info.size - suffix);
      } else {
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), end) : end;
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) return invalid();
      status = 206;
      headers.set("Content-Range", `bytes ${start}-${end}/${info.size}`);
    }
    headers.set("Content-Length", String(end - start + 1));
    if (head) return new Response(null, { status, headers });
    const stream = createReadStream(file, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status, headers });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return studioFailure(new StudioError("Media not found.", 404));
    return studioFailure(error);
  }
}

export const GET = (request: Request, context: Context) => serve(request, context, false);
export const HEAD = (request: Request, context: Context) => serve(request, context, true);
