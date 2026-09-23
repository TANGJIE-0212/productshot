import { z } from "zod";

// ============ Website Analysis Types ============

export interface WebsiteAnalysis {
  url: string;
  title: string;
  description: string;
  favicon?: string;
  ogImage?: string;
  screenshots: ScreenshotInfo[];
  colors: ColorPalette;
  features: FeatureInfo[];
  techStack?: string[];
  metadata: Record<string, string>;
}

export interface ScreenshotInfo {
  id: string;
  url: string; // local path or data URL
  label: string;
  width: number;
  height: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradientColors: [string, string];
}

export interface FeatureInfo {
  title: string;
  description: string;
  screenshotId?: string; // reference to a screenshot
  icon?: string; // emoji
}

// ============ Storyboard Types ============

export const SceneTypeEnum = z.enum([
  "hero",
  "browser",
  "feature",
  "textReveal",
  "stats",
  "comparison",
  "outro",
]);
export type SceneType = z.infer<typeof SceneTypeEnum>;

export const TransitionTypeEnum = z.enum(["fade", "slide", "wipe", "flip", "none"]);
export type TransitionType = z.infer<typeof TransitionTypeEnum>;

export const TransitionDirectionEnum = z.enum([
  "from-left",
  "from-right",
  "from-top",
  "from-bottom",
]);
export type TransitionDirection = z.infer<typeof TransitionDirectionEnum>;

export interface SceneTransition {
  type: TransitionType;
  direction?: TransitionDirection;
  durationInFrames: number;
}

// Scene props for each scene type
export interface HeroSceneProps {
  title: string;
  subtitle: string;
  gradientColors: [string, string];
  logoUrl?: string;
}

export interface BrowserSceneProps {
  screenshotUrl: string;
  browserUrl: string;
  scrollAnimation: boolean;
  zoomToArea?: { x: number; y: number; width: number; height: number };
}

export interface FeatureSceneProps {
  title: string;
  description: string;
  screenshotUrl: string;
  iconEmoji: string;
  position: "left" | "right";
}

export interface TextRevealSceneProps {
  lines: string[];
  fontSize: number;
  color: string;
  animationStyle: "typewriter" | "fade" | "slide";
  backgroundColor?: string;
}

export interface StatsSceneProps {
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  backgroundColor?: string;
}

export interface ComparisonSceneProps {
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
}

export interface OutroSceneProps {
  ctaText: string;
  productUrl: string;
  logoUrl?: string;
  gradientColors: [string, string];
}

export type SceneProps =
  | { type: "hero"; props: HeroSceneProps }
  | { type: "browser"; props: BrowserSceneProps }
  | { type: "feature"; props: FeatureSceneProps }
  | { type: "textReveal"; props: TextRevealSceneProps }
  | { type: "stats"; props: StatsSceneProps }
  | { type: "comparison"; props: ComparisonSceneProps }
  | { type: "outro"; props: OutroSceneProps };

export interface Scene {
  id: string;
  type: SceneType;
  label: string;
  durationInSeconds: number;
  sceneProps: SceneProps;
  transition: SceneTransition;
}

export interface Storyboard {
  id: string;
  title: string;
  description: string;
  fps: number;
  width: number;
  height: number;
  scenes: Scene[];
  totalDurationInSeconds: number;
}

// ============ App State Types ============

export type AppStep = "input" | "analyzing" | "storyboard" | "preview" | "rendering" | "done";

export interface AppState {
  step: AppStep;
  url: string;
  analysis: WebsiteAnalysis | null;
  storyboard: Storyboard | null;
  renderedVideoUrl: string | null;
  error: string | null;
}

// ============ API Types ============

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: WebsiteAnalysis;
  error?: string;
}

export interface StoryboardRequest {
  analysis: WebsiteAnalysis;
  style?: "hook-feature-cta" | "problem-solution" | "quick-showcase";
  durationTarget?: number; // seconds
}

export interface StoryboardResponse {
  success: boolean;
  data?: Storyboard;
  error?: string;
}

export interface RenderRequest {
  storyboard: Storyboard;
}

export interface RenderResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}
