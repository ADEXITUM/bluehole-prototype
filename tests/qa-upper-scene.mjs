// node tests/qa-upper-scene.mjs [--html path] [--evidence directory] [--scout-shutter] [--first-scout]
// --scout-shutter adds a separate inspection of ranged shooting on the
// return visit, after the observation-only journal entry has been verified.
// One disposable desktop profile. The fixture changes only diver position,
// heading and camera follow for long transits. RAF, lights, simulation, input,
// exposures, deliveries, journal, ending and navigation run in the release.
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { launchBrowser, runDevice, serveBuild } from './qa-campaign-browser.mjs';

const { values } = parseArgs({ options: {
  html: { type: 'string', default: fileURLToPath(new URL('../index.html', import.meta.url)) },
  evidence: { type: 'string' },
  'scout-shutter': { type: 'boolean' },
  'first-scout': { type: 'boolean' },
} });

function installPoseFixture() {
  window.upperQA = {
    pose({ x, y, target, away }) {
      const find = qu.world.site.finds.find(f => f.id === target);
      $0(qu.state, qu.world, x, y);
      const d = qu.state.diver;
      if (find) {
        const [px, py] = find.pts[1];
        d.aim = Math.atan2(py - d.y, px - d.x) + (away ? Math.PI : 0);
      }
      qu.snapCamera();
    },
    sample(id) {
      const f = qu.world.site.finds.find(item => item.id === id);
      const light = qu.scene.lf;
      const d = qu.state.diver;
      const points = f.pts.map(([x, y]) => ({
        framed: Gd(qu.lastView, x, y, 100 * qu.layout.dpr),
        range: Math.hypot(d.x - x, d.y - y),
        light: Math.max(light.beam(x, y), light.ambient(x, y)) * light.view(x, y),
      }));
      return { x: d.x, y: d.y, t: qu.state.t, points, observed: [...qu.diveObserved],
        shots: qu.diveShots.map(s => ({ n: s.n, finds: s.finds, kind: s.feedback.kind })),
        dwell: qu.observationDwell.get(id), mode: qu.mode, tips: qu.tips.phase };
    },
    get reading() { return qu.state.reading; },
    get active() { return qu.mode === 'dive' && !qu.paused && qu.input.enabled; },
  };
}

async function checkScene({page, act, camera, swim}) {
  const button = name => page.locator('[data-boat="' + name + '"]:visible');
  const byText = name => page.getByRole('button', {name, exact:true});
  const snap = async name => {
    if (values.evidence) await page.screenshot({path:path.join(values.evidence, name + '.png')});
  };
  const save = key => page.evaluate(k => JSON.parse(localStorage.getItem('bluehole-photo-survey:' + k)), key);
  const sample = id => page.evaluate(id => upperQA.sample(id), id);
  const pose = (x, y, target, away = false) =>
    page.evaluate(args => upperQA.pose(args), {x, y, target, away});
  const dwell = async (id, seconds) => {
    const {t} = await sample(id);
    await page.waitForFunction(({id,t}) => upperQA.sample(id).t >= t, {id,t:t+seconds});
    const state = await sample(id);
    console.log(id, JSON.stringify(state));
    return state;
  };
  const shoot = async id => {
    const before = await sample(id);
    await camera(() => page.waitForFunction(({id,count}) => upperQA.sample(id).shots.length > count,
      {id, count:before.shots.length}));
    const shot = (await sample(id)).shots.at(-1);
    console.log('Shutter', shot);
    return shot;
  };
  const receipt = page.locator('.survey-receipt:visible');
  const returnToSurface = async () => {
    await pose(48, 1.3);
    await swim(-1, () => receipt.waitFor({timeout:20000}));
    console.log('Delivery', await receipt.innerText());
  };
  const resultButton = page.locator('.survey-result [data-a="plan"]:visible');
  const launch = async () => {
    await act(button('dive'));
    const preflight = page.locator('.expedition-preflight:visible');
    while (await preflight.isVisible()) {
      const action = preflight.getByRole('button', {name:/Короткий выход|Понятно · продолжить/}).first();
      await act(action);
    }
    await page.waitForFunction(() => upperQA.active);
  };

  const url = page.url();
  await page.route(url, async route => {
    const response = await route.fetch();
    const html = await response.text();
    const at = html.lastIndexOf('</script>');
    assert.ok(at > html.indexOf('const qu =') && html.includes('class PhotoSurveyGame'));
    await route.fulfill({ response, body:html.slice(0,at) + '(' + installPoseFixture.toString() + ')();' + html.slice(at) });
  });
  await page.reload();
  await act(button('expeditions'));
  await act(page.locator('[data-place="hub"] [data-enter="hub"]'));
  await act(button('story-next'));
  await act(button('story-next'));
  if (!values['first-scout']) {
    await launch();
    await swim(1, () => page.waitForFunction(() => upperQA.sample('entry-tag').y >= 2.5));
    assert.ok((await shoot('entry-tag')).finds.includes('entry-tag'));
    await swim(-1, () => receipt.waitFor({timeout:20000}));
    const onScreen = await resultButton.evaluate(button => {
      const {top, bottom, left, right} = button.getBoundingClientRect();
      return top >= 0 && bottom <= innerHeight && document.elementFromPoint((left + right) / 2, (top + bottom) / 2) === button;
    });
    assert.ok(onScreen, 'The boat button must be visible and reachable before scrolling the contact sheet');
    await act(resultButton);
    console.log('Opening tag delivered using keyboard from the surface');
  }

  await launch();
  await pose(87.5, 14.6, 'cache');
  const blocked = await dwell('cache', 1.4);
  assert.ok(!blocked.observed.includes('cache'));
  assert.ok(blocked.points.every(p => p.light <= .18));
  await snap('01-behind-rock');
  await pose(92, 15.7, 'cache', true);
  const dark = await dwell('cache', 1.4);
  assert.ok(dark.points.every(p => p.light <= .18));
  assert.ok(!dark.observed.includes('cache'));
  await pose(92, 15.7, 'cache');
  const scout = await dwell('cache', 1.6);
  assert.ok(scout.points.some(p => p.framed && p.light > .18));
  assert.ok(scout.observed.includes('cache'));
  await page.keyboard.press('t');
  assert.equal(await page.evaluate(() => upperQA.reading), null);
  await snap('02-scouting');
  await returnToSurface();
  await snap('03-scouting-return');
  await act(resultButton);
  const task = page.locator('.boat-task:visible');
  console.log('Scouting follow-up', await task.innerText());
  await snap('03b-scouting-boat');
  assert.match(await task.innerText(), /Что белело у стены/);
  assert.ok(!(await save('hub:season')).found.includes('cache'));
  await act(button('chapters'));
  assert.match(await page.locator('.journal-evidence:visible').innerText(), /Светлый прямоугольник/);
  await act(byText('Закрыть журнал'));

  await launch();
  await pose(87.5, 14.6, 'cache');
  assert.ok(!(await shoot('cache')).finds.includes('cache'));
  if (values['scout-shutter']) {
    await pose(92, 15.7, 'cache');
    await dwell('cache', 1);
    console.log('Shutter from the scouting position:', await shoot('cache'));
    await snap('04a-scout-shutter');
  }
  await pose(91.5, 18.8, 'cache');
  await dwell('cache', 1);
  await snap('04-close-up');
  assert.ok((await shoot('cache')).finds.includes('cache'));
  if (values['scout-shutter']) {
    await pose(90.8, 19.9, 'cache');
    await page.keyboard.press('t');
    await page.waitForFunction(() => upperQA.reading === 'n3');
    await snap('04b-record-under-clip');
    await page.keyboard.press('t');
    await page.waitForFunction(() => !upperQA.reading);
  }
  await returnToSurface();
  await page.locator('.result-film-frame[aria-label*="пластина" i]').first().waitFor();
  await act(resultButton);
  assert.ok((await save('hub:season')).found.includes('cache'));
  await act(button('chapters'));
  assert.match(await page.locator('.journal-evidence:visible').innerText(), /Схема у конца линии/);
  await act(byText('Закрыть журнал'));

  await launch();
  await pose(83.4, 43.48, 'body');
  await dwell('body', 1);
  assert.ok((await shoot('body')).finds.includes('body'));
  await pose(94.65, 46, 'slate81');
  await dwell('slate81', 1);
  assert.ok((await shoot('slate81')).finds.includes('slate81'));
  await returnToSurface();
  const found = (await save('hub:season')).found;
  for (const id of ['cache','body','slate81']) assert.ok(found.includes(id));
  await snap('05-final-delivery');
  await act(resultButton);
  const ending = page.locator('.exp-ending:visible');
  await ending.getByRole('heading', {name:'Обратно на свет'}).waitFor();
  assert.equal(await ending.locator('.ending-photos img').count(), 2);
  await ending.locator('.ending-photos img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  await snap('06-arrival');
  await act(byText('Подвести итог →'));
  await ending.getByRole('heading', {name:'Что остаётся неизвестным'}).waitFor();
  await snap('07-conclusion');
  await act(byText('К экспедициям'));
  await act(page.locator('[data-place="ice"] [data-enter="ice"]'));
  await page.locator('#ice-expedition').getByRole('heading', {name:'Голоса подо льдом',exact:true}).waitFor();
  assert.equal(await save('last-expedition'), 'ice');
  assert.deepEqual((await save('hub:season')).found, found);
  await snap('08-ice-arrival');
  console.log('PASS · upper observation, identified photo, deep evidence', found, '· both ending pages · Ice landing');
}

if (values.evidence) await mkdir(values.evidence, {recursive:true});
const {server,url} = await serveBuild(values.html);
try {
  const browser = await launchBrowser();
  try {
    console.log('Chromium', browser.version());
    await runDevice(browser,url,'desktop',checkScene);
  } finally { await browser.close(); }
} finally { await new Promise(resolve => server.close(resolve)); }
