let bricks = [];

const searchInput = document.querySelector('#brick-search');
const clearButton = document.querySelector('#clear-search');
const results = document.querySelector('#results');
const emptyState = document.querySelector('#empty-state');
const resultCount = document.querySelector('#result-count');
const columnFilter = document.querySelector('#column-filter');
const dialog = document.querySelector('#brick-dialog');
const dialogContent = document.querySelector('#dialog-content');
const dialogClose = document.querySelector('#dialog-close');

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function searchableText(brick) {
  return normalize([
    brick.id,
    brick.inscription,
    brick.location,
    brick.site,
    brick.area,
    `column ${brick.column}`,
    `brick ${brick.brick_number}`
  ].join(' '));
}

function render() {
  const query = normalize(searchInput.value);
  const column = columnFilter.value;

  const filtered = bricks.filter(brick => {
    const matchesSearch = !query || query.split(' ').every(term => searchableText(brick).includes(term));
    const matchesColumn = !column || String(brick.column) === column;
    return matchesSearch && matchesColumn;
  });

  resultCount.textContent = `${filtered.length} brick${filtered.length === 1 ? '' : 's'} found`;
  results.innerHTML = '';
  emptyState.hidden = filtered.length !== 0;

  filtered.forEach(brick => {
    const card = document.createElement('button');
    card.className = 'brick-card';
    card.type = 'button';
    card.innerHTML = `
      <div class="brick-card-inner">
        <div class="brick-id">${brick.id}</div>
        <div class="inscription">${escapeHtml(brick.inscription)}</div>
        <div class="location">${escapeHtml(brick.location)}</div>
      </div>`;
    card.addEventListener('click', () => showBrick(brick));
    results.appendChild(card);
  });
}

function showBrick(brick) {
  dialogContent.innerHTML = `
    <div class="dialog-id">${brick.id}</div>
    <div class="dialog-inscription">${escapeHtml(brick.inscription)}</div>
    <div class="dialog-location"><strong>Location</strong><br>${escapeHtml(brick.location)}</div>
  `;
  dialog.showModal();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));
}

searchInput.addEventListener('input', render);
clearButton.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  render();
});
columnFilter.addEventListener('change', render);
dialogClose.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  if (e.target === dialog) dialog.close();
});

fetch('bricks.json')
  .then(r => {
    if (!r.ok) throw new Error('Could not load bricks.json');
    return r.json();
  })
  .then(data => {
    bricks = data;
    const columns = [...new Set(bricks.map(b => b.column))].sort((a,b) => a-b);
    columns.forEach(col => {
      const option = document.createElement('option');
      option.value = col;
      option.textContent = `Column ${col}`;
      columnFilter.appendChild(option);
    });
    render();
  })
  .catch(err => {
    resultCount.textContent = 'Brick data could not be loaded.';
    results.innerHTML = `<div class="empty-state"><p>${escapeHtml(err.message)}</p><p>This prototype should be served from GitHub Pages or another web server rather than opened directly as a local file.</p></div>`;
  });
