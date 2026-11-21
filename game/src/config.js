// Field geometry, the five levels, scoring constants and storage keys for Lantern Twins.
// The whole game is one 1280x720 canvas: a header band on top, two picture panels side by
// side below it, and a footer band with the progress dots and controls. All picture
// coordinates in differences.js and scenes.js are in panel space (0..PANEL_W, 0..PANEL_H);
// the left panel's origin on the canvas is (PANEL_LEFT_X, PANEL_TOP) and the right panel's
// is (PANEL_RIGHT_X, PANEL_TOP).

export const FIELD_W = 1280;
export const FIELD_H = 720;
export const PANEL_W = 596;
export const PANEL_H = 500;
export const PANEL_TOP = 118;
export const PANEL_LEFT_X = 24;
export const PANEL_RIGHT_X = 660;

/** The fixed simulation step (seconds) the world advances in. */
export const STEP = 1 / 60;

/** Scoring: a find pays FIND_POINTS times the combo multiplier; mistakes cost time and a
 *  hint costs points, so a careful hunter always outscores a click-spammer. */
export const FIND_POINTS = 100;
export const COMBO_WINDOW = 8;
export const COMBO_MAX = 5;
export const WRONG_TIME_PENALTY = 5;
export const HINT_POINTS_COST = 150;
export const HINTS_PER_LEVEL = 3;
export const TIME_BONUS_PER_SECOND = 4;
export const HINT_GLOW_SECONDS = 2;

/** Star thresholds: 3 stars needs time to spare and at most one mistake and one hint. */
export const STARS_THREE_TIME_LEFT = 45;
export const STARS_THREE_MAX_MISTAKES = 1;
export const STARS_THREE_MAX_HINTS = 1;
export const STARS_TWO_TIME_LEFT = 20;
export const STARS_TWO_MAX_MISTAKES = 4;

/** The five scenes, easiest first: more differences and less time as they go. */
export const LEVELS = [
  { id: 'harbor', name: 'Harbor at Dusk', diffCount: 5, timeLimit: 150, blurb: 'Boats, a lighthouse and gulls at sunset.' },
  { id: 'market', name: 'Night Market', diffCount: 7, timeLimit: 150, blurb: 'Stalls, jars and lanterns after dark.' },
  { id: 'garden', name: 'Botanical Garden', diffCount: 9, timeLimit: 140, blurb: 'Flowers, a fountain and butterflies.' },
  { id: 'cabin', name: 'Mountain Cabin', diffCount: 11, timeLimit: 140, blurb: 'Snow, smoke and a patient snowman.' },
  { id: 'workshop', name: "Clockmaker's Workshop", diffCount: 13, timeLimit: 130, blurb: 'Clocks, gears and a very busy bench.' },
];

/** localStorage keys for cleared levels, stars and best scores. */
export const PROGRESS_KEY = 'lantern-twins-progress-v1';
export const MUTE_KEY = 'lantern-twins-muted-v1';
