import { ITEMS, rm } from './economy.js?v=1.3.0';
import { ITEM_KINDS } from './item-art.js?v=1.3.0';

// Reused by shops, the bag, jobs and the catalogue. Browsing never buys an item.
export function itemThumbnail(id, onInspect, large = false) {
  const item = ITEMS[id], button = document.createElement('button'), img = document.createElement('img');
  button.type = 'button'; button.className = `item-picture${large ? ' large' : ''}`;
  button.setAttribute('aria-label', `Lihat ${item.title}`);
  img.src = item.image; img.alt = item.title; img.width = 256; img.height = 256;
  img.loading = 'lazy'; img.decoding = 'async';
  button.append(img); button.onclick = () => onInspect(id, button);
  return button;
}

export function itemIdentity(id, onInspect, description = '') {
  const wrap = document.createElement('div'), copy = document.createElement('div'), name = document.createElement('b');
  wrap.className = 'item-identity'; copy.className = 'item-copy'; name.textContent = ITEMS[id].title;
  copy.append(name);
  if (description) { const small = document.createElement('small'); small.textContent = description; copy.append(small); }
  wrap.append(itemThumbnail(id, onInspect), copy);
  return wrap;
}

export function catalogueCard(id, onInspect, owned = 0) {
  const item = ITEMS[id], card = document.createElement('li'), name = document.createElement('b'), note = document.createElement('small');
  card.className = 'catalogue-card'; card.dataset.item = id;
  name.textContent = item.title;
  note.textContent = owned ? `Dalam koleksi · × ${owned}` : item.kind === 'cargo' ? 'Penghantaran sahaja' : `${ITEM_KINDS[item.kind]} · ${rm(item.price)}`;
  card.append(itemThumbnail(id, onInspect, true), name, note);
  return card;
}

export function detailContents(id) {
  const item = ITEMS[id];
  return { title: item.title, memory: item.memory, image: item.image, caption: `${ITEM_KINDS[item.kind]} · ${item.kind === 'cargo' ? 'Diberi oleh pengirim' : rm(item.price)}${item.kind === 'goods' || item.kind === 'cargo' ? ` · Ruang beg: ${item.size}` : ''}` };
}
