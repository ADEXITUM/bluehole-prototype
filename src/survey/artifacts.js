// These are cave objects, drawn before the ordinary light and silt passes.
// Their survey points and physical geometry belong to the site definition.
function drawSurveyArtifact(ctx, view, world, find) {
  if(find.kind==="entry-tag"){
    ctx.save();ctx.translate((find.x-view.ox)*view.zoom,(find.y-view.oy)*view.zoom);ctx.scale(view.zoom,view.zoom);
    ctx.strokeStyle="#c1c7b1";ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(0,-.65);ctx.lineTo(0,-.34);ctx.stroke();
    ctx.rotate(-.08);ctx.fillStyle="#d6b94f";ctx.strokeStyle="#687058";ctx.lineWidth=.035;
    _t(ctx,-.38,-.32,.76,.64,.07);ctx.fill();ctx.stroke();
    // Reused plate: erased marks remain below the later date. They are not a
    // second route, a readable earlier year, or a new collectible.
    ctx.strokeStyle='#827348';ctx.lineWidth=.028;ctx.globalAlpha=.7;
    ctx.beginPath();ctx.moveTo(-.27,.12);ctx.lineTo(-.22,.25);ctx.lineTo(-.13,.2);ctx.moveTo(-.04,.21);ctx.lineTo(.04,.14);ctx.lineTo(.09,.25);ctx.moveTo(.17,.25);ctx.lineTo(.25,.14);ctx.stroke();
    ctx.strokeStyle='#e8cf76';ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(-.29,.23);ctx.lineTo(.27,.13);ctx.moveTo(-.2,.14);ctx.lineTo(.25,.24);ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle="#6c6542";ctx.beginPath();ctx.arc(0,-.24,.045,0,Math.PI*2);ctx.fill();
    ctx.font="bold .25px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("96",0,-.035);
    ctx.restore();return true;
  }
  if (!["tank", "reel", "slate", "cache"].includes(find.kind)) return false;
  if (find.kind === "tank") {
    drawSurveyCylinder(ctx, view, world, find.x, find.y, "81");
    return true;
  }
  if (find.kind === "cache") {
    drawSurveyCylinder(ctx, view, world, find.x - 0.28, find.y, "");
  }
  ctx.save();
  ctx.translate((find.x - view.ox) * view.zoom, (find.y - view.oy) * view.zoom);
  ctx.scale(view.zoom, view.zoom);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (find.kind === "reel") drawSurveyReel(ctx);
  else if (find.kind === "cache") drawCachePlate(ctx);
  else drawSurveySlate(ctx);
  ctx.restore();
  return true;
}

// The pale rim reads across the pocket. The blue trace and its retaining
// clip resolve up close. All three exposure points lie on this same plate.
function drawCachePlate(ctx) {
  ctx.translate(.59, -.33);
  ctx.rotate(.16);
  ctx.fillStyle = "#eee7ce";
  ctx.strokeStyle = "#605e54";
  ctx.lineWidth = .035;
  _t(ctx, -.47, -.28, .94, .56, .035);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c8c5ad";
  ctx.fillRect(-.39, -.21, .78, .42);
  ctx.strokeStyle = "#635d50";
  ctx.lineWidth = .033;
  ctx.beginPath();
  ctx.moveTo(-.34, .06);
  ctx.lineTo(-.15, .05);
  ctx.moveTo(.01, .05);
  ctx.lineTo(.33, .12);
  ctx.stroke();
  ctx.strokeStyle = "#315977";
  ctx.lineWidth = .045;
  ctx.beginPath();
  ctx.moveTo(-.25, .13);
  ctx.lineTo(-.15, -.09);
  ctx.lineTo(.08, -.14);
  ctx.lineTo(.25, .05);
  ctx.stroke();
  ctx.fillStyle = "#655345";
  ctx.fillRect(-.18, -.30, .36, .10);
  ctx.fillStyle = "#b5b5a3";
  ctx.fillRect(-.15, -.29, .30, .032);
}

function drawSurveyCylinder(ctx, view, world, x, floorY, stamp) {
  const { D: diameter } = Sl("stage");
  const tank = { id: "stage", mix: "air", x, y: floorY - diameter / 2 - 0.01, onLine: false, falling: false };
  const pose = kd(ctx, view, world, tank, { bodyColor: "#a6aaa2", label: stamp });
  ctx.save();
  ctx.translate((pose.cx - view.ox) * view.zoom, (pose.cy - view.oy) * view.zoom);
  ctx.rotate(pose.ang);
  ctx.scale(view.zoom, view.zoom);
  // The valve may face either way along the floor. Keep the coiled hose on
  // the visible upper side when the cylinder is turned through 180 degrees.
  ctx.scale(1, Math.cos(pose.ang) < 0 ? -1 : 1);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // The regulator is screwed into the same shoulder and valve drawn by kd.
  const neckX = pose.L / 2 - 0.03;
  ctx.fillStyle = "#c2c8c6";
  ctx.strokeStyle = "#303b3e";
  ctx.lineWidth = 0.025;
  _t(ctx, neckX, -0.06, 0.11, 0.12, 0.025);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(neckX + 0.06, -0.035);
  ctx.bezierCurveTo(neckX + 0.08, -0.27, 0.08, -0.28, -0.12, -0.21);
  ctx.bezierCurveTo(-0.27, -0.16, -0.29, -0.08, -0.14, -0.08);
  ctx.strokeStyle = "#202b30";
  ctx.lineWidth = 0.05;
  ctx.stroke();
  ctx.strokeStyle = "#85928b";
  ctx.lineWidth = 0.014;
  ctx.stroke();
  ctx.fillStyle = "#3a4548";
  ctx.strokeStyle = "#b8c1b9";
  ctx.lineWidth = 0.018;
  _t(ctx, -0.17, -0.13, 0.15, 0.09, 0.035);
  ctx.fill();
  ctx.stroke();

  // A metal clip and scuffed paint distinguish the abandoned cylinder.
  ctx.beginPath();
  ctx.moveTo(0.19, 0.09);
  ctx.lineTo(0.27, 0.12);
  ctx.lineTo(0.29, 0.19);
  ctx.lineTo(0.22, 0.22);
  ctx.closePath();
  ctx.strokeStyle = "#d5d7c8";
  ctx.lineWidth = 0.027;
  ctx.stroke();
  ctx.fillStyle = "#806b49";
  ctx.fillRect(-0.34, -0.03, 0.06, 0.035);
  ctx.fillRect(0.12, 0.1, 0.065, 0.025);
  ctx.restore();
}

function drawSurveyReel(ctx) {
  // The old line starts at this object's anchor and continues into the slit.
  ctx.beginPath();
  ctx.moveTo(0.05, -0.11);
  ctx.quadraticCurveTo(0.26, -0.08, 0.39, 0.01);
  ctx.quadraticCurveTo(0.19, 0.06, 0, -0.1);
  ctx.strokeStyle = "#dad0a5";
  ctx.lineWidth = 0.025;
  ctx.stroke();

  // A raised handle, two reel cheeks and the wound thread stay distinct.
  ctx.fillStyle = "#4a514d";
  ctx.strokeStyle = "#303c3d";
  ctx.lineWidth = 0.065;
  ctx.beginPath();
  ctx.moveTo(-0.15, -0.17);
  ctx.lineTo(-0.13, -0.38);
  ctx.quadraticCurveTo(-0.02, -0.44, 0.14, -0.36);
  ctx.lineTo(0.18, -0.17);
  ctx.stroke();
  ctx.strokeStyle = "#c0b896";
  ctx.lineWidth = 0.026;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0.1, -0.18, 0.14, 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#303c3d";
  ctx.lineWidth = 0.035;
  ctx.stroke();
  ctx.fillStyle = "#e8dfbd";
  ctx.beginPath();
  ctx.ellipse(0.02, -0.18, 0.135, 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#77745c";
  ctx.lineWidth = 0.019;
  for (const radius of [0.055, 0.09, 0.125]) {
    ctx.beginPath();
    ctx.ellipse(0.02, -0.18, radius, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#363f3e";
  ctx.beginPath();
  ctx.arc(0.02, -0.18, 0.037, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b9a96c";
  ctx.lineWidth = 0.04;
  ctx.beginPath();
  ctx.moveTo(0.02, -0.18);
  ctx.lineTo(0.15, -0.11);
  ctx.stroke();
  ctx.fillStyle = "#cfc7a6";
  ctx.fillRect(0.135, -0.13, 0.06, 0.07);
}

function drawSurveySlate(ctx) {
  ctx.save();
  ctx.translate(0, -0.22);
  ctx.rotate(-0.07);
  ctx.fillStyle = "#d9dacb";
  ctx.strokeStyle = "#4d5957";
  ctx.lineWidth = 0.025;
  _t(ctx, -0.16, -0.2, 0.32, 0.4, 0.025);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#75837e";
  ctx.fillRect(-0.06, -0.21, 0.12, 0.045);
  ctx.strokeStyle = "#4e5c5c";
  ctx.lineWidth = 0.015;
  ctx.beginPath();
  ctx.moveTo(-0.11, -0.08);
  ctx.lineTo(0, -0.08);
  ctx.lineTo(0.05, 0.035);
  ctx.lineTo(-0.03, 0.12);
  ctx.moveTo(0, -0.08);
  ctx.lineTo(0.1, -0.035);
  ctx.moveTo(-0.1, 0.02);
  ctx.lineTo(-0.035, 0.02);
  ctx.stroke();
  ctx.strokeStyle = "#b6834e";
  ctx.lineWidth = 0.035;
  ctx.beginPath();
  ctx.moveTo(0.19, -0.12);
  ctx.lineTo(0.19, 0.13);
  ctx.stroke();
  ctx.restore();
}
