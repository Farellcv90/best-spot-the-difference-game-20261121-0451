// Pointer and keyboard input, translated into plain actions the main loop applies to the
// world: mark a point, move the crosshair, ask for a hint, pause, restart, mute, and pick
// levels or buttons. Coordinates are converted from CSS pixels to the 1280x720 field, so
// clicks land where the player sees them at any window size.

import { FIELD_H, FIELD_W } from './config.js';

export const ACTION_NONE = 0;
export const ACTION_MARK = 1;
export const ACTION_HINT = 2;
export const ACTION_PAUSE = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_CONFIRM = 32;
export const ACTION_BACK = 64;

/** Create the input reader for a canvas: queue of one-shot actions plus live pointers. */
export function createInput(canvas) {
  let actions = ACTION_NONE;
  let markPoint = null;
  let levelPick = -1;
  let buttonPick = null;
  const pointer = { x: 0, y: 0, inside: false };
  const crosshairDelta = { x: 0, y: 0 };

  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD_W,
      y: ((event.clientY - rect.top) / rect.height) * FIELD_H,
    };
  }

  canvas.addEventListener('pointermove', (event) => {
    const p = toField(event);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const p = toField(event);
    pointer.x = p.x;
    pointer.y = p.y;
    markPoint = p;
    actions |= ACTION_MARK;
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const step = event.shiftKey ? 24 : 10;
    if (key === 'arrowleft' || key === 'a') crosshairDelta.x -= step;
    else if (key === 'arrowright' || key === 'd') crosshairDelta.x += step;
    else if (key === 'arrowup' || key === 'w') crosshairDelta.y -= step;
    else if (key === 'arrowdown' || key === 's') crosshairDelta.y += step;
    else if (key === 'enter' || key === ' ') actions |= ACTION_CONFIRM;
    else if (key === 'h') actions |= ACTION_HINT;
    else if (key === 'p' || key === 'escape') actions |= ACTION_PAUSE;
    else if (key === 'r') actions |= ACTION_RESTART;
    else if (key === 'm') actions |= ACTION_MUTE;
    else if (key === 'q') actions |= ACTION_BACK;
    else if (key >= '1' && key <= '5') levelPick = Number(key) - 1;
    else return;
    event.preventDefault();
  });

  return {
    /** Drain the queued one-shot actions (a bitmask) and any queued point/picks. */
    takeActions() {
      const taken = { actions, markPoint, levelPick, buttonPick };
      actions = ACTION_NONE;
      markPoint = null;
      levelPick = -1;
      buttonPick = null;
      return taken;
    },
    /** Queue a named button press (the renderer hit-tests its buttons and calls this). */
    pressButton(name) {
      buttonPick = name;
    },
    /** The mouse position in field coordinates, or null when off-canvas. */
    hoverPoint() {
      return pointer.inside ? { x: pointer.x, y: pointer.y } : null;
    },
    /** Keyboard crosshair movement since the last call (consumed once). */
    takeCrosshairDelta() {
      const d = { x: crosshairDelta.x, y: crosshairDelta.y };
      crosshairDelta.x = 0;
      crosshairDelta.y = 0;
      return d;
    },
  };
}
