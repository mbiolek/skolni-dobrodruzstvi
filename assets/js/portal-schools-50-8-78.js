/* 50.8.78 – Škola → ročník → předmět → přehled učiva a jeho editor. */
(()=>{'use strict';
const SUBJECTS={math:['Matematika','📐'],czech:['Český jazyk','📖'],english:['Angličtina','🇬🇧'],nature:['Přírodověda','🌿'],geography:['Vlastivěda','🌍'],vocational:['Autoelektrikář','🔧']};
const el=(host,tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;host.append(n);return n};
const btn=(host,text,cb,cls)=>{const b=el(host,'button',text,'sd878-btn '+(cls||''));b.type='button';b.onclick=cb;return b};
const gradeList=()=>Array.from({length:9},(_,i)=>i+1);
function show(){
 const host=document.getElementById('sd878Schools');if(!host)return;host.replaceChildren();
 el(host,'p','Vyber školu, ročník a předmět. Uvidíš původní učivo a můžeš přidávat vlastní výuku, slovíčka nebo otázky. Zveřejnit dětem lze až po kontrole návrhu.','sd878-description');
 const db=window.SDGradeSchools871?.read?.()||{schools:[],assignments:{},enrollments:{},plans:{}};
 const schoolList=[...(db.schools||[])];
 let profiles={};try{profiles=JSON.parse(localStorage.getItem('matematika-karticky-progress-v3-profiles')||'{}')}catch{}
 const martin=Object.entries(profiles).find(([,p])=>p?.name&&/martin/i.test(p.name));
 if(martin){
  const v=window.SDGradeSchools871?.vocational?.(martin[0]);
  if(v?.school)schoolList.push({id:'stredni_'+martin[0],name:v.school,city:v.location||'Střední škola',vocational:true,currentGrade:Number(v.grade)||3});
 }
 const all=el(host,'div',undefined,'sd878-school-tree');
 for(const school of schoolList){
  const card=el(all,'details',undefined,'sd878-tree-school');
  el(card,'summary',(school.city||'Škola')+' – '+school.name);
  const currentGrades=school.vocational?[school.currentGrade]:[...new Set([
   ...Object.values(db.enrollments||{}).map(v=>v?.[school.id]?.grade).filter(n=>Number.isInteger(n)&&n>=1&&n<=9),5])].sort((a,b)=>a-b);
  const node=el(card,'div',undefined,'sd878-grade-list');
  const paintGrade=grade=>{
   const item=el(node,'details',undefined,'sd878-tree-grade');item.open=!node.querySelector('details');
   el(item,'summary',grade+'. ročník');
   const subjects=school.vocational?{vocational:SUBJECTS.vocational}:{math:SUBJECTS.math,czech:SUBJECTS.czech,english:SUBJECTS.english,nature:SUBJECTS.nature,geography:SUBJECTS.geography};
   const grid=el(item,'div',undefined,'sd878-subject-grid');
   for(const [subject,[label,icon]] of Object.entries(subjects)){
    const stored=Object.entries(db.plans||{}).filter(([k,topics])=>k.startsWith(school.id+'|')&&k.includes('|'+subject+'|')&&Array.isArray(topics));
    const existing=stored.reduce((n,[,topics])=>n+topics.length,0);
    btn(grid,icon+' '+label+' · '+existing+' témat',()=>{
     const pane=document.getElementById('sd878SubjectEditor');pane.hidden=false;pane.replaceChildren();
     el(pane,'h3',school.name+' · '+grade+'. ročník · '+label);
     if(window.SDCurriculum878?.mountEditor)window.SDCurriculum878.mountEditor(pane,school,grade,subject);
     else el(pane,'p','Editor učiva se nepodařilo načíst.');
     pane.scrollIntoView({block:'start',behavior:'smooth'});
    },'sd878-subject-tile');
   }
  };
  currentGrades.forEach(paintGrade);
  if(!school.vocational){
   const extra=el(card,'div',undefined,'sd878-add-grade');
   const sel=el(extra,'select');
   gradeList().forEach(g=>{const op=el(sel,'option',g+'. ročník');op.value=String(g)});
   btn(extra,'Otevřít další ročník',()=>{
    const g=Number(sel.value);
    let found=[...node.children].find(x=>x.querySelector('summary')?.textContent===g+'. ročník');
    if(!found){paintGrade(g);found=node.lastElementChild}
    found.open=true;found.scrollIntoView({block:'nearest'});
   });
  }
 }
 if(!schoolList.length)el(all,'p','Zatím nejsou přidány žádné školy.');
 const editor=el(host,'div',undefined,'sd878-subject-editor');editor.id='sd878SubjectEditor';editor.hidden=true;
 const actions=el(host,'div',undefined,'sd878-row');
 btn(actions,'Spravovat školy a měsíční plány',()=>window.SDSchoolPlans52?.manage?.(true),'sd878-primary');
}
window.SDPortalSchools878={show};
})();