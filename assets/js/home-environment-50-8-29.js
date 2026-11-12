/* Školní dobrodružství 50.8.29 – jediný aktivní renderer úvodních karet.
 * Navazuje na data-card-style a data-wallpaper. Výsledky/profily nemění. */
(()=>{'use strict';
 const STYLES=new Set(['glass','stone','parchment','guild','adventure']);
 const DATA={math:['matematika','Matematika'],english:['anglictina','Angličtina'],czech:['cestina','Čeština'],nature:['prirodopis','Přírodopis'],history:['vlastiveda','Vlastivěda'],music:['hudebni-vychova','Hudební výchova']};
 const SELECTOR='#homeScreen .subject-grid .subject,#homeScreen .v23-extra-grid .subject';
 const WALLPAPERS={hrad:'hrad.webp',priroda:'priroda.webp',skola:'skola.webp',hradni:'hradni-styl.webp',noc1:'hrad-noc-1-5084.webp',noc2:'hrad-noc-2-5084.webp',noc3:'hrad-noc-3-5084.webp'};
 function style(){const s=document.body.dataset.cardStyle;return STYLES.has(s)?s:'guild'}
 function syncWallpaper(){
  // Respect the existing independent wallpaper picker and its persistent selection.
  let w=document.body.dataset.wallpaper;
  if(!WALLPAPERS[w])return;
  const src=new URL('./assets/pozadi/'+WALLPAPERS[w],document.baseURI).href;
  const value=`url("${src}")`;
  if(document.body.style.getPropertyValue('--sd88-scene')!==value)
   document.body.style.setProperty('--sd88-scene',value);
 }
 function syncCards(){
  const s=style();
  document.querySelectorAll(SELECTOR).forEach(card=>{
   const found=Object.keys(DATA).find(k=>card.classList.contains(k));if(!found)return;
   const [slug,title]=DATA[found];
   card.classList.add('sd821-card','sd829-card');
   // Older versions created three other image layers for the same tile.
   card.querySelectorAll(':scope > img.sd815-home-art,:scope > img.sd816-home-art,:scope > img.sd817-home-art,:scope > .sd817-photo-title').forEach(el=>el.remove());
   card.classList.remove('sd815-art-card','sd816-painted-card','sd817-themed','sd817-image-mode','sd817-photo-mode');
   let visual=card.querySelector(':scope > .sd821-visual');
   if(!visual){visual=document.createElement('span');visual.className='sd821-visual';visual.setAttribute('aria-hidden','true');card.prepend(visual)}
   let img=visual.querySelector('img');
   if(!img){img=document.createElement('img');visual.replaceChildren(img)}
   const src=`./assets/ikony/home-50-8-21/${s}-${slug}.webp`;
   if(img.getAttribute('src')!==src){img.setAttribute('src',src)}
   img.alt='';img.decoding='async';img.draggable=false;
   let label=card.querySelector(':scope > .sd821-label');
   if(!label){label=document.createElement('span');label.className='sd821-label';label.setAttribute('aria-hidden','true');visual.after(label)}
   if(label.textContent!==title)label.textContent=title;
   card.dataset.sd829Style=s;
  });
 }
 let queued=false;
 function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncWallpaper();syncCards()})}
 function boot(){
  refresh();
  document.addEventListener('sd-card-style-change',refresh);
  document.addEventListener('sd-style-preview',refresh);
  document.addEventListener('sd88-wallpaper-changed',refresh);
  window.addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  // Only watch the two settings; avoid observing our own image/text changes.
  new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'))refresh()}).observe(document.body,{attributes:true,attributeFilter:['data-card-style','data-wallpaper']});
  const home=document.getElementById('homeScreen');
  if(home)new MutationObserver(ms=>{
   if(ms.some(m=>m.addedNodes && [...m.addedNodes].some(n=>n.nodeType===1 && (n.matches?.('.subject,.subject-grid,.v23-extra-grid')||n.querySelector?.('.subject')))))refresh();
  }).observe(home,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.SDHomeEnvironment50829=Object.freeze({refresh,version:'50.8.29'});
})();
