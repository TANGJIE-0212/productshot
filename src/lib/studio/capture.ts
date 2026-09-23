import puppeteer, { type Browser, type Page, type ScreenRecorder } from "puppeteer";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  STUDIO_HEIGHT, STUDIO_WIDTH,
  type StudioBox, type StudioInspection, type StudioProject, type StudioRecording,
} from "./types";

const exec = promisify(execFile);
const loopback = (host: string) => ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host.toLowerCase());
const hostname = (url: URL) => url.hostname.replace(/^\[|\]$/g, "");

function privateAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) ||
      (a === 198 && (b === 18 || b === 19));
  }
  // Only globally routable IPv6 unicast; mapped IPv4 and local ranges are denied.
  return !/^[23][0-9a-f]{3}:/i.test(address) || /^2001:(?:0:|db8:)/i.test(address);
}

export async function validateTarget(value: string): Promise<URL> {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid HTTP or HTTPS target URL."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Only HTTP/HTTPS targets without embedded credentials are supported.");
  }
  if (!loopback(url.hostname)) await checkPublicHost(hostname(url));
  return url;
}

async function checkPublicHost(host: string) {
  const addresses = await lookup(host, { all: true });
  if (!addresses.length || addresses.some(({ address }) => privateAddress(address))) {
    throw new Error(`Private network destination is not allowed: ${host}`);
  }
}

function aborted(signal: AbortSignal) {
  if (signal.aborted) throw signal.reason instanceof Error ? signal.reason : new Error("Cancelled.");
}

async function pause(ms: number, signal: AbortSignal) {
  aborted(signal);
  await new Promise<void>((resolve, reject) => {
    const cancel = () => { clearTimeout(timer); reject(signal.reason ?? new Error("Cancelled.")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, ms);
    signal.addEventListener("abort", cancel, { once: true });
  });
}

async function withPage<T>(target: URL, signal: AbortSignal, run: (page: Page, gate: () => void) => Promise<T>): Promise<T> {
  aborted(signal);
  const profile = path.join(process.cwd(), ".studio", "browsers", randomUUID());
  await fs.mkdir(profile, { recursive: true });
  let browser: Browser | undefined;
  let closePromise: Promise<void> | undefined;
  const close = () => closePromise ??= browser ? browser.close() : Promise.resolve();
  const cancel = () => { void close().catch((error) => console.error("Studio browser cleanup:", error)); };
  try {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: profile,
      timeout: 30_000,
      args: ["--disable-background-networking", "--disable-extensions", "--disable-quic",
        "--force-webrtc-ip-handling-policy=disable_non_proxied_udp", "--no-proxy-server"],
    });
    signal.addEventListener("abort", cancel, { once: true });
    aborted(signal);
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: STUDIO_WIDTH, height: STUDIO_HEIGHT, deviceScaleFactor: 1 });
    page.setDefaultTimeout(10_000);
    page.setDefaultNavigationTimeout(25_000);
    await page.setBypassServiceWorker(true);
    const cdp = await page.createCDPSession();
    await cdp.send("Browser.setDownloadBehavior", { behavior: "deny", browserContextId: context.id });
    await cdp.send("Network.enable");
    await cdp.send("Network.setBlockedURLs", { urls: ["ws://*", "wss://*"] });
    let requests = 0;
    let navigations = 0;
    let violation: Error | undefined;
    const checked = new Map<string, Promise<void>>();
    const gate = () => { aborted(signal); if (violation) throw violation; };
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      void (async () => {
        if (request.isInterceptResolutionHandled()) return;
        try {
          gate();
          if (++requests > 1500) throw new Error("Target exceeded the 1,500-request limit.");
          const url = new URL(request.url());
          const navigating = request.isNavigationRequest();
          if (navigating && (++navigations > 32 || url.origin !== target.origin)) {
            throw new Error("Navigation outside the explicitly authorized target origin is blocked.");
          }
          if (!["http:", "https:"].includes(url.protocol)) {
            if (!navigating && ["data:", "blob:"].includes(url.protocol)) {
              await request.continue(); return;
            }
            throw new Error("Unsupported target request protocol.");
          }
          if (url.username || url.password) throw new Error("Credential-bearing requests are blocked.");
          if (!(loopback(target.hostname) && url.origin === target.origin)) {
            const host = hostname(url);
            if (!checked.has(host)) checked.set(host, checkPublicHost(host));
            await checked.get(host);
          }
          if (!request.isInterceptResolutionHandled()) await request.continue();
        } catch (error) {
          // Forbidden resource destinations are blocked; forbidden navigations fail the workflow.
          if (request.isNavigationRequest() || requests > 1500) {
            violation = error instanceof Error ? error : new Error(String(error));
          }
          if (!request.isInterceptResolutionHandled()) await request.abort("blockedbyclient");
        }
      })().catch((error) => {
        if (!signal.aborted) violation = error instanceof Error ? error : new Error(String(error));
      });
    });
    page.on("dialog", (dialog) => {
      violation = new Error("Unexpected browser dialog; automatic confirmation is not supported.");
      void dialog.dismiss().catch((error) => console.error("Studio dialog cleanup:", error));
    });
    page.on("popup", (popup) => {
      violation = new Error("Pop-up windows are not supported; keep the workflow in one tab.");
      void popup?.close().catch((error) => console.error("Studio popup cleanup:", error));
    });
    await page.evaluateOnNewDocument(() => {
      const install = () => {
        const style = document.createElement("style");
        style.textContent = "*,*::before,*::after{cursor:none!important}";
        (document.head || document.documentElement).append(style);
      };
      if (document.documentElement) install();
      else document.addEventListener("DOMContentLoaded", install, { once: true });
      window.open = () => null;
    });
    const response = await page.goto(target.href, { waitUntil: "domcontentloaded" });
    if (response && response.status() >= 400) throw new Error(`Target returned HTTP ${response.status()}.`);
    await pause(800, signal);
    gate();
    return await run(page, gate);
  } finally {
    signal.removeEventListener("abort", cancel);
    try { await close(); } finally { await fs.rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); }
  }
}

export async function inspectTarget(project: StudioProject, signal: AbortSignal): Promise<StudioInspection> {
  const target = await validateTarget(project.brief.url);
  return withPage(target, signal, async (page, gate) => {
    const inspection = await page.evaluate(() => {
      const visible = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" &&
          rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
      };
      const selectorFor = (element: Element) => {
        if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) return `#${CSS.escape(element.id)}`;
        const parts: string[] = [];
        let current: Element | null = element;
        while (current) {
          const tag = CSS.escape(current.localName);
          const siblings: Element[] = current.parentElement ? Array.from(current.parentElement.children).filter((e) => e.localName === current!.localName) : [];
          parts.unshift(`${tag}${siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : ""}`);
          const selector = parts.join(" > ");
          if (document.querySelectorAll(selector).length === 1) return selector;
          current = current.parentElement;
        }
        return parts.join(" > ");
      };
      const elements = Array.from(document.querySelectorAll("button,a[href],input,textarea,select,[role=button],[contenteditable=true]"))
        .filter((element) => visible(element) && element.getAttribute("type")?.toLowerCase() !== "password")
        .slice(0, 100).map((element) => ({
          selector: selectorFor(element),
          tag: element.localName,
          text: ((element as HTMLElement).innerText || element.getAttribute("aria-label") || element.getAttribute("placeholder") || "").slice(0, 150),
          type: element.getAttribute("type") || "",
        })).filter((element) => element.selector.length <= 500);
      return { url: location.href, title: document.title.slice(0, 300), text: document.body.innerText.slice(0, 12000), elements };
    });
    gate();
    return inspection;
  });
}

export async function probeMedia(file: string, signal?: AbortSignal) {
  const { stdout } = await exec("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
    "format=duration:stream=width,height,r_frame_rate:packet=pts_time,duration_time", "-of", "json", file],
    { timeout: 20_000, maxBuffer: 4 * 1024 * 1024, signal, windowsHide: true });
  const result = JSON.parse(stdout);
  const stream = result.streams?.find((item: { width?: number }) => item.width);
  // Puppeteer writes WebM to a pipe, so its container may omit the duration header.
  const packetEnd = (result.packets ?? []).reduce((end: number, packet: { pts_time?: string; duration_time?: string }) =>
    Math.max(end, Number(packet.pts_time ?? 0) + Number(packet.duration_time ?? 0)), 0);
  const duration = Number(result.format?.duration) || packetEnd;
  if (!stream || !Number.isFinite(duration) || duration <= 0) throw new Error("Captured media has no valid video or duration.");
  return { duration, width: Number(stream.width), height: Number(stream.height), fps: String(stream.r_frame_rate) };
}

async function normalizeScreencast(file: string, signal: AbortSignal) {
  const raw = await probeMedia(file, signal);
  if (raw.fps === "30/1") return raw;
  if (raw.fps !== "25/1") throw new Error(`Unexpected Puppeteer screencast frame rate: ${raw.fps}`);
  // Puppeteer 23 places -framerate after its image input. FFmpeg 9 consequently
  // timestamps its internally generated 30 fps frames at 25 fps. Correct that
  // known timebase mismatch, then verify the final source against wall time.
  const normalized = `${file}.normalized.webm`;
  try {
    await exec("ffmpeg", ["-v", "error", "-y", "-i", file, "-an", "-vf", "setpts=PTS*25/30,fps=30",
      "-c:v", "libvpx-vp9", "-deadline", "realtime", "-cpu-used", "8", "-threads", "2", "-b:v", "0", "-crf", "30", normalized],
    { timeout: 45_000, maxBuffer: 1024 * 1024, signal, windowsHide: true });
    await fs.rename(normalized, file);
    const result = await probeMedia(file, signal);
    if (result.fps !== "30/1") throw new Error("The normalized screencast is not 30 fps.");
    return result;
  } finally { await fs.rm(normalized, { force: true }); }
}

export async function captureWorkflow(
  project: StudioProject,
  file: string | null,
  signal: AbortSignal,
  progress: (value: number, message: string) => void,
): Promise<Pick<StudioRecording, "duration" | "width" | "height" | "events" | "cursor"> | null> {
  const target = await validateTarget(project.brief.url);
  return withPage(target, signal, async (page, gate) => {
    let recorder: ScreenRecorder | undefined;
    const events: StudioRecording["events"] = [];
    const cursor: StudioRecording["cursor"] = [];
    let recorderError: Error | undefined;
    let x = STUDIO_WIDTH / 2;
    let y = STUDIO_HEIGHT / 2;
    await page.mouse.move(x, y);
    let started = performance.now();
    const seconds = () => Math.max(0, (performance.now() - started) / 1000);
    const stamp = (click = false) => cursor.push({ time: seconds(), x: x / STUDIO_WIDTH, y: y / STUDIO_HEIGHT, click });
    const move = async (toX: number, toY: number) => {
      const fromX = x, fromY = y;
      for (let i = 1; i <= 18; i++) {
        gate();
        const p = i / 18, smooth = p * p * (3 - 2 * p);
        x = fromX + (toX - fromX) * smooth;
        y = fromY + (toY - fromY) * smooth;
        await page.mouse.move(x, y);
        stamp();
        await pause(25, signal);
      }
    };
    try {
      if (file) {
        progress(0.12, "Starting real 30 fps browser screencast…");
        recorder = await page.screencast({ path: file as `${string}.webm`, scale: 1, speed: 1 });
        recorder.on("error", (error) => { recorderError = error; });
      }
      started = performance.now();
      stamp();
      // Trigger real compositor frames even when the page is otherwise static.
      await page.evaluate(() => {
        const pulse = document.createElement("i");
        pulse.id = "__studio_capture_clock";
        pulse.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:1px;pointer-events:none;z-index:2147483647;opacity:.01";
        document.documentElement.append(pulse);
        let tick = false;
        setInterval(() => { tick = !tick; pulse.style.background = tick ? "#fff" : "#000"; }, 100);
      });
      await pause(300, signal);
      for (let index = 0; index < project.steps.length; index++) {
        gate();
        if (seconds() > 175) throw new Error("Capture exceeded its three-minute limit.");
        const step = project.steps[index];
        const start = index ? events[index - 1].end : 0;
        let box: StudioBox | null = null;
        progress(0.15 + index / project.steps.length * 0.65, `${index + 1}/${project.steps.length}: ${step.title}`);
        if (step.action === "click" || step.action === "type") {
          const element = await page.waitForSelector(step.selector, { visible: true });
          if (!element) throw new Error(`Missing visible control: ${step.selector}`);
          try {
            const safe = await element.evaluate((node, action) => {
              if (!(node instanceof HTMLElement)) return false;
              if (node.closest('input[type="password"],[inert]') || node.matches(":disabled") || node.getAttribute("aria-disabled") === "true") return false;
              if (action === "type") return (node instanceof HTMLInputElement && ["text", "search", "email", "url", "tel", "number", ""].includes(node.type) && !node.readOnly) ||
                (node instanceof HTMLTextAreaElement && !node.readOnly) || node.isContentEditable;
              return true;
            }, step.action);
            if (!safe) throw new Error("Only visible, enabled, non-password controls can be clicked/typed.");
            await element.scrollIntoView();
            const rect = await element.boundingBox();
            if (!rect) throw new Error("Control is not visible.");
            const left = Math.max(0, rect.x), top = Math.max(0, rect.y);
            const right = Math.min(STUDIO_WIDTH, rect.x + rect.width), bottom = Math.min(STUDIO_HEIGHT, rect.y + rect.height);
            if (right <= left || bottom <= top) throw new Error("Control is outside the capture viewport.");
            const centerX = (left + right) / 2, centerY = (top + bottom) / 2;
            const unobscured = await element.evaluate((node, point) => {
              const hit = document.elementFromPoint(point.x, point.y);
              return hit === node || (hit !== null && node.contains(hit));
            }, { x: centerX, y: centerY });
            if (!unobscured) throw new Error("Control is covered by another element.");
            box = { x: left / STUDIO_WIDTH, y: top / STUDIO_HEIGHT, width: (right - left) / STUDIO_WIDTH, height: (bottom - top) / STUDIO_HEIGHT };
            await move(centerX, centerY);
            gate();
            stamp(true);
            await page.mouse.click(x, y, { delay: 80 });
            stamp();
            if (step.action === "type") {
              await page.keyboard.down("Control");
              await page.keyboard.press("KeyA");
              await page.keyboard.up("Control");
              await page.keyboard.press("Backspace");
              await page.keyboard.type(step.value, { delay: 35 });
            }
          } finally { await element.dispose(); }
        } else if (step.action === "scroll") {
          const amount = Number(step.value);
          for (let i = 0; i < 12; i++) {
            gate();
            await page.mouse.wheel({ deltaY: amount / 12 });
            stamp();
            await pause(40, signal);
          }
        }
        await pause(step.holdSeconds * 1000, signal);
        if (step.expectedSelector.trim()) {
          const expected = await page.waitForSelector(step.expectedSelector, { visible: true });
          if (!expected) throw new Error(`Expected visible selector not found: ${step.expectedSelector}`);
          await expected.dispose();
        }
        if (step.expectedText.trim()) {
          const expected = await page.waitForFunction((text) => document.body.innerText.includes(text), {}, step.expectedText);
          await expected.dispose();
        }
        gate();
        events.push({ stepId: step.id, title: step.title, start, end: seconds(), box, verified: true });
      }
      await pause(400, signal);
      gate();
      if (!file || !recorder) return null;
      const elapsed = seconds();
      progress(0.85, "Stopping screencast and verifying actual media duration…");
      await recorder.stop();
      recorder = undefined;
      if (recorderError) throw recorderError;
      const media = await normalizeScreencast(file, signal);
      if (media.width !== STUDIO_WIDTH || media.height !== STUDIO_HEIGHT ||
        Math.abs(media.duration - elapsed) > Math.max(0.75, Math.min(1.5, elapsed * 0.03))) {
        throw new Error(`Recording timing/size mismatch (${media.duration.toFixed(2)}s media vs ${elapsed.toFixed(2)}s actions); recording was not promoted.`);
      }
      if (events.some((event) => event.end > media.duration + 0.35)) {
        throw new Error("Recording ended before its verified actions; recording was not promoted.");
      }
      events.forEach((event, index) => {
        event.end = index === events.length - 1 ? media.duration : Math.min(event.end, media.duration);
        if (event.end - event.start < 0.2) throw new Error("Recording contains an unusably short event.");
      });
      return {
        duration: media.duration, width: media.width, height: media.height, events,
        cursor: cursor.filter((sample) => sample.time <= media.duration),
      };
    } finally {
      if (recorder) await recorder.stop();
    }
  });
}
