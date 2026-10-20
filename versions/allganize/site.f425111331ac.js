function wireTabs(buttonSelector, panelSelector, cardSelector) {
 const tabs=[...document.querySelectorAll(buttonSelector)];
 const panels=[...document.querySelectorAll(panelSelector)];
 const select=(tab)=>{
  tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;if(cardSelector)t.closest(cardSelector).classList.toggle('active',active)});
  panels.forEach(p=>p.hidden=p.id!==tab.getAttribute('aria-controls'));
 };
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab));
  tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(tabs[n]);tabs[n].focus()});
 });
}
wireTabs('.level-pick','.level-panel','.level-card');
wireTabs('.program-tab','.program-panel');
