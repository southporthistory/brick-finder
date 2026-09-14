let bricks = [];
const searchInput = document.querySelector('#brick-search');
const searchButton = document.querySelector('#search-button');
const walkwayFilter = document.querySelector('#walkway-filter');
const columnFilter = document.querySelector('#column-filter');
const clearButton = document.querySelector('#clear-search');
const results = document.querySelector('#results');
const resultSummary = document.querySelector('#result-summary');
const emptyState = document.querySelector('#empty-state');
const dialog = document.querySelector('#brick-dialog');
const dialogBody = document.querySelector('#dialog-body');
const dialogClose = document.querySelector('#dialog-close');

const escapeHtml = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const normalize = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

function searchText(b){
  return normalize([b.id,b.inscription,b.location,b.site,b.area,`column ${b.column}`,`brick ${b.brick_number}`].join(' '));
}
function shortTitle(b){
  const clean = b.inscription.replace(/\s+/g,' ').trim();
  const first = clean.split(/(?<=[.!?])\s+/)[0];
  return first.length > 55 ? first.slice(0,52).trim()+'…' : first;
}
function refreshColumns(){
  const area = walkwayFilter.value;
  const current = columnFilter.value;
  const cols = [...new Set(bricks.filter(b=>!area || b.area===area).map(b=>b.column))].sort((a,b)=>a-b);
  columnFilter.innerHTML = '<option value="">All columns</option>' + cols.map(c=>`<option value="${c}">Column ${c}</option>`).join('');
  if(cols.map(String).includes(current)) columnFilter.value=current;
}
function render(){
  const q = normalize(searchInput.value);
  const area = walkwayFilter.value;
  const col = columnFilter.value;
  let filtered = bricks.filter(b => {
    const queryOK = !q || q.split(' ').every(term => searchText(b).includes(term));
    return queryOK && (!area || b.area===area) && (!col || String(b.column)===col);
  });

  if(!q && !area && !col) filtered = filtered.slice(0,12);
  const totalMatches = bricks.filter(b => {
    const queryOK = !q || q.split(' ').every(term => searchText(b).includes(term));
    return queryOK && (!area || b.area===area) && (!col || String(b.column)===col);
  }).length;

  resultSummary.textContent = (!q && !area && !col)
    ? `Showing 12 of ${bricks.length} inventoried bricks`
    : `${totalMatches} result${totalMatches===1?'':'s'}${q ? ` for “${searchInput.value.trim()}”` : ''}`;

  results.innerHTML='';
  emptyState.hidden = totalMatches !== 0;

  filtered.forEach(b=>{
    const card=document.createElement('article');
    card.className='result-card';
    const photo = b.image
      ? `<img class="result-photo" src="${escapeHtml(b.image)}" alt="Photograph of brick ${escapeHtml(b.id)}">`
      : `<div class="photo-missing">Brick photograph<br>coming soon</div>`;
    card.innerHTML=`
      ${photo}
      <div class="result-copy">
        <h3>${escapeHtml(shortTitle(b))}</h3>
        <p class="result-inscription">${escapeHtml(b.inscription)}</p>
        <div class="meta">
          <strong>Location</strong><span>${escapeHtml(b.location)}</span>
          <strong>Brick ID</strong><span>${escapeHtml(b.id)}</span>
        </div>
        <button class="map-link" type="button">View Fort Johnston location</button>
      </div>`;
    card.querySelector('.result-copy').addEventListener('dblclick',()=>openBrick(b));
    if(b.image) card.querySelector('.result-photo').addEventListener('click',()=>openBrick(b));
    card.querySelector('.map-link').addEventListener('click',()=>showLocation(b));
    results.appendChild(card);
  });
}
function showLocation(b){
  document.body.classList.remove('highlight-front','highlight-side');
  document.body.classList.add(b.area==='Front Walkway'?'highlight-front':'highlight-side');
  document.querySelector('#locations').scrollIntoView({behavior:'smooth',block:'center'});
}
function openBrick(b){
  dialogBody.innerHTML=`
    <div class="dialog-content">
      <h3>${escapeHtml(b.id)}</h3>
      ${b.image?`<img class="dialog-photo" src="${escapeHtml(b.image)}" alt="Brick photograph">`:''}
      <div class="dialog-inscription">${escapeHtml(b.inscription)}</div>
      <div class="dialog-location"><strong>${escapeHtml(b.location)}</strong></div>
    </div>`;
  dialog.showModal();
}
searchInput.addEventListener('input',render);
searchButton.addEventListener('click',render);
searchInput.addEventListener('keydown',e=>{if(e.key==='Enter') render();});
walkwayFilter.addEventListener('change',()=>{refreshColumns();render();});
columnFilter.addEventListener('change',render);
clearButton.addEventListener('click',()=>{
  searchInput.value='';walkwayFilter.value='';columnFilter.value='';refreshColumns();render();searchInput.focus();
});
dialogClose.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog) dialog.close();});

fetch('bricks.json')
 .then(r=>{if(!r.ok) throw new Error('Could not load brick data');return r.json();})
 .then(data=>{bricks=data;refreshColumns();render();})
 .catch(err=>{resultSummary.textContent=err.message;});
