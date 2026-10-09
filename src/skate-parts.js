// Skateboard parts (v2.14). Each slot is registered on its own: the board (deck),
// the tyre (wheels) and the other components (trucks and grip tape). Parts are
// cosmetic; the board rides the same whichever you pick. `colours` names the
// surfaces each part paints: deck (the underside and the dyed ply layer), wheel,
// truck (the hangers) or grip. The stock set is a plain street complete: maple
// ply, full black grip, dark red trucks and cream wheels.
export const SKATE_SLOTS = { board: 'Papan', tyre: 'Tayar', components: 'Komponen lain' };
export const SKATE_PARTS = {
  board_maple: { slot: 'board', name: 'Papan Maple', note: 'Kayu maple asli, papan standard kedai skate.', colours: { deck: 0xd8b283 } },
  board_tangerine: { slot: 'board', name: 'Papan Oren', note: 'Bawah papan oren terang.', colours: { deck: 0xf06a2a } },
  board_jade: { slot: 'board', name: 'Papan Pandan', note: 'Hijau pandan dari pagar rumah Tok.', colours: { deck: 0x3f8f6b } },
  board_midnight: { slot: 'board', name: 'Papan Malam', note: 'Biru gelap untuk jalan selepas Maghrib.', colours: { deck: 0x2b2d52 } },
  board_bubblegum: { slot: 'board', name: 'Papan Gula-gula', note: 'Merah jambu, gaya kartun petang.', colours: { deck: 0xe783ac } },
  tyre_cream: { slot: 'tyre', name: 'Tayar Krim', note: 'Krim dengan grafik hitam, tayar standard.', colours: { wheel: 0xf1ead6 } },
  tyre_yellow: { slot: 'tyre', name: 'Tayar Kuning', note: 'Kuning seperti tayar basikal pertama.', colours: { wheel: 0xf4d03f } },
  tyre_black: { slot: 'tyre', name: 'Tayar Hitam', note: 'Hitam kemas, tak mudah kotor.', colours: { wheel: 0x2a2a30 } },
  tyre_neon: { slot: 'tyre', name: 'Tayar Neon', note: 'Hijau neon yang nampak dari jauh.', colours: { wheel: 0x7dff5a } },
  tyre_sky: { slot: 'tyre', name: 'Tayar Langit', note: 'Biru muda, warna langit Pekan Seri Kenangan.', colours: { wheel: 0x8fd3ea } },
  components_maroon: { slot: 'components', name: 'Trak Merah Tua', note: 'Trak merah tua dengan grip hitam penuh.', colours: { truck: 0x6e2430, grip: 0x34343c } },
  components_chrome: { slot: 'components', name: 'Trak Chrome', note: 'Trak perak dengan grip hitam.', colours: { truck: 0xc9ccd1, grip: 0x34343c } },
  components_gold: { slot: 'components', name: 'Trak Emas', note: 'Trak emas dan grip hitam untuk hari istimewa.', colours: { truck: 0xd8b04a, grip: 0x34343c } },
  components_red: { slot: 'components', name: 'Trak Merah', note: 'Trak merah terang dengan grip kelabu.', colours: { truck: 0xc8322c, grip: 0x55555e } }
};
export const STOCK_SKATE_PARTS = Object.freeze({ board: 'board_maple', tyre: 'tyre_cream', components: 'components_maroon' });
export const SKATE_PART_IDS = Object.keys(SKATE_PARTS);
// Each slot is checked on its own: a missing or wrong part falls back to that slot's stock part, and the others are kept.
export function cleanSkateParts(value) {
  return Object.fromEntries(Object.keys(SKATE_SLOTS).map(slot => {
    const id = value?.[slot];
    return [slot, Object.hasOwn(SKATE_PARTS, id) && SKATE_PARTS[id].slot === slot ? id : STOCK_SKATE_PARTS[slot]];
  }));
}
