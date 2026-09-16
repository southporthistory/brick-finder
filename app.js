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
const locatorEmpty = document.querySelector('#locator-empty');
const locatorView = document.querySelector('#locator-view');
const locatorTitle = document.querySelector('#locator-title');
const locatorTarget = document.querySelector('#locator-target');
const locatorOrientation = document.querySelector('#locator-orientation');
const walkwayGrid = document.querySelector('#walkway-grid');

const escapeHtml = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const normalize = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

function searchText(b){
  return normalize([b.id,b.inscription,b.location,b.site,b.area,`column ${b.column}`,`brick ${b.brick_number}`].join(' '));
}
function shortTitle(b){
  const clean = String(b.inscription ?? '').replace(/\s+/g,' ').trim();
  if (clean.length <= 55) return clean;

  // Brick inscriptions contain abbreviations and initials (Capt., Col., Dr., W., Jr., etc.),
  // so do not treat punctuation as a sentence boundary. Trim at a word boundary instead.
  const shortened = clean.slice(0, 55);
  const lastSpace = shortened.lastIndexOf(' ');
  return (lastSpace > 35 ? shortened.slice(0, lastSpace) : shortened).trim() + '…';
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
  const areaBricks = bricks.filter(x => x.area === b.area);
  const columns = [...new Set(areaBricks.map(x => Number(x.column)))].sort((a,c)=>a-c);
  const numbersByColumn = new Map();
  columns.forEach(c => {
    numbersByColumn.set(c, new Set(areaBricks.filter(x=>Number(x.column)===c).map(x=>Number(x.brick_number))));
  });
  const maxBrick = Math.max(...areaBricks.map(x=>Number(x.brick_number)));

  locatorEmpty.hidden = true;
  locatorView.hidden = false;
  locatorTitle.textContent = b.area;
  locatorTarget.textContent = `Column ${b.column} · Brick ${b.brick_number}`;
  locatorOrientation.textContent = b.area === 'Side Walkway'
    ? 'Brick 1 begins at the porch →'
    : 'Brick numbering begins at the top of each column';

  walkwayGrid.style.setProperty('--column-count', columns.length);
  walkwayGrid.innerHTML = columns.map(c => {
    const nums = numbersByColumn.get(c);
    const cells = Array.from({length:maxBrick},(_,i)=>i+1).map(n => {
      const exists = nums.has(n);
      const selected = Number(b.column)===c && Number(b.brick_number)===n;
      const classes = ['brick-cell', exists ? '' : 'brick-gap', selected ? 'selected-brick' : ''].filter(Boolean).join(' ');
      return `<div class="${classes}" ${selected?'aria-current="true"':''}>${exists ? n : ''}</div>`;
    }).join('');
    return `<div class="brick-column ${Number(b.column)===c?'selected-column':''}"><div class="column-label">Column ${c}</div>${cells}</div>`;
  }).join('');

  document.querySelector('#locations').scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>walkwayGrid.querySelector('.selected-brick')?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'}),350);
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
