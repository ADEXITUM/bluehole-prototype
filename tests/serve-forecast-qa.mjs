// Explicit browser fixture on a separate origin. Never writes the author's save.
// Run after building: node tests/serve-forecast-qa.mjs
import http from 'node:http';
import {readFile} from 'node:fs/promises';
http.createServer(async(req,res)=>{
  if(req.url!='/experiment.html'){res.writeHead(404);res.end();return;}
  let html=await readFile(new URL('../experiment.html',import.meta.url),'utf8');
  const seed=`localStorage.setItem('bluehole-photo-survey:sound','false');
  const fixtureSet=(key,value)=>localStorage.setItem('bluehole-photo-survey:hub:'+key,JSON.stringify(value));
  fixtureSet('first-dive',{version:1,completed:true});
  fixtureSet('gear',['single12','twin12','ean50','spareReel','spareLight']);
  fixtureSet('season',{found:['cache'],dives:4});
  fixtureSet('plan',{rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});
  fixtureSet('learning',{version:1,briefed:['return','line','stop','backup'],practiced:['stop']});`;
  html=html.replace('<script type="module">','<script>'+seed+'</script><script type="module">');
  const fixture=`
  const qaPanel=document.createElement('aside');
  qaPanel.setAttribute('aria-label','Проверка прогноза');
  qaPanel.style='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#eee6d3;color:#123;padding:10px;display:flex;gap:6px;flex-wrap:wrap;font:12px sans-serif';
  const qaTitle=document.createElement('strong');qaTitle.textContent='Тестовые состояния прибора';qaTitle.style='width:100%';qaPanel.append(qaTitle);
  for(const [id,label] of [['full','EAN50 с собой'],['staged','Баллон оставлен'],['empty','Активный пуст'],['air','Сменить на воздух']]){
    const button=document.createElement('button');button.textContent=label;button.style='font:12px sans-serif;padding:10px';qaPanel.append(button);
    button.onclick=()=>{
      qu.startDive({rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});qu.boat.hide();
      const state=qu.state,deco=state.tanks.find(t=>t.id==='deco');
      $0(state,qu.world,48,21);Di(state.tissues,Bt.air,48,180);dl(state);
      if(id==='staged')Object.assign(deco,{carried:false,x:90,y:47,onLine:true});
      if(id==='empty'){state.breathing=state.tanks.indexOf(deco);dl(state);deco.bar=0;}
      if(id==='air')deco.bar=0;
      qu.paused=true;qu.input.reset();qu.snapCamera();
      for(const control of $s)qu.reveal.mem.ui.add(control);
      qaTitle.textContent='Тест: '+label;
    };
  }
  const noteButton=document.createElement('button');noteButton.textContent='Проверить привезённую записку';
  noteButton.onclick=()=>{
    de(qt('season'),{found:['dome'],dives:3});
    Wl({...eo(),notes:['n2'],dives:3});
    qu.session.finish();qu.expedition.refresh();qu.showPlan();qu.boat.showChapters();qaPanel.remove();
  };
  qaPanel.append(noteButton);document.body.append(qaPanel);`;
  const at=html.lastIndexOf('</script>');html=html.slice(0,at)+fixture+html.slice(at);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(html);
}).listen(48403,'127.0.0.1',()=>console.log('Forecast QA http://127.0.0.1:48403/experiment.html'));
