/* School Adventure 50.7.8: draggable and self-positioning foreground Merlin.
 * Keeps the existing SDMerlin56 voice/lesson engine, saved profiles and navigation intact.
 */
(()=>{'use strict';
function init(){
 const guide=document.getElementById('sd54-merlin');
 const existing=guide?.querySelector('img');
 const help=document.getElementById('sd55-help');
 const modal=document.getElementById('sd55-modal');
 if(!guide||!existing||!help||!modal)return;
 if(guide.classList.contains('sd578-stage'))return;
 guide.classList.add('sd578-stage');help.classList.add('sd578-follow');
 modal.classList.add('sd578-lesson-stage');modal.setAttribute('aria-modal','true');
 const hero=modal.querySelector('.sd55-sheet>img');
 if(hero){hero.src='./assets/merlin/merlin-lucerna-5070.webp';hero.alt='Moudrý Merlin přichází do popředí a vysvětluje látku';hero.addEventListener('error',()=>{hero.src='./assets/merlin/merlin-celni-5070.png'}, {once:true})}
 // Cloning clears the original click listeners, which would open help after a drag.
 const img=existing.cloneNode(true);existing.replaceWith(img);
 img.src=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'./assets/merlin/merlin-celni-5070.png':'./assets/merlin/merlin-lucerna-5070.webp';
 img.alt='Moudrý Merlin. Klepni pro nápovědu nebo podrž a přesuň prstem.';
 img.setAttribute('role','button');img.tabIndex=0;img.title='Klepni pro nápovědu. Podrž a přetáhni prstem na jiné místo.';
 img.draggable=false;
 img.addEventListener('error',()=>{if(!img.src.endsWith('merlin-celni-5070.png'))img.src='./assets/merlin/merlin-celni-5070.png'});
 const KEY='sd-merlin-position-50-7-8';let saved=null;
 try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=1&&v.y>=0&&v.y<=1)saved=v}catch(e){}
 let pos={x:0,y:0},active=null,moved=false,queued=false,lastAuto=0;
 function dims(){return {w:Math.max(300,window.innerWidth),h:Math.max(320,window.innerHeight),gw:guide.offsetWidth||105,gh:guide.offsetHeight||134}}
 function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
 function bounds(){const {w,h,gw,gh}=dims();return {xmax:Math.max(10,w-gw-10),ymax:Math.max(80,h-gh-12),ymin:Math.min(84,Math.max(12,h*.11))}}
 function apply(x,y,immediate=false){const b=bounds();pos.x=clamp(x,10,b.xmax);pos.y=clamp(y,b.ymin,b.ymax);if(immediate)guide.classList.add('sd578-dragging');else guide.classList.remove('sd578-dragging');
  const px=pos.x+'px',py=pos.y+'px';guide.style.setProperty('--sd-merlin-x',px);guide.style.setProperty('--sd-merlin-y',py);
  const {w,h,gw,gh}=dims();const helpSize=44;
  const hx=clamp(pos.x+gw-20,6,w-helpSize-6),hy=clamp(pos.y+gh-31,6,h-helpSize-6);
  help.style.setProperty('--sd-merlin-help-x',hx+'px');help.style.setProperty('--sd-merlin-help-y',hy+'px');
 }
 function store(){const b=bounds();saved={x:(pos.x-10)/Math.max(1,b.xmax-10),y:(pos.y-b.ymin)/Math.max(1,b.ymax-b.ymin)};try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){}}
 function rect(x,y){const {gw,gh}=dims();return {left:x,top:y,right:x+gw,bottom:y+gh,width:gw,height:gh}}
 function intersect(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))}
 function obstacles(){
  const els=document.querySelectorAll('button,a,input,textarea,select,[role="button"],.question,.sd-lesson,.sd52-panel');const out=[];
  const {w,h}=dims();for(const el of els){if(el===img||el===help||guide.contains(el)||modal.contains(el)||el.closest('#authGate,#v24-avatar-dialog'))continue;
   const r=el.getBoundingClientRect();if(r.width<12||r.height<12||r.right<0||r.bottom<0||r.left>w||r.top>h)continue;
   if(!el.getClientRects().length)continue;
   out.push({rect:r,weight:el.matches('button,a,input,textarea,select,[role="button"]')?4:1});
  }return out;
 }
 function score(x,y,obs){const r=rect(x,y),area=r.width*r.height;let cost=0;
  for(const o of obs){const overlap=intersect(r,o.rect);if(overlap)cost+=Math.min(2,overlap/area)*o.weight}
  return cost;
 }
 function choosePosition(){
  if(active||!guide.offsetWidth||!document.getElementById('authGate')?.classList.contains('off')||!modal.hidden)return;
  const {w,h,gw,gh}=dims(),b=bounds(),obs=obstacles(),currentCost=score(pos.x,pos.y,obs);
  // Keep the user's position unless it significantly blocks something usable.
  if(saved && currentCost<.25)return;
  if(!saved && currentCost<.25)return;
  const xs=[10,Math.max(10,w-gw-10)],ys=[b.ymin,Math.max(b.ymin,h*.42-gh*.5),Math.max(b.ymin,h*.72-gh*.5),b.ymax];
  let best={x:pos.x,y:pos.y,cost:currentCost};
  for(const x of xs)for(const y of ys){let cost=score(x,y,obs);cost+=(Math.abs(x-pos.x)+Math.abs(y-pos.y))/Math.max(w,h)*.08;
   if(cost<best.cost){best={x,y,cost}}}
  if(best.cost+.12<currentCost){lastAuto=Date.now();apply(best.x,best.y)}
 }
 function schedule(){if(queued||active)return;queued=true;window.requestAnimationFrame(()=>{queued=false;choosePosition()})}
 const b=bounds();if(saved)apply(10+saved.x*(b.xmax-10),b.ymin+saved.y*(b.ymax-b.ymin));
 else apply(b.xmax,Math.max(b.ymin,Math.min(b.ymax,window.innerHeight*.63)),true);
 guide.classList.remove('sd578-dragging');
 img.addEventListener('pointerdown',e=>{if(e.button!==0 && e.pointerType!=='touch')return;
  e.preventDefault();active={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:pos.x,y:pos.y};moved=false;
  try{img.setPointerCapture(e.pointerId)}catch(_){}
 });
 img.addEventListener('pointermove',e=>{if(!active||e.pointerId!==active.id)return;
  const dx=e.clientX-active.sx,dy=e.clientY-active.sy;
  if(Math.hypot(dx,dy)>7)moved=true;
  if(moved)apply(active.x+dx,active.y+dy,true);
 });
 function finish(e){if(!active||e.pointerId!==active.id)return;
  try{if(img.hasPointerCapture(e.pointerId))img.releasePointerCapture(e.pointerId)}catch(_){}
  const wasMoved=moved;active=null;guide.classList.remove('sd578-dragging');
  if(wasMoved){store();moved=false;}else window.SDMerlin56?.help?.();
 }
 img.addEventListener('pointerup',finish);img.addEventListener('pointercancel',e=>{active=null;guide.classList.remove('sd578-dragging')});
 img.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()});
 img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.SDMerlin56?.help?.()}
  if(e.altKey&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const dx=(e.key==='ArrowRight'?16:e.key==='ArrowLeft'?-16:0),dy=(e.key==='ArrowDown'?16:e.key==='ArrowUp'?-16:0);apply(pos.x+dx,pos.y+dy);store()}
 });
 // Existing help action is retained; both tapping Merlin and tapping the yellow '?' enter the stage.
 help.textContent='?';help.title='Merlinova nápověda';help.setAttribute('aria-label','Merlinova nápověda');
 window.addEventListener('resize',()=>{const next=bounds();if(saved){apply(10+saved.x*(next.xmax-10),next.ymin+saved.y*(next.ymax-next.ymin))}else apply(pos.x,pos.y);schedule()},{passive:true});
 window.addEventListener('orientationchange',()=>window.setTimeout(schedule,250),{passive:true});
 window.addEventListener('popstate',()=>window.setTimeout(schedule,100));
 document.addEventListener('sd87-cards-ready',()=>window.setTimeout(schedule,90));
 document.addEventListener('click',()=>window.setTimeout(schedule,140),true);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)window.setTimeout(schedule,150)});
 // Only observe app-screen visibility changes; do not watch animated SVG layers.
 const screenIds=['homeScreen','mathScreen','czechScreen','englishScreen','sd52','sdCurriculum','v496TopicPanel','sdCzechHub5074','subjectHub','advSubjectMenu'];
 const mo=new MutationObserver(()=>schedule());
 for(const id of screenIds){const el=document.getElementById(id);if(el)mo.observe(el,{attributes:true,attributeFilter:['class','hidden'],childList:false})}
 window.setTimeout(schedule,220);
 window.SDMerlinStage578={reposition:schedule,position:()=>({...pos}),isDragging:()=>!!active};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
