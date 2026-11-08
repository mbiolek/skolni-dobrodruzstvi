/* Ensure the live SVG label always FITS on its painted plaque, at every phone width. */
(()=>{'use strict';
let scheduled=false;
function fit(){
 scheduled=false;
 const titles=document.querySelectorAll('button.sd84-exact-card > .sd87-card-title');
 for(const el of titles){
  if(!el.isConnected||el.clientWidth<15||el.clientHeight<15)continue;
  const width=el.clientWidth, height=el.clientHeight,text=el.textContent.trim();
  if(!text)continue;
  const cardW=el.parentElement.getBoundingClientRect().width;
  let max=Math.min(28,Math.max(13,cardW*.090));
  if(text.length>24)max=Math.min(max,22);
  if(text.length>34)max=Math.min(max,19);
  const range=document.createRange();range.selectNodeContents(el);
  let px=Math.floor(max);
  for(;px>=10;px--){
   el.style.setProperty('--sd810-card-title-size',px+'px');
   const actual=range.getBoundingClientRect();
   if(actual.width<=width-3&&actual.height<=height-3)break;
  }
  el.dataset.sd810Fitted='true';
 }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>requestAnimationFrame(fit))}
function init(){
 schedule();window.addEventListener('resize',schedule,{passive:true});
 document.addEventListener('sd87-cards-ready',schedule);
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd-style-preview',schedule);
 const ob=new MutationObserver(records=>{
  for(const r of records){
   if(r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-card-style'){schedule();return;}
   if(r.type==='childList'&&[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('button.sd84-exact-card,.sd87-card-title')||n.querySelector?.('button.sd84-exact-card,.sd87-card-title')))){schedule();return;}
  }
 });
 ob.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-card-style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
