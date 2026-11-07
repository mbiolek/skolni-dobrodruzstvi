/* Školní dobrodružství 50.8.1 — skutečné otevření náhledu karet.
   Náhled vykresluje tatáž živá SVG tlačítka jako výukové obrazovky.
   Zvolený vzhled se ukládá teprve po stisku Použít tento styl. */
(()=>{'use strict';
const OPTIONS={
  glass:['Kouzelný krystal','Průsvitné magické sklo'],
  stone:['Kamenné runy','Vytesané kameny se zlatem'],
  parchment:['Pergamen','Stará mapa a pečetě'],
  guild:['Hradní cech','Dřevo, štíty a smalt']
};
const SAMPLES=[
  ['Výuka','vyuka'],
  ['Procvičování','procvicovani'],
  ['Příprava na školní test','test'],
  ['Měsíční plán','mesicni_plan'],
  ['Opakování','opakovani'],
  ['Závěrečný test','zaverecny_test']
];
function init(){
 const chooser=document.querySelector('#sdCardStyleSelect .sd-card-theme-options');
 if(!chooser||!window.SDUICards||!window.SDCardThemes)return;
 let previewStyle=null,originalStyle=null,previousFocus=null;
 const overlay=document.createElement('div');overlay.className='sd5081-overlay';overlay.id='sd5081StyleOverlay';overlay.hidden=true;
 overlay.innerHTML=`<section class="sd5081-dialog" role="dialog" aria-modal="true" aria-labelledby="sd5081StyleTitle" aria-describedby="sd5081StyleHelp">
 <header class="sd5081-header"><div><span class="sd5081-kicker">ŽIVÝ NÁHLED SVG KARET</span><h2 id="sd5081StyleTitle"></h2><p id="sd5081StyleHelp">Zobrazené karty jsou složené ze stejných vektorových vrstev jako tlačítka ve výuce.</p></div><button class="sd5081-close" type="button" aria-label="Zavřít náhled">✕</button></header>
 <div class="sd5081-samples sd-ui-grid" id="sd5081Samples"></div>
 <p class="sd5081-action-hint" id="sd5081SampleHint" aria-live="polite">Klepnutím na kartu si prohlédneš její reakci. V předmětech mají tlačítka své původní funkce.</p>
 <footer class="sd5081-actions"><button type="button" class="sd5081-cancel">Zpět bez změny</button><button type="button" class="sd5081-use">Použít tento styl</button></footer>
 </section>`;
 document.body.append(overlay);
 const title=overlay.querySelector('#sd5081StyleTitle');
 const samples=overlay.querySelector('#sd5081Samples');
 const hint=overlay.querySelector('#sd5081SampleHint');
 const cancel=overlay.querySelector('.sd5081-cancel');
 const use=overlay.querySelector('.sd5081-use');
 const closeBtn=overlay.querySelector('.sd5081-close');
 function showChoice(style){
  chooser.querySelectorAll('[data-card-choice]').forEach(btn=>{
   const on=btn.dataset.cardChoice===style;
   btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));
  });
 }
 function temporaryStyle(style){
  document.body.dataset.cardStyle=style;
  showChoice(style);
  document.dispatchEvent(new CustomEvent('sd-style-preview',{detail:{style}}));
 }
 function close(commit){
  if(!previewStyle)return;
  const finalStyle=commit?previewStyle:originalStyle;
  if(commit){window.SDCardThemes.set(finalStyle)}
  else{temporaryStyle(finalStyle)}
  overlay.hidden=true;
  document.body.classList.remove('sd5081-preview-open');
  if(commit){
   const btn=document.getElementById('v43-theme-toggle');
   document.body.classList.remove('v43-themes-open');
   if(btn)btn.setAttribute('aria-expanded','false');
   // Po použití zůstává uživatel v aplikaci a může vybrat předmět.
   const home=document.getElementById('homeScreen');
   if(home && !home.hidden){const top=home.querySelector('.subject-grid');if(top)top.scrollIntoView({block:'nearest',behavior:'smooth'});}
  }
  previewStyle=null;originalStyle=null;
  (previousFocus?.isConnected?previousFocus:document.getElementById('v43-theme-toggle'))?.focus?.();
 }
 function open(style){
  if(!OPTIONS[style])return;
  if(!previewStyle){originalStyle=window.SDCardThemes.get();previousFocus=document.activeElement;}
  previewStyle=style;
  temporaryStyle(style);
  title.textContent=OPTIONS[style][0];
  hint.textContent='Klepnutím na kartu si prohlédneš její reakci. V předmětech mají tlačítka své původní funkce.';
  samples.replaceChildren();
  SAMPLES.forEach(([name,ico])=>{
   const sample=window.SDUICards.button({title:name,icon:ico,className:'sd5081-sample'});
   sample.setAttribute('aria-label',`Ukázka tlačítka ${name}`);
   sample.addEventListener('click',()=>{
    hint.textContent=`Ukázka: ${name}. Po použití stylu bude toto tlačítko v předmětu otevírat svou původní funkci.`;
   });
   samples.append(sample);
  });
  overlay.hidden=false;
  document.body.classList.add('sd5081-preview-open');
  overlay.querySelector('.sd5081-dialog').scrollTop=0;
  use.textContent='Použít '+OPTIONS[style][0];
  closeBtn.focus();
 }
 // Capture intercepts the old “save only” handler. Opening a thumbnail now shows the real cards.
 chooser.addEventListener('click',e=>{
  const option=e.target.closest?.('[data-card-choice]');
  if(!option||!chooser.contains(option))return;
  e.preventDefault();e.stopPropagation();
  open(option.dataset.cardChoice);
 },true);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close(false)});
 closeBtn.addEventListener('click',()=>close(false));
 cancel.addEventListener('click',()=>close(false));
 use.addEventListener('click',()=>close(true));
 document.addEventListener('keydown',e=>{
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();close(false)}
  if(e.key==='Tab'){
   const focusable=[...overlay.querySelectorAll('button:not([disabled])')];
   const index=focusable.indexOf(document.activeElement);
   if(e.shiftKey&&index===0){e.preventDefault();focusable.at(-1).focus()}
   else if(!e.shiftKey&&index===focusable.length-1){e.preventDefault();focusable[0].focus()}
  }
 });
 window.SDStylePreview=Object.freeze({open,close:()=>close(false)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
