import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createDive, world} from './helpers/dive-simulator.mjs';

function runtime(storage = new Map()) {
  const context = vm.createContext({
    btoa, atob, URLSearchParams, Path2D: class {}, window: {location: {search: ''}},
    document: {createElement: () => ({relList: {supports: () => true}})},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  for (const file of ['engine/settings', 'engine/expedition-data', 'engine/instructor', 'engine/sites',
    'engine/hud-hints', 'engine/dive-math', 'engine/world', 'engine/dive-systems', 'engine/scene-art', 'engine/persistence',
    'engine/map', 'engine/debrief', 'engine/game', 'survey/routes', 'survey/photography', 'survey/results']) {
    vm.runInContext(readFileSync(new URL('../src/' + file + '.js', import.meta.url), 'utf8'), context, {filename: file});
  }
  return vm.runInContext('({Tf, wl, eo, Wl, ju, Zf, scoutedRopeSections, routeMark, SurveyResultScreen})', context);
}

const plain = value => JSON.parse(JSON.stringify(value));
const point = (x, y) => ({x, y});

test('rope memory from a simulated scouting return reaches the next planning map after reload', () => {
  const storage = new Map(), game = runtime(storage);
  // Old survey saves have terrain but no rope memory. Recording the same
  // terrain again isolates the rope gain from the illuminated map-cell gain.
  const terrain = game.wl(1, 1, new Uint8Array([200]));
  game.Wl({map: terrain, dives: 1, notes: []});
  const dive = createDive({back: 'single', slots: []});
  dive.go(point(48, 18.5));
  dive.go(point(58, 19));
  dive.go(point(48, 18.5));
  dive.surface();
  assert.equal(dive.result().outcome, 'clean');
  const visited = [...dive.state.routeMarks];
  assert.ok(visited.length > 3);
  const receipt = game.Tf(terrain, [], true, visited);
  assert.equal(receipt.added, 0);
  assert.equal(receipt.routeMarksAdded, visited.length);

  const cold = runtime(storage);
  const legend = {};
  const boatMap = Object.assign(Object.create(cold.Zf.prototype), {
    world, g: {gw: 1, gh: 1, cell: 1, top: 0}, water: [1], sk: {leads: []},
    fs: {querySelector: () => legend, classList: {contains: () => true}},
    buildSketch() {}, buildMasks() {}, renderPreview() {},
  });
  cold.ju.prototype.refreshMap.call({world, scene: {explored: boatMap.g}, boatMap});
  assert.equal(legend.hidden, false);
  assert.ok(boatMap.scoutedSections.length);
  assert.ok(boatMap.scoutedSections.flat().every(p => p.x < 60), 'unvisited far end must stay outside the overlay');
  assert.deepEqual(plain(cold.eo().routeMarks), visited);
  assert.equal(cold.Tf(terrain, [], true, visited).routeMarksAdded, 0);

  const more = [...visited, 20, 21, 21];
  assert.ok(!visited.includes(20) && !visited.includes(21));
  assert.equal(cold.Tf(terrain, [], false, more).routeMarksAdded, 0);
  assert.equal(cold.Tf('invalid map', [], true, more).routeMarksAdded, 0);
  assert.deepEqual(plain(runtime(storage).eo().routeMarks), visited);
  assert.equal(cold.Tf(terrain, [], true, more).routeMarksAdded, 2);
});

test('map boundaries match rounded rope metres, retaining bends, gaps and separate ropes', () => {
  const {scoutedRopeSections: sections, routeMark: mark} = runtime();
  const ropes = [
    {pts: [point(0, 0), point(3, 0), point(3, 5.75)]},
    {pts: [point(20, 20), point(20, 30)]},
  ];
  assert.deepEqual(plain(sections(ropes, undefined)), []);
  const marks = [mark(0, 4), mark(0, 2), mark(0, 3), mark(0, 9), mark(1, 0), mark(0, 90), mark(5, 3)];
  assert.deepEqual(plain(sections(ropes, marks)), [
    [point(1.5, 0), point(3, 0), point(3, 1.5)],
    [point(3, 5.5), point(3, 5.75)],
    [point(20, 20), point(20, 20.5)],
  ]);
});

test('the result reports a scouting gain once, keeps it below a discovery, and clears it on repeat or death', () => {
  const {SurveyResultScreen} = runtime();
  const screen = Object.create(SurveyResultScreen.prototype);
  const node = () => ({replaceChildren() {}, append(child) {this.text = child.textContent;}});
  for (const key of ['heading','summary','next','evidence','film','discovery','contact','returnReview']) screen[key] = node();
  const classList = {add() {}, toggle() {}, remove() {}};
  screen.root = {classList, querySelector: () => ({classList})};
  Object.assign(screen, {msg() {}, showJournal() {}, renderGear() {}, renderRecord() {}});
  const state = {outcome: {kind: 'clean', depth: 0}, tanks: []};
  const dive = {shots: [], season: {newFinds: []}, survey: {kept: true, added: 0, routeMarksAdded: 8}};
  const show = () => screen.show(state, {}, [], dive);
  show();
  assert.match(screen.heading.textContent, /Разведан участок/);
  assert.match(screen.contact.text, /8 м знакомой линии/);
  assert.doesNotMatch(screen.contact.text, /пуста|пустой/);
  screen.showDiscovery({changed: true, question: 'Кто оставил метку?'});
  assert.equal(screen.contact.hidden, false);
  dive.survey.routeMarksAdded = 0;
  show();
  assert.doesNotMatch(screen.heading.textContent, /Разведан участок/);
  assert.doesNotMatch(screen.contact.text, /знакомой линии/);
  screen.showDiscovery({changed: true, question: 'Кто оставил метку?'});
  assert.equal(screen.contact.hidden, true);
  state.outcome.kind = 'dead';
  dive.survey.routeMarksAdded = 8;
  show();
  assert.equal(screen.heading.textContent, 'Дайвер погиб');
  assert.doesNotMatch(screen.contact.text, /знакомой линии/);
});
