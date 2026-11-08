/* Školní dobrodružství 50.8.7 – skutečné obrázkové karty, dynamické názvy.
 * Jeden renderer pro hlavní nabídky i témata. Původní onclick a data-act se nemění.
 * Oprava: název již NENÍ vložen do SVG pod skrytou vrstvou; je přímým DOM
 * sourozencem ilustrace a zůstává viditelný po každém vykreslení tématu.
 */
(()=>{'use strict';
const ROOT='./assets/ui-exact-50-8-4/';
const THEMES=new Set(['guild','stone','glass','parchment','adventure']);
const EXPLICIT=new Map([
 ['vyuka','vyuka'],['procvicovani','procvicovani'],
 ['priprava na skolni test','test'],['mesicni plan','mesicni_plan'],
 ['opakovani','opakovani'],['zaverecny test','zaverecny_test']
]);
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const BASES=['vyuka','procvicovani','test','mesicni_plan','opakovani','zaverecny_test'];
const textOf=b=>{
 const el=b.querySelector(':scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > .sd-layer-caption > .sd-ui-card__title,:scope > strong,:scope > b,:scope > .sd-ui-card__title');
 if(!el)return '';
 // A <br> must remain a space (important for "Příprava na školní test").
 const clone=el.cloneNode(true);clone.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
 return clone.textContent.replace(/\s+/g,' ').trim();
};
const mathSymbols={
 nasobeni:'6×7',deleni:'42÷6',nasobeni_a_deleni:'× ÷',desitkova_soustava:'1 10 100',
 nasobky_deseti:'10 20',pisemne_deleni:'48÷6',
 cisla_slovnich_druhu:'1·2·3',pravopis_a_diktaty:'i / y',
 a_an:'A / AN',there_is_there_are:'IS / ARE',numbers_0_100:'0–100'
};
const wordGlyphs=[
 [/map|evrop|cesk|kraj|stat|svet|zeme|kontinent|zemep|geograf/i,'🌍'],
 [/reka|voda|more|ocean|pocasi|klima/i,'💧'],
 [/rostlin|strom|les|prirod|ekolog|kvet/i,'🌿'],
 [/zvirat|savc|ptac|hmyz|zoo/i,'🐾'],
 [/histor|dejin|stredovek|prav[eě]k/i,'⌛'],
 [/energie|elektr|fyzik|pokus|vedeck/i,'⚗'],
 [/rodin|clovek|lidi|telo|zdrav/i,'♙'],
 [/hudeb|rytm|not|zpev|pisn/i,'♫'],
 [/slov|vet|jazyk|abeced|pravopis/i,'Abc'],
 [/cis|pocit|aritmet/i,'123'],
 [/kalend|mesic|plan/i,'▦']
];
function chooseBase(label,icon){const x=clean(label),i=icon||'';
 if(/vysled|pokrok|statistik|odmen/.test(x)||i==='moje_vysledky')return 'zaverecny_test';
 if(/mesic|kalendar|plan/.test(x))return 'mesicni_plan';
 if(/zaverecn/.test(x))return 'zaverecny_test';
 if(/test|zkousk/.test(x))return 'test';
 if(/opakov/.test(x))return 'opakovani';
 if(/procvic|delen|cvice|trenink/.test(x))return 'procvicovani';
 if(BASES.includes(i))return i;
 if(/(procvicovani|test|opakovani)/.test(i))return i==='zaverecny_test'?'zaverecny_test':i;
 if(i==='nasobeni_a_deleni'||i==='deleni'||i==='pisemne_deleni')return 'procvicovani';
 if(/^(cisla_slovnich_druhu|desitkova_soustava|nasobky_deseti)$/.test(i))return 'opakovani';
 return 'vyuka';
}
function topicGlyph(label,icon){
 if(mathSymbols[icon])return mathSymbols[icon];
 const x=clean(label);
 for(const [rx,g] of wordGlyphs)if(rx.test(x))return g;
 // For chapters with non-descriptive titles, do not create another random
 // mathematical badge; keep the illustrated book associated with teaching.
 return '';
}
function theme(){const d=document.body.dataset.cardStyle;return THEMES.has(d)?d:null}
function ensureExact(b){
 if(!b.matches('button.sd-ui-card.sd-layered'))return false;
 const th=theme(),title=textOf(b);if(!th||!title)return false;
 const exact=EXPLICIT.get(clean(title)),icon=b.dataset.sdLayerIcon||'';
 const base=exact||chooseBase(title,icon);
 const art=b.querySelector(':scope > .sd-layer-art');if(!art)return false;
 let picture=art.querySelector(':scope > img.sd84-exact-picture');
 if(!picture){picture=document.createElement('img');picture.className='sd84-exact-picture';picture.alt='';picture.decoding='async';picture.draggable=false;picture.setAttribute('aria-hidden','true');art.appendChild(picture)}
 // Every card has a separate, accessible live label; baked-in labels do not scale on mobile.
 const url=th==='adventure'?`./assets/ui-exact-50-8-8/adventure/${base}.svg`:`${ROOT}${th}/blanks/${base}.svg`;
 if(picture.getAttribute('src')!==url)picture.src=url;
 b.classList.add('sd84-exact-card');b.classList.toggle('sd87-dynamic',!exact);
 b.dataset.sd84Key=base;
 // Remove the former SVG overlay: its text was missing on multiple Android screens.
 art.querySelectorAll(':scope > svg.sd85-detail-overlay').forEach(e=>e.remove());
 let label=b.querySelector(':scope > .sd87-card-title');
 { // All labels are live DOM text (including six main menu cards).
  if(!label){label=document.createElement('span');label.className='sd87-card-title';label.setAttribute('aria-hidden','true');b.appendChild(label)}
  if(label.textContent!==title)label.textContent=title;
  label.classList.toggle('sd87-title-long',title.length>17);
  label.classList.toggle('sd87-title-verylong',title.length>27);
 }
 let medal=b.querySelector(':scope > .sd87-topic-medallion');
 const glyph=exact?'':topicGlyph(title,icon);
 // Specific mathematics/language symbols go on opaque thematic medals,
 // hiding the underlying generic chapter icon rather than overlapping it.
 if(glyph){
  if(!medal){medal=document.createElement('span');medal.className='sd87-topic-medallion';medal.setAttribute('aria-hidden','true');b.appendChild(medal)}
  if(medal.textContent!==glyph)medal.textContent=glyph;
  medal.classList.toggle('sd87-glyph-long',glyph.length>=6);
  medal.classList.toggle('sd87-emoji',/\p{Extended_Pictographic}/u.test(glyph));
 }else medal?.remove();
 const sig=[th,base,title,glyph].join('|');
 const changed=b.dataset.sd87Sig!==sig;
 b.dataset.sd87Sig=sig;
 return changed;
}
function decorateNavigation(){const t=theme();if(!t)return;
 for(const [a,key] of [['back','zpet'],['home','domu']]){
  for(const btn of document.querySelectorAll(`#sd52 header button[data-act="${a}"]`)){
   btn.classList.add('sd84-exact-nav');btn.style.setProperty('--sd84-nav-img',`url("${ROOT}${t}/${key}.svg")`);
  }
 }
 document.querySelectorAll('#v496TopicPanel .v496-wrap > h2,#v496TopicPanel .v496-wrap > p').forEach(el=>el.classList.add('sd85-visible-heading'));
}
let scheduled=false,lastTheme=null;
function scan(){scheduled=false;const currentTheme=theme();if(!currentTheme)return;
 // The shared ui-cards module is responsible for choosing only navigation buttons.
 // On dynamically opened curricula it can decorate after DOM insertion.
 window.SDUICards?.scan?.();
 let changed=false;
 document.querySelectorAll('button.sd-ui-card.sd-layered').forEach(b=>{
  if(b.closest('#homeScreen .subject-grid'))return;
  if(ensureExact(b))changed=true;
 });
 decorateNavigation();
 if(changed||lastTheme!==currentTheme){lastTheme=currentTheme;
  document.dispatchEvent(new CustomEvent('sd87-cards-ready'));
  window.SDMerlinStage578?.reposition?.();
 }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(scan)}
function setup(){schedule();
 const observer=new MutationObserver(records=>{
  for(const r of records){
   if(r.type==='attributes'){
    if(r.target===document.body&&r.attributeName==='data-card-style'){schedule();return}
    if(r.attributeName==='class'&&r.target.matches?.('button.sd-layered')&&!r.target.classList.contains('sd84-exact-card')){schedule();return}
   }else if(r.type==='childList'){
    // Notice both inserted buttons and newly created topic screens.
    if(Array.from(r.addedNodes).some(node=>node.nodeType===1 &&
      (node.matches?.('button.sd-ui-card,.sd-ui-grid,.sd52-grid,#sd52main,#v496TopicPanel,#sdCurriculum')||
       node.querySelector?.('button.sd-ui-card,.sd-ui-grid,.sd52-grid')))){schedule();return}
   }
  }
 });
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-card-style','class']});
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd-style-preview',schedule);
 window.SDExact5087={scan,version:'50.8.7'};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
