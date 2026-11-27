// Local plans are intentions. Evidence, not a checklist of named photographs,
// opens the next question; physical access to the cave is never gated here.
const expeditionChapters=[
  {id:"survey",number:1,title:"Верхняя галерея",objective:"Проверить старую линию и понять, где Корнеев закончил съёмку.",
    intro:[{speaker:"Напарник",text:"У верхнего входа на 18 метрах есть бирка. Начни с неё: одного нового свидетельства достаточно для короткого выхода."},{speaker:"Ты",text:"Проверю ближайший участок и вернусь с тем, что узнаю."}],
    ending:"В верхнем ходе нашлась схема продолжения. Теперь есть причина готовить более глубокий выход.",
    targets:[{id:"curtain"},{id:"dome"}],noteIds:["n1","n2","n3"]},
  {id:"traces",number:2,title:"Продолжение старой линии",objective:"Проверить ход, отмеченный на схеме, и следы прежнего посещения.",
    intro:[{speaker:"Напарник",text:"Следующий вход ниже, на 33 метрах. Путь длиннее — подготовь спарку и проверь запас на возвращение."},{speaker:"Ты",text:"Прослежу линию. Если найду что-то новое, привезу кадр — тогда будем строить следующий план."}],
    ending:"У конца старой линии обнаружилось продолжение вниз. Что произошло за этим участком, ещё предстоит выяснить.",
    targets:[{id:"tank81"},{id:"reel81"}],noteIds:["n4","n5"]},
  {id:"fate",number:3,title:"Нижний ход",objective:"Осмотреть продолжение маршрута и восстановить события по найденным свидетельствам.",
    intro:[{speaker:"Напарник",text:"Следы ведут ниже. Вход со стороны шахты — около 46 метров. Сначала подготовь возвращение с остановками; на месте решишь, насколько далеко идти."},{speaker:"Ты",text:"Посмотрю, куда продолжается маршрут. Выводы сделаем по тому, что удастся привезти."}],
    ending:"Записи и находка у стены связали последние участки маршрута. Теперь это история, которую удалось привезти наверх.",
    targets:[{id:"slate81"},{id:"body"}],noteIds:["n6"]},
];
const expeditionAfterword={title:"История привезена наверх",text:"В записи 1981 года человек ищет другой выход вдоль стены. Там же найдены останки дайвера — вероятно, автора записи. Имя и причина потери пути пока неизвестны. Мы привезли фотографии и положение находок: теперь эта история не останется только в пещере."};
const surveyObservations={
  curtain:"Зубчатый свод — сталактиты. Можно сфотографировать этот ориентир и вернуться по линии.",
  dome:"Под сводом поверхность воды: это воздушный карман. Газ в нём не пополняет твои баллоны. Обратный путь — по линии.",
  cache:"В луче у стены виден светлый прямоугольник с тёмной полоской по краю.",
  tank81:"В нише старый баллон. Фотография поможет рассмотреть маркировку на лодке.",
  reel81:"У щели лежит катушка; её линия уходит вниз. Сфотографируй, чтобы сохранить это место на карте.",
  slate81:"На дне табличка с записями дайвера. Её можно прочесть рядом и сфотографировать.",
  body:"У стены останки дайвера со снаряжением. Зафиксируй место; смысл находки нужно сверить с записями.",
};
// Presentation priority is not evidence. Accept older checkpoint keys that
// serialized the entire journal entry without turning metadata into new facts.
function surveyEvidenceKey(entry){
  const title=entry.source==="Наблюдение"&&entry.title==="Схема у конца линии"?"Светлый прямоугольник":entry.title;
  return JSON.stringify({title,source:entry.source});
}

class ExpeditionProgress {
  constructor(){
    this.key=qt("expedition");const saved=Me(this.key),valid=[1,2].includes(saved?.version);
    this.endingReviewed=valid&&saved.endingReviewed===true;
    this.chapterId=valid?saved.chapterId:null;
    this.seenIntro=new Set(valid&&Array.isArray(saved.seenIntro)?saved.seenIntro.filter(id=>expeditionChapters.some(p=>p.id===id)):[]);
    this.observed=new Set(saved?.version===2&&Array.isArray(saved.observed)?saved.observed.filter(id=>xt().finds.some(f=>f.id===id)):[]);
    this.legacyUnlocked=new Set(saved?.version===2&&Array.isArray(saved.legacyUnlocked)?saved.legacyUnlocked.filter(id=>expeditionChapters.some(p=>p.id===id)):[]);
    this.found=new Set();this.notes=new Set();
    if(saved?.version!==2){
      const old=new Set(Bn().found),index=expeditionChapters.findIndex(p=>p.id===this.chapterId);
      if(index>=1||old.has("curtain")&&old.has("dome"))this.legacyUnlocked.add("traces");
      if(index>=2||old.has("tank81")&&old.has("reel81"))this.legacyUnlocked.add("fate");
    }
    this.refresh();
    if(!valid)for(const plan of expeditionChapters)if(this.isComplete(plan.id))this.seenIntro.add(plan.id);
    this.save();
  }
  get activeChapter(){return expeditionChapters.find(p=>p.id===this.chapterId)??expeditionChapters[0];}
  hasPhoto(id){return this.found.has(id);}
  knows(id){return this.observed.has(id)||this.found.has(id);}
  hasAnyPhoto(ids){return ids.some(id=>this.found.has(id));}
  hasAnyNote(ids){return ids.some(id=>this.notes.has(id));}
  get isFinished(){return this.found.has("body")&&(this.found.has("slate81")||this.notes.has("n6"));}
  canEnter(id){
    if(id==="survey")return true;
    if(this.legacyUnlocked.has(id))return true;
    if(id==="traces")return this.hasAnyPhoto(["cache","tank81","reel81","slate81","body"])||this.hasAnyNote(["n3","n4","n5","n6"]);
    if(id==="fate")return this.hasAnyPhoto(["reel81","slate81","body"])||this.hasAnyNote(["n5","n6"]);
    return false;
  }
  isComplete(id){return id==="survey"?this.canEnter("traces"):id==="traces"?this.canEnter("fate"):id==="fate"?this.isFinished:false;}
  nextPlan(){return expeditionChapters.find(p=>this.canEnter(p.id)&&!this.isComplete(p.id))??expeditionChapters.at(-1);}
  select(id){this.refresh();if(!this.canEnter(id))return false;this.chapterId=id;this.save();return true;}
  hasSeenIntro(id=this.chapterId){return this.seenIntro.has(id);}
  markIntroSeen(id=this.chapterId){if(this.canEnter(id)){this.seenIntro.add(id);this.save();}}
  remember(observed,kept){if(!kept)return;for(const id of observed)if(xt().finds.some(f=>f.id===id))this.observed.add(id);this.save();}
  evidenceKeys(){return new Set(this.journal().map(surveyEvidenceKey));}
  preparation(){
    const intent=this.intention();
    if(!intent.long)return null;
    return {gear:this.canEnter("traces")?["twin12","spareLight"]:["twin12"],text:this.canEnter("traces")
      ?"Для глубокого маршрута доступны спарка и улучшенный запасной фонарь. Спарка увеличивает запас газа; яркий резервный свет занимает одно из двух мест. Выбери комплект перед выходом."
      :"Продолжение линии требует большего запаса газа. На лодке доступна спарка 2×12 л. Выбери её в комплекте; газ на обратный путь всё равно нужно беречь."};
  }
  refresh(){
    const completedBefore=new Set(expeditionChapters.filter(p=>this.isComplete(p.id)).map(p=>p.id));
    const availableBefore=new Set(expeditionChapters.filter(p=>this.canEnter(p.id)).map(p=>p.id));
    this.found=new Set(Bn().found);this.notes=new Set(eo().notes);
    if(!this.canEnter(this.chapterId))this.chapterId=this.nextPlan().id;
    this.save();
    return {completed:expeditionChapters.filter(p=>this.isComplete(p.id)&&!completedBefore.has(p.id)).map(p=>p.id),unlocked:expeditionChapters.filter(p=>this.canEnter(p.id)&&!availableBefore.has(p.id)).map(p=>p.id)};
  }
  reset(){this.chapterId=null;this.endingReviewed=false;this.seenIntro.clear();this.observed.clear();this.legacyUnlocked.clear();this.refresh();this.save();}
  reviewEnding(){if(this.isFinished){this.endingReviewed=true;this.save();}}
  save(){de(this.key,{version:2,chapterId:this.chapterId,seenIntro:[...this.seenIntro],observed:[...this.observed],legacyUnlocked:[...this.legacyUnlocked],endingReviewed:this.endingReviewed});}

  intention(id=this.chapterId){
    const route=(title,why,clue,marker,long=false,question=null)=>({title,short:title,why,clue,marker,long,question});
    const photo=(id,title,why)=>({...route(title,why,"Вернись к замеченному месту, направь свет и удерживай камеру до вспышки.",xt().finds.find(f=>f.id===id),true),id});
    if(id==="survey"){
      if(this.isComplete("survey"))return route("Вернуться в верхнюю галерею","Знакомый путь можно дополнить снимками. Продолжение исследования выбирается в журнале.","Верхний вход справа из шахты на 18 м.",{x:51,y:18},true);
      const lastArrow=this.notes.has("n2")?xt().notes.find(note=>note.id==="n2"):null;
      const knownEnd=lastArrow?{x:lastArrow.x,y:lastArrow.y}:null;
      if(this.knows("cache"))return route("Рассмотреть светлый прямоугольник","В верхней галерее на фоне тёмной стены мелькнул ровный белый край.","Вернись с катушкой. Подойди ближе, чтобы рассмотреть предмет, или привези чёткий кадр.",knownEnd,true,"Что белело у стены?");
      if(lastArrow)return route("Вернуться к последней стрелке","Корнеев оставил запись у конца верхней линии. Отсюда он продолжил путь со своей катушкой.","Осмотрись у последней стрелки. Если решишь продолжить, закрепи свою линию и проверь запас на возвращение.",knownEnd,true,"Куда Корнеев ходил от последней стрелки?");
      if(this.knows("dome"))return route("Осмотреть конец верхней линии","Воздушный карман — ориентир, до которого дошла старая линия. Стоит осмотреть её конец.","Следуй знакомой линии к карману и осмотри её конец. Для продолжения за готовой линией возьми катушку.",{x:87,y:14.6},true,"Почему линия заканчивается у кармана?");
      if(this.knows("curtain")||this.notes.has("n1"))return route("Проследить верхнюю линию",this.notes.has('n1')?"Корнеев оставил найденную метку на месте. Кто-то бывал здесь до него; стоит посмотреть, есть ли дальше другие следы.":"За зубчатым сводом линия продолжается. Ближайший участок уже узнаваем — можно проверить следующий.","Войди справа на 18 м и следуй по линии. Найдёшь новое — можно возвращаться. Отметка газа — предел для разворота, а не цель выхода.",{x:51,y:18},true,"Есть ли дальше следы прежнего посещения?");
      if(this.hasPhoto('entry-tag'))return route('Проверить бирку у входа','На метке «96» проступают стёртые знаки. У ближайшего входа есть бирка Корнеева — она может объяснить находку.','Спустись по верёвке к 18 м. Бирка на линии у входа справа: подплыви и нажми «Читать». С одной записью уже можно возвращаться.',{x:51,y:18},false,'Метка старше разведки Корнеева?');
      return route("Проверить верхний вход","На схеме Корнеева отмечен вход на 18 м. Начнём с ближайшего участка.","Спустись вдоль верёвки к 18 м и поверни направо. Осмотри начало хода; одна запись или снимок — уже полезный выход.",{x:51,y:18},false,"Что осталось от разведки Корнеева?");
    }
    if(id==="traces"){
      if(this.isComplete("traces"))return route("Вернуться к старой линии","Место разведано. Продолжение вниз можно выбрать в журнале.","Вход справа из шахты примерно на 33 м.",{x:51,y:33},true);
      if(this.knows("reel81")&&!this.hasPhoto("reel81"))return photo("reel81","Сфотографировать катушку у щели","Её линия продолжается вниз. Нужен кадр, чтобы сопоставить это место со схемой.");
      if(this.hasPhoto("tank81"))return route("Проследить линию дальше","На снимке старый баллон с клеймом «81». Пока неизвестно, кто оставил его здесь.","От входа на 33 м дойди до конца старой линии. Для своей линии возьми катушку.",{x:74.6,y:38},true);
      if(this.knows("tank81"))return photo("tank81","Сфотографировать старый баллон","Привезённое наблюдение указывает на чужое снаряжение. Снимок позволит рассмотреть его на лодке.");
      return route("Проверить ход на 33 м","Есть основание продолжить съёмку ниже: на старой схеме отмечен ещё один вход.","Найди вход справа на 33 м. Проследи линию до её конца и возвращайся с тем, что обнаружишь.",{x:51,y:33},true);
    }
    if(this.isFinished)return route("Свободное исследование",expeditionAfterword.text,"Можно дополнить альбом и карту на любом знакомом маршруте.",null,true);
    if(this.knows("slate81")&&!this.hasPhoto("slate81")&&!this.notes.has("n6"))return photo("slate81","Сфотографировать записи дайвера","В нижнем ходе замечена табличка для записей. Её можно прочесть рядом или привезти снимок.");
    if(this.knows("body")&&!this.hasPhoto("body"))return photo("body","Зафиксировать находку у стены","Нужен снимок места, чтобы сопоставить находку с остальными следами.");
    if(this.hasPhoto("slate81")||this.notes.has("n6"))return route("Проверить путь вдоль стены","В записи говорится о потерянном пути и поиске другого выхода. Это свидетельство, а не полная картина событий.","Вернись в нижний ход через вход на 46 м. Осмотри стену в сторону шахты.",{x:51,y:46},true);
    return route("Осмотреть нижний ход",this.hasPhoto("body")?"Место находки зафиксировано, но обстоятельства ещё неизвестны. Нужны другие свидетельства.":"Продолжение старого маршрута уходит вниз. Предстоит выяснить, что там осталось.","Вход со стороны шахты — около 46 м. Осматривай ход, сохраняя собственный путь обратно.",{x:51,y:46},true);
  }

  journal(){
    const entries=[];
    const add=(test,title,text,source,priority=0)=>{if(test)entries.push({title,text,source,priority});};
    add(true,"Зачем мы здесь","2004 год. Корнеев передал схему своей разведки 1996 года. Мы сверяем маршрут и сохраняем найденное на фотографиях.","Перед выходом");
    add(this.knows("entry-tag"),"Метка под буем",this.hasPhoto('entry-tag')?xt().finds.find(find=>find.id==='entry-tag').fact:"Под буем замечена жёлтая метка. Надпись ещё предстоит рассмотреть.",this.hasPhoto("entry-tag")?"Фотография":"Наблюдение",1);
    add(this.notes.has("n1"),"Метка была здесь раньше","Корнеев пишет, что в 1996 году оставил старую метку у спуска на месте. Она была здесь до его разведки; кто её оставил, пока неизвестно.","Бирка у входа",2);
    add(this.knows("curtain"),"Зубчатый свод","У начала верхнего хода — сталактиты. Этот ориентир помогает узнать путь обратно.",this.hasPhoto("curtain")?"Фотография":"Наблюдение");
    add(this.knows("dome"),"Воздушный карман","Под сводом есть поверхность воды. Это закрытый карман газа; запаса для возвращения он не добавляет.",this.hasPhoto("dome")?"Фотография":"Наблюдение");
    add(this.notes.has("n2"),"За концом верхней линии","На последней стрелке Корнеев записал, что ходил дальше со своей катушкой. Внизу течение меняется. На обратный путь против воды уходит больше газа.","Записка у воздушного кармана",3);
    if(this.notes.has("n3")||this.hasPhoto("cache")){
      add(true,"Схема у конца линии","Корнеев нанёс на пластину путь от входа на 33 м. Через зал колонн можно обойти узость и вернуться в верхний ход.",this.notes.has("n3")?"Прочитанная схема":"Фотография",4);
    }else add(this.knows("cache"),"Светлый прямоугольник",surveyObservations.cache,"Наблюдение",4);
    add(this.knows("tank81"),"Чужой баллон",this.hasPhoto("tank81")?"На баллоне клеймо «81». Оно датирует снаряжение, но само по себе не объясняет, когда и почему его оставили.":"В нижней галерее замечен старый баллон. Его происхождение пока неизвестно.",this.hasPhoto("tank81")?"Фотография":"Наблюдение");
    add(this.notes.has("n4"),"Бирка нижнего входа","У входа на 33 м — подпись Корнеева, 1996 год. Его линия продолжается в этот ход.","Бирка на линии");
    add(this.notes.has("n5"),"Где развернулся Корнеев","В 1996-м он остановился у конца линии из-за запаса газа. Упомянул чужой баллон и продолжение вниз, которое не обследовал.","Запись на последней стрелке");
    add(this.knows("reel81"),"Линия у щели","От брошенной катушки линия уходит вниз. Дата и владелец катушки пока не установлены.",this.hasPhoto("reel81")?"Фотография":"Наблюдение");
    add(this.hasPhoto("slate81")||this.notes.has("n6"),"Записи дайвера","Запись датирована августом 1981 года. Автор потерял обратный путь у щели и собирался искать выход вдоль стены.",this.notes.has("n6")?"Прочитанная табличка":"Фотография записей");
    add(this.knows("body"),"Находка у стены","В нижнем ходе обнаружены останки дайвера со снаряжением. Одной этой находки недостаточно, чтобы восстановить маршрут.",this.hasPhoto("body")?"Фотография":"Наблюдение");
    add(this.isFinished,"Что удалось установить",expeditionAfterword.text,"Сопоставление свидетельств");
    return entries;
  }
  debrief(before){
    const known=new Set([...before].map(key=>{try{return surveyEvidenceKey(JSON.parse(key));}catch{return key;}}));
    const fresh=this.journal().filter(entry=>!known.has(surveyEvidenceKey(entry)));
    // Prefer a new answer over an incidental landmark from the same exposure.
    // Later plans keep their later evidence ahead of the introductory question.
    const important=this.canEnter('traces')?fresh.at(-1):fresh.reduce((best,entry)=>!best||entry.priority>=best.priority?entry:best,null);
    const next=this.nextPlan(),intent=this.intention(next.id);
    return {entries:fresh,text:important?.text??"Новых свидетельств пока нет. Можно продолжить знакомый маршрут или изменить подготовку.",question:intent.question??intent.title,answer:important?.source==='Бирка у входа',next:this.isFinished?"История привезена наверх. Можно продолжить свободное исследование.":`Следующий вопрос: ${intent.question??intent.title.toLowerCase()+'.'}`,changed:fresh.length>0};
  }
}
