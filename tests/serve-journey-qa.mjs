// Local, isolated browser fixtures. Never point these seeds at the author port.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
for(const port of [48390,48391,48392])http.createServer(async(req,res)=>{
  if(req.url!='/experiment.html'){res.writeHead(404);res.end();return;}
  let html=await readFile(new URL('../experiment.html',import.meta.url),'utf8');
  const seed=port===48390?'':`if(!sessionStorage.getItem('journey-fixture')){sessionStorage.setItem('journey-fixture','1');localStorage.clear();
    const set=(k,v)=>localStorage.setItem('bluehole-photo-survey:'+k,JSON.stringify(v));
    set('sound',false);set('hub:plan',{rule:3,bottom:'air',back:'twin',slots:['reel','deco50']});
    set('hub:first-dive',{version:1,completed:true});set('hub:gear',['single12','twin12','ean50','spareReel','spareLight']);
    set('hub:season',{found:${port===48391?'["slate81"]':'["cache"]'},dives:4});
    set('hub:expedition',{version:2,chapterId:'${port===48391?'fate':'traces'}',seenIntro:['survey','traces','fate'],observed:[],legacyUnlocked:[]});
    set('hub:learning',{version:1,briefed:['return','line','stop','backup'],practiced:['stop']});}`;
  html=html.replace('<script type="module">','<script>'+seed+'</script><script type="module">');
  if(port===48392)html=html.replace('super.startDive(...args);','super.startDive(...args);$0(this.state,this.world,89.5,20);this.snapCamera();');
  if(port===48391){
    const fixture=`const journeyFinalButton=document.createElement('button');journeyFinalButton.textContent='Тест: доставить последние свидетельства';journeyFinalButton.style='position:fixed;bottom:4px;left:4px;z-index:99999';document.body.append(journeyFinalButton);journeyFinalButton.onclick=()=>{qu.startDive(qu.planScreen.current);qu.state.phase='end';qu.state.outcome={kind:'clean',depth:0,p:0};qu.diveFinds=[{id:'body'},{id:'slate81'}];qu.finishDive();journeyFinalButton.remove();};`;
    const i=html.lastIndexOf('</script>');html=html.slice(0,i)+fixture+html.slice(i);
  }
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
}).listen(port,'127.0.0.1',()=>console.log('Journey QA '+port));
