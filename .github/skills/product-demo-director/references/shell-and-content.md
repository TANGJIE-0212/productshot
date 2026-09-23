# Workspace shell is not production content

## The shell: safe places for visual design

Brand mark, header, footer, navigation, stage progress, action buttons, waiting
states, and the Skill introduction. The native Agent conversation is outside
this website and must not be recreated as a sidebar.

Use a consistent restrained palette: warm off-white, muted lavender, sage green,
and dark readable text. Original line illustrations may decorate the introduction
or shell margins. They must not obscure controls or be presented as production
assets. Keep information hierarchy and accessible contrast ahead of decoration.

The runtime's `brand-story.svg` is an original shell illustration created in this
workspace. It does not show the user's product and is not an exported video asset.
Do not add it to a storyboard or recording plan automatically.

## The content: project-owned, evidence-backed

- Product source and facts
- Candidate capabilities and references
- User-selected capabilities and audience
- Scenario outline and business steps
- Shot directions, approved narration and timing
- Captured footage, screenshots and generated media explicitly requested
- Review findings and approved output

These come from inspection, user decisions, or authorized production, not the
UI designer's imagination. Missing content remains missing with a waiting state.
Never insert a decorative image to make an empty artifact panel look completed.

An outline is a plain scenario plus ordered business steps. For example:

> Small supermarket → build empty tables → import data → dashboard → collect an order.

It does not require images. The "collect an order" step can later contain three
shots: open the form, fill fields, submit and verify. A shell redesign cannot
collapse or alter those relationships.

## When illustration can become content

Only when the user chooses an explanation/generated-media shot:

1. Record the communication purpose and approved topic.
2. Record the asset source, rights, required budget and generation method.
3. Preserve it as a separate layer/asset from actual product footage.
4. Mark it as explanatory or generated, not real interaction evidence.
5. Approve the actual asset before promoting a final video.

No logos, copied competitor drawings, placeholder business metrics, fake Agent
messages or "success" overlays may be used as product evidence.

## Coupled editing, separate ownership

The Agent and browser edit the same versioned project through the runner.
Changes to CSS, brand artwork or navigation must not mutate stage documents,
invalidate their approvals, or overwrite imported evidence.
Changes to a stage document must invalidate affected approvals even if its UI
still looks the same.

The user talks to Codex in its native conversation; Codex runs the Skill and
opens this page in its in-app browser. The page is a result viewer/editor, not
a chat client waiting for a model API. Browser saves are read by the Agent on
the next native turn, while Agent publications appear through viewer polling.
Never make the user send the same feedback in two different chat boxes.
