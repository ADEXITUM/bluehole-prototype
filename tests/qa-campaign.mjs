// node tests/qa-campaign.mjs                # integrated index.html, both devices
// node tests/qa-campaign.mjs --e1           # Blue Hole opening only
// node tests/qa-campaign.mjs --e1 --html <path-to-baseline/index.html> --device mobile
// Node 20+, Playwright + Chromium. Resolves local packages or Playwright cache
// registrations. QA_PLAYWRIGHT and QA_CHROMIUM accept external absolute paths.
// Runs offline on an ephemeral loopback port with fresh desktop/touch profiles.
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { launchBrowser, runDevice, serveBuild } from './qa-campaign-browser.mjs';

const { values } = parseArgs({ options: {
  html: { type: 'string', default: fileURLToPath(new URL('../index.html', import.meta.url)) },
  device: { type: 'string', default: 'both' },
  e1: { type: 'boolean' },
} });
assert.ok(['both', 'desktop', 'mobile'].includes(values.device), '--device expects both, desktop or mobile');
const prefix = 'bluehole-photo-survey:';
const readSave = (page, suffix) => page.evaluate(key => JSON.parse(localStorage.getItem(key)), prefix + suffix);
const elapsed = start => ((performance.now() - start) / 1000).toFixed(1) + ' s';

async function blueHole({ page, act, swim, camera, device }) {
  const button = name => page.locator('[data-boat="' + name + '"]:visible');
  const click = name => act(button(name));
  const menu = button('continue');
  await menu.waitFor();
  assert.match(await menu.innerText(), /Начать/);
  if(!values.e1) assert.match(await button('expeditions').innerText(), /Выбрать экспедицию[\s\S]*Подо льдом/);
  await click('expeditions');
  const library = page.locator('.exp-library');
  if (values.e1) {
    await act(library.getByRole('button', { name: /Начать.*Блю-хол/ }));
  } else {
    await library.locator('[data-place="ice"] [data-enter="ice"]').waitFor();
    await act(library.locator('[data-place="hub"] [data-enter="hub"]'));
  }
  await click('story-next');
  await click('story-next');
  const task = page.locator('.boat-task:visible');
  assert.match(await task.innerText(), /жёлтую метку/i);
  const launch = async () => {
    await click('dive');
    await page.locator('.dive-pause-button').waitFor();
  };
  const receipt = page.locator('.survey-receipt:visible');
  const surface = () => swim(-1, () => receipt.waitFor({ timeout: 20000 }));
  const boat = () => act(page.locator('.survey-result [data-a="plan"]:visible'));
  await launch();
  await surface();
  assert.match(await receipt.innerText(), /без снимка/);
  await boat();
  assert.match(await task.innerText(), /жёлтую метку/i);
  console.log(device, 'E1 empty return, first target still available');
  await launch();
  await swim(1, () => delay(1050));
  const pause = page.locator('.dive-pause-button');
  await act(pause);
  const session = () => readSave(page, 'hub:session');
  const before = await session();
  assert.ok(before.active && before.snapshot.state.depth > 1, 'Dive input must move the diver before saving');
  await page.reload();
  assert.match(await menu.innerText(), /Продолжить погружение/);
  await act(menu);
  const resume = page.getByRole('button', { name: 'Продолжить погружение', exact: true });
  await resume.waitFor();
  const restored = await session();
  assert.equal(restored.diveId, before.diveId);
  for (const field of ['depth', 't', 'tanks']) {
    assert.deepEqual(restored.snapshot.state[field], before.snapshot.state[field], 'Restored ' + field);
  }
  console.log(device, 'E1 restored depth', before.snapshot.state.depth.toFixed(1), 'm');
  await act(resume);
  const notice=page.locator('.photo-notice:visible');
  if(!values.e1){
    await camera(() => delay(350));
    await notice.filter({hasText:'Затвор не сработал'}).waitFor();
    assert.match(await notice.innerText(),device==='mobile'?/«Камеру»/:/Держи X/);
  }
  await camera(() => notice.filter({hasText:/Новая находка · Жёлтая метка/i}).waitFor({ timeout: 7000 }));
  if(!values.e1) assert.match(await notice.innerText(), device==='mobile'?/половины круга/:/Shift и ↑/);
  await swim(-1, () => receipt.waitFor({ timeout: 20000 }), {gentle:true});
  await page.locator('.result-film-frame[aria-label*="Жёлтая метка"]').waitFor();
  assert.match(await page.locator('.result-discovery:visible').innerText(), /Метка старше разведки Корнеева/);
  await boat();
  assert.match(await task.innerText(), /Метка старше разведки Корнеева/);
  const season = await readSave(page, 'hub:season');
  assert.ok(season.found.includes('entry-tag'));
  assert.equal(season.dives, 2);
  await page.reload();
  assert.match(await menu.innerText(), /Продолжить экспедицию/);
  await act(menu);
  assert.match(await task.innerText(), /Метка старше разведки Корнеева/);
  await click('chapters');
  if(!values.e1) assert.match(await page.locator('.journal-plans-title').innerText(),/1 из 3/i);
  assert.match(await page.locator('.journal-evidence:visible').innerText(), /Метка под буем/);
  await act(page.getByRole('button', { name: 'Закрыть журнал' }));
  await click('menu');
  console.log(device, 'E1 tag delivered and journal retained across reload');
  return season;
}

const runStart = performance.now();
const { server, url } = await serveBuild(values.html);
try {
  const browser = await launchBrowser();
  console.log('Headless Chromium', browser.version());
  try {
    const failures = [];
    for (const device of values.device === 'both' ? ['desktop', 'mobile'] : [values.device]) {
      const deviceStart = performance.now();
      try {
        await runDevice(browser, url, device, async player => {
          const season = await blueHole(player);
          if (!values.e1) {
            const { iceCampaign } = await import('./qa-campaign-ice.mjs');
            await iceCampaign(player, season);
          }
        });
        console.log('PASS', device, values.e1 ? 'E1' : 'integrated campaign', elapsed(deviceStart));
      } catch (error) {
        console.error('FAIL', device, elapsed(deviceStart), error.message);
        failures.push(error);
      }
    }
    if (failures.length) throw new AggregateError(failures, 'Campaign acceptance failed');
  } finally { await browser.close(); }
} finally {
  await new Promise(resolve => server.close(resolve));
  console.log('Total elapsed', elapsed(runStart));
}
