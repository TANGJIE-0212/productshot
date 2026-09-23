---
name: product-demo-director
description: Use when the user wants a product demo from a URL or repo. Run the director workflow in native Codex chat and open its editable result page in the in-app browser.
---

# Product Demo Director for Codex

This is the Codex discovery entry point, not a separate implementation.

Read and follow the canonical workflow at
[Product Demo Director](../../../.github/skills/product-demo-director/SKILL.md),
then its [runtime reference](../../../.github/skills/product-demo-director/references/runtime.md).
Resolve those links relative to this file. All runtime commands and assets live
in `.github/skills/product-demo-director/` at the repository root.

The left side is this native Codex conversation. Use native questions and user
replies here. The right side is the local result webpage opened with the host's
in-app browser tools. Do not create a webpage chat panel, a second model process,
or a manual feedback relay.

Reuse the current project when continuing. Read it before each response or
mutation, publish only approved-stage drafts, and verify the same browser page
updates. If browser tools are unavailable, state that limitation and provide
the loopback URL; do not claim to have opened an in-app browser.
