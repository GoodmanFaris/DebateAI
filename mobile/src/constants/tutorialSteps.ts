import { ImageSourcePropType } from "react-native";

export type TutorialStepConfig = {
  message: string;
  image: ImageSourcePropType;
  position: "center" | "top" | "bottom";
  showNext: boolean;
  nextLabel?: string;
};

const logo = require("../../assets/images/logo.png");

export const TUTORIAL_STEPS: Record<number, TutorialStepConfig> = {
  0: {
    message: "Welcome to DebateAI! Let's walk you through your first debate.",
    image: logo,
    position: "center",
    showNext: true,
  },
  1: {
    message: "Start with the Easy challenge — tap it!",
    image: logo,
    position: "top",
    showNext: false,
  },
  2: {
    message: "Read the scenario, then tap Start Session.",
    image: logo,
    position: "top",
    showNext: false,
  },
  3: {
    message: "Make your first argument!",
    image: logo,
    position: "top",
    showNext: false,
  },
  4: {
    message: "Ready to finish? Tap the Finish button.",
    image: logo,
    position: "top",
    showNext: false,
  },
  5: {
    message: "Here's how you did! Check your score.",
    image: logo,
    position: "top",
    showNext: true,
  },
  6: {
    message: "Get AI coaching to improve your skills.",
    image: logo,
    position: "top",
    showNext: true,
  },
  7: {
    message: "This is your session history.",
    image: logo,
    position: "top",
    showNext: true,
  },
  8: {
    message: "See how you compare to others.",
    image: logo,
    position: "top",
    showNext: true,
  },
  9: {
    message: "Track your progress here.",
    image: logo,
    position: "top",
    showNext: true,
  },
  10: {
    message: "You're ready. Start improving daily!",
    image: logo,
    position: "center",
    showNext: true,
    nextLabel: "Let's Go!",
  },
};

// Which tab should be highlighted at each tutorial step
export const TUTORIAL_TAB_HIGHLIGHT: Record<number, string> = {
  7: "history",
  8: "leaderboard",
  9: "profile",
  10: "profile",
};
