/* 46.7 – pinch zoom, pan and accessible map controls; extends existing 46.2 map */
(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
#map462 .map466-viewport{overflow:hidden;position:relative;touch-action:none;overscroll-behavior:contain;border-radius:14px;background:#e5f1fa;min-height:180px}
#map462 .map466-content{position:relative;transform-origin:0 0;will-change:transform;width:100%}
#map462 .map466-content img{width:100%;height:auto;display:block;user-select:none;-webkit-user-drag:none}
#map462 .map466-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}
#map462 .map466-controls button{min-width:44px;min-height:44px}
#map462 .map466-scale{font-weight:700;min-width:50px;text-align:center}
#map462 .map462view{overflow:visible!important;touch-action:auto!important}
#map462 .map462board{width:100%;min-width:0!important}
#map462 .map462board svg{width:100%;height:100%}
#map462 .map466-viewport .map462board circle{touch-action:none}
`;document.head.append(css);
function init(){const panel=document.getElementById('map462');if(!panel)return;
const containers=[panel.querySelector('.map464reference'),panel.querySelector('.map462view')].filter(Boolean);
for(const container of containers){
 const content=container.firstElementChild?.classList.contains('map462board')?container.firstElementChild:null;
 let layer=content;
 if(!layer){layer=document.createElement('div');layer.className='map466-content';while(container.firstChild)layer.appendChild(container.firstChild);container.appendChild(layer)}else layer.classList.add('map466-content');
 container.classList.add('map466-viewport');
 const controls=document.createElement('div');controls.className='map466-controls';controls.innerHTML='<button type="button" aria-label="Přiblížit mapu">＋</button><span class="map466-scale">100 %</span><button type="button" aria-label="Oddálit mapu">−</button><button type="button">Celá mapa</button>';
 container.before(controls);
 let scale=1,x=0,y=0;const pointers=new Map();let startDist=0,startScale=1,startX=0,startY=0,startMid={x:0,y:0},moved=false;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const bounds=()=>{const w=container.clientWidth||320;const img=layer.querySelector('img');const ratio=img?.naturalWidth&&img?.naturalHeight?img.naturalHeight/img.naturalWidth:618/1050;return {w,h:Math.max(150,w*ratio)};};
 function render(){const b=bounds();x=clamp(x,Math.min(0,b.w-b.w*scale),0);y=clamp(y,Math.min(0,b.h-b.h*scale),0);layer.style.transform=`translate(${x}px,${y}px) scale(${scale})`;container.style.height=(b.h||250)+'px';controls.querySelector('.map466-scale').textContent=Math.round(scale*100)+' %'}
 function zoom(next,atX=container.clientWidth/2,atY=container.clientHeight/2){const old=scale;scale=clamp(next,1,5);x=atX-(atX-x)*scale/old;y=atY-(atY-y)*scale/old;render()}
 controls.children[0].onclick=()=>zoom(scale*1.4);controls.children[2].onclick=()=>zoom(scale/1.4);controls.children[3].onclick=()=>{scale=1;x=y=0;render()};
 const pos=e=>{const r=container.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 container.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;container.setPointerCapture(e.pointerId);pointers.set(e.pointerId,pos(e));moved=false;if(pointers.size===2){const a=[...pointers.values()];startDist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);startScale=scale;startX=x;startY=y;startMid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}}});
 container.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId),p=pos(e);pointers.set(e.pointerId,p);if(pointers.size===2){const a=[...pointers.values()],dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),mid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};if(startDist>0){scale=clamp(startScale*dist/startDist,1,5);x=mid.x-(startMid.x-startX)*scale/startScale;y=mid.y-(startMid.y-startY)*scale/startScale;render()}moved=true}else if(scale>1){x+=p.x-old.x;y+=p.y-old.y;render();if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved=true}});
 const end=e=>{pointers.delete(e.pointerId);if(pointers.size===1){const p=[...pointers.values()][0];startX=x;startY=y;startMid=p}if(!pointers.size)startDist=0};container.addEventListener('pointerup',end);container.addEventListener('pointercancel',end);
 container.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
 container.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();const p=pos(e);zoom(scale*(e.deltaY>0?.9:1.1),p.x,p.y)}},{passive:false});
 const observer=new ResizeObserver(()=>{if(container.clientWidth>0)requestAnimationFrame(render)});observer.observe(panel);const img=layer.querySelector('img');if(img){img.addEventListener('load',render);img.draggable=false}const showObserver=new MutationObserver(()=>{if(!container.hidden&&!panel.hidden)requestAnimationFrame(render)});showObserver.observe(container,{attributes:true,attributeFilter:['hidden']});showObserver.observe(panel,{attributes:true,attributeFilter:['hidden']});render();
 }
 // Practice with the supplied regional map, rather than a fictional relief for regions.
 const regions=document.getElementById('map462regions');if(regions){regions.setAttribute('opacity','0');}
 const toggle=panel.querySelector('#map464toggle');if(toggle)toggle.addEventListener('click',()=>setTimeout(()=>window.dispatchEvent(new Event('resize')),0));
 // Diagnostic marker without personal information.
 try{const key='school-diagnostics-v456',logs=JSON.parse(localStorage.getItem(key)||'[]');logs.push({time:new Date().toISOString(),type:'map-46.7',detail:'interactive zoom initialized'});localStorage.setItem(key,JSON.stringify(logs.slice(-300)))}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();
