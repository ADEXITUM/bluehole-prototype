import { readFile, writeFile } from "node:fs/promises";

// Legacy engine declarations share one module scope. Keep their initialization order.
const engine = [
  "settings", "expedition-data", "instructor", "sites", "hud-hints", "dive-math", "world",
  "dive-systems", "simulation", "controls-audio", "instruments", "cave-render", "scene-art",
  "finds-render", "scene", "persistence", "album-equipment", "boat", "map", "telemetry",
  "debrief", "tutorial", "intro-controls", "game",
];
const survey = ["routes", "guidance", "chapters", "first-dive", "dive-guide", "preflight", "surface-style", "boat-model", "dive-boat", "dome", "artifacts", "photography", "photo-album", "photo-viewer", "equipment-art", "equipment", "dive-checkpoint", "session", "help", "plan", "results", "surface-scene", "transition", "ending", "expeditions", "pause", "boat-shell", "game", "start"];
const scripts = [...engine.map(name => "engine/" + name + ".js"), "survey/ice-dive.js", ...survey.map(name => "survey/" + name + ".js")];
const styles = ["engine/screens.css", "survey/plan.css", "survey/results.css", "survey/dive.css", "survey/boat-shell.css", "survey/equipment.css", "survey/transition.css", "survey/preflight.css", "survey/journey.css"];
styles.push("survey/ice-dive.css");
const read = path => readFile(new URL(path, import.meta.url), "utf8");
async function combine(paths) {
  return (await Promise.all(paths.map(path => read("src/" + path)))).map(source => source.trimEnd()).join("\n\n");
}
const [template, script, css] = await Promise.all([read("src/experiment.template.html"), combine(scripts), combine(styles)]);
const html = template.replace("/* GAME_SCRIPT */", () => script).replace("/* GAME_STYLE */", () => css);
for (const name of ["index.html","experiment.html"]) {
  const output = new URL(name, import.meta.url);
  if (process.argv.includes("--check")) {
    if (await readFile(output, "utf8") !== html) throw new Error(name+" is out of date. Run node build.mjs.");
  } else {
    await writeFile(output, html);
  }
}
