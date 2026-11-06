/* Školní dobrodružství 50.7.0: opravené avatary, čelní Merlin, ikony a responzivní karty. */
(()=>{'use strict';
const ROOT='./assets/',AVATAR_KEY='skolni-dobrodruzstvi-v37-avatar',PROFILE_KEY='matematika-karticky-progress-v3-profiles',ACTIVE_KEY='matematika-karticky-progress-v3-active';
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{return {}}};
const avatarUrl=i=>`${ROOT}avatari/avatar-${Math.floor(i/8)+1}-${i%8+1}.webp`;
const groups=['Dobrodruzi','Školáci','Přírodovědci','Fantasy','Se zvířaty'];
const names=[
 ['Dobrodruh Tom','Statečná Ema','Objevitel Adam','Průzkumnice Sofie','Cestovatel Matyáš','Dobrodružka Lucie','Hledač pokladů Filip','Odvážná Klára'],
 ['Šikovný Tomáš','Chytrá Eliška','Veselý Adam','Studijní Nela','Zvídavý Martin','Kreativní Anetka','Počítačový David','Usměvavá Verunka'],
 ['Přírodovědec Jakub','Zooložka Tereza','Biolog Ondra','Botanička Karolína','Cestovatel Petr','Milovnice zvířat Liduška','Pozorovatel Vít','Ekoložka Adéla'],
 ['Kouzelný Armin','Čarodějka Mia','Rytíř Vojta','Princezna Amálie','Elf Samuel','Lesní víla Ema','Drakobijec Lukáš','Kouzelnice Sára'],
 ['Tom a pes','Eliška a kočka','Adam a medvěd','Nela a králík','Matyáš a sova','Lucie a kůň','Filip a drak','Klára a liška']
].flat();
let activeId=null,filter=-1;
const gate=document.getElementById('authGate');
function current(){return activeId||localStorage.getItem(ACTIVE_KEY)||null}
function resolvedId(){const id=current();return id&&gate?.classList.contains('off')?id:null}
function userName(id){return read(PROFILE_KEY)[id]?.name||id}
function selectedIndex(id){if(!id)return null;const all=read(AVATAR_KEY);const val=[all[id],all[userName(id)]].find(x=>Number.isInteger(x)&&x>=0&&x<40);return val===undefined?null:val}
function paint(){const id=resolvedId(),sel=selectedIndex(id);if(sel!==null){const url=`url("${avatarUrl(sel)}")`;document.documentElement.style.setProperty('--v24-hero-art',url);const hero=document.querySelector('#homeScreen .v23-portrait');if(hero)hero.style.setProperty('background-image',url,'important');const pic=document.getElementById('v26-playerpic');if(pic)pic.style.setProperty('background-image',url,'important')}const ps=read(PROFILE_KEY),data=read(AVATAR_KEY);
 document.querySelectorAll('#authUsers .userbtn').forEach(b=>{const name=b.querySelector('strong')?.textContent?.trim()||'';const bid=name.toLowerCase().includes('rodič')?'parent':Object.keys(ps).find(k=>ps[k]?.name===name)||name;const choice=[data[bid],data[name]].find(x=>Number.isInteger(x)&&x>=0&&x<40);if(choice===undefined)return;const url=`url("${avatarUrl(choice)}")`;b.style.setProperty('--v24-avatar',url);b.style.setProperty('--v23-user-img',url);const span=b.querySelector('span');if(span)span.style.setProperty('background-image',url,'important')});
}
const dialog=document.getElementById('v24-avatar-dialog');let grid=document.getElementById('v24-avatar-grid');const opener=document.getElementById('v24-avatar-open');
if(dialog&&grid&&opener){
 // Remove conflicting 24/37/50.x listeners. Preserve the dialog and stored selections.
 const replacement=opener.cloneNode(true);opener.replaceWith(replacement);
 const newGrid=grid.cloneNode(false);grid.replaceWith(newGrid);grid=newGrid;
 const panel=dialog.querySelector('.v24-avatar-panel');let filters=panel.querySelector('#v37-avatar-filters');if(!filters){filters=document.createElement('div');filters.id='v37-avatar-filters';panel.insertBefore(filters,grid)}
 function show(){const id=resolvedId();if(!id)return;const chosen=selectedIndex(id);filters.replaceChildren();[-1,0,1,2,3,4].forEach(g=>{const b=document.createElement('button');b.type='button';b.textContent=g<0?'Všichni (40)':groups[g];b.className=filter===g?'active':'';b.setAttribute('aria-pressed',String(filter===g));b.addEventListener('click',()=>{filter=g;show()});filters.append(b)});grid.replaceChildren();names.forEach((label,i)=>{if(filter>=0&&Math.floor(i/8)!==filter)return;const b=document.createElement('button');b.type='button';b.className='v24-avatar-option'+(chosen===i?' selected':'');b.setAttribute('aria-pressed',String(chosen===i));b.setAttribute('aria-label',label);const img=document.createElement('span');img.className='pic';img.style.backgroundImage=`url("${avatarUrl(i)}")`;const title=document.createElement('span');title.textContent=label;title.className='v37-avatar-name';b.append(img,title);b.addEventListener('click',()=>{const map=read(AVATAR_KEY),who=resolvedId();if(!who)return;map[who]=i;const name=userName(who);if(name)map[name]=i;try{localStorage.setItem(AVATAR_KEY,JSON.stringify(map))}catch{}paint();show()});grid.append(b)})}
 function close(){dialog.classList.remove('open');document.body.classList.remove('sd570-avatar-open');replacement.focus()}
 replacement.addEventListener('click',()=>{if(!resolvedId())return;filter=-1;show();dialog.classList.add('open');document.body.classList.add('sd570-avatar-open')});
 const done=document.getElementById('v24-avatar-close');if(done){const fresh=done.cloneNode(true);done.replaceWith(fresh);fresh.addEventListener('click',close)}
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.classList.contains('open'))close()});
 window.addEventListener('school-account',e=>{activeId=e.detail?.id||null;if(!activeId)close();requestAnimationFrame(paint)});
 window.addEventListener('school-resume-login',()=>requestAnimationFrame(paint));
 paint();
}
// Keep the original listeners on all curriculum buttons. Only move and decorate them.
const sg=document.querySelector('#homeScreen .subject-grid'),extra=document.querySelector('#homeScreen .v23-extra-grid');
if(sg&&extra){[...extra.querySelectorAll('.subject')].forEach(tile=>sg.append(tile))}
function iconSpan(content,isImage=false){const span=document.createElement('span');span.className='sd570-art';span.setAttribute('aria-hidden','true');if(isImage){const im=document.createElement('img');im.src=`${ROOT}ikony/${content}`;im.alt='';span.append(im)}else span.textContent=content;return span}
// Mode cards: preserve their original click handlers and give all subjects the same icons.
const iconMode={teach:'ikona-teach.webp',practice:'ikona-practice.webp',test:'ikona-test.webp',results:'ikona-trophy.webp'};
document.querySelectorAll('#advSubjectMenu [data-adv-mode]').forEach(b=>{const mode=b.dataset.advMode;const art=b.querySelector('.adv-art');if(art&&iconMode[mode]){art.textContent='';const img=document.createElement('img');img.src=ROOT+'ikony/'+iconMode[mode];img.alt='';art.append(img)}});
document.querySelectorAll('#subjectHub [data-hub-mode]').forEach(b=>{const mode=b.dataset.hubMode;const art=b.querySelector('.hub-emoji');if(art&&iconMode[mode]){art.replaceChildren();const img=document.createElement('img');img.src=ROOT+'ikony/'+iconMode[mode];img.alt='';art.append(img)}});
// Czech: style only the top mode selector, not answer buttons.
const czech=document.querySelector('#czechScreen .v29-panel .v29-actions');if(czech){czech.classList.add('sd570-navigation');
 const czArts=['📜','✏️','🏅','🔢','🪶'];[...czech.children].filter(x=>x.tagName==='BUTTON').forEach((b,i)=>{if(!b.querySelector('.sd570-art'))b.prepend(iconSpan(czArts[i]||'📚'))})}
// Math topics are generated by the existing module; emoji in their text are retained.
const topics=document.getElementById('v496Topics');if(topics){[...topics.children].forEach(b=>{if(!b.querySelector('.sd570-art'))b.prepend(iconSpan('📜'))})}
// Vlastivěda topic cards are generated whenever that subject opens.
const units=document.getElementById('vlUnits');if(units){const art=['🗺️','⛰️','🌾','🏰','🌍'];const decorate=()=>{[...units.children].forEach((b,i)=>{if(b.matches('button')&&!b.querySelector('.sd570-art'))b.prepend(iconSpan(art[i]||'📚'))})};new MutationObserver(decorate).observe(units,{childList:true});decorate()}
// Show the chosen, approved front-facing Merlin with a gentle lantern-lift animation.
const front='./assets/merlin/merlin-lucerna-5070.webp';const poster='./assets/merlin/merlin-celni-5070.png';
const merlin=document.querySelector('#sd54-merlin img');if(merlin){merlin.src=window.matchMedia('(prefers-reduced-motion: reduce)').matches?poster:front;merlin.alt='Moudrý Merlin stojí čelem a občas pozvedne lucernu';merlin.loading='eager';merlin.addEventListener('error',()=>{if(!merlin.src.endsWith('merlin-celni-5070.png'))merlin.src=poster})}
const help=document.getElementById('sd55-help');if(help){help.textContent='?';help.title='Merlinova nápověda';help.setAttribute('aria-label','Merlinova nápověda')}
// A public, read-only version signal for debugging without changing progress keys.
window.SDVersion='50.7.0';
})();
