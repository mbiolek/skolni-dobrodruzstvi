/* Measured startup progress: DOM and four actual visual assets. Update downloads
   remain in the service-worker meter and are NOT conflated with startup. */
(()=>{'use strict';
function init(){const root=document.getElementById('sd88boot');if(!root)return;
 const fill=root.querySelector('.sd88-meter>span'),status=root.querySelector('.sd88-meter-text');
 const choice=window.SDEnvironment5088?.wallpaper?.()||'noc3';
 const backgrounds={hrad:'hrad.webp',priroda:'priroda.webp',skola:'skola.webp',hradni:'hradni-styl.webp',noc1:'hrad-noc-1-5084.webp',noc2:'hrad-noc-2-5084.webp',noc3:'hrad-noc-3-5084.webp'};
 const theme=document.body.dataset.cardStyle||'guild';
 const paths=[`./assets/pozadi/${backgrounds[choice]||backgrounds.noc3}`,'./assets/merlin/merlin-lucerna-5070.webp',`./assets/ui-exact-50-8-4/${theme==='adventure'?'guild':theme}/vyuka.png`,'./assets/ikony/hradni-styl-math.webp'];
 let completed=0,failures=0;const total=paths.length+1;
 function increment(){completed++;const pct=Math.round(completed*100/total);
  fill.style.width=pct+'%';root.querySelector('.sd88-meter').setAttribute('aria-valuenow',pct);
  status.textContent=`Načítání: ${pct} % · ${completed} z ${total} částí`;
  if(completed===total){root.querySelector('p').textContent=failures?'Spuštěno v dostupném režimu':'Dobrodružství je připravené';
   setTimeout(()=>{root.classList.add('sd88-complete');setTimeout(()=>root.remove(),470)},180)}
 }
 increment();
 Promise.allSettled(paths.map(src=>new Promise(resolve=>{const img=new Image();img.onload=()=>{increment();resolve()};img.onerror=()=>{failures++;increment();resolve()};img.src=src}))).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
