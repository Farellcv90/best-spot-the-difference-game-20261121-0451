// The five scene painters: every picture is drawn procedurally on the canvas (layered
// vector shapes, no image files), so the left panel is the original scene and the right
// panel is the same scene repainted with a set of mutation ids applied. Each painter takes
// (ctx, mutations) where mutations is a Set of difference ids from differences.js; an
// empty set paints the original. Shared helpers (sky, lantern, flower, gear…) keep one
// flat vector style across both panels and all five scenes.

function has(mutations, id) {
  return mutations.has(id);
}

function rect(ctx, x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function circle(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function triangle(ctx, x1, y1, x2, y2, x3, y3, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function paintSky(ctx, top, bottom, horizonY) {
  const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 596, horizonY);
}

function paintCloud(ctx, x, y, scale, colour) {
  ellipse(ctx, x, y, 42 * scale, 15 * scale, colour);
  ellipse(ctx, x - 26 * scale, y + 5 * scale, 28 * scale, 11 * scale, colour);
  ellipse(ctx, x + 28 * scale, y + 5 * scale, 30 * scale, 12 * scale, colour);
}

function paintLantern(ctx, x, y, bodyColour, glowColour) {
  circle(ctx, x, y, 26, glowColour);
  rect(ctx, x - 3, y - 34, 6, 14, '#3a2c20');
  ctx.fillStyle = bodyColour;
  ctx.beginPath();
  ctx.ellipse(x, y, 15, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  line(ctx, x - 15, y - 7, x + 15, y - 7, 'rgba(0,0,0,0.18)', 2);
  line(ctx, x - 15, y + 7, x + 15, y + 7, 'rgba(0,0,0,0.18)', 2);
  rect(ctx, x - 6, y - 24, 12, 5, '#3a2c20');
  rect(ctx, x - 6, y + 19, 12, 5, '#3a2c20');
}

function paintGull(ctx, x, y, scale) {
  ctx.strokeStyle = '#f4f6f8';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.arc(x - 9 * scale, y, 9 * scale, Math.PI * 1.15, Math.PI * 1.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 9 * scale, y, 9 * scale, Math.PI * 1.05, Math.PI * 1.85);
  ctx.stroke();
}

function paintBoat(ctx, x, y, hullColour, flagFlipped) {
  triangle(ctx, x, y - 70, x, y - 8, x + 44, y - 8, '#f7f3e8');
  line(ctx, x, y - 78, x, y - 4, '#5b4632', 4);
  const dir = flagFlipped ? -1 : 1;
  triangle(ctx, x, y - 78, x, y - 64, x + 22 * dir, y - 71, '#e2483d');
  ctx.fillStyle = hullColour;
  ctx.beginPath();
  ctx.moveTo(x - 46, y);
  ctx.lineTo(x + 52, y);
  ctx.lineTo(x + 38, y + 20);
  ctx.lineTo(x - 30, y + 20);
  ctx.closePath();
  ctx.fill();
  rect(ctx, x - 46, y - 4, 98, 6, '#8a6a44');
}

function paintCrate(ctx, x, y, size) {
  rect(ctx, x, y, size, size, '#b07f45');
  ctx.strokeStyle = '#7c5527';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
  line(ctx, x + 2, y + 2, x + size - 2, y + size - 2, '#7c5527', 2);
}

function paintFlower(ctx, x, y, petalCount, petalColour, centreColour) {
  line(ctx, x, y, x, y + 34, '#3f7d3a', 4);
  ellipse(ctx, x - 9, y + 22, 10, 5, '#4c9450');
  for (let i = 0; i < petalCount; i += 1) {
    const a = (i / petalCount) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * 13, y + Math.sin(a) * 13, 9, 6, petalColour);
  }
  circle(ctx, x, y, 7, centreColour);
}

function paintBird(ctx, x, y, colour) {
  ellipse(ctx, x, y, 12, 8, colour);
  circle(ctx, x + 10, y - 6, 6, colour);
  triangle(ctx, x + 15, y - 6, x + 21, y - 4, x + 15, y - 2, '#f2a541');
  triangle(ctx, x - 11, y, x - 22, y - 5, x - 20, y + 4, colour);
  circle(ctx, x + 11, y - 7, 1.6, '#1c2430');
}

function paintPine(ctx, x, y, height, snowCap) {
  rect(ctx, x - 5, y - 8, 10, 18, '#5b4632');
  triangle(ctx, x - height * 0.34, y - 6, x + height * 0.34, y - 6, x, y - height * 0.55, '#2e5d43');
  triangle(ctx, x - height * 0.27, y - height * 0.42, x + height * 0.27, y - height * 0.42, x, y - height * 0.82, '#357050');
  triangle(ctx, x - height * 0.18, y - height * 0.68, x + height * 0.18, y - height * 0.68, x, y - height, '#3d8159');
  if (snowCap) {
    triangle(ctx, x - height * 0.09, y - height * 0.84, x + height * 0.09, y - height * 0.84, x, y - height, '#f4f8fb');
  }
}

function paintGear(ctx, x, y, radius, teeth, colour) {
  ctx.fillStyle = colour;
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / teeth) * Math.PI * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(radius * 0.82, -radius * 0.14, radius * 0.3, radius * 0.28);
    ctx.restore();
  }
  circle(ctx, x, y, radius * 0.9, colour);
  circle(ctx, x, y, radius * 0.32, '#2b2f3a');
  circle(ctx, x, y, radius * 0.14, '#c9ccd6');
}

function paintClockFace(ctx, x, y, radius, hourAngle, minuteAngle) {
  circle(ctx, x, y, radius + 6, '#7c5527');
  circle(ctx, x, y, radius, '#f7f3e8');
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, x + Math.sin(a) * (radius - 9), y - Math.cos(a) * (radius - 9), 2.4, '#3a3f4d');
  }
  line(ctx, x, y, x + Math.sin(hourAngle) * radius * 0.5, y - Math.cos(hourAngle) * radius * 0.5, '#22262f', 5);
  line(ctx, x, y, x + Math.sin(minuteAngle) * radius * 0.74, y - Math.cos(minuteAngle) * radius * 0.74, '#22262f', 3);
  circle(ctx, x, y, 4, '#e2483d');
}

/** Harbor at Dusk: sunset sky, lighthouse, boats, gulls, crates, a pier lantern. */
export function paintHarbor(ctx, mutations) {
  paintSky(ctx, '#3d4a7a', '#e88a5a', 330);
  circle(ctx, 300, 300, 46, '#ffd98a');
  circle(ctx, 300, 300, 62, 'rgba(255,217,138,0.25)');
  paintCloud(ctx, 150, 80, 1, 'rgba(244,230,220,0.85)');
  paintCloud(ctx, 460, 60, 0.8, 'rgba(244,230,220,0.7)');
  paintCloud(ctx, 330, 130, 0.6, 'rgba(244,230,220,0.6)');
  paintGull(ctx, 200, 120, 1);
  paintGull(ctx, 270, 150, 0.8);
  if (!has(mutations, 'gull-missing')) paintGull(ctx, 430, 110, 1.1);
  paintGull(ctx, 500, 160, 0.7);
  // sea
  rect(ctx, 0, 330, 596, 170, '#2f5d7d');
  for (let i = 0; i < 9; i += 1) {
    line(ctx, 20 + i * 64, 360 + (i % 3) * 26, 56 + i * 64, 360 + (i % 3) * 26, 'rgba(255,255,255,0.35)', 3);
    line(ctx, 44 + i * 64, 420 + (i % 2) * 22, 78 + i * 64, 420 + (i % 2) * 22, 'rgba(255,255,255,0.22)', 3);
  }
  ellipse(ctx, 300, 356, 90, 8, 'rgba(255,217,138,0.4)');
  // lighthouse on a rock (left)
  ellipse(ctx, 90, 336, 70, 18, '#4a4f5e');
  rect(ctx, 68, 140, 44, 190, '#f4f1e8');
  rect(ctx, 68, 168, 44, 26, has(mutations, 'stripe-colour') ? '#3f9e6e' : '#d94f43');
  rect(ctx, 68, 226, 44, 26, has(mutations, 'stripe-colour') ? '#3f9e6e' : '#d94f43');
  rect(ctx, 68, 284, 44, 26, has(mutations, 'stripe-colour') ? '#3f9e6e' : '#d94f43');
  rect(ctx, 62, 118, 56, 24, '#3a3f4d');
  circle(ctx, 90, 130, 10, '#ffd98a');
  triangle(ctx, 56, 118, 124, 118, 90, 96, '#3a3f4d');
  rect(ctx, 82, 300, 16, 30, '#3a3f4d');
  // boats
  paintBoat(ctx, 330, 330, '#c94f43', has(mutations, 'flag-flip'));
  paintBoat(ctx, 470, 352, '#3f7d9e', false);
  paintBoat(ctx, 205, 362, '#e8b34b', false);
  // pier + crates + lantern
  rect(ctx, 0, 440, 596, 60, '#6b4e33');
  for (let i = 0; i < 12; i += 1) line(ctx, i * 52, 440, i * 52, 500, '#573f29', 3);
  paintCrate(ctx, 492, 398, 40);
  paintCrate(ctx, 534, 398, 40);
  if (!has(mutations, 'crate-count')) paintCrate(ctx, 513, 360, 40);
  rect(ctx, 124, 308, 8, 132, '#3a2c20');
  paintLantern(ctx, 128, 300, has(mutations, 'lantern-colour') ? '#2ec4b6' : '#ffb340', 'rgba(255,190,90,0.3)');
  circle(ctx, 60, 470, 12, '#d94f43');
  circle(ctx, 60, 470, 6, '#f4f1e8');
  rect(ctx, 250, 452, 70, 26, '#8a6a44');
  line(ctx, 250, 465, 320, 465, '#6b4e33', 3);
}

/** Night Market: stalls, awnings, jars, fruit, a cat, lanterns and a banner. */
export function paintMarket(ctx, mutations) {
  paintSky(ctx, '#1d2440', '#3a3f6e', 500);
  for (let i = 0; i < 26; i += 1) circle(ctx, 18 + ((i * 53) % 560), 16 + ((i * 37) % 120), 1.8, 'rgba(255,255,255,0.8)');
  circle(ctx, 540, 46, 20, '#f4f1e8');
  circle(ctx, 532, 40, 16, '#1d2440');
  rect(ctx, 0, 430, 596, 70, '#4a3a2e');
  for (let i = 0; i < 10; i += 1) line(ctx, i * 64, 430, i * 64 + 30, 500, '#3d2f24', 3);
  // banner
  line(ctx, 180, 40, 180, 120, '#8a6a44', 5);
  line(ctx, 420, 40, 420, 120, '#8a6a44', 5);
  rect(ctx, 180, 52, 240, 66, '#c94f43');
  rect(ctx, 180, 52, 240, 10, '#a83e35');
  ctx.fillStyle = '#f7f3e8';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(has(mutations, 'banner-number') ? 'STALL 9' : 'STALL 6', 300, 100);
  // left stall with fruit
  rect(ctx, 40, 250, 230, 180, '#6b4e33');
  rect(ctx, 40, 250, 230, 16, '#573f29');
  triangle(ctx, 24, 250, 286, 250, 155, 196, '#e87a9e');
  rect(ctx, 120, 196, 70, 14, '#e87a9e');
  for (let i = 0; i < 4; i += 1) rect(ctx, 44 + i * 58, 232, 26, 18, '#f4f1e8');
  const fruitCount = has(mutations, 'fruit-count') ? 4 : 5;
  for (let i = 0; i < fruitCount; i += 1) {
    circle(ctx, 170 + i * 22, 296, 11, '#f28c28');
    circle(ctx, 170 + i * 22, 283, 3, '#3f7d3a');
  }
  for (let i = 0; i < 4; i += 1) circle(ctx, 76 + i * 24, 300, 10, '#e2483d');
  for (let i = 0; i < 3; i += 1) circle(ctx, 86 + i * 24, 336, 10, '#ffd98a');
  rect(ctx, 60, 372, 190, 14, '#8a6a44');
  // sign arrow (left edge)
  rect(ctx, 52, 140, 8, 110, '#8a6a44');
  const arrowDir = has(mutations, 'arrow-flip') ? -1 : 1;
  rect(ctx, arrowDir > 0 ? 34 : 40, 158, 40, 22, '#f2a541');
  triangle(ctx, arrowDir > 0 ? 74 : 40, 154, arrowDir > 0 ? 74 : 40, 184, arrowDir > 0 ? 92 : 22, 169, '#f2a541');
  // right stall with awning + jars
  rect(ctx, 330, 260, 230, 170, '#5d4630');
  triangle(ctx, 314, 260, 576, 260, 445, 206, has(mutations, 'awning-stripe') ? '#4a7dd9' : '#e87a9e');
  rect(ctx, 410, 206, 70, 14, has(mutations, 'awning-stripe') ? '#4a7dd9' : '#e87a9e');
  for (let i = 0; i < 4; i += 1) rect(ctx, 334 + i * 58, 242, 26, 18, '#f4f1e8');
  for (let i = 0; i < 3; i += 1) {
    rect(ctx, 352 + i * 40, 300, 28, 44, ['#7fb069', '#e8b34b', '#c97b4a'][i]);
    rect(ctx, 356 + i * 40, 292, 20, 8, '#8a6a44');
  }
  rect(ctx, 344, 386, 202, 14, '#8a6a44');
  // big jar (left foreground)
  ellipse(ctx, 120, 350, 34, 40, has(mutations, 'jar-colour') ? '#9b5de5' : '#f28c28');
  rect(ctx, 104, 304, 32, 12, '#8a6a44');
  ellipse(ctx, 120, 350, 34, 10, 'rgba(0,0,0,0.15)');
  // lanterns on a string
  line(ctx, 0, 120, 596, 90, 'rgba(0,0,0,0.4)', 2);
  paintLantern(ctx, 90, 132, '#ffb340', 'rgba(255,190,90,0.25)');
  paintLantern(ctx, 250, 122, '#e2483d', 'rgba(255,120,110,0.22)');
  paintLantern(ctx, 480, 110, '#2ec4b6', 'rgba(90,220,200,0.2)');
  if (has(mutations, 'lantern-extra')) paintLantern(ctx, 545, 150, '#ffb340', 'rgba(255,190,90,0.3)');
  // cat on a crate (right foreground)
  paintCrate(ctx, 440, 414, 62);
  ellipse(ctx, 472, 404, 26, 16, '#3a3f4d');
  circle(ctx, 452, 392, 13, '#3a3f4d');
  triangle(ctx, 442, 384, 448, 372, 452, 384, '#3a3f4d');
  triangle(ctx, 454, 384, 460, 372, 464, 384, '#3a3f4d');
  circle(ctx, 448, 392, 2, '#ffd98a');
  circle(ctx, 457, 392, 2, '#ffd98a');
  if (!has(mutations, 'cat-tail')) {
    ctx.strokeStyle = '#3a3f4d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(500, 398, 16, Math.PI * 0.6, Math.PI * 1.5);
    ctx.stroke();
  }
  rect(ctx, 462, 414, 5, 10, '#3a3f4d');
  rect(ctx, 478, 414, 5, 10, '#3a3f4d');
}

/** Botanical Garden: fountain, flowers, butterflies, bench, birds on a wire, sun. */
export function paintGarden(ctx, mutations) {
  paintSky(ctx, '#8ec9e8', '#dff3e0', 300);
  const sunX = has(mutations, 'sun-move') ? 470 : 520;
  circle(ctx, sunX, 90, 30, '#ffd93b');
  circle(ctx, sunX, 90, 44, 'rgba(255,217,59,0.3)');
  paintCloud(ctx, 140, 70, 1, 'rgba(255,255,255,0.95)');
  paintCloud(ctx, 330, 110, 0.7, 'rgba(255,255,255,0.9)');
  // wire + birds
  ctx.strokeStyle = 'rgba(40,50,60,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 60);
  ctx.quadraticCurveTo(450, 92, 580, 62);
  ctx.stroke();
  const birdCount = has(mutations, 'bird-count') ? 3 : 4;
  const birdSpots = [[382, 72], [420, 80], [458, 80], [496, 72]];
  for (let i = 0; i < birdCount; i += 1) paintBird(ctx, birdSpots[i][0], birdSpots[i][1], '#4a7dd9');
  // lawn
  rect(ctx, 0, 300, 596, 200, '#6db56a');
  ellipse(ctx, 300, 470, 320, 44, '#5da85c');
  for (let i = 0; i < 14; i += 1) line(ctx, 16 + i * 42, 470, 10 + i * 42, 452, '#4c9450', 3);
  // path
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(262, 500);
  ctx.lineTo(300, 330);
  ctx.lineTo(340, 330);
  ctx.lineTo(390, 500);
  ctx.closePath();
  ctx.fill();
  // fountain (centre)
  ellipse(ctx, 300, 330, 74, 18, '#b9c4ce');
  ellipse(ctx, 300, 326, 64, 14, '#7fc4e8');
  rect(ctx, 292, 286, 16, 42, '#9fb2c0');
  circle(ctx, 300, 282, 12, '#9fb2c0');
  const jetH = has(mutations, 'fountain-jet') ? 26 : 58;
  ctx.strokeStyle = '#bfe6f7';
  ctx.lineWidth = 4;
  for (const dx of [-34, -16, 0, 16, 34]) {
    ctx.beginPath();
    ctx.moveTo(300, 276);
    ctx.quadraticCurveTo(300 + dx * 0.6, 276 - jetH, 300 + dx, 320);
    ctx.stroke();
  }
  // bench (right of fountain)
  rect(ctx, 330, 356, 110, 10, '#8a6a44');
  rect(ctx, 336, 366, 8, 26, '#6b4e33');
  rect(ctx, 426, 366, 8, 26, '#6b4e33');
  rect(ctx, 330, 322, 110, 8, '#8a6a44');
  if (!has(mutations, 'bench-slat')) rect(ctx, 330, 338, 110, 8, '#8a6a44');
  rect(ctx, 336, 322, 8, 34, '#6b4e33');
  rect(ctx, 426, 322, 8, 34, '#6b4e33');
  // flower beds
  ellipse(ctx, 110, 430, 110, 26, '#7a5a3a');
  ellipse(ctx, 470, 452, 100, 24, '#7a5a3a');
  paintFlower(ctx, 110, 380, has(mutations, 'petal-count') ? 5 : 6, '#e87a9e', '#ffd93b');
  paintFlower(ctx, 56, 404, 6, '#f4f1e8', '#f28c28');
  paintFlower(ctx, 166, 410, 6, '#9b5de5', '#ffd93b');
  if (!has(mutations, 'flower-missing')) paintFlower(ctx, 250, 430, 6, '#e2483d', '#ffd93b');
  paintFlower(ctx, 430, 424, 6, '#f2a541', '#c94f43');
  paintFlower(ctx, 492, 434, 6, '#e87a9e', '#ffd93b');
  // tree (left back) — painted before the big leaf so the leaf stays visible
  rect(ctx, 36, 240, 14, 70, '#7a5a3a');
  circle(ctx, 43, 210, 44, '#4c9450');
  circle(ctx, 20, 232, 28, '#5da85c');
  circle(ctx, 68, 232, 28, '#5da85c');
  // big leaf (left, in front of the tree)
  ctx.fillStyle = '#57c47e';
  ctx.strokeStyle = '#2e7d54';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (has(mutations, 'leaf-shape')) {
    ctx.moveTo(30, 290);
    ctx.quadraticCurveTo(20, 220, 90, 214);
    ctx.quadraticCurveTo(96, 280, 30, 290);
  } else {
    ctx.moveTo(92, 290);
    ctx.quadraticCurveTo(100, 220, 32, 214);
    ctx.quadraticCurveTo(26, 280, 92, 290);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  line(ctx, 60, 290, 60, 340, '#2e7d54', 5);
  // butterfly (top right)
  const wing = has(mutations, 'butterfly-colour') ? '#9b5de5' : '#f28c28';
  ellipse(ctx, 458, 142, 14, 10, wing);
  ellipse(ctx, 484, 142, 14, 10, wing);
  ellipse(ctx, 460, 158, 11, 8, wing);
  ellipse(ctx, 482, 158, 11, 8, wing);
  ellipse(ctx, 471, 150, 4, 14, '#3a3f4d');
  line(ctx, 471, 138, 462, 128, '#3a3f4d', 2);
  line(ctx, 471, 138, 480, 128, '#3a3f4d', 2);
  // plant pot (bottom right)
  ctx.fillStyle = has(mutations, 'pot-colour') ? '#d94f43' : '#4a7dd9';
  ctx.beginPath();
  ctx.moveTo(506, 408);
  ctx.lineTo(556, 408);
  ctx.lineTo(548, 448);
  ctx.lineTo(514, 448);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 502, 398, 58, 12, has(mutations, 'pot-colour') ? '#b83e35' : '#3a63b0');
  ellipse(ctx, 531, 386, 16, 10, '#3f9e6e');
  ellipse(ctx, 516, 394, 12, 8, '#4c9450');
  ellipse(ctx, 546, 394, 12, 8, '#4c9450');
}

/** Mountain Cabin: night snow scene, cabin, pines, snowman, fence, moon and stars. */
export function paintCabin(ctx, mutations) {
  paintSky(ctx, '#16203c', '#2c4468', 500);
  const starSpots = [[40, 40], [120, 70], [200, 36], [280, 60], [360, 30], [440, 56], [560, 130], [90, 140], [240, 120], [480, 170]];
  starSpots.forEach(([x, y], i) => {
    if (i === 1 && has(mutations, 'star-missing')) return;
    circle(ctx, x, y, i === 1 ? 4 : 2.2, '#f7f3e8');
    if (i === 1) {
      line(ctx, x - 9, y, x + 9, y, 'rgba(247,243,232,0.7)', 2);
      line(ctx, x, y - 9, x, y + 9, 'rgba(247,243,232,0.7)', 2);
    }
  });
  // moon
  circle(ctx, 520, 80, 26, '#f4f1e8');
  if (has(mutations, 'moon-phase')) circle(ctx, 532, 72, 22, '#16203c');
  // mountains + snow ground
  triangle(ctx, -20, 330, 180, 170, 330, 330, '#5a6b85');
  triangle(ctx, 140, 330, 380, 190, 560, 330, '#4a5b78');
  triangle(ctx, 150, 200, 180, 170, 214, 202, '#eef4fa');
  triangle(ctx, 348, 222, 380, 190, 414, 224, '#eef4fa');
  rect(ctx, 0, 330, 596, 170, '#e8f0f8');
  ellipse(ctx, 300, 470, 330, 40, '#dbe7f4');
  // pines
  paintPine(ctx, 60, 360, 110, true);
  paintPine(ctx, 180, 340, 120, !has(mutations, 'tree-snow'));
  paintPine(ctx, 545, 350, 130, true);
  paintPine(ctx, 500, 330, 90, true);
  // cabin (centre)
  rect(ctx, 250, 270, 160, 110, '#8a6a44');
  for (let i = 0; i < 4; i += 1) line(ctx, 250, 292 + i * 24, 410, 292 + i * 24, '#75552f', 3);
  triangle(ctx, 232, 272, 428, 272, 330, 206, '#5d4630');
  triangle(ctx, 232, 272, 428, 272, 330, 206, 'rgba(0,0,0,0)');
  ctx.fillStyle = '#f4f8fb';
  ctx.beginPath();
  ctx.moveTo(240, 268);
  ctx.lineTo(420, 268);
  ctx.lineTo(330, 208);
  ctx.closePath();
  ctx.fill();
  // chimney + smoke
  rect(ctx, 352, 168, 26, 52, has(mutations, 'brick-colour') ? '#8d929e' : '#9e5a44');
  line(ctx, 352, 184, 378, 184, 'rgba(0,0,0,0.2)', 2);
  line(ctx, 352, 200, 378, 200, 'rgba(0,0,0,0.2)', 2);
  const puffs = has(mutations, 'smoke-count') ? 2 : 3;
  const puffSpots = [[365, 150, 11], [356, 126, 15], [370, 100, 19]];
  for (let i = 0; i < puffs; i += 1) circle(ctx, puffSpots[i][0], puffSpots[i][1], puffSpots[i][2], 'rgba(240,244,248,0.85)');
  // icicles under the roof edge
  const icicles = has(mutations, 'icicle-count') ? 3 : 4;
  for (let i = 0; i < icicles; i += 1) triangle(ctx, 248 + i * 26, 272, 260 + i * 26, 272, 254 + i * 26, 292, '#cfe8f7');
  // window + door
  rect(ctx, 282, 262, 36, 36, '#5d4630');
  rect(ctx, 286, 266, 28, 28, has(mutations, 'window-light') ? '#2c3444' : '#ffd98a');
  line(ctx, 300, 266, 300, 294, '#5d4630', 3);
  line(ctx, 286, 280, 314, 280, '#5d4630', 3);
  rect(ctx, 322, 306, 40, 74, '#6b4e33');
  circle(ctx, has(mutations, 'handle-side') ? 330 : 354, 344, 4, '#e8b34b');
  rect(ctx, 322, 306, 40, 8, '#573f29');
  // fence (left foreground)
  const posts = has(mutations, 'fence-count') ? 4 : 5;
  for (let i = 0; i < posts; i += 1) rect(ctx, 40 + i * 30, 362, 10, 46, '#7a5a3a');
  rect(ctx, 34, 374, 150, 8, '#8a6a44');
  rect(ctx, 34, 392, 150, 8, '#8a6a44');
  // snowman (right foreground)
  circle(ctx, 470, 430, 30, '#f7fbff');
  circle(ctx, 470, 386, 21, '#f7fbff');
  circle(ctx, 470, 356, 14, '#f7fbff');
  circle(ctx, 465, 352, 2.2, '#22262f');
  circle(ctx, 475, 352, 2.2, '#22262f');
  triangle(ctx, 470, 356, 470, 360, 482, 358, '#f28c28');
  rect(ctx, 454, 366, 32, 9, has(mutations, 'scarf-colour') ? '#3f9e6e' : '#d94f43');
  rect(ctx, 478, 372, 9, 22, has(mutations, 'scarf-colour') ? '#3f9e6e' : '#d94f43');
  line(ctx, 450, 388, 424, 372, '#7a5a3a', 4);
  line(ctx, 490, 388, 516, 372, '#7a5a3a', 4);
  circle(ctx, 470, 392, 3, '#22262f');
  circle(ctx, 470, 406, 3, '#22262f');
  rect(ctx, 458, 336, 24, 8, '#22262f');
  rect(ctx, 462, 322, 16, 16, '#22262f');
  // footprint trail
  if (!has(mutations, 'footprints')) {
    const prints = [[120, 440], [142, 452], [162, 440], [184, 452], [204, 440]];
    for (const [x, y] of prints) ellipse(ctx, x, y, 7, 4, '#c3d4e8');
  }
  // lantern by the door
  paintLantern(ctx, 238, 356, '#ffb340', 'rgba(255,190,90,0.3)');
}

/** Clockmaker's Workshop: clocks, gears, bench, shelves, lamp, books and tools. */
export function paintWorkshop(ctx, mutations) {
  rect(ctx, 0, 0, 596, 500, '#3d3a4d');
  for (let i = 0; i < 6; i += 1) line(ctx, 0, 70 + i * 70, 596, 70 + i * 70, 'rgba(0,0,0,0.12)', 2);
  rect(ctx, 0, 440, 596, 60, '#2e2b3d');
  // shelves (top right)
  rect(ctx, 300, 96, 280, 10, '#7a5a3a');
  rect(ctx, 300, 196, 280, 10, '#7a5a3a');
  // winding keys on the top shelf
  const keys = has(mutations, 'key-count') ? 2 : 3;
  for (let i = 0; i < keys; i += 1) {
    const kx = 316 + i * 26;
    circle(ctx, kx, 78, 7, '#e8b34b');
    rect(ctx, kx - 2, 84, 4, 12, '#e8b34b');
    rect(ctx, kx + 2, 90, 6, 4, '#e8b34b');
  }
  // small boxes + jars on shelves
  rect(ctx, 410, 62, 34, 34, '#c97b4a');
  rect(ctx, 452, 70, 26, 26, '#7fb069');
  rect(ctx, 486, 58, 30, 38, '#4a7dd9');
  // wall clock + pendulum (left)
  paintClockFace(ctx, 150, 110, 52, has(mutations, 'clock-time') ? 4.2 : 1.05, has(mutations, 'clock-time') ? 5.6 : 3.14);
  rect(ctx, 104, 168, 92, 110, '#6b4e33');
  rect(ctx, 112, 176, 76, 94, '#4a3a2e');
  const pendLen = has(mutations, 'pendulum-length') ? 44 : 76;
  line(ctx, 150, 178, 150, 178 + pendLen, '#c9ccd6', 3);
  circle(ctx, 150, 184 + pendLen, 11, '#e8b34b');
  // big gear (top right) + small gear (centre)
  paintGear(ctx, 430, 150, 34, has(mutations, 'gear-teeth') ? 8 : 12, '#c9a227');
  paintGear(ctx, 300, 200, has(mutations, 'gear-size') ? 30 : 20, 10, '#8d929e');
  paintGear(ctx, 360, 260, 16, 8, '#b07f45');
  // calendar (top right corner)
  rect(ctx, 516, 76, 48, 62, '#f7f3e8');
  rect(ctx, 516, 76, 48, 16, '#d94f43');
  ctx.fillStyle = '#22262f';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(has(mutations, 'calendar-date') ? '17' : '7', 540, 126);
  // lamp (left)
  line(ctx, 70, 0, 70, 120, '#22262f', 4);
  triangle(ctx, 38, 196, 102, 196, 70, 140, has(mutations, 'lamp-colour') ? '#3f9e6e' : '#d94f43');
  circle(ctx, 70, 192, 10, '#ffd98a');
  circle(ctx, 70, 192, 30, 'rgba(255,217,138,0.18)');
  // bench
  rect(ctx, 30, 340, 536, 22, '#8a6a44');
  rect(ctx, 40, 362, 16, 78, '#6b4e33');
  rect(ctx, 540, 362, 16, 78, '#6b4e33');
  // drawers under the bench (left)
  rect(ctx, 70, 378, 110, 34, '#75552f');
  rect(ctx, 70, 418, 110, 34, '#75552f');
  circle(ctx, 125, 395, 6, '#e8b34b');
  if (!has(mutations, 'drawer-knob')) circle(ctx, 125, 435, 6, '#e8b34b');
  // tools on the bench: hammer, wrench, screwdriver
  rect(ctx, 196, 316, 8, 26, '#8a6a44');
  rect(ctx, 186, 306, 30, 12, '#8d929e');
  line(ctx, 286, 338, 310, 316, '#8d929e', 6);
  circle(ctx, 314, 312, 8, '#8d929e');
  circle(ctx, 314, 312, 4, '#3d3a4d');
  if (!has(mutations, 'tool-missing')) {
    line(ctx, 238, 340, 258, 322, '#c9ccd6', 4);
    rect(ctx, 256, 312, 10, 14, '#e2483d');
  }
  // magnifier on the bench
  const magX = has(mutations, 'magnifier-move') ? 414 : 380;
  circle(ctx, magX, 318, 17, 'rgba(190,230,247,0.5)');
  ctx.strokeStyle = '#e8b34b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(magX, 318, 17, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, magX + 12, 330, magX + 26, 344, '#7a5a3a', 6);
  // jar with a number label (right of bench)
  ellipse(ctx, 520, 306, 26, 32, '#7fc4e8');
  rect(ctx, 504, 268, 32, 10, '#8a6a44');
  rect(ctx, 504, 294, 32, 22, '#f7f3e8');
  ctx.fillStyle = '#22262f';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(has(mutations, 'jar-number') ? '12' : '21', 520, 310);
  // bell (left of bench)
  const bellR = has(mutations, 'bell-shape') ? 12 : 19;
  ctx.fillStyle = '#e8b34b';
  ctx.beginPath();
  ctx.arc(60, 330, bellR, Math.PI, 0);
  ctx.lineTo(60 + bellR, 338);
  ctx.lineTo(60 - bellR, 338);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 60, 330 - bellR - 3, 4, '#c9a227');
  circle(ctx, 60, 342, 4, '#8a6a44');
  // books (bottom right)
  const bookA = has(mutations, 'book-order') ? '#4a7dd9' : '#d94f43';
  const bookB = has(mutations, 'book-order') ? '#d94f43' : '#4a7dd9';
  rect(ctx, 452, 366, 20, 72, bookA);
  rect(ctx, 474, 360, 20, 78, bookB);
  rect(ctx, 496, 372, 18, 66, '#7fb069');
  rect(ctx, 452, 376, 20, 6, 'rgba(255,255,255,0.5)');
  rect(ctx, 474, 372, 20, 6, 'rgba(255,255,255,0.5)');
  // spare gears + parts bin (floor)
  paintGear(ctx, 250, 462, 18, 9, '#8d929e');
  paintGear(ctx, 300, 470, 13, 8, '#c9a227');
  rect(ctx, 330, 446, 60, 34, '#5d6b85');
  rect(ctx, 330, 446, 60, 8, '#4a5b78');
  // hanging tools on the wall (centre-left)
  line(ctx, 230, 60, 230, 96, '#c9ccd6', 4);
  rect(ctx, 224, 94, 12, 16, '#e2483d');
  circle(ctx, 262, 72, 10, '#e8b34b');
  rect(ctx, 260, 80, 4, 16, '#e8b34b');
}

/** Paint one level's picture into the current transform: empty mutations = the original. */
export const SCENE_PAINTERS = {
  harbor: paintHarbor,
  market: paintMarket,
  garden: paintGarden,
  cabin: paintCabin,
  workshop: paintWorkshop,
};
