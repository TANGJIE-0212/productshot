import { getStudio, localOrigin, mutateStudio, studioFailure, StudioError } from "@/lib/studio/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    localOrigin(request);
    return Response.json(await getStudio(new URL(request.url).searchParams), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioFailure(error); }
}

export async function POST(request: Request) {
  try {
    const origin = localOrigin(request);
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      throw new StudioError("Use application/json.", 415);
    }
    const reader = request.body?.getReader();
    if (!reader) throw new StudioError("Missing JSON request body.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 4 * 1024 * 1024) {
          await reader.cancel();
          throw new StudioError("Request body exceeds 4 MiB.", 413);
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    let input: unknown;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new StudioError("Invalid JSON request body."); }
    return Response.json(await mutateStudio(input, origin), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioFailure(error); }
}
