/* 50.8.33 — jednotné zelené potvrzení a bezpečný automatický přechod. */
(()=>{'use strict';
 const pending=new WeakMap();
 function mark(target){if(target)target.classList.add('sd833-correct')}
 function afterCorrect(anchor,callback,delay=900,guard=()=>true){
  if(!anchor||typeof callback!=='function')return;
  const old=pending.get(anchor);if(old)clearTimeout(old);
  const timer=setTimeout(()=>{pending.delete(anchor);if(anchor.isConnected&&guard())callback()},delay);
  pending.set(anchor,timer);
 }
 window.SDAutoAnswer833=Object.freeze({mark,afterCorrect});
})();
