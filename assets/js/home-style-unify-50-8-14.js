/* 50.8.14 — home screen uses the same layered card system as the rest of the app. */
(()=>{'use strict';
const ICON_BY_CLASS={
 math:'nasobeni',english:'a_an',czech:'slovni_druhy',nature:'priroda',history:'mapa_a_kompas',music:'noty'
};
function kindOf(el){return Object.keys(ICON_BY_CLASS).find(k=>el.classList.contains(k))||null}
function replaceDivWithButton(el){
 if(!el || el.tagName==='BUTTON')return el;
 const b=document.createElement('button'); b.type='button';
 for(const a of [...el.attributes]){ if(a.name==='role') continue; b.setAttribute(a.name,a.value); }
 b.className=el.className;
 b.innerHTML=el.innerHTML;
 el.replaceWith(b);
 return b;
}
function prepare(el){
 const key=kindOf(el); if(!key) return null;
 let node=replaceDivWithButton(el);
 node.classList.add('sd814-unified-home-card','sd-ui-card');
 node.dataset.sdLayerIcon=ICON_BY_CLASS[key];
 node.querySelector(':scope > img.sd812-home-art')?.remove();
 node.querySelector(':scope > .sd-subject-title-svg')?.remove();
 node.querySelectorAll(':scope > .sd-layer-art,:scope > .sd-layer-caption').forEach(n=>n.remove());
 return node;
}
function decorateAll(){
 if(!window.SDUICards?.decorate) return;
 const sels=['#homeScreen .subject-grid .subject','#homeScreen .v23-extra-grid .subject'];
 document.querySelectorAll(sels.join(',')).forEach(tile=>{
   const node=prepare(tile); if(!node) return;
   window.SDUICards.decorate(node,'school');
 });
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(decorateAll))}
function init(){
 schedule();
 document.addEventListener('sd-card-style-change',schedule);
 document.addEventListener('sd87-cards-ready',schedule);
 const mo=new MutationObserver(rs=>{for(const r of rs){if(r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-card-style'){schedule();return}
 if(r.type==='childList'&&([...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('#homeScreen,.subject-grid,.v23-extra-grid,.subject')||n.querySelector?.('#homeScreen .subject,.v23-extra-grid .subject'))))){schedule();return}}});
 mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-card-style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.SDHomeStyleUnify50814=Object.freeze({refresh:schedule,version:'50.8.14'});
})();
