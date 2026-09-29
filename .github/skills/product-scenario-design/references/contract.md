# Scenario handoff contract

This is an Agent-authored planning document, not an API already connected to the
prototype. Store it privately as `scenario-design.json` when file output is
appropriate. Use stable ASCII IDs. Preserve revisions and user edits.

This is a supporting handoff, not the thinking method or a user questionnaire.
First understand the problem-solving mechanism and rank beneficiaries. Scenario
recommendations then explain how to show their benefit. Recording convenience
and feature coverage must not substitute for that reasoning.

## Shape

```json
{
  "format": "productshot-scenario-design",
  "version": 1,
  "revision": 1,
  "status": "draft",
  "sourceRevision": "inspected commit, deployment or dated source",
  "goal": {
    "raw": "Present the project to leadership, about one minute.",
    "videoAudience": "Leadership",
    "intendedTakeaway": "The product completes a useful task with a visible result.",
    "durationSeconds": 60
  },
  "presentationMode": "scenario",
  "productValue": {
    "job": "Consolidate incoming service requests for follow-up",
    "currentAlternative": "Read separate messages and manually maintain a list",
    "problem": "Requests can be missed and are difficult to locate consistently",
    "mechanism": "A structured form writes each request into one shared list",
    "benefit": "The coordinator can locate the submitted request without reconciling messages",
    "limits": "Assignment and notifications are not established capabilities"
  },
  "features": [
    {
      "id": "collect",
      "title": "Collect structured input",
      "confidence": "documented",
      "evidence": ["product documentation reference"],
      "visibleProof": "A submitted item appears in the destination list.",
      "limitations": "Runtime and submission permissions unverified."
    }
  ],
  "userGroups": [
    {
      "id": "coordinator",
      "user": "Service coordinator",
      "pain": "Requests arrive in separate messages without a shared status.",
      "basis": "Scenario hypothesis inferred from the documented collection feature.",
      "benefitRank": 1,
      "currentAlternative": "Manually copy requests out of incoming messages",
      "problemImportance": "Potentially frequent intake with a risk of missed requests; frequency needs confirmation.",
      "benefit": "Consistent intake into a shared list instead of manual reconciliation.",
      "rankReason": "Direct fit where fragmented intake is frequent; less benefit for a team already using a suitable ticketing system.",
      "assumptions": ["The team currently lacks a shared intake system."],
      "featureIds": ["collect"]
    }
  ],
  "candidates": [
    {
      "id": "service-requests",
      "title": "Service request intake",
      "userGroupId": "coordinator",
      "trigger": "A resident reports a broken light.",
      "startingState": "An authorized test workspace with no request for this light.",
      "sampleContext": "Synthetic maintenance request; no real resident information.",
      "story": "The resident submits the issue and the coordinator verifies its arrival.",
      "actionSpine": [
        {
          "action": "Resident fills and submits the actual request form",
          "visibleChange": "Submission succeeds and a new item is available",
          "leadsTo": "Coordinator opens that same item to review the issue"
        }
      ],
      "steps": [
        {
          "id": "submit-request",
          "title": "Submit a maintenance request",
          "purpose": "Replace an unstructured message with a trackable item.",
          "featureIds": ["collect"],
          "result": "The request appears in the shared list."
        }
      ],
      "outcome": "The same request is available for follow-up.",
      "benefitShown": "A request that would otherwise sit in a separate message is immediately findable in the shared intake list.",
      "coverage": {
        "selectedFeatureIds": ["collect"],
        "uncoveredFeatureIds": [],
        "additionalDependencies": []
      },
      "requirements": ["Test form and permitted submission"],
      "limitations": ["Assignment and notifications are not established capabilities."],
      "goalFit": "One visible input-to-record proof fits a short review.",
      "rank": 1,
      "recommendationReason": "Demonstrates the coordinator's main benefit: a request no longer needs manual copying from scattered messages."
    }
  ],
  "recommendedId": "service-requests",
  "selectedId": null,
  "constraints": [
    {
      "id": "synthetic-only",
      "strength": "locked",
      "text": "Use synthetic records only.",
      "origin": "User instruction"
    }
  ],
  "openQuestions": ["Which test deployment may be used for recording?"]
}
```

The JSON illustrates one candidate's shape, **not** a complete output. A complete
proposal contains at least three candidates (or an explicit evidence shortfall
with provisional alternatives). `selectedId: null` is valid before the user
chooses. `recommendedId` is never approval.

`userGroups` is ordered by `benefitRank`, with explicit reasons comparing the
plausible groups. `candidates[].rank` is the recommendation order for this video.
If these orders differ, explain why in `goalFit` and `recommendationReason`;
changing the channel or audience does not change product-benefit claims.

`durationSeconds` is optional; omit it when unspecified instead of guessing a
requirement. `status` is `draft`, `selected`, or `approved`; set `approved` only
for the actual revision the user confirmed. Constraint strength is `locked`,
`preferred`, `open`, or `rejected`, with the originating instruction/reference.

## Consistency checks

For a product introduction, add the following planning fields without changing
the legacy runner's document shape:

- `productThesis`: user intent, distinctive mechanism and usable outcome.
- `deliverableKind`: introduction, tutorial or focused-proof.
- `capabilityPriorities`: stable feature ID, must-show/supporting/omitted role,
  mechanism, audience takeaway, evidence status and independent capture status.
- `candidates[].capabilityProgression`: step ID, feature IDs, user intent,
  product transformation, visible reveal, audience takeaway and next motivation.
- `candidates[].unshownMustShow`: any must-show IDs not demonstrated and why.
  This must be empty for a complete introduction, or the proposal must explicitly
  retain those beats as blocked rather than claim the story is production-ready.

These are authored conclusions, not fields for the user to fill. For direct
feature mode, the thesis and priorities can accompany the recording handoff
without creating scenario candidates or forcing a scene-selection screen.

- The beneficiary ranking follows problem importance, direct product fit and
  improvement over the current alternative; it is not just feature count.
- Each candidate's benefit and recommendation are tied to its user group.
- Its action spine describes observable progress, not just a list of final
  screens. A narrow assertion-only clip is labeled accordingly.
- All IDs are unique in their collection; step IDs are unique across candidates.
- Every step feature ID exists in the evidence map.
- Coverage refers to actual user-selected features, not all discovered features.
- Missing coverage is disclosed, not silently removed from the brief.
- Additional dependencies carry their own confidence and confirmation need.
- Recommended/selected IDs reference existing candidates.
- A custom candidate follows the same shape and uncertainty rules.
- Changes to a selected scenario invalidate the affected script approval.

## ProductShot runner adapter

The existing runtime's `outline` document accepts:

```json
{
  "scenarios": [
    {
      "id": "service-requests",
      "title": "Service request intake",
      "context": "Synthetic maintenance task in an authorized test workspace.",
      "outcome": "The submitted request appears in the shared list.",
      "steps": [
        {
          "id": "submit-request",
          "title": "Submit a maintenance request",
          "purpose": "Prove input reaches the destination record."
        }
      ]
    }
  ]
}
```

Map only the selected candidate, not all alternatives. Keep the richer contract
alongside it so user/pain, coverage, evidence and constraints are not lost.
Use [runtime.md](../../product-demo-director/references/runtime.md) to read the
latest revision and publish. The legacy runner needs selection approval before
outline publication. Do not manufacture approval to bypass that gate.
