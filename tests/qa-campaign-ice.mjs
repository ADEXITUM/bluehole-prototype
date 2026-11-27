// Ice half of the integrated run. Use node tests/qa-campaign.mjs.
import assert from 'node:assert/strict';

export async function iceCampaign({ page, act, holdControl, device, mobile }, hubBefore) {
  const host = page.locator('#ice-expedition');
  const library = page.locator('.exp-library:visible');
  const fieldRecord = id => library.locator('article[data-place="' + id + '"] .library-record');
  const enter = id => act(library.locator('article[data-place="' + id + '"] [data-enter="' + id + '"]'));
  const menu = name => page.locator('.exp-menu [data-boat="' + name + '"]:visible');
  const control = id => host.locator('[data-ice="' + id + '"]:visible');
  const reelChoice = host.locator('[data-ice-tool="reel"]');
  const click = id => act(control(id));
  const progress = key => page.evaluate(suffix => JSON.parse(localStorage.getItem('bluehole-photo-survey:' + suffix)), key);
  const iceSave = () => progress('ice:progress');
  const heading = name => host.getByRole('heading', { name, exact: true }).waitFor();
  const move = (direction, until) => holdControl(host.locator('[data-move="' + direction + '"]'),
    { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[direction], until);
  async function surfaceWith(title) {
    await move('up', () => heading(title));
    // Check after releasing the real ascend input: the shore sheet can put
    // its launch button under the fingertip while the direction is still held.
    const saved = await iceSave();
    assert.equal(saved.dive.phase, 'surfaced', 'Releasing ascent after «' + title + '» must leave the player on shore');
    assert.ok(await host.getByRole('heading', { name: title, exact: true }).isVisible(), 'Shore result must remain open after release');
    return saved;
  }
  // Steer against instrument readings, allowing for current, inertia and frame rate.
  const steer = (direction, meter, target) => move(direction, async () => {
    await page.waitForFunction(({ meter, target, increasing }) => {
      const label = document.querySelector('#ice-expedition [data-val="' + meter + '"]').textContent;
      const value = parseFloat(label) * (meter === 'east' && label.endsWith('З') ? -1 : 1);
      return increasing ? value >= target : value <= target;
    }, { meter, target, increasing: ['right', 'down'].includes(direction) }, { timeout: 35000 });
  });
  const interact = async (id, key) => {
    if (mobile) await click(id);
    else await page.keyboard.press(key);
  };
  const collect = async label => {
    await host.getByRole('button', { name: label }).waitFor();
    await interact('work', 'e');
  };

  assert.equal(await iceSave(), null, 'Playing E1 must leave Ice unstarted');
  await act(menu('expeditions'));
  const hubRecord = await fieldRecord('hub').innerText();
  assert.match(hubRecord, /96/);
  assert.equal(await fieldRecord('ice').count(), 0);
  await enter('ice');
  await heading('Голоса подо льдом');
  assert.equal(await reelChoice.isVisible(), false, 'A fresh expedition starts without the personal reel');
  const coversScreen = await host.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return Math.abs(rect.left) <= 1 && Math.abs(rect.top) <= 1 &&
      Math.abs(rect.width - innerWidth) <= 1 && Math.abs(rect.height - innerHeight) <= 1;
  });
  assert.ok(coversScreen, 'Ice should fill the viewport on entry');
  assert.equal(await progress('last-expedition'), 'ice');
  await click('start');
  await interact('ping', 'Space');
  await control('ping').filter({ hasText: /2/ }).waitFor();
  // A strong stroke against the ice ridge exhausts the tank in real game time.
  await interact('fin', 'ShiftLeft');
  await host.locator('[data-ice="fin"][aria-pressed="true"]').waitFor();
  await move('right', () => host.getByRole('heading', { name: 'Газ исчерпан' }).waitFor({ timeout: 75000 }));
  let saved = await iceSave();
  assert.equal(saved.dive.phase, 'lost');
  assert.equal(saved.completed, false);
  assert.equal(await reelChoice.isVisible(), false, 'Gas exhaustion earns no equipment');
  await click('start');
  saved = await iceSave();
  assert.equal(saved.dive.phase, 'diving');
  assert.equal(saved.dive.pings, 3);
  assert.equal(saved.dive.fast, false);
  assert.ok(saved.dive.gas > 125);
  console.log(device, 'Ice gas exhausted; retry replenished tank and echo charges');

  await steer('down', 'depth', 5.8);
  await steer('right', 'east', 18);
  await collect(/Считать/);
  assert.equal((await iceSave()).dive.reading, true);
  await interact('pause', 'Escape');
  const checkpoint = await iceSave();
  assert.equal(checkpoint.dive.phase, 'paused');
  await page.reload();
  await act(menu('continue'));
  await heading('Погружение на паузе');
  assert.deepEqual((await iceSave()).dive, checkpoint.dive);
  await click('resume');
  await steer('left', 'east', 1);
  saved = await surfaceWith('Пеленг на карте');
  assert.ok(saved.charted && !saved.completed, 'Returning with the bearing earns a chart, leaving the cassette outstanding');
  await reelChoice.waitFor();
  await click('exit');
  assert.match(await fieldRecord('ice').innerText(), /репера/);
  await enter('ice');
  await heading('Пеленг на карте');
  console.log(device, 'Ice checkpoint resumed; bearing brought back through the lead');

  await click('start');
  await steer('down', 'depth', 13.4);
  await steer('right', 'east', 47);
  await collect(/Забрать/);
  saved = await iceSave();
  assert.ok(saved.dive.cargo && !saved.completed, 'The recording must be carried home');
  await steer('left', 'east', 1);
  saved = await surfaceWith('Кассета поднята');
  assert.ok(saved.completed);
  await reelChoice.waitFor();
  assert.equal(await reelChoice.isChecked(), false, 'The new tool must be chosen on shore');
  await act(reelChoice);
  assert.equal((await iceSave()).selectedTool, 'reel');
  await click('exit');
  assert.match(await library.locator('article[data-place="ice"]').innerText(), /завершена/);
  const recording = await fieldRecord('ice').innerText();
  assert.match(recording, /нерпы/);
  await page.reload();
  await act(menu('continue'));
  await heading('Кассета поднята');
  await control('listen').waitFor();
  assert.equal((await iceSave()).selectedTool, 'reel', 'Shore selection persisted across reload');
  assert.ok(await reelChoice.isChecked(), 'Restored shore selection matches the save');
  await click('start');
  await steer('down', 'depth', 5.8);
  await interact('reel', 'Space');
  assert.equal((await iceSave()).dive.line.mode, 'laying');
  await steer('right', 'east', 9);
  await interact('reel', 'Space');
  const line = (await iceSave()).dive.line;
  assert.ok(line.mode === 'return' && line.used > 6, 'The reel must record the outward swim');
  await move('left', () => control('reel').filter({ hasText: 'Линь пройден' }).waitFor());
  saved = await surfaceWith('Снова у майны');
  assert.equal(saved.dive.line.mode, 'home');
  console.log(device, 'Ice earned reel selected, restored, anchored and retraced');
  await click('exit');
  assert.equal(await fieldRecord('ice').innerText(), recording);
  assert.equal(await fieldRecord('hub').innerText(), hubRecord);
  const delivered = await iceSave();
  assert.deepEqual(await progress('hub:season'), hubBefore);
  await enter('hub');
  assert.match(await page.locator('.boat-task:visible').innerText(), /Метка старше разведки Корнеева/);
  assert.equal(await progress('last-expedition'), 'hub');
  await page.reload();
  await act(menu('continue'));
  await page.locator('.boat-home:visible').waitFor();
  assert.deepEqual(await iceSave(), delivered, 'Playing E1 must preserve the separate completed Ice save');
  console.log(device, 'Ice recording delivered; both saved expeditions reopen independently');
}
