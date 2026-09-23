# ProductShot plan handoff

Write UTF-8 JSON named `productshot-plan.json`.

## Outline checkpoint (planned protocol)

The earlier handoff is an outline, not a recording-ready shot plan:

```json
{
  "format": "productshot-outline",
  "version": 1,
  "revision": 1,
  "status": "draft",
  "audience": "Partners familiar with the product, but not its new features",
  "selectedCapabilities": ["dashboard", "forms"],
  "scenarios": [
    {
      "id": "scenario-01",
      "title": "Review sales and collect a new order",
      "context": "Use one authorized sample business and dataset.",
      "outcome": "Show how insight and collection use the same data.",
      "steps": [
        { "id": "step-01", "title": "Inspect the dashboard", "purpose": "Find a useful insight." },
        { "id": "step-02", "title": "Submit a form", "purpose": "Verify a new record enters the same system." }
      ]
    }
  ]
}
```

`status` is `draft` or `approved`; approval covers the outline only. Alternatives
are separate outline revisions/proposals, not automatically combined scenarios.
Save the selected outline and user edits before expanding its steps into shots.
The current mockup uses local outline presets and editing; importing this
outline-only format and exchanging live Agent revisions are not implemented.

## Required shape

```json
{
  "format": "productshot-plan",
  "version": 1,
  "status": "approved",
  "revision": 1,
  "project": {
    "name": "Inventory workflow demo",
    "audience": {
      "id": "team",
      "label": "Team / All Hands"
    },
    "source": {
      "type": "url",
      "value": "https://product.example",
      "accessNotes": "Login required; use the approved test workspace."
    }
  },
  "capabilities": [
    {
      "id": "structure",
      "title": "Generate a connected structure",
      "proof": "Five empty tables and their fields are visible.",
      "evidence": ["README.md#...", "route:/workspace/..."],
      "confidence": "verified"
    }
  ],
  "scenario": {
    "type": "workflow",
    "summary": "Start empty, add data, inspect the dashboard, submit a form.",
    "reason": "One task proves that the selected capabilities stay connected."
  },
  "story": {
    "opening": "The team starts with no operating structure.",
    "task": "Create and operate a small inventory workflow.",
    "result": "The submitted order returns to the same connected system.",
    "takeaway": "One source of data supports setup, insight, and collection."
  },
  "constraints": [
    {
      "id": "empty-first",
      "level": "locked",
      "text": "The first product state must be an empty table."
    }
  ],
  "shots": [
    {
      "id": "shot-01",
      "title": "Start from an empty structure",
      "kind": "product",
      "purpose": "Prove that the system begins without seeded records.",
      "before": "The authorized test workspace is open.",
      "action": "Open the generated Products table.",
      "after": "The table structure is visible with zero records.",
      "focus": "Table list and recommended fields.",
      "evidence": ["verified empty workspace"],
      "sourceType": "real-recording",
      "sound": "Explain the recommended structure.",
      "transition": "The empty rows become the starting point for incoming data.",
      "mustKeep": ["zero-record state", "field recommendations"],
      "direction": {
        "before": "Show the Products table in the authorized test workspace with zero records.",
        "actions": "1. Open Products.\n2. Inspect the recommended fields.\n3. Keep the empty grid visible before importing data.",
        "highlight": "Outline the recommended field headers after they are visible; remove before the import.",
        "camera": "Start on the whole workspace; gently push toward the headers while retaining the table name; pull back to the grid.",
        "motion": "Only the attention outline and camera move. Do not animate rows arriving before the actual import.",
        "after": "The empty structure is readable and ready for data.",
        "hold": "Wait for headers and zero-record state, then allow reading; coordinate with narration if present.",
        "transition": "Keep the same table as the next shot begins importing data.",
        "verify": "Confirm zero records and the expected fields; stop if the state differs.",
        "mustKeep": "Zero-record state; recommended fields; no data before import."
      },
      "estimatedSeconds": 8
    }
  ],
  "permissions": {
    "planApproved": true,
    "productWritesApproved": false,
    "paidMediaApproved": false,
    "publicPublishingApproved": false
  },
  "approval": {
    "approvedAt": "ISO-8601 timestamp",
    "approvedBy": "user",
    "summary": "User approved the story and shot plan in the current conversation."
  }
}
```

## Validation rules

- `format` and `version` are exact.
- `status` is `approved` before Studio accepts the file.
- `revision` is a positive integer.
- `capabilities` contains at least one item.
- `shots` contains 1–24 unique IDs.
- Shot IDs use 1–100 ASCII letters, digits, underscores or hyphens.
- `kind` is `product`, `explanation`, `generated`, or `mixed`.
- `sourceType` is `real-recording`, `explanation`, `generated-media`, or `mixed`.
- New plans include all ten nonempty string fields in `direction` (see the shot
  guide). Each is at most 2000 characters. This is an additive v1 field.
- Older v1 plans without `direction` may be imported, but their shooting details
  remain incomplete and need confirmation before production.
- `estimatedSeconds` is optional, 2–30 when present, and generated by the Agent
  as a rough production hint. The user need not supply seconds. The UI may use
  a clearly labeled temporary preview duration until rehearsal determines timing.
- Preserve stable shot IDs, original source type, evidence, constraints and
  complete shot contracts through import/export. Display placeholders never
  replace their original semantics.
- Every product claim has evidence or an explicit `needs-confirmation` confidence.
- Approval permissions are separate. Plan approval never implies write, paid media, or publishing permission.
- Do not include secrets, session cookies, bearer tokens, browser profiles, or copied private source files.

## Revision behavior

An updated plan receives a higher `revision`. Preserve:

- Previous approved plan
- New plan
- User feedback that caused the revision
- Locked constraints

Studio should display the plan as imported and approved, while capture permissions remain unapproved until the production step.
