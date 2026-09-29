---
name: recording-script-design
description: Turn product capabilities into unified storyboards with visible reveals, exact recording actions and audience-facing explanation per scene. Plan capture, framing, editing and verification without generic slogans, narrated test procedures or placeholder footage.
---

# Recording Script Design

Write a script that a recorder can execute without inventing the main actions.
The Agent proposes the details; the user corrects them. Do not deliver a form
full of "open the feature," "show success," or "needs rehearsal."

**The core is directing the recording with the tools actually available.**
Decide what the viewer should notice, how zoom/highlight/framing will make it
clear, and which captured time should not survive into the final cut. Merely
listing clicks and filling a dozen fields is not the intended capability.

This skill acts as a **recording director**: it designs exactly what to capture,
then can rehearse, record, edit and verify using available tools when the user
requests and authorizes execution. A scenario outline only states what the first
and second sections explain. In plan-only mode, never claim a video exists.

## Input and routing

Reuse:

- Product evidence and inspected version/deployment.
- Raw video goal, inferred video audience and optional duration.
- Stable IDs of selected and custom features.
- Presentation mode and existing corrections.
- For scenario mode: the selected scenario, its business steps and constraints.
- For feature mode: feature order; no scenario selection is required.
- Any authorized test environment and existing media, with provenance.

If the user says "LT project review, about one minute," propose a useful script
from that. Do not demand exact lines or shot timings from them. Do not repeat
intake already answered. Ask only about a material missing input.

Read the latest project before editing existing plans. Preserve stable section
and beat IDs, user-written lines, rejected ideas and locked constraints.

## 0. Choose a capture/edit path before specifying effects

First read the scenario handoff's product thesis, must-show capabilities,
capability progression and user corrections. For direct-feature mode, derive
these from the existing product evidence without forcing a scenario questionnaire.
Name the intended takeaway of the film. Do not let recorder availability or old
footage choose what the product is about.

Read [recording tools and capability mapping](references/recording-tools.md).
Use OpenScreen or an equivalent verified recorder/editor where suitable;
consider browser-recording skills for browser-only demos. Do not assume tools
are installed, that upstream documentation matches the installed version, or
that a desktop GUI feature has a callable API.

Establish a short **tool profile**:

- Actual version/platform and capture scope: browser, app window, full display.
- Which component records, controls the product, edits effects and exports.
- Available zoom/pan, cursor, click emphasis, annotation/highlight, crop/trim,
  speed changes, audio and caption controls.
- For each required effect: native implementation, verified post-processing,
  manual edit step, or unresolved blocker. Say which one is intended.

Inspect local help/source safely where available; do not install a package,
start desktop recording or invoke an AI editing service just to plan.
An unverified tool profile may support a proposed script, but not a claim that
the whole script is automatically executable today.

Keep two linked plans: **capture what really happens**, then **compose what
the audience should see**. Record clean source plus events where practical,
and add highlights/crops in a non-destructive edit. A zoom baked into capture
cannot later reveal cropped-off context; a recorder is not a product automation
driver, and an editor is not evidence an operation succeeded.

## 1. Establish a coherent recording context

For scenario mode, carry the same actors, objects and data through its steps.
For feature mode, group the output by feature title and use a small common
example where practical; do not insert an extra fictional business-story gate.

Use the product's real interaction surface:

- Web/desktop UI: real screens and named controls.
- CLI/devtool: actual terminal commands, working directory and visible output.
- API: an authorized client/terminal, exact request and response assertion.
- Editor/creative tool: actual document/timeline and resulting export.

Inspect available source/UI to choose entry points, supported parameters and
results. Never invent a natural-language input box inside a product that instead
uses an external Agent. For an Agent workflow, name both surfaces and whether
they should be recorded together or as separate captures.

Before selecting or reusing footage, declare the film type:
`feature-introduction` or `scenario-led`. Read the story argument and translate
it into a **story-to-footage contract**. Existing media is candidate evidence;
it does not choose the story, section order or claim.

For every main section, define why the action happens now, the verbatim cause,
the required changed object, exact rows/columns/relationships/widgets/fields,
the reveal and highlight, a measured readable window, continuity into the next
section, and the next task-driven motivation. Do not start capture while one of
these is missing.

Plan with synthetic, consistent sample data. State what is prepared **before**
recording and what is created **during** it. Pre-existing output cannot be hidden
and revealed as if it were freshly generated.

## 2. Draft the recording, not generic directions

For each feature section or scenario step supply:

Start with a compact **capability beat**: what the viewer wants to do, the exact
capability being introduced, the product's mechanism, the visible before/change/
after, and what the viewer should understand afterward. Then write the execution
detail below. Both belong to the same storyboard scene.

1. **Initial state**: actual page/screen/file, relevant data and what is absent.
2. **Exact input**: verbatim prompt, command, query, form values or file content.
3. **Ordered operations**: actor, surface, target control and action.
4. **Wait condition**: observable completion/failure, not a guessed sleep.
5. **End screen**: the specific object, fields, counts or artifact to show.
6. **Editing**: what stays, what may be trimmed, and when a wait needs labeling.
7. **Highlight**: semantic target, trigger, appearance and removal.
8. **Framing**: establish -> push/reframe -> hold -> pull back/end; context that
   must stay visible.
9. **Voice**: actual proposed narration, not "explain feature value."
10. **Screen copy**: actual words plus appearance/removal events, or `none`.
11. **Verification**: assertion tied to this operation and response to failure.
12. **Continuity**: where the next section starts and what carries forward.

Write the viewer's line alongside that scene, not by summarizing its click log.
Each must-show capability needs an identifiable reveal event and an audience
line that explains that capability. Supporting shots may breathe without speech.
The UI may group operator details behind expansion, but should not split the
scene's explanation into a second user-maintained script workflow.

Use **ordered capture beats** to link these details in time. A long paragraph
of unrelated camera instructions is not enough. At minimum: establish, input,
execute, verify/reveal, transition. Split a beat only when the action, surface,
focus or causal state changes, not simply to create more "shots."

See [the recording contract](references/contract.md) and
[worked recording examples](references/examples.md).

### Precision without fabrication

Bad:
> Initial: feature entry, not rehearsed. Action: run a verifiable operation.
> After: show a real result. Voice: explain this capability.

Good:
> Initial: product homepage, empty test workspace. In the connected Agent send
> "Create a Requests table with Title, Priority and Status; add no records."
> Keep the sent message and start of execution; after completion open the new
> table, show the three headers and zero records. Outline Priority only after
> it renders. Say "Describe the structure once; the Agent creates the table."

The exact prompt is a **proposed input**, not a claim the product will execute
it correctly. Record access, control availability or unverified dependencies in
`readiness`; do not replace the entire design with that warning.

If a feature is unknown, provide the known intent and a precise missing-info
question; mark the section `blocked`. Do not manufacture menu labels, commands,
selectors, results or fake footage to make the plan look complete.

## 3. Preserve causality and product truth

- Request before execution, execution before visible result.
- Agent interactions keep composer -> send -> sent message -> working state ->
  product change -> result. A typed mock chat is not an Agent recording.
- Form input precedes submission; success precedes readback.
- Read back the same record/file/task, not an unrelated prepared item.
- Distinguish application motion, camera movement and editorial overlays.
- Never replace a failed operation with an illustration of success.
- Source tests establish implementation evidence, not proof a recording ran.
- Exact selectors/coordinates are resolved in authorized rehearsal. Before then,
  use semantic targets such as "Submit in the request form," not invented CSS.

## 3a. Direct attention using recording capabilities

For every beat, choose **one primary visual focus**: where should the viewer
look and what should they learn? Then choose only the effects that help.

| Recording situation | Planned treatment |
| --- | --- |
| New page or feature | Begin wide enough to locate it; do not start inside an unrecognizable crop |
| Small prompt, field or control | Push toward the semantic target, retaining its label and relevant action control |
| Click or submission | Cursor travels to the real target; optional single click emphasis, not ripples on every action |
| New result | Wait for real data, settle the framing, then highlight the result rather than the whole page |
| Comparison | Show source and result together or use a clear sequential cut; preserve object identity |
| Move to next feature | Remove highlight and pull back/reframe to establish the next context |

Each zoom must state start frame, focus region, required surrounding context,
entry event, motion/easing intent, hold gate and end frame. A numeric zoom is
optional until target bounds and export dimensions are known. After rehearsal,
resolve it to the selected tool's coordinates/scale and check readability.

Each highlight must state target, trigger, style and removal event. Example:
"After the table loads and camera settles, outline the Priority header in a
single accent color; remove it before opening the dropdown." Do not replace
this with "add highlight." Use an arrow/callout if the tool supports it and it
is clearer; `none` is a deliberate valid choice.

Avoid competing movement: normally finish the push-in before highlighting or
introducing copy. Keep captions clear of labels and controls. Do not follow
incidental cursor jitter with auto-zoom; inspect and correct auto-generated zooms.
Preserve the app layout: editorial enlargement/cropping is different from
changing browser zoom, which can reflow the UI and invalidate interaction targets.

## 4. Plan pacing and sound intelligently

**Actions lead; narration accompanies them.** The cut should show the user
doing a coherent task, not four stable result screens held under long narration.
Start writing voice after locating each sentence's corresponding visible action.
If the sentence outlasts that action, shorten/rewrite the sentence, carry it
over the next logically related action, or leave it out.

Do not use `tpad`, cloned last frames, screenshot loops or stretched result
holds merely to reach a duration target or finish voiceover. A specific freeze
used to inspect a detail must be deliberate, justified and disclosed in the
edit plan; it is not the default. A short result-reading pause remains useful.
Do not replace static content with pointless mouse motion to pass a motion test.

Preserve the cause and result even when the process is long:

- Keep enough of a request to read it, the send action and execution onset.
- Cut uneventful waiting after onset; show the actual completion.
- Mark a shortened wait where omission could imply instant performance.
- Do not silently compress business time or make a false speed claim.
- Hold results briefly to read the essential labels; narration must fit that
  purposeful hold, rather than make the hold arbitrarily longer.
- Do not zoom just to fill time; zoom follows the viewer's attention.

Classify every captured span as **keep**, **cut**, **speed-up**, or **hold**.
For cuts, name the events on both sides, not just "remove pauses":

- Keep the completed prompt, Send and execution onset.
- Keep the action itself visible: typing, opening a control, choosing an option,
  dragging, submitting, editing or exporting. Direct backend calls with only the
  final webpage shown do not communicate how the user operated the product.
  If the Agent/CLI is part of the selling point, record the actual Agent/terminal
  surface or explicitly narrow the claim; never replace it with a mock chat.
- Cut from `working_state_established` to `creation_completed`, excluding either
  event itself; retain error/warning information for diagnosis.
- Keep opening the actual created object and verifying its result.
- Use speed-up only when seeing a long process still teaches something; do not
  accelerate text the viewer needs to read. A static spinner is usually a cut.

Do not apply one high speed multiplier to an entire workflow merely to satisfy
motion diagnostics. Preserve normal-speed decisive inputs, menu choices,
construction/recalculation and reveals; cut only uneventful spans. Allocate a
measured reading window for each row, column, widget or form field named by the
narration. If a first-time viewer cannot identify what changed, the cut is too
fast even when every action is technically present.

The recorder still waits for the real operation even if the viewer never sees
that wait. Do not stop/retry a write just to shorten footage. If recording
segments separately, preserve completion/readback evidence and obtain handles
around the cut; keep the UI context and cursor handoff coherent.

Plan narration on the **edited timeline**, not the raw wait duration. A removed
span needs an audio decision: remove its mic silence, retain intentional speech
as voiceover, or rerecord narration. Never speed speech unintelligibly or leave
captions/zooms attached to pre-cut timestamps. Preserve UI feedback sounds only
when they help and do not leak private information.

Use semantic event anchors while planning, then map source timestamps to output
timestamps after capture. Every trim or speed change must update downstream
voice, caption, highlight and camera cues. See the contract's tool profile and
edit decision fields; their purpose is an executable handoff, not form-filling.

If a total length is supplied, allocate an **estimated editorial budget** across
sections, voice and transitions. Distinguish estimates from measured runtime.
Read narration aloud or use available local timing tools when appropriate;
otherwise mark the estimate. If the budget is too small, propose narrowing or
extending instead of omitting proof.

### Watch the motion, not just the final screenshot

Before calling the cut ready:

1. Review the whole edit or closely spaced sequential frames around each action.
   A sparse contact sheet and one correct final image cannot establish continuity.
2. Annotate intervals as real task action/change, orientation, intentional result
   reading, idle wait, or editorial-only movement.
3. Report frozen/padded seconds, longest unexplained still interval, visible
   action count and missing action surfaces. Do not count zooms or cursor travel
   alone as functional action. Pixel difference is only a diagnostic, not proof.
4. For short introductions, investigate unexplained still spans above about
   three seconds. Trim them or shorten speech; keep exceptions only for a
   specific reading/comparison purpose.
5. Verify that cutting waits did not also remove the input, decisive click or
   useful transition. Preserve a short cause-to-effect connection.
6. Prefer a strong 30-second task over padding it to one minute. If a longer
   cut is required, add a useful supported action in the same journey, not
   narration over the same state.

See [dynamic-demo acceptance](references/dynamic-demo.md) for a practical
before/after and cross-product test protocol.

### Write an audience story, not a spoken test procedure

Produce a separate audience-facing narration pass from the product value, video
goal, audience familiarity and recorded task. The internal capture script says
what to click, wait for and assert; the audience story explains the recognizable
problem, what the product lets someone do and why that matters. Do not send
recording instructions straight to TTS.

Separate the **recording instructions** for the operator from the **audience
explanation** for the viewer within each storyboard beat. A single scene editor
should show what happens and what the viewer hears together; do not require
duplicate script tabs or independently maintained copies of the same narration.
A derived narration-only artifact may be exported for TTS. The explanation
script is a coherent story that may span several actions, not a copy of the
recording script with its verbs softened. Feed only the explanation script into
speech synthesis; clicking, waits, counts and assertions stay in production notes.

For an introductory video, do not narrate "wait for server confirmation",
"read back the record ID", or "the count changes from 6 to 7". Those are internal
production/verification notes unless the number itself is central to the user's
benefit. Explain the mechanism earned by the scene, for example, "Describe the
structure; the Agent turns that request into an editable business table." A technical
tutorial may need exact steps; do not assume that audience for a product intro.

Write natural connected sentences rather than a voice label per mouse click.
The story can span related actions; it still must fit the real edit without
frozen padding. Keep assertions and disclaimers available to production/review,
not scattered through the audience narration.

Do not replace procedural narration with interchangeable benefit slogans.
Every main beat must name a distinctive capability, show its mechanism, and
make the resulting change visible. For an Agent-driven product, "describe the
business -> create its tables -> populate data -> create and revise views ->
generate a collection form" is stronger than "organize information and improve
collaboration." Preserve actual prompt-to-product causality on both surfaces.
Use the same business example as capability and complexity build across beats.

Choose the product's strongest relevant capabilities before choosing convenient
existing footage. If the defining interaction is missing, mark a capture gap
and plan the additional recording; do not quietly remove the capability and
present a weaker ready-made clip as its substitute. Data-flying effects may
accent verified data arrival, but must not stand in for an unrecorded import
or imply automatic ingestion that the product does not support.

### Calibrate the level of explanation

Use three passes on each main scene:

1. **Capability:** name what the user can accomplish in concrete language.
2. **Mechanism:** explain the meaningful input/control and what the product does
   with it. Keep product-specific nouns and verbs; omit internal wait/assertions.
3. **Consequence:** connect the visible change to the user's next business move.

These can form one natural sentence or two, not a repeated three-part slogan.
Prefer "Ask the Agent to add a sales-status view; it updates the existing
dashboard without starting over" over either "click Send and wait" or "get
insights faster." Only say "without starting over" if continuity is demonstrated.

| Wrong level | Why it fails | Better introduction, when supported |
| --- | --- | --- |
| "Five fields appeared; the table has zero rows." | Narrates a check instead of the capability | "Describe the business you need to manage; the Agent creates its related tables." |
| "Put data in one place and collaborate efficiently." | Interchangeable with almost any business app | "Ask for inventory and purchase views; the Agent builds them from the same business data." |
| "Open the ready-made form and submit." | Shows use, not a claimed creation capability | "Ask for an order-collection form; it is created against the existing orders." Keep its creation visible. |
| "A stunning, powerful dashboard appears instantly." | Adjectives and an unmeasured latency claim | "Turn those records into category and trend views, then ask to change the perspective." |

Mark every spoken assertion with its supporting scene/event during authoring.
A line about creation cannot be supported only by opening an existing artifact.
A line about conversational editing needs the real request and resulting change.
Do not extend narration beyond what the viewer can actually see or hear.

Use Edge TTS by default when available and authorized, per this project's voice
preference; start Chinese narration with `zh-CN-XiaoxiaoNeural` at a natural rate.
If it is unavailable, report the blocker rather than silently substituting a
legacy OS voice. Prefer an authorized neural TTS voice with suitable language,
tone and pacing when the user explicitly chooses another engine.
This is a ProductShot project preference, not a universal skill prerequisite.
Standalone users may select authorized human narration, another available engine,
or explicitly no voice. Product audio demonstrations may need unmasked original
sound rather than TTS. Missing speech tooling blocks only the requested voice
output, not scenario reasoning or storyboard authoring.
TTS alone does not guarantee natural speech: legacy OS voices are TTS too.
Name the actual engine and voice, audition a short sample, check pronunciation
and pauses, then synthesize. Use only cleared narration text with an online
provider; do not upload repository contents, recordings or private business data.
Paid usage requires permission. If a natural voice is unavailable, label the
local voice as a draft rather than silently treating it as production quality.
After synthesis, measure each line against its action window and shorten the
copy when needed instead of stretching video or speeding speech mechanically.

Voice and screen copy have different jobs: voice explains value or cause;
screen copy labels the key point. Avoid repeating a paragraph in both.
No narration, no music or no overlay are valid explicit choices.

## 5. Revise and assess recording readiness

Supply useful defaults for every known section, so the user can review and
continue without filling a questionnaire. Do not insert a separate approval
question for every field or beat. Unknown product evidence still needs resolution;
a Next action cannot turn an unsupported capability into a verified one.

Present a concise flow first, with detailed recording direction available per
selected step. Use available genuine keyframes to explain framing; mark missing
images and distinguish reference shots from new capture. Do not dump every
editable field onto one screen. Presentation can be compact without deleting
the full script, exact inputs or edit decisions.

When feedback arrives:

1. Identify the affected sections/beats.
2. Change those fields, retain IDs and unaffected text.
3. Update dependencies, timing estimates and continuity if affected.
4. Invalidate approval for the changed version.
5. Show the changed section before seeking any required approval.

If feedback says footage does not serve the story, return to the
story-to-footage contract. Do not patch the mismatch with a new voiceover,
blanket slow-down, speed-up or overlays.

Deliver a complete proposed script even when recording access is pending, but
mark individual blocked beats honestly. Distinguish `planned` from
`rehearsed`: only actual rehearsal establishes targets and measured wait times.
Separate `designStatus` from `executionStatus`: a completed design can have
blocked execution. Any unmet access, tool or product-capability prerequisite
makes execution `blocked`; do not label it ready because the prose is complete.

## Output and execution boundary

### Plan-and-execute mode

Keep scenario design and recording direction as the two domain skills; do not
introduce another mandatory skill handoff. When the user requests an end-to-end
trial, establish a working overall plan, then loop per section:

1. Inspect the real starting state and identify controls.
2. Draft the exact input, expected result, framing and verification.
3. Within the authorized scope, rehearse or capture the real action.
4. Inspect actual results, save timestamps/keyframes and verify the intended
   benefit. Do not repeat writes just to improve a take.
5. Revise that section against the actual screen and timing; edit a candidate
   segment. Preserve raw footage separately from reversible overlays/cuts.
6. Continue with the next section, then assemble and inspect the full cut.

A bounded autonomous trial may use Agent-chosen working defaults, explicitly
labeled as such, without pretending the user approved each draft. Keep real
runtime access/permissions separate from editorial decisions. If blocked,
report the blocker and retain the runnable parts; do not substitute text
animation or unrelated previous footage. Changes to narration, highlight or
crop normally reuse footage; changes to product operations may require a new
authorized take. Never mark the final release approved merely because it rendered.

### Plan-only mode and actual artifacts

Follow the contract for `recording-script.json` and a readable inline rendition.
Include the source revision, exact goal, branch mode, all selected-feature
coverage, readiness blockers and must-keep constraints.
Standalone use needs no ProductShot runner: keep the plan as private files or
host documents. The contracts' runner adapters apply only when integrating with
that existing runtime and must not be interpreted as an installed connection.

These skills do not themselves authorize:

- Signing in or reusing credentials.
- Product writes, publishing forms, replays or repeated submissions.
- Paid generation, third-party uploads or public release.

If the user already authorized a bounded test recording, reuse that permission;
do not repeatedly ask about the same scope. Otherwise ask at the point a
consequential action is needed. A plan approval is not blanket execution consent.

Production must return actual media, action/readback logs and measured cue times.
Keep those separate from the proposed script and from UI animation. Never call
a storyboard, placeholder, decorative background or script explanation video a
real product demo recording.

### Generated or mocked product footage

If the requested deliverable explicitly allows a generated concept demo, do not
treat that as permission to invent a generic replacement product. First inspect
the real product's visual system and interaction density: shell, navigation,
spacing, typography, colors, component hierarchy, table/form/chart patterns,
loading and error states, and the exact controls that make the workflow legible.
Build a short **visual-fidelity profile** and use it as a production constraint.

A mock may simplify implementation, but not product identity or interaction
grammar. It should look plausibly like the inspected product at normal playback:
the same information hierarchy, comparable control density, recognizable
components and credible state transitions. A sparse four-card canvas standing in
for a dense operational application fails even when its labels are correct.

Keep three questions separate:

1. **Visual fidelity:** would a viewer recognize the intended product family?
2. **Behavior fidelity:** do controls and state changes follow the real product's
   interaction model rather than convenient custom animation?
3. **Evidence status:** is this generated concept footage or an observed product
   execution? Fidelity never upgrades a mock into runtime evidence.

Record the mock as continuous video. Creation, data arrival, chart updates and
form construction must visibly unfold; do not switch between finished stills.
Compare temporal frames from the mock with inspected real-product keyframes and
reject large unexplained differences in layout, density or component structure.

## Quality gate

Before handoff, check every section:

- **Product recall:** can an unfamiliar viewer name the intended capabilities
  and explain the distinctive input-to-result mechanism? Enumerate those
  takeaways and the scenes that earn them; do not count slogans as takeaways.
- **Claim-to-picture match:** does each important spoken claim have the required
  visible event, not merely a related screenshot? Name capture gaps honestly.
- **Progression:** do later beats demonstrate another meaningful capability,
  constraint or refinement on the same work, rather than repeat a static result?
- **Anti-generic pass:** if the product name were removed, would this explain
  only generic organization/collaboration? Restore specific mechanisms, not hype.
- **Editorial choice:** were key capabilities removed solely because other
  footage was easier to obtain? Restore them as planned/blocked beats.
- Could a recorder follow it without inventing the input, action or end state?
- Are exact prompts/values/commands present where required?
- Are camera/highlight/voice/copy cues tied to the right events?
- Does every effect have a supported tool path or an explicit manual/blocker status?
- Are idle cuts anchored to real events, with audio and all downstream cues retimed?
- Is there one clear visual focus, with a purposeful entry and exit for each zoom?
- Are starting and ending states continuous between sections?
- Can the result be independently checked?
- Are long waits, failures and missing targets handled explicitly?
- Does duration fit without eliminating visible proof?
- Is the work visibly progressing while it is described, without freeze padding?
- Have I reviewed action sequences and justified every long static hold, rather
  than only checking the final result and output codec?
- Are selected custom features represented honestly, even if blocked?
- Are all user corrections retained and no UI mockups masquerading as footage?
- For an explicitly allowed mock, does a visual-fidelity profile tie its shell,
  controls, density and transitions to the inspected real product?
- Was the film type declared, and would its action chain still make sense without
  narration?
- Does each operation exist because the story requires it, rather than because
  footage happened to be available?
- Were exact rows, columns, relationships, widgets and fields named before
  capture and revealed at a readable speed?

## Learnings

The first fresh Biz Table cut was operationally valid but presentation-poor:
much of it explained tables, and roughly 12 seconds of frame padding were added
to accommodate speech/minimum durations. Never treat a valid recording file,
small zooms and correct final data as sufficient proof of a dynamic product
demo. Capture meaningful actions, cut dead time, and fit voice to those actions.

A dynamic mock can still fail if it replaces a mature product with a sparse,
generic interface. Fidelity is not cosmetic polish: model the real shell,
component hierarchy, information density and interaction grammar before
animating the scenario. Label generated footage honestly, but do not use that
label as an excuse for an unrecognizable substitute UI.

Do not solve static footage by accelerating the whole cut until the task becomes
unreadable. Motion metrics diagnose idle spans; they do not define editorial
quality. Preserve decisive actions and give each required reveal enough time.
