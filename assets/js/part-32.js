
(()=>{
const math=document.getElementById('mathScreen'),setup=document.getElementById('setup');
if(!math||!setup)return;
const head=document.createElement('div');head.id='v497TopicHead';head.hidden=true;
head.innerHTML='<button type="button" id="v497ChooseOther">← Jiný příklad</button><h2 id="v497SelectedTitle">Matematika</h2>';
setup.prepend(head);
const tail=setup.querySelector('.newbox');if(tail)tail.id='v497TailSection';
document.getElementById('v497ChooseOther').addEventListener('click',()=>{
 math.classList.remove('v497-topic');math.dataset.topic='';
 document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('visible',x.id==='mathScreen'));
 document.getElementById('v496TopicPanel').classList.add('open');document.body.style.overflow='hidden';
});
// The topic selector uses existing practice engines. Keep settings and event handlers intact.
const start=document.getElementById('start');if(start)start.addEventListener('click',()=>{
 if(math.classList.contains('v497-topic')){setTimeout(()=>document.getElementById('game')?.scrollIntoView({block:'start'}),70)}
});
})();

