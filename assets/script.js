// Publications + Projects + Theme
const state = { pubs: [], filtered: [] };
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme toggle (persist)
(function(){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const key = 'ah-theme';
  const apply = (t) => document.documentElement.dataset.theme = t;
  const saved = localStorage.getItem(key);
  if (saved) apply(saved);
  btn.addEventListener('click', () => {
    const next = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(key, next);
  });
})();

function renderHighlights(pubs){
  const grid = document.getElementById('highlightsGrid');
  const empty = document.getElementById('highlightsEmpty');
  if (!grid) return;
  grid.innerHTML = '';
  const highlights = pubs.filter(p => p.highlight);
  if (highlights.length === 0){ empty.hidden = false; return; }
  empty.hidden = true;
  highlights.slice(0, 6).forEach(p => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <h3>${p.title}</h3>
      <div class="meta">${[p.authors, p.venue, p.year].filter(Boolean).join(' • ')}</div>
      ${p.abstract ? `<p>${p.abstract}</p>` : ''}
      <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="pub-links">
        ${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>` : ''}
        ${p.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank" rel="noopener">PubMed</a>` : ''}
        ${p.pdf ? `<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>` : ''}
      </div>`;
    grid.appendChild(el);
  });
}

function renderPubs(pubs){
  const list = document.getElementById('pubList');
  const empty = document.getElementById('pubsEmpty');
  if (!list) return;
  list.innerHTML = '';
  if (pubs.length === 0){ empty.hidden = false; return; }
  empty.hidden = true;
  pubs.forEach(p => {
    const li = document.createElement('li');
    li.className = 'pub-item';
    li.innerHTML = `
      <div class="pub-title">${p.title}</div>
      <div class="meta">${[p.authors, p.venue, p.year].filter(Boolean).join(' • ')}</div>
      <div class="pub-links">
        ${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>` : ''}
        ${p.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank" rel="noopener">PubMed</a>` : ''}
        ${p.pdf ? `<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>` : ''}
      </div>`;
    list.appendChild(li);
  });
}

function buildYearFilter(pubs){
  const sel = document.getElementById('yearFilter');
  if (!sel) return;
  const years = Array.from(new Set(pubs.map(p=>p.year))).filter(Boolean).sort((a,b)=>b-a);
  years.forEach(y => { const opt = document.createElement('option'); opt.value = y; opt.textContent = y; sel.appendChild(opt); });
}

function applyFilters(){
  const q = (document.getElementById('pubSearch')?.value || '').trim().toLowerCase();
  const year = document.getElementById('yearFilter')?.value || '';
  let pubs = [...state.pubs];
  if (year){ pubs = pubs.filter(p => String(p.year) === String(year)); }
  if (q){
    pubs = pubs.filter(p => [p.title, p.authors, (p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q) );
  }
  state.filtered = pubs;
  renderPubs(state.filtered);
}

async function initPubs(){
  try{
    const res = await fetch('publications.json', {cache: 'no-store'});
    const data = await res.json();
    state.pubs = data.map(p => ({
      title: p.title || '',
      authors: p.authors || '',
      venue: p.venue || '',
      year: p.year || '',
      doi: p.doi || '',
      pmid: p.pmid || '',
      pdf: p.pdf || '',
      tags: p.tags || [],
      abstract: p.abstract || '',
      highlight: Boolean(p.highlight),
    })).sort((a,b) => String(b.year).localeCompare(String(a.year)));
    renderHighlights(state.pubs);
    buildYearFilter(state.pubs);
    applyFilters();
  }catch(e){
    document.getElementById('pubsEmpty')?.removeAttribute('hidden');
    document.getElementById('highlightsEmpty')?.removeAttribute('hidden');
  }
}

// Projects
async function initProjects(){
  try{
    const res = await fetch('projects.json', {cache:'no-store'});
    const data = await res.json();
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    data.forEach(p=>{
      const el = document.createElement('article');
      el.className = 'card';
      const linkBtns = Object.entries(p.links||{})
        .filter(([,v])=>v).map(([k,v])=>`<a href="${v}" target="_blank" rel="noopener">${k}</a>`).join(' ');
      el.innerHTML = `
        <h3>${p.title}</h3>
        <p class="meta">${p.role || ""}</p>
        <p>${p.summary || ""}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="pub-links">${linkBtns}</div>`;
      grid.appendChild(el);
    });
  }catch(e){}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pubSearch')?.addEventListener('input', applyFilters);
  document.getElementById('yearFilter')?.addEventListener('change', applyFilters);
  initPubs();
  initProjects();
});
