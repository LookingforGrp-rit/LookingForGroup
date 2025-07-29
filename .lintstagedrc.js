// Lint staged config file
// When npx lint-staged is ran by husky on git a git commit
// Staged files that mach the pattern will have the commands executed on them
export default {
  "server/**/*": [
    "npx --workspace=server eslint --fix",
    "npx --workspace=server prettier --write",
  ],
};
