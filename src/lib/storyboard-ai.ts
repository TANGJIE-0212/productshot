import type {
  WebsiteAnalysis,
  Storyboard,
  Scene,
  SceneType,
  HeroSceneProps,
  BrowserSceneProps,
  FeatureSceneProps,
  TextRevealSceneProps,
  OutroSceneProps,
  SceneTransition,
  SceneProps,
} from "./types";
import { VIDEO_CONFIG, SCENE_DEFAULTS } from "./constants";

/**
 * Generate a storyboard from website analysis data.
 * Can use AI (OpenAI) for smart generation, or fallback to template-based.
 */
export async function generateStoryboard(
  analysis: WebsiteAnalysis,
  style: "hook-feature-cta" | "problem-solution" | "quick-showcase" = "hook-feature-cta",
  durationTarget: number = 60
): Promise<Storyboard> {
  // Try AI-powered generation first, fallback to template
  try {
    if (process.env.OPENAI_API_KEY) {
      return await generateWithAI(analysis, style, durationTarget);
    }
  } catch (e) {
    console.warn("AI generation failed, using template:", e);
  }

  return generateFromTemplate(analysis, style, durationTarget);
}

// ============ AI-Powered Generation ============

async function generateWithAI(
  analysis: WebsiteAnalysis,
  style: string,
  durationTarget: number
): Promise<Storyboard> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });

  const prompt = buildAIPrompt(analysis, style, durationTarget);

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      {
        role: "system",
        content: `你是一个专业的产品介绍视频分镜师。根据网站分析数据，生成专业的产品介绍视频分镜脚本。
输出JSON格式，包含scenes数组。每个scene必须包含:
- type: "hero" | "browser" | "feature" | "textReveal" | "stats" | "outro"
- label: 场景中文描述
- durationInSeconds: 时长(秒)
- props: 对应类型的属性
- transition: { type: "fade"|"slide"|"wipe"|"none", durationInFrames: number }

请确保：
1. 总时长接近目标时长
2. 分镜节奏适当，不要太快也不要太慢
3. 使用产品的真实信息
4. 包含吸引人的文案
5. 合理使用转场效果`,
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");

  const parsed = JSON.parse(content);
  const scenes: Scene[] = (parsed.scenes || []).map(
    (s: Record<string, unknown>, i: number) => ({
      id: `scene-${i}`,
      type: s.type as SceneType,
      label: s.label as string,
      durationInSeconds: s.durationInSeconds as number,
      sceneProps: { type: s.type, props: s.props } as SceneProps,
      transition: (s.transition as SceneTransition) || {
        type: "fade",
        durationInFrames: 15,
      },
    })
  );

  const totalDurationInSeconds = scenes.reduce(
    (sum, s) => sum + s.durationInSeconds,
    0
  );

  return {
    id: `storyboard-${Date.now()}`,
    title: `${analysis.title} - 产品介绍视频`,
    description: `基于 ${analysis.url} 自动生成的产品介绍视频`,
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    scenes,
    totalDurationInSeconds,
  };
}

function buildAIPrompt(
  analysis: WebsiteAnalysis,
  style: string,
  durationTarget: number
): string {
  const screenshotRefs = analysis.screenshots
    .map((s) => `- ${s.id}: ${s.label}`)
    .join("\n");

  const featureList = analysis.features
    .map((f) => `- ${f.title}: ${f.description}`)
    .join("\n");

  return `
## 网站信息
- 网址: ${analysis.url}
- 标题: ${analysis.title}
- 描述: ${analysis.description}
- 主色调: ${analysis.colors.primary}
- 渐变色: ${analysis.colors.gradientColors.join(" → ")}

## 可用截图
${screenshotRefs}

## 产品功能
${featureList}

## 要求
- 视频风格: ${style}
- 目标时长: ${durationTarget}秒
- 分辨率: ${VIDEO_CONFIG.width}x${VIDEO_CONFIG.height}
- 帧率: ${VIDEO_CONFIG.fps}fps

请生成分镜脚本JSON，格式如下:
{
  "scenes": [
    {
      "type": "hero",
      "label": "开场",
      "durationInSeconds": 5,
      "props": { "title": "...", "subtitle": "...", "gradientColors": ["#hex1", "#hex2"] },
      "transition": { "type": "fade", "durationInFrames": 15 }
    },
    ...
  ]
}

对于每种scene type，props格式:
- hero: { title, subtitle, gradientColors: [string, string], logoUrl? }
- browser: { screenshotUrl: "screenshot-id引用", browserUrl, scrollAnimation: boolean }
- feature: { title, description, screenshotUrl: "screenshot-id引用", iconEmoji, position: "left"|"right" }
- textReveal: { lines: string[], fontSize: number, color, animationStyle: "typewriter"|"fade"|"slide" }
- stats: { stats: [{ value, label, icon }] }
- outro: { ctaText, productUrl, gradientColors: [string, string] }
`;
}

// ============ Template-Based Generation ============

function generateFromTemplate(
  analysis: WebsiteAnalysis,
  style: string,
  durationTarget: number
): Storyboard {
  let scenes: Scene[];

  switch (style) {
    case "problem-solution":
      scenes = buildProblemSolutionScenes(analysis, durationTarget);
      break;
    case "quick-showcase":
      scenes = buildQuickShowcaseScenes(analysis);
      break;
    case "hook-feature-cta":
    default:
      scenes = buildHookFeatureCTAScenes(analysis, durationTarget);
      break;
  }

  const totalDurationInSeconds = scenes.reduce(
    (sum, s) => sum + s.durationInSeconds,
    0
  );

  return {
    id: `storyboard-${Date.now()}`,
    title: `${analysis.title} - 产品介绍视频`,
    description: `基于 ${analysis.url} 自动生成的产品介绍视频`,
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    scenes,
    totalDurationInSeconds,
  };
}

function buildHookFeatureCTAScenes(
  analysis: WebsiteAnalysis,
  durationTarget: number
): Scene[] {
  const scenes: Scene[] = [];
  const featureCount = Math.min(analysis.features.length, 4);
  const featureDuration = Math.max(
    5,
    Math.floor((durationTarget - 18) / Math.max(featureCount, 1))
  );

  // 1. Hero Scene
  scenes.push(
    createScene("scene-0", "hero", "🎬 开场 - 产品亮相", 5, {
      type: "hero",
      props: {
        title: analysis.title,
        subtitle: analysis.description?.slice(0, 80) || "让工作更高效",
        gradientColors: analysis.colors.gradientColors,
        logoUrl: analysis.favicon,
      } satisfies HeroSceneProps,
    }, { type: "none", durationInFrames: 0 })
  );

  // 2. Browser Screenshot
  scenes.push(
    createScene("scene-1", "browser", "🖥️ 产品全貌展示", 7, {
      type: "browser",
      props: {
        screenshotUrl: analysis.screenshots[0]?.url || "",
        browserUrl: analysis.url,
        scrollAnimation: true,
      } satisfies BrowserSceneProps,
    }, { type: "slide", direction: "from-bottom", durationInFrames: 20 })
  );

  // 3. Feature Scenes
  analysis.features.slice(0, featureCount).forEach((feature, i) => {
    const screenshot =
      analysis.screenshots.find((s) => s.id === feature.screenshotId) ||
      analysis.screenshots[Math.min(i + 2, analysis.screenshots.length - 1)];

    scenes.push(
      createScene(
        `scene-${i + 2}`,
        "feature",
        `✨ 功能亮点 - ${feature.title}`,
        featureDuration,
        {
          type: "feature",
          props: {
            title: feature.title,
            description: feature.description,
            screenshotUrl: screenshot?.url || "",
            iconEmoji: feature.icon || "✨",
            position: i % 2 === 0 ? "left" : "right",
          } satisfies FeatureSceneProps,
        },
        { type: "fade", durationInFrames: 15 }
      )
    );
  });

  // 4. Outro CTA
  scenes.push(
    createScene(
      `scene-${scenes.length}`,
      "outro",
      "🎯 行动号召",
      6,
      {
        type: "outro",
        props: {
          ctaText: "立即体验",
          productUrl: analysis.url,
          logoUrl: analysis.favicon,
          gradientColors: analysis.colors.gradientColors,
        } satisfies OutroSceneProps,
      },
      { type: "wipe", direction: "from-bottom", durationInFrames: 20 }
    )
  );

  return scenes;
}

function buildProblemSolutionScenes(
  analysis: WebsiteAnalysis,
  durationTarget: number
): Scene[] {
  const scenes: Scene[] = [];

  // 1. Problem statement
  scenes.push(
    createScene("scene-0", "textReveal", "😰 痛点描述", 6, {
      type: "textReveal",
      props: {
        lines: ["你是否还在为此烦恼？", analysis.description?.slice(0, 40) || "工作效率低下？"],
        fontSize: 64,
        color: "#ffffff",
        animationStyle: "typewriter",
        backgroundColor: "#1a1a2e",
      } satisfies TextRevealSceneProps,
    }, { type: "none", durationInFrames: 0 })
  );

  // 2. Solution intro
  scenes.push(
    createScene("scene-1", "hero", "💡 解决方案", 5, {
      type: "hero",
      props: {
        title: analysis.title,
        subtitle: "全新解决方案",
        gradientColors: analysis.colors.gradientColors,
        logoUrl: analysis.favicon,
      } satisfies HeroSceneProps,
    }, { type: "fade", durationInFrames: 20 })
  );

  // 3. Demo walkthrough
  scenes.push(
    createScene("scene-2", "browser", "🖥️ 产品演示", 8, {
      type: "browser",
      props: {
        screenshotUrl: analysis.screenshots[0]?.url || "",
        browserUrl: analysis.url,
        scrollAnimation: true,
      } satisfies BrowserSceneProps,
    }, { type: "slide", direction: "from-right", durationInFrames: 20 })
  );

  // 4. Key features
  const topFeatures = analysis.features.slice(0, 3);
  topFeatures.forEach((feature, i) => {
    const screenshot =
      analysis.screenshots[Math.min(i + 2, analysis.screenshots.length - 1)];
    scenes.push(
      createScene(`scene-${i + 3}`, "feature", `✨ ${feature.title}`, 7, {
        type: "feature",
        props: {
          title: feature.title,
          description: feature.description,
          screenshotUrl: screenshot?.url || "",
          iconEmoji: feature.icon || "✨",
          position: i % 2 === 0 ? "left" : "right",
        } satisfies FeatureSceneProps,
      }, { type: "fade", durationInFrames: 15 })
    );
  });

  // 5. CTA
  scenes.push(
    createScene(`scene-${scenes.length}`, "outro", "🎯 立即行动", 6, {
      type: "outro",
      props: {
        ctaText: "开始使用",
        productUrl: analysis.url,
        gradientColors: analysis.colors.gradientColors,
      } satisfies OutroSceneProps,
    }, { type: "wipe", direction: "from-bottom", durationInFrames: 20 })
  );

  return scenes;
}

function buildQuickShowcaseScenes(analysis: WebsiteAnalysis): Scene[] {
  const scenes: Scene[] = [];

  // 1. Logo + Name
  scenes.push(
    createScene("scene-0", "hero", "🎬 品牌亮相", 3, {
      type: "hero",
      props: {
        title: analysis.title,
        subtitle: analysis.description?.slice(0, 50) || "",
        gradientColors: analysis.colors.gradientColors,
        logoUrl: analysis.favicon,
      } satisfies HeroSceneProps,
    }, { type: "none", durationInFrames: 0 })
  );

  // 2. Hero Screenshot
  scenes.push(
    createScene("scene-1", "browser", "🖥️ 产品展示", 8, {
      type: "browser",
      props: {
        screenshotUrl: analysis.screenshots[0]?.url || "",
        browserUrl: analysis.url,
        scrollAnimation: false,
      } satisfies BrowserSceneProps,
    }, { type: "slide", direction: "from-bottom", durationInFrames: 15 })
  );

  // 3. Top 3 features as text
  const featureLines = analysis.features
    .slice(0, 3)
    .map((f) => `${f.icon || "✨"} ${f.title}`);

  if (featureLines.length > 0) {
    scenes.push(
      createScene("scene-2", "textReveal", "📝 核心功能", 12, {
        type: "textReveal",
        props: {
          lines: featureLines,
          fontSize: 56,
          color: "#ffffff",
          animationStyle: "slide",
          backgroundColor: analysis.colors.primary,
        } satisfies TextRevealSceneProps,
      }, { type: "fade", durationInFrames: 15 })
    );
  }

  // 4. CTA
  scenes.push(
    createScene(`scene-${scenes.length}`, "outro", "🎯 立即体验", 5, {
      type: "outro",
      props: {
        ctaText: "立即访问",
        productUrl: analysis.url,
        gradientColors: analysis.colors.gradientColors,
      } satisfies OutroSceneProps,
    }, { type: "fade", durationInFrames: 15 })
  );

  return scenes;
}

function createScene(
  id: string,
  type: SceneType,
  label: string,
  durationInSeconds: number,
  sceneProps: SceneProps,
  transition: SceneTransition
): Scene {
  return { id, type, label, durationInSeconds, sceneProps, transition };
}
