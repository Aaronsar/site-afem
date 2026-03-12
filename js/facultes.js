/* ========================================
   AFEM — Facultés Search & Filters
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.fac-search');
  const filterBtns = document.querySelectorAll('.fac-filter-btn');
  const facCards = document.querySelectorAll('.fac-card');
  const counter = document.querySelector('.fac-counter strong');
  const noResults = document.querySelector('.fac-no-results');

  if (!facCards.length) return;

  let activeRegion = 'all';

  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visible = 0;

    facCards.forEach(card => {
      const name = card.dataset.name || '';
      const region = card.dataset.region || '';
      const matchesSearch = !query || name.includes(query);
      const matchesRegion = activeRegion === 'all' || region === activeRegion;

      if (matchesSearch && matchesRegion) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (counter) counter.textContent = visible;
    if (noResults) {
      noResults.classList.toggle('visible', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRegion = btn.dataset.filter;
      filterCards();
    });
  });

  // FAQ accordion (for detail pages)
  document.querySelectorAll('.fac-faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.fac-faq-item');
      item.classList.toggle('open');
    });
  });
});
