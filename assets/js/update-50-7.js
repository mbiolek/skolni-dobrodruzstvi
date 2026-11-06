/* Školní dobrodružství 50.7.0: opravené avatary, čelní Merlin, ikony a responzivní karty. */
(()=>{'use strict';
const ROOT='./assets/',AVATAR_KEY='skolni-dobrodruzstvi-v37-avatar',PROFILE_KEY='matematika-karticky-progress-v3-profiles',ACTIVE_KEY='matematika-karticky-progress-v3-active',PARENT_KEY='sd-parent-merlin-choice';
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{return {}}};
const avatarUrl=i=>`${ROOT}avatari/avatar-${Math.floor(i/8)+1}-${i%8+1}.webp`;
const parentOptions=[
 {id:'blue',name:'Merlin s lucernou',url:'./assets/merlin/avatar-parent-blue.gif'},
 {id:'purple',name:'Moudrý Merlin',url:'./assets/merlin/avatar-parent-purple.png'}
];
const parentSelected=()=>{try{return localStorage.getItem(PARENT_KEY)==='purple'?'purple':'blue'}catch{return 'blue'}};
const parentURL=()=>parentOptions.find(o=>o.id===parentSelected()).url;

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
function paint(){
 const id=resolvedId(),sel=id==='parent'?null:selectedIndex(id);
 const img=id==='parent'?parentURL():sel!==null?avatarUrl(sel):null;
 if(img){const url=`url("${img}")`;document.documentElement.style.setProperty('--v24-hero-art',url);
  const hero=document.querySelector('#homeScreen .v23-portrait');if(hero)hero.style.setProperty('background-image',url,'important');
  const pic=document.getElementById('v26-playerpic');if(pic)pic.style.setProperty('background-image',url,'important')}
 const ps=read(PROFILE_KEY),data=read(AVATAR_KEY);
 document.querySelectorAll('#authUsers .userbtn').forEach(b=>{
  const name=b.querySelector('strong')?.textContent?.trim()||'';
  const isParent=name.toLowerCase().includes('rodič');
  const bid=isParent?'parent':Object.keys(ps).find(k=>ps[k]?.name===name)||name;
  const choice=[data[bid],data[name]].find(x=>Number.isInteger(x)&&x>=0&&x<40);
  if(!isParent&&choice===undefined)return;
  const image=isParent?parentURL():avatarUrl(choice);const url=`url("${image}")`;
  b.style.setProperty('--v24-avatar',url);b.style.setProperty('--v23-user-img',url);
  const span=b.querySelector('span');if(span){span.style.setProperty('background-image',url,'important');
   if(isParent){span.textContent='';span.classList.add('sd-parent-thumb')}}
 });
}
const dialog=document.getElementById('v24-avatar-dialog');let grid=document.getElementById('v24-avatar-grid');const opener=document.getElementById('v24-avatar-open');
if(dialog&&grid&&opener){
 // Remove conflicting 24/37/50.x listeners. Preserve the dialog and stored selections.
 const replacement=opener.cloneNode(true);opener.replaceWith(replacement);
 const newGrid=grid.cloneNode(false);grid.replaceWith(newGrid);grid=newGrid;
 const panel=dialog.querySelector('.v24-avatar-panel');let filters=panel.querySelector('#v37-avatar-filters');if(!filters){filters=document.createElement('div');filters.id='v37-avatar-filters';panel.insertBefore(filters,grid)}
 function show(){
  const id=resolvedId();if(!id)return;
  grid.replaceChildren();filters.replaceChildren();
  const parent=id==='parent';
  filters.hidden=parent;
  dialog.classList.toggle('sd-parent-select',parent);
  if(parent){
   const chosen=parentSelected();
   parentOptions.forEach(item=>{
    const b=document.createElement('button');b.type='button';
    b.className='v24-avatar-option sd-parent-avatar'+(chosen===item.id?' selected':'');
    b.setAttribute('aria-pressed',String(chosen===item.id));b.setAttribute('aria-label',item.name);
    const pic=document.createElement('span');pic.className='pic';pic.style.backgroundImage=`url("${item.url}")`;
    const name=document.createElement('span');name.className='v37-avatar-name';name.textContent=item.name;
    b.append(pic,name);b.addEventListener('click',()=>{
     localStorage.setItem(PARENT_KEY,item.id);paint();show();
    });grid.append(b);
   });return;
  }
  const chosen=selectedIndex(id);
  [-1,0,1,2,3,4].forEach(g=>{const b=document.createElement('button');b.type='button';
   b.textContent=g<0?'Všichni (40)':groups[g];b.className=filter===g?'active':'';
   b.setAttribute('aria-pressed',String(filter===g));b.addEventListener('click',()=>{filter=g;show()});filters.append(b)});
  names.forEach((label,i)=>{if(filter>=0&&Math.floor(i/8)!==filter)return;
   const b=document.createElement('button');b.type='button';b.className='v24-avatar-option'+(chosen===i?' selected':'');
   b.setAttribute('aria-pressed',String(chosen===i));b.setAttribute('aria-label',label);
   const img=document.createElement('span');img.className='pic';img.style.backgroundImage=`url("${avatarUrl(i)}")`;
   const title=document.createElement('span');title.textContent=label;title.className='v37-avatar-name';b.append(img,title);
   b.addEventListener('click',()=>{const map=read(AVATAR_KEY),who=resolvedId();if(!who||who==='parent')return;
    map[who]=i;const name=userName(who);if(name)map[name]=i;
    localStorage.setItem(AVATAR_KEY,JSON.stringify(map));paint();show()});grid.append(b)});
 }
 function close(){dialog.classList.remove('open');document.body.classList.remove('sd570-avatar-open');replacement.focus()}
 replacement.addEventListener('click',()=>{if(!resolvedId())return;filter=-1;show();dialog.classList.add('open');document.body.classList.add('sd570-avatar-open')});
 const done=document.getElementById('v24-avatar-close');if(done){const fresh=done.cloneNode(true);done.replaceWith(fresh);fresh.addEventListener('click',close)}
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.classList.contains('open'))close()});
 window.addEventListener('school-account',e=>{activeId=e.detail?.id||null;if(!activeId)close();requestAnimationFrame(paint)});
 window.addEventListener('school-resume-login',()=>requestAnimationFrame(paint));
 const users=document.getElementById('authUsers');if(users)new MutationObserver(()=>requestAnimationFrame(paint)).observe(users,{childList:true});
 paint();
}
// Keep the original listeners on all curriculum buttons. Only move and decorate them.
const sg=document.querySelector('#homeScreen .subject-grid'),extra=document.querySelector('#homeScreen .v23-extra-grid');
if(sg&&extra){[...extra.querySelectorAll('.subject')].forEach(tile=>sg.append(tile))}
// Show the chosen, approved front-facing Merlin with a gentle lantern-lift animation.
const front='./assets/merlin/merlin-lucerna-5070.webp';const poster='./assets/merlin/merlin-celni-5070.png';
const merlin=document.querySelector('#sd54-merlin img');if(merlin){merlin.src=window.matchMedia('(prefers-reduced-motion: reduce)').matches?poster:front;merlin.alt='Moudrý Merlin stojí čelem a občas pozvedne lucernu';merlin.loading='eager';merlin.addEventListener('error',()=>{if(!merlin.src.endsWith('merlin-celni-5070.png'))merlin.src=poster})}
const help=document.getElementById('sd55-help');if(help){help.textContent='?';help.title='Merlinova nápověda';help.setAttribute('aria-label','Merlinova nápověda')}
// Version state is published centrally by ui-cards.js.
})();
