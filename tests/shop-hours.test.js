import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOPS, isShop, shopHours, isShopOpen } from '../src/shop-hours.js';
import { readFile, access } from 'node:fs/promises';

test('all commercial doors have a schedule and storefronts agree with host operating hours',()=>{
  assert.equal(Object.keys(SHOPS).length,12);assert.equal(isShop(31),false);
  for(const [place,shop]of Object.entries(SHOPS)){
    const [from,to]=shopHours(place);assert.equal(isShopOpen(place,from-.01),false);assert.equal(isShopOpen(place,from),true);assert.equal(isShopOpen(place,to-.01),true);assert.equal(isShopOpen(place,to),false);
  }
  assert.equal(isShopOpen(25,19*60+15),false);assert.equal(isShopOpen(23,20*60),false);assert.equal(isShopOpen(37,20*60),true);assert.equal(isShopOpen(21,21*60+30),true);
});
test('the checked-in atlas and dynamic storefront module ship with the self-contained game',async()=>{
  const path=new URL('../assets/textures/open-shop-interiors.webp',import.meta.url);await access(path);
  const bytes=await readFile(path);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.ok(bytes.length<600000,'mobile atlas budget');
  assert.equal(new Set(Object.values(SHOPS).filter(s=>s.tile!==undefined).map(s=>s.tile)).size,8);
});
