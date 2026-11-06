/* 50.7.4: Czech entry uses the same SDUICards module as all subjects. */
(()=>{'use strict';
 const home=document.getElementById('homeScreen');const czech=document.getElementById('czechScreen');
 const cards=window.SDUICards;if(!home||!czech||!cards)return;
 const shell=document.createElement('section');shell.id='sdCzechHub5074';shell.hidden=true;
 shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-label','Čeština – výběr');
 const actions=[
  {title:'Výuka',description:'Vysvětlení slovních druhů',icon:'teach',action:'learn'},
  {title:'Procvičování',description:'Věty, slova a opakování',icon:'practice',action:'practice'},
  {title:'Test',description:'Ověř si své znalosti',icon:'test',action:'test'},
  {title:'Čísla slovních druhů',description:'Procvičování 1–10',icon:'numbers',action:'numbers'},
  {title:'Pravopis a diktáty',description:'I/Y, S/Z, Ě/JE a další',icon:'dictation',action:'dictation'},
  {title:'Kapitoly podle učebnice',description:'Učivo 5. třídy',icon:'curriculum',action:'curriculum'},
  {title:'Měsíční plán',description:'Učivo podle měsíců',icon:'month',action:'month'},
  {title:'Nastavení',description:'Způsob procvičování',icon:'settings',action:'settings'}
 ];
 shell.innerHTML='<div class="sd-czech-wrap"><button type="button" class="sd-czech-back" id="sdCzechBack5074">← Zpět na předměty</button><h1>📖 Čeština</h1><p>Vyber si, co chceš dnes dělat</p>'+cards.grid(actions.map(a=>cards.html({title:a.title,description:a.description,icon:a.icon,attrs:'data-czech-action="'+a.action+'"'})),'sd-czech-cards')+'</div>';
 document.body.append(shell);
 const close=()=>{shell.hidden=true;document.body.classList.remove('sd-czech-hub-open')};
 const open=()=>{if(!document.getElementById('authGate')?.classList.contains('off'))return;document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('visible',s===home));shell.hidden=false;document.body.classList.add('sd-czech-hub-open');window.scrollTo(0,0)};
 shell.querySelector('#sdCzechBack5074').addEventListener('click',close);
 function lesson(button){close();document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('visible',s===czech));
  const b=czech.querySelector('#'+button);if(b)b.click();window.scrollTo(0,0)}
 shell.addEventListener('click',e=>{
  const action=e.target.closest('[data-czech-action]')?.dataset.czechAction;if(!action)return;
  const map={learn:'czLearn',practice:'czPractice',test:'czTest',numbers:'czNumbers',dictation:'czDictations',settings:'czSettingsBtn'};
  if(action==='curriculum'){close();window.SDCurriculum501?.topics('czech');return}
  if(action==='month'){close();window.SDSchoolPlans52?.open('czech');return}
  if(map[action])lesson(map[action]);
 });
 // Capture before older direct navigation listeners on the home tile.
 document.addEventListener('click',e=>{
  const tile=e.target.closest?.('#homeScreen button[data-open="czech"]');
  if(!tile)return;e.preventDefault();e.stopImmediatePropagation();open();
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!shell.hidden)close()});
 window.addEventListener('school-account',e=>{if(!e.detail?.id)close()});
 // The Czech screen is lesson content; place navigation back into the same menu.
 const back=document.createElement('button');back.type='button';back.id='sdCzechReturn5074';back.className='sd-czech-back';back.textContent='← Nabídka češtiny';
 back.addEventListener('click',()=>{document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('visible',s===home));open()});
 czech.querySelector('main')?.prepend(back);
 window.SDCzechHub5074={open,close,actions:actions.map(x=>x.action)};
})();
