#!/usr/bin/env node
/** Injects Tell orchestration context at session start */
const msg = {
  additional_context: [
    "Tell hackathon build. Read ORCHESTRATION.md for model routing.",
    "User: Priya — solo founder, AI UI looks generic, demo tomorrow.",
    "Composer 2.5 orchestrates; Opus 4.8 for core/taste; GPT 5.5 for copy.",
    "Subagents in .cursor/agents/ — delegate by role.",
    "Milestone order: BUILD.md §8 M1→M10 (shipped). Remaining work: PLAN.md Phase 4.",
  ].join("\n"),
};
console.log(JSON.stringify(msg));
