/* 50.8.11 – bind HOME art to the button style and measure live label sizes. */
(()=>{'use strict';
const types=['math','english','czech','nature','history','music'];
const themes={
 glass:'hrad',stone:'hradni-styl',parchment:'hradni-styl',
 guild:'hradni-styl',adventure:'hrad'
};
let scheduled=false;
function styleHome(){
 const th=document.body.dataset.cardStyle||'guild';const prefix=themes[th]||themes.guild;
 for(const type of types){
  for(const el of document.querySelectorAll('#homeScreen .subject.'+type)){
   const art=`url("./assets/ikony/${prefix}-${type}.webp")`;
   // Setting one inline custom property bypasses the obsolete a–d wallpaper mapping.
   if(el.style.getPropertyValue('--sd811-tile-image')!==art)
    el.style.setProperty('--sd811-tile-image',art);
  }
 }
}
function labelFit(){
 const labels=document.querySelectorAll('button.sd84-exact-card > .sd87-card-title');
 for(const label of labels){
  if(!label.isConnected||!label.offsetParent)continue;
  const box=label.getBoundingClientRect();
  if(box.width<20||box.height<12)continue;
  const card=label.closest('button.sd84-exact-card');
  const txt=label.textContent?.trim()||'';if(!txt)continue;
  const r=document.createRange();r.selectNodeContents(label);
  const usableW=box.width-7,usableH=box.height-4;
  const max=Math.min(25,Math.max(14,card.getBoundingClientRect().width*.115));
  let good=10;
  for(let size=Math.floor(max);size>=10;size--){
   label.style.setProperty('--sd811-font-size',size+'px');
   const measured=r.getBoundingClientRect();
   if(measured.width<=usableW+0.5&&measured.height<=usableH+0.5){good=size;break}
  }
  label.style.setProperty('--sd811-font-size',good+'px');
  label.dataset.sd811Fitted='1';
 }
}
function paint(){scheduled=false;styleHome();labelFit()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>requestAnimationFrame(paint))}
function init(){
 schedule();
 addEventListener('resize',schedule,{passive:true});
 document.addEventListener('sd87-cards-ready',schedule);
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd-style-preview',schedule);
 document.addEventListener('sd88-wallpaper-changed',schedule);
 const observer=new MutationObserver(changes=>{
  for(const m of changes){
   if(m.type==='attributes'&&m.target===document.body&&m.attributeName==='data-card-style'){schedule();return}
   if(m.type==='childList'&&Array.from(m.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('button.sd84-exact-card,#homeScreen,.sd87-card-title,.subject')||n.querySelector?.('button.sd84-exact-card,.sd87-card-title,.subject')))){schedule();return}
  }
 });
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-card-style']});
 if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
 window.SDCardLayout50811=Object.freeze({refresh:schedule,version:'50.8.11'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
