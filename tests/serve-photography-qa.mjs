// Explicit isolated UI fixtures, not a natural full-dive playthrough.
// Actual renderer/exposure/capture and production delivery/album UI are used.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const htmlFile=new URL('../experiment.html',import.meta.url);
http.createServer(async(req,res)=>{
  if(req.url!='/experiment.html'){res.writeHead(404);res.end();return;}
  let html=await readFile(htmlFile,'utf8');
  html=html.replace('<script type="module">',`<script>
  localStorage.setItem('bluehole-photo-survey:sound','false');
  if(!localStorage.getItem('photography-qa-v1')){
    const seed=(key,value)=>localStorage.setItem('bluehole-photo-survey:hub:'+key,JSON.stringify(value));
    seed('first-dive',{version:1,completed:true});seed('season',{found:[],dives:3});
    seed('gear',['single12','twin12','ean50','spareReel','spareLight']);
    seed('tips',{on:false,seen:[],ui:[],said:[],diver:true,freq:false});
    seed('plan',{rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});
    localStorage.setItem('photography-qa-v1','true');
  }
  </script><script type="module">`);
  const fixture=`{
  const qa=document.createElement('aside');qa.setAttribute('aria-label','Фотопроверка');
  qa.style='position:fixed;bottom:4px;left:4px;z-index:99999;background:#eee6d3;padding:6px;display:flex;gap:4px;flex-wrap:wrap;max-width:340px;font:11px sans-serif';
  const errors=document.createElement('output');errors.setAttribute('aria-label','Ошибки проверки');
  const report=error=>{errors.textContent=error.message||String(error);qa.append(errors);};
  window.addEventListener('error',event=>report(event.error||event.message));
  window.addEventListener('unhandledrejection',event=>report(event.reason));
  const position=(x,y,aim)=>{$0(qu.state,qu.world,x,y);qu.state.diver.aim=aim;qu.state.diver.vx=0;qu.state.diver.vy=0;qu.snapCamera();qu.render(0);};
  const start=()=>{qu.startDive({rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});qu.boat.hide();qu.paused=false;};
  const shoot=(x,y,aim)=>{position(x,y,aim);qu.state.camera.frames=qu.diveShots.length+1;qu.onShot({n:qu.state.camera.frames,x,y,aim});};
  for(const [label,action] of [
    ['У метки',()=>{start();position(46,4.6,.55);} ],
    ['У записи',()=>{start();position(48.4,18.5,.05);} ],
    ['Привезти 3 кадра',()=>{
      start();shoot(46,4.6,.55);shoot(49.8,4.8,2.6);shoot(48.4,18.5,.05);
      qu.state.outcome={kind:'clean',depth:0,p:0};qu.state.phase='end';qu.state.tanks.find(t=>t.id==='back').bar=64;
      qu.tm.cur.summary={turn:{state:'ok',count:1,tanks:[{id:'back',bar:145,mark:150}]}};
      qu.finishDive();qa.remove();
    }],
    ['Скрыть проверку',()=>qa.remove()]
  ]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{try{action();}catch(error){report(error);}};qa.append(b);}
  document.body.append(qa);}`;
  const at=html.lastIndexOf('</script>');html=html.slice(0,at)+fixture+html.slice(at);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(html);
}).listen(48405,'127.0.0.1',()=>console.log('Photography QA http://127.0.0.1:48405/experiment.html'));
