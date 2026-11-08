
(function(){
'use strict';
const panel=document.getElementById('v496TopicPanel'), hub=document.getElementById('subjectHub');
const topics=[
 ['✖️ Násobení','mul'],['➗ Dělení','div'],['🎲 Násobení + dělení','mix'],
 ['🔟 Desítková soustava','decimal'],['🚀 Násobky deseti','powers'],
 ['🧩 Písemné dělení','longdiv'],['✍️ Dělení se zbytkem','tail'],
 ['🧠 Pořadí operací a závorky','order'],['🎨 Animovaná škola dělení','visual']
];
let mode='teach';
function close(){panel.classList.remove('open');document.body.style.overflow=''}
document.getElementById('v496TopicBack').addEventListener('click',()=>{close();hub.classList.add('open');document.body.style.overflow='hidden'});
document.querySelectorAll('#subjectHub [data-hub-mode="teach"],#subjectHub [data-hub-mode="practice"]').forEach(b=>{
 b.addEventListener('click',e=>{
  if(hub.dataset.subject==='english')return;
  e.preventDefault();e.stopImmediatePropagation();
  mode=b.dataset.hubMode;panel.dataset.mode=mode;
  hub.classList.remove('open');
  document.getElementById('v496TopicTitle').textContent='Matematika – '+(mode==='teach'?'Výuka':'Procvičování');
  panel.classList.add('open');document.body.style.overflow='hidden';
 },true);
});
window.SDMathTopics496={open:(m)=>{const trigger=hub.querySelector('[data-hub-mode="'+(m||panel.dataset.mode||'teach')+'"]');if(trigger){hub.classList.add('open');trigger.click();}},mode:()=>mode};
const grid=document.getElementById('v496Topics');
topics.forEach(([label,key])=>{
 const b=document.createElement('button');b.type='button';b.textContent=label;
 b.addEventListener('click',()=>{
  close();
  document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('visible',x.id==='mathScreen'));
  const setup=document.getElementById('setup');if(setup)setup.classList.remove('hidden');
  const math=document.getElementById('mathScreen');
  math.classList.add('v497-topic');math.dataset.topic=key;
  document.getElementById('v497SelectedTitle').textContent=label+' – '+(mode==='teach'?'Výuka':'Procvičování');
  document.getElementById('v497TopicHead').hidden=false;
  document.getElementById('v497TopicHead').scrollIntoView({block:'start'});
  if(key==='tail'){document.getElementById('v497TailSection').hidden=false;return}
  if(key==='order'){document.getElementById('orderLaunch')?.click();return}
  if(key==='visual'){document.getElementById('visualDivLaunch')?.click();return}
  const chip=document.querySelector('#modes [data-mode="'+key+'"]');
  if(chip)chip.click();
  requestAnimationFrame(()=>{document.getElementById('v497TopicHead')?.scrollIntoView({block:'start'});});
 });
 grid.appendChild(b);
});
const cards=hub.querySelector('.hub-cards');
if(cards&&!cards.querySelector('[data-hub-mode="results"]')){
 const b=document.createElement('button');b.type='button';b.className='hub-card v496-results';
 b.innerHTML='<b>Moje výsledky</b><span class="hub-emoji" style="font-size:43px">📊</span><small>Pokrok a výsledky</small><span class="hub-start">Zobrazit</span>';
 b.addEventListener('click',()=>{hub.classList.remove('open');document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('visible',x.id==='homeScreen'));window.scrollTo(0,0)});
 cards.appendChild(b);
}
const setup=document.getElementById('setup');
if(setup){
 const advancedIds=['sessionMode','countBox','timeBox','slow','onlyHard'];
 const nodes=advancedIds.map(id=>document.getElementById(id)).filter(Boolean);
 if(nodes.length){
  const wrap=document.createElement('div');wrap.className='v496-advanced';wrap.hidden=true;
  const toggle=document.createElement('button');toggle.type='button';toggle.className='v496-advanced-toggle';toggle.textContent='⚙️ Pokročilé nastavení ▾';
  const first=nodes[0];first.parentNode.insertBefore(toggle,first);
  toggle.after(wrap);
  // Move only controls that can be moved without changing their IDs or listeners.
  // Labels immediately preceding controls remain in place for compatibility.
  nodes.forEach(n=>wrap.appendChild(n));
  toggle.addEventListener('click',()=>{wrap.hidden=!wrap.hidden;toggle.textContent=wrap.hidden?'⚙️ Pokročilé nastavení ▾':'⚙️ Skrýt pokročilé nastavení ▴'});
 }
}
})();

