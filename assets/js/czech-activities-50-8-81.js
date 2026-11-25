/* Školní dobrodružství 50.8.81 – ovladatelné činnosti češtiny na telefonu.
 * Pět původních tlačítek a jejich původní výuková logika se zachovávají.
 * Opravuje nepřístupný obsah, který se otevíral až POD dlouhým výběrem karet.
 */
(()=>{'use strict';
const IDS=Object.freeze({
 czLearn:'czGuide',
 czPractice:'czExercise',
 czTest:'czExercise',
 czNumbers:'czNumbersPanel',
 czDictations:'czDictPanel'
});
const $=id=>document.getElementById(id);
function start(){
 const screen=$('czechScreen'),intro=screen?.querySelector('main.app > .v29-panel');
 if(!screen||!intro||$('sd881CzechActivityBack'))return;
 const btn=document.createElement('button');
 btn.id='sd881CzechActivityBack';
 btn.type='button';btn.className='sd881-czech-activity-back';
 btn.textContent='← Zpět na výběr činností';
 btn.hidden=true;
 intro.insertAdjacentElement('afterend',btn);
 const note=document.createElement('p');
 note.id='sd881CzechStatus';
 note.className='sd881-czech-status';
 note.hidden=true;note.setAttribute('role','status');
 btn.insertAdjacentElement('afterend',note);
 const panels=['czGuide','czExercise','czNumbersPanel','czDictPanel'];
 let seq=0;
 function hideContent(){
  for(const id of panels){const p=$(id);if(p)p.classList.add('v29-hide')}
 }
 function toTop(target){
  requestAnimationFrame(()=>{
   if(!screen.classList.contains('visible'))return;
   try{target.scrollIntoView({block:'start',behavior:'smooth'})}catch{target.scrollIntoView()}
  });
 }
 function returnToMenu(){
  ++seq;
  screen.classList.remove('sd881-czech-activity');
  screen.dataset.sd881Mode='menu';
  btn.hidden=true;note.hidden=true;
  hideContent();
  toTop(intro);
 }
 btn.addEventListener('click',returnToMenu);
 // Výběr činnosti volá původní onclick příslušného tlačítka.
 // Po doběhnutí původního handleru ukáže jediný cílový panel a přesune k němu.
 for(const [action,targetId] of Object.entries(IDS)){
  const source=$(action),target=$(targetId);
  if(!source||!target)continue;
  source.addEventListener('click',()=>{
   const ticket=++seq;
   queueMicrotask(()=>{
    if(ticket!==seq)return;
    hideContent();
    target.classList.remove('v29-hide');
    screen.classList.add('sd881-czech-activity');
    screen.dataset.sd881Mode=action;
    btn.hidden=false;
    note.hidden=true;
    let ok=true;
    if(action==='czLearn')ok=target.textContent.trim().length>30;
    else if(action==='czNumbers')ok=!!$('czNumChoices')?.children.length;
    else if(action==='czDictations')ok=!!$('czDictChoices')?.children.length;
    else ok=!!$('czSentence')?.children.length && !!$('czChoices')?.children.length;
    if(!ok){
     note.hidden=false;
     note.textContent='Obsah této činnosti se nenačetl. Použij „Exportovat diagnostický log“ a zkontroluj aktualizaci aplikace.';
    }
    toTop(btn);
   });
  });
 }
 // Na první návštěvě se zobrazí jen nabídka, nikoliv rozpracovaný
 // panel procvičování schovaný pod pěticí velkých obrázkových karet.
 if(!screen.classList.contains('sd881-czech-activity'))returnToMenu();
 // Při návratu na nabídku předmětů zruš částečně otevřenou činnost.
 $('sdCzechReturn5074')?.addEventListener('click',returnToMenu);
 $('sdCzechBack5074')?.addEventListener('click',returnToMenu);
 // Kontrola, že stará logika existuje; v opačném případě ukaž diagnostiku
 // a neslibuj, že stisk opravdu spouští procvičování.
 const unbound=Object.keys(IDS).filter(id=>typeof $(id)?.onclick!=='function');
 if(unbound.length){
  const warning=document.createElement('p');
  warning.className='sd881-czech-load-warning';
  warning.textContent='Výuka češtiny není kompletně načtená. Zkontroluj aktualizaci aplikace a ulož diagnostický log.';
  intro.append(warning);
  console.error('Školní dobrodružství: neaktivní ovládání češtiny',unbound.join(', '));
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();