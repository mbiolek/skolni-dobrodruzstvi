/* 50.8.12 — use actual img nodes rather than CSS pseudo backgrounds. */
(()=>{'use strict';
const THEMES={
 glass:'hrad',stone:'hradni-styl',parchment:'skola',guild:'priroda',adventure:'hrad'
};
const KINDS=['math','english','czech','nature','history','music'];
let queued=false;
const assetURL=(theme,kind)=>new URL('./assets/ikony/'+THEMES[theme]+'-'+kind+'.webp',document.baseURI).href;
function ensureHome(){
 const th=THEMES[document.body.dataset.cardStyle]?document.body.dataset.cardStyle:'adventure';
 document.querySelectorAll('#homeScreen .subject').forEach(tile=>{
  const kind=KINDS.find(k=>tile.classList.contains(k));if(!kind)return;
  let img=tile.querySelector(':scope > img.sd812-home-art');
  if(!img){img=document.createElement('img');img.className='sd812-home-art';img.alt='';img.draggable=false;img.decoding='async';img.setAttribute('aria-hidden','true');tile.insertBefore(img,tile.firstChild)}
  const next=assetURL(th,kind);if(img.src!==next)img.src=next;
  // One visible title only: the original <strong> remains the accessible label.
  tile.setAttribute('data-sd812-theme',th);
 });
}
function fitTitles(){
 for(const title of document.querySelectorAll('button.sd84-exact-card > .sd87-card-title')){
  if(!title.isConnected||!title.offsetParent)continue;
  const card=title.closest('button.sd84-exact-card');if(!card)continue;
  const cardWidth=card.getBoundingClientRect().width;
  if(cardWidth<30)continue;
  const bounds=title.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(title);
  // Leave a little additional air around the lettering and the plaque's ornate rim.
  const maxWidth=bounds.width-12, maxHeight=bounds.height-7;
  const max=Math.min(22,Math.max(12,Math.floor(cardWidth*.094)));
  let size=10;
  for(let px=max;px>=10;px--){
   title.style.setProperty('--sd812-title-size',px+'px');
   const measured=range.getBoundingClientRect();
   if(measured.width<=maxWidth && measured.height<=maxHeight){size=px;break}
  }
  title.style.setProperty('--sd812-title-size',size+'px');
  title.dataset.sd812Fitted='1';
 }
}
function apply(){queued=false;ensureHome();fitTitles()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(apply))}
function init(){
 schedule();window.addEventListener('resize',schedule,{passive:true});
 for(const eventName of ['sd87-cards-ready','sd-card-style-change','sd-style-preview','sd88-wallpaper-changed'])document.addEventListener(eventName,schedule);
 const o=new MutationObserver(changes=>{
  for(const m of changes){
   if(m.type==='attributes'&&m.target===document.body&&m.attributeName==='data-card-style'){schedule();return}
   if(m.type==='childList'&&[...m.addedNodes].some(n=>n.nodeType===1&&
     (n.matches?.('#homeScreen,.subject,button.sd84-exact-card,.sd87-card-title')||n.querySelector?.('#homeScreen .subject,button.sd84-exact-card,.sd87-card-title')))){schedule();return}
  }
 });
 o.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-card-style']});
 if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
 window.SDCardLayout50812=Object.freeze({version:'50.8.12',refresh:schedule});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
