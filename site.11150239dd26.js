const header = document.querySelector('.site-header');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 90);
window.addEventListener('scroll', updateHeader, {passive:true});
updateHeader();

function selectAudience(id, focus = false) {
  document.querySelectorAll('.audience-tab').forEach(tab => {
    const selected = tab.dataset.audience === id;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  document.querySelectorAll('.audience-photo').forEach(photo => {
    const selected = photo.dataset.audience === id;
    photo.classList.toggle('active', selected);
    photo.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.audience-panel').forEach(panel => panel.hidden = panel.id !== `audience-${id}`);
}
document.querySelectorAll('.audience-tab, .audience-photo').forEach(control => control.addEventListener('click', () => selectAudience(control.dataset.audience)));
function wireArrowNavigation(selector, select) {
  const tabs = [...document.querySelectorAll(selector)];
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    else return;
    event.preventDefault(); select(tabs[target]); tabs[target].focus();
  }));
}
wireArrowNavigation('.audience-tab', tab => selectAudience(tab.dataset.audience));
function selectLevel(id) {
  document.querySelectorAll('.level-tab').forEach(tab => {
    const selected = tab.dataset.level === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('.level-panel').forEach(panel => panel.hidden = panel.id !== `level-panel-${id}`);
}
document.querySelectorAll('.level-tab').forEach(tab => tab.addEventListener('click', () => selectLevel(tab.dataset.level)));
wireArrowNavigation('.level-tab', tab => selectLevel(tab.dataset.level));
