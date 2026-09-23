# ProductShot

An Agent-led workspace for planning product demo videos. Give your Agent a
product URL or repository, discuss what to demonstrate, and refine the story
and shots in a shared local project.

## Current version: Product Demo Director

The portable [Skill](.github/skills/product-demo-director/SKILL.md) runs inside
your existing Agent (for example, a coding assistant with local file and command
tools). Its bundled Node.js runner provides a private browser workspace.

1. **Features & Audience**: inspect the product, select one or several features
   or the whole product, add missing capabilities, and identify the audience.
2. **Scenario & Outline**: compare Agent-proposed scenarios, each with its own
   simple sequence of steps; select or write your own.
3. **Story & Shots**: refine each shot's action, camera, highlight, evidence,
   transition, and must-keep constraints.
4. **Preview & Review**: record actual production artifacts and review notes.

**Left: Codex's native conversation. Right: its in-app browser displaying this
workspace.** There is no chat panel inside the webpage. The Skill runs in the
existing Agent, asks questions using its native tools, and publishes results to
the local viewer.

The browser holds editable project documents. Both the Agent and browser use
the same versioned project, with explicit approvals, stale-write rejection and revision history.
Changing an approved document invalidates affected approvals without deleting
downstream drafts.

After product inspection:

1. The Agent asks **whole product / specific features** in native chat.
2. Whole product skips feature selection. Specific features opens browser
   checkboxes and a custom-feature field.
3. Submit the form and tell the Agent "submitted" in native chat.
4. The Agent reads the answer and generates relevant audience suggestions with
   reasons. Choose one or write/edit your own audience in the browser.
5. Submit and tell the Agent again; it reads the latest form and continues.

All displayed fields remain editable. Submission saves a revision but does not
automatically wake the Agent or approve a stage. There is no separate discovery
approval question. Confirm features and audience before generating an outline.

### What is not connected yet

- Codex is the conversation host, not a model service embedded in our website.
  Answer its questions in native chat. Browser changes are saved directly to
  the same project; the Skill reads them before continuing. No second chat,
  JSON copy/paste, or separate model API connection is needed.
- This director runner does **not** record the product, generate audio, render
  MP4s, or provide an embedded media player. Review accepts existing files with
  verified checksums; review notes do not modify those files.
- Story approval does not authorize product writes, paid generation, uploads,
  or public publishing. Those need separate authorization.

## Run the Skill

Requires Node.js 20+. The director runner itself needs no dependency install,
model API key or hosted backend.

### In Codex

Open this repository in Codex and invoke `$product-demo-director` in its native
conversation (or select the Skill from its skill picker). The repository entry
is `.agents/skills/product-demo-director/SKILL.md`; it loads the canonical Skill
under `.github/skills/`, without duplicating its implementation.

Example native prompt:

> $product-demo-director Help me make a demo of this product: [URL or repo].
> Discuss the choices here and open the results in your in-app browser.

The Skill opens the local viewer using the browser tools supplied by the host.
Codex CLI alone has no graphical in-app browser; use a host that supplies one,
or open the printed loopback URL manually. The repository does not install,
launch or impersonate the Codex desktop application.

In other Agents, load `.github/skills/product-demo-director/SKILL.md`.
For a manual local workspace:

```powershell
$tool = '.github\skills\product-demo-director\scripts\director.mjs'
$project = '.director-projects\my-demo'
node $tool init --project $project --name 'My demo' --source 'https://example.com'
node $tool read --project $project
node $tool serve --project $project --port 3014
```

Open the **full local URL printed by `serve`**, including its access fragment.
The server binds only to `127.0.0.1`. Keep it running while using the workspace.
An empty project intentionally shows waiting states until the Agent publishes
evidence-backed documents. Agent publications focus the corresponding result
tab without discarding unsaved browser edits.

See [runtime commands and JSON shapes](.github/skills/product-demo-director/references/runtime.md)
for publishing documents, reading browser edits and recording approvals.
See [shell/content boundaries](.github/skills/product-demo-director/references/shell-and-content.md)
for the visual design rules. Original shell illustrations are not video assets.

## Continue on another computer

```powershell
git clone https://github.com/TANGJIE-0212/productshot.git
Set-Location productshot
```

Open this folder in your Agent and invoke `product-demo-director`. Node.js 20+
is sufficient for the Skill runner; `npm ci` is only needed for the earlier
prototype or Puppeteer regression tests. The repository's `AGENTS.md` and Skill
contain the agreed interaction sequence, so a new session need not reconstruct
it from old chat.

Private project state and conversation data are **not** in this public repo.
To resume the exact same project, transfer its `.director-projects/<name>/`
folder privately, including `project.json` and `history/`, then give the new
Agent that local folder. Start a new `serve` process and use its newly printed
URL, not the old computer's access token. Tell the Agent if the product repo or
artifact paths changed; old evidence is not automatically reverified. Without
the private folder, provide a product URL/repo to start a new project.

## Experimental MCP App: feature picker

The `mcp-app` package is an optional, local stdio MCP server with a self-contained
MCP App. It is separate from the existing browser workflow and does not change
existing projects unless the user explicitly confirms feature picks.

The Agent researches the supplied product, publishes evidence-backed discovery,
and opens a multi-select card directly in a compatible host. The card supports
recommended defaults, custom text and **Confirm and continue**. It does not ask
"whole product or specific features" first. Existing saved choices take priority
over recommendations, including custom-only choices.

The four tools are:

- `productshot_read_project`: read the bound private project.
- `productshot_publish_discovery`: publish the Agent's analysis at a checked revision.
- `productshot_select_features`: open the App with `recommendedIds`; no writes.
- `productshot_save_features`: save explicit choices without approving a stage.

The server provides workflow instructions; a Skill is not required for this
experimental entry point. It does not inspect the product or call a model itself.
It is bound to one project supplied at startup, not an arbitrary tool-provided
filesystem path. The other director stages still use the existing runner/viewer.

### Setup

Requires Node.js 22.12+ for this package and its browser checks:

```powershell
Set-Location mcp-app
npm ci
npm run build
npm test
Set-Location ..
node .github\skills\product-demo-director\scripts\director.mjs init --project .director-projects\mcp-demo --name 'My demo' --source 'https://example.com'
```

Dependencies are isolated from the earlier Next.js/Remotion prototype. The App
uses the compatible MCP SDK 1.x / MCP Apps SDK 1.x pair, pinned in its lockfile.
No API key, external scripts, hosted backend or illustration service is needed.
Do not initialize over an existing project; use its path directly to resume.

Configure a local stdio server in your host, using absolute paths:

```json
{
  "mcpServers": {
    "productshot": {
      "command": "node",
      "args": [
        "C:\\path\\to\\productshot\\mcp-app\\server.mjs",
        "--project",
        "C:\\path\\to\\productshot\\.director-projects\\mcp-demo"
      ]
    }
  }
}
```

This shows the common `mcpServers` format; VS Code's `.vscode/mcp.json` uses
`servers` instead. Use host-appropriate absolute paths on macOS/Linux. Trust and
enable the server in the host, then refresh tools or start a new session as
required. Ask the Agent to use ProductShot to inspect the project's source,
publish discovery and open `productshot_select_features` with recommended IDs.

### Host compatibility and confirmation

Ordinary MCP support does **not** imply MCP Apps support. The host must support
the `io.modelcontextprotocol/ui` extension and `text/html;profile=mcp-app`.
Layout and placement belong to the host, not ProductShot.

On confirmation, the App first saves through `tools/call`, then requests a user
message through `ui/message`. It checks the host's text-message capability and
reports rejection or transport failure separately from a successful save.
Notification retry does not repeat the save. If messaging is unavailable, the
App explicitly asks the user to continue in chat. A successful message request
means the host accepted it, not proof that an Agent generated a reply.
In the inspected VS Code 1.135 Agent Host path, `ui/message` fills the chat
composer rather than sending it: the user must press Send. That path also forwards
tool-result content without `structuredContent`, so the App accepts the same
validated view model from a JSON text block. Invalid/missing data remains an error;
the App never fabricates feature defaults to mask a transport failure.

Without Apps support, the tools return the capability list for explicit native
chat selection. The server never silently treats recommended defaults as consent.
Feature confirmation does not approve audience/storyboard or authorize product
writes, recording, paid generation or publishing.

`npm test` in `mcp-app` tests real stdio MCP and a browser running the official
SDK AppBridge in an isolated **test host**. It covers defaults, custom selections,
stale writes, safe text rendering, persistence, message delivery/rejection/retry,
unsupported messaging, and narrow layouts. It does **not** establish compatibility
or automatic Agent continuation in VS Code, Claude or any other production host.
Those require a separate live-host acceptance check.

## Earlier video prototype

This repository also includes the earlier Next.js + Remotion prototype in
`src/` and static design studies in `public/`. They are separate from the director
runner: a shared planning-to-recording pipeline is not implemented yet.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev -- --hostname 127.0.0.1 --port 3012
```

Configure your own model credentials locally if using AI storyboard generation.
The older prototype can analyze a site, edit scenes and render screenshot-based
videos. Screenshots are not live product recordings. Static workbench studies
use clearly labeled simulated data.

These are local development tools, not a hardened public rendering service.
Do not expose their backend or private projects on the internet.

## Validation

After installing the prototype's existing dependencies, run:

```powershell
node scripts\verify-director-runtime.cjs
```

The regression check uses an isolated temporary project and the existing
Puppeteer dependency. It covers stage gates, revisions, browser editing,
native-Agent-to-browser updates, review notes, access checks and
320-1440px layouts. It does not touch your project or call a model.

## Repository contents and privacy

Included: source code, Skill, original workspace artwork, configuration examples,
and regression checks.

Excluded: local projects and conversation histories, recordings, screenshots,
private speaker notes, presentation pages, credentials, dependency folders and
build/render output. Create your own project and product evidence locally.

Third-party packages and services retain their respective licenses and terms.
