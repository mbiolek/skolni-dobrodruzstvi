/* Školní dobrodružství 46.8 – vektorový atlas ve Vlastivědě */
(()=>{'use strict';
const maps=[['Pohoří a reliéf','01_releif.html'],['Řeky','02_reky.html'],['Kraje – barevné','03_kraje_barevne.html'],['Kraje – zlaté','04_kraje_zlata.html']];
const css=document.createElement('style');css.textContent=`
#map462[hidden]{display:none!important}#map462{padding:14px;background:#eaf4fa;border-radius:20px;color:#193955;margin:12px 0;max-width:100%;box-sizing:border-box}
#map462 .atlas-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}
#map462 button{border:1px solid #83a7bf;background:#fff;border-radius:12px;padding:12px 8px;color:#193955;font-weight:700;min-height:48px}
#map462 button.active{background:#c3e7fc;border-color:#2874a8}
#map462 .atlas-frame{display:block;width:100%;height:min(72vh,750px);min-height:450px;border:1px solid #bad4e4;border-radius:12px;background:#eef2f1}
#map462 .atlas-note{font-size:13px;line-height:1.5;margin:12px 0;color:#405a6c}
#map462 .atlas-close{margin-top:12px;width:100%}
@media(min-width:750px){#map462 .atlas-frame{height:780px}}
`;document.head.append(css);
function init(){const root=document.getElementById('vlastScreen'),units=document.getElementById('vlUnits');if(!root||!units||document.getElementById('map462'))return;
 const panel=document.createElement('section');panel.id='map462';panel.hidden=true;
 const title=document.createElement('h2');title.textContent='Interaktivní vektorové mapy ČR';panel.append(title);
 const hint=document.createElement('p');hint.textContent='Vyber mapu. Přibližuj dvěma prsty nebo tlačítky +/− přímo v mapě. Názvy a procvičování ovládej v mapě.';panel.append(hint);
 const tabs=document.createElement('div');tabs.className='atlas-tabs';panel.append(tabs);
 const frame=document.createElement('iframe');frame.className='atlas-frame';frame.title='Interaktivní vektorová mapa České republiky';frame.loading='eager';panel.append(frame);
 const note=document.createElement('p');note.className='atlas-note';note.textContent='Mapy pocházejí z dodaného vektorového atlasu. Jsou ilustrační a nejsou přesným GIS podkladem. Fungují i offline.';panel.append(note);
 const close=document.createElement('button');close.className='atlas-close';close.textContent='Zpět na témata Vlastivědy';panel.append(close);
 let selected=0;function select(i){selected=i;frame.src='./Interaktivni_mapy_CR/'+maps[i][1];frame.title=maps[i][0];[...tabs.children].forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i))});}
 maps.forEach(([name],i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=()=>select(i);tabs.append(b)});
 function hide(){panel.hidden=true;units.hidden=false;const work=document.getElementById('vlWork');if(work)work.hidden=true;frame.src='about:blank';window.scrollTo(0,0)}
 function open(){const old=document.getElementById('v46map');if(old)old.hidden=true;units.hidden=true;const work=document.getElementById('vlWork');if(work)work.hidden=true;panel.hidden=false;select(selected);window.scrollTo(0,0)}
 close.onclick=hide;
 const tile=units.querySelector('.v461-map-tile');if(tile){const replacement=tile.cloneNode(true);replacement.onclick=open;replacement.innerHTML='<strong>Interaktivní mapy České republiky</strong><small>Pohoří, řeky a kraje · vektorové mapy</small>';tile.replaceWith(replacement)}else{const b=document.createElement('button');b.className='v461-map-tile';b.innerHTML='<strong>Interaktivní mapy České republiky</strong><small>Pohoří, řeky a kraje</small>';b.onclick=open;units.prepend(b)}
 (root.querySelector('main')||root).append(panel);
 const obs=new MutationObserver(()=>{if(!root.classList.contains('visible')&&!panel.hidden)hide()});obs.observe(root,{attributes:true,attributeFilter:['class']});
 document.getElementById('vlBack')?.addEventListener('click',()=>{if(!panel.hidden)hide()},true);
 document.getElementById('vlHome')?.addEventListener('click',()=>{if(!panel.hidden)hide()},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
