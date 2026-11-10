/* 50.8.15 – vložení fantasy tlačítek do domovského výběru předmětů */
(()=>{'use strict';
const MAP={
  math:{src:'./assets/ikony/home-adventure/matematika.png',label:'Matematika'},
  english:{src:'./assets/ikony/home-adventure/anglictina.png',label:'Angličtina'},
  czech:{src:'./assets/ikony/home-adventure/cestina.png',label:'Čeština'},
  nature:{src:'./assets/ikony/home-adventure/prirodopis.png',label:'Přírodopis'},
  history:{src:'./assets/ikony/home-adventure/vlastiveda.png',label:'Vlastivěda'},
  music:{src:'./assets/ikony/home-adventure/hudebni-vychova.png',label:'Hudební výchova'}
};
function keyOf(card){return Object.keys(MAP).find(k=>card.classList.contains(k))||null}
function enhanceCard(card){
  const key=keyOf(card); if(!key) return;
  card.classList.add('sd815-art-card');
  let art=card.querySelector(':scope > img.sd815-home-art');
  if(!art){ art=document.createElement('img'); art.className='sd815-home-art'; art.alt=''; art.decoding='async'; card.prepend(art); }
  art.src=MAP[key].src;
  const kids=[...card.children];
  kids.forEach(el=>{
    if(el===art) return;
    if(el.classList.contains('symbol')) return;
    if(el.classList.contains('v451-footer')||el.classList.contains('sd-ui-footer')||el.classList.contains('subject-footer')||el.classList.contains('card-footer')) return;
    if(el.matches && el.matches('span,div,p') && !el.classList.contains('sd815-home-copy')){
      if(el.querySelector('strong,small') || /^Matematika|Angličtina|Čeština|Přírodověda|Přírodopis|Vlastivěda|Hudební výchova$/i.test((el.textContent||'').trim())) el.classList.add('sd815-home-copy');
    }
  });
  const strong=card.querySelector('strong');
  if(strong && key==='nature') strong.textContent='Přírodopis';
  if(strong && key==='history') strong.textContent='Vlastivěda';
  if(strong && key==='music') strong.textContent='Hudební výchova';
  const small=card.querySelector('small');
  if(small && key==='nature' && /Brzy/i.test(small.textContent)) small.textContent='Brzy přidáme';
  card.setAttribute('aria-label', MAP[key].label + (card.getAttribute('aria-disabled')==='true' ? ' – brzy' : ''));
}
function apply(){
  document.querySelectorAll('#homeScreen .subject-grid .subject, #homeScreen .v23-extra-grid .subject').forEach(enhanceCard);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', apply, {once:true}); else apply();
window.addEventListener('load', apply, {once:true});
setTimeout(apply,600); setTimeout(apply,1600);
window.SDHomeAdventureButtons50815=Object.freeze({refresh:apply,version:'50.8.15'});
})();
