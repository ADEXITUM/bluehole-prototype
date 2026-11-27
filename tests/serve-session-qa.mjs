// Isolated checkpoint fixtures. They prepare positions/resources explicitly;
// saving, reloading, resuming and delivering use the production implementation.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
http.createServer(async(req,res)=>{
  if(req.url!='/experiment.html'){res.writeHead(404);res.end();return;}
  let html=await readFile(new URL('../experiment.html',import.meta.url),'utf8');
  html=html.replace('<script type="module">',`<script>
  localStorage.setItem('bluehole-photo-survey:sound','false');
  if(!localStorage.getItem('session-qa-v1')){
    const seed=(key,value)=>localStorage.setItem('bluehole-photo-survey:hub:'+key,JSON.stringify(value));
    seed('first-dive',{version:1,completed:true});seed('season',{found:['cache'],dives:4});
    seed('gear',['single12','twin12','ean50','spareReel','spareLight']);
    seed('tips',{on:false,seen:[],ui:[],said:[],diver:true,freq:false});
    seed('plan',{rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});
    localStorage.setItem('session-qa-v1','true');
  }
  </script><script type="module">`);
  const fixture=`{
  const panel=document.createElement('aside');panel.setAttribute('aria-label','Проверка сохранения');
  panel.style='position:fixed;bottom:4px;left:4px;right:4px;z-index:99999;background:#eee6d3;color:#123;padding:6px;display:flex;gap:4px;flex-wrap:wrap;font:11px sans-serif';
  const output=document.createElement('output');output.setAttribute('aria-label','Состояние тестового нырка');output.style='display:block;width:100%;white-space:pre-wrap';panel.append(output);
  const refresh=()=>{
    const s=qu.state,checkpoint=Me(qt('session'));
    output.textContent=JSON.stringify({mode:qu.mode,depth:+s.depth.toFixed(2),gas:s.tanks.map(t=>({id:t.id,bar:+t.bar.toFixed(3),carried:t.carried})),stop:s.stop,time:+s.tWall.toFixed(3),frames:s.camera.frames,shots:qu.diveShots.length,notes:[...qu.diveNotes],reading:qu.noteOpen,diving:lf(),delivered:Bn().dives,save:checkpoint?.status??checkpoint?.active,error:qu.session.error,bytes:JSON.stringify(checkpoint).length});
  };
  const position=(x,y,aim)=>{$0(qu.state,qu.world,x,y);qu.state.diver.aim=aim;qu.snapCamera();qu.render(0);};
  const start=()=>{if(qu.pauseUI.open)qu.pauseUI.resume();qu.startDive({rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});};
  const finish=saveOnly=>{
    if(qu.pauseUI.open)qu.pauseUI.resume();
    qu.state.phase='end';qu.state.outcome={kind:'clean',depth:0,p:0};qu.state.depth=0;qu.state.diver.y=0;
    qu.tm.finish(qu.state);qu.mode='ending';qu.session.save(qu,true);
    if(saveOnly){qu.mode='dive';qu.paused=true;qu.input.enabled=false;}
    else qu.finishDive();
  };
  for(const [label,action] of [
    ['Метка и снимок',()=>{start();position(46,4.6,.55);qu.state.camera.frames=1;qu.state.camera.charge=7;qu.onShot({n:1,x:46,y:4.6,aim:.55});qu.pauseUI.show('Тест: снимок перед перезагрузкой.');}],
    ['Остановка и баллон',()=>{start();Di(qu.state.tissues,Bt.air,46,180);dl(qu.state);position(48,qu.state.stop,Math.PI/2);qu.state.tanks[0].bar=91.375;Object.assign(qu.state.tanks[1],{carried:false,x:48,y:21,onLine:true,bar:83.25});qu.diveGuide.wasStop=true;qu.diveGuide.bandSeconds=22;qu.pauseUI.show('Тест: остановка, EAN50 оставлен на 21 м.');}],
    ['Чтение записи',()=>{start();position(49.8,18.6,0);qu.noteOpen='n1';qu.simStep({...xi,read:true});qu.pauseUI.show('Тест: чтение перед перезагрузкой.');}],
    ['Вернуться',()=>finish(false)],
    ['Исход до доставки',()=>finish(true)],
    ['Скрыть проверку',()=>panel.remove()]
  ]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{try{action();refresh();}catch(error){output.textContent=error.stack;}};panel.append(b);}
  document.body.append(panel);setInterval(refresh,500);refresh();
  }`;
  const at=html.lastIndexOf('</script>');html=html.slice(0,at)+fixture+html.slice(at);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(html);
}).listen(48406,'127.0.0.1',()=>console.log('Session QA http://127.0.0.1:48406/experiment.html'));
