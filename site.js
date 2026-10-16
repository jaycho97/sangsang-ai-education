(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
    });
  });
  for (const selector of ['.program', '.faq']) {
    const group = [...document.querySelectorAll(selector)];
    group.forEach(details => details.addEventListener('toggle', () => {
      if (details.open) group.forEach(other => { if (other !== details) other.open = false; });
    }));
  }
  const dialog = document.getElementById('case-dialog');
  document.querySelectorAll('.case-card').forEach(card => card.addEventListener('click', () => {
    const photo = card.querySelector('img');
    const image = document.getElementById('case-dialog-image');
    image.src = photo.getAttribute('src');
    image.alt = photo.alt;
    document.getElementById('case-dialog-company').textContent = card.querySelector('small').textContent;
    document.getElementById('case-dialog-title').textContent = card.querySelector('strong').textContent;
    dialog.showModal();
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.dialog-consult').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
})();
