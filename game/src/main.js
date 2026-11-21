// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps, and the renderer paints what is there. This file also owns the saved progress
// (unlocked levels, stars, best scores in localStorage), the aria-live announcements,
// and the ?seed= / ?shot= handling that stages deterministic screenshots.

import { FIELD_H, FIELD_W, LEVELS, MUTE_KEY, PROGRESS_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import {
  EVENT_COMPLETE, EVENT_FAILED, EVENT_FOUND, EVENT_HINT, EVENT_TICK, EVENT_WRONG,
  SCREEN_COMPLETE, SCREEN_FAILED, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, createWorld,
} from './world.js';
import {
  ACTION_BACK, ACTION_CONFIRM, ACTION_HINT, ACTION_MARK, ACTION_MUTE, ACTION_PAUSE,
  ACTION_RESTART, createInput,
} from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          unlocked: Math.min(LEVELS.length, Math.max(1, parsed.unlocked ?? 1)),
          stars: parsed.stars ?? {},
          best: parsed.best ?? {},
        };
      }
    }
  } catch {
    // Storage can be off (private windows): progress then lasts this visit only.
  }
  return { unlocked: 1, stars: {}, best: {} };
}

function saveProgress(progress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // See loadProgress: a visit-only progress is still a playable game.
  }
}

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const progress = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, progress);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  const progress = loadProgress();
  let muted = false;
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    muted = false;
  }
  audio.setMuted(muted);
  world.state.muted = muted;

  let accumulator = 0;
  let last = performance.now();

  function setMuted(value) {
    muted = value;
    audio.setMuted(value);
    world.state.muted = value;
    try {
      window.localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    } catch {
      // Mute then lasts this visit only.
    }
  }

  function startLevel(index) {
    if (index < 0 || index >= LEVELS.length || index >= progress.unlocked) return;
    world.startLevel(index);
    accumulator = 0;
    announce(`${world.state.level.name}. Find ${world.state.differences.length} differences.`);
  }

  function recordResult() {
    const state = world.state;
    const id = state.level.id;
    const stars = state.result.stars;
    if ((progress.stars[id] ?? 0) < stars) progress.stars[id] = stars;
    if ((progress.best[id] ?? 0) < state.result.total) progress.best[id] = state.result.total;
    progress.unlocked = Math.min(LEVELS.length, Math.max(progress.unlocked, state.levelIndex + 2));
    saveProgress(progress);
  }

  function handleEvents(events) {
    const state = world.state;
    if (events & EVENT_FOUND) {
      audio.playFind(state.combo);
      const found = state.differences.find((d) => d.id === state.lastFoundId);
      announce(found ? `Found: ${found.label}. ${world.remaining()} remaining.` : `${world.remaining()} remaining.`);
    }
    if (events & EVENT_WRONG) {
      audio.playWrong();
      announce('Not a difference. Minus 5 seconds.');
    }
    if (events & EVENT_HINT) {
      audio.playHint();
      announce('Hint: a quadrant glows on both pictures.');
    }
    if (events & EVENT_TICK) audio.playTick();
    if (events & EVENT_COMPLETE) {
      audio.playComplete();
      recordResult();
      announce(`Level complete. ${state.result.stars} stars. Score ${state.result.total}.`);
    }
    if (events & EVENT_FAILED) {
      audio.playFailed();
      announce(`Time is up. You found ${state.found.size} of ${state.differences.length}.`);
    }
  }

  function handleButton(name) {
    const state = world.state;
    if (!name) return false;
    if (name.startsWith('level:')) {
      startLevel(Number(name.slice(6)));
      return true;
    }
    if (name === 'hint') handleEvents(world.useHint());
    else if (name === 'pause') world.togglePause();
    else if (name === 'restart' || name === 'replay') startLevel(state.levelIndex);
    else if (name === 'next') startLevel(state.levelIndex + 1);
    else if (name === 'menu') world.toTitle();
    else if (name === 'mute') setMuted(!muted);
    else return false;
    return true;
  }

  function handleActions() {
    const taken = input.takeActions();
    const state = world.state;
    if (taken.actions & ACTION_MUTE) setMuted(!muted);
    if (taken.levelPick >= 0 && state.screen === SCREEN_TITLE) startLevel(taken.levelPick);
    if (taken.actions & ACTION_MARK && taken.markPoint) {
      audio.unlock();
      const button = renderer.buttonAt(taken.markPoint.x, taken.markPoint.y);
      if (button) handleButton(button);
      else if (state.screen === SCREEN_PLAY) handleEvents(world.markAt(taken.markPoint.x, taken.markPoint.y));
    }
    if (taken.actions & ACTION_CONFIRM) {
      audio.unlock();
      if (state.screen === SCREEN_PLAY && state.crosshair.active) {
        handleEvents(world.markAt(state.crosshair.x, state.crosshair.y));
      } else if (state.screen === SCREEN_COMPLETE) {
        if (state.levelIndex < LEVELS.length - 1) startLevel(state.levelIndex + 1);
        else world.toTitle();
      } else if (state.screen === SCREEN_FAILED) startLevel(state.levelIndex);
      else if (state.screen === SCREEN_PAUSED) world.togglePause();
    }
    if (taken.actions & ACTION_HINT) handleEvents(world.useHint());
    if (taken.actions & ACTION_PAUSE) {
      if (state.screen === SCREEN_PLAY || state.screen === SCREEN_PAUSED) world.togglePause();
    }
    if (taken.actions & ACTION_RESTART) {
      if (state.screen !== SCREEN_TITLE) startLevel(state.levelIndex);
    }
    if (taken.actions & ACTION_BACK) world.toTitle();
    const delta = input.takeCrosshairDelta();
    if (delta.x !== 0 || delta.y !== 0) {
      state.crosshair.active = true;
      state.crosshair.x = Math.min(FIELD_W - 8, Math.max(8, state.crosshair.x + delta.x));
      state.crosshair.y = Math.min(FIELD_H - 8, Math.max(8, state.crosshair.y + delta.y));
    }
    state.hover = input.hoverPoint();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (world.state.screen === SCREEN_PLAY) {
      while (accumulator >= STEP && world.state.screen === SCREEN_PLAY) {
        handleEvents(world.tick(STEP));
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, progress);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && world.state.screen === SCREEN_PLAY) {
      world.togglePause();
      announce('Paused.');
    }
  });

  announce('Lantern Twins. Pick a level to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
