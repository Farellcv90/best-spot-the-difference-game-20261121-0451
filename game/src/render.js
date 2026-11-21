// The renderer: paints whatever the world holds — the two picture panels (the scene
// painter runs once per panel, the right one with every mutation applied), the ring
// markers on both panels, the hint glow, the HUD (remaining counter, progress dots,
// timer bar, score and combo) and the title / pause / complete / failed screens.
// Buttons are drawn here and their hit rectangles remembered for the main loop.

import {
  FIELD_H, FIELD_W, HINTS_PER_LEVEL, LEVELS, PANEL_H, PANEL_LEFT_X, PANEL_RIGHT_X,
  PANEL_TOP, PANEL_W,
} from './config.js';
import { SCENE_PAINTERS } from './scenes.js';
import { SCREEN_COMPLETE, SCREEN_FAILED, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

const INK = '#f4f1e8';
const DIM = '#a8b0c4';
const GOLD = '#ffb340';
const TEAL = '#2ec4b6';
const RED = '#e2483d';
const AMBER = '#f2a541';
const PANEL_BG = '#1b2033';

function roundRect(ctx, x, y, w, h, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function text(ctx, value, x, y, size, colour, align = 'center', weight = 'bold') {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Create the renderer for a canvas sized to the field. */
export function createRenderer(canvas) {
  canvas.width = FIELD_W;
  canvas.height = FIELD_H;
  const ctx = canvas.getContext('2d');
  let buttons = [];

  function addButton(name, x, y, w, h, label, accent = false) {
    buttons.push({ name, x, y, w, h });
    roundRect(ctx, x, y, w, h, 10, accent ? GOLD : '#2a3050');
    text(ctx, label, x + w / 2, y + h / 2 + 1, 19, accent ? '#23180a' : INK);
  }

  function drawPanel(state, panelX, mutations, label) {
    ctx.save();
    roundRect(ctx, panelX - 4, PANEL_TOP - 4, PANEL_W + 8, PANEL_H + 8, 12, '#0d1019');
    ctx.beginPath();
    ctx.roundRect(panelX, PANEL_TOP, PANEL_W, PANEL_H, 8);
    ctx.clip();
    ctx.translate(panelX, PANEL_TOP);
    SCENE_PAINTERS[state.level.id](ctx, mutations);
    ctx.restore();
    ctx.strokeStyle = '#4a5478';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, PANEL_TOP, PANEL_W, PANEL_H, 8);
    ctx.stroke();
    roundRect(ctx, panelX + 10, PANEL_TOP + 10, 92, 24, 6, 'rgba(13,16,25,0.72)');
    text(ctx, label, panelX + 56, PANEL_TOP + 23, 13, INK);
  }

  function drawMarkers(state) {
    for (const diff of state.differences) {
      if (!state.found.has(diff.id)) continue;
      const isNewest = diff.id === state.lastFoundId;
      const scale = isNewest ? 1 + (1 - state.markerPulse) * 0.4 : 1;
      const r = diff.radius * 0.66 * scale;
      for (const panelX of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
        const cx = panelX + diff.x;
        const cy = PANEL_TOP + diff.y;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy);
        ctx.lineTo(cx - 2, cy + 6);
        ctx.lineTo(cx + 8, cy - 6);
        ctx.stroke();
      }
    }
  }

  function drawHintGlow(state) {
    const glow = state.hintGlow;
    if (!glow) return;
    const pulse = 0.16 + 0.1 * Math.sin(state.elapsed * 6);
    for (const panelX of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
      ctx.fillStyle = `rgba(255,217,59,${pulse})`;
      ctx.fillRect(panelX + glow.quadrant.x, PANEL_TOP + glow.quadrant.y, PANEL_W / 2, PANEL_H / 2);
      ctx.strokeStyle = 'rgba(255,217,59,0.85)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 7]);
      ctx.strokeRect(panelX + glow.quadrant.x + 4, PANEL_TOP + glow.quadrant.y + 4, PANEL_W / 2 - 8, PANEL_H / 2 - 8);
      ctx.setLineDash([]);
    }
  }

  function drawWrongFlash(state) {
    const flash = state.wrongFlash;
    if (!flash) return;
    const panelX = flash.panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
    const cx = panelX + flash.x;
    const cy = PANEL_TOP + flash.y;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 14);
    ctx.lineTo(cx + 14, cy + 14);
    ctx.moveTo(cx + 14, cy - 14);
    ctx.lineTo(cx - 14, cy + 14);
    ctx.stroke();
    text(ctx, '-5s', cx, cy - 28, 18, RED);
  }

  function drawPointer(state) {
    const hover = state.hover;
    if (hover && state.screen === SCREEN_PLAY) {
      ctx.strokeStyle = 'rgba(244,241,232,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hover.x, hover.y, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hover.x - 24, hover.y);
      ctx.lineTo(hover.x - 10, hover.y);
      ctx.moveTo(hover.x + 10, hover.y);
      ctx.lineTo(hover.x + 24, hover.y);
      ctx.moveTo(hover.x, hover.y - 24);
      ctx.lineTo(hover.x, hover.y - 10);
      ctx.moveTo(hover.x, hover.y + 10);
      ctx.lineTo(hover.x, hover.y + 24);
      ctx.stroke();
    }
    if (state.crosshair.active && state.screen === SCREEN_PLAY) {
      const c = state.crosshair;
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x - 28, c.y);
      ctx.lineTo(c.x - 8, c.y);
      ctx.moveTo(c.x + 8, c.y);
      ctx.lineTo(c.x + 28, c.y);
      ctx.moveTo(c.x, c.y - 28);
      ctx.lineTo(c.x, c.y - 8);
      ctx.moveTo(c.x, c.y + 8);
      ctx.lineTo(c.x, c.y + 28);
      ctx.stroke();
    }
  }

  function drawHud(state) {
    const remaining = state.differences.length - state.found.size;
    text(ctx, 'LANTERN TWINS', 24, 26, 22, GOLD, 'left');
    text(ctx, state.level.name, 24, 54, 18, INK, 'left', 'normal');
    text(ctx, `${remaining} remaining`, FIELD_W / 2, 34, 34, INK);
    // progress dots
    const total = state.differences.length;
    const dotGap = Math.min(26, 320 / Math.max(1, total));
    const startX = FIELD_W / 2 - ((total - 1) * dotGap) / 2;
    for (let i = 0; i < total; i += 1) {
      ctx.fillStyle = i < state.found.size ? GOLD : '#39415f';
      ctx.beginPath();
      ctx.arc(startX + i * dotGap, 66, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, `Score ${state.score}`, FIELD_W - 24, 26, 22, INK, 'right');
    const comboLabel = state.combo > 1 ? `Combo x${state.combo}` : `Hints ${state.hintsLeft}/${HINTS_PER_LEVEL}`;
    text(ctx, comboLabel, FIELD_W - 24, 54, 17, state.combo > 1 ? GOLD : DIM, 'right', 'normal');
    // timer bar
    const frac = Math.max(0, state.timeLeft / state.level.timeLimit);
    roundRect(ctx, 24, 86, FIELD_W - 48, 14, 7, '#232947');
    const barColour = frac > 0.5 ? TEAL : frac > 0.25 ? AMBER : RED;
    if (frac > 0) roundRect(ctx, 24, 86, (FIELD_W - 48) * frac, 14, 7, barColour);
    text(ctx, formatTime(state.timeLeft), FIELD_W / 2, 93, 13, '#10131f');
    // footer buttons + help
    addButton('hint', 24, 630, 170, 46, `Hint (H) · ${state.hintsLeft}`);
    addButton('pause', 208, 630, 150, 46, 'Pause (P)');
    addButton('restart', 372, 630, 170, 46, 'Restart (R)');
    addButton('menu', 556, 630, 150, 46, 'Menu (Q)');
    addButton('mute', 720, 630, 150, 46, state.muted ? 'Unmute (M)' : 'Mute (M)');
    text(ctx, 'Click a difference on either picture · wrong click −5s · arrows + Enter also play', FIELD_W / 2, 700, 15, DIM, 'center', 'normal');
  }

  function drawPlay(state) {
    const allIds = new Set(state.differences.map((d) => d.id));
    drawPanel(state, PANEL_LEFT_X, new Set(), 'ORIGINAL');
    drawPanel(state, PANEL_RIGHT_X, allIds, 'TWIN');
    drawHintGlow(state);
    drawMarkers(state);
    drawWrongFlash(state);
    drawPointer(state);
    drawHud(state);
  }

  function drawStars(cx, cy, count, size) {
    for (let i = 0; i < 3; i += 1) {
      const x = cx + (i - 1) * (size * 2.3);
      ctx.fillStyle = i < count ? GOLD : '#39415f';
      ctx.beginPath();
      for (let p = 0; p < 10; p += 1) {
        const a = -Math.PI / 2 + (p * Math.PI) / 5;
        const r = p % 2 === 0 ? size : size * 0.45;
        const px = x + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawTitle(state, progress) {
    // A quiet backdrop: the harbor scene, dimmed, behind the menu.
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(0, 120);
    ctx.scale(FIELD_W / PANEL_W, 1);
    SCENE_PAINTERS.harbor(ctx, new Set());
    ctx.restore();
    ctx.fillStyle = 'rgba(13,16,25,0.55)';
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    text(ctx, 'LANTERN TWINS', FIELD_W / 2, 78, 58, GOLD);
    text(ctx, 'Spot the Difference', FIELD_W / 2, 124, 30, INK);
    text(ctx, 'Two pictures, one twin hiding changes. Find them all before the lanterns dim!', FIELD_W / 2, 158, 17, DIM, 'center', 'normal');
    const totalBest = Object.values(progress.best).reduce((a, b) => a + b, 0);
    if (totalBest > 0) text(ctx, `Best total score: ${totalBest}`, FIELD_W / 2, 186, 16, TEAL, 'center', 'normal');
    // level cards
    const cardW = 228;
    const cardH = 250;
    const gap = 16;
    const startX = (FIELD_W - (cardW * 5 + gap * 4)) / 2;
    LEVELS.forEach((level, i) => {
      const x = startX + i * (cardW + gap);
      const y = 230;
      const unlocked = i < progress.unlocked;
      roundRect(ctx, x, y, cardW, cardH, 14, unlocked ? '#232947' : '#171c2e');
      ctx.strokeStyle = unlocked ? '#4a5478' : '#2c3350';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 14);
      ctx.stroke();
      text(ctx, `LEVEL ${i + 1}`, x + cardW / 2, y + 30, 15, DIM);
      text(ctx, level.name, x + cardW / 2, y + 62, level.name.length > 16 ? 17 : 21, unlocked ? INK : DIM);
      // mini preview of the scene
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 14, y + 82, cardW - 28, 84, 8);
      ctx.clip();
      ctx.translate(x + 14, y + 82);
      ctx.scale((cardW - 28) / PANEL_W, 84 / PANEL_H);
      SCENE_PAINTERS[level.id](ctx, new Set());
      ctx.restore();
      if (!unlocked) {
        ctx.fillStyle = 'rgba(13,16,25,0.55)';
        ctx.fillRect(x + 14, y + 82, cardW - 28, 84);
        text(ctx, 'LOCKED', x + cardW / 2, y + 124, 18, DIM);
      }
      text(ctx, `${level.diffCount} differences · ${level.timeLimit}s`, x + cardW / 2, y + 186, 15, DIM, 'center', 'normal');
      drawStars(x + cardW / 2, y + 214, progress.stars[level.id] ?? 0, 11);
      const best = progress.best[level.id];
      text(ctx, best ? `Best ${best}` : 'Not cleared yet', x + cardW / 2, y + 238, 14, best ? TEAL : DIM, 'center', 'normal');
      if (unlocked) buttons.push({ name: `level:${i}`, x, y, w: cardW, h: cardH });
    });
    text(ctx, 'How to play: click or tap a difference on either picture. A gold ring marks it on both.', FIELD_W / 2, 530, 17, INK, 'center', 'normal');
    text(ctx, 'Wrong clicks cost 5 seconds. Hints (H) glow a quadrant. Find fast to build your combo!', FIELD_W / 2, 558, 17, INK, 'center', 'normal');
    text(ctx, 'Keyboard: arrows / WASD move the ring, Enter marks, P pauses, R restarts, M mutes. Press 1–5 or click a level.', FIELD_W / 2, 592, 15, DIM, 'center', 'normal');
    addButton('mute', FIELD_W / 2 - 75, 628, 150, 44, state.muted ? 'Unmute (M)' : 'Mute (M)');
  }

  function drawOverlayBox(w, h) {
    ctx.fillStyle = 'rgba(10,12,20,0.72)';
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    const x = (FIELD_W - w) / 2;
    const y = (FIELD_H - h) / 2;
    roundRect(ctx, x, y, w, h, 18, PANEL_BG);
    ctx.strokeStyle = '#4a5478';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.stroke();
    return { x, y };
  }

  function drawComplete(state) {
    drawPlay(state);
    const { x, y } = drawOverlayBox(520, 420);
    const r = state.result;
    text(ctx, 'Level Complete!', FIELD_W / 2, y + 52, 38, GOLD);
    text(ctx, state.level.name, FIELD_W / 2, y + 90, 20, INK, 'center', 'normal');
    drawStars(FIELD_W / 2, y + 140, r.stars, 26);
    const rows = [
      ['Finds score', r.findScore],
      ['Time bonus', `+${r.timeBonus}`],
      ['Hints used', `${state.hintsUsed} (−${r.hintPenalty})`],
      ['Mistakes', state.mistakes],
      ['Total score', r.total],
    ];
    rows.forEach(([label, value], i) => {
      const ry = y + 196 + i * 32;
      const last = i === rows.length - 1;
      text(ctx, label, x + 60, ry, last ? 21 : 18, last ? GOLD : DIM, 'left', last ? 'bold' : 'normal');
      text(ctx, String(value), x + 460, ry, last ? 21 : 18, last ? GOLD : INK, 'right', last ? 'bold' : 'normal');
    });
    const hasNext = state.levelIndex < LEVELS.length - 1;
    if (hasNext) addButton('next', FIELD_W / 2 - 250, y + 352, 150, 48, 'Next Level', true);
    addButton('replay', FIELD_W / 2 - 75, y + 352, 150, 48, 'Replay');
    addButton('menu', FIELD_W / 2 + 100, y + 352, 150, 48, 'Menu');
  }

  function drawFailed(state) {
    drawPlay(state);
    const { y } = drawOverlayBox(520, 340);
    text(ctx, "Time's Up!", FIELD_W / 2, y + 60, 40, RED);
    text(ctx, state.level.name, FIELD_W / 2, y + 102, 20, INK, 'center', 'normal');
    text(ctx, `You found ${state.found.size} of ${state.differences.length} differences.`, FIELD_W / 2, y + 150, 19, INK, 'center', 'normal');
    text(ctx, `${state.differences.length - state.found.size} still hide in the twin picture.`, FIELD_W / 2, y + 182, 17, DIM, 'center', 'normal');
    addButton('replay', FIELD_W / 2 - 170, y + 240, 160, 50, 'Retry (R)', true);
    addButton('menu', FIELD_W / 2 + 10, y + 240, 160, 50, 'Menu (Q)');
  }

  function drawPaused(state) {
    drawPlay(state);
    const { y } = drawOverlayBox(440, 300);
    text(ctx, 'Paused', FIELD_W / 2, y + 56, 38, INK);
    text(ctx, 'The lanterns wait for you.', FIELD_W / 2, y + 96, 17, DIM, 'center', 'normal');
    addButton('pause', FIELD_W / 2 - 90, y + 130, 180, 48, 'Resume (P)', true);
    addButton('restart', FIELD_W / 2 - 90, y + 190, 180, 48, 'Restart (R)');
    addButton('menu', FIELD_W / 2 - 90, y + 250, 180, 44, 'Menu (Q)');
  }

  /** Paint the current screen. progress = { unlocked, stars: {}, best: {} }. */
  function draw(state, progress) {
    buttons = [];
    ctx.fillStyle = '#10131f';
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    if (state.screen === SCREEN_TITLE) drawTitle(state, progress);
    else if (state.screen === SCREEN_PLAY) drawPlay(state);
    else if (state.screen === SCREEN_PAUSED) drawPaused(state);
    else if (state.screen === SCREEN_COMPLETE) drawComplete(state);
    else if (state.screen === SCREEN_FAILED) drawFailed(state);
  }

  /** The button name at a field point from the last draw, or null. */
  function buttonAt(x, y) {
    for (let i = buttons.length - 1; i >= 0; i -= 1) {
      const b = buttons[i];
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return b.name;
    }
    return null;
  }

  return { draw, buttonAt };
}
