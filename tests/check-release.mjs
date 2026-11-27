// Run from any directory: node tests/check-release.mjs
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const tests = readdirSync(new URL('tests/', root)).filter(file => file.endsWith('.test.mjs')).sort();
const hash = () => createHash('sha256').update(readFileSync(new URL('index.html', root))).digest('hex');

function check(label, args) {
  console.log('\n' + label);
  const result = spawnSync(process.execPath, args, {cwd: fileURLToPath(root), stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

check('Сверка исходников и HTML', ['build.mjs', '--check']);
const release = hash();
console.log('SHA-256 ' + release);
process.env.BLUEHOLE_RELEASE_CHECK = '1';
check('Симуляция, прогрессия и сохранения', ['--test', ...tests.map(file => 'tests/' + file)]);
check('Две экспедиции через меню, клавиатура и сенсор', ['tests/qa-campaign.mjs']);
check('Верхняя галерея, свет и финальные свидетельства', ['tests/qa-upper-scene.mjs']);
check('Первый выход без учебного снимка', ['tests/qa-upper-scene.mjs', '--first-scout']);
check('Итоговая сверка сборки', ['build.mjs', '--check']);
if (hash() !== release) throw new Error('HTML изменился во время проверки. Повтори проверку готовой сборки.');
console.log('Все проверки прошли для ' + release);
