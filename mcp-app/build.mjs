import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("./", import.meta.url);
const result = await build({
  entryPoints: [fileURLToPath(new URL("feature-picker.js", root))],
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
});
const template = await readFile(new URL("feature-picker.html", root), "utf8");
const javascript = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
await mkdir(new URL("dist/", root), { recursive: true });
await writeFile(new URL("dist/feature-picker.html", root), template.replace("<!-- APP_SCRIPT -->", () => `<script type="module">${javascript}</script>`));
console.log("Built self-contained MCP App (no external scripts or network assets).");
