(function(){
  const old=document.getElementById('authExit');const switcher=document.getElementById('themeSwitcher');
  if(!old||!switcher)return;
  const bar=document.createElement('div');bar.id='v43-toolbar';bar.setAttribute('role','navigation');bar.setAttribute('aria-label','Ovládání aplikace');
  const name=document.createElement('strong');name.textContent='🎒 Školní dobrodružství';name.style.cssText='font:800 12px system-ui;color:#fff;max-width:46%;line-height:1.2';
  const theme=document.createElement('button');theme.id='v43-theme-toggle';theme.type='button';theme.textContent='🎨 Prostředí';theme.setAttribute('aria-expanded','false');theme.setAttribute('aria-controls','themeSwitcher');
  theme.addEventListener('click',function(){const open=document.body.classList.toggle('v43-themes-open');theme.setAttribute('aria-expanded',String(open));});
  switcher.parentNode.insertBefore(bar,switcher);bar.append(name,theme,old);
  switcher.querySelectorAll('button[data-theme]').forEach(function(btn){btn.addEventListener('click',function(){document.body.classList.remove('v43-themes-open');theme.setAttribute('aria-expanded','false');});});
  function sync(){name.style.color=document.body.dataset.gameTheme==='c'?'#173f79':'#fff';}
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-game-theme']});sync();
})();
