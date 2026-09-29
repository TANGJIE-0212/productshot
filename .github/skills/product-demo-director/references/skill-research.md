# Public skill research

Inspected on 2026-09-25. These are reference patterns, not installed dependencies.
Links point to the inspected repositories' moving `main` branches; behavior may
change. The two ProductShot skills are original synthesis, not copied third-party
skill files. No repository scripts were executed or installed for this research.

| Inspected source | Useful pattern | Not provided by it |
| --- | --- | --- |
| [Product marketing](https://github.com/coreyhaines31/marketingskills/blob/main/skills/product-marketing/SKILL.md) | Audience roles, jobs-to-be-done, pains, benefits and proof context | Specific demo scenarios and actual recording procedure |
| [Promo storyboard](https://github.com/kangarooking/promo-creator-skills/blob/main/promo-storyboard/SKILL.md) | Shot objective, exact screen text, animation detail, assets and timing | Reproducible live software interaction; its orientation is HyperFrames/promotional composition |
| [Playwright CLI skill](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/SKILL.md) | Inspect current browser state before choosing targets and interacting | Product positioning, use-case selection, full editorial planning |
| [Skill creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) | Clear triggers, explicit output, realistic evaluation, short core with supporting references | Domain knowledge for product-demo planning |
| [Remotion create](https://github.com/remotion-dev/skills/blob/main/skills/remotion-create/SKILL.md) | Composition workflow and deliberate scene structure | Evidence that the product was operated; rendering is not recording |

Supporting references (not additional standalone skills):

- [OpenScreen README](https://github.com/getopenscreen/openscreen/blob/main/README.md)
  and [CLI reference](https://github.com/getopenscreen/openscreen/blob/main/website/docs/cli.md):
  additionally inspected 2026-09-25 for capture, zoom, annotations, trims, speed
  regions and export. This is a tool, not a planning skill; CLI needs a desktop
  session and its schema/interface must be version-checked. Detailed caveats and
  effect mapping are in the recording skill's
  [tool reference](../../recording-script-design/references/recording-tools.md).
- [Playwright video recording](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/references/video-recording.md):
  real WebM capture, capture preparation, cursor/callout/highlight concepts.
  Verify installed tool versions before using its commands; researched APIs may
  depend on newer/alpha versions.
- [Playwright test generation](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/references/test-generation.md):
  generated interactions do not establish success automatically; explicit
  assertions/readback are needed.
- [Remotion video layout](https://github.com/remotion-dev/skills/blob/main/skills/remotion-create/video-layout.md):
  one dominant focus, readable text and safe areas. Apply to the presentation
  layer, not a fake replacement product UI.

## Decisions for ProductShot

1. Exactly two new domain skills: scenario design and recording-script design.
2. Separate product users/pains from the video audience/goal.
3. Scenario alternatives are concrete use cases, never just filming styles.
4. Script detail combines exact operations and assertions with editorial,
   camera, highlight, voice and copy cues.
5. Event-based timing precedes measured seconds. Never equate a configured
   animation duration with observed product performance.
6. Use neutral contracts plus a thin adapter to the existing runner; do not
   claim the browser prototype already invokes these skills.
7. Keep the parent director as orchestration, not a third duplicated design
   method or a hidden model service.
