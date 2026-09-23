# ProductShot

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
and intelligent choices happen in native chat. Browser edits and Agent writes
use the same revision-checked private project. Do not invent evidence or treat
storyboard approval as permission to record, spend money or publish.

## Development

- Run `node scripts/verify-director-runtime.cjs` for director changes; it uses
  the existing Puppeteer dependency and isolated temporary data.
- Keep `.director-projects/`, captures, recordings and credentials private.
- Preserve existing project formats and history when changing the shell.
- The earlier Next.js/Remotion prototype is separate from the director runner.
