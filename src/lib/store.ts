import { create } from "zustand";
import type {
  AppStep,
  WebsiteAnalysis,
  Storyboard,
  Scene,
} from "./types";

interface AppStore {
  // State
  step: AppStep;
  url: string;
  analysis: WebsiteAnalysis | null;
  storyboard: Storyboard | null;
  renderedVideoUrl: string | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  setStep: (step: AppStep) => void;
  setUrl: (url: string) => void;
  setAnalysis: (analysis: WebsiteAnalysis) => void;
  setStoryboard: (storyboard: Storyboard) => void;
  setRenderedVideoUrl: (url: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Storyboard editing actions
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  removeScene: (sceneId: string) => void;
  addScene: (scene: Scene, afterIndex: number) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  updateSceneDuration: (sceneId: string, durationInSeconds: number) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  step: "input" as AppStep,
  url: "",
  analysis: null,
  storyboard: null,
  renderedVideoUrl: null,
  error: null,
  isLoading: false,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setUrl: (url) => set({ url }),
  setAnalysis: (analysis) => set({ analysis }),
  setStoryboard: (storyboard) => set({ storyboard }),
  setRenderedVideoUrl: (url) => set({ renderedVideoUrl: url }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  updateScene: (sceneId, updates) => {
    const { storyboard } = get();
    if (!storyboard) return;

    const scenes = storyboard.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, ...updates } : scene
    );
    const totalDurationInSeconds = scenes.reduce(
      (sum, s) => sum + s.durationInSeconds,
      0
    );
    set({
      storyboard: { ...storyboard, scenes, totalDurationInSeconds },
    });
  },

  removeScene: (sceneId) => {
    const { storyboard } = get();
    if (!storyboard) return;

    const scenes = storyboard.scenes.filter((s) => s.id !== sceneId);
    const totalDurationInSeconds = scenes.reduce(
      (sum, s) => sum + s.durationInSeconds,
      0
    );
    set({
      storyboard: { ...storyboard, scenes, totalDurationInSeconds },
    });
  },

  addScene: (scene, afterIndex) => {
    const { storyboard } = get();
    if (!storyboard) return;

    const scenes = [...storyboard.scenes];
    scenes.splice(afterIndex + 1, 0, scene);
    const totalDurationInSeconds = scenes.reduce(
      (sum, s) => sum + s.durationInSeconds,
      0
    );
    set({
      storyboard: { ...storyboard, scenes, totalDurationInSeconds },
    });
  },

  reorderScenes: (fromIndex, toIndex) => {
    const { storyboard } = get();
    if (!storyboard) return;

    const scenes = [...storyboard.scenes];
    const [moved] = scenes.splice(fromIndex, 1);
    scenes.splice(toIndex, 0, moved);
    set({
      storyboard: { ...storyboard, scenes },
    });
  },

  updateSceneDuration: (sceneId, durationInSeconds) => {
    const { storyboard } = get();
    if (!storyboard) return;

    const scenes = storyboard.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, durationInSeconds } : scene
    );
    const totalDurationInSeconds = scenes.reduce(
      (sum, s) => sum + s.durationInSeconds,
      0
    );
    set({
      storyboard: { ...storyboard, scenes, totalDurationInSeconds },
    });
  },

  reset: () => set(initialState),
}));
