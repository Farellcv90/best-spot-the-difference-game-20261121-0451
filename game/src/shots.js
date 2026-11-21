// Deterministic screenshot staging: ?shot=play|title|workshop|complete (with &seed=N)
// puts the real world into a fixed, photogenic state — scripted finds through the same
// markAt the player uses, a frozen timer, a live hint glow — then main.js paints it and
// sets window.__shotReady. Nothing here edits pixels; every shot is the game itself.

import { PANEL_LEFT_X, PANEL_TOP } from './config.js';
import { SCREEN_COMPLETE, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

/** Click the exact centre of a difference on the left panel, like a perfect player. */
function findDifference(world, index) {
  const diff = world.state.differences[index];
  if (!diff) return;
  world.markAt(PANEL_LEFT_X + diff.x, PANEL_TOP + diff.y);
}

/** Stage one named shot on the world; returns the progress object the title screen shows. */
export function stageShot(name, world) {
  const state = world.state;
  if (name === 'title') {
    state.screen = SCREEN_TITLE;
    return {
      unlocked: 4,
      stars: { harbor: 3, market: 2, garden: 3 },
      best: { harbor: 1450, market: 1320, garden: 1680 },
    };
  }
  if (name === 'workshop') {
    world.startLevel(4);
    for (const i of [0, 1, 3, 4, 6, 8, 10]) findDifference(world, i);
    state.timeLeft = state.level.timeLimit * 0.38;
    state.elapsed = 40;
    state.combo = 3;
    state.markerPulse = 0.55;
    world.useHint();
    state.hintGlow.until = state.elapsed + 10;
    state.screen = SCREEN_PLAY;
    return { unlocked: 5, stars: {}, best: {} };
  }
  if (name === 'complete') {
    world.startLevel(0);
    for (let i = 0; i < state.differences.length; i += 1) findDifference(world, i);
    state.timeLeft = 82;
    state.result = {
      stars: 3,
      findScore: state.score,
      timeBonus: 82 * 4,
      hintPenalty: 0,
      total: state.score + 82 * 4,
    };
    state.screen = SCREEN_COMPLETE;
    return { unlocked: 2, stars: { harbor: 3 }, best: { harbor: state.result.total } };
  }
  // Default 'play': the cover — Garden mid-game, five found, four still hiding.
  world.startLevel(2);
  for (const i of [0, 1, 3, 4, 6]) findDifference(world, i);
  state.timeLeft = state.level.timeLimit * 0.6;
  state.elapsed = 32;
  state.combo = 4;
  state.markerPulse = 0.45;
  state.screen = SCREEN_PLAY;
  return { unlocked: 3, stars: { harbor: 3, market: 2 }, best: { harbor: 1450, market: 1320 } };
}
