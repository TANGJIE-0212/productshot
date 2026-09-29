# Recording tools: plan against real capabilities

Research date: 2026-09-25. These sources were read, not installed or executed.
Upstream `main` can change. Confirm the installed release and supported interface
before producing tool-specific commands or project JSON.

## OpenScreen

Sources:

- [Repository README](https://github.com/getopenscreen/openscreen/blob/main/README.md)
  (inspected blob `992f41656b5d993409951ecca172e7ec8f8ffc99`).
- [CLI reference source](https://github.com/getopenscreen/openscreen/blob/main/website/docs/cli.md)
  (inspected blob `7a50881a4a8dae0defa63e41a186f4d292126100`).

This is a **desktop recorder/editor with CLI documentation**, not itself a
scenario-planning SKILL.md. The inspected docs describe:

- Screen/window capture, mic/system audio and cursor telemetry.
- Manual/auto zooms with focus position, depth, duration and easing.
- Cursor smoothing/click effects.
- Text, arrow and image annotations.
- Crop, trim, per-segment speed adjustment and MP4/GIF export.
- CLI commands for capture, source listing, project inspection and export.
- Editing `.openscreen` project JSON for zooms, annotations and trims.

These capabilities are useful for a planned progression:
**wide context -> focused input -> cut idle processing -> highlight real result
-> return to context**. Auto-zoom is a starting suggestion, not a replacement
for editorial attention design.

Important distinctions:

- CLI "headless" still starts Electron; the documented capture needs a real
  desktop session. It is not a server-only recorder.
- On Linux, a portal may require an interactive source picker. On Windows,
  graceful stopping differs from Unix signals. Plan using the actual platform.
- The inspected CLI has no webcam recording option although the GUI advertises
  webcam features. Do not assume interface parity.
- CLI and project format may break between releases. Inspect the current schema;
  do not fabricate universal `addZoom`/`highlight` calls or copy guessed JSON keys.
- A native arrow annotation is not necessarily a native bounding-box/spotlight
  effect. Confirm the required treatment, or use a verified post-processing path.
- The optional AI editing assistant requires a provider/key and is not enabled
  by default. This skill does not authorize sending project content to it.

Illustrative syntax documented upstream, **not a claim of local availability**:

```powershell
# Replace this with the verified installed executable path.
& $openScreenExecutable sources --json
& $openScreenExecutable record --window 'Authorized test app' --duration 30 --project '.\take.openscreen' --json
& $openScreenExecutable export '.\take.openscreen' -o '.\demo.mp4' --json
```

Recording requires user authorization and a confirmed target window; a substring
match must not accidentally capture a different window. Preserve raw footage,
cursor telemetry and the native editable project when used.

## Microsoft Playwright CLI recording skill

Sources:

- [SKILL.md](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/SKILL.md).
- [Video recording](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/references/video-recording.md)
  (inspected blob `f0b528ab1a70f2e8d5a828862a3dd89b8644239b`).
- [Test generation](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/references/test-generation.md).

The inspected recording reference documents browser WebM capture, cursor/action
decorations, target highlight styles, chapter markers and custom overlays.
Its recommended sequence is inspect/rehearse targets, then perform a coherent
recorded script with deliberate action pacing.

Use this for actual browser operations and semantic targets; add assertions to
verify success. Do not confuse screenshot capture or generated test actions with
a validated operation. `page.screencast` APIs in those docs are version-specific:
they are not guaranteed in the Playwright/Puppeteer version installed here.
Do not equate Puppeteer's `page.screencast()` with the differently shaped
Playwright interfaces.

The reviewed recording reference is not evidence of native editorial zoom or
all edit operations. Pair browser capture with a verified editor when needed.
Capture-time overlays can be baked into the video; plan whether a clean take
plus later overlays is preferable. Never put a success callout before readback.

## Promo storyboard and composition references

- [Promo storyboard SKILL.md](https://github.com/kangarooking/promo-creator-skills/blob/main/promo-storyboard/SKILL.md)
  (inspected blob `4e48a93187c3cb45b0c0943b975303dcd11b241b`):
  useful for specifying focus, exact copy, movement and timing; oriented toward
  HyperFrames promotional composition, not live software operation.
- [Remotion create skill](https://github.com/remotion-dev/skills/blob/main/skills/remotion-create/SKILL.md)
  and [layout guide](https://github.com/remotion-dev/skills/blob/main/skills/remotion-create/video-layout.md):
  prior research supports deliberate framing and readable overlays. Verify any
  intended renderer API separately. Composition must use real capture as its
  source when making operational claims.

Borrow the specificity, not a requirement to generate replacement interfaces.
No third-party skill text or artwork is bundled here.

## Practical capability mapping

| Planned action | Capture prerequisite | Edit/record path to confirm |
| --- | --- | --- |
| Zoom into prompt | Full prompt, label and Send readable; enough source resolution | Manual zoom region/keyframes in editor; use measured target bounds |
| Follow actual click | Real target and cursor telemetry or observed pointer | Recorder click emphasis; avoid two rendered cursors |
| Highlight result | Verified result is visible and stable | Native annotation or tested overlay compositor; track crop transform |
| Remove AI waiting | Send/onset and actual completion recorded; same object/readback | Trim interval in source timeline; remap output cues |
| Speed repetitive entry | Representative full action and final values retained | Speed region with explicit audio treatment; not a false latency claim |
| Caption and narration | Exact approved words and clear placement | Separate voice/caption tracks synchronized after cuts |
| Keyframe in planning UI | Existing image from the right product/version/state | Mark as reference; unavailable does not mean generate a fake screen |

A tool profile should be short. Spend most design effort on what the audience
needs to see, not evaluating every recorder. When a tool is missing, identify
one realistic alternative or manual handoff and retain the script's intent.
