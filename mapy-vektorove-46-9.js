/* Školní dobrodružství 46.9 – trvalý vstup do atlasu, nezávislý na překreslování témat */
(()=>{'use strict';
const MAPS=[['Pohoří a reliéf','01_releif.html'],['Řeky','02_reky.html'],['Kraje – barevné','03_kraje_barevne.html'],['Kraje – zlaté','04_kraje_zlata.html']];
const css=document.createElement('style');css.textContent=`
#vlAtlasEntry{display:block;width:100%;margin:14px 0 20px;padding:17px 12px;border:2px solid #83a7bf;border-radius:18px;background:#d7edff;color:#193955;font-size:clamp(16px,4vw,21px);font-weight:800;cursor:pointer;text-align:center;box-sizing:border-box}
#vlAtlasEntry small{display:block;margin-top:5px;font-size:13px;font-weight:500}
#vlAtlasEntry[hidden],#map469[hidden]{display:none!important}
#map469{padding:15px;background:#eaf4fa;border-radius:20px;color:#193955;margin:12px 0;max-width:100%;box-sizing:border-box}
#map469 .atlas-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}
#map469 button{border:1px solid #83a7bf;background:#fff;border-radius:12px;padding:12px 8px;color:#193955;font-weight:700;min-height:48px}
#map469 button.active{background:#c3e7fc;border-color:#2874a8}
#map469 iframe{display:block;width:100%;height:min(72vh,750px);min-height:450px;border:1px solid #bad4e4;border-radius:12px;background:#eef2f1}
#map469 .atlas-close{width:100%;margin-top:12px}
@media(min-width:750px){#map469 iframe{height:780px}}
`;document.head.append(css);
function init(){const root=document.getElementById('vlastScreen'),units=document.getElementById('vlUnits'),work=document.getElementById('vlWork');if(!root||!units||!work||document.getElementById('map469'))return;
 const main=root.querySelector('main');if(!main)return;
 const entry=document.createElement('button');entry.type='button';entry.id='vlAtlasEntry';entry.innerHTML='🗺️ Interaktivní mapy České republiky<small>Pohoří, řeky a kraje · zvětšování a procvičování</small>';units.before(entry);
 const panel=document.createElement('section');panel.id='map469';panel.hidden=true;panel.innerHTML='<h2>🗺️ Interaktivní mapy ČR</h2><p>Vyber mapu. Přibližuj dvěma prsty nebo tlačítky přímo v mapě.</p>';
 const tabs=document.createElement('div');tabs.className='atlas-tabs';panel.append(tabs);
 const frame=document.createElement('iframe');frame.title='Interaktivní mapa České republiky';frame.loading='eager';panel.append(frame);
 const close=document.createElement('button');close.type='button';close.className='atlas-close';close.textContent='← Zpět na témata Vlastivědy';panel.append(close);main.append(panel);
 let selected=0;
 function select(i){selected=i;frame.src='./Interaktivni_mapy_CR/'+MAPS[i][1];frame.title=MAPS[i][0];[...tabs.children].forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(i===j))})}
 MAPS.forEach(([name],i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=()=>select(i);tabs.append(b)});
 function sync(){const shown=root.classList.contains('visible');if(!shown&&!panel.hidden){panel.hidden=true;frame.removeAttribute('src')}entry.hidden=!shown||!panel.hidden||!work.hidden||units.hidden}
 function hide(){panel.hidden=true;frame.removeAttribute('src');units.hidden=false;work.hidden=true;sync();window.scrollTo(0,0)}
 function open(){document.getElementById('v46map')?.setAttribute('hidden','');units.hidden=true;work.hidden=true;panel.hidden=false;entry.hidden=true;select(selected);window.scrollTo(0,0)}
 entry.onclick=open;close.onclick=hide;
 const observer=new MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['class']});observer.observe(units,{attributes:true,attributeFilter:['hidden']});observer.observe(work,{attributes:true,attributeFilter:['hidden']});
 document.getElementById('vlBack')?.addEventListener('click',()=>{if(!panel.hidden)hide()},true);
 document.getElementById('vlHome')?.addEventListener('click',()=>{if(!panel.hidden){panel.hidden=true;frame.removeAttribute('src')}},true);
 // Překreslování tematických karet nemění samostatné tlačítko atlasu.
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
