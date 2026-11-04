(()=>{
const avatarNames=[["Dobrodruh Tom", "Statečná Ema", "Objevitel Adam", "Průzkumnice Sofie", "Cestovatel Matyáš", "Dobrodružka Lucie", "Hledač pokladů Filip", "Odvážná Klára"], ["Šikovný Tomáš", "Chytrá Eliška", "Veselý Adam", "Studijní Nela", "Zvídavý Martin", "Kreativní Anetka", "Počítačový David", "Usměvavá Verunka"], ["Přírodovědec Jakub", "Zooložka Tereza", "Biolog Ondra", "Botanička Karolína", "Cestovatel Petr", "Milovnice zvířat Liduška", "Pozorovatel Vít", "Ekoložka Adéla"], ["Kouzelný Armin", "Čarodějka Mia", "Rytíř Vojta", "Princezna Amálie", "Elf Samuel", "Lesní víla Ema", "Drakobijec Lukáš", "Kouzelnice Sára"], ["Tom a pes", "Eliška a kočka", "Adam a medvěd", "Nela a králík", "Matyáš a sova", "Lucie a kůň", "Filip a drak", "Klára a liška"]];
const groups=['🧭 Dobrodruzi','🎓 Školáci','🌿 Přírodovědci','🪄 Fantasy','🐾 S mazlíčkem'];
const images=avatarNames.flatMap((row,r)=>row.map((name,c)=>({name,group:r,url:`./assets/avatari/avatar-${r+1}-${c+1}.webp`})));
const KEY='skolni-dobrodruzstvi-v37-avatar';let activeId=null,filter=-1;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function save(data){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
function getProfileId(name){try{const ps=JSON.parse(localStorage.getItem('matematika-karticky-progress-v3-profiles')||'{}');return Object.keys(ps).find(k=>ps[k]?.name===name)||name}catch(e){return name}}
function paint(){const selected=load();document.querySelectorAll('#authUsers .userbtn').forEach(b=>{const name=b.querySelector('strong')?.textContent||'';if(name.toLowerCase().includes('rodič'))return;const id=getProfileId(name);const index=selected[id];if(Number.isInteger(index)&&images[index]){b.style.setProperty('--v24-avatar',`url("${images[index].url}")`);b.style.setProperty('--v23-user-img',`url("${images[index].url}")`)}});if(activeId){const i=selected[activeId];if(Number.isInteger(i)&&images[i])document.documentElement.style.setProperty('--v24-hero-art',`url("${images[i].url}")`)}}
const dialog=document.getElementById('v24-avatar-dialog'),grid=document.getElementById('v24-avatar-grid'),panel=dialog?.querySelector('.v24-avatar-panel');
if(!dialog||!grid||!panel)return;
const filters=document.createElement('div');filters.id='v37-avatar-filters';panel.insertBefore(filters,grid);
function draw(){filters.replaceChildren();[-1,0,1,2,3,4].forEach(g=>{const b=document.createElement('button');b.type='button';b.textContent=g===-1?'Všichni (40)':groups[g];b.className=g===filter?'active':'';b.onclick=()=>{filter=g;draw()};filters.append(b)});grid.replaceChildren();const selected=load()[activeId];images.forEach((item,i)=>{if(filter!==-1&&item.group!==filter)return;const b=document.createElement('button');b.type='button';b.className='v24-avatar-option'+(selected===i?' selected':'');const pic=document.createElement('span');pic.className='pic';pic.style.backgroundImage=`url("${item.url}")`;const t=document.createElement('span');t.className='v37-avatar-name';t.textContent=item.name;b.append(pic,t);b.onclick=()=>{const data=load();data[activeId]=i;save(data);paint();draw()};grid.append(b)})}
const open=document.getElementById('v24-avatar-open');open.onclick=()=>{if(!activeId)return;draw();dialog.classList.add('open')};
window.addEventListener('school-account',e=>{activeId=e.detail?.id&&e.detail.id!=='parent'?e.detail.id:null;setTimeout(paint,0)});
const users=document.getElementById('authUsers');if(users)new MutationObserver(()=>setTimeout(paint,0)).observe(users,{childList:true});
window.addEventListener('pageshow',()=>setTimeout(paint,0));
window.addEventListener('school-resume-login',()=>setTimeout(paint,0));
paint();
const splash=document.createElement('div');splash.id='v37-splash';splash.innerHTML='<div class="v37-splash-img" aria-hidden="true"></div><div class="v37-splash-title">Školní dobrodružství</div><div class="v37-splash-caption">Otevíráme truhlu poznání…</div>';document.body.append(splash);
setTimeout(()=>{splash.classList.add('v37-hide');setTimeout(()=>splash.remove(),500)},1800);
const hero=document.querySelector('#homeScreen .home-hero h1');if(hero)hero.textContent='🧰 Školní dobrodružství';
})();
