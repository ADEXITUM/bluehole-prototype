// The first outing is optional preparation, not a fourth chapter or a gate.
const firstDiveTarget = {
  id:"entry-tag", short:"Жёлтая метка", leg:"Под буем · 6 м",
  clue:"Под оранжевым буем вниз идёт верёвка. На 6 м к ней прикреплена жёлтая метка. Сфотографируй её и вернись к лодке.",
};
const firstDiveIntro = [
  {speaker:"Напарник",text:"У нас старая схема Корнеева. Он прошёл здесь в 1996-м, но до конца пещеру не обследовал. Мы проверим, что осталось от его маршрута."},
  {speaker:"Напарник",text:"Комплект собран. Под буем есть жёлтая метка на линии. Сфотографируй её и возвращайся. Рассмотрим снимок на лодке, прежде чем идти под свод."},
];

function scoutedBeyondBuoy(observed) {
  if (!observed || !(Array.isArray(observed) || typeof observed.has === 'function')) return false;
  return [...observed].some(id => id !== firstDiveTarget.id && xt().finds?.some(find => find.id === id));
}

class FirstDiveProgress {
  constructor(){
    this.key=qt("first-dive");
    const saved=Me(this.key),season=Bn();
    // Existing expeditions keep their progress and never acquire a new chore.
    this.completed = saved?.version === 1
      ? saved.completed === true || eo().notes.length > 0 || scoutedBeyondBuoy(Me(qt('expedition'))?.observed)
      : season.dives > 0 || season.found.length > 0;
    this.save();
  }
  get active(){return xt().id==="hub"&&!this.completed;}
  finish(kept,finds,notes=new Set(),observed){
    if(!this.active||!kept||(!finds.length&&!notes.size&&!scoutedBeyondBuoy(observed)))return false;
    this.completed=true;this.save();return true;
  }
  reset(){this.completed=false;this.save();}
  save(){de(this.key,{version:1,completed:this.completed});}
}

function firstAscentControl(keyboard) {
  return keyboard ? "Держи Shift и ↑ для медленного подъёма к бую."
    : "К бую — сдвинь палец вверх до половины круга джойстика.";
}

function firstDiveHint(state,shots,keyboard,notes,observed){
  if(notes?.size)return "Запись прочитана. Уже можно возвращаться: по линии к шахте, затем вверх к бую.";
  if(shots.some(shot=>shot.finds.length))return "Снимок есть. "+firstAscentControl(keyboard);
  if(scoutedBeyondBuoy(observed))return "Есть новый ориентир. Вернись по линии к бую, чтобы отметить его на лодке.";
  if(state.depth>9)return "Метка осталась выше, на 6 м под буем. Для первого снимка достаточно вернуться к ней.";
  if(state.depth<2)return keyboard
    ?"Плыви стрелками или WASD к жёлтой метке под буем. Для медленного хода держи Shift."
    :"Веди пальцем по воде в сторону жёлтой метки под буем. Чем меньше отклонение, тем медленнее плывёшь.";
  if(shots.length)return "Метка не попала в кадр. Подплыви ближе, направь на неё свет и сними ещё раз.";
  return keyboard
    ?"Наведи свет на жёлтую метку: держи Z и направление. Затем удерживай X до вспышки. Между снимками дождись заполнения кольца камеры."
    :"Слегка отклони палец к жёлтой метке, чтобы навести свет. Удерживай «Камеру» до вспышки. Между снимками дождись заполнения кольца камеры.";
}

function firstDiveLesson(state,shots,keyboard,notes,observed){
  const id=notes?.size||shots.some(shot=>shot.finds.length)||scoutedBeyondBuoy(observed)?'first-return':state.depth>9?'first-above':state.depth<2?'first-move':shots.length?'first-retry':'first-camera';
  return {id,text:firstDiveHint(state,shots,keyboard,notes,observed)};
}
