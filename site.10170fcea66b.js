for (const list of document.querySelectorAll('[role="tablist"]')) {
  const tabs=[...list.querySelectorAll('[role="tab"]')];
  const activate=(tab)=>{for(const item of tabs){const on=item===tab;item.setAttribute('aria-selected',String(on));item.tabIndex=on?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!on;}};
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let target;if(e.key==='ArrowRight')target=tabs[(index+1)%tabs.length];if(e.key==='ArrowLeft')target=tabs[(index-1+tabs.length)%tabs.length];if(e.key==='Home')target=tabs[0];if(e.key==='End')target=tabs[tabs.length-1];if(target){e.preventDefault();activate(target);target.focus();}});});
}
for(const details of document.querySelectorAll('.faq-content details')){details.addEventListener('toggle',()=>{details.querySelector('summary b').textContent=details.open?'−':'+';});}
