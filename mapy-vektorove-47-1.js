/* 47.1: opravené rozložení celoobrazovkového atlasu; zachovává původní vektorové mapy a jejich interakce. */
(()=>{'use strict';
const MAPS=[['Pohoří a reliéf','01_releif.html'],['Řeky','02_reky.html'],['Kraje – barevné','03_kraje_barevne.html'],['Kraje – zlaté','04_kraje_zlata.html']];
const style=document.createElement('style');style.textContent=`
#vlAtlasEntry{display:block;width:100%;margin:14px 0 20px;padding:17px 12px;border:2px solid #83a7bf;border-radius:18px;background:#d7edff;color:#193955;font-size:clamp(16px,4vw,21px);font-weight:800;cursor:pointer;text-align:center;box-sizing:border-box}
#vlAtlasEntry small{display:block;margin-top:5px;font-size:13px;font-weight:500}
#vlAtlasEntry[hidden],#atlas470[hidden]{display:none!important}
#atlas470{position:fixed;inset:0;inset:0 0 0 0;z-index:2147483000;background:#f7faf9;color:#173e45;display:flex;flex-direction:column;overflow:hidden}
#atlas470 .bar{width:100%;height:auto;min-height:0;box-sizing:border-box;display:flex;align-items:center;gap:7px;padding:calc(env(safe-area-inset-top,0px) + 7px) 9px 7px;background:#173e45;color:white;flex:0 0 auto;flex-wrap:wrap}
#atlas470 button,#atlas470 select{border:1px solid #9ab7b5;border-radius:9px;background:white;color:#173e45;font:700 14px system-ui;min-height:40px;padding:7px 10px;touch-action:manipulation}
#atlas470 select{flex:1 1 130px;min-width:100px;max-width:310px}
#atlas470 .close{background:#ffeddd;border-color:#ffcfaa}
#atlas470 .mapbody{flex:1 1 auto;min-height:0;position:relative}
#atlas470 iframe{width:100%;height:100%;display:block;border:0;background:#fff}
#atlas470 .hint{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 9px);left:50%;transform:translateX(-50%);pointer-events:none;background:#173e45d9;color:#fff;border-radius:20px;padding:5px 11px;font:500 12px system-ui;white-space:nowrap;max-width:90%;overflow:hidden;text-overflow:ellipsis}
body.atlas470-open{overflow:hidden!important}
@media(orientation:landscape){#atlas470 .bar{padding:4px 12px;gap:6px}#atlas470 button,#atlas470 select{min-height:34px;padding:4px 9px}#atlas470 .hint{bottom:5px}}
`;document.head.append(style);
function init(){const root=document.getElementById('vlastScreen'),units=document.getElementById('vlUnits'),work=document.getElementById('vlWork');if(!root||!units||!work||document.getElementById('atlas470'))return;
 const entry=document.createElement('button');entry.id='vlAtlasEntry';entry.type='button';entry.innerHTML='🗺️ Otevřít interaktivní mapy na celou obrazovku<small>Pohoří, řeky a kraje · telefon na výšku i na šířku</small>';units.before(entry);
 const overlay=document.createElement('section');overlay.id='atlas470';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Interaktivní mapy České republiky');
 overlay.innerHTML='<div class="bar"><button type="button" class="close" id="atlas470close">✕ Zavřít</button><select id="atlas470select" aria-label="Vyber mapu"></select><button type="button" id="atlas470plus" aria-label="Přiblížit">＋</button><button type="button" id="atlas470minus" aria-label="Oddálit">−</button><button type="button" id="atlas470reset" aria-label="Celá mapa">⟲</button></div><div class="mapbody"><iframe title="Interaktivní mapa České republiky" allowfullscreen></iframe><div class="hint">Přibližuj a posouvej mapu prsty</div></div>';
 document.body.append(overlay);
 const frame=overlay.querySelector('iframe'),select=overlay.querySelector('select');MAPS.forEach(([name],i)=>{const o=document.createElement('option');o.value=i;o.textContent=name;select.append(o)});
 let selected=0,previousFocus=null;
 function showMap(){frame.src='./Interaktivni_mapy_CR/'+MAPS[selected][1]+'?fullscreen=1';frame.title=MAPS[selected][0];select.value=String(selected)}
 function open(){previousFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('atlas470-open');showMap();overlay.querySelector('.close').focus();}
 function close(){overlay.hidden=true;document.body.classList.remove('atlas470-open');frame.removeAttribute('src');if(previousFocus?.isConnected)previousFocus.focus()}
 function mapAction(action){try{const w=frame.contentWindow;if(!w)return;const svg=w.document.querySelector('#geoMap');if(action==='plus')svg?._mapZoom?.(1.3);if(action==='minus')svg?._mapZoom?.(1/1.3);if(action==='reset'){if(typeof w.mapReset==='function')w.mapReset();else svg?._mapReset?.()}}catch(e){console.warn('Atlas 47.1',e)}}
 entry.onclick=open;overlay.querySelector('.close').onclick=close;select.onchange=()=>{selected=Number(select.value);showMap()};overlay.querySelector('#atlas470plus').onclick=()=>mapAction('plus');overlay.querySelector('#atlas470minus').onclick=()=>mapAction('minus');overlay.querySelector('#atlas470reset').onclick=()=>mapAction('reset');
 document.addEventListener('keydown',e=>{if(!overlay.hidden&&e.key==='Escape'){e.preventDefault();close()}});
 function sync(){entry.hidden=!root.classList.contains('visible')||!work.hidden||units.hidden;if(!root.classList.contains('visible')&&!overlay.hidden)close()}
 const obs=new MutationObserver(sync);obs.observe(root,{attributes:true,attributeFilter:['class']});obs.observe(units,{attributes:true,attributeFilter:['hidden']});obs.observe(work,{attributes:true,attributeFilter:['hidden']});sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
