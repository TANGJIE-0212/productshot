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

The browser overview introduces the Skill. Four result tabs show features and
audience, scenario and outline, story and shots, and preview/review. Discussion
starts in native chat with a single-choice "whole product / specific features".
Whole product skips feature selection. Specific features opens browser
checkboxes plus custom input. The Agent next supplies product-informed audience
options and free text in that same browser. Users may edit any displayed field,
submit, and say "submitted" in native chat; the Agent then reads and continues.
Do not promise automatic wake-up, add a discovery approval question, or replace
browser multiselect with a long native single-choice list. Browser edits and Agent writes
use the same revision-checked private project. Do not invent evidence or treat
storyboard approval as permission to record, spend money or publish.

## Development

- Run `node scripts/verify-director-runtime.cjs` for director changes; it uses
  the existing Puppeteer dependency and isolated temporary data.
- Keep `.director-projects/`, captures, recordings and credentials private.
- Preserve existing project formats and history when changing the shell.
- The earlier Next.js/Remotion prototype is separate from the director runner.
