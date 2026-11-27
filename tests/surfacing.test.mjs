import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

// Exercise real movement, surface detection and gas/decompression simulation.
const context = vm.createContext({
  document: {createElement: () => ({relList: {supports: () => true}})},
  window: {location: {search: ""}}, URLSearchParams,
  localStorage: {getItem: () => null, setItem() {}},
});
for (const file of ["settings", "expedition-data", "instructor", "sites", "hud-hints", "dive-math", "world", "dive-systems", "simulation", "controls-audio", "persistence"]) {
  vm.runInContext(readFileSync(new URL(`../src/engine/${file}.js`, import.meta.url), "utf8"), context, {filename: file});
}
const api = vm.runInContext("({Zh, Ls, T0, xi, Ua, nt})", context);
const world = api.Zh("hub");
function dive() {return api.Ls(world, {...api.Ua, bottom: "air"}, 23, {current: 0, deck: []});}
function swim(state, y, frames) {
  for (let i = 0; i < frames && state.phase === "dive"; i++) api.T0(state, {...api.xi, y}, world);
}

test("a shallow dive below three metres can return to the boat", () => {
  const state = dive();
  swim(state, .3, 130);
  assert.ok(state.maxDepth > 1.2 && state.maxDepth < 3);
  swim(state, -.3, 240);
  assert.equal(state.phase, "end");
  assert.equal(state.outcome.kind, "clean");
  assert.ok(state.events.some(event => event.type === "surfaced"));
});

test("waiting at entry does not end the dive, but swimming up returns immediately", () => {
  const state = dive();
  swim(state, 0, 180);
  assert.equal(state.phase, "dive");
  swim(state, -1, 40);
  assert.equal(state.phase, "end");
  assert.equal(state.outcome.kind, "clean");
});

test("a deeper dive still returns through the normal surfacing outcome", () => {
  const state = dive();
  swim(state, .3, 340);
  assert.ok(state.maxDepth > 3);
  swim(state, -.08, 1800);
  assert.equal(state.phase, "end");
  assert.equal(state.outcome.kind, "clean");
});
