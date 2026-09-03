import type { Step } from "react-joyride";

export const TOUR_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Welcome to Wandel",
    content: "A quick look at what's here before you start.",
  },
  {
    target: '[data-tour="panel-self-respect"]',
    placement: "bottom",
    title: "Self-Respect",
    content: "One hard thing a day, faced instead of avoided.",
  },
  {
    target: '[data-tour="panel-self-love"]',
    placement: "bottom",
    title: "Self-Love",
    content: "Small rituals of kindness toward yourself.",
  },
  {
    target: '[data-tour="panel-self-worth"]',
    placement: "bottom",
    title: "Self-Worth",
    content: "What did today confirm about who you are?",
  },
  {
    target: '[data-tour="panel-take-up-space"]',
    placement: "bottom",
    title: "Take Up Space",
    content: "Notice and claim space, rather than shrinking.",
  },
  {
    target: '[data-tour="tab-break"]',
    placement: "top",
    title: "Break",
    content: "Habits you want to let go of.",
  },
  {
    target: '[data-tour="tab-build"]',
    placement: "top",
    title: "Build",
    content: "Habits you want to grow.",
  },
  {
    target: '[data-tour="tab-history"]',
    placement: "top",
    title: "History",
    content: "Your calendar, patterns, and comebacks over time.",
  },
  {
    target: "body",
    placement: "center",
    title: "That's the tour",
    content: "Replay it anytime from Settings.",
  },
];
