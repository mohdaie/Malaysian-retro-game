import { TAMIYA_CARS } from './tamiya-cars.js?v=2.1.0';
// Fictional arcade parts: stronger parts have a cost in speed, control or charge.
export const PART_SLOTS={motor:'Motor',gear:'Gear',battery:'Bateri',tyres:'Tayar',rollers:'Roller',brake:'Brek'};
export const STOCK_BUILD=Object.freeze(Object.fromEntries(Object.keys(PART_SLOTS).map(k=>[k,'stock'])));
export const TAMIYA_PARTS={
  mini_motor_dash:{slot:'motor',name:'Motor Dash',price:1200,speed:19,grip:-5,stability:-7,drain:1.28,note:'Pecut kuat, lebih haus bateri dan susah kawal.'},
  mini_motor_torque:{slot:'motor',name:'Motor Torque',price:900,speed:5,grip:5,stability:3,drain:1.02,note:'Tarikan sekata untuk jambatan dan track berliku.'},
  mini_gear_sprint:{slot:'gear',name:'Gear Sprint',price:650,speed:13,grip:-6,drain:1.12,note:'Lurus lebih laju, selekoh perlu lebih kawalan.'},
  mini_gear_torque:{slot:'gear',name:'Gear Torque',price:500,speed:-3,grip:8,stability:4,drain:.93,note:'Kurang top speed, lebih kemas pada selekoh dan ramp.'},
  mini_battery_burst:{slot:'battery',name:'Bateri Burst',price:700,speed:9,capacity:88,drain:1.1,note:'Kuasa awal tinggi, cas cepat habis. Simpan pack lain untuk pit.'},
  mini_battery_endurance:{slot:'battery',name:'Bateri Endurance',price:1000,speed:-2,capacity:145,drain:.92,note:'Cas tahan lama, pecut awal sedikit perlahan.'},
  mini_tyres_slick:{slot:'tyres',name:'Tayar Slick',price:450,speed:7,grip:-10,stability:-2,note:'Rintangan rendah untuk oval, mudah keluar selekoh rapat.'},
  mini_tyres_sponge:{slot:'tyres',name:'Tayar Sponge',price:550,speed:-3,grip:17,stability:4,note:'Grip kuat, ada sedikit drag di laluan lurus.'},
  mini_rollers_alloy:{slot:'rollers',name:'Roller Aluminium',price:850,speed:-2,grip:13,stability:7,note:'Lebih berat tetapi kemas pada dinding dan lane changer.'},
  mini_rollers_bearing:{slot:'rollers',name:'Roller Bearing',price:1100,speed:5,grip:4,stability:2,note:'Roller lancar untuk kekalkan momentum.'},
  mini_brake_soft:{slot:'brake',name:'Brek Sponge',price:400,speed:-3,grip:3,stability:16,note:'Kawal landing ramp dengan sedikit kos kelajuan.'},
  mini_brake_hard:{slot:'brake',name:'Brek Heavy',price:750,speed:-8,grip:4,stability:27,drain:.95,note:'Landing paling kemas, tetapi membrek lebih banyak.'}
};
export const PART_IDS=Object.keys(TAMIYA_PARTS);
export function validBuild(v,collection=null){
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!Object.hasOwn(PART_SLOTS,k)))return false;
  return Object.keys(PART_SLOTS).every(slot=>v[slot]==='stock'||Object.hasOwn(TAMIYA_PARTS,v[slot])&&TAMIYA_PARTS[v[slot]].slot===slot&&(!collection||collection[v[slot]]>0));
}
export function cleanBuild(v,collection){return validBuild(v,collection)?{...v}:{...STOCK_BUILD};}
export function partStats(car,build=STOCK_BUILD){
  if(!Object.hasOwn(TAMIYA_CARS,car)||!validBuild(build))throw Error('Invalid build');
  const a=TAMIYA_CARS[car],stats={speed:a.speed,grip:a.grip,stability:a.stability,drain:1,capacity:100};
  for(const id of Object.values(build)){const p=TAMIYA_PARTS[id];if(!p)continue;for(const key of ['speed','grip','stability'])stats[key]+=p[key]||0;stats.drain*=p.drain||1;if(p.capacity)stats.capacity=p.capacity;}
  for(const key of ['speed','grip','stability'])stats[key]=Math.max(15,Math.min(130,stats[key]));return stats;
}
export const partEffect=id=>{const p=TAMIYA_PARTS[id];return [p.speed&&`Speed ${p.speed>0?'+':''}${p.speed}`,p.grip&&`Grip ${p.grip>0?'+':''}${p.grip}`,p.stability&&`Stability ${p.stability>0?'+':''}${p.stability}`,p.capacity&&`Cas ${p.capacity}%`,p.drain&&`Guna cas ×${p.drain}`].filter(Boolean).join(' · ');};
// Original compact parts portraits; both variants have distinct silhouettes/colours.
export function partIllustration(id){
  const p=TAMIYA_PARTS[id],i=PART_IDS.indexOf(id),colour=['#d95649','#65a3ab','#e5b24e','#63836c'][i%4],ink='#292832';
  const gear=`<path d="M108 55h40l5 22 21 8 20-11 22 32-16 16 1 22 19 13-19 34-22-6-19 12-2 22h-40l-5-22-21-8-20 11-22-32 16-16-1-22-19-13 19-34 22 6 19-12Z" fill="${colour}"/><circle cx="137" cy="137" r="38" fill="#efe7ce"/><circle cx="137" cy="137" r="13" fill="${ink}"/>`;
  const shapes={gear,motor:`<path d="M68 90l44-24 76 35v87l-46 24-74-36Z" fill="${colour}"/><path d="M68 90l74 35 46-24M142 125v87" fill="none"/><path d="M120 52l13-7 14 7v34l-13 7-14-7Z" fill="#ddd5bc"/><rect x="80" y="114" width="14" height="31" rx="4" fill="${ink}"/>`,battery:`<g transform="rotate(-16 128 128)"><rect x="64" y="61" width="53" height="141" rx="14" fill="${colour}"/><rect x="133" y="61" width="53" height="141" rx="14" fill="#e8cf8e"/><path d="M80 60v-8h22v8m47 0v-8h22v8M73 98h35M143 98h33" fill="none"/><path d="M84 135h15m-7-8v16m61-8h15" fill="none" stroke-width="6"/></g>`,tyres:`<ellipse cx="96" cy="151" rx="51" ry="59" fill="${ink}"/><ellipse cx="102" cy="148" rx="32" ry="42" fill="${colour}"/><ellipse cx="174" cy="111" rx="44" ry="53" fill="${ink}"/><ellipse cx="180" cy="109" rx="25" ry="34" fill="#eee5cd"/><path d="M51 128l14 10M52 162l13 4M72 194l9-8" stroke="${colour}" fill="none"/>`,rollers:`<path d="M48 138l158-33 9 21-158 33Z" fill="${colour}"/><ellipse cx="73" cy="119" rx="34" ry="17" fill="#ddd8cc"/><path d="M39 119v27q34 30 68-1v-26" fill="#818993"/><ellipse cx="73" cy="119" rx="34" ry="17" fill="${colour}"/><ellipse cx="180" cy="99" rx="34" ry="17" fill="#ddd8cc"/><path d="M146 99v27q34 30 68-1V99" fill="#818993"/><ellipse cx="180" cy="99" rx="34" ry="17" fill="${colour}"/><circle cx="73" cy="119" r="6" fill="${ink}"/><circle cx="180" cy="99" r="6" fill="${ink}"/>`,brake:`<path d="M54 91l137-26 18 28-137 26Z" fill="#817c76"/><path d="M72 119l137-26v38L72 157Z" fill="${colour}"/><path d="M54 91l18 28v38l-18-28Z" fill="#b59667"/><path d="M74 179l122-23 9 22-122 23Z" fill="#e7cf8f"/><path d="M97 130l10-2m15-3 10-2m15-3 10-2m15-3 10-2" fill="none"/>`};
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><title>${p.name}</title><ellipse cx="128" cy="221" rx="88" ry="10" fill="#604530" opacity=".12"/><g stroke="${ink}" stroke-width="3.5" stroke-linejoin="round">${shapes[p.slot]}</g><rect x="20" y="20" width="${12+i*2}" height="7" rx="2" fill="${colour}"/></svg>\n`;
}
