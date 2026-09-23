# From a story to a shooting plan

## User-facing sequence

1. Inspect the authorized repo/site; distinguish implemented, documented and
   unverified capabilities.
2. Confirm demo needs using capability multi-selection and free-text additions.
3. Confirm the video audience and their prior knowledge. Keep any volunteered
   audience instead of asking twice.
4. Choose presentation style: a connected task, before/after, or focused features.
5. Propose concrete sample scenarios even for a feature showcase; let the user
   choose or supply one.
6. Draft the story, discuss its starting state and outcome, then detail the shots.
7. Save the selected outline in Studio. Review one detailed shot, refine the
   rest in the "Story and shots" page or Agent conversation, and approve the
   shooting plan before production. Production permissions remain separate.

## What "detailed" means

Wrong: "Show the dashboard, zoom in, 10 seconds."

Better: "Begin with the data table. Keep the Agent and product visible together.
The user types and sends a request for a dashboard. Only after the request,
show the actual product update. Once the requested metric is ready, gently push
from the overview toward that metric, leaving its label and filter context in
frame. Outline that metric after the camera settles; do not highlight every
chart. Hold the readable result, remove the outline, then pull back to the
overview before entering the form."

This is a **proposed shot**, not proof that the product was operated. A real
Agent request, running indicator and chart creation need execution evidence.
Do not hide a pre-existing chart and reveal it as if the request created it.

## Editable direction fields

All fields are plain-language instructions. An execution adapter resolves them
to actions, targets and measured event times during rehearsal.

| Field | Required specificity |
| --- | --- |
| `before` | Which screen and data state, what is absent, how it continues the prior shot |
| `actions` | Ordered real actions and their expected changes; identify the actor |
| `highlight` | Target, trigger, style, removal; explicitly say none when unnecessary |
| `camera` | Establishing frame → push target → hold → pull-back/end frame; what must not be cropped |
| `motion` | Object, start and end positions/states, sequencing, easing intent and provenance |
| `after` | Result that remains visible at the end, not merely a decorative success message |
| `hold` | Readiness and readability gates; coordinate with optional narration |
| `transition` | Shared object/context, direction and entry state for the next shot |
| `verify` | Observable assertion, evidence and what stops production if missing |
| `mustKeep` | User-approved invariants that a later change must preserve |

Use ordered lines for multiple beats. For example:

```text
1. Establish the empty Products table; confirm zero records.
2. Briefly outline the recommended fields without changing their content.
3. Remove the outline; keep the same table visible as the next import begins.
```

## Important distinctions

- Highlighting guides attention; it does not change a product value.
- A generated scene explains a relationship; it is not an execution trace.
- Product animation, camera movement and cursor presentation are separate layers.
- Timing precision follows a successful rehearsal, not a guessed wall-clock plan.
- If a response is slow, preserve its proof and plan an explicit edit; do not
  claim artificial speed as product performance.
- "More fluid" should become a concrete revision: less camera travel, fewer
  cuts, a stable context, a longer readable result, or a different transition.
  Do not respond by indiscriminately adding animations.

## Approval checklist

- Each scene has a clear start, causal action and verifiable result.
- Each highlight and camera change has a semantic target and trigger.
- The result does not precede the operation.
- Adjacent scenes agree on the shared state and framing.
- Missing access, targets and runtime checks remain explicitly unresolved.
- User corrections are visible in the revised direction.
- No one must enter seconds merely to advance the conversation.
- Approved shot IDs, full direction, evidence and constraints survive handoff.
