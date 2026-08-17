const grid = document.getElementById('grid');
const count = document.getElementById('count');

const searchEl = document.getElementById('search');
const authorSelect = document.getElementById('authorSelect');
const categorySelect = document.getElementById('categorySelect');
const tagSelect = document.getElementById('tagSelect');

let items = [];

function uniqSorted(arr) {
  return [...new Set(arr)].sort((a, b) => a.localeCompare(b, 'fr'));
}

function normalize(s) {
  return (s ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function matches(item) {
  const q = normalize(searchEl.value.trim());
  const author = authorSelect.value;
  const category = categorySelect.value;
  const tag = tagSelect.value;

  if (author && item.author !== author) return false;
  if (category && !(item.categories ?? []).includes(category)) return false;
  if (tag && !(item.tags ?? []).includes(tag)) return false;

  if (!q) return true;

  const haystack = [
    item.title,
    item.description,
    item.author,
    (item.categories ?? []).join(' '),
    (item.tags ?? []).join(' ')
  ].map(normalize).join(' ');

  return haystack.includes(q);
}

function render(list) {
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column:1/-1; min-height:160px; display:flex; align-items:center; justify-content:center; color: var(--muted);">
      Aucun résultat.
    </div>`;
    count.textContent = '0 résultat';
    return;
  }

  count.textContent = `${list.length} résultat${list.length > 1 ? 's' : ''}`;

  for (const item of list) {
    const categories = (item.categories ?? []).slice(0, 2).join(', ');
    const tags = (item.tags ?? []).slice(0, 2).join(', ');
    const badgeText = [categories, tags].filter(Boolean).join(' · ');

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="coverWrap">
        <img loading="lazy" src="${item.cover}" alt="Cover : ${escapeHtml(item.title)}">
      </div>

      <div class="meta">
        <div class="title">${escapeHtml(item.title)}</div>
        <div class="desc">${escapeHtml(item.description)}</div>

        <div class="bottomRow">
          <div class="badges" title="${escapeHtml(badgeText)}">${escapeHtml(badgeText)}</div>
          <a class="openBtn" href="${item.url}" target="_blank" rel="noopener">Ouvrir</a>
        </div>
      </div>
    `;

    grid.appendChild(card);
  }
}

function escapeHtml(str) {
  return (str ?? '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function load() {
  const res = await fetch('epubs.json', { cache: 'no-store' });
  items = await res.json();

  const authors = uniqSorted(items.map(x => x.author).filter(Boolean));
  const categories = uniqSorted(items.flatMap(x => x.categories ?? []).filter(Boolean));
  const tags = uniqSorted(items.flatMap(x => x.tags ?? []).filter(Boolean));

  for (const a of authors) addOption(authorSelect, a);
  for (const c of categories) addOption(categorySelect, c);
  for (const t of tags) addOption(tagSelect, t);

  const apply = () => render(items.filter(matches));
  searchEl.addEventListener('input', apply);
  authorSelect.addEventListener('change', apply);
  categorySelect.addEventListener('change', apply);
  tagSelect.addEventListener('change', apply);

  render(items);
}

function addOption(select, value) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = value;
  select.appendChild(opt);
}

load();

