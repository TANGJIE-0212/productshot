# Runnable director workflow

## What actually runs

The Agent runs the Skill using its existing tools. A bundled Node CLI manages
files and a private, loopback-only browser view. There is no second model,
automatic chat responder, hosted backend, Puppeteer dependency, or fake output.

The host's native conversation is the **only chat UI**. Open the local viewer in
the host's in-app browser; the webpage contains only the Skill overview and
editable results. The project does not embed Codex or replace its interface.
For Codex, the repository includes a discoverable entry at
`.agents/skills/product-demo-director/SKILL.md`; it loads the canonical workflow
here rather than maintaining a second copy.

The runner is portable with the whole skill folder:

```text
product-demo-director/
  SKILL.md
  scripts/director.mjs
  runtime/index.html
  runtime/app.js
  runtime/style.css
  references/
```

## Start a project (PowerShell)

Use the actual skill path. Keep all unpublished product evidence and project
state outside the website's `public` folder.

```powershell
$tool = 'C:\path\to\product-demo-director\scripts\director.mjs'
$project = 'C:\private-projects\my-product-demo'
node $tool init --project $project --name 'My product demo' --source 'C:\path\to\product-repo'
node $tool read --project $project
node $tool serve --project $project --port 3014
```

`serve` is long-lived. Start it using the host's detached-process facility if
available. Verify that its `/` returns HTTP 200. Its JSON output contains a
local URL with a random access token in the fragment; open that full URL. The
browser keeps the token in session storage and removes it from the address bar.
Do not upload this URL or put it in a public share page. Stop by terminating
only that known process/session.

Use the host browser tool to open the full URL, not a shell command launching
an unrelated external browser. Reuse that page for the rest of the conversation.
The empty project's homepage introduces the four steps. Optional `?stage=home`,
`discovery`, `selection`, `outline`, `storyboard`, or `review` opens a specific
view (put the query before the access fragment). Subsequent Agent publications
or approvals focus the affected stage automatically, unless the user has
unsaved browser edits. The browser never discards an unsaved draft to follow
the Agent. Do not reload the page to force synchronization.

### Native conversation loop

1. Introduce the Skill in chat; obtain only a missing URL/repo.
2. Initialize or resume the same private project; open its viewer.
3. Inspect real product evidence and publish discovery.
4. Use native questions for capabilities, scope and then audience. Accept
   free-text additions. Publish selection once those answers are available.
5. Confirm the published document in native chat (or read its browser approval).
   Record explicit native approval with `approve`.
6. Propose several scenarios and ordered outlines in chat. Publish the chosen
   outline; discuss and approve it before drafting detailed shots.
7. Repeat the same publish/discuss/edit/approve loop for storyboard and review.

Before **every native response**, read the current project. Saved browser edits
are already the current document: do not ask the user to resend them or post
them to a second chat. After each write, inspect the result page with the host
browser tool and continue in native chat. Browser polling is not a background
model; a user who is only editing the webpage returns to native chat to continue
the conversation. No additional model API integration is required.

The server binds **127.0.0.1**, not all interfaces. Requests require the current
session token and reject cross-origin and cross-site requests. This is a local
tool, not a production-authenticated hosted service.

## State and write protocol

- `project.json`: current version, source, stage documents, approvals, feedback.
- `history/000000.json`, etc.: snapshots of every successful mutation.
- `.write-lock`: a transient cross-process write lock.
- Revision checks prevent the Agent and browser overwriting each other's work.
- Changing a stage invalidates its approval and all later approvals.
- Later documents remain as stale drafts for revision, rather than disappearing.
- Only approving an actual review document sets `release`.
- A crashed writer may leave `.write-lock`. Verify no writer is running before
  manually removing it; never automatically steal locks.

Use `read` before every mutation. Never edit `project.json` directly. The Agent
may write an input JSON using its normal file-edit tools, then publish it:

```powershell
node $tool publish --project $project --revision 0 --stage discovery --input 'C:\private-projects\discovery.json'
node $tool read --project $project
```

Approval is a separate explicit operation. Only after the user approved:

```powershell
node $tool approve --project $project --revision 1 --stage discovery --note 'User confirmed this understanding in the current conversation.'
```

The UI also offers explicit approval buttons. Its approval has the same effect.
Do not infer approval from “continue researching,” “make the skill,” a page being
opened, or a previous project's authorization.

## Stage input shapes

Publish the stage document directly, not a `{data: ...}` wrapper.

### 1. `discovery`

```json
{
  "summary": "What the product is, based on the sources actually read.",
  "sourceRevision": "Local commit hash or dated website observation",
  "capabilities": [
    {
      "id": "forms",
      "title": "Collect structured input",
      "proof": "The viewer sees a form submission and its resulting record.",
      "confidence": "source-verified",
      "evidence": ["packages/editor/src/forms.tsx:42"],
      "limitations": "Source inspected; runtime, login and permissions not yet tested."
    }
  ]
}
```

Allowed confidence: `source-verified`, `runtime-verified`, `documented`,
`needs-confirmation`. Tests existing in a repo are source evidence, not a test
pass or independent runtime verification.

### 2. `selection`

Only after discovery is approved:

```json
{
  "capabilityIds": ["forms"],
  "additional": "",
  "scope": "related",
  "audience": "Partners who know the product but have not seen the new features."
}
```

Scope: `single`, `related`, `whole`. Users may select one/many, add free text,
and describe the audience. Additional capabilities remain unverified until
researched. Do not reject an incomplete starting idea merely for being vague;
help make it specific before final confirmation.

### 3. `outline`

Only after selection is approved. Propose alternatives in the conversation
first, then publish the chosen draft. No screenshots, zoom parameters or seconds:

```json
{
  "scenarios": [
    {
      "id": "market",
      "title": "Small supermarket inventory",
      "context": "One authorized test business and dataset.",
      "outcome": "Show how the selected capabilities work on the same data.",
      "steps": [
        {"id": "build", "title": "Build an empty structure", "purpose": "Prepare connected tables."},
        {"id": "collect", "title": "Collect an order", "purpose": "Show a new order entering the workflow."}
      ]
    }
  ]
}
```

Each scenario has 1–24 steps; total at most 24. IDs must be unique across all
steps. Right-side edits can rename, add, remove and reorder steps. Changes
invalidate any existing shot approval, not silently regenerate shots.

### 4. `storyboard`

Only after outline approval:

```json
{
  "shots": [
    {
      "id": "collect-open",
      "stepId": "collect",
      "title": "Open the empty order form",
      "purpose": "Orient the viewer before entering data.",
      "sourceType": "real-recording",
      "evidence": ["Verified product route or source reference"],
      "direction": {
        "before": "The orders workspace is visible.",
        "actions": "Open the form and wait for its fields.",
        "highlight": "Briefly outline the form title after it appears.",
        "camera": "Start wide, gently push to the form while preserving field labels.",
        "motion": "Only the camera and an attention outline are presentation layers.",
        "after": "The empty form is readable; no data has been submitted.",
        "hold": "Wait for the actual fields, then allow reading.",
        "transition": "Keep this form for the next input shot.",
        "verify": "The expected fields are present and empty.",
        "mustKeep": "Do not show success or filled data before the relevant action."
      }
    }
  ]
}
```

This is a single-shot example, not a complete storyboard for the outline above.
The actual document must cover **every** outline step. A step can have multiple
shots (open → fill → confirm). IDs use ASCII letters/digits/underscore/hyphen.
`sourceType`: `real-recording`, `explanation`, `generated-media`, `mixed`.
All ten direction fields are required; no estimated seconds are required.

### 5. `review`

Only after storyboard approval and actual separate production/validation:

```json
{
  "summary": "What was actually produced and reviewed.",
  "limitations": "Checks not performed, or remaining issues.",
  "artifacts": [
    {
      "label": "Candidate video",
      "path": "C:\\private-output\\candidate.mp4",
      "sha256": "actual SHA-256 of the file",
      "validation": "Actual probe results and visual/audio review, with limitations."
    }
  ]
}
```

The CLI verifies file existence and checksum; it does not prove product facts,
visual quality or audio quality. No automated recording/rendering adapter or
embedded media player is connected to this runner yet. Do not mark review
complete without separately producing and inspecting the artifact.

## Feedback loop

### Legacy conversation records (compatibility only)

Do not use this protocol for new Skill runs. Questions and answers belong in
the host's native conversation, not in the webpage. These CLI commands remain
available so old project records are readable; the current webpage does not
display a chat, accept `answer`, or provide a feedback composer.

Use `message --input <json>` with the current `--project` and `--revision`.
Plain Agent messages use `kind: "message"` and `choices: []`. Questions use
`single` or `multiple`; users may always provide free text instead of an option.

```json
{
  "stage": "selection",
  "kind": "single",
  "text": "Who should this demo help?",
  "choices": [
    {"id": "builders", "label": "App builders", "description": "Focus on how the selected capabilities fit their daily work."},
    {"id": "reviewers", "label": "Internal reviewers", "description": "Focus on observable product behavior and limitations."}
  ]
}
```

These are schema examples, not mandatory audience suggestions. Propose relevant
options from the actual product and conversation. Outline alternatives go in
question choices with each alternative's ordered steps in `description`.

Legacy clients can post `answer`; the CLI also accepts `answer --input <json>`:

```json
{"questionId": "persisted-message-uuid", "choiceIds": ["builders"], "text": ""}
```

Answers create an open request and a user message, not an approval or a generated
document. Read the request, publish the affected draft, then resolve the request.
Only one choice question remains active. New questions supersede old questions;
document changes or approvals invalidate answers to stale questions. Replies and
unsubmitted answers are displayed separately from the result document.

The first result tab includes discovery and selection. The remaining tabs are
outline, storyboard and review. Right-side custom scenarios and step edits save
to `outline`; review edits save optional `notes` (up to 6000 characters). Browser
review edits cannot alter file paths, checksums or production validation.
Changing review notes invalidates review approval and clears `release`, just as
changing any upstream document does. Existing projects need no migration.

Legacy feedback is persisted with stage, originating revision, status and ID.
For new runs use the native conversation and direct document edits. If an old
project has open requests, continue processing them:

1. `read` the project and open requests.
2. Interpret the request with current source evidence and prior constraints.
3. Discuss material story changes before publishing.
4. Publish the affected document using the current revision.
5. Resolve the request with an explicit explanation:

```powershell
node $tool resolve --project $project --revision 5 --id '<request UUID>' --note 'Updated the empty starting state; other shots preserved. Waiting for user reapproval.'
```

If right-side editing invalidates a document, read it before using any earlier
conversation copy. The viewer polls changes, but preserves unsaved edits and
warns about newer revisions. Download the unsaved draft before reloading.

The runtime cannot prove a CLI approval corresponds to a human statement;
that responsibility remains with the Agent following this Skill.
