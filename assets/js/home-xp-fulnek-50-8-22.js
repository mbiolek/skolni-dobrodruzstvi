/* 50.8.23 — opravené XP a body úspěchu na úvodní stránce + předvyplněný měsíční plán Fulnek. */
(()=>{'use strict';
const DBKEY='sd52_schools_plans_v1';
const ACTIVE='matematika-karticky-progress-v3-active';
const PROFILES='matematika-karticky-progress-v3-profiles';
const FULNEK_ID='zstgm_fulnek_5_2026';
const SEED_KEY='sd50822_fulnek_seed_v1';
const SUBJECTS=['math','czech','english','nature','geography','history','music'];
const HOME_MAP={math:'math',english:'english',czech:'czech',nature:'nature',history:'geography',music:'music'};
const CURR_KEY_PREFIX='sd_curriculum_v501_';
const schoolName='ZŠ T. G. Masaryka Fulnek';

function safeGet(key,fb){try{const v=localStorage.getItem(key);return v==null?fb:v}catch{return fb}}
function safeSet(key,val){try{localStorage.setItem(key,val);return true}catch{return false}}
function jsonGet(key,fb){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fb:v}catch{return fb}}
function jsonSet(key,val){return safeSet(key,JSON.stringify(val))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(x){return String(x||'').toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function activeId(){if(document.body.classList.contains('parent-role'))return 'parent';if(document.body.classList.contains('child-role')){try{return sessionStorage.getItem('skolni-live-v441')||safeGet(ACTIVE,'parent')||'parent'}catch{}}return safeGet(ACTIVE,'parent')||'parent'}
function profiles(){const p=jsonGet(PROFILES,{});return p&&typeof p==='object'?p:{}}
function activeName(){const id=activeId();const p=profiles();return p[id]?.name||p.parent?.name||'zařízení'}

const PLANS={
 czech:{
  0:[
   'Opakování a systematizace učiva 4. ročníku',
   'Stavba slova',
   'Slovotvorný základ, kořen, předpona a přípona',
   'Slova příbuzná a tvary téhož slova',
   'Pravidla třídy a jejich hodnocení',
   'Znamení zvěrokruhu',
   'Staré knihy vyprávějí',
   'Dobrodružná literatura pro děti',
   'Hlavní myšlenka literárního díla',
   'Reprodukce textu',
   'Hlavní hrdina a jeho vlastnosti'
  ],
  2:[
   'Podstatná jména – mluvnické kategorie',
   'Vzory mužského rodu včetně předseda a soudce',
   'Vzory ženského rodu',
   'Vzory středního rodu',
   'Komiks – slohová výchova',
   'Práce se slovníky',
   'Synonyma a antonyma',
   'Bajka',
   'Typické znaky a ponaučení bajky',
   'Poezie J. Seiferta – Maminka'
  ]
 },
 math:{
  0:[
   'Opakování učiva 4. ročníku',
   'Pamětné sčítání a odčítání',
   'Pamětné násobení a dělení',
   'Písemné sčítání a odčítání do milionu',
   'Písemné násobení jednociferným činitelem',
   'Písemné násobení dvojciferným činitelem',
   'Bod, přímka, polopřímka a úsečka',
   'Vzájemná poloha přímek'
  ],
  2:[
   'Přirozená čísla větší než milion',
   'Zápis a porovnávání čísel nad milion',
   'Pamětné početní operace',
   'Písemné sčítání a odčítání',
   'Zaokrouhlování čísel na desítky tisíc, statisíce a miliony',
   'Násobení jednociferným, dvojciferným a trojciferným činitelem',
   'Čtverec a obdélník',
   'Úhlopříčky čtverce a obdélníku',
   'Trojúhelník obecně',
   'Pravoúhlý trojúhelník',
   'Rovnostranný trojúhelník'
  ]
 },
 geography:{
  0:[
   'Česká republika',
   'Hlavní město Praha',
   'Středočeský kraj',
   'Jihočeský kraj',
   'Plzeňský kraj',
   'Práce s mapou'
  ],
  2:[
   'Pardubický kraj',
   'Kraj Vysočina',
   'Jihomoravský kraj',
   'Olomoucký kraj',
   'Kraje ČR a práce s mapou'
  ]
 }
};

const EXTRA_TOPICS={
 czech:[
  ['Synonyma a antonyma','Synonyma jsou slova stejného nebo podobného významu, antonyma mají význam opačný.','Která dvojice jsou antonyma?','malý × velký','dům × příbytek','rychle × svižně','hezký × pěkný'],
  ['Podstatná jména – mluvnické kategorie','U podstatných jmen určujeme rod, číslo a pád. Podle vzoru určujeme správné koncovky.','Kterou mluvnickou kategorii neurčujeme u podstatných jmen?','osobu','rod','číslo','pád'],
  ['Vzory mužského rodu','Rod mužský rozlišujeme na životný a neživotný. Mezi vzory mužského rodu patří pán, hrad, muž, stroj, předseda a soudce.','Který z těchto vzorů patří k mužskému rodu?','předseda','žena','město','kost'],
  ['Bajka','Bajka je krátký příběh, často se zvířaty, který obsahuje ponaučení. Postavy bývají zosobněné.','Co je pro bajku typické?','obsahuje ponaučení','je to jízdní řád','popisuje jen počasí','nemá žádný děj'],
  ['Poezie – J. Seifert: Maminka','Poezie pracuje s verši, rytmem a obrazy. Básně mohou vyjadřovat city a vztahy.','Co je typické pro poezii?','verše','jízdní řád','tabulka násobilky','mapa krajů'],
  ['Dobrodružná literatura pro děti','Dobrodružná literatura bývá napínavá a vystupuje v ní hlavní hrdina, který řeší překážky nebo záhady.','Co bývá typické pro dobrodružnou literaturu?','napínavý děj','jen seznam slov','výpočet příkladů','bez postav'],
  ['Hlavní hrdina a jeho vlastnosti','Hlavní hrdina je postava, kolem které se děj soustředí. Uvádíme jeho vlastnosti a chování.','Co popisujeme u hlavního hrdiny?','vlastnosti a chování','počasí na horách','výšku hory na mapě','výsledek násobení']
 ],
 geography:[
  ['Středočeský kraj','Středočeský kraj obklopuje hlavní město Prahu. Krajským městem je Praha, i když sama tvoří samostatný kraj.','Který kraj obklopuje Prahu?','Středočeský kraj','Jihočeský kraj','Olomoucký kraj','Karlovarský kraj'],
  ['Jihočeský kraj','Jihočeský kraj leží na jihu Čech a jeho krajským městem jsou České Budějovice.','Jaké je krajské město Jihočeského kraje?','České Budějovice','Plzeň','Pardubice','Olomouc'],
  ['Plzeňský kraj','Plzeňský kraj leží na západě Čech a krajským městem je Plzeň.','Jaké je krajské město Plzeňského kraje?','Plzeň','Praha','Brno','Jihlava'],
  ['Pardubický kraj','Pardubický kraj leží ve východních Čechách. Krajským městem jsou Pardubice.','Jaké je krajské město Pardubického kraje?','Pardubice','Olomouc','Jihlava','Brno'],
  ['Kraj Vysočina','Kraj Vysočina má krajské město Jihlavu a leží mezi Čechami a Moravou.','Jaké je krajské město kraje Vysočina?','Jihlava','Brno','Olomouc','Plzeň'],
  ['Jihomoravský kraj','Jihomoravský kraj leží na jihovýchodě Moravy a jeho krajským městem je Brno.','Jaké je krajské město Jihomoravského kraje?','Brno','Olomouc','Praha','Zlín'],
  ['Olomoucký kraj','Olomoucký kraj leží na střední Moravě a krajským městem je Olomouc.','Jaké je krajské město Olomouckého kraje?','Olomouc','Ostrava','Brno','Pardubice'],
  ['Práce s mapou','Na mapě se orientujeme podle legendy, měřítka a světových stran. Sever bývá obvykle nahoře.','K čemu slouží legenda mapy?','vysvětluje značky','měří teplotu','počítá příklady','ukazuje básničku']
 ],
 math:[
  ['Písemné sčítání a odčítání do milionu','Při písemném sčítání a odčítání zapisujeme čísla pod sebe podle řádů a počítáme zprava doleva.','Kolik je 345 200 + 12 300?','357 500','347 500','333 000','365 500'],
  ['Přirozená čísla větší než milion','Čísla větší než milion čteme po trojicích číslic: miliony, tisíce, jednotky.','Kolik je 1 000 000 + 250 000?','1 250 000','1 025 000','12 500 000','1 200 500'],
  ['Zaokrouhlování čísel nad milion','Při zaokrouhlování sledujeme číslici vpravo od místa, na které zaokrouhlujeme.','Na kolik zaokrouhlíme číslo 1 249 999 na miliony?','1 000 000','2 000 000','1 250 000','1 249 000'],
  ['Čtverec a obdélník','Čtverec má všechny strany stejně dlouhé, obdélník má protilehlé strany stejně dlouhé. Oba útvary mají dvě úhlopříčky.','Kolik úhlopříček má obdélník?','2','1','3','4'],
  ['Trojúhelník – druhy','Trojúhelník může být obecný, pravoúhlý nebo rovnostranný. Rovnostranný má všechny strany stejně dlouhé.','Který trojúhelník má všechny strany stejně dlouhé?','rovnostranný','pravoúhlý','obecný','žádný']
 ]
};

function mergeTopics(){
 const data=window.SDCurriculum501?.data;
 if(!data)return;
 for(const [sub,items] of Object.entries(EXTRA_TOPICS)){
  if(!data[sub]||!Array.isArray(data[sub].topics))continue;
  for(const item of items){
   const name=item[0];
   if(!data[sub].topics.some(t=>norm(t[0])===norm(name)))data[sub].topics.push(item);
  }
 }
}

function seedFulnek(){
 const db=jsonGet(DBKEY,{schools:[],assignments:{},plans:{},results:{}});
 db.schools??=[];db.assignments??={};db.plans??={};db.results??={};
 let school=db.schools.find(s=>s.id===FULNEK_ID);
 if(!school){
  school={id:FULNEK_ID,name:schoolName,city:'Fulnek',grade:'5. třída'};
  db.schools.push(school);
 }
 for(const [sub,months] of Object.entries(PLANS)){
  for(const [m,topics] of Object.entries(months)){
   const key=`${FULNEK_ID}|${sub}|${m}`;
   const existing=Array.isArray(db.plans[key])?db.plans[key]:[];
   const merged=[...new Set([...existing,...topics])];
   db.plans[key]=merged;
  }
 }
 const ps=profiles();
 for(const [id,p] of Object.entries(ps)){
  if(id==='parent')continue;
  // Jen nový profil dostane výchozí školu. Nikdy nevracet školu, kterou rodič odebral.
  if(!Array.isArray(db.assignments[id]))db.assignments[id]=[FULNEK_ID];
 }
 jsonSet(DBKEY,db);
 window.SDSchoolPlans52?.reloadDb?.();
 safeSet(SEED_KEY,'done');
}

function pct(n,d){return d?Math.round((n/d)*100):0}
function collectStats(){
 const by={};
 const ensure=sub=>by[sub]??={xp:0,points:0,correct:0,total:0,attempts:0};
 const add=(sub,correct,total,kind='practice')=>{
  const s=ensure(sub);
  correct=Number(correct)||0; total=Number(total)||0;
  s.correct+=correct; s.total+=total; s.attempts++;
  s.xp += correct*10;
  let base=kind==='test'?3:2;
  let scorePct=total?pct(correct,total):0;
  s.points += base + (scorePct>=80?2:0) + (scorePct===100?1:0);
 };

 const db=jsonGet(DBKEY,{}); const id=activeId();
 const results=db?.results||{};
 for(const [k,arr] of Object.entries(results)){
  if(!k.startsWith(id+'|')||!Array.isArray(arr))continue;
  const parts=k.split('|');const sub=parts.length>=3?parts[2]:parts[1];
  arr.forEach(r=>add(sub,r.score,r.total,r.kind||'practice'));
 }
 const name=activeName();
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i)||'';
   if(!key.startsWith(CURR_KEY_PREFIX+name+'_'))continue;
   const parts=key.substring((CURR_KEY_PREFIX+name+'_').length).split('_');
   const sub=parts[0];
   const entries=jsonGet(key,[]);
   if(!Array.isArray(entries))continue;
   entries.forEach(r=>add(sub,r.score,r.total,r.mode||'practice'));
  }
 }catch{}
 const total={xp:0,points:0,correct:0,total:0,attempts:0};
 for(const sub of Object.keys(by)){
  const s=by[sub]; total.xp+=s.xp; total.points+=s.points; total.correct+=s.correct; total.total+=s.total; total.attempts+=s.attempts;
 }
 total.success=pct(total.correct,total.total);
 for(const s of Object.values(by))s.success=pct(s.correct,s.total);
 return {by,total};
}

function installHomeSummary(){
 const home=document.querySelector('#homeScreen .app');
 if(!home)return;
 let panel=home.querySelector('.sd822-progress');
 if(!panel){
  panel=document.createElement('section');
  panel.className='sd822-progress';
  panel.innerHTML=`<div class="sd822-head"><strong>⭐ Tvoje body dobrodružství</strong><small>XP a úspěchy z výuky, procvičování a testů</small></div>
  <div class="sd822-grid">
   <div class="sd822-stat"><span>⚡ Celkem XP</span><b data-sd822="xp">0</b></div>
   <div class="sd822-stat"><span>🏅 Body úspěchu</span><b data-sd822="points">0</b></div>
   <div class="sd822-stat"><span>🎯 Úspěšnost</span><b data-sd822="success">0 %</b></div>
  </div>
  <button type="button" class="sd822-plan-btn">📅 Fulnek – měsíční plán a školní učivo</button>`;
  const anchor=home.querySelector('#v24-avatar-open')?.nextSibling;
  const after=document.querySelector('#v24-avatar-open');
  if(after&&after.parentNode)after.parentNode.insertBefore(panel, after.nextSibling);
  else home.prepend(panel);
  panel.querySelector('.sd822-plan-btn')?.addEventListener('click',()=>{
   if(window.SDSchoolPlans52?.openOverview)window.SDSchoolPlans52.openOverview();
  });
 }
}

function updateHomeStats(){
 const {by,total}=collectStats();
 const home=document.getElementById('homeScreen'); if(!home)return;
 const set=(sel,val)=>{const el=home.querySelector(sel); if(el&&el.textContent!==val)el.textContent=val};
 set('[data-sd822="xp"]', String(total.xp));
 set('[data-sd822="points"]', String(total.points));
 set('[data-sd822="success"]', `${total.success} %`);
 home.querySelectorAll('.subject-grid .subject,.v23-extra-grid .subject').forEach(card=>{
  const key=Object.keys(HOME_MAP).find(k=>card.classList.contains(k)); if(!key)return;
  const subject=HOME_MAP[key]; const s=by[subject]||{xp:0,points:0};
  let footer=card.querySelector('.v451-footer'); if(!footer)return;
  const spans=footer.querySelectorAll('span');
  const locked=key==='music';
  const xp=locked?'★ 0 XP':`★ ${s.xp} XP`;
  const points=locked?'🔒 Brzy':`🏅 ${s.points} bodů`;
  if(spans[0]&&spans[0].textContent!==xp)spans[0].textContent=xp;
  if(spans[1]&&spans[1].textContent!==points)spans[1].textContent=points;
  card.dataset.sd822Xp=String(s.xp); card.dataset.sd822Points=String(s.points);
 });
}

function installHooks(){
 installHomeSummary();
 updateHomeStats();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateHomeStats()});
 window.addEventListener('focus',updateHomeStats);
 window.addEventListener('pageshow',updateHomeStats);
 document.addEventListener('click',e=>{
  const t=e.target.closest('#sd52 button,#sdCurriculum button,#mathScreen button,#czechScreen button,#englishScreen button,#vlastScreen button');
  if(t)setTimeout(updateHomeStats,60);
 });
 // 50.8.23: žádný MutationObserver nad ukazateli XP.
 // Původní pozorování childList vyvolávalo nekonečnou zpětnovazební
 // smyčku: přepis textContent -> DOM mutace -> updateHomeStats -> ...
 // a blokovalo i DOMContentLoaded a dokončení úvodní animace.
 document.addEventListener('sd-route-change',()=>updateHomeStats());
 window.addEventListener('storage',e=>{if(e.key===DBKEY||e.key===ACTIVE)updateHomeStats()});
}

function boot(){
 mergeTopics();
 seedFulnek();
 installHooks();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.SDHomeXpFulnek50822=Object.freeze({refresh:updateHomeStats,seed:seedFulnek,version:'50.8.24'});
})();
