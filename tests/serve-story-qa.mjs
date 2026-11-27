// Explicit early-story fixtures on a separate origin. Exposures, note reading,
// delivery and all user-facing result/boat screens use the production code.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
http.createServer(async(req,res)=>{
  if(req.url!='/experiment.html'){res.writeHead(404);res.end();return;}
  let html=await readFile(new URL('../experiment.html',import.meta.url),'utf8');
  html=html.replace('<script type="module">',`<script>localStorage.setItem('bluehole-photo-survey:sound','false');</script><script type="module">`);
  const fixture=`{
    qu.canSimulate=()=>false;
    const panel=document.createElement('aside');panel.setAttribute('aria-label','Проверка ранней истории');
    panel.style='position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:5px;background:#eee6d3;color:#123;display:flex;gap:4px;flex-wrap:wrap;font:11px sans-serif';
    const output=document.createElement('output');output.setAttribute('aria-label','Проверка истории');output.style='display:block;width:100%';panel.append(output);
    let error='';window.addEventListener('error',e=>error=String(e.error||e.message));window.addEventListener('unhandledrejection',e=>error=String(e.reason));
    const refresh=()=>output.textContent=JSON.stringify({question:qu.expedition.intention().question,found:Bn().found,notes:eo().notes,presented:[...qu.learning.presented],error});
    const start=()=>{if(qu.pauseUI.open)qu.pauseUI.resume();qu.startDive({rule:3,bottom:'air',back:'single',slots:['reel']});qu.boat.transition.cancel();qu.paused=false;qu.input.enabled=true;};
    const position=(x,y,aim=0)=>{$0(qu.state,qu.world,x,y);Object.assign(qu.state.diver,{vx:0,vy:0,aim});qu.snapCamera();qu.render(0);};
    const finish=outcome=>{position(48,0);qu.state.outcome=outcome??{kind:'clean',depth:0,p:0};qu.state.phase='end';qu.state.tanks[0].bar=190;qu.tm.finish(qu.state);qu.finishDive();refresh();};
    const note=()=>{position(50.5,18.6);qu.noteOpen='n1';qu.simStep({...xi,read:true});qu.noteOpen=null;};
    for(const [label,action] of [
      ['Метка и возврат',()=>{start();position(46,4.6,.55);qu.state.camera.frames=1;qu.onShot({n:1,x:46,y:4.6,aim:.55});finish();}],
      ['Бирка и возврат',()=>{start();note();finish();}],
      ['Аварийный возврат',()=>{start();note();finish({kind:'clean',cesa:true,depth:0,p:0});}],
      ['Показать муть',()=>{start();position(48,10);_c(qu.state.silt,qu.world,48,10,3,.35);wc(qu.state);qu.diveGuide.step(qu.state,qu.world);qu.render(.1);refresh();}],
      ['Уйти из мути',()=>{gc(qu.state.silt);wc(qu.state);qu.render(.1);refresh();}],
      ['Скрыть проверку',()=>panel.remove()]
    ]){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{try{action();refresh();}catch(e){error=e.stack;refresh();}};panel.append(button);}
    document.body.append(panel);setInterval(refresh,500);refresh();
  }`;
  const at=html.lastIndexOf('</script>');html=html.slice(0,at)+fixture+html.slice(at);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(html);
}).listen(48408,'127.0.0.1',()=>console.log('Early story QA http://127.0.0.1:48408/experiment.html'));
