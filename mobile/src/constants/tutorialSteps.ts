import { ImageSourcePropType } from "react-native";

export type MascotConfig = {
  mascot: ImageSourcePropType;
  message: string;
  align: "left" | "right";
};

export type TutorialStepConfig = {
  position: "center" | "top" | "bottom";
  showNext: boolean;
  nextLabel?: string;
  primary: MascotConfig;
  secondary?: MascotConfig;
};

const blueGuy    = require("../../assets/images/blueGuy.png");
const redGuy     = require("../../assets/images/redHuy.png");
const surprisedBlue = require("../../assets/images/SuprisedBlueGuy.png");
const madRed     = require("../../assets/images/madRedGuy.png");
const together   = require("../../assets/images/toghetherGuys.png");

export const TUTORIAL_STEPS: Record<number, TutorialStepConfig> = {
  0: {
    position: "center",
    showNext: true,
    primary: {
      mascot: together,
      message: "Welcome to DebateAI! Let's walk through your first debate.",
      align: "left",
    },
  },
  1: {
    position: "top",
    showNext: false,
    primary: {
      mascot: blueGuy,
      message: "Start with the Easy challenge — tap it!",
      align: "left",
    },
  },
  2: {
    position: "top",
    showNext: false,
    primary: {
      mascot: blueGuy,
      message: "Read the scenario, then tap Start.",
      align: "right",
    },
  },
  3: {
    position: "top",
    showNext: false,
    primary: {
      mascot: blueGuy,
      message: "Make your first argument.",
      align: "left",
    },
    secondary: {
      mascot: redGuy,
      message: "Let's see what you've got.",
      align: "right",
    },
  },
  4: {
    position: "top",
    showNext: false,
    primary: {
      mascot: redGuy,
      message: "Ready? Tap Finish when you're done.",
      align: "right",
    },
  },
  5: {
    position: "top",
    showNext: true,
    primary: {
      mascot: surprisedBlue,
      message: "See how you did!",
      align: "left",
    },
    secondary: {
      mascot: redGuy,
      message: "Not bad. Can you do better?",
      align: "right",
    },
  },
  6: {
    position: "top",
    showNext: true,
    primary: {
      mascot: blueGuy,
      message: "This is where you improve.",
      align: "left",
    },
    secondary: {
      mascot: madRed,
      message: "Unlock full feedback.",
      align: "right",
    },
  },
  7: {
    position: "top",
    showNext: true,
    primary: {
      mascot: blueGuy,
      message: "Your session history lives here.",
      align: "left",
    },
  },
  8: {
    position: "top",
    showNext: true,
    primary: {
      mascot: redGuy,
      message: "See how you rank against others.",
      align: "right",
    },
  },
  9: {
    position: "top",
    showNext: true,
    primary: {
      mascot: blueGuy,
      message: "Track your progress here.",
      align: "left",
    },
  },
  10: {
    position: "center",
    showNext: true,
    nextLabel: "Let's Go!",
    primary: {
      mascot: together,
      message: "You're all set. Improve a little every day.",
      align: "left",
    },
  },
};

// Which tab should be highlighted at each tutorial step
export const TUTORIAL_TAB_HIGHLIGHT: Record<number, string> = {
  7: "history",
  8: "leaderboard",
  9: "profile",
  10: "profile",
};
