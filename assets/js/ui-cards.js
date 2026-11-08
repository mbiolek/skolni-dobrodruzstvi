/* Školní dobrodružství 50.8.0 – dynamické vícevrstvé SVG karty.
   Vrstvy zůstávají nezávislé a kliknutí původních tlačítek nedotčená.
   Názvy jsou skutečný vektorově vykreslený DOM text, nikoli pevně umístěný bitmapový snímek. */
(()=>{'use strict';
const PATH='./assets/ui-svg/layers/';
const THEMES={glass:'crystal',crystal:'crystal',stone:'stone',parchment:'parchment',guild:'guild'};
const ICONS={teach:'vyuka',practice:'procvicovani',test:'test',search:'test',results:'moje_vysledky',month:'mesicni_plan',repeat:'opakovani',settings:'nastaveni',parent:'nastaveni',generic:'vyuka',curriculum:'vyuka',math:'nasobeni',czech:'slovni_druhy',english:'a_an',nature:'priroda',geography:'mapa_a_kompas',music:'noty',numbers:'numbers_0_100',dictation:'pravopis_a_diktaty',
 mul:'nasobeni',div:'deleni',mix:'nasobeni_a_deleni',decimal:'desitkova_soustava',powers:'nasobky_deseti',longdiv:'pisemne_deleni'};
const svgKeys=new Set(['vyuka','procvicovani','test','mesicni_plan','opakovani','zaverecny_test','moje_vysledky','nastaveni','nasobeni','deleni','nasobeni_a_deleni','desitkova_soustava','nasobky_deseti','pisemne_deleni','slovni_druhy','cisla_slovnich_druhu','pravopis_a_diktaty','kapitoly_podle_ucebnice','a_an','there_is_there_are','numbers_0_100','rodina_a_jidlo','skola','dum_a_nabytek','historie','mapa_a_kompas','priroda','pokusy','rocni_obdobi','zvirata','rostliny','noty','rytmus','pisne','nastroje']);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s??'').toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const iconKey=i=>ICONS[i]||i||'vyuka';
function theme(){return THEMES[document.body.dataset.cardStyle]||'crystal'}
function iconFor(btn,group){
 const d=btn.dataset||{}, raw=(d.sdIcon||d.advMode||d.hubMode||d.mode||d.sub||'').toLowerCase();
 if(ICONS[raw])return ICONS[raw];if(svgKeys.has(raw))return raw;
 const action=String(d.act||'').toLowerCase(), t=normalize(btn.querySelector?.('strong,b,.sd-ui-card__title')?.textContent||btn.textContent||'');
 // Nejprve specifické výukové téma, jinak se celé předměty znovu zobrazují s jedinou ikonou.
 const topics=[
 [/pisemn.*delen/, 'pisemne_deleni'],[/nasob.*delen|delen.*nasob/,'nasobeni_a_deleni'],[/nasobky.*deseti/,'nasobky_deseti'],[/desitkov|desetinn.*soustav/,'desitkova_soustava'],[/nasoben|nasobilk/,'nasobeni'],[/delen/,'deleni'],
 [/cisla.*slovnich/,'cisla_slovnich_druhu'],[/slovni.*druh/,'slovni_druhy'],[/pravopis|diktat/,'pravopis_a_diktaty'],[/kapitol.*ucebnice/,'kapitoly_podle_ucebnice'],
 [/there_is|there_are/,'there_is_there_are'],[/^a_an$|^a_a_n$/,'a_an'],[/numbers|cisla_0|0_100/,'numbers_0_100'],[/rodina|jidlo|family/,'rodina_a_jidlo'],[/dum|nabytek|house/,'dum_a_nabytek'],[/^skola$|^school$/,'skola'],
 [/mapa|kompas/,'mapa_a_kompas'],[/historie|dejepis/,'historie'],[/rocni_obdob/,'rocni_obdobi'],[/pokus/,'pokusy'],[/zvirat/,'zvirata'],[/rostlin/,'rostliny'],[/priroda/,'priroda'],[/rytm/,'rytmus'],[/nastroj/,'nastroje'],[/pisne|pisnick/,'pisne'],[/noty|nota/,'noty']];
 for(const [rx,key] of topics)if(rx.test(t))return key;
 // Akce sdílené napříč předměty.
 if(/moje_vysledky|vysledk|pokrok|statistik/.test(t))return 'moje_vysledky';
 if(/zaverecn.*test/.test(t))return 'zaverecny_test';
 if(/mesicni_plan|mesic/.test(t)||/month|school-select|choose-school/.test(action))return 'mesicni_plan';
 if(/opakovan|opakovat/.test(t)||/repeat/.test(action))return 'opakovani';
 if(/procvicovan|procvicovani|samostatn.*cvicen/.test(t)||/practice/.test(action))return 'procvicovani';
 if(/test|zkousk|priprav.*skoln/.test(t)||/test|search|find/.test(action))return 'test';
 if(/nastaven|sprav/.test(t)||/manage|edit-school|save-plan|setting/.test(action))return 'nastaveni';
 if(/vyuka|vysvetlen|kapitoly/.test(t)||/curriculum|learning/.test(action))return 'vyuka';
 return {math:'nasobeni',czech:'slovni_druhy',english:'a_an',geography:'mapa_a_kompas',nature:'priroda',music:'noty'}[group]||'vyuka';
}
function svg(src,layer){const e=document.createElement('img');e.src=src;e.alt='';e.draggable=false;e.decoding='async';e.loading='lazy';e.dataset.layer=layer;e.setAttribute('aria-hidden','true');return e}
function sources(th,ico){if(th==='guild'){const shield=`${PATH}components/guild/shields/${ico}.svg`,gem=`${PATH}components/guild/gems/${['vyuka','procvicovani','test','mesicni_plan','opakovani','zaverecny_test','moje_vysledky','nastaveni'].includes(ico)?ico:'default'}.svg`;return {frame:`${PATH}components/guild/card_frame_back.svg`,glow:`${PATH}components/guild/card_inner_glow.svg`,border:`${PATH}components/guild/card_border.svg`,medal:shield,icon:`${PATH}${['vyuka','procvicovani','test','mesicni_plan','opakovani','zaverecny_test'].includes(ico)?'icons-guild':'icons'}/${ico}.svg`,banner:`${PATH}components/guild/card_banner.svg`,gem,star:`${PATH}components/guild/card_sparkle.svg`};}if(th==='stone'){return {banner:`${PATH}components/stone/card_banner.svg`,gem:'',frame:`${PATH}components/stone/card_frame_back.svg`,glow:`${PATH}components/stone/card_inner_glow.svg`,border:`${PATH}components/stone/card_border.svg`,medal:`${PATH}components/stone/card_medallion.svg`,icon:`${PATH}${['vyuka','procvicovani','test','mesicni_plan','opakovani','zaverecny_test'].includes(ico)?'icons-stone':'icons'}/${ico}.svg`,star:`${PATH}components/stone/card_sparkle.svg`};}
return {banner:'',gem:'',frame:`${PATH}components/${th}/card_frame_back.svg`,glow:`${PATH}components/${th}/card_inner_glow.svg`,border:`${PATH}components/${th}/card_border.svg`,medal:`${PATH}components/${th}/card_medallion.svg`,icon:`${PATH}icons/${ico}.svg`,star:`${PATH}components/${th}/card_sparkle.svg`}}
function refreshCard(btn){if(!btn?.classList.contains('sd-layered'))return;const th=theme(),src=sources(th,btn.dataset.sdLayerIcon||'vyuka');for(const [layer,url] of Object.entries(src)){const el=btn.querySelector(`:scope > .sd-layer-art [data-layer="${layer}"]`);if(el){if(url){if(el.getAttribute('src')!==url)el.src=url}else el.removeAttribute('src')}}btn.dataset.layerTheme=th}
function decorate(btn,group='generic'){
 if(!btn||btn.tagName!=='BUTTON')return btn;
 if(!btn.classList.contains('sd-ui-card'))btn.classList.add('sd-ui-card');
 if(btn.classList.contains('sd-layered')){refreshCard(btn);return btn}
 const rawTitle=String(btn.querySelector(':scope > strong,:scope > b,:scope > .sd-ui-card__title')?.textContent||btn.textContent||'').trim();
 const icon=iconKey(btn.dataset.sdLayerIcon||iconFor(btn,group));btn.dataset.sdLayerIcon=svgKeys.has(icon)?icon:'vyuka';
 // Odstraňují se pouze staré grafické dekorace, nikoliv původní onclick a data atributy.
 btn.querySelectorAll(':scope > .sd570-art,:scope > .sd571-icon,:scope > .hub-emoji,:scope > .adv-art,:scope > .hub-start,:scope > .adv-cta,:scope > .sd-ui-card__icon,:scope > .sd-layer-art').forEach(n=>n.remove());
 let title=btn.querySelector(':scope > strong,:scope > b,:scope > .sd-ui-card__title');
 if(!title){title=document.createElement('strong');title.className='sd-ui-card__title';title.textContent=rawTitle.replace(/^\s*[^\p{L}\p{N}]+/u,'').trim()}
 if(theme()==='guild'&&/^Příprava na školní test$/i.test(title.textContent.trim()))title.replaceChildren('Příprava na',document.createElement('br'),'školní test')
 let desc=btn.querySelector(':scope > small,:scope > .sd-ui-card__desc,:scope > .hub-desc,:scope > .adv-desc');
 // Některá legacy tlačítka drží název jako prostý textový uzel.
 for(const n of [...btn.childNodes])if(n.nodeType===3&&n.textContent.trim())n.remove();
 const caption=document.createElement('span');caption.className='sd-layer-caption';caption.setAttribute('aria-hidden','true');
 caption.append(title);if(desc)caption.append(desc);
 const art=document.createElement('span');art.className='sd-layer-art';art.setAttribute('aria-hidden','true');
 for(const layer of ['frame','glow','border','medal','icon','banner','gem','star'])art.append(svg('',layer));
 btn.prepend(art);btn.append(caption);btn.classList.add('sd-layered');
 btn.classList.toggle('sd-long-label',title.textContent.trim().length>=16);
 btn.classList.toggle('sd-verylong-label',title.textContent.trim().length>=27);
 if(!btn.getAttribute('aria-label'))btn.setAttribute('aria-label', [title.textContent,desc?.textContent].filter(Boolean).join(' – '));
 refreshCard(btn);return btn;
}
const GROUPS=[
 ['#sd52 .sd52-grid','school'],['#sd52 .sd-ui-grid','school'],['#sdCurriculum .sd-grid','curriculum'],['#sdCurriculum .sd-ui-grid','curriculum'],
 ['#vlastScreen #vlUnits','geography'],['#subjectHub .hub-cards','hub'],['#advSubjectMenu .adv-menu-cards','adventure'],
 ['#v496TopicPanel #v496Topics','math'],['#czechScreen .v29-panel > .v29-actions','czech'],
 ['#sdCzechHub5074 .sd-ui-grid','czech'],['#enUnit499 #en499topics','english'],['#homeScreen .subject-grid','cover']];
const selectors=GROUPS.map(i=>i[0]).join(',');
function cover(el){if(!el.classList.contains('subject')||el.classList.contains('sd-layer-cover'))return;
 const key=el.classList.contains('math')?'matematika':el.classList.contains('czech')?'cestina':el.classList.contains('english')?'anglictina':el.classList.contains('nature')?'prirodoveda':el.classList.contains('history')?'vlastiveda':el.classList.contains('music')?'hudebni_vychova':null;
 if(!key)return;el.classList.add('sd-layer-cover');el.dataset.layerSubject=key;
 const node=svg(`${PATH}text/subjects/${theme()}/${key}.svg`,'subject');node.classList.add('sd-subject-title-svg');el.append(node);
}
function scan(root=document){for(const [sel,group] of GROUPS){let containers=[];if(root.matches?.(sel))containers.push(root);root.querySelectorAll?.(sel).forEach(el=>containers.push(el));for(const el of containers){el.classList.add('sd-ui-grid');if(group==='cover'){el.classList.add('sd-ui-grid--covers');[...el.children].forEach(cover);continue}for(const btn of el.children)if(btn.tagName==='BUTTON')decorate(btn,group)}}}
function html({title,description='',icon='auto',attrs='',className=''}){let key=icon;if(icon==='auto'){const d={};for(const k of ['act','mode','sub','sd-icon']){const m=attrs.match(new RegExp('data-'+k+'="([^"]+)"'));if(m)d[k==='sd-icon'?'sdIcon':k]=m[1]}key=iconFor({dataset:d,querySelector:()=>({textContent:title}),textContent:title},'school')}
 const ico=iconKey(key),final=svgKeys.has(ico)?ico:'vyuka';return `<button type="button" class="sd-ui-card ${escapeHTML(className)}" data-sd-layer-icon="${escapeHTML(final)}" ${attrs}><strong class="sd-ui-card__title">${escapeHTML(title)}</strong>${description?`<small class="sd-ui-card__desc">${escapeHTML(description)}</small>`:''}</button>`}
const grid=(cards,className='')=>`<div class="sd-ui-grid ${escapeHTML(className)}">${cards.join('')}</div>`;
function button(c){let tmp=document.createElement('template');tmp.innerHTML=html(c);return decorate(tmp.content.firstElementChild,'school')}
let pending=false;function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;scan()})}
function start(){scan();const mo=new MutationObserver(rs=>{for(const r of rs){if(r.type==='attributes'&&r.attributeName==='data-card-style'){document.querySelectorAll('button.sd-layered').forEach(refreshCard);document.querySelectorAll('.sd-subject-title-svg').forEach(img=>{const k=img.parentElement?.dataset.layerSubject;if(k)img.src=`${PATH}text/subjects/${theme()}/${k}.svg`});continue}
 if(r.type==='childList'&&([...(r.addedNodes||[])].some(n=>n.nodeType===1&&(n.matches?.(selectors)||n.querySelector?.(selectors)))||r.target?.matches?.(selectors)||r.target?.closest?.(selectors))){schedule();return}}});mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-card-style']})}
window.SDUICards=Object.freeze({html,grid,button,decorate,scan,iconFor,refreshCard,version:'50.8.0'});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
