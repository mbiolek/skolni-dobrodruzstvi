/* Školní dobrodružství 50.8.19: oddělené režimy češtiny.
 * Výuková tlačítka v úvodu mohou být fantasy karty, nikoliv jednotlivá slova.
 * Původní onclick, otázky, učení a výsledky zůstávají nedotčené.
 */
(()=>{'use strict';
 const map={czLearn:'czGuide',czPractice:'czExercise',czTest:'czExercise',czNumbers:'czNumbersPanel',czDictations:'czDictPanel'};
 const panels=['czGuide','czExercise','czNumbersPanel','czDictPanel'];
 const actions=Object.keys(map);
 function showOnly(id){
   for(const name of panels){const el=document.getElementById(name);if(el)el.classList.toggle('v29-hide',name!==id)}
 }
 function init(){
   const screen=document.getElementById('czechScreen');if(!screen)return;
   screen.addEventListener('click',event=>{
     const btn=event.target.closest('button[id]');if(!btn||!(btn.id in map))return;
     // Handler on target has already initialized the original lesson/exercise.
     showOnly(map[btn.id]);
     for(const a of actions){document.getElementById(a)?.classList.toggle('active',a===btn.id)}
   });
   // Opening from menu uses a synthetic .click(), handled in the same way.
   // Do not remove the optional help toggle: it may show explanations while practising.
   window.SDCzechScreen50819=Object.freeze({showOnly});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
