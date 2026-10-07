import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ITEMS, STOCK, REQUESTS, PARCELS } from '../src/economy.js';
import { detailContents } from '../src/item-ui.js';

test('all shop, collectible and delivery items resolve to distinct local illustrations', async () => {
  const root = new URL('../assets/items/', import.meta.url), hashes = new Set();
  const used = new Set([...Object.values(STOCK).flat(), ...Object.values(REQUESTS).flat().map(x => x.item), ...Object.values(PARCELS).flat().map(x => x.item)]);
  for (const id of used) assert.ok(ITEMS[id]?.image, `Missing image for ${id}`);
  for (const [id, item] of Object.entries(ITEMS)) {
    assert.equal(item.image, `./assets/items/${id}.svg`);
    const svg = await readFile(new URL(`${id}.svg`, root), 'utf8');
    assert.match(svg, /viewBox="0 0 256 256"/);
    assert.match(svg, /<title[^>]*>.+<\/title>/);
    assert.match(svg, /<path|<rect|<ellipse/);
    assert.doesNotMatch(svg, /<script|<foreignObject|href="https?:|fill="\d+"/);
    hashes.add(createHash('sha256').update(svg.replace(/<title[^>]*>.*?<\/title>/, '')).digest('hex'));
    const detail = detailContents(id);
    assert.ok(detail.title && detail.memory.length > 30 && detail.image === item.image);
    if (item.kind === 'cargo') assert.ok(!detail.caption.includes('undefined') && !detail.caption.includes('NaN'));
  }
  assert.equal(hashes.size, Object.keys(ITEMS).length, 'Each item has its own drawing, including borrowed/returned variants');
  assert.equal((await readdir(root)).filter(x => x.endsWith('.svg')).length, Object.keys(ITEMS).length);
});
