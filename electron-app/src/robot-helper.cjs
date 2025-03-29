// robot-helper.cjs (CommonJS)
const robot = require("robotjs");

export const keyTap = (key, modifiers) => {
  robot.keyTap(key, modifiers);
};
