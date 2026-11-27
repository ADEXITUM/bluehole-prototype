import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/survey/expeditions.js', import.meta.url), 'utf8');
const iceKey = 'bluehole-photo-survey:ice:progress';

function fixture(storage, write = (key, value) => storage.set(key, value)) {
  let save;
  let conflictScreen = false;
  const context = vm.createContext({
    Me: key => JSON.parse(storage.get(key) ?? 'null'),
    de: (key, value) => storage.set(key, JSON.stringify(value)),
    localStorage: {setItem: write},
    queueMicrotask,
    surveyElement: () => ({setAttribute() {}, prepend() {}, append() {}}),
    IceDive: class {
      constructor({onSave}) { save = onSave; }
      start() {}
    },
  });
  const Library = vm.runInContext(source + '\nSurveyExpeditions', context);
  const library = new Library({root: {append() {}}, game: {}, setScreen() {}, surface: {stop() {}}});
  library.show = () => { conflictScreen = true; };
  library.openIce();
  return {save, library, conflictShown: () => conflictScreen};
}

test('opening the other expedition preserves a submerged Blue Hole checkpoint', () => {
  const key = 'bluehole-photo-survey:hub:session';
  const storage = new Map([[key, '{"active":true,"diveId":"hub-7"}']]);
  const player = fixture(storage);
  assert.equal(player.save({completed: true, dive: {phase: 'surfaced'}}), true);
  assert.equal(player.save({completed: false, dive: {phase: 'diving'}}), true);
  assert.equal(JSON.parse(storage.get(iceKey)).completed, true);
  assert.equal(storage.get(key), '{"active":true,"diveId":"hub-7"}');
});

test('the library points to the other shelf after either recording and acknowledges the pair', () => {
  const {library} = fixture(new Map());
  assert.match(library.iceStatus({completed:true}), /на западе доступен гидрофон/);
  assert.match(library.iceStatus({westRecovered:true}), /на востоке остался самописец/);
  assert.match(library.iceStatus({completed:true, westRecovered:true}), /Обе записи/);
  assert.match(library.iceStatus({completed:true, dive:{phase:'lost'}}), /повторному выходу/);
});

test('a stale ice dive cannot replace the progress delivered in another tab', async () => {
  const storage = new Map();
  const older = fixture(storage);
  const newer = fixture(storage);
  newer.save({completed: true, fieldRecord: 'Кассета доставлена'});
  const delivered = storage.get(iceKey);
  assert.equal(older.save({completed: false, dive: {phase: 'lost'}}), false);
  await Promise.resolve();
  assert.equal(older.conflictShown(), true);
  assert.equal(storage.get(iceKey), delivered);
});

test('a temporary quota failure keeps the dive in memory until the next save succeeds', () => {
  const storage = new Map();
  let refuse = true;
  const player = fixture(storage, (key, value) => {
    if (refuse) throw new Error('quota');
    storage.set(key, value);
  });
  const result = {completed: true, dive: {phase: 'surfaced'}};
  assert.equal(player.save(result), false);
  assert.equal(player.library.transientIce.completed, true);
  assert.equal(player.library.saveNotice.hidden, false);
  refuse = false;
  assert.equal(player.save(result), true);
  assert.equal(JSON.parse(storage.get(iceKey)).completed, true);
  assert.equal(player.library.transientIce, null);
  assert.equal(player.library.saveNotice.hidden, true);
});
