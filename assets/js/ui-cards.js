/* Školní dobrodružství 50.7.8 – jediný dynamický renderer vrstvených SVG karet.
   Button and its original click handlers, attributes and accessible text remain untouched.
   Theme-aware separate frame, inner glow, border, medallion, glyph, title and sparkle layers.
*/
(()=>{'use strict';
const PATH='./assets/ui-svg/layers/', THEMES={glass:'crystal',crystal:'crystal',stone:'stone',parchment:'parchment',guild:'guild'};
const ICONS={teach:'vyuka',practice:'procvicovani',test:'test',search:'test',results:'moje_vysledky',month:'mesicni_plan',repeat:'opakovani',settings:'nastaveni',parent:'nastaveni',generic:'vyuka',curriculum:'vyuka',math:'nasobeni',czech:'slovni_druhy',english:'a_an',nature:'priroda',geography:'mapa_a_kompas',music:'noty',numbers:'numbers_0_100',dictation:'pravopis_a_diktaty',
  mul:'nasobeni',div:'deleni',mix:'nasobeni_a_deleni',decimal:'desitkova_soustava',powers:'nasobky_deseti',longdiv:'pisemne_deleni'};
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconKey=i=>ICONS[i]||i||'vyuka';
const keyFor=txt=>String(txt||'').toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const THEMABLE_KEYS=new Set(['vyuka','procvicovani','test','mesicni_plan','opakovani','zaverecny_test','moje_vysledky','nastaveni',
 'nasobeni','deleni','nasobeni_a_deleni','desitkova_soustava','nasobky_deseti','pisemne_deleni','slovni_druhy','cisla_slovnich_druhu','pravopis_a_diktaty','kapitoly_podle_ucebnice','a_an','there_is_there_are','numbers_0_100','rodina_a_jidlo','skola','dum_a_nabytek','historie','mapa_a_kompas','priroda','pokusy','rocni_obdobi','zvirata','rostliny','noty','rytmus','pisne','nastroje']);
function iconFor(el,group){
 const d=el.dataset||{}, key=(d.sdIcon||d.advMode||d.hubMode||d.mode||d.sub||'').toLowerCase();
 if(ICONS[key])return key;
 const action=(d.act||'').toLowerCase();const title=String(el.querySelector?.('strong,b')?.textContent||el.textContent||'').toLocaleLowerCase('cs');
 if(/manage|edit-school|save-plan|setting/.test(action)||/nastaven|správ/.test(title))return 'settings';
 if(/search|find/.test(action)||/příprav[ay] na školní test/.test(title))return 'search';
 if(/repeat/.test(action)||/opaková|opakovat/.test(title))return 'repeat';
 if(/month|school-select|choose-school/.test(action)||/měsíční plán|měsíc/.test(title))return 'month';
 if(/test/.test(action)||/test|zkoušk/.test(title))return 'test';
 if(/practice/.test(action)||/procvič|příklad/.test(title))return 'practice';
 if(/výuka|vysvětlen|kapitol/.test(title)||/curriculum|learning/.test(action))return 'teach';
 if(/výsled|pokrok|statistik/.test(title))return 'results';
 if(group==='math')return 'math';if(group==='czech')return 'czech';if(group==='english')return 'english';
 if(group==='geography')return 'geography';if(group==='nature')return 'nature';if(group==='music')return 'music';
 return 'generic';
}
function svg(src,cls){const el=document.createElement('img');el.src=src;el.alt='';el.decoding='async';el.loading='lazy';el.className=cls;el.setAttribute('aria-hidden','true');return el}
const sources=(theme,icon)=>({
 frame:`${PATH}components/${theme}/card_frame_back.svg`, glow:`${PATH}components/${theme}/card_inner_glow.svg`,
 border:`${PATH}components/${theme}/card_border.svg`,medal:`${PATH}components/${theme}/card_medallion.svg`,
 star:`${PATH}components/${theme}/card_sparkle.svg`,icon:`${PATH}icons/${icon}.svg`});
function theme(){return THEMES[document.body.dataset.cardStyle]||'crystal'}
function refreshCard(btn){
 if(!btn?.classList.contains('sd-layered'))return;
 const th=theme(), data=sources(th,btn.dataset.sdLayerIcon||'vyuka');
 for(const [id,url] of Object.entries(data)){const node=btn.querySelector(`:scope > .sd-layer-art [data-layer="${id}"]`);if(node&&node.getAttribute('src')!==url)node.src=url}
 btn.dataset.layerTheme=th;
 const name=btn.querySelector(':scope > strong,:scope > b,:scope > .sd-ui-card__title');
 if(name){const key=keyFor(name.textContent);const icon=btn.dataset.sdLayerIcon;
 // Fixed Czech labels have an optional independent SVG title layer; dynamic titles stay accessible HTML text.
 const map={vyuka:'vyuka',procvicovani:'procvicovani',test:'test',mesicni_plan:'mesicni_plan',opakovani:'opakovani',zaverecny_test:'zaverecny_test',nastaveni:'nastaveni',moje_vysledky:'moje_vysledky'};
 const titleKey=map[key];let titleSvg=btn.querySelector(':scope > .sd-layer-art [data-layer="title"]');
 if(titleKey){if(!titleSvg){titleSvg=svg('', 'sd-layer-title-svg');titleSvg.dataset.layer='title';btn.querySelector(':scope > .sd-layer-art')?.append(titleSvg)}
 const src=`${PATH}text/cards/${th}/${titleKey}_title.svg`;if(titleSvg.getAttribute('src')!==src)titleSvg.src=src;
 btn.classList.add('sd-has-svg-title');}
 else {titleSvg?.remove();btn.classList.remove('sd-has-svg-title')}
 }
}
function decorate(btn,group='generic'){
 if(!btn||btn.tagName!=='BUTTON')return btn;
 if(!btn.classList.contains('sd-ui-card'))btn.classList.add('sd-ui-card');
 if(btn.classList.contains('sd-layered'))return btn;
 // Drop only old decorative markup. Keep all action listeners and existing semantic text.
 btn.querySelectorAll(':scope > .sd570-art,:scope > .sd571-icon,:scope > .hub-emoji,:scope > .adv-art,:scope > .hub-start,:scope > .adv-cta,:scope > .sd-ui-card__icon').forEach(el=>el.remove());
 for(const n of [...btn.childNodes])if(n.nodeType===3&&n.textContent.trim()){
  const heading=document.createElement('strong');heading.className='sd-ui-card__title';heading.textContent=n.textContent.replace(/^\s*[^\p{L}\p{N}]+/u,'').trim();n.replaceWith(heading);
 }
 const ico=iconKey(btn.dataset.sdLayerIcon||iconFor(btn,group));btn.dataset.sdLayerIcon=THEMABLE_KEYS.has(ico)?ico:'vyuka';
 const art=document.createElement('span');art.className='sd-layer-art';art.setAttribute('aria-hidden','true');
 for(const id of ['frame','glow','border','medal','star','icon']){
  const el=svg('',`sd-layer-${id}`);el.dataset.layer=id;art.append(el);
 }
 btn.prepend(art);btn.classList.add('sd-layered');refreshCard(btn);return btn;
}
const GROUPS=[
 ['#sd52 .sd52-grid','school'],['#sd52 .sd-ui-grid','school'],['#sdCurriculum .sd-grid','curriculum'],['#sdCurriculum .sd-ui-grid','curriculum'],
 ['#vlastScreen #vlUnits','geography'],['#subjectHub .hub-cards','hub'],['#advSubjectMenu .adv-menu-cards','adventure'],
 ['#v496TopicPanel #v496Topics','math'],['#czechScreen .v29-panel > .v29-actions','czech'],
 ['#sdCzechHub5074 .sd-ui-grid','czech'],['#enUnit499 #en499topics','english'],
 ['#homeScreen .subject-grid','cover'] ];
const selectors=GROUPS.map(x=>x[0]).join(',');
function cover(el){
 if(!el.classList.contains('subject')||el.classList.contains('sd-layer-cover'))return;
 const key=el.classList.contains('math')?'matematika':el.classList.contains('czech')?'cestina':el.classList.contains('english')?'anglictina':el.classList.contains('nature')?'prirodoveda':el.classList.contains('history')?'vlastiveda':el.classList.contains('music')?'hudebni_vychova':null;
 if(!key)return;el.classList.add('sd-layer-cover');el.dataset.layerSubject=key;
 // A subject heading is a separate SVG layer; keep original strong text as accessible fallback.
 const node=svg(`${PATH}text/subjects/${theme()}/${key}.svg`,'sd-subject-title-svg');node.setAttribute('aria-hidden','true');el.append(node);
}
function scan(root=document){
 for(const [sel,group] of GROUPS){const found=[];
  if(root.matches?.(sel))found.push(root);root.querySelectorAll?.(sel).forEach(c=>found.push(c));
  for(const container of found){container.classList.add('sd-ui-grid');if(group==='cover'){container.classList.add('sd-ui-grid--covers');[...container.children].forEach(cover);continue}
   for(const child of container.children)if(child.matches('button'))decorate(child,group)}
 }
}
function html({title,description='',icon='auto',attrs='',className=''}){
 let key=icon;
 if(icon==='auto'){
  const dataset={};for(const k of ['act','mode','sub','sd-icon']){const match=attrs.match(new RegExp('data-'+k+'=\"([^\"]+)\"'));if(match)dataset[k==='sd-icon'?'sdIcon':k]=match[1]}
  key=iconFor({dataset,querySelector:()=>({textContent:title}),textContent:title},'school');}
 const iconId=iconKey(key),finalIcon=THEMABLE_KEYS.has(iconId)?iconId:'vyuka';
 return `<button type="button" class="sd-ui-card ${escapeHTML(className)}" data-sd-layer-icon="${escapeHTML(finalIcon)}" ${attrs}><strong class="sd-ui-card__title">${escapeHTML(title)}</strong>${description?`<small class="sd-ui-card__desc">${escapeHTML(description)}</small>`:''}</button>`;
}
const grid=(cards,className='')=>`<div class="sd-ui-grid ${escapeHTML(className)}">${cards.join('')}</div>`;
function button(config){const t=document.createElement('template');t.innerHTML=html(config);return decorate(t.content.firstElementChild,'school')}
let pending=false;
function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;scan()})}
function start(){scan();new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.attributeName==='data-card-style'){document.querySelectorAll('button.sd-layered').forEach(refreshCard);document.querySelectorAll('.sd-subject-title-svg').forEach(img=>{const name=img.parentElement?.dataset.layerSubject;if(name)img.src=`${PATH}text/subjects/${theme()}/${name}.svg`});continue}
  if(r.type==='childList' && ([...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(selectors)||n.querySelector?.(selectors)))||r.target?.matches?.(selectors)||r.target?.closest?.(selectors))){schedule();return;}
 }}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-card-style']});}
window.SDUICards=Object.freeze({html,grid,button,decorate,scan,iconFor,refreshCard,version:window.SDApp?.version||'50.7.8'});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
