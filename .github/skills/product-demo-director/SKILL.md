---
name: product-demo-director
description: Run a product-demo planning workflow from a URL or repository. Read product evidence, discuss capabilities and audience, save a scenario outline and detailed shots, and update the same local project shown in the browser.
---

# Product Demo Director

## Run this skill, do not just describe it

The current Agent is the director. Use its repository/browser tools to perform
the analysis and its question tool to discuss choices with the user.
The bundled Node runner persists **actual stage documents**, user feedback and
approval checkpoints; the browser displays that project, not canned demo data.

Read [the runnable workflow](./references/runtime.md) before starting.
Requires Node.js 20+; no dependency install, API key or extra model is needed.
All commands below refer to `scripts/director.mjs` inside this skill directory,
not the target product repository.

1. Introduce the four steps in the native Agent conversation. Ask only for a
   missing product URL or repo; reuse an existing project's source and decisions.
2. Initialize a private project folder outside `public/`. Start its viewer,
   verify the local URL, and open it in the host's in-app browser using the
   available browser tool. Keep the native conversation and this page side by
   side. If the host has no browser tool, give the local URL and state that
   limitation; do not pretend to have opened an in-app browser.
3. Inspect the authorized product, then write and publish a `discovery` JSON.
   Inspect the same browser page to verify the published result is visible.
4. Read the project again before each write. User edits and feedback may have
   changed its revision. Never overwrite a stale revision.
5. Confirm discovery, selected capabilities/audience, outline and storyboard as
   **separate** checkpoints. Publish a document before asking to approve it.
6. On each native user turn, run `read` before answering or editing. Browser
   changes may have invalidated approvals; use the newest document, not a stale
   copy from chat. Never require the user to copy a JSON file between panes.
7. Publish only the affected revision, verify it in the browser, and continue
   asking the next focused question in the native conversation. Process legacy
   open requests if present; resolve them only after the requested work is done.

### Conversation-led workspace

**The left side is Codex's own conversation. The right side is Codex's in-app
browser showing the project. They are not two panels inside our website.**
Use the current host Agent and its native question/choice tools for all
conversation. Do not build or open a second chatbot, feedback inbox, embedded
Codex clone, model API service, or transcript mirror in the generated webpage.
No additional model integration is needed: the host Agent is already executing
this Skill. Do not use the legacy `message`/`answer` commands for this workflow.

The browser has a Skill overview and four result tabs: **Features & Audience**, **Scenario &
Outline**, **Story & Shots**, **Preview & Review**. Discovery remains a separate
approval checkpoint inside the first tab, not an extra top-level page.

After understanding the product, offer one feature, several features, or the
whole product, and accept custom features. Then suggest target audiences based
on the chosen capabilities and accept free text. An option answer is not stage
approval: publish the combined selection and ask for confirmation separately.
Offer 2–3 scenario alternatives in native chat, each with a different ordered
outline, and accept custom input. Publish only the chosen draft outline.
Later story and review revisions can originate from either pane; read current
documents before every edit. Browser review notes never mean the video changed.

Do not install third-party illustration skills, switch to a mockup, generate
placeholder product footage or call paid services as part of starting this skill.
Do not publish future stages before the preceding decisions are approved.
The four result tabs are derived from five persisted stage documents (discovery
and selection share the first tab). Missing documents display waiting states,
not invented examples or a blank intake form the user must fill.

### User-facing introduction

Briefly explain: "Give me a product URL or Repo. I will understand it first,
help you select what to show and who it is for, propose a concrete scenario,
then refine every shot. You can discuss changes here or edit the saved project
on the right. A storyboard is not yet a recording."

Homepage illustration and navigation belong to the workspace shell. Never
inject them into a product screenshot, an outline, or a delivered video.
Read [shell and content boundaries](./references/shell-and-content.md) before
making UI or visual changes. Design changes must not create or silently replace
project content.

Help a non-video-expert decide what a product demo should prove. Do not ask the user to write a complete brief. Discover the product, offer concrete choices, discuss a draft, and hand an approved plan to the production workspace.

This skill assists pre-production through two checkpoints: an **outline** that
can be reviewed in Studio, and the **detailed shot plan** that must be approved
before production. It does not record, mutate the product, generate paid media,
or claim that ProductShot Studio has rendered a video.

## Required outcome

Produce:

1. A short description of the audience and demo intent.
2. Selected product capabilities with evidence and uncertainty.
3. One approved proof scenario.
4. A story outline and shot contracts.
5. Locked user corrections and must-keep requirements.
6. A persisted, approved storyboard in the local director project, plus an
   optional production handoff matching [the handoff contract](./references/handoff-contract.md).

Studio can open at the outline stage to compare proposals, add/remove/reorder
steps, write a custom scenario and save a selected outline. Do not start
production merely because Studio is open or the outline is approved.

## Interaction principles

- Start with what the user can provide: a product link, repository, documentation, existing recording, or a combination.
- Read the conversation before asking. Do not ask again for an audience, feature, language, or constraint already provided.
- Ask **one focused question at a time**. Prefer 2–4 concrete choices and include a recommendation.
- Do not force the user to classify the request as “one feature”, “several new features”, or “the whole product”. Infer a working scope from selected capabilities and revise it as the conversation develops.
- Do not ask “What do you want to communicate?” before investigating. First show what appears demonstrable, then ask the user to choose or correct it.
- Treat “I just want to show it” as a valid starting point. Offer proof scenarios instead of asking the user to invent one.
- Every proposal is editable. Say what evidence supports it, what is uncertain, and what would require product access or confirmation.
- Record corrections such as “start from an empty table” as locked constraints. Later revisions must preserve them unless the user explicitly changes them.

## Phase 1: establish the minimum input

Ask only for the missing minimum:

1. Product source:
   - Accessible product URL
   - Repository or local checkout
   - Existing product footage
   - A combination
2. Access and safety boundaries when needed to inspect the supplied source:
   - Whether login is required
   - Sensitive information that must not appear

Do not request a project name, full story, shot list, audience selection, or “must keep” list before understanding the product. Retain any audience or feature direction the user volunteers. Ask about a test environment and product writes only before execution that needs them.

## Phase 2: understand the product before discussing scope

Use authorized sources only.

For a repository:

- Read the README, relevant feature entry points, routes, tests, and recent changes.
- Run only existing safe inspection commands unless execution is authorized.
- Distinguish implemented behavior from documentation, mock data, flags, and planned work.

For a website:

- Inspect the visible product and available controls.
- Do not treat landing-page copy as proof of an internal workflow.
- Stop and report blocked login, missing permissions, or failed loading. Do not invent a replacement interface.

For each candidate capability, record:

- Capability name
- What the user can visibly do
- What result proves it worked
- Evidence source
- Confidence: verified, documented, or needs confirmation
- Recording constraints

Then present 3–6 concise capability cards. Ask which are important **for this demo**, and offer:

- Select several
- Add a capability not discovered
- Focus on one
- Ask the Agent to recommend

Always accept free-text additions or corrections alongside the choices. If the user does not know what to show, recommend a small related set and explain why, then confirm rather than silently selecting it.

After the demonstration needs are clear, ask who this video is for, unless already known. Suggest audiences based on the product and selected capabilities, while accepting a free-text description such as "partners who know the product but have not seen these new features." Offer "not decided" and help narrow it down. The demo audience is not necessarily the product's end user.

Do not decide the story from the first page visited. Confirm both demonstration needs and audience before generating a story.

## Phase 3: offer proof scenarios

After demonstration needs and audience are confirmed, propose 2–3 ways to prove the selected capabilities for that audience. The Agent supplies the initial story ideas; the user need not invent a business scenario. Use these patterns as options, not mandatory templates:

### End-to-end task

One task links several capabilities.

Example:

> Start from an empty inventory structure → add operating data → inspect a dashboard → submit a form → verify the resulting state.

Best when the value comes from connected stages.

### Before and after

Show the original problem, perform a focused product workflow, then show the improved state.

Best when the product creates a visible transformation.

### Focused capability showcase

Use one consistent example dataset and show several related new capabilities without inventing a larger business story.

Best for release updates, internal reviews, or several small related features.

### User-provided example

Accept an incomplete idea. Help extract:

- Actor
- Starting state
- Task
- Visible result
- Why the audience should care

For each proposed scenario, explain:

- Which selected capabilities it covers
- What real product state is needed
- What would be recorded
- What might need an explanation shot
- The main trade-off

Ask the user to choose, combine, or reject them.

Separate **presentation style** from **the concrete example**. Even a focused
feature showcase needs a coherent sample context; it does not mean unrelated
screens or arbitrary data. After the user chooses a connected task or a feature
showcase, suggest 2–3 product-supported examples, explain their capability
coverage, and accept a custom example. For Biz Table, possible candidates might
be inventory, project tracking, or feedback collection, but only propose them
when the selected capabilities support the task. Do not automatically reuse
inventory from an earlier film.

## Phase 4: discuss the story as a draft

Create a short outline before detailed shots:

1. Starting situation
2. Trigger or user request
3. Product actions
4. Visible result
5. Closing takeaway

Show the draft and invite natural feedback:

> “This is not final. Tell me what feels wrong—for example, ‘the first screen should be an empty table’, ‘do not use a character story’, or ‘keep the successful submission visible longer’.”

Do not turn this into another form.

Convert feedback into structured constraints:

- `locked`: must remain unchanged
- `preferred`: use unless it hurts clarity
- `open`: still undecided
- `rejected`: do not reuse

Re-present only the affected part and the updated full outline. Do not silently drop earlier corrections.

The default product flow is:

**Confirm source → inspect capabilities → select/add features → confirm audience
→ propose alternative outlines → edit and save an outline → detail the shots.**

The Agent proposes alternatives in the conversation; publish the selected
outline to the UI and keep prior versions in project history. The current
runtime editor does not automatically generate proposals. Keep alternatives distinct from multiple scenarios
inside one selected outline. A confirmed outline describes each scenario and its
ordered steps, not seconds or camera settings. The user may add a step, remove a
step, reorder it, edit a scenario, or request a replacement outline. Preserve the
previous choice before replacement. Adding an unknown capability makes it
unverified, not implemented.

Ask for outline approval separately. After it is saved, use Studio's "Story and
shots" page or the ongoing Agent conversation to refine the detailed direction.

## Phase 5: create shot contracts

The Agent drafts a complete shooting plan, then the user corrects it in natural
language or on editable shot cards. Do not ask the user to author each field.
Start with one representative shot to agree on detail and camera style, then
apply that grammar to the remaining shots. Read
[the detailed shot guide](./references/shot-direction.md).

Each shot must specify:

| Field | Meaning |
|---|---|
| Purpose | What the audience should understand |
| Before | Visible starting state |
| Action | Actual user, Agent, or explanation action |
| After | Visible result that proves completion |
| Focus | Where the viewer should look |
| Evidence | Product state or source supporting the claim |
| Source type | Real recording, explanation, generated media, or mixed |
| Sound | Narration intent, product sound, pause, or no audio |
| Transition | How the previous result leads into this shot |
| Must keep | Approved details that later edits cannot remove |
| Ordered beats | Establish → action → attention cue → verified result → handoff |
| Highlight | Exact semantic target, triggering event, treatment, and removal event |
| Camera | Start framing, target to push toward, what stays visible, pull-back and end framing |
| Motion | What moves, from where to where, relative order, and whether it is product behavior or a presentation overlay |
| Hold | What must become ready and readable before continuing; not a guessed number of seconds |
| Verification | Observable success, missing-target behavior, and product truth checks |

Use the `direction` object in the handoff contract for these editable details.
Keep it alongside evidence, source type and must-keep requirements; do not
flatten the contract into a title, duration and zoom multiplier.

Timing is **derived, not a user intake requirement**. Plan against semantic
events first: the request is sent, a panel appears, a query finishes, a sentence
ends, or the viewer has inspected a result. The recorder later measures actual
durations and produces a synchronized cue sheet. An estimated duration is an
optional production hint, never evidence of an observed response time. If the
user has an overall time limit, discuss the trade-off instead of removing proof
or speeding up every action.

Rules:

- For product claims, prefer real interactions and visible results.
- A generated or reconstructed interface must not masquerade as a real product operation.
- Keep cause before effect: empty state before data, request before generated chart, form input before success.
- A process should continue moving while it is described; a result should remain stable long enough to read.
- Do not use zoom, motion, or transitions merely to fill narration time.
- If a shot contains an Agent interaction, preserve: composer → send → user message → working state → product change → result.
- Do not invent selectors or pixel coordinates from repository documentation.
  Name semantic targets during planning, and resolve and calibrate them in an
  authorized rehearsal. A missing target is a blocker, not permission to draw a
  fake result.
- A user correction must update the affected direction fields, preserve stable
  shot IDs and other approved shots, and invalidate that plan revision's
  approval. Present the change before requesting approval again.

## Phase 6: approval gate

Before approval, summarize:

- Audience
- Selected capabilities
- Scenario
- Story outline
- Shot list
- Detailed direction for every shot, including camera, highlighting, action
  order, entry/exit continuity and result verification
- Real vs explanation/generated sources
- Required product state and permissions
- Open questions
- Locked constraints

Ask for explicit approval of the story and shot plan.

Approval does **not** authorize:

- Product writes
- Repeated submissions
- Login or credential reuse
- Paid generation
- Third-party uploads
- Public publishing

Those permissions belong to production and must be requested separately when needed.

## Phase 7: persist the approved project; hand off for production

After approval:

1. Use the runner to publish `storyboard` and record the user's explicit
   approval. Keep all earlier documents and feedback in this same project.
2. Exclude credentials, cookies, tokens, private browser profiles, and raw repository content.
3. Include evidence references, not copied secrets.
4. If an external production adapter requests `productshot-plan.json`, write
   that additional versioned handoff after approval. Do not replace the runtime
   project's state with that legacy export shape.
5. Explain the actual execution boundary: capture, audio, rendering and playback
   adapters are not connected to this local planning runner. Execute them only
   as separately authorized work with available tools, then publish real file
   paths, checksums and validation into `review`.
6. Never simulate production progress or claim a movie exists when only a
   storyboard has been approved.

For the earlier outline checkpoint, publish the `outline` stage using
`runtime.md`. Its document is a list of scenarios and business steps.
The earlier `productshot-outline` and `productshot-plan` standalone formats
remain interoperability references for the design mockup, not the runner's
canonical stage shapes. Do not switch to a preset mockup for a real Skill run.

The production workspace may return targeted questions. Reopen only the affected decision, then create a new plan revision. Never overwrite the approved plan without recording the revision.

## Example conversation

**User:** “I made several new features and want to show the team.”

**Director:** “Send me the product link or repository first. You do not need to decide whether this counts as one feature or the whole product.”

After inspection:

**Director:** “I found four demonstrable moments: empty-structure generation, field recommendations, dashboard creation, and form submission. Which matter for this review? I recommend the first three if the audience is leadership.”

After selection:

**Director:** “Two viable examples:  
1. Build a small inventory workflow from an empty table, then show the dashboard. This proves the features are connected.  
2. Use one existing dataset and quickly show the three new capabilities. This is shorter and avoids inventing a business story.  
Which direction is closer?”

After a draft:

**User:** “The first screen must be an empty table, and I want the form submission to succeed before the ending.”

Store both as locked constraints and revise the shots before asking for approval.

## Failure modes to avoid

- A long intake form before product inspection
- Asking the user to invent a complete business story
- Treating the first discovered workflow as the final story
- Calling a capability verified because it appears in marketing copy
- Starting product writes or recording before story approval
- Losing previous corrections during a later revision
- Calling the latest render the approved final version
- Starting production from an unapproved or incomplete shot plan (opening
  Studio to review a draft outline is allowed)
