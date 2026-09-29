# ProductShot

## Agreed direction

Read [the interaction design](docs/productshot-interaction-design.md) for the
2026-09-23 decisions and implementation gaps before extending the workflow.
It specifies native MCP Elicitation for intake decisions and a web workspace
for visual editing. The browser sequence below describes the legacy runner,
not the target intake UX. Do not claim the design is already fully implemented.

## Product boundary

The host Agent (for example Codex) owns the native conversation and runs the
Skill. Its in-app browser shows ProductShot's editable results. **Do not add a
chatbot, chat sidebar, feedback inbox or model API bridge to the webpage.**
The requested left/right layout belongs to the host application, not our HTML.

For product-demo requests, load
`.agents/skills/product-demo-director/SKILL.md`. The canonical workflow, runner
and browser assets live under `.github/skills/product-demo-director/`.
The thin Codex entry point must not duplicate the workflow.

Design work uses exactly two specialist skills:
`product-scenario-design` for goal/user/pain-driven use cases and coarse outlines,
and `recording-script-design` for executable recording plans with exact inputs,
capture beats, editing, camera/highlights, narration, copy and verification.
Their canonical files are in `.github/skills/`; `.agents/skills/` contains thin
discovery entries. A skill file is not an automatic UI-to-Agent integration.

The current flow is product/goal, features, recording script, results. Default
to direct-feature presentation; scene proposals are optional under feature selection.
Do not ask whole/specific scope or duplicate audience questions. Legacy browser
forms and the runner retain their existing document formats and approval gates.
Use native elicitation when available, otherwise explicit chat/browser decisions.
Do not promise automatic wake-up, fabricate approvals or treat storyboard approval
as recording, mutation, spending or publishing permission.

## Development

- Run `node scripts/verify-director-runtime.cjs` for director changes; it uses
  the existing Puppeteer dependency and isolated temporary data.
- Keep `.director-projects/`, captures, recordings and credentials private.
- Preserve existing project formats and history when changing the shell.
- The earlier Next.js/Remotion prototype is separate from the director runner.
