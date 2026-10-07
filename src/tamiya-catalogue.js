import { TAMIYA_PARTS, PART_SLOTS, partEffect } from './tamiya-parts.js?v=2.4.0';
import { TAMIYA_CARS, CAR_IDS, carRating } from './tamiya-cars.js?v=2.4.0';
import { itemThumbnail } from './item-ui.js?v=2.4.0';
export function carStats(id) {
  const a=TAMIYA_CARS[id],list=document.createElement('dl');list.className='tamiya-stats';
  for(const [label,key] of [['Speed','speed'],['Grip','grip'],['Stability','stability']]){
    const term=document.createElement('dt'),desc=document.createElement('dd'),bar=document.createElement('i');term.textContent=label;desc.textContent=a[key];bar.style.setProperty('--stat',`${a[key]}%`);desc.append(bar);list.append(term,desc);
  }
  return list;
}
export function tamiyaCatalogue(eco,onInspect,onBuy){
  const list=document.createElement('div');list.className='tamiya-catalogue';
  const nav=document.createElement('div');nav.className='tamiya-shop-nav';
  for(const [text,selector] of [['Kereta · 6 model','[data-car]'],['Parts · 12 aksesori','.tamiya-parts-heading']]){const btn=document.createElement('button');btn.className='secondary';btn.textContent=text;btn.onclick=()=>list.querySelector(selector)?.scrollIntoView({block:'start'});nav.append(btn);}list.append(nav);
  for(const id of CAR_IDS){
    const a=TAMIYA_CARS[id],card=document.createElement('article');card.className='tamiya-shop-card';card.dataset.car=id;
    const pic=itemThumbnail(id,onInspect,true),copy=document.createElement('div'),series=document.createElement('small'),title=document.createElement('h3'),price=document.createElement('b'),btn=document.createElement('button');
    series.textContent=`${a.series} · Power ${carRating(id)}/100`;title.textContent=a.name;price.textContent=`RM ${(a.price/100).toFixed(2)}`;btn.className='primary';
    btn.textContent=eco.collection[id]?'Dalam koleksi':eco.wallet<a.price?`Perlu RM ${((a.price-eco.wallet)/100).toFixed(2)} lagi`:'Beli kereta';btn.disabled=!!eco.collection[id]||eco.wallet<a.price;btn.onclick=()=>onBuy(id);
    copy.append(series,title,carStats(id),price,btn);card.append(pic,copy);list.append(card);
  }
  const heading=document.createElement('h3');heading.className='tamiya-parts-heading';heading.textContent='Parts Uncle Lim · Pasang di Garage';list.append(heading);
  for(const [id,a] of Object.entries(TAMIYA_PARTS)){
    const card=document.createElement('article');card.className='tamiya-shop-card tamiya-part-card';card.dataset.part=id;
    const copy=document.createElement('div'),slot=document.createElement('small'),title=document.createElement('h3'),effect=document.createElement('p'),note=document.createElement('p'),price=document.createElement('b'),btn=document.createElement('button');
    slot.textContent=PART_SLOTS[a.slot];title.textContent=a.name;effect.textContent=partEffect(id);note.textContent=a.note;price.textContent=`RM ${(a.price/100).toFixed(2)}`;btn.className='primary';btn.textContent=eco.collection[id]?'Dalam garage':eco.wallet<a.price?'Duit belum cukup':'Beli part';btn.disabled=!!eco.collection[id]||eco.wallet<a.price;btn.onclick=()=>onBuy(id);
    copy.append(slot,title,effect,note,price,btn);card.append(itemThumbnail(id,onInspect,true),copy);list.append(card);
  }return list;
}
