// The difference sets: for every level, the list of spots where the right panel differs
// from the left. Each entry has a stable id the scene painters switch on, a label for the
// status line, and a generous hit circle in panel coordinates (x, y, radius) — fair to
// click, never pixel-hunting. Kinds: recolour, remove, add, move, resize, flip, count,
// number. The painters in scenes.js read the same ids, so what is drawn and what can be
// found can never drift apart.

export const DIFFERENCES = {
  harbor: [
    { id: 'lantern-colour', kind: 'recolour', label: 'the pier lantern is teal, not amber', x: 128, y: 300, radius: 34 },
    { id: 'gull-missing', kind: 'remove', label: 'a gull is missing from the sky', x: 430, y: 110, radius: 34 },
    { id: 'flag-flip', kind: 'flip', label: 'the boat flag flies the other way', x: 330, y: 250, radius: 32 },
    { id: 'crate-count', kind: 'count', label: 'only two crates are stacked, not three', x: 520, y: 400, radius: 34 },
    { id: 'stripe-colour', kind: 'recolour', label: 'the lighthouse stripe is green, not red', x: 90, y: 170, radius: 34 },
  ],
  market: [
    { id: 'banner-number', kind: 'number', label: 'the banner reads 9, not 6', x: 300, y: 86, radius: 34 },
    { id: 'jar-colour', kind: 'recolour', label: 'the big jar is purple, not orange', x: 120, y: 340, radius: 34 },
    { id: 'cat-tail', kind: 'remove', label: 'the cat has lost its tail', x: 470, y: 410, radius: 32 },
    { id: 'lantern-extra', kind: 'add', label: 'an extra lantern hangs by the stall', x: 545, y: 150, radius: 32 },
    { id: 'arrow-flip', kind: 'flip', label: 'the sign arrow points left, not right', x: 60, y: 170, radius: 32 },
    { id: 'fruit-count', kind: 'count', label: 'four oranges sit on the stall, not five', x: 210, y: 300, radius: 34 },
    { id: 'awning-stripe', kind: 'recolour', label: 'the awning stripe is blue, not pink', x: 445, y: 238, radius: 34 },
  ],
  garden: [
    { id: 'petal-count', kind: 'count', label: 'the big flower has five petals, not six', x: 110, y: 380, radius: 34 },
    { id: 'butterfly-colour', kind: 'recolour', label: 'the butterfly is violet, not orange', x: 470, y: 150, radius: 32 },
    { id: 'flower-missing', kind: 'remove', label: 'a tulip is missing from the bed', x: 250, y: 430, radius: 32 },
    { id: 'fountain-jet', kind: 'resize', label: 'the fountain jet is much shorter', x: 300, y: 260, radius: 34 },
    { id: 'bird-count', kind: 'count', label: 'three birds sit on the wire, not four', x: 420, y: 80, radius: 34 },
    { id: 'leaf-shape', kind: 'flip', label: 'the big leaf curls the other way', x: 60, y: 250, radius: 32 },
    { id: 'pot-colour', kind: 'recolour', label: 'the plant pot is red, not blue', x: 530, y: 420, radius: 32 },
    { id: 'bench-slat', kind: 'remove', label: 'the bench is missing a back slat', x: 380, y: 340, radius: 34 },
    { id: 'sun-move', kind: 'move', label: 'the sun has drifted left', x: 520, y: 90, radius: 32 },
  ],
  cabin: [
    { id: 'window-light', kind: 'recolour', label: 'the cabin window is dark, not lit', x: 300, y: 280, radius: 32 },
    { id: 'smoke-count', kind: 'count', label: 'two smoke puffs rise, not three', x: 360, y: 120, radius: 34 },
    { id: 'star-missing', kind: 'remove', label: 'a bright star is missing', x: 120, y: 70, radius: 30 },
    { id: 'scarf-colour', kind: 'recolour', label: "the snowman's scarf is green, not red", x: 470, y: 360, radius: 32 },
    { id: 'fence-count', kind: 'count', label: 'the fence has four posts, not five', x: 90, y: 380, radius: 34 },
    { id: 'moon-phase', kind: 'flip', label: 'the moon is a crescent, not full', x: 520, y: 80, radius: 32 },
    { id: 'tree-snow', kind: 'remove', label: 'a pine has lost its snow cap', x: 180, y: 240, radius: 34 },
    { id: 'handle-side', kind: 'move', label: 'the door handle is on the other side', x: 340, y: 330, radius: 30 },
    { id: 'icicle-count', kind: 'count', label: 'three icicles hang, not four', x: 262, y: 282, radius: 32 },
    { id: 'footprints', kind: 'remove', label: 'the footprint trail is gone', x: 150, y: 450, radius: 34 },
    { id: 'brick-colour', kind: 'recolour', label: 'the chimney bricks are grey, not brown', x: 365, y: 180, radius: 30 },
  ],
  workshop: [
    { id: 'clock-time', kind: 'move', label: 'the wall clock shows a different time', x: 150, y: 110, radius: 34 },
    { id: 'gear-teeth', kind: 'count', label: 'the big gear has fewer teeth', x: 430, y: 150, radius: 34 },
    { id: 'tool-missing', kind: 'remove', label: 'the screwdriver is missing from the bench', x: 250, y: 326, radius: 32 },
    { id: 'jar-number', kind: 'number', label: 'the jar label reads 12, not 21', x: 520, y: 300, radius: 32 },
    { id: 'lamp-colour', kind: 'recolour', label: 'the lamp shade is green, not red', x: 70, y: 180, radius: 34 },
    { id: 'pendulum-length', kind: 'resize', label: 'the pendulum hangs shorter', x: 150, y: 230, radius: 32 },
    { id: 'key-count', kind: 'count', label: 'two winding keys hang, not three', x: 330, y: 90, radius: 32 },
    { id: 'book-order', kind: 'move', label: 'the red and blue books swapped places', x: 480, y: 380, radius: 34 },
    { id: 'magnifier-move', kind: 'move', label: 'the magnifier moved to the other side', x: 380, y: 320, radius: 32 },
    { id: 'bell-shape', kind: 'resize', label: 'the bell is smaller and rounder', x: 60, y: 330, radius: 32 },
    { id: 'calendar-date', kind: 'number', label: 'the calendar shows 17, not 7', x: 540, y: 110, radius: 32 },
    { id: 'gear-size', kind: 'resize', label: 'the small gear grew bigger', x: 300, y: 200, radius: 32 },
    { id: 'drawer-knob', kind: 'remove', label: 'a drawer knob is missing', x: 120, y: 420, radius: 32 },
  ],
};

/** The difference list for a level id, in a stable order. */
export function differencesForLevel(levelId) {
  return DIFFERENCES[levelId] ?? [];
}
