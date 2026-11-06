/* Školní dobrodružství 50.7.2 – JEDINÝ modul navigačních karet.
 * Třída sd-ui-card a její ikonografie/rozložení se určují výhradně zde.
 * Obsluhu akcí a data jednotlivých předmětů necháváme v jejich modulech.
 * Kvízové odpovědi, formuláře a ovládací tlačítka nejsou navigační karty.
 */
(()=>{'use strict';
 const ICON_DIR='./assets/ikony/';
 const ICONS=Object.freeze({
  teach:'ikona-teach.webp',practice:'ikona-practice.webp',test:'ikona-test.webp',
  results:'ikona-trophy.webp',month:'ikona-history.webp',repeat:'ikona-badge.webp',
  settings:'ikona-settings.webp',parent:'ikona-parent.webp',search:'ikona-test.webp',
  math:'ikona-math.webp',czech:'ikona-czech.webp',english:'ikona-english.webp',
  nature:'ikona-nature.webp',geography:'ikona-history.webp',music:'ikona-music.webp',
  generic:'ikona-teach.webp'
 });
 const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const iconKey=k=>Object.hasOwn(ICONS,k)?k:'generic';
 // Stable action/data mapping, shared across math, Czech, English and school plans.
 function iconFor(el,group){
  const dataset=el.dataset||{};
  const role=(dataset.sdIcon||dataset.advMode||dataset.hubMode||dataset.mode||dataset.sub||'').toLowerCase();
  if(ICONS[role])return role;
  const action=dataset.act||'';
  const title=String(el.querySelector('strong,b')?.textContent||el.textContent||'').toLocaleLowerCase('cs');
  if(/manage|edit-school|edit-plan|save-plan/.test(action)||/správa/.test(title))return 'parent';
  if(/setting/.test(action)||/nastavení/.test(title))return 'settings';
  if(/search|find/.test(action)||/příprav[ay] na školní test/.test(title))return 'search';
  if(/repeat/.test(action)||/opakován|opakovat/.test(title))return 'repeat';
  if(/school-select|month|choose-school/.test(action)||/měsíční plán|měsíc|školu/.test(title))return 'month';
  if(/test/.test(action)||/test|zkoušk/.test(title))return 'test';
  if(/practice/.test(action)||/procvič|příklad/.test(title))return 'practice';
  if(/procvič/.test(title))return 'practice';
  if(/výuka|vysvětlen|kapitol/.test(title))return 'teach';
  if(/curriculum|learning/.test(action))return 'teach';
  if(/výsled|pokrok|statistik/.test(title))return 'results';
  if(group==='geography')return 'geography';
  if(group==='math')return 'math';
  if(group==='czech')return 'czech';
  if(group==='english')return 'english';
  if(group==='music')return 'music';
  if(group==='nature')return 'nature';
  return 'generic';
 }
 function iconElement(icon){
  const span=document.createElement('span');span.className='sd-ui-card__icon';span.setAttribute('aria-hidden','true');
  const img=document.createElement('img');img.src=ICON_DIR+ICONS[iconKey(icon)];img.alt='';img.loading='lazy';img.decoding='async';
  span.append(img);return span;
 }
 function decorate(button,group){
  if(!button||button.tagName!=='BUTTON'||button.classList.contains('sd-ui-card'))return button;
  button.classList.add('sd-ui-card');
  // Preserve all existing event listeners, IDs, data-* attributes and children.
  // Only remove artwork created by the older, now replaced, decoration layer.
  button.querySelectorAll(':scope > .sd570-art,:scope > .sd571-icon,:scope > .hub-emoji,:scope > .adv-art,:scope > .hub-start,:scope > .adv-cta').forEach(x=>x.remove());
  for(const child of [...button.childNodes]){
   if(child.nodeType===3&&child.textContent.trim()){
    child.textContent=child.textContent.replace(/^\s*[^\p{L}\p{N}]+/u,'').trimStart();
   }
  }
  const icon=iconFor(button,group);
  button.prepend(iconElement(icon));
  const strong=button.querySelector(':scope > strong,:scope > b');
  if(!strong){
   // Plain-text math/curriculum topics are put inside a title (same DOM button).
   const nodes=[...button.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
   if(nodes.length){const heading=document.createElement('strong');heading.className='sd-ui-card__title';
    heading.textContent=nodes.map(n=>n.textContent.trim()).join(' ');
    nodes.forEach(n=>n.remove());button.append(heading)}
  }
  return button;
 }
 const GROUPS=[
  ['#sd52 .sd52-grid','school'],['#sdCurriculum .sd-grid','curriculum'],
  ['#vlastScreen #vlUnits','geography'],['#subjectHub .hub-cards','hub'],
  ['#advSubjectMenu .adv-menu-cards','adventure'],['#v496TopicPanel #v496Topics','math'],
  ['#czechScreen .v29-panel > .v29-actions','czech'],
  ['#enUnit499 #en499topics','english'],['#homeScreen .subject-grid','cover']
 ];
 const selectors=GROUPS.map(([sel])=>sel).join(',');
 function scan(context=document){
  for(const [selector,group] of GROUPS){
   const containers=[];
   if(context.matches?.(selector))containers.push(context);
   context.querySelectorAll?.(selector).forEach(x=>containers.push(x));
   for(const container of containers){
    container.classList.add('sd-ui-grid');
    if(group==='cover'){container.classList.add('sd-ui-grid--covers');for(const child of container.children){if(child.matches('.subject'))child.classList.add('sd-ui-cover')}continue}
    for(const child of container.children){if(child.matches('button'))decorate(child,group)}
   }
  }
  // The home cards retain their established illustrated background, but receive
  // the same root card API/theme tokens (cover variant instead of icon variant).
  const home=document.querySelector('#homeScreen .subject-grid');
  if(home){home.classList.add('sd-ui-grid','sd-ui-grid--covers');
   for(const child of home.children){if(child.matches('.subject'))child.classList.add('sd-ui-cover')}
  }
 }
 // Factory for new navigation cards; no feature module defines card HTML/CSS.
 function html({title,description='',icon='auto',attrs='',className=''}){
  if(icon==='auto'){
   const data={};
   for(const attr of ['act','mode','sub','sd-icon']){const m=attrs.match(new RegExp('data-'+attr+'=\\"([^\\"]+)\\"'));if(m)data[attr==='sd-icon'?'sdIcon':attr]=m[1]}
   icon=iconFor({dataset:data,querySelector:()=>({textContent:title}),textContent:title},'');
  }
  const src=ICON_DIR+ICONS[iconKey(icon)];
  return `<button type="button" class="sd-ui-card ${escapeHTML(className)}" ${attrs}><span class="sd-ui-card__icon" aria-hidden="true"><img src="${src}" alt="" loading="lazy"></span><strong class="sd-ui-card__title">${escapeHTML(title)}</strong>${description?`<small class="sd-ui-card__desc">${escapeHTML(description)}</small>`:''}</button>`;
 }
 function grid(cards,className=''){
  return `<div class="sd-ui-grid ${escapeHTML(className)}">${cards.join('')}</div>`;
 }
 function button(config){
  const tpl=document.createElement('template');tpl.innerHTML=html(config);
  return tpl.content.firstElementChild;
 }
 let observer;
 function start(){
  scan();
  // A SINGLE observer for regenerated legacy menus (instead of per-module
  // observers and cascading repaint layers in versions 50.7.0/50.7.1).
  observer=new MutationObserver(records=>{
   const roots=new Set();
   for(const record of records){
    for(const added of record.addedNodes){
     if(added.nodeType!==1)continue;
     if(added.matches?.(selectors)||added.querySelector?.(selectors))roots.add(added);
     else if(record.target?.matches?.(selectors))roots.add(record.target);
    }
   }
   for(const root of roots)scan(root);
  });
  observer.observe(document.body,{childList:true,subtree:true});
 }
 window.SDUICards=Object.freeze({html,grid,button,decorate,scan,iconFor,version:'50.7.2'});
 window.SDVersion='50.7.2';
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
