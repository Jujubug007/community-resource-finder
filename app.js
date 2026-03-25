// ── State ──
let activeCategory = 'all';
let searchQuery = '';
let eligibilityFilters = null;

// ── DOM References ──
const searchInput = document.getElementById('searchInput');
const programGrid = document.getElementById('programGrid');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const checkBtn = document.getElementById('checkEligibility');
const clearBtn = document.getElementById('clearEligibility');

// ── Render Programs ──
function renderPrograms() {
  const filtered = PROGRAMS.filter(p => {
    // Category filter
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = [p.name, p.description, p.eligibility, p.benefits, ...p.tags].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Eligibility filters
    if (eligibilityFilters) {
      const { income, hasChildren, isSenior, isVeteran, hasDisability, isUnemployed, isPregnant } = eligibilityFilters;

      if (income && p.incomeLimit < income) return false;
      if (hasChildren && !p.forChildren) return false;
      if (isSenior && !p.forSeniors) return false;
      if (isVeteran && !p.forVeterans) return false;
      if (hasDisability && !p.forDisabled) return false;
      if (isUnemployed && !p.forUnemployed) return false;
      if (isPregnant && !p.forPregnant) return false;
    }

    return true;
  });

  // Update count
  const total = PROGRAMS.length;
  const shown = filtered.length;
  if (activeCategory === 'all' && !searchQuery && !eligibilityFilters) {
    resultsCount.textContent = `Showing all ${total} programs`;
  } else {
    resultsCount.textContent = `Showing ${shown} of ${total} programs`;
  }

  // Show/hide no results
  noResults.style.display = filtered.length === 0 ? 'block' : 'none';
  programGrid.style.display = filtered.length === 0 ? 'none' : 'grid';

  // Render cards
  programGrid.innerHTML = filtered.map((p, i) => {
    const matchBadge = eligibilityFilters
      ? `<span class="eligibility-match"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Likely Eligible</span>`
      : '';

    return `
      <article class="program-card" data-category="${p.category}" style="animation-delay: ${i * 0.03}s">
        <div class="card-header">
          <h3>${p.name}</h3>
          <span class="category-badge ${p.category}">${p.categoryLabel}</span>
        </div>
        ${matchBadge}
        <p class="card-description">${p.description}</p>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">Eligibility</span>
            <span class="detail-value">${p.eligibility}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Benefits</span>
            <span class="detail-value">${p.benefits}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">How to Apply</span>
            <span class="detail-value">${p.howToApply}</span>
          </div>
          ${p.phone ? `<div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${p.phone}</span></div>` : ''}
        </div>
        <div class="card-actions">
          <a href="${p.website}" target="_blank" rel="noopener noreferrer" class="card-link primary-link">
            Visit Website
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </article>
    `;
  }).join('');
}

// ── Event Listeners ──

// Search
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = e.target.value.trim();
    renderPrograms();
  }, 200);
});

// Category filters
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    renderPrograms();
  });
});

// Eligibility check
checkBtn.addEventListener('click', () => {
  const householdSize = document.getElementById('householdSize').value;
  const annualIncome = document.getElementById('annualIncome').value;
  const hasChildren = document.getElementById('hasChildren').checked;
  const isSenior = document.getElementById('isSenior').checked;
  const isVeteran = document.getElementById('isVeteran').checked;
  const hasDisability = document.getElementById('hasDisability').checked;
  const isUnemployed = document.getElementById('isUnemployed').checked;
  const isPregnant = document.getElementById('isPregnant').checked;

  // Only filter if something is selected
  if (!householdSize && !annualIncome && !hasChildren && !isSenior && !isVeteran && !hasDisability && !isUnemployed && !isPregnant) {
    return;
  }

  eligibilityFilters = {
    householdSize: householdSize ? parseInt(householdSize) : null,
    income: annualIncome ? parseInt(annualIncome) : null,
    hasChildren,
    isSenior,
    isVeteran,
    hasDisability,
    isUnemployed,
    isPregnant
  };

  renderPrograms();

  // Scroll to results
  programGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Clear eligibility
clearBtn.addEventListener('click', () => {
  eligibilityFilters = null;
  document.getElementById('householdSize').value = '';
  document.getElementById('annualIncome').value = '';
  document.getElementById('hasChildren').checked = false;
  document.getElementById('isSenior').checked = false;
  document.getElementById('isVeteran').checked = false;
  document.getElementById('hasDisability').checked = false;
  document.getElementById('isUnemployed').checked = false;
  document.getElementById('isPregnant').checked = false;
  renderPrograms();
});

// ── Initial Render ──
renderPrograms();
