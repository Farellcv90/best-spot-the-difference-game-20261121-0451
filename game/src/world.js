// The game world: one state object plus the rules that change it — starting a level,
// marking a spot (hit or miss), hints, the countdown, combo scoring, stars and the
// title / play / paused / complete / failed state machine. Pure logic, no drawing and
// no DOM: input.js feeds it actions, render.js paints whatever it holds.

import {
  COMBO_MAX, COMBO_WINDOW, FIND_POINTS, HINTS_PER_LEVEL, HINT_GLOW_SECONDS,
  HINT_POINTS_COST, LEVELS, PANEL_H, PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_TOP, PANEL_W,
  STARS_THREE_MAX_HINTS, STARS_THREE_MAX_MISTAKES, STARS_THREE_TIME_LEFT,
  STARS_TWO_MAX_MISTAKES, STARS_TWO_TIME_LEFT, TIME_BONUS_PER_SECOND, WRONG_TIME_PENALTY,
} from './config.js';
import { differencesForLevel } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_COMPLETE = 'complete';
export const SCREEN_FAILED = 'failed';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_HINT = 4;
export const EVENT_COMPLETE = 8;
export const EVENT_FAILED = 16;
export const EVENT_TICK = 32;

/** Which panel (0 left, 1 right, -1 neither) a canvas point falls in, and its panel-space point. */
export function panelPointAt(x, y) {
  const py = y - PANEL_TOP;
  if (py < 0 || py >= PANEL_H) return null;
  if (x >= PANEL_LEFT_X && x < PANEL_LEFT_X + PANEL_W) return { panel: 0, x: x - PANEL_LEFT_X, y: py };
  if (x >= PANEL_RIGHT_X && x < PANEL_RIGHT_X + PANEL_W) return { panel: 1, x: x - PANEL_RIGHT_X, y: py };
  return null;
}

/** Stars for a finished level: time to spare, few mistakes and few hints earn three. */
export function starsForLevel(timeLeft, mistakes, hintsUsed) {
  if (timeLeft >= STARS_THREE_TIME_LEFT && mistakes <= STARS_THREE_MAX_MISTAKES && hintsUsed <= STARS_THREE_MAX_HINTS) return 3;
  if (timeLeft >= STARS_TWO_TIME_LEFT && mistakes <= STARS_TWO_MAX_MISTAKES) return 2;
  return 1;
}

/** Create the world. random is used only to pick which unfound difference a hint glows. */
export function createWorld(random) {
  const state = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    level: LEVELS[0],
    differences: [],
    found: new Set(),
    timeLeft: 0,
    score: 0,
    combo: 0,
    comboTimer: 0,
    mistakes: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintsUsed: 0,
    hintGlow: null, // { id, x, y, panel, until } while a hint is glowing
    lastFindAt: -Infinity,
    elapsed: 0,
    markerPulse: 0, // 0..1 animation phase of the newest ring
    lastFoundId: null,
    wrongFlash: null, // { x, y, panel, until } for the red X
    crosshair: { x: PANEL_LEFT_X + PANEL_W / 2, y: PANEL_TOP + PANEL_H / 2, active: false },
    hover: null, // { x, y } canvas point of the mouse, for the magnifier ring
    result: null, // { stars, findScore, timeBonus, hintPenalty, total } on complete
    muted: false,
  };

  function remaining() {
    return state.differences.length - state.found.size;
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.level = LEVELS[index];
    state.differences = differencesForLevel(state.level.id);
    state.found = new Set();
    state.timeLeft = state.level.timeLimit;
    state.score = 0;
    state.combo = 0;
    state.comboTimer = 0;
    state.mistakes = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintsUsed = 0;
    state.hintGlow = null;
    state.lastFindAt = -Infinity;
    state.elapsed = 0;
    state.markerPulse = 0;
    state.lastFoundId = null;
    state.wrongFlash = null;
    state.result = null;
    state.screen = SCREEN_PLAY;
  }

  function finishLevel() {
    const timeBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
    const hintPenalty = state.hintsUsed * HINT_POINTS_COST;
    const stars = starsForLevel(state.timeLeft, state.mistakes, state.hintsUsed);
    state.result = {
      stars,
      findScore: state.score,
      timeBonus,
      hintPenalty,
      total: Math.max(0, state.score + timeBonus),
    };
    state.screen = SCREEN_COMPLETE;
  }

  /** Mark a canvas point: a hit rings the difference on both panels, a miss costs time. */
  function markAt(canvasX, canvasY) {
    if (state.screen !== SCREEN_PLAY) return EVENT_NONE;
    const point = panelPointAt(canvasX, canvasY);
    if (!point) return EVENT_NONE;
    for (const diff of state.differences) {
      if (state.found.has(diff.id)) continue;
      const dx = point.x - diff.x;
      const dy = point.y - diff.y;
      if (dx * dx + dy * dy <= diff.radius * diff.radius) {
        state.found.add(diff.id);
        state.combo = state.elapsed - state.lastFindAt <= COMBO_WINDOW
          ? Math.min(COMBO_MAX, state.combo + 1)
          : 1;
        state.lastFindAt = state.elapsed;
        state.score += FIND_POINTS * state.combo;
        state.markerPulse = 0;
        state.lastFoundId = diff.id;
        if (state.hintGlow && state.hintGlow.id === diff.id) state.hintGlow = null;
        if (remaining() === 0) {
          finishLevel();
          return EVENT_FOUND | EVENT_COMPLETE;
        }
        return EVENT_FOUND;
      }
    }
    state.mistakes += 1;
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
    state.wrongFlash = { x: point.x, y: point.y, panel: point.panel, until: state.elapsed + 0.7 };
    if (state.timeLeft <= 0) {
      state.screen = SCREEN_FAILED;
      return EVENT_WRONG | EVENT_FAILED;
    }
    return EVENT_WRONG;
  }

  /** Spend a hint: glow the quadrant of one unfound difference for two seconds. */
  function useHint() {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return EVENT_NONE;
    const unfound = state.differences.filter((d) => !state.found.has(d.id));
    if (unfound.length === 0) return EVENT_NONE;
    const pick = unfound[Math.floor(random.next() * unfound.length)];
    state.hintsLeft -= 1;
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - HINT_POINTS_COST);
    state.hintGlow = {
      id: pick.id,
      x: pick.x,
      y: pick.y,
      quadrant: { x: pick.x < PANEL_W / 2 ? 0 : PANEL_W / 2, y: pick.y < PANEL_H / 2 ? 0 : PANEL_H / 2 },
      until: state.elapsed + HINT_GLOW_SECONDS,
    };
    return EVENT_HINT;
  }

  function togglePause() {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
    else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
  }

  function toTitle() {
    state.screen = SCREEN_TITLE;
  }

  /** Advance the world by dt seconds (only the play screen counts time down). */
  function tick(dt) {
    let events = EVENT_NONE;
    if (state.screen === SCREEN_PLAY) {
      state.elapsed += dt;
      const before = Math.ceil(state.timeLeft);
      state.timeLeft -= dt;
      const after = Math.ceil(state.timeLeft);
      if (after !== before && after <= 10 && after > 0) events |= EVENT_TICK;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.screen = SCREEN_FAILED;
        events |= EVENT_FAILED;
      }
      if (state.elapsed - state.lastFindAt > COMBO_WINDOW) state.combo = 0;
      if (state.markerPulse < 1) state.markerPulse = Math.min(1, state.markerPulse + dt * 2.2);
      if (state.hintGlow && state.elapsed >= state.hintGlow.until) state.hintGlow = null;
      if (state.wrongFlash && state.elapsed >= state.wrongFlash.until) state.wrongFlash = null;
    }
    return events;
  }

  return { state, startLevel, markAt, useHint, togglePause, toTitle, tick, remaining };
}
