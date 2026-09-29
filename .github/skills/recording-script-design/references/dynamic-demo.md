# Dynamic demo acceptance

## What changed after the Biz Table trial

The rejected cut showed an empty table, existing records, one changed field and
a filtered result. The business assertion was valid, but the viewer mostly saw
results being explained. Editing added about twelve seconds of cloned end frames.
The next test must address that presentation failure, not just repeat validation.

| Static explanation | Action-driven demonstration |
| --- | --- |
| Narrator describes a finished structure | User enters the actual request; Agent/tool operation visibly leads to the structure |
| Rows already exist, speech explains them | When creation/import is a supported relevant capability, show it. Otherwise disclose prepared data and show the product's actual transformation or refinement of it |
| Dashboard sits under a long paragraph | User asks/filters/refines something; the chart changes in response |
| Fixed zoom on each segment | Framing follows input, decisive control and changed result |
| Result held until voice ends | Voice is short enough for the action and necessary result-reading interval |
| Last frame repeated to reach one minute | End when the task is complete, or add another meaningful step in that task |

## Trial requirements

Use at least three materially different product interactions when validating
generalization, not three table products:

- Visual manipulation: draw/connect/edit an object and inspect the composition.
- Live transformation: edit actual source/input and watch the result update.
- Query/analysis: formulate a question, execute it, inspect and refine the result.

Use real authorized products and synthetic data. Select concrete tasks after
inspecting capabilities. Avoid private uploads, public collaboration/publishing,
paid services and irreversible operations. If one product is inaccessible,
report the reason and use a relevant alternative rather than a reconstructed UI.

For each trial retain:

- Product URL/version observation and a short benefit-driven scenario proposal.
- Exact action script and real verification assertions.
- Raw recording, timestamped actions and final playable video.
- Cuts/speed decisions and concise voice/caption synchronization, if present.
- `freezePaddingSeconds` (target zero), explicit justified holds and longest
  unexplained static interval. State the measurement/review method.
- Temporal frames around decisive actions and final artifact checks.

The short tests need not be equal length. A video with no narration is acceptable
as an interaction test, but label that limitation rather than call it a finished
voiced promotional video. Adding narration afterward must not grow static holds.

## Capture and edit discipline

1. Prepare accounts, initial fixtures and permissions before the take.
2. Begin with enough context to locate the task, not a long intro card.
3. Record the product interaction continuously or in causal segments. Keep exact
   inputs, deliberate click/drag targets and real state changes.
4. Mark start/completion/readback events. A cursor overlay may indicate actual
   pointer positions but must not fabricate actions or product feedback.
5. Remove uneventful delays; retain useful action and readability. Do not replace
   the take with a slideshow of extracted screenshots.
6. Fit short narration to retained actions. Use silence instead of explaining
   every movement. Screen copy should label the current task, not repeat speech.
7. Watch the resulting action, including any error correction, and verify the
   useful result. Report what still needs production polish.

## Acceptance for explicitly generated mocks

Generated footage is a separate deliverable type, not a relaxed quality tier.
Before building it, retain real-product keyframes for the shell and every major
surface being simulated. Document:

- Navigation and persistent chrome that establish product identity.
- Typography, spacing, colors, borders and elevation.
- Information density and component hierarchy.
- Real table, form, dashboard, loading and confirmation patterns.
- Which controls appear, where they appear and what state change follows.

Reject the mock if it merely communicates the same nouns in a different generic
UI. For example, replacing a real business application with four floating cards
and a large empty canvas is not faithful because the product's sidebar, data
table, toolbar, modal/form patterns and operational density have disappeared.

Review representative frames side by side at the same output size. Also review
the sequence: controls should be operated and states should build progressively,
not switch from one finished illustration to another. The final report must say
`generated concept footage`; visual similarity does not make it execution proof.

## Story-first acceptance

Review the story-to-footage map before pixels or freeze intervals. The two film
types must have visibly different causal structures:

- Feature introduction: update definition -> capability mechanism -> readable
  proof -> next capability.
- Scenario-led: current pain/workaround -> user intent -> product change ->
  useful result -> next task-driven need.

For every beat, list the exact input and changed UI object, including required
rows, columns, relationships, widgets, form fields, highlight target and
transition. Generic table browsing does not prove one-sentence creation; a
finished dashboard does not prove one-sentence dashboard creation or revision.

Freeze detection is only a diagnostic. A zero-freeze cut can still fail because
it is globally accelerated and unreadable. Review at normal playback and reject
any beat where a first-time viewer cannot identify the input, operation and
changed result.
