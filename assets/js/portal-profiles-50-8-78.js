/* 50.8.78 – správa každého dítěte, školy, třídy, ročníku a PINu na jednom místě. */
(()=>{'use strict';
const P='matematika-karticky-progress-v3-profiles';
const el=(h,t,x,c)=>{const n=document.createElement(t);if(x!==undefined)n.textContent=x;if(c)n.className=c;h.append(n);return n};
const btn=(h,x,f,c)=>{const n=el(h,'button',x,'sd878-btn '+(c||''));n.type='button';n.onclick=f;return n};
const field=(h,x,v='')=>{const l=el(h,'label',x,'sd878-field');const i=el(l,'input');i.value=v;return i};
const select=(h,name,choices,v)=>{const label=el(h,'label',name,'sd878-field'),s=el(label,'select');for(const [value,text] of choices){const o=el(s,'option',text);o.value=String(value)}s.value=String(v);return s};
const years=Array.from({length:9},(_,i)=>{const n=2025+i;return [n+'/'+(n+1),n+'/'+(n+1)]});
const grades=(n=9)=>Array.from({length:n},(_,i)=>[i+1,(i+1)+'. ročník']);
const people=()=>{let p={};try{p=JSON.parse(localStorage.getItem(P)||'{}')}catch{}return Object.entries(p).filter(([id,x])=>id!=='parent'&&x?.name)};
function feedback(s){const el=document.getElementById('sd878PortalMessage');if(el){el.textContent=s;el.hidden=false}}
function legacyPin(pid){
 const index=people().findIndex(([id])=>id===pid);
 const button=document.getElementById('adminChildren')?.querySelectorAll('.authitem')?.[index]?.querySelector('button');
 if(button)button.click();else feedback('Původní nastavení PINu není dostupné. Otevři Pokročilou správu profilů.');
}
function show(){
 const host=document.getElementById('sd878Profiles');if(!host)return;
 host.replaceChildren();
 el(host,'p','Klikni na dítě a uprav školy, třídy a ročníky. Zapomenutý PIN můžeš změnit přímo u jeho profilu.','sd878-description');
 const data=window.SDGradeSchools871?.read?.()||{schools:[],assignments:{},enrollments:{}};
 const grid=el(host,'div',undefined,'sd878-people-grid');
 const kids=people();
 for(const [id,p] of kids){
  const card=el(grid,'article',undefined,'sd878-person-card');
  const heading=el(card,'div',undefined,'sd878-person-heading');
  const img=el(heading,'img');img.src='./assets/avatari/avatar-1-1.webp';img.alt='';img.className='sd878-person-avatar';
  el(heading,'strong',p.name);
  const v=window.SDGradeSchools871?.vocational?.(id);
  const schools=(data.assignments?.[id]||[]).map(sid=>data.schools.find(s=>s.id===sid)).filter(Boolean);
  el(card,'small',v?.school?String(v.school)+' · '+(v.grade||'?')+'. ročník':schools.map(s=>(s.city||s.name)+' · '+(window.SDGradeSchools871?.label?.(id,s.id)||'ročník nezadán')).join(' / ')||'Škola nepřiřazena');
  const details=el(card,'details',undefined,'sd878-person-details');
  el(details,'summary','Nastavení profilu '+p.name);
  const config=el(details,'div',undefined,'sd878-person-content');
  if(/martin/i.test(p.name)&&v){
   const title=field(config,'Střední škola',v.school||'');
   const location=field(config,'Město a adresa',v.location||'');
   const program=field(config,'Obor',v.program||'');
   const grade=select(config,'Ročník',grades(4),v.grade||3);
   const year=select(config,'Školní rok',years,v.schoolYear||'2026/2027');
   btn(config,'Uložit střední školu',()=>{
    const result=window.SDGradeSchools871?.updateVocational?.(id,{school:title.value,location:location.value,program:program.value,grade:Number(grade.value),schoolYear:year.value});
    feedback(result?.ok?'Martinova škola uložena.':result?.error||'Uložení se nezdařilo.');if(result?.ok)show();
   },'sd878-primary');
  }
  for(const school of data.schools||[]){
   const sid=school.id,assigned=schools.some(s=>s.id===sid);
   const section=el(config,'section',undefined,'sd878-school-assignment');
   const label=el(section,'label',undefined,'sd878-check');
   const check=el(label,'input');check.type='checkbox';check.checked=assigned;
   el(label,'span',(school.city||school.name)+' · '+school.name);
   check.onchange=()=>{window.SDGradeSchools871?.assign?.(id,sid,check.checked);feedback('Přiřazení školy změněno.');show()};
   if(!assigned)continue;
   const current=window.SDGradeSchools871?.enrollment?.(id,sid)||{grade:5,className:'',schoolYear:'2026/2027'};
   const grade=select(section,'Ročník',grades(),current.grade);
   const klass=field(section,'Třída (např. 5.B)',current.className||'');
   const year=select(section,'Školní rok',years,current.schoolYear||'2026/2027');
   btn(section,'Uložit třídu a ročník',()=>{
    const result=window.SDGradeSchools871?.update?.(id,sid,{grade:Number(grade.value),className:klass.value,schoolYear:year.value});
    feedback(result?.ok?'Ročník a třída uloženy.':result?.error||'Uložení selhalo.');if(result?.ok)show();
   },'sd878-primary');
  }
  if(schools.length>1){
   const defaults=schools.map(x=>[x.id,(x.city||x.name)+' – '+x.name]);
   const defaultSchool=select(config,'Výchozí škola dítěte',defaults,window.SDSchoolContext827?.defaultSchoolId?.(id)||defaults[0][0]);
   btn(config,'Uložit výchozí školu',()=>{
    window.SDSchoolContext827?.setDefault?.(id,defaultSchool.value);
    feedback('Výchozí škola byla nastavena.');
   },'sd878-primary');
  }
  btn(config,'Obnovit / změnit PIN',()=>legacyPin(id),'sd878-primary');
  el(config,'p','PIN se mění na tomto zařízení. Spárované zařízení používá schválený přístup přes cloud.','sd878-description');
  btn(config,'Přejmenovat profil',()=>{
   const index=people().findIndex(([pid])=>pid===id);
   const control=document.getElementById('adminChildren')?.querySelectorAll('.authitem')?.[index]?.querySelectorAll('button')?.[1];
   if(control){control.click();setTimeout(show,400)}
  });
 }
 const addChild=el(host,'details',undefined,'sd878-add-child');
 el(addChild,'summary','+ Přidat další dítě');
 const name=field(addChild,'Jméno nového dítěte');
 const pincode=field(addChild,'PIN nového dítěte');pincode.type='password';pincode.inputMode='numeric';pincode.maxLength=8;
 btn(addChild,'Vytvořit profil',()=>{
  if(!name.value.trim()||!/^\d{4,8}$/.test(pincode.value)){feedback('Zadej jméno a PIN o 4–8 číslicích.');return}
  const oldName=document.getElementById('adminNewName'),oldPin=document.getElementById('adminNewPin'),create=document.getElementById('adminCreate');
  if(!oldName||!oldPin||!create){feedback('Vytvoření není připraveno.');return}
  oldName.value=name.value.trim();oldPin.value=pincode.value;create.click();name.value='';pincode.value='';
  setTimeout(()=>{show();feedback(document.getElementById('adminMessage')?.textContent||'Vytvoření profilu bylo odesláno.')},750);
 },'sd878-primary');
}
window.SDPortalProfiles878={show};
})();