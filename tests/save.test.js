import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSave, readSave, writeSave } from '../src/save.js';
const valid={version:1,name:'Amir',friend:'Nur',quest:2,x:12,z:0,completed:false};
test('valid saves roundtrip and invalid/out-of-bounds saves are rejected',()=>{const data=new Map();const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};assert.equal(writeSave(storage,valid),true);assert.deepEqual(readSave(storage),valid);for(const extra of [{quest:4},{version:2},{x:Infinity},{z:900},{name:null}])assert.equal(validateSave({...valid,...extra}),null);});
test('unavailable storage and malformed JSON never block gameplay',()=>{assert.equal(readSave(null),null);assert.equal(writeSave(null,valid),false);assert.equal(readSave({getItem:()=>'{broken'}),null);});
