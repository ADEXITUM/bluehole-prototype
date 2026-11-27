// Isolated, explicit UI fixtures. Freeze swimming to inspect overlapping lessons;
// controls invoke the production guide, exposure, pause and checkpoint paths.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
http.createServer(async(req,res)=>{
  if(req.url!='/experiment.html'){res.writeHead(404);res.end();return;}
  let html=await readFile(new URL('../experiment.html',import.meta.url),'utf8');
  html=html.replace('<script type="module">',`<script>
  localStorage.setItem('bluehole-photo-survey:sound','false');
  if(!localStorage.getItem('feedback-qa-v1')){
    const seed=(key,value)=>localStorage.setItem('bluehole-photo-survey:hub:'+key,JSON.stringify(value));
    seed('first-dive',{version:1,completed:true});seed('season',{found:[],dives:2});
    seed('gear',['single12','twin12','ean50','spareReel','spareLight']);
    seed('tips',{on:true,seen:[],ui:[],said:[],diver:false,freq:false});
    seed('plan',{rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});
    localStorage.setItem('feedback-qa-v1','true');
  }
  </script><script type="module">`);
  const fixture=`{
    qu.canSimulate=()=>false;
    const panel=document.createElement('aside');panel.setAttribute('aria-label','Проверка подсказок');
    panel.style='position:fixed;bottom:4px;left:4px;right:4px;z-index:99999;background:#eee6d3;color:#123;padding:6px;display:flex;gap:4px;flex-wrap:wrap;font:11px sans-serif';
    const output=document.createElement('output');output.setAttribute('aria-label','Состояние проверки');output.style='display:block;width:100%;overflow-wrap:anywhere';panel.append(output);
    let discoveries=0,error='';const discovery=qu.sound.discovery.bind(qu.sound);qu.sound.discovery=()=>{discoveries++;discovery();};
    window.addEventListener('error',e=>error=String(e.error||e.message));
    window.addEventListener('unhandledrejection',e=>error=String(e.reason));
    const refresh=()=>{output.textContent=JSON.stringify({seen:[...qu.learning.seen],active:qu.diveGuide?.active?.id,queue:qu.diveGuide?.queue.map(x=>x.id),wait:qu.buttons(qu.state).wait,stop:qu.state.stop,frames:qu.diveShots.length,fresh:qu.diveShots.at(-1)?.fresh,discoveries,error});};
    const position=(x,y,aim=0)=>{$0(qu.state,qu.world,x,y);Object.assign(qu.state.diver,{vx:0,vy:0,aim});qu.snapCamera();};
    const update=()=>{qu.simStep({...xi});qu.render(0);refresh();};
    const start=()=>{if(qu.pauseUI.open)qu.pauseUI.resume();qu.startDive({rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});qu.boat.transition.cancel();qu.paused=false;qu.input.enabled=true;};
    const line=()=>{start();const p=qu.world.olds[0].pts.at(-1);position(p.x,p.y);qu.state.ruleT=1;qu.state.tanks[0].marks=[140,70];update();};
    const shoot=()=>{position(46,4.6,.55);qu.state.camera.frames=qu.diveShots.length+1;qu.state.camera.charge=7;qu.onShot({n:qu.state.camera.frames,x:46,y:4.6,aim:.55});qu.render(0);refresh();};
    for(const [label,action] of [
      ['Сброс уроков',()=>{qu.learning.reset();qu.reveal.mem.said.clear();qu.reveal.mem.diver=false;qu.reveal.mem.lines=true;qu.tips.mem.on=true;qu.tips.mem.seen.clear();qu.reveal.persist?.(qu.reveal.mem);line();}],
      ['Нырок к линии',line],
      ['Ил',()=>{_c(qu.state.silt,qu.world,qu.state.diver.x,qu.state.diver.y,3,.35);wc(qu.state);qu.diveGuide.step(qu.state,qu.world);qu.render(0);refresh();}],
      ['Разворот',()=>{qu.state.tanks[0].bar=139;qu.diveGuide.step(qu.state,qu.world);qu.render(0);refresh();}],
      ['Записка',()=>{qu.noteOpen=qu.noteOpen?null:'n1';qu.render(0);refresh();}],
      ['Чистая вода',()=>{gc(qu.state.silt);wc(qu.state);position(48,8);update();}],
      ['Снимок',()=>{if(qu.mode!=='dive')start();shoot();}],
      ['Остановка',()=>{start();Di(qu.state.tissues,Bt.air,46,180);dl(qu.state);position(48,qu.state.stop,Math.PI/2);update();}],
      ['Галоклин и сохранение',()=>{start();position(48,qu.world.site.halocline,Math.PI/2);qu.reveal.update(qu.state,qu.world,qu.buttons(qu.state),{stop:0,ndl:Infinity},.1);qu.pauseUI.show();}],
      ['Скрыть проверку',()=>panel.remove()]
    ]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{try{action();}catch(e){error=e.stack;refresh();}};panel.append(b);}
    document.body.append(panel);setInterval(refresh,500);refresh();
  }`;
  const at=html.lastIndexOf('</script>');html=html.slice(0,at)+fixture+html.slice(at);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(html);
}).listen(48407,'127.0.0.1',()=>console.log('Feedback QA http://127.0.0.1:48407/experiment.html'));
