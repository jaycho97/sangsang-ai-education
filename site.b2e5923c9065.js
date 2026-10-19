document.querySelectorAll('.learning-tab').forEach((tab,index,tabs)=>{
  const activate=()=>{tabs.forEach((el,i)=>{el.setAttribute('aria-selected',String(i===index));el.tabIndex=i===index?0:-1});document.querySelectorAll('.learning-panel').forEach((panel,i)=>panel.hidden=i!==index)};
  tab.addEventListener('click',activate);
  tab.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();tabs[next].click();tabs[next].focus()});
});

const sectionLinks=[...document.querySelectorAll('.section-nav a')];
const sections=sectionLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
let scrollQueued=false;
const updateSectionNavigation=()=>{
  let current=sections[0];
  for(const section of sections){if(section.getBoundingClientRect().top<=150)current=section;}
  sectionLinks.forEach(link=>{
    const active=link.getAttribute('href')==='#'+current.id;
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  scrollQueued=false;
};
if(sections.length){
  window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateSectionNavigation)}},{passive:true});
  updateSectionNavigation();
}
