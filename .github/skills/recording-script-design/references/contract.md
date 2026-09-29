# Detailed recording-script contract

Keep the readable script and the structured handoff consistent. Persist the full
document privately as `recording-script.json` where file output is supported.
An `audience-script.json` export may derive the viewer's explanation from the
same storyboard beats, with shared IDs and output time windows. It is the
speech-synthesis input; operator instructions are not. Keep one editable source
of narration per beat rather than a duplicate user-facing script workflow.
Keep revisions linked, and mark the rendered video stale after either script
changes rather than implying that editing text has already re-recorded audio.
This contract is a planning artifact; no automatic recorder adapter is installed
by creating it.

## Top-level fields

| Field | Requirement |
| --- | --- |
| `format`, `version`, `revision` | `productshot-recording-script`, `1`, integer revision |
| `status` | `draft` or explicitly `approved`; never inferred from defaults |
| `goal` | Raw user goal, audience interpretation, optional total duration |
| `sourceRevision` | Source/deployment actually inspected |
| `mode` | `scenario` or `features` |
| `scenarioId` | Selected scenario ID, or `null` for direct features |
| `featureIds` | Actual selected feature IDs, including unverified additions |
| `constraints` | Stable IDs, text, strength, origin; preserve rejected/locked items |
| `sections` | Ordered units by feature or business step |
| `readiness` | Overall `planned`, `rehearsed`, or `blocked`, plus prerequisites |
| `budget` | Optional estimate with basis and any duration shortfall |
| `toolProfile` | Capture/editor/automation components, actual version/platform or explicitly unverified, effect support and chosen implementation paths |
| `editPlan` | Source spans to keep/cut/speed/hold, event anchors, camera/highlight/audio cues and source-to-output timing status |
| `motionReview` | Visible task actions, purposeful holds, idle waits, freeze-padding seconds, missing surfaces, temporal review method and limitations |
| `audienceNarration` | Separate story for the viewer: problem, useful capability, benefit; lines linked to action windows, not copied from recorder commands |
| `voiceProfile` | Actual TTS engine/voice, language, rate, pronunciation notes, local/cloud status, authorization and measured clip durations |
| `productThesis`, `mustShowCapabilityIds` | Product-specific mechanism and required capabilities carried from scenario reasoning, or derived for direct-feature mode |
| `capabilityReview` | Intended viewer takeaways mapped to section/reveal IDs; missing proof, generic-copy problems and recording gaps remain explicit |

Readiness may include `designStatus` (`draft` or `complete`) and
`executionStatus` (`not-rehearsed`, `blocked`, or `rehearsed`). These describe
different things: a complete script with missing access has blocked execution.
When using the legacy single `readiness.status`, blockers take precedence:
use `blocked`; use `planned` only without known execution blockers and never as
a claim of successful rehearsal.

Each section additionally carries a `capabilityBeat`: `capabilityId`,
`userIntent`, `mechanism`, `visibleTransformation`, `revealEvent`,
`audienceTakeaway`, and `captureStatus`. This is the design rationale, not extra
UI form fields. A supported-but-unrecorded capability stays in the plan with a
capture gap; a related old clip does not satisfy its reveal requirement.

## Tool and edit handoff

Keep the narrative script readable. This small technical sidecar connects its
directorial choices to the recorder/editor without assuming an adapter exists:

```json
{
  "toolProfile": {
    "capture": {
      "tool": "OpenScreen",
      "interface": "desktop CLI",
      "platform": "Windows",
      "installedVersion": null,
      "verification": "upstream-documented; local installation not checked",
      "scope": "authorized application window"
    },
    "automation": {
      "tool": "host browser automation",
      "verification": "targets must be resolved in actual browser"
    },
    "editor": {
      "tool": "OpenScreen",
      "interface": "native project / GUI",
      "schemaRevision": null,
      "verification": "project schema must be checked before writing automation"
    },
    "effects": [
      {
        "kind": "zoom-pan",
        "path": "native-editor",
        "support": "documented",
        "binding": "manual zoom region; exact schema and target bounds unresolved"
      },
      {
        "kind": "result-outline",
        "path": "post-processing",
        "support": "needs-confirmation",
        "binding": "verify outline implementation; do not substitute a fake result"
      },
      {
        "kind": "trim",
        "path": "native-editor",
        "support": "documented",
        "binding": "source interval removed after real completion"
      }
    ]
  },
  "editPlan": {
    "timeBasis": "event-anchors",
    "sourceMedia": null,
    "outputDurationSeconds": null,
    "segments": [
      {
        "id": "keep-request",
        "beatId": "build-send",
        "decision": "keep",
        "from": "prompt_fully_visible",
        "to": "working_state_established",
        "speed": 1,
        "audio": "Narrate over the readable prompt; retain the send moment."
      },
      {
        "id": "cut-wait",
        "beatId": "build-send",
        "decision": "cut",
        "from": "working_state_established",
        "to": "creation_completed",
        "preserveBoundaryEvents": true,
        "audio": "Remove idle microphone silence; place voiceover on retained spans.",
        "disclosure": "Waiting shortened",
        "onMissingAnchor": "Inspect the take; never infer a successful completion."
      },
      {
        "id": "keep-result",
        "beatId": "build-result",
        "decision": "keep",
        "from": "creation_completed",
        "to": "result_readback_complete",
        "speed": 1,
        "audio": "Keep result narration aligned with the actual visible fields."
      }
    ],
    "cues": [
      {
        "id": "focus-result",
        "beatId": "build-result",
        "effect": "zoom-pan",
        "enter": "table_ready",
        "exit": "before_next_section",
        "target": "Priority header plus table name and zero-record count",
        "framing": "Wide table -> readable headers -> wide table",
        "easing": "smooth ease-in-out; no abrupt scale jumps",
        "scale": null,
        "bounds": null,
        "units": "source pixels; fill after target calibration"
      },
      {
        "id": "mark-priority",
        "beatId": "build-result",
        "effect": "result-outline",
        "enter": "focus-result_settled",
        "exit": "before_next_section",
        "target": "Priority header",
        "treatment": "Single accent outline outside the label, no filled obstruction"
      }
    ]
  }
}
```

This is proposed tool use, not an executed project. `support` distinguishes
`documented`, `locally-verified`, `needs-confirmation`, and `unavailable`; `path`
can be `native-recorder`, `native-editor`, `post-processing`, or `manual`.
An effect required for delivery with no verified path remains a handoff blocker.
The null times/bounds above are unresolved measurements, not missing design.

After actual capture, bind event anchors to `sourceStartMs`/`sourceEndMs` and
retained spans to `outputStartMs`/`outputEndMs`. For speed `s`, a retained span's
output duration is `(sourceEndMs - sourceStartMs) / s`; cuts contribute zero.
A planned `hold` needs an explicit clean hold or freeze frame, not repeated
product actions. Label freezes/time compression when otherwise misleading.
Do not add a hold/freeze simply because narration or a minimum segment duration
is longer than the action. Default freeze-padding seconds to zero and shorten
the voice or finished cut instead.
Handle transition overlaps explicitly rather than double-counting them.

Recompute **all** output cue times after trims or speed changes. Reject cues
inside deleted spans unless intentionally reanchored to a retained event.
Keep raw footage and its timestamps intact. Do not persist guessed absolute
timestamps as if they had been observed.

## Section and beat shape

The example below illustrates one section, not a complete multi-feature film.
The product and command are hypothetical until verified against the real source.

```json
{
  "id": "create-structure",
  "title": "Create the request table",
  "featureIds": ["agent-build"],
  "outlineStepId": "build",
  "purpose": "Prove a request creates an editable empty structure.",
  "sourceType": "real-recording",
  "evidence": ["inspected product tool schema reference"],
  "setup": {
    "surface": "Product homepage and connected Agent",
    "data": "Isolated empty test app; no records",
    "preparedBeforeCapture": ["MCP connection", "Test-app permission"],
    "createdDuringCapture": ["Requests table"],
    "permissionNeeded": ["Create structure in the test app"]
  },
  "readiness": {
    "status": "blocked",
    "designStatus": "complete",
    "executionStatus": "blocked",
    "blockers": ["Test app access not yet confirmed"],
    "targetResolution": "Semantic targets; resolve actual locators during rehearsal."
  },
  "beats": [
    {
      "id": "build-send",
      "before": "Homepage is visible and Agent composer is empty.",
      "actor": "User operating the connected Agent",
      "surface": "Agent composer beside product window",
      "target": "Message composer and Send control in the actual Agent host",
      "action": "Type the full prompt, pause for reading, then send once.",
      "input": {
        "kind": "prompt",
        "text": "Create a Requests table with Title, Priority (High/Medium/Low) and Status (New/Done). Do not add records."
      },
      "wait": {
        "until": "Sent message and actual working state appear.",
        "onFailure": "Stop if Send is unavailable or the request fails; preserve diagnostics."
      },
      "after": "The sent request remains visible while execution begins.",
      "highlight": {
        "target": "Prompt text",
        "enter": "After all text is typed",
        "treatment": "Subtle outline; do not obscure text",
        "exit": "Before the request is sent"
      },
      "camera": {
        "start": "Agent and product overview",
        "move": "Push toward the composer after orientation",
        "keepVisible": ["Full prompt", "Send control", "Product identity"],
        "end": "Return to shared overview as execution begins"
      },
      "edit": {
        "keep": ["Readable full prompt", "Send", "Sent message", "Execution onset"],
        "trim": ["Uneventful middle waiting after execution begins"],
        "disclosure": "Label a shortened wait if the cut could imply instant execution."
      },
      "audio": {
        "narration": "Describe the structure once; the Agent creates the business table.",
        "start": "After the prompt is readable",
        "end": "Before inspecting the created fields",
        "otherSound": "none"
      },
      "screenCopy": {
        "text": "Create a table from a request",
        "enter": "After the overview is established",
        "exit": "Before field verification",
        "placement": "Clear margin outside the input and product controls"
      },
      "verify": {
        "assertion": "The exact prompt was sent once; real execution started.",
        "evidenceToCapture": ["Agent message and working state"],
        "onMismatch": "Stop; do not replay a write without checking whether it occurred."
      },
      "mustKeep": ["No pre-created result before the request"],
      "next": "build-result"
    },
    {
      "id": "build-result",
      "before": "The actual Agent execution is complete.",
      "actor": "User operating the product",
      "surface": "Requests table",
      "target": "New table entry and column headers",
      "action": "Open the created table; inspect its headers and zero-record state.",
      "input": { "kind": "none", "text": "" },
      "wait": {
        "until": "Title, Priority and Status are rendered; record count is readable.",
        "onFailure": "Do not show a success caption if fields are missing."
      },
      "after": "Three intended fields and zero records are visible.",
      "highlight": {
        "target": "Priority header",
        "enter": "After table load and camera settles",
        "treatment": "One brief outline",
        "exit": "Before leaving the table"
      },
      "camera": {
        "start": "Whole table",
        "move": "Small push to the headers",
        "keepVisible": ["Table name", "Headers", "Record count"],
        "end": "Wide enough to open the next feature"
      },
      "edit": {
        "keep": ["Real completion", "Table entry", "Headers and record count"],
        "trim": ["Blank loading interval"],
        "disclosure": "Do not present prebuilt output as generated."
      },
      "audio": {
        "narration": "Your request becomes a structured table you can keep working in, rather than a static answer in the conversation.",
        "start": "After the table result is visible",
        "end": "While the zero-record state remains on screen",
        "otherSound": "none"
      },
      "screenCopy": {
        "text": "Structure ready",
        "enter": "Only after field verification",
        "exit": "At the next section",
        "placement": "Outside table headers"
      },
      "verify": {
        "assertion": "Field names/options match the request and record count is zero.",
        "evidenceToCapture": ["Rendered table", "Bounded structure readback"],
        "onMismatch": "Record the mismatch and revise the plan; do not draw fake headers."
      },
      "mustKeep": ["Result follows actual creation"],
      "next": null
    }
  ]
}
```

Valid input kinds include `prompt`, `command`, `form-values`, `query`, `file`,
and `none`. Commands need working-directory/environment prerequisites without
credentials. Form values need exact labels/values. File input needs a named
synthetic fixture and expected contents/schema, not an unavailable private file.

`sourceType` uses `real-recording`, `explanation`, `generated-media`, or `mixed`.
The first means **intended capture source**, not already-recorded proof.
Use `"none"` explicitly for unnecessary highlight/motion/copy rather than
inventing decorative activity.

## Script validation

1. All section and beat IDs are stable and unique.
2. Every selected feature has a section, or a disclosed reason it is blocked/
   excluded. Direct-feature mode must not require a scenario.
3. Scenario sections reference the selected outline's actual step IDs.
4. Every `next` resolves to a real beat or is `null` at the end.
5. Exact input, action, completion, result and failure behavior are present.
6. Each visual/audio cue specifies when it enters/leaves and what stays visible.
7. Setups do not leak into shots as falsely claimed newly created results.
8. Overall estimates fit the goal or explicitly explain the shortfall.
9. Approved constraints are preserved in each affected beat.
10. Unknown controls are blockers for execution, not excuses for vague planning.
11. Required effects map to a tool/interface with stated verification level;
    no unsupported editor API is described as ready to execute.
12. Retained source spans are valid and ordered; source/output cue mapping
    respects cuts, speed and transitions. Voice and captions use final-cut times.
13. Zoomed/cropped footage retains labels, object identity and readable text at
    the final export size; highlights remain aligned after the transform.

## Existing runtime adapter: no information loss

The ProductShot runner still requires an approved `selection`, then approved
`outline`, before publishing `storyboard`. Its shape is documented in
[runtime.md](../../product-demo-director/references/runtime.md).

- Scenario mode: use the selected business outline.
- Feature mode: build a thin outline of ordered feature sections; this satisfies
  the legacy storage contract without asking the user to choose a business story.
- Never invent user approvals to satisfy prerequisites. Before approval, keep the
  rich script as a private draft and present it normally.
- Map each recording section to one or more runtime `shots`, keeping `stepId`.
- Preserve the full rich script beside the runtime document. The prototype's
  `featureShotDrafts` are not a runtime API.

Map the canonical direction fields as follows:

| Runtime field | Content from rich script |
| --- | --- |
| `before` | Section setup plus first beat's actual initial state |
| `actions` | Ordered beat actions and verbatim inputs |
| `after` | Final visible result |
| `highlight` | Ordered enter/treatment/exit cues |
| `camera` | Start, movement, retained context, end for each beat |
| `motion` | Product vs presentation movement; planned screen-copy cues |
| `hold` | Readiness/reading/voice gates; exact narration and edit decisions |
| `transition` | Last beat's handoff to next section |
| `verify` | Observable assertions, evidence and failure response |
| `mustKeep` | All applicable locked constraints |

Runtime strings have length limits. If the detailed mapping exceeds them, split
the section into additional shots or retain a clearly referenced sidecar; never
truncate the exact prompt, voice, copy, or verification silently.

## Production return

The later recorder should return:

- Actual source/deployment and execution authorization used.
- Raw recording and edited output paths with checksums.
- Timestamped actions, assertions, captured results and failures.
- Measured cue times for the script's beat IDs.
- Actual cuts/speed changes and any shortened-wait labels.
- Browser/video/audio checks actually performed.

The script is not a substitute for those artifacts. A render hash proves file
identity, not that the underlying product operation was truthful.
