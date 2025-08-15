const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
const mt=document.getElementById('menuToggle'); if(mt){ mt.addEventListener('click',()=>{ document.body.classList.toggle('nav-open'); }); }
(function(){ const here=location.pathname.replace(/\/index\.html$/, '/');
  for(const a of document.querySelectorAll('.nav a[href]')){
    const resolved=new URL(a.getAttribute('href'), location.origin).pathname;
    if(resolved===here) a.classList.add('active');
  }
})();
const state={pubs:[],filtered:[]};
function renderPubs(pubs){
  const list=document.getElementById('pubList'); const empty=document.getElementById('pubsEmpty'); if(!list) return;
  list.innerHTML=''; if(pubs.length===0){ if(empty) empty.hidden=false; return; } if(empty) empty.hidden=true;
  pubs.forEach(p=>{
    const li=document.createElement('li'); li.className='pub-item';
    li.innerHTML=`<div class="pub-title">${p.title}${p.highlight? ' <span class="tag">Highlight</span>' : ''}</div>
      <div class="meta">${[p.authors,p.venue,p.year].filter(Boolean).join(' • ')}</div>
      <div class="pub-links">${p.doi?`<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>`:''}
        ${p.pmid?`<a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank" rel="noopener">PubMed</a>`:''}
        ${p.pdf?`<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>`:''}</div>`;
    list.appendChild(li);
  });
}
function renderHighlights(pubs){
  const grid=document.getElementById('highlightsGrid'); const empty=document.getElementById('highlightsEmpty'); if(!grid) return;
  grid.innerHTML=''; const h=pubs.filter(p=>p.highlight);
  if(h.length===0){ if(empty) empty.hidden=false; return; } if(empty) empty.hidden=true;
  h.slice(0,6).forEach(p=>{
    const el=document.createElement('article'); el.className='card';
    el.innerHTML=`<h3>${p.title}</h3>
      <div class="meta">${[p.authors,p.venue,p.year].filter(Boolean).join(' • ')}</div>
      ${p.abstract?`<p class="small">${p.abstract}</p>`:''}
      <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="pub-links">${p.doi?`<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>`:''}
        ${p.pmid?`<a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank" rel="noopener">PubMed</a>`:''}
        ${p.pdf?`<a href="${p.pdf}" target="_blank" rel="noopener">PDF</a>`:''}</div>`;
    grid.appendChild(el);
  });
}
function buildYearFilter(pubs){
  const sel=document.getElementById('yearFilter'); if(!sel) return;
  const years=[...new Set(pubs.map(p=>p.year))].filter(Boolean).sort((a,b)=>b-a);
  years.forEach(y=>{ const o=document.createElement('option'); o.value=y; o.textContent=y; sel.appendChild(o); });
}
function applyFilters(){
  const q=(document.getElementById('pubSearch')?.value||'').trim().toLowerCase();
  const year=document.getElementById('yearFilter')?.value||'';
  let pubs=[...state.pubs];
  if(year) pubs=pubs.filter(p=>String(p.year)===String(year));
  if(q) pubs=pubs.filter(p=>[p.title,p.authors,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));
  renderPubs(pubs);
}
async function initPubs(){
  try{
    const r=await fetch('/assets/data/publications.json',{cache:'no-store'});
    const d=await r.json();
    state.pubs=d.map(p=>({title:p.title||'',authors:p.authors||'',venue:p.venue||'',year:p.year||'',
      doi:p.doi||'',pmid:p.pmid||'',pdf:p.pdf||'',tags:p.tags||[],abstract:p.abstract||'',highlight:!!p.highlight}))
      .sort((a,b)=> (b.highlight - a.highlight) || String(b.year).localeCompare(String(a.year)));
    renderHighlights(state.pubs);
    buildYearFilter(state.pubs);
    applyFilters();
  }catch(e){
    document.getElementById('pubsEmpty')?.removeAttribute('hidden');
    document.getElementById('highlightsEmpty')?.removeAttribute('hidden');
  }
}
async function initProjects(){
  try{
    const r=await fetch('/assets/data/projects.json',{cache:'no-store'});
    const d=await r.json();
    const grid=document.getElementById('projectsGrid'); if(!grid) return; grid.innerHTML='';
    d.forEach(p=>{
      const el=document.createElement('article'); el.className='card';
      const links=Object.entries(p.links||{}).filter(([,v])=>v).map(([k,v])=>`<a href="${v}" target="_blank" rel="noopener">${k}</a>`).join(' ');
      el.innerHTML=`<h3>${p.title}</h3><p class="meta">${p.role||""}</p><p>${p.summary||""}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="pub-links">${links}</div>`;
      grid.appendChild(el);
    });
  }catch(e){}
}
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('pubList')){
    document.getElementById('pubSearch')?.addEventListener('input', applyFilters);
    document.getElementById('yearFilter')?.addEventListener('change', applyFilters);
    initPubs();
  }
  if(document.getElementById('projectsGrid')) initProjects();
});
