/* ============================================================
   НЕЙРОПИЛОТ — интерактив презентации
   ============================================================ */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const dotsWrap = document.getElementById('dots');
  const progressBar = document.getElementById('progress-bar');
  const counter = document.getElementById('slide-counter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let current = 0;

  /* ---------- Построение точек навигации ---------- */
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', s.dataset.title || ('Слайд ' + (i + 1)));
    b.title = s.dataset.title || ('Слайд ' + (i + 1));
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  /* ---------- Reveal через IntersectionObserver ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Отслеживание активного слайда (по позиции скролла) ---------- */
  function computeActive() {
    // «Линия чтения» — точка экрана, по которой определяем активный слайд
    const marker = window.scrollY + window.innerHeight * 0.4;
    let idx = 0;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].offsetTop <= marker) {
        idx = i;
      } else {
        break;
      }
    }
    // На самом низу документа — принудительно последний слайд
    const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 2);
    if (atBottom) idx = slides.length - 1;
    if (idx !== current) setActive(idx);
  }

  function setActive(idx) {
    current = idx;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (counter) counter.textContent = (idx + 1) + ' / ' + total;
  }

  function goTo(idx) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Прогресс-бар (по скроллу документа) ---------- */
  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- Единый обработчик скролла ---------- */
  function onScroll() {
    updateProgress();
    computeActive();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- Кнопки навигации ---------- */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ---------- Клавиатура ---------- */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault(); goTo(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); goTo(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault(); goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault(); goTo(total - 1);
    }
  });

  /* ---------- Инициализация ---------- */
  setActive(0);
  updateProgress();
  computeActive();

  // Первый экран — мгновенно показать reveal
  slides[0].querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
})();

