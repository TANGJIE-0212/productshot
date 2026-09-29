# Cross-product calibration

These are hypothetical examples of reasoning, not verified product claims or
default selections. Use the real feature evidence when running the skill.

## Business application platform

Input: "Present the project to LT, about one minute."
Chosen features: Agent structure creation, forms, views/dashboard.

First resolve the product thesis. If the Agent can create and revise the
application, the selling point is not simply "a shared table with intake."
It is "describe the business, obtain usable structure and views, and evolve the
same system by conversation." Keep Agent-driven construction and revision as
must-show capabilities; collecting one record is supporting proof.

The comparisons below concern business fit, not the final introduction's
capability selection. A strong recruiting fit does not justify omitting the
Agent mechanism, and a recorded form does not outrank unrecorded construction.

| Candidate | Product user / pain | Coarse feature chain | Prerequisite |
| --- | --- | --- | --- |
| Project delivery tracking | Team lead cannot see scattered progress updates | Create project/task structure -> collect a task-linked update -> inspect overdue work and progress | The update must be linked to the task; a disconnected new row is not task progress |
| Recruiting pipeline | HR cannot consolidate interview feedback and candidate stages | Create candidate/feedback structure -> submit candidate-linked feedback -> inspect stage distribution | Synthetic candidates and suitable record permissions |
| Small-store inventory | Owner cannot reconcile purchases, sales and stock | Create linked product/movement tables -> register a movement -> reconcile stock overview | Stock calculation and returns are extra dependencies; do not assume they follow from a dashboard |

Do not choose among these solely by which is easiest to configure. Investigate
the relative problem and benefit first. An illustrative, conditional comparison:

| Rank | Situation | Relative benefit reasoning |
| --- | --- | --- |
| 1 | Recruiting team repeatedly reconciles candidate feedback across messages | If feedback-to-candidate linking is strong, it directly removes a recurring coordination burden and exposes missing feedback |
| 2 | Project team already has a basic shared task list but updates arrive elsewhere | Linked progress intake may help, but the gain is incremental if its existing tracker already does this |
| 3 | Store owner needs trustworthy stock accounting including returns | Potential benefit is high, but table/form capabilities alone are a weaker fit without verified inventory logic |

These are hypothetical circumstances, not a factual market ranking for Biz Table.
If research instead shows built-in stock reconciliation and an acute store-owner
need, inventory can rank first. The point is to explain the ranking from the
product's actual strength and each group's current workaround.

For the first group, propose a story where a recruiter finds which candidates
are missing feedback after collecting one interview response. The benefit is
knowing whom to follow up without merging files, not just watching a form submit.
For an LT review, show that coordination benefit briefly; for Xiaohongshu, explain
the same user's problem in more accessible language. The product user does not
become "LT" or "Xiaohongshu users" merely because the video goal changed.

If the best-matched scenario is not yet recordable, disclose that separately.
Do not label a lower-benefit, easier-to-film option the strongest product fit.

Bad alternatives: "complete workflow / before-after / feature highlights."
They describe editing styles, not three different uses of the product.

## Audio editor

Chosen features: transcript editing, silence removal, export.
Goal: introduce the editor to independent creators.

1. **Podcast episode cleanup**: a host corrects a spoken mistake in a long
   recording, removes dead air and exports an episode.
2. **Course lesson revision**: an instructor removes an obsolete explanation
   from a lesson, checks continuity and exports the updated lesson.
3. **Customer interview excerpt**: a researcher extracts one complete answer,
   shortens pauses and exports a shareable clip.

Each scenario uses the actual timeline, transcript and output artifact. Do not
invent task tables, dashboards or form submission in an audio editor. The first
can have the greatest benefit for frequent spoken-word creators who struggle
with waveform editing; professional sound engineers may benefit less if their
existing workflow is already fast and requires fine audio controls this product
does not offer. A video's audience can affect which example communicates that
benefit best, but not whether the audio capability helps the user.

## Infrastructure / API product

Chosen features: request traces, retry controls, delivery logs.
Goal: show a developer why debugging is easier.

1. Investigate a failed checkout webhook.
2. Recover a test CRM synchronization after a temporary outage.
3. Diagnose a staging release that changed a payload contract.

Use sandbox endpoints and redacted payloads. A CLI or API can be recorded through
real terminal commands and resulting logs; a visual business app is not required.
Do not perform replays against production merely to obtain a success screenshot.

## One-minute trade-off

If four chosen features cannot all have meaningful proof in a minute:

- Prefer one narrow task that uses several features naturally.
- Explain what remains unshown.
- Offer a shorter scope or a longer cut.
- Never solve the budget by omitting the result or accelerating a complex
  interaction until nobody can follow it.

## Dynamic story versus a result explanation

For a diagram editor, "show a completed workflow and describe the shapes" is
not the same as "draw the first step, name it, connect the next step, add a return
path, then move a node and see the arrows stay connected." The latter makes
the user's work and the product's contribution observable throughout the video.

For a query tool, do not spend the whole clip narrating a finished two-row
table. Enter the query, run it, add an urgency condition, refine to unassigned
work, then sort by deadline. Each result answers a question that motivates the
next action. Synthetic data may be prepared before capture if explicitly stated.

These action spines do not override beneficiary reasoning. They are how a
well-matched task becomes a comprehensible moving demonstration instead of a
collection of proof screenshots.

## Correct actions, weak product introduction

**Procedural:** "Create fields, submit a form, verify six records become seven."
This is an operator/test plan, not a product introduction.

**Generic:** "Keep information together so your team can collaborate better."
This removes the technical noise but teaches almost nothing about the product.

**Capability-led:** "Describe a store's operations; the connected Agent builds
related product/order tables. Bring in prepared business data and request a
dashboard. Ask for a different business view and watch that same dashboard
change. Request a collection form linked to the orders, then show how it is
used." Each transition demonstrates a different level of control.

This third version is appropriate only where those capabilities are supported.
Do not infer a working autonomous Agent from an API that can create tables.
Missing Agent footage is a named recording requirement, not permission to
relabel a manual form-submission clip.

Other products need different reveals:

- A transcript editor: selecting spoken words changes the audio, then audible
  playback proves the correction; do not merely show text typing and Export.
- A diagram editor: moving a node preserves its connectors, so the workflow
  remains editable; do not only draw three decorative boxes.
- A webhook debugger: connect a failure to its trace, correct a supported cause,
  and inspect a controlled retry; do not merely celebrate a green delivery row.

The common method is intent -> product mechanism -> observable transformation
-> useful control or outcome, not an Agent/table/dashboard template.
