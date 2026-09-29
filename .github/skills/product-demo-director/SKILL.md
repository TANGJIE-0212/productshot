---
name: product-demo-director
description: Orchestrate a product-demo project from product source and video goal through feature selection, optional scenario design, detailed recording scripts and review. Use the current Agent and existing versioned project; delegate design methods to the two specialist skills.
---

# Product Demo Director

The current Agent runs this workflow; do not merely describe it or silently
substitute a mockup. This skill orchestrates the project. The two design methods
live in:

- [product-scenario-design](../product-scenario-design/SKILL.md): user/pain
  analysis, three or more business/use-case scenarios and a selected coarse outline.
- [recording-script-design](../recording-script-design/SKILL.md): exact inputs,
  recording beats, result proof, editing, camera, highlights, voice and screen copy.

Load the applicable specialist before doing that design work. Read its canonical
file if the host has not yet refreshed skill discovery. Do not duplicate the
methods or create a separate Agent/model service just to invoke a skill.

## User flow

The current four-step product direction is:

**Product & goal -> Feature selection -> Recording script -> Results & changes**

Scenario design is an optional intermediate part of feature selection, not a
mandatory fifth step. Default to feature-by-feature presentation unless the user
chooses a scenario. Preserve an existing explicit mode selection.

The Agent should propose complete defaults so the user can continue with Next
rather than fill every field. Recommendations still are not user approval or
permission to execute consequential actions. Do not add approval of discovery,
a whole-product/specific-feature question, or a redundant audience form.

## 1. Source, goal and evidence

Reuse information already supplied. Ask only for a missing product source and
rough video goal. A useful goal is "present this project to LT, about one minute";
it need not list features or specify exact timings.

Inspect authorized repositories, docs and available UI. Record source/version,
capabilities, visible proof, confidence and limitations. Distinguish source
inspection, runtime observation, documentation and unverified custom features.
Do not infer a successful runtime from a README or old recording.

If the user asks to start fresh, initialize a separate private project with the
new source and no inherited choices. Otherwise resume the same project.

## 2. Feature selection

Present the actual discovered feature list with reasonable recommendations,
multi-selection and repeatable custom additions. Infer the likely video audience
from the stated goal; keep product-user groups separate.

When the bound ProductShot MCP tools are available:

1. Read the bound project and verify its source matches this run.
2. Publish evidence-backed discovery with its current revision.
3. Use native feature elicitation where supported.
4. After accept, read the saved project and continue; no separate "submitted"
   message is needed for that pending tool call.
5. Cancel, decline, timeout or an unsupported host never count as acceptance.
   Use explicit native-chat answers for unsupported hosts, not fake multiselect.

MCP currently exposes feature selection, not the complete website-first workflow.
If only the older runner/browser forms are available, use them honestly: saves
persist state but do not automatically wake a dormant Agent.

## 3. Route to the right design skill

### Scenario presentation

Invoke `product-scenario-design`. Present at least three concrete uses of the
selected functions, including product users, pains and requirements. The user
may select, edit or add a scenario. Keep a coarse ordered business outline and
the rich candidate document; do not merge all alternatives into one film.

### Feature-by-feature presentation

Skip scenario questions. Preserve feature order and a coherent demonstration
context without forcing a business story. Proceed to `recording-script-design`.

### Detailed recording script

Invoke `recording-script-design` with the raw goal, evidence, selected functions,
optional chosen scenario and all constraints. Let it propose the detailed script.
Do not leave generic "not rehearsed" filler where a design decision is needed.
Unknown product behavior remains an explicit blocker, not a fabricated result.

Discuss the complete draft or the affected revision. If the user asks for an
autonomous first pass, draft it without an intake questionnaire; do not falsely
mark an unseen draft as user-approved.

## State, UI and runtime compatibility

Read [runtime.md](references/runtime.md) before using the bundled Node runner.
Its CLI needs Node.js 20+ and no added model/API service. All commands refer to
this skill's `scripts/director.mjs`, not scripts in the target product.

- Keep projects and unpublished evidence outside `public/`.
- Read before writes and after user interaction; use revision checks.
- Never edit `project.json` directly.
- Preserve IDs, history and user edits. Upstream revisions invalidate downstream
  approval; do not discard the retained drafts.
- Use the host's browser to display the same project and verify publication.
  If unavailable, provide the loopback URL without claiming it was opened.
- Keep native conversation in the Agent; do not build a fake chat inside the
  results webpage. Website-first prototypes are not an implemented message bridge.
- Native elicitation, browser saves and automatic Agent continuation are separate
  capabilities; never claim one implies the others.

The legacy runner still stores five documents:
`discovery`, `selection`, `outline`, `storyboard`, `review`.
This is not identical to the current UI's four-step flow.

Before publishing `outline`, the runner needs approved selection with nonempty
audience. Derive that audience from the explicit goal where clear; ask only if
ambiguous. Before `storyboard`, it needs approved outline.
For direct-feature mode, a thin ordered feature outline supplies this storage
requirement; it does not require asking for a scenario.

Keep `scenario-design.json` and `recording-script.json` as private rich sidecars.
Use the specialists' adapter tables to map them without losing exact prompts,
voice, copy, wait edits or constraints. Until gate approvals exist, save/present
drafts separately rather than manufacturing approvals or changing validation.

The static C/E UI prototypes store browser drafts and show prepared sample plans;
creating skills does not connect those buttons to a live Agent. Do not mix demo
fixture checkpoints with actual user approval.

## Production and review

Planning approval alone does not authorize login, product mutation, recording,
paid media, external uploads or public publishing. Reuse explicit existing
authorization within its scope; ask only for missing permission needed now.

Use actual available recording/render tools after authorization. The bundled
planning runner has no automatic capture/render adapter. If access is blocked,
report it and attempt an authorized real environment; never pass off text
animation, screenshots of fake UI or a storyboard as product recording.

For an authorized end-to-end first pass, the recording-script specialist also
acts as the recording director: plan, capture, inspect and refine each section
with the available tools. Keep an Agent working draft distinct from user approval;
this does not remove the legacy runner's gates or imply a native UI integration.

Only publish `review` with actual existing artifact paths/checksums and checks
performed. Record limitations, selected version and any edits still pending.
Do not approve the final release without the user's actual review.

For an external production handoff, see
[handoff-contract.md](references/handoff-contract.md); it does not replace the
runtime's project format or the detailed recording-script sidecar.

## Visual and evidence boundary

Read [shell-and-content.md](references/shell-and-content.md) for UI work. Styling,
logos and decorative 3D scenes belong to the shell; they must not become product
evidence or footage silently. The user's product remains the subject.

Research behind the two specialist skills:
[public skill comparison](references/skill-research.md).
