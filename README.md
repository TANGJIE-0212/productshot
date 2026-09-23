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

The left pane holds real Agent messages, selectable questions and user replies.
The right pane holds editable project documents. Both use the same versioned
project, with explicit approvals, stale-write rejection and revision history.
Changing an approved document invalidates affected approvals without deleting
downstream drafts.

### What is not connected yet

- The browser does **not** automatically invoke or wake Codex or another Agent.
  After submitting a reply, ask your current Agent to read the project and
  continue. It can publish its next message and document through the CLI.
- This director runner does **not** record the product, generate audio, render
  MP4s, or provide an embedded media player. Review accepts existing files with
  verified checksums; review notes do not modify those files.
- Story approval does not authorize product writes, paid generation, uploads,
  or public publishing. Those need separate authorization.

## Run the Skill

Requires Node.js 20+. The director runner itself needs no dependency install,
model API key or hosted backend.

Load `.github/skills/product-demo-director/SKILL.md` in your Agent, then give it
the product URL or repository. For a manual local workspace:

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
evidence-backed documents and questions.

See [runtime commands and JSON shapes](.github/skills/product-demo-director/references/runtime.md)
for publishing documents, conversation questions, answers and approvals.
See [shell/content boundaries](.github/skills/product-demo-director/references/shell-and-content.md)
for the visual design rules. Original shell illustrations are not video assets.

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
conversation answers, stale questions, review notes, access checks and
320-1440px layouts. It does not touch your project or call a model.

## Repository contents and privacy

Included: source code, Skill, original workspace artwork, configuration examples,
and regression checks.

Excluded: local projects and conversation histories, recordings, screenshots,
private speaker notes, presentation pages, credentials, dependency folders and
build/render output. Create your own project and product evidence locally.

Third-party packages and services retain their respective licenses and terms.
