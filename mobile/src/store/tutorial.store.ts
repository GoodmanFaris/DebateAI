import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const TUTORIAL_DONE_KEY = "tutorial_done";
const TUTORIAL_STEP_KEY = "tutorial_step";

type TutorialState = {
  tutorialActive: boolean;
  tutorialStep: number;
  loaded: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  goToStep: (step: number) => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  loadTutorialState: () => Promise<void>;
};

export const useTutorialStore = create<TutorialState>((set, get) => ({
  tutorialActive: false,
  tutorialStep: 0,
  loaded: false,

  loadTutorialState: async () => {
    const done = await SecureStore.getItemAsync(TUTORIAL_DONE_KEY);
    if (done === "true") {
      set({ tutorialActive: false, loaded: true });
      return;
    }

    const savedStep = await SecureStore.getItemAsync(TUTORIAL_STEP_KEY);
    if (savedStep !== null) {
      set({
        tutorialActive: true,
        tutorialStep: parseInt(savedStep, 10),
        loaded: true,
      });
    } else {
      set({ tutorialActive: true, tutorialStep: 0, loaded: true });
    }
  },

  startTutorial: () => {
    SecureStore.setItemAsync(TUTORIAL_STEP_KEY, "0");
    set({ tutorialActive: true, tutorialStep: 0 });
  },

  nextStep: () => {
    const next = get().tutorialStep + 1;
    SecureStore.setItemAsync(TUTORIAL_STEP_KEY, String(next));
    set({ tutorialStep: next });
  },

  goToStep: (step: number) => {
    SecureStore.setItemAsync(TUTORIAL_STEP_KEY, String(step));
    set({ tutorialStep: step });
  },

  skipTutorial: () => {
    SecureStore.setItemAsync(TUTORIAL_DONE_KEY, "true");
    SecureStore.deleteItemAsync(TUTORIAL_STEP_KEY);
    set({ tutorialActive: false, tutorialStep: 0 });
  },

  completeTutorial: () => {
    SecureStore.setItemAsync(TUTORIAL_DONE_KEY, "true");
    SecureStore.deleteItemAsync(TUTORIAL_STEP_KEY);
    set({ tutorialActive: false, tutorialStep: 0 });
  },
}));
