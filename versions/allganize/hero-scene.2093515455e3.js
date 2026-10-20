(() => {
  'use strict';
  document.querySelectorAll('.edu-scene').forEach((scene, instance) => {
    if (scene.dataset.eduSceneReady) return;
    scene.dataset.eduSceneReady = 'true';
    const tabs = [...scene.querySelectorAll('button[data-stage]')];
    const panels = [...scene.querySelectorAll('[data-stage-panel]')];
    const counter = scene.querySelector('[data-stage-counter]');
    const finishTag = scene.querySelector('[data-finish-tag]');
    const playback = scene.querySelector('[data-playback]');
    if (tabs.length !== 4 || panels.length !== 4) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused = motion.matches;
    let selected = 0;
    let timer;
    let hovered = scene.matches(':hover');
    let focused = scene.contains(document.activeElement);
    let pageHidden = document.hidden;
    let inView = true;
    tabs.forEach((tab, index) => {
      const prefix = `edu-scene-${instance + 1}`;
      tab.id = `${prefix}-step-${index + 1}`;
      panels[index].id = `${prefix}-panel-${index + 1}`;
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('aria-labelledby', tab.id);
    });
    function render(index) {
      selected = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        const active = i === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (counter) {
        counter.replaceChildren(document.createTextNode(`${String(selected + 1).padStart(2, '0')} `));
        const total = document.createElement('span');
        total.textContent = '/ 04';
        counter.append(total);
      }
      if (finishTag) finishTag.hidden = selected !== 3;
    }
    function schedule() {
      window.clearTimeout(timer);
      if (userPaused || motion.matches || hovered || focused || pageHidden || !inView) return;
      timer = window.setTimeout(() => {
        render(selected + 1);
        schedule();
      }, 4000);
    }
    function renderPlayback() {
      if (!playback) return;
      const label = userPaused ? '자동 전환 재생' : '자동 전환 일시정지';
      playback.hidden = false;
      playback.disabled = motion.matches;
      playback.setAttribute('aria-pressed', String(userPaused));
      playback.setAttribute('aria-label', label);
      playback.title = motion.matches ? '동작 줄이기 설정이 켜져 있어 자동 전환을 사용하지 않습니다.' : label;
      const visibleLabel = playback.querySelector('[data-playback-label]');
      if (visibleLabel) visibleLabel.textContent = userPaused ? '재생' : '일시정지';
    }
    playback?.addEventListener('click', () => {
      if (motion.matches) return;
      userPaused = !userPaused;
      renderPlayback();
      schedule();
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        render(index);
        schedule();
      });
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = tabs.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        render(target);
        tabs[target].focus();
        schedule();
      });
    });
    scene.addEventListener('pointerenter', () => { hovered = true; schedule(); });
    scene.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    scene.addEventListener('focusin', () => { focused = true; schedule(); });
    scene.addEventListener('focusout', () => {
      window.queueMicrotask(() => {
        focused = scene.contains(document.activeElement);
        schedule();
      });
    });
    document.addEventListener('visibilitychange', () => { pageHidden = document.hidden; schedule(); });
    motion.addEventListener('change', () => {
      if (motion.matches) userPaused = true;
      renderPlayback();
      schedule();
    });
    window.addEventListener('pagehide', () => { pageHidden = true; schedule(); });
    window.addEventListener('pageshow', () => { pageHidden = document.hidden; schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.1 }).observe(scene);
    }
    render(0);
    renderPlayback();
    schedule();
  });
})();
