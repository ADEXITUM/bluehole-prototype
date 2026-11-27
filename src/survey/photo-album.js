// Only delivered film can change a cover. Discovery and selected pictures are
// independent; swapping pictures never grants evidence or increments a dive.
function validPhotoMark(mark){return Array.isArray(mark)&&mark.length===2&&mark.every(n=>Number.isFinite(n)&&n>=0&&n<=1);}
function readDeliveredFilm(){
  const film=Me(qt('film'));
  if(film?.version!==1||typeof film.id!=='string'||!Array.isArray(film.shots))return null;
  const known=Ko(),notes=Hl();
  const shots=film.shots.slice(0,Q.FRAMES).filter(s=>s&&Number.isInteger(s.n)&&s.n>0&&Cl(s.img)).map(s=>({
    n:s.n,img:s.img,finds:[...new Set(Array.isArray(s.finds)?s.finds.filter(id=>known.has(id)):[])],white:s.white===true,
    marks:Object.fromEntries(Object.entries(s.marks??{}).filter(([id,mark])=>known.has(id)&&validPhotoMark(mark))),
    feedback:s.feedback&&['find','note','scene','murk','distance','aim'].includes(s.feedback.kind)?{kind:s.feedback.kind,...(notes.has(s.feedback.noteId)?{noteId:s.feedback.noteId}:{})}:null,
  }));
  return shots.length?{version:1,id:film.id,shots}:null;
}
function saveDeliveredFilm(shots,kept){
  if(!kept||!shots.length)return null;
  const film={version:1,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),shots:shots.filter(s=>Cl(s.img)).slice(0,Q.FRAMES).map(s=>({n:s.n,img:s.img,finds:s.finds,white:s.white,marks:s.marks,feedback:s.feedback?{kind:s.feedback.kind,noteId:s.feedback.noteId}:null}))};
  if(!film.shots.length)return null;
  de(qt('film'),film);
  return readDeliveredFilm()?.id===film.id?readDeliveredFilm():null;
}
function writeAlbumChoice(album){
  if(Dl(album)>mh.MAX_CHARS)return false;
  xl(album);
  return JSON.stringify(Me(qt('album')))===JSON.stringify(album);
}
function chooseAlbumPhoto(filmId,number,id){
  const film=readDeliveredFilm(),shot=film?.id===filmId&&film.shots.find(s=>s.n===number);
  if(!shot||!shot.finds.includes(id)||!Bn().found.includes(id))return false;
  const album=ji();
  if(album.frames[id]===shot.img)return true;
  if(album.frames[id])album.previous[id]={img:album.frames[id],...(validPhotoMark(album.marks[id])?{mark:album.marks[id]}:{})};
  album.frames[id]=shot.img;
  if(validPhotoMark(shot.marks[id]))album.marks[id]=shot.marks[id];else delete album.marks[id];
  return writeAlbumChoice(album);
}
function restoreAlbumPhoto(id){
  const album=ji(),previous=album.previous[id];
  if(!previous||!Bn().found.includes(id))return false;
  const current={img:album.frames[id],...(validPhotoMark(album.marks[id])?{mark:album.marks[id]}:{})};
  album.frames[id]=previous.img;
  if(validPhotoMark(previous.mark))album.marks[id]=previous.mark;else delete album.marks[id];
  album.previous[id]=current;
  return writeAlbumChoice(album);
}
function renderAlbumChoice(root,shot,film,onChange=()=>{}){
  root.replaceChildren();
  if(!shot.finds.length)return;
  if(!film){root.append(surveyElement('p','Плёнка не сохранилась в браузере. Выбор для альбома сейчас недоступен.','album-choice-status'));return;}
  const album=ji();
  for(const id of shot.finds){
    const row=surveyElement('div','','album-choice-row'),selected=album.frames[id]===shot.img;
    const choose=surveyElement('button',selected?'✓ В альбоме'+(shot.finds.length>1?': '+Eu(id):''):shot.finds.length===1?'Выбрать для альбома':'В альбом: '+Eu(id),'album-choose');
    choose.type='button';choose.disabled=selected;
    const status=surveyElement('span','','album-choice-status');status.setAttribute('role','status');
    const apply=action=>{
      if(!action()){status.textContent='Не удалось сохранить выбор. Прежний снимок оставлен.';return;}
      onChange();renderAlbumChoice(root,shot,film,onChange);
    };
    choose.addEventListener('click',()=>apply(()=>chooseAlbumPhoto(film.id,shot.n,id)));row.append(choose);
    if(album.previous[id]){const undo=surveyElement('button','Вернуть прежний','album-undo');undo.type='button';undo.addEventListener('click',()=>apply(()=>restoreAlbumPhoto(id)));row.append(undo);}
    row.append(status);root.append(row);
  }
}
function openDeliveredFilm(onChange=()=>{}){
  const film=readDeliveredFilm();if(!film)return;
  const dialog=surveyElement('dialog','','delivered-film');dialog.setAttribute('aria-label','Привезённая плёнка');
  const header=surveyElement('header'),title=surveyElement('h2','Привезённая плёнка'),close=surveyElement('button','Закрыть');
  close.type='button';close.addEventListener('click',()=>dialog.close());header.append(title,close);dialog.append(header);
  dialog.append(surveyElement('p','Снимки последнего выхода с плёнкой. Выбранный кадр останется в альбоме.','film-intro'));
  const picture=surveyElement('img'),caption=surveyElement('p','','film-caption'),explanation=surveyElement('p','','film-intro'),choices=surveyElement('div','','album-choices'),strip=surveyElement('div','','saved-film-strip');
  picture.alt='Подводный снимок';dialog.append(picture,caption,explanation,choices,strip);
  const buttons=[];
  const select=index=>{const shot=film.shots[index];picture.src=shot.img;caption.textContent=`Кадр ${shot.n} · ${surveyShotCaption(shot)}`;explanation.hidden=!!shot.finds.length;explanation.textContent=shot.finds.length?'':surveyShotExplanation(shot);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));renderAlbumChoice(choices,shot,film,onChange);};
  film.shots.forEach((shot,index)=>{const button=surveyElement('button');button.type='button';button.setAttribute('aria-label','Кадр '+shot.n);const thumb=new Image();thumb.src=shot.img;thumb.alt='';button.append(thumb,surveyElement('span',String(shot.n)));button.addEventListener('click',()=>select(index));buttons.push(button);strip.append(button);});
  select(0);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();close.focus();
}
