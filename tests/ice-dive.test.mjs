import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {launchBrowser} from './qa-campaign-browser.mjs';
import vm from 'node:vm';

const read = name => readFileSync(new URL('../src/survey/' + name, import.meta.url), 'utf8');
const source = read('ice-dive.js');
const context = vm.createContext({});
vm.runInContext(source, context);
const plain = obj => JSON.parse(JSON.stringify(obj));
function expedition(progress) {
  const saves = [];
  const game = new context.IceDive({progress, onSave: value => saves.push(plain(value))});
  // Drive the actual simulation and station actions independently of its view.
  game.showPhase = () => {};
  return {game, saves, snapshot: () => saves.at(-1)};
}
const tick = (game, seconds) => {
  for (let i = 0; i < Math.round(seconds * 60); i++) game.step(1 / 60);
};
function steer(game, x, y) {
  for (let i = 0; i < 1800; i++) {
    const d = game.dive;
    assert.equal(d.phase, 'diving');
    const dx = x - d.x, dy = y - d.y;
    game.keys.clear();
    if (Math.hypot(dx, dy) < .55) return;
    if (Math.abs(dx) > .3) game.keys.set('x', dx < 0 ? 'left' : 'right');
    if (Math.abs(dy) > .3) game.keys.set('y', dy < 0 ? 'up' : 'down');
    game.step(1/60);
  }
  assert.fail('Waypoint unreachable ' + JSON.stringify({x,y,dive:game.dive}));
}
function surface(game) {
  steer(game, 0, 2);
  game.keys.clear();
  game.keys.set('y','up');
  tick(game, 2);
  assert.equal(game.dive.phase, 'surfaced');
}

test('the near sortie banks navigation only at the lead and reloads in place', () => {
  const first = expedition();
  first.game.action('start');
  first.game.action('ping');
  first.game.action('ping');
  assert.equal(first.game.dive.pings, 2);
  steer(first.game, 18, 6);
  first.game.action('work');
  const choice = first.game.hint();
  assert.match(choice,/Майна.*пеленг.*катушку/u);
  assert.match(choice,/Самописец.*кассет/u);
  assert.equal(first.snapshot().dive.reading, true);
  assert.equal(first.snapshot().charted, false);
  assert.ok(!('fieldRecord' in first.snapshot()));
  const resumed = expedition(first.snapshot());
  assert.deepEqual(plain(resumed.game.dive), {...first.snapshot().dive, phase:'paused'});
  tick(resumed.game, 120);
  resumed.game.action('resume');
  assert.deepEqual(resumed.snapshot(), first.snapshot());
  steer(resumed.game,3.6,6);
  assert.match(resumed.game.hint(),/^Майна.*влево/u,'alongside the opening, align before ascending');
  steer(resumed.game,0,6);
  resumed.game.action('ping');
  assert.match(resumed.game.hint(),/^Майна над тобой.*[Вв]сплыв/u,'a sounding cannot override the banking prompt');
  assert.equal(resumed.game.target().name,'Майна');
  assert.equal(resumed.snapshot().charted,false,'choosing to surface is still required');
  surface(resumed.game);
  assert.equal(resumed.snapshot().charted, true);
  assert.equal(resumed.snapshot().completed, false);
  assert.match(resumed.snapshot().fieldRecord, /репера/);
  resumed.game.action('start');
  assert.equal(resumed.game.target().x, 48);
  assert.equal(resumed.game.dive.pings, 3);
  assert.equal(resumed.snapshot().dive.reading, false);
});

test('reach the recorder around the keel, carry it through reload, then deliver it', () => {
  const first = expedition();
  const g = first.game;
  g.action('start');
  g.action('work');
  assert.equal(g.dive.reading || g.dive.cargo, false);
  steer(g, 18, 6);
  g.action('work');
  steer(g, 26, 13);
  assert.match(g.hint(),/^Самописец.*кассет[^\n]*\nМайна/u,'the outbound route and early return are both available');
  steer(g, 48, 14);
  assert.match(g.hint(),/^Самописец.*Забрать/u);
  g.action('work');
  assert.equal(first.snapshot().dive.cargo, true);
  assert.equal(first.snapshot().completed, false);
  assert.equal(first.snapshot().fieldRecord, undefined);
  const second = expedition(first.snapshot());
  const r = second.game;
  r.action('resume');
  steer(r, 26, 13);
  steer(r, 16, 5);
  surface(r);
  const won = second.snapshot();
  assert.equal(won.completed, true);
  assert.equal(won.charted, true);
  assert.match(won.fieldRecord, /кассете/);
  assert.ok(won.dive.gas > 0 && won.dive.gas < 80);
  r.action('start');
  assert.equal(r.dive.cargo, false);
  tick(r, 200);
  assert.equal(r.dive.phase, 'lost');
  assert.equal(second.snapshot().completed, true);
  assert.equal(second.snapshot().fieldRecord, won.fieldRecord);
  r.action('start');
  surface(r);
  assert.equal(second.snapshot().fieldRecord, won.fieldRecord);
});

test('solid ice blocks surfacing and the keel blocks a shallow crossing', () => {
  const {game} = expedition();
  game.action('start');
  steer(game, 17, 4);
  game.keys.clear(); game.keys.set('held','up');
  tick(game, 2);
  assert.equal(game.dive.phase, 'diving');
  assert.ok(game.dive.y > 1.8);
  steer(game, 21, 4);
  game.keys.clear(); game.keys.set('held','right');
  tick(game, 8);
  assert.ok(game.dive.x > 24 && game.dive.x < 30);
});

test('fast fins gain distance at a higher gas cost per metre and soundings are finite', () => {
  function trial(fast) {
    const {game} = expedition();
    game.action('start');
    if (fast) game.action('fin');
    game.keys.set('x','right');
    tick(game, 3);
    return game.dive;
  }
  const regular = trial(false), fast = trial(true);
  assert.ok(fast.x > regular.x * 1.4);
  assert.ok((130 - fast.gas)/fast.x > (130 - regular.gas)/regular.x);
  const {game} = expedition();
  game.action('start');
  for (let i=0; i<3; i++) {
    game.action('ping');
    assert.equal(game.dive.pulse, 7);
    tick(game, 7.1);
  }
  game.action('ping');
  assert.equal(game.dive.pings, 0);
  assert.equal(game.dive.pulse, 0);
});

test('expired gas loses the unbanked discovery; malformed runs cannot strand a profile', () => {
  const {game, snapshot} = expedition();
  game.action('start');
  steer(game,18,6);
  game.action('work');
  tick(game,200);
  assert.equal(snapshot().dive.phase, 'lost');
  assert.equal(snapshot().completed || snapshot().charted, false);
  assert.equal(snapshot().fieldRecord, undefined);
  const repaired = expedition({version:1,completed:true,dive:{phase:'diving',gas:NaN}});
  assert.equal(repaired.game.dive.phase, 'brief');
  repaired.game.action('start');
  assert.equal(repaired.snapshot().completed, true);
});

test('only banked evidence unlocks the surface choice; death and legacy saves retain earned gear', () => {
  const {game, snapshot} = expedition();
  game.action('start');
  steer(game,18,6); game.action('work'); tick(game,200);
  assert.equal(game.reelUnlocked,false);
  game.selectTool('reel');
  game.action('start');
  assert.equal(game.dive.tool,'sounder');
  steer(game,18,6); game.action('work'); surface(game);
  assert.equal(game.reelUnlocked,true);
  assert.equal(snapshot().selectedTool,'sounder');
  game.selectTool('reel');
  assert.equal(snapshot().dive.tool,'sounder','surface choice applies to the next sortie');
  const next = expedition(snapshot());
  next.game.action('start');
  assert.equal(next.game.dive.tool,'reel');
  next.game.selectTool('sounder');
  tick(next.game,200);
  assert.equal(next.snapshot().selectedTool,'reel');
  assert.equal(next.game.reelUnlocked,true);
  next.game.selectTool('sounder');
  next.game.action('start');
  assert.equal(next.game.dive.pings,3);
  // A v1 delivery that bypassed the relay earns the same choice on first load.
  const old = snapshot();
  delete old.selectedTool; delete old.dive.tool;
  old.charted=false; old.completed=true;
  const legacy = expedition(old).game;
  assert.equal(legacy.selectedTool,'sounder');
  legacy.selectTool('reel'); legacy.action('start');
  assert.equal(legacy.dive.tool,'reel');
});

test('the 32 m reel marks the swum bend, runs out, restores its return cursor and guides around the keel', () => {
  const run = expedition({charted:true,version:1});
  const g = run.game;
  g.selectTool('reel');
  g.action('start');
  g.action('ping');
  assert.equal(g.dive.pulse,0);
  steer(g,18,6); g.action('reel');
  steer(g,22,13); steer(g,40,13); steer(g,48,14);
  assert.equal(g.dive.line.mode,'full');
  assert.equal(g.dive.line.used,32);
  const tip = g.dive.line.points.at(-1);
  assert.ok(tip.x < g.dive.x);
  g.action('work');
  assert.equal(g.target().name,'По линю');
  assert.equal(g.target().x,tip.x);
  steer(g,40,13); g.action('pause');
  const saved=run.snapshot(), resumed=expedition(saved).game;
  assert.equal(resumed.dive.line.cursor,saved.dive.line.cursor);
  assert.deepEqual(plain(resumed.target()),plain(g.target()));
  resumed.action('resume');
  let passedKeel=false;
  for (let i=0; i<1400 && resumed.dive.line.mode==='return'; i++) {
    const target=resumed.target(), d=resumed.dive;
    resumed.keys.clear();
    if (Math.abs(target.x-d.x)>.32) resumed.keys.set('x', target.x<d.x?'left':'right');
    if (Math.abs(target.y-d.y)>.32) resumed.keys.set('y', target.y<d.y?'up':'down');
    resumed.step(1/60);
    if (Math.abs(d.x-33)<.5) {assert.ok(d.y>11); passedKeel=true;}
  }
  assert.ok(passedKeel);
  assert.equal(resumed.dive.line.mode,'home');
  assert.equal(resumed.target().name,'Майна');
  surface(resumed);
  assert.equal(resumed.completed,true);
  resumed.action('start');
  assert.equal(resumed.dive.line.used,0);
  assert.equal(resumed.dive.line.mode,'packed');
});

function layWestLine(game) {
  game.action('start-west');
  assert.equal(game.dive.route,'west');
  game.action('reel');
  steer(game,-8,12);
  steer(game,-16,12);
  steer(game,-22,9);
  assert.equal(game.canClip(),true);
  game.action('work');
  assert.equal(game.dive.line.mode,'haul');
  assert.ok(game.dive.pod.at > 22 && game.dive.pod.at < 32);
}

test('west before the east cassette requires successive physical hauls, restores a moving load and banks both recordings', () => {
  const near = expedition();
  near.game.action('start-west');
  assert.equal(near.game.dive.phase,'brief');
  near.game.action('start');
  steer(near.game,18,6); near.game.action('work'); surface(near.game);
  const firstRecord = near.snapshot().fieldRecord;
  layWestLine(near.game);
  const metres = near.game.dive.pod.at;
  near.game.action('reel'); tick(near.game,.5);
  assert.equal(near.game.dive.pod.at,metres,'pulling from the cradle cannot move the pod');
  const abandoned = expedition(near.snapshot());
  abandoned.game.action('resume');
  steer(abandoned.game,-16,12); steer(abandoned.game,-8,12);
  steer(abandoned.game,0,4); surface(abandoned.game);
  assert.equal(abandoned.snapshot().westRecovered,false,'surfacing without hauling leaves the pod under the shelf');
  assert.equal(abandoned.snapshot().fieldRecord,firstRecord);
  const firstMark = near.game.target();
  steer(near.game,firstMark.x,firstMark.y);
  near.game.action('reel'); tick(near.game,.6); near.game.action('pause');
  const saved=near.snapshot();
  assert.ok(saved.dive.pod.at < metres && saved.dive.pod.at > saved.dive.pod.to);
  const next=expedition(saved), g=next.game;
  assert.deepEqual(plain(g.dive.pod),saved.dive.pod);
  assert.deepEqual(plain(g.dive.line.points),saved.dive.line.points);
  assert.equal(g.dive.x,saved.dive.x);
  g.action('resume'); tick(g,2);
  for (let i=0; i<10 && g.dive.pod.at>0; i++) {
    const mark=g.target();
    steer(g,mark.x,mark.y);
    g.action('reel'); tick(g,2);
  }
  assert.equal(g.dive.pod.at,0);
  assert.equal(g.westRecovered,false,'the winch alone does not bank the find');
  surface(g);
  assert.equal(g.westRecovered,true);
  assert.equal(g.completed,false);
  assert.equal(g.charted,true);
  assert.match(next.snapshot().fieldRecord,/гидрофона/);
  g.action('start');
  assert.equal(g.dive.route,'east');
  assert.equal(g.dive.x,0);
  assert.equal(g.dive.tool,'sounder','west rig did not change the east loadout');
  assert.equal(g.dive.pod,undefined);
  steer(g,22,13); steer(g,48,14); g.action('work');
  steer(g,24,13); steer(g,16,5); surface(g);
  assert.equal(g.completed && g.charted && g.westRecovered,true);
  assert.match(next.snapshot().fieldRecord,/нерпы.*гидрофона/);
  const record=next.snapshot().fieldRecord;
  g.action('start-west'); tick(g,200);
  assert.equal(next.snapshot().fieldRecord,record);
  assert.equal(g.reelUnlocked && g.completed && g.westRecovered,true);
});

test('a 32 m runout cannot attach a distant pod; failure preserves a prior east delivery', () => {
  const run=expedition({version:1,completed:true,fieldRecord:'С востока доставлена кассета.'});
  const g=run.game;
  g.action('start-west');
  steer(g,-6,6); g.action('reel');
  assert.equal(g.dive.line.mode,'packed','the haul must be anchored at the entry drum');
  steer(g,0,3.2); g.action('reel');
  steer(g,-8,12); steer(g,-3,6); steer(g,-8,12);
  steer(g,-16,12); steer(g,-22,9);
  assert.equal(g.dive.line.used,32);
  assert.equal(g.dive.line.mode,'full');
  g.action('work');
  assert.equal(g.dive.pod,undefined);
  tick(g,200);
  assert.equal(run.snapshot().westRecovered,false);
  assert.equal(run.snapshot().fieldRecord,'С востока доставлена кассета.');
  g.action('start');
  assert.equal(g.dive.route,'east');
  assert.equal(g.target().x,18);
  assert.equal(g.completed,true);
});

// Device smoke for release acceptance or an explicitly supplied Playwright.
// The deterministic frame clock advances the browser's native input handlers.
test('mounted controls support portrait touch, pause, reload and a full recorder sortie', {
  skip: !process.env.ICE_PLAYWRIGHT && !process.env.BLUEHOLE_RELEASE_CHECK
}, async () => {
  const browser = await launchBrowser(process.env.ICE_PLAYWRIGHT);
  try {
    const page = await browser.newPage({viewport:{width:360,height:640},hasTouch:true});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setContent('<style>body{margin:0}</style><section id="ice-expedition"></section>');
    await page.addStyleTag({content:read('ice-dive.css')});
    await page.addScriptTag({content:source});
    await page.evaluate(() => {
      let id = 0, time = 0;
      const callbacks = new Map();
      window.requestAnimationFrame = fn => {callbacks.set(++id, fn); return id;};
      window.cancelAnimationFrame = key => callbacks.delete(key);
      window.advance = frames => {
        for (let i=0; i<frames; i++) {
          const batch = [...callbacks.values()];
          callbacks.clear(); time += 1000/30;
          batch.forEach(fn => fn(time));
        }
      };
      window.mount = () => {
        window.iceGame = new IceDive({host:document.querySelector('section'),progress:window.saved,
          onSave:state => {window.saved=structuredClone(state);}, onExit:() => {window.exits=(window.exits||0)+1;}});
        iceGame.start();
      };
      mount(); advance(1);
    });
    const button = key => page.locator('[data-ice="' + key + '"]');
    const drive = n => page.evaluate(frames => advance(frames), n);
    const snapshot = () => page.evaluate(() => saved);
    assert.equal(await page.locator('.ice-touch-guide').isVisible(), true);
    assert.equal(await page.locator('.ice-key-guide').isVisible(), false);
    await button('start').tap();
    const controls = await page.locator('.ice-controls button').evaluateAll(buttons => buttons.map(button => {
      const {left,right,top,bottom,width,height} = button.getBoundingClientRect();
      return {text:button.innerText, inside:left >= 0 && right <= innerWidth && top >= 0 && bottom <= innerHeight, width, height};
    }));
    assert.equal(controls.length, 7);
    for (const ctrl of controls) {
      assert.ok(ctrl.inside && ctrl.width >= 44 && ctrl.height >= 44, JSON.stringify(ctrl));
      assert.doesNotMatch(ctrl.text, /⇧|· E|Shift|Esc/);
    }
    const cdp = await page.context().newCDPSession(page);
    const box = await page.locator('[data-move="right"]').boundingBox();
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:box.x+20,y:box.y+20}]});
    await drive(65);
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    assert.ok((await snapshot()).dive.x > 2);
    await button('fin').click();
    assert.equal((await snapshot()).dive.fast, true);
    await page.keyboard.press('Escape');
    assert.equal((await snapshot()).dive.phase, 'paused');
    const paused = await snapshot();
    await drive(50);
    assert.deepEqual(await snapshot(), paused);
    await button('exit').click();
    assert.equal(await page.locator('.ice-dive').count(), 0);
    await page.evaluate(() => {mount(); advance(1);});
    await button('resume').click();
    assert.equal((await snapshot()).dive.x, paused.dive.x);
    await page.keyboard.press('Space');
    assert.equal((await snapshot()).dive.pings, 2);
    await page.keyboard.down('ArrowDown'); await drive(45); await page.keyboard.up('ArrowDown');
    await page.keyboard.press('Escape');
    assert.ok((await snapshot()).dive.y > paused.dive.y + 2);
    await button('resume').click();
    await page.keyboard.press('Shift');
    // Steer via the actual device controls, using position only as telemetry.
    async function swimTo(x, y) {
      for (let i = 0; i < 120; i++) {
        const pose = await page.evaluate(() => ({x:iceGame.dive.x,y:iceGame.dive.y,phase:iceGame.dive.phase}));
        assert.equal(pose.phase, 'diving');
        const dx = x - pose.x, dy = y - pose.y;
        if (Math.hypot(dx,dy) < .85) return;
        const keys = [];
        if (Math.abs(dx) > .5) keys.push(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
        if (Math.abs(dy) > .5) keys.push(dy > 0 ? 'ArrowDown' : 'ArrowUp');
        for (const key of keys) await page.keyboard.down(key);
        await drive(10);
        for (const key of keys) await page.keyboard.up(key);
      }
      assert.fail('Could not swim to ' + [x,y]);
    }
    await swimTo(18,6);
    await button('work').tap();
    const hud = page.locator('[data-val="hint"]');
    await drive(1);
    assert.match(await hud.innerText(),/сохранить пеленг и получить катушку[\s\S]*Самописец.*кассет/u);
    await swimTo(0,4);
    await button('ping').tap(); await drive(1);
    assert.match(await hud.innerText(),/^Майна над тобой.*Всплыви/u);
    await page.keyboard.down('ArrowUp'); await drive(90); await page.keyboard.up('ArrowUp');
    assert.equal((await snapshot()).charted,true);
    assert.equal((await snapshot()).completed,false);
    await button('start').tap();
    await swimTo(18,6); await button('work').tap();
    await swimTo(26,13);
    assert.match(await hud.innerText(),/^Самописец.*кассет/u);
    await swimTo(48,14);
    await page.keyboard.press('e');
    assert.equal((await snapshot()).dive.cargo, true);
    assert.equal((await snapshot()).completed, false);
    await swimTo(25,13);
    await swimTo(16,5);
    await swimTo(0,4);
    // Force the shore CTA under the held finger, independent of font metrics.
    // Chromium hit-tests its compatibility click after the surface transition.
    const up = await page.locator('[data-move="up"]').boundingBox();
    const finger = {x:up.x + up.width/2, y:up.y + up.height/2, id:1};
    const overlap = await page.addStyleTag({content:
      '.ice-sheet [data-ice=start]{position:fixed;left:' + up.x + 'px;top:' + up.y + 'px}'});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});
    await drive(75);
    assert.equal((await snapshot()).dive.phase,'surfaced');
    assert.equal(await page.evaluate(({x,y}) => document.elementFromPoint(x,y).dataset.ice,finger),'start');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal((await snapshot()).dive.phase,'surfaced','releasing ascent must not relaunch');
    await overlap.evaluate(style => style.remove());
    assert.equal((await snapshot()).completed,true);
    assert.equal(await button('listen').isVisible(),true);
    await button('listen').tap();
    assert.equal(await page.evaluate(() => Boolean(iceGame.audio)),true,'the first fresh tap activates a shore button');
    await button('start-west').tap();
    await button('reel').tap();
    await swimTo(-8,12); await swimTo(-16,12); await swimTo(-22,9);
    assert.match(await button('work').innerText(),/Зацепить/);
    await button('work').tap();
    for (let i=0; i<10; i++) {
      const mark=await page.evaluate(() => iceGame.dive.pod.at>0 && iceGame.target());
      if (!mark) break;
      await swimTo(mark.x,mark.y);
      await button('reel').tap(); await drive(60);
    }
    await page.keyboard.down('ArrowUp'); await drive(75); await page.keyboard.up('ArrowUp');
    assert.equal((await snapshot()).westRecovered,true);
    assert.equal((await snapshot()).completed,true);
    assert.equal(await button('listen-west').isVisible(),true);
    await button('listen-west').tap();
    assert.equal(await page.locator('[data-ice-tool=sounder]').isChecked(),true);
    await page.locator('[data-ice-tool=reel]').tap();
    await button('start').tap();
    await button('reel').tap();
    assert.equal((await snapshot()).dive.line.mode,'laying');
    await page.keyboard.down('ArrowRight'); await drive(60); await page.keyboard.up('ArrowRight');
    await button('reel').tap();
    assert.equal((await snapshot()).dive.line.mode,'return');
    assert.equal(await button('ping').count(),0);
    await page.keyboard.press('Escape');
    await button('exit').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => exits), 2);
    assert.deepEqual(errors, []);
    const desktop = await browser.newPage({viewport:{width:1024,height:700}});
    await desktop.setContent('<section id="ice-expedition"></section>');
    await desktop.addStyleTag({content:read('ice-dive.css')});
    await desktop.addScriptTag({content:source});
    await desktop.evaluate(() => new IceDive({host:document.querySelector('section')}).start());
    assert.equal(await desktop.locator('.ice-key-guide').isVisible(), true);
    assert.equal(await desktop.locator('.ice-touch-guide').isVisible(), false);
    await desktop.locator('[data-ice=start]').click();
    assert.match(await desktop.locator('[data-ice=work]').innerText(), /· E/);
  } finally { await browser.close(); }
});
