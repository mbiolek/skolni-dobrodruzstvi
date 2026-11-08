/* Školní dobrodružství 50.8.5
 * Jeden zdroj obrázků pro náhled, hlavní menu i podtémata.
 * Původní HTML <button> a jeho onclick/data-act se nemění.
 * Malba vychází z vyříznutých originálních podkladů 50.8.4; pro neexistující
 * názvy má samostatný vektorový textový štítek na odpovídajícím podkladu.
 */
(()=>{'use strict';
const ROOT='./assets/ui-exact-50-8-4/';
const THEMES=new Set(['guild','stone','glass','parchment']);
const EXACT=new Map([
 ['vyuka','vyuka'],['procvicovani','procvicovani'],
 ['priprava na skolni test','test'],['mesicni plan','mesicni_plan'],
 ['opakovani','opakovani'],['zaverecny test','zaverecny_test']]);
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const titleOf=b=>{
 const e=b.querySelector(':scope > .sd-layer-caption > strong,:scope > .sd-layer-caption > b,:scope > .sd-layer-caption > .sd-ui-card__title');
 return e?.textContent?.replace(/\s+/g,' ').trim()||'';
};
const sizes={"guild":{"mesicni_plan":[420,368],"opakovani":[416,373],"procvicovani":[419,360],"vyuka":[417,357],"zaverecny_test":[421,374],"test":[416,367]},"stone":{"mesicni_plan":[409,363],"opakovani":[411,386],"procvicovani":[405,372],"vyuka":[403,373],"zaverecny_test":[411,386],"test":[405,363]},"glass":{"mesicni_plan":[446,374],"opakovani":[446,388],"procvicovani":[440,390],"vyuka":[437,391],"zaverecny_test":[452,385],"test":[436,375]},"parchment":{"mesicni_plan":[413,385],"opakovani":[413,395],"procvicovani":[413,382],"vyuka":[413,382],"zaverecny_test":[413,395],"test":[413,385]}};
const iconTexts={
 nasobeni:'6×7',deleni:'42÷6',nasobeni_a_deleni:'×  ÷',desitkova_soustava:'1·10·100',nasobky_deseti:'10·20',pisemne_deleni:'48÷6',
 slovni_druhy:'ABC',cisla_slovnich_druhu:'1·2·3',pravopis_a_diktaty:'i / y',kapitoly_podle_ucebnice:'KNIHA',
 a_an:'A / AN',there_is_there_are:'IS / ARE',numbers_0_100:'0–100',rodina_a_jidlo:'FAMILY',skola:'SCHOOL',dum_a_nabytek:'HOME',
 noty:'♫',rytmus:'♬',pisne:'♪',nastroje:'♫',mapa_a_kompas:'✦',historie:'HIST',priroda:'✿',rocni_obdobi:'☀',zvirata:'ZOO',rostliny:'✿',pokusy:'⚗'
};
function baseFor(label,icon){const x=clean(label),i=icon||'';
 if(/vysled|pokrok|statistik/.test(x))return 'zaverecny_test';
 if(/test|zkousk/.test(x))return 'test';
 if(/mesic|kalendar/.test(x))return 'mesicni_plan';
 if(/opakov/.test(x))return 'opakovani';
 if(/procvic|deleni|cvicen/.test(x))return 'procvicovani';
 if(/vyuka|uciv|vysvet|nasoben/.test(x))return 'vyuka';
 if(['moje_vysledky','zaverecny_test','mesicni_plan','opakovani','test','procvicovani','vyuka'].includes(i))return i==='moje_vysledky'?'zaverecny_test':i;
 if(['nasobky_deseti','desitkova_soustava'].includes(i))return 'opakovani';
 if(['deleni','nasobeni_a_deleni','pisemne_deleni'].includes(i))return 'procvicovani';
 if(/nastaven|sprava|skola/.test(x))return 'mesicni_plan';
 return 'vyuka';
}
function wrap(label,max){
 const tokens=String(label).replace(/\s+/g,' ').trim().split(' '), lines=[];let current='';
 for(const t of tokens){if(current && (current+' '+t).length>max){lines.push(current);current=t}else current=(current+' '+t).trim()}
 if(current)lines.push(current);
 if(lines.length>2){return [lines.slice(0,Math.ceil(lines.length/2)).join(' '),lines.slice(Math.ceil(lines.length/2)).join(' ')]}
 return lines;
}
function plate(style,w,h,caption,icon){
 const label=String(caption).trim(),words=wrap(label,style==='guild'?17:style==='stone'?20:style==='glass'?18:19);
 let px=0,py=0,yt=0,fontsize=0,panel='',fontColor='#fff4d8';
 const shadow='<defs><filter id="sd85txtshadow" x="-30%" y="-40%" width="160%" height="200%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.8" flood-color="#170d1a" flood-opacity=".95"/></filter>';
 if(style==='guild'){
  px=w*.165;py=h*.562;yt=h*.699;
  panel=`<path d="M ${w*.09} ${h*.59} Q ${w*.5} ${h*.52} ${w*.91} ${h*.59} L ${w*.87} ${h*.81} Q ${w*.5} ${h*.775} ${w*.13} ${h*.81} Z" fill="url(#blueplate)" stroke="#d1a05d" stroke-width="${w*.008}" opacity=".999"/>`;
  fontsize=(words.length>1?29:label.length>19?27:label.length>15?31:36)*(w/417);fontColor='#fff0c5';
 } else if(style==='stone'){
  px=w*.17;py=h*.723;yt=h*.771;
  panel='';
  fontsize=(words.length>1?28:label.length>19?27:label.length>16?31:38)*(w/403);fontColor='#371b35';
 } else if(style==='glass'){
  px=w*.13;py=h*.59;yt=h*.651;
  panel='';
  fontsize=(words.length>1?29:label.length>18?28:label.length>15?31:39)*(w/437);fontColor='#fff5d9';
 } else {
  px=w*.16;py=h*.554;yt=h*.623;
  panel='';
  fontsize=(words.length>1?28:label.length>18?28:label.length>15?32:39)*(w/413);fontColor='#452818';
 }
 const defs=shadow+`<linearGradient id="blueplate" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#164b7a"/><stop offset=".5" stop-color="#091f44"/><stop offset="1" stop-color="#12284b"/></linearGradient><linearGradient id="parchplate" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff2cc"/><stop offset=".57" stop-color="#f7ddb0"/><stop offset="1" stop-color="#d4a66e"/></linearGradient><linearGradient id="glassplate" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3a5f9a"/><stop offset=".5" stop-color="#334a7d"/><stop offset="1" stop-color="#223c70"/></linearGradient><radialGradient id="tokenplate"><stop stop-color="#5369a7"/><stop offset=".88" stop-color="#1e305f"/><stop offset="1" stop-color="#10213f"/></radialGradient></defs>`;
 const ty=words.length>1?[yt-fontsize*.30,yt+fontsize*.70]:[yt];
 const text=words.map((s,j)=>`<text x="${w*.5}" y="${ty[j]}" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, 'DejaVu Serif', serif" font-size="${fontsize}" font-weight="700" textLength="${Math.min(s.length*fontsize*.56,w*.685)}" lengthAdjust="spacingAndGlyphs" filter="url(#sd85txtshadow)" fill="${fontColor}">${safe(s)}</text>`).join('');
 const ico=iconTexts[icon]||'';
 let token='';if(ico){
  const y=style==='guild'?h*.27:style==='stone'?h*.405:style==='parchment'?h*.285:h*.36;
  const r=style==='guild'?h*.172:style==='stone'?h*.197:style==='parchment'?h*.18:h*.197;
  const font=Math.min(r*.51,Math.max(r*.29, (2.6/ico.length)*r*.9));
  token=`<g class="sd85-topic-symbol"><circle cx="${w*.5}" cy="${y}" r="${r+5}" fill="#b88022" stroke="#ffe69b" stroke-width="4"/><circle cx="${w*.5}" cy="${y}" r="${r}" fill="url(#tokenplate)" stroke="#4d75aa" stroke-width="4"/><circle cx="${w*.5}" cy="${y}" r="${r*.82}" fill="none" stroke="#d9b967" stroke-width="2" opacity=".7"/><text x="${w*.5}" y="${y+font*.32}" text-anchor="middle" fill="#fff3bf" font-family="Georgia,'DejaVu Serif',serif" font-size="${font}" font-weight="800">${safe(ico)}</text></g>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" class="sd85-detail-overlay" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${defs}${token}<g class="sd85-detail-title">${panel}${text}</g></svg>`;
}
function update(btn){
 if(!btn.classList.contains('sd-layered'))return;
 const th=document.body.dataset.cardStyle;
 if(!THEMES.has(th))return;
 const title=titleOf(btn);if(!title)return;
 const exact=EXACT.get(clean(title));const ico=btn.dataset.sdLayerIcon||'';const key=exact||baseFor(title,ico);
 const p=btn.querySelector(':scope > .sd-layer-art');if(!p)return;
 let img=p.querySelector(':scope > .sd84-exact-picture');
 if(!img){img=document.createElement('img');img.className='sd84-exact-picture';img.alt='';img.setAttribute('aria-hidden','true');img.decoding='async';p.append(img)}
 const url=`${ROOT}${th}/${exact?'':'blanks/'}${key}.svg`;
 if(img.getAttribute('src')!==url)img.src=url;
 img.loading='eager';btn.dataset.sd84Key=key;
 btn.classList.add('sd84-exact-card');btn.classList.toggle('sd85-variant',!exact);
 let layer=p.querySelector(':scope > .sd85-detail-overlay');
 if(exact){if(layer)layer.remove();delete btn.dataset.sd85Label;return}
 const [w,h]=sizes[th]?.[key]||sizes[th].vyuka;
 const signature=[th,key,title,ico].join('|');
 if(!layer||btn.dataset.sd85Label!==signature){
  if(layer)layer.remove();
  const tpl=document.createElement('template');tpl.innerHTML=plate(th,w,h,title,ico);
  layer=tpl.content.firstElementChild;p.append(layer);btn.dataset.sd85Label=signature;
 }
}
function navAndTitles(){
 const theme=document.body.dataset.cardStyle;
 if(!THEMES.has(theme))return;
 for(const [which,key] of [['back','zpet'],['home','domu']])for(const b of document.querySelectorAll(`#sd52 header button[data-act="${which}"]`)){
  b.classList.add('sd84-exact-nav');b.style.setProperty('--sd84-nav-img',`url("${ROOT}${theme}/${key}.svg")`);
 }
 // Nadpis se zobrazí v jednotném ozdobném rámu, ne tmavě na tmavém pozadí.
 document.querySelectorAll('#v496TopicPanel .v496-wrap > h2,#v496TopicPanel .v496-wrap > p').forEach(x=>x.classList.add('sd85-visible-heading'));
}
let scheduled=false;
function run(){scheduled=false;document.querySelectorAll('button.sd-layered').forEach(update);navAndTitles()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>requestAnimationFrame(run))}
function setup(){run();const ob=new MutationObserver(rs=>{
 for(const r of rs){
  if(r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-card-style'){schedule();return}
  if(r.type==='childList'&&Array.from(r.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('button.sd-layered,.sd-ui-grid,#sd52main')||n.querySelector?.('button.sd-layered')))){schedule();return}
  if(r.type==='childList'&&r.target?.id==='sd52main'){schedule();return}
 }
 });ob.observe(document.body,{attributes:true,attributeFilter:['data-card-style'],childList:true,subtree:true});
 document.addEventListener('sd-card-style-change',schedule);document.addEventListener('sd-style-preview',schedule);
 window.SDExact5085={scan:run,version:'50.8.5'};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
