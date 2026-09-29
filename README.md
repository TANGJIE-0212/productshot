# ProductShot

ProductShot is an Agent-led workflow for understanding a product, selecting what
to demonstrate, designing a story, and producing an executable recording script.

## What this repository contains

- **Two canonical design skills**
  - [`product-scenario-design`](.github/skills/product-scenario-design/SKILL.md)
    identifies the product mechanism, ranks beneficiaries, separates feature
    introductions from scenario-led stories, and derives a story before footage.
  - [`recording-script-design`](.github/skills/recording-script-design/SKILL.md)
    maps each story beat to exact inputs, visible product changes, highlights,
    camera direction, narration, editing and verification.
- **Product demo director**
  - [`product-demo-director`](.github/skills/product-demo-director/SKILL.md)
    orchestrates intake, feature selection, the two specialist skills and review.
- **Native MCP feature intake**
  - [`mcp-app/`](mcp-app/) publishes evidence-backed feature discovery and uses
    native MCP Elicitation where the host supports it.
- **UI and visual research**
  - [`public/director-ui/`](public/director-ui/) contains the active light and dark
    ProductShot UI prototypes.
  - [`public/studio-designs.html`](public/studio-designs.html) and the related
    `studio-*` files preserve the visual design study.
  - [`docs/productshot-interaction-design.md`](docs/productshot-interaction-design.md)
    records the agreed interaction direction and remaining implementation gaps.

The earlier Next.js and Remotion video-generator prototype has been removed.
It was a separate experiment and is not part of the current ProductShot
architecture.

## Skill layout

Canonical skills live under [`.github/skills/`](.github/skills/). Thin discovery
entries for compatible Agents live under [`.agents/skills/`](.agents/skills/).
Do not duplicate the canonical workflow in the thin entries.

The core production rule is:

> Story before footage; footage contract before capture.

A feature introduction and a scenario-led film need different openings,
motivations and action sequences. Existing footage may satisfy a story contract,
but must not determine or weaken it.

## Run the UI

Install the root dependency and start either active theme:

```powershell
npm install
node scripts\serve-director-ui.mjs --port 3022 --variant neo
node scripts\serve-director-ui.mjs --port 3024 --variant spatial
```

Private media can be connected with `--media-dir <folder>`. The server exposes
only its explicit media allowlist and never serves director project files.

## Verify

```powershell
npm run verify:director
npm run verify:ui
```

The director verifier uses isolated temporary project data. Private projects,
recordings, captures and credentials belong in ignored local directories such
as `.director-projects/`.

The MCP package has its own verification command:

```powershell
cd mcp-app
npm install
npm run verify
```

## Public demos

- [Feature-introduction video](https://daytoy.online/product-video/feature-story.html)
- [Scenario-led supermarket video](https://daytoy.online/product-video/scenario-story.html)

These pages demonstrate the story-first method. They do not turn planning
approval into permission for product mutation, recording, paid generation,
external uploads or public release.
