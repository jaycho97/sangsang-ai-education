function makeTabs(tabSelector, panelSelector, dataKey) {
  const tabs = [...document.querySelectorAll(tabSelector)];
  const panels = [...document.querySelectorAll(panelSelector)];
  function select(tab) {
    tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
    panels.forEach(p=>p.hidden=p.id!==tab.getAttribute('aria-controls'));
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',e=>{
      let next;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=tabs.length-1;
      else return;
      e.preventDefault();select(tabs[next]);tabs[next].focus();
    });
  });
}
makeTabs('.level-tab','.level-panel');
makeTabs('.case-tab','.case-photo');
