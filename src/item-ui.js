import { TAMIYA_PARTS, partEffect } from './tamiya-parts.js?v=2.11.1';
import { ITEMS, rm } from './economy.js?v=2.11.1';
import { ITEM_KINDS } from './item-art.js?v=2.11.1';
import { TAMIYA_CARS, carRating } from './tamiya-cars.js?v=2.11.1';

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
  name.textContent = item.rewardOnly&&!owned?'Kenangan rahsia':item.title;
  note.textContent = item.rewardOnly ? owned ? 'Keepsake earned · Open its story' : 'Locked keepsake · Earn through its quest' : owned ? `Dalam koleksi · × ${owned}` : item.kind === 'cargo' ? 'Penghantaran sahaja' : `${ITEM_KINDS[item.kind]} · ${rm(item.price)}`;
  const picture=itemThumbnail(id, onInspect, true);
  if(item.rewardOnly&&!owned){picture.querySelector('img').src='./assets/nostalgia-locked.svg';picture.querySelector('img').alt='Kenangan rahsia';picture.setAttribute('aria-label','Lihat kenangan rahsia');card.classList.add('locked-keepsake');}
  card.append(picture, name, note);
  return card;
}

export function detailContents(id) {
  const item = ITEMS[id];
  const car=TAMIYA_CARS[id];
  const part=TAMIYA_PARTS[id];
  return { title: item.title, memory: item.memory, image: item.image, caption: `${ITEM_KINDS[item.kind]} · ${item.rewardOnly ? 'Quest keepsake · '+item.era : item.kind === 'cargo' ? 'Diberi oleh pengirim' : rm(item.price)}${item.kind === 'goods' || item.kind === 'cargo' ? ` · Ruang beg: ${item.size}` : ''}${car?` · Power ${carRating(id)} · Speed ${car.speed} · Grip ${car.grip} · Stability ${car.stability}`:''}${part?` · ${partEffect(id)}`:''}` };
}
