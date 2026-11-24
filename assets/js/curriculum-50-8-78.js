/* 50.8.78 – knihovna školního učiva: návrh, náhled, zveřejnění a procvičování. */
(()=>{'use strict';
const KEY='sd878_extra_practice_',CACHE='sd878_catalog_snapshot';
const SUBJECTS={math:'Matematika',czech:'Čeština',english:'Angličtina',nature:'Přírodověda',geography:'Vlastivěda',vocational:'Autoelektrikář'};
const $=id=>document.getElementById(id);
const cloud=()=>window.SDCloud866;
const isParent=()=>document.body.classList.contains('parent-role')&&!!cloud()?.isReady?.();
const q=(host,tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;host.append(n);return n};
const button=(host,text,cb,cls='')=>{const b=q(host,'button',text,'sd878-ctl '+cls);b.type='button';b.onclick=cb;return b};
const msg=(host,text,bad=false)=>{const el=q(host,'p',text,bad?'sd878-error':'sd878-note');return el};
const request=async(path,opts={})=>cloud().requestParent('/rest/v1/'+path,opts);
const childRequest=async(path,opts={})=>cloud().requestCloud('/rest/v1/'+path,opts);
let familyId=null,ownerId=null;
async function getFamily(){if(familyId)return familyId;if(!isParent())throw Error('Pro úpravu učiva nejprve přihlas rodičovský cloud v Nastavení.');const a=await request('sd_families?select=id,owner_id&limit=1');if(!a[0])throw Error('Rodina není připojená');familyId=a[0].id;ownerId=a[0].owner_id;return familyId}
function safeRows(str,kind){
 const lines=str.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(kind==='vocabulary'){
  const pairs=[];
  for(const l of lines){const p=l.includes('=')?l.split('='):l.split('|');if(p.length!==2||!p[0].trim()||!p[1].trim())throw Error('Slovíčko musí mít tvar anglicky = česky.');
   pairs.push({word:p[0].trim().slice(0,100),meaning:p[1].trim().slice(0,120)})}
  if(pairs.length<2||pairs.length>200)throw Error('Zadej 2 až 200 slovíček.');return {pairs};
 }
 if(kind==='quiz'){
  const questions=lines.map(l=>{const p=l.split('|').map(x=>x.trim());if(p.length!==4||p.some(x=>!x))throw Error('Otázka: otázka | správná odpověď | možnost B | možnost C');
    return {question:p[0].slice(0,350),answers:p.slice(1).map(x=>x.slice(0,170)),correct:0}});
  if(questions.length<3||questions.length>200)throw Error('Test musí mít alespoň tři různé otázky (max. 200).');
  return {questions};
 }
 const text=str.trim();if(text.length<40||text.length>18000)throw Error('Výukový text musí mít alespoň 40 znaků (max. 18 000).');
 return {text};
}
function payloadText(item){
 if(item.kind==='vocabulary')return (item.payload?.pairs||[]).map(p=>p.word+' = '+p.meaning).join('\n');
 if(item.kind==='quiz')return (item.payload?.questions||[]).map(p=>[p.question,...p.answers].join(' | ')).join('\n');
 return item.payload?.text||'';
}
const lessons=Array.from({length:10},(_,i)=>['Září','Říjen','Listopad','Prosinec','Leden','Únor','Březen','Duben','Květen','Červen'][i]);
async function load(parent,schoolId,grade,subject){
 const id=await getFamily();
 return request('sd_878_curriculum?family_id=eq.'+id+'&school_id=eq.'+encodeURIComponent(schoolId)+'&grade=eq.'+grade+'&subject=eq.'+subject+'&select=*&order=created_at.desc');
}
function mountEditor(host,school,grade,subject){
 host.replaceChildren();
 msg(host,'Výuka, procvičování i testy. Nejdříve ulož návrh, pak jej vyzkoušej a zveřejni dětem.');
 const control=q(host,'div',undefined,'sd878-editor-card');
 const status=q(control,'p','Načítám skutečný obsah školy…','sd878-note');
 const list=q(control,'div',undefined,'sd878-content-list');
 const form=q(host,'form',undefined,'sd878-editor-form');
 const head=q(form,'h4','Přidat vlastní učivo');
 const titleLabel=q(form,'label','Název lekce');
 const title=q(titleLabel,'input');title.type='text';title.required=true;title.maxLength=180;title.placeholder='Např. Jídlo a pití';
 const kindLabel=q(form,'label','Typ obsahu');
 const kind=q(kindLabel,'select');
 for(const [v,t] of [['vocabulary','Anglická slovíčka'],['quiz','Otázky a test'],['lesson','Výukový text']]){
  const opt=q(kind,'option',t);opt.value=v;
 }
 if(subject!=='english')kind.querySelector('[value="vocabulary"]').hidden=true;
 if(subject!=='english')kind.value='quiz';
 const bodyLabel=q(form,'label','Obsah');
 const field=q(bodyLabel,'textarea');field.rows=9;field.required=true;field.placeholder='';
 const hint=q(form,'p','','sd878-note');
 function help(){
  field.placeholder=kind.value==='vocabulary'?'apple = jablko\nmilk = mléko':kind.value==='quiz'?'Kolik je 8 × 7? | 56 | 54 | 64\nKolik je 9 × 6? | 54 | 48 | 63\nKolik je 7 × 7? | 49 | 42 | 48':'Vysvětlení tématu a příklady…';
  hint.textContent=kind.value==='quiz'?'Každá otázka na samostatném řádku: otázka | správná odpověď | další možnost | další možnost. Minimum tři otázky.':kind.value==='vocabulary'?'Každý řádek má tvar anglicky = česky. Alespoň dvě slovíčka.':'Vysvětlení učiva, které děti uvidí v lekci.';
 }
 kind.onchange=help;help();
 const row=q(form,'div',undefined,'sd878-row');
 const save=button(row,'Uložit návrh',()=>{},'sd878-primary');save.type='submit';
 const clear=button(row,'Nová položka',()=>{editId=null;form.reset();title.value='';help();},'');
 let editId=null,editDate=null,items=[];
 function preview(item,host){
  const box=q(host,'div',undefined,'sd878-preview');
  q(box,'strong',item.title);
  if(item.kind==='vocabulary')(item.payload?.pairs||[]).forEach(p=>q(box,'p',p.word+' — '+p.meaning));
  else if(item.kind==='quiz')(item.payload?.questions||[]).forEach((p,i)=>q(box,'p',(i+1)+'. '+p.question+'  ✓ '+p.answers[p.correct||0]));
  else q(box,'p',item.payload?.text||'');
 }
 function render(){
  list.replaceChildren();status.textContent=items.length?'Položek v této škole, ročníku a předmětu: '+items.length:'Zatím není přidané vlastní učivo. Původní měsíční plány zůstávají zachované.';
  for(const item of items){
   const card=q(list,'article',undefined,'sd878-lesson');
   q(card,'strong',item.title);q(card,'small',(item.status==='published'?'Zveřejněno':'Návrh')+' · '+({vocabulary:'Slovíčka',quiz:'Test',lesson:'Výuka'}[item.kind]));
   const buttons=q(card,'div',undefined,'sd878-row');
   button(buttons,'Prohlédnout',()=>{const current=card.querySelector('.sd878-preview');if(current)current.remove();else preview(item,card)});
   button(buttons,'Upravit',()=>{editId=item.id;editDate=item.updated_at;title.value=item.title;kind.value=item.kind;field.value=payloadText(item);help();form.scrollIntoView({block:'center'});});
   button(buttons,item.status==='draft'?'Zveřejnit dětem':'Vrátit do návrhů',async()=>{
    if(item.status==='draft'&&!confirm('Zveřejnit tuto lekci všem dětem s přístupem k dané škole?'))return;
    try{
     const state=item.status==='draft'?'published':'draft';
     const result=await request('sd_878_curriculum?id=eq.'+item.id+'&updated_at=eq.'+encodeURIComponent(item.updated_at),{method:'PATCH',headers:{Prefer:'return=representation'},body:{status:state,updated_at:new Date().toISOString()}});
     if(!result.length)throw Error('Lekce se mezitím změnila. Znovu načti seznam.');
     await refresh();
    }catch(e){alert(e.message)}
   },item.status==='draft'?'sd878-primary':'');
   button(buttons,'Smazat',async()=>{if(!confirm('Trvale smazat vlastní položku "'+item.title+'"? Původních školních plánů se to netýká.'))return;
     try{await request('sd_878_curriculum?id=eq.'+item.id,{method:'DELETE'});await refresh()}catch(e){alert(e.message)}
   },'sd878-danger');
  }
 }
 async function refresh(){
  try{items=await load(true,school.id,grade,subject);render();
   try{localStorage.setItem(CACHE,JSON.stringify(items.filter(x=>x.status==='published')))}catch{}
  }catch(e){status.textContent='Učivo nelze načíst: '+e.message;status.className='sd878-error'}
 }
 form.onsubmit=async e=>{
  e.preventDefault();
  if(!isParent()){alert('Přihlas rodinný cloud.');return}
  try{
   const name=title.value.trim(),payload=safeRows(field.value,kind.value);
   const now=new Date().toISOString();
   const patch={title:name,kind:kind.value,payload,status:'draft',updated_at:now};
   let result;
   if(editId){result=await request('sd_878_curriculum?id=eq.'+editId+'&updated_at=eq.'+encodeURIComponent(editDate),{method:'PATCH',headers:{Prefer:'return=representation'},body:patch});if(!result.length)throw Error('Lekce byla upravena jinde. Načti ji znovu.')}
   else{
    const familyId=await getFamily();
    result=await request('sd_878_curriculum',{method:'POST',headers:{Prefer:'return=representation'},body:{...patch,family_id:familyId,school_id:school.id,grade,subject,created_by:ownerId}});
   }
   editId=null;editDate=null;form.reset();help();await refresh();status.textContent='Návrh uložen. Před zveřejněním si jej prohlédni.';
  }catch(err){alert('Učivo se neuložilo: '+err.message)}
 };
 refresh();return host;
}
async function listChild(){
 if(window.__SD878Preview){
  try{return JSON.parse(localStorage.getItem(CACHE)||'[]')}catch{return []}
 }
 return childRequest('sd_878_curriculum?status=eq.published&select=*&order=created_at.desc');
}
function lessonOverlay(){
 let root=$('sd878LessonOverlay');if(root)return root;
 root=document.createElement('section');root.id='sd878LessonOverlay';root.hidden=true;root.innerHTML='<div class="sd878-learner"><div class="sd878-learner-head"><h2>Doplněné učivo</h2><button id="sd878LessonClose" type="button">Zavřít</button></div><div id="sd878LessonContent"></div></div>';
 document.body.append(root);
 root.querySelector('#sd878LessonClose').onclick=()=>{root.hidden=true};
 return root;
}
function subjectName(key){return SUBJECTS[key]||key}
function activeId(){return sessionStorage.getItem('skolni-live-v441')||''}
function savePractice(item,correct,total){
 const pid=activeId();if(!pid||pid==='parent')return;
 const key=KEY+pid;
 let p={};try{p=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
 const current=p[item.id]||{attempts:0,correct:0,total:0};
 p[item.id]={attempts:current.attempts+1,correct:current.correct+correct,total:current.total+total,updated_at:new Date().toISOString(),title:item.title,subject:item.subject,school_id:item.school_id};
 localStorage.setItem(key,JSON.stringify(p));
 window.dispatchEvent(new CustomEvent('sd878-practice-updated',{detail:{profile:pid,subject:item.subject}}));
}
function practiceItem(item,content){
 content.replaceChildren();
 button(content,'← Všechny lekce',()=>renderChildList(content),'');
 q(content,'h3',item.title);q(content,'small',subjectName(item.subject));
 if(item.kind==='lesson'){q(content,'p',item.payload?.text||'');return}
 const questions=item.kind==='vocabulary'?(item.payload?.pairs||[]).map(p=>({question:'Co znamená „'+p.word+'“?',answers:[p.meaning,...(item.payload?.pairs||[]).filter(x=>x.word!==p.word).slice(0,2).map(x=>x.meaning)],correct:0})):(item.payload?.questions||[]);
 if(!questions.length){msg(content,'Zatím nejsou dostupné žádné otázky.');return}
 let idx=0,correct=0;const panel=q(content,'div',undefined,'sd878-question');
 const show=()=>{
  panel.replaceChildren();
  if(idx>=questions.length){q(panel,'h3','Hotovo!');q(panel,'p','Správně '+correct+' / '+questions.length);
   savePractice(item,correct,questions.length);button(panel,'Zkusit znovu',()=>{idx=0;correct=0;show()},'sd878-primary');return}
  const it=questions[idx];q(panel,'h4',(idx+1)+'. '+it.question);
  const choices=it.answers.map((text,i)=>({text,valid:i===Number(it.correct||0)})).sort(()=>Math.random()-.5);
  for(const choice of choices)button(panel,choice.text,()=>{
   if(choice.valid)correct++;
   [...panel.querySelectorAll('button')].forEach(b=>b.disabled=true);
   const info=q(panel,'strong',choice.valid?'Správně':'Zkus to příště','sd878-feedback');
   info.classList.toggle('correct',choice.valid);setTimeout(()=>{idx++;show()},850);
  });
 };
 show();
}
async function renderChildList(host){
 host.replaceChildren();msg(host,'Přidané lekce z rodinné knihovny. Výsledky procvičování se ukládají do tvého profilu.');
 try{
  const data=await listChild();
  const pid=activeId(),schoolData=window.SDGradeSchools871?.read?.()||{};
  const schools=schoolData.assignments?.[pid]||[];
  const vocational=window.SDGradeSchools871?.vocational?.(pid);
  const list=data.filter(item=>{
   if(item.school_id==='stredni_'+pid)return vocational&&Number(vocational.grade)===Number(item.grade);
   return schools.includes(item.school_id)&&(!window.SDGradeSchools871?.grade?.(pid,item.school_id)||window.SDGradeSchools871.grade(pid,item.school_id)===item.grade);
  });
  if(!list.length){msg(host,'Pro přiřazené školy a ročníky zatím není zveřejněné vlastní učivo.');return}
  for(const item of list){
   const b=button(host,item.title+' · '+subjectName(item.subject)+' · '+item.grade+'. ročník',()=>practiceItem(item,host),'sd878-lesson-launch');b.classList.add('sd878-full');
  }
 }catch(err){msg(host,'Nové učivo nyní nejde načíst: '+err.message,true)}
}
function openChild(){
 const panel=lessonOverlay();panel.hidden=false;renderChildList($('sd878LessonContent'));
}
function boot(){
 lessonOverlay();
 const home=$('homeScreen');if(!home||$('sd878ChildEntry'))return;
 const b=document.createElement('button');b.id='sd878ChildEntry';b.type='button';b.textContent='📚 Doplněné učivo školy';b.onclick=openChild;
 home.querySelector('.app')?.append(b);
 const refresh=()=>{b.hidden=!document.body.classList.contains('child-role')};
 refresh();window.addEventListener('school-account',refresh);
}
window.SDCurriculum878={mountEditor,openChild,subjects:SUBJECTS};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();