// The people of Pekan Seri Kenangan, from the NPC design guide (6 Oct 2026).
// Pure data: who lives and works where, what they say, what they sell, what
// they ask the player to buy for them and what they send out. Money is sen.
// {name} in a line is the player's chosen name.

// The 14 named NPCs. `place` is their home or work address (where deliveries
// go); `post` is where they stand this afternoon when it differs (Atuk, Faiz
// and Mei Ling spend it at the padang by the gelanggang).
export const NPCS = {
  rahman: { id: 'NPC-01', name: 'Pak Rahman', age: 48, place: 22, role: 'Grocer and your first delivery mentor', menu: 'merchant',
    hello: 'Nak beli barang, atau nak cari duit poket? Ada satu pesanan untuk dihantar.',
    talk: ['Every order goes in my notebook. Reliable helpers go in it too, {name}.', 'Restock in the morning, house orders in the afternoon. That is the pekan.', 'Upah is for the walk, not the goods. The goods are already paid for, or you get the money back.'] },
  din: { id: 'NPC-02', name: 'Pak Din', age: 42, place: 37, role: 'Petrol kiosk operator and Dam Haji host', menu: 'merchant',
    hello: 'Nak beli, cari kerja, atau main dam? Haa, papan dah siap. Cuba kalahkan Pak Din!',
    talk: ['Mak Cik Salmah’s cousin is visiting from Ipoh. I know everything, this kiosk.', 'Workshops need supplies in the day. Evening is all snacks and drinks.', 'Cap on, towel ready. Kiosk life, {name}.'] },
  lim: { id: 'NPC-03', name: 'Uncle Lim', age: 51, place: 25, role: 'Stationery and toy shop owner', menu: 'merchant',
    hello: 'Simpan sikit-sikit. Nanti cukup duit untuk model yang kamu suka.',
    talk: ['A gasing must be wound tight and thrown low. Like this, see?', 'School orders before recess, collectors after school. Every day the same.', 'Look only, don’t bend the cards! Bent cards lose their value.'] },
  ros: { id: 'NPC-04', name: 'Makcik Ros', age: 46, place: 30, role: 'School canteen operator', menu: 'merchant',
    hello: 'Lepas kelas nanti, boleh tolong ambil sayur Pak Mat?',
    talk: ['Recess is fifteen minutes of war, {name}. Fifteen minutes!', 'Pupils who say terima kasih get extra kuah. Don’t tell anyone.', 'Ingredients early, event orders after recess. That is how I keep up.'] },
  farid: { id: 'NPC-05', name: 'Cikgu Farid', age: 35, place: 29, role: 'Teacher', menu: 'service',
    hello: 'Terima kasih. Letakkan buku di pejabat, kemudian datang jumpa cikgu selepas kelas.',
    talk: ['Careful work beats fast work. Every time.', 'The school event needs notices at the balai raya and every shop.', 'Holidays are for resting, {name}. And a little reading.'] },
  man: { id: 'NPC-06', name: 'Pak Man', age: 44, place: 36, role: 'Mechanic', menu: 'merchant',
    hello: 'Barang kecil pun penting. Semak label sebelum ambil, ya.',
    talk: ['Bring the right part and the job takes five minutes. The wrong one takes a day.', 'Atuk’s old toys are better made than half the new ones.', 'Oil on the floor. Watch your step.'] },
  ita: { id: 'NPC-07', name: 'Kak Ita', age: 29, place: 21, role: 'Food stall and pasar malam seller', menu: 'merchant',
    hello: 'Ada dua rumah pesan makan malam. Nak ambil satu, atau gabungkan perjalanan?',
    talk: ['The stall opens at four. Before that I am chopping, chopping, chopping.', 'Saturday is pasar malam. The whole town comes, {name}.', 'Sugar, vegetables, and a good helper. That is all a stall needs.'] },
  salleh: { id: 'NPC-08', name: 'Pak Salleh', age: 56, place: 32, role: 'Community organiser', menu: 'service',
    hello: 'Boleh bantu hantar jemputan? Rumah-rumah ni semuanya dalam satu kawasan.',
    talk: ['The balai raya belongs to everyone, {name}. Come by any time.', 'A kenduri needs three suppliers, twenty houses and one good list.', 'I know every family here. Ask me if you are lost.'] },
  hassan: { id: 'NPC-09', name: 'Ustaz Hassan', age: 40, place: 31, role: 'Mosque imam and caretaker', menu: 'service',
    hello: 'Terima kasih kerana membantu. Bungkusan boleh diletakkan di tempat penerimaan.',
    talk: ['Assalamualaikum, {name}. Have you met everyone in the taman yet?', 'Borrowed containers always find their way home. With a little help.', 'The community meal needs many hands. Yours are welcome.'] },
  pakmat: { id: 'NPC-10', name: 'Pak Mat', age: 61, place: 9, role: 'Gardener', menu: 'merchant',
    hello: 'Ambil yang dah masak saja. Lepas tu kita hantar satu bakul ke kantin.',
    talk: ['Kangkung grows fast. Patience grows slower.', 'Come in the morning, before the sun gets fierce.', 'Nenek beat me at congkak forty years ago. She still reminds me.'] },
  nenek: { id: 'NPC-11', name: 'Nenek', age: 68, place: 2, role: 'Family-like neighbour and congkak mentor', menu: 'house',
    hello: 'Duduklah dulu. Nak tolong Nenek, atau main congkak satu pusingan?',
    talk: ['Congkak is counting and patience, {name}. Mostly patience.', 'My kuih goes to half the kampung. The other half asks for it.', 'Atuk talks about his gasing like they are his grandchildren.'] },
  atuk: { id: 'NPC-12', name: 'Atuk', age: 72, place: 8, post: 34, role: 'Traditional-toy storyteller and gasing teacher', menu: 'house',
    hello: 'Gasing lama ni banyak cerita. Nak belajar, berlatih, atau cuba kalahkan Atuk?',
    talk: ['In my day the gasing pangkah could split another in two!', 'This padang was all paddy once. Then came the school.', 'Wind the string tight, {name}. Tight, then let go.'] },
  faiz: { id: 'NPC-13', name: 'Faiz', age: 16, place: 15, post: 34, role: 'Your friend, a Tamiya collector and gasing rival', menu: 'house',
    hello: 'Jom Dash! Pilih track, lawan aku dan Mei Ling. Tak ada kereta? Aku pinjamkan. Gasing pun boleh!',
    talk: ['Uncle Lim has the new Tamiya in the window. Mine one day. Soon.', 'Race you to the warung! Kidding. It is too hot.', 'Deliveries pay, {name}. Slowly, but they pay.'] },
  meiling: { id: 'NPC-14', name: 'Mei Ling', age: 16, place: 14, post: 34, role: 'Your friend, a card collector and Mini 4WD racer', menu: 'house',
    hello: 'Kad boleh tukar, Tamiya boleh race! Aku suka setup stabil. Faiz asyik nak laju saja.',
    talk: ['I keep my cards in a biscuit tin. Don’t laugh.', 'I found a lost card near the balai raya once. Still looking for its owner.', 'A full sticker set, {name}. Imagine it.'] }
};
export const NPC_KEYS = Object.keys(NPCS);
export const npcAt = place => NPC_KEYS.find(k => NPCS[k].place === place) || null;

// Every other place has a resident or keeper. Houses follow the guide's
// household templates, which set what they ask for. `key` names their body,
// look and work loop; they stand at their own door, so someone is always
// there to take a parcel.
export const RESIDENTS = {
  1: { key: 'zaitun', name: 'Mak Cik Zaitun', role: 'Amir’s mother', household: 'school', hello: 'Dah balik? Basuh tangan dulu.' },
  3: { key: 'mail', name: 'Pak Mail', role: 'Kampung farmer', household: 'garden', hello: 'Hah, mind my chilli seedlings.' },
  4: { key: 'salmah', name: 'Mak Cik Salmah', role: 'Neighbour who sells kuih', household: 'kenduri', hello: 'Eh, {name}. Mak Cik just fried cucur.' },
  5: { key: 'rohani', name: 'Kak Rohani', role: 'Neighbour', household: 'baby', hello: 'Shh, the baby just fell asleep.' },
  6: { key: 'kamal', name: 'Abang Kamal', role: 'Lorry driver', household: 'working', hello: 'Rest day. The lorry needs it more than me.' },
  7: { key: 'timah', name: 'Mak Long Timah', role: 'Neighbour', household: 'visitors', hello: 'My sister’s family comes tonight. So much to prepare!' },
  10: { key: 'ismail', name: 'Pak Long Ismail', role: 'River fisherman', hello: 'Shh. The ikan keli are shy today.' },
  11: { key: 'aminah', name: 'Cik Aminah', role: 'Nur’s mother', household: 'school', hello: 'Masuklah, have some air sirap.' },
  12: { key: 'lina', name: 'Kak Lina', role: 'Neighbour', household: 'cleaning', hello: 'Spring cleaning! Everything out, everything washed.' },
  13: { key: 'abu', name: 'Pak Abu', role: 'Retired postman', household: 'garden', hello: 'Thirty years of letters. Every house, every name.' },
  16: { key: 'yati', name: 'Kak Yati', role: 'Neighbour', household: 'baby', hello: 'Cakap perlahan sikit, the baby is sleeping.' },
  17: { key: 'faizal', name: 'Encik Faizal', role: 'Office clerk', household: 'working', hello: 'Saturday at last. No files, no phone calls.' },
  18: { key: 'kiah', name: 'Mak Cik Kiah', role: 'Neighbour', household: 'visitors', hello: 'Kenapa tercegat? Come in, come in.' },
  19: { key: 'ani', name: 'Kak Ani', role: 'Runs the corner shop', hello: 'Kedai Sudut Mini, open till late.' },
  20: { key: 'hani', name: 'Cikgu Hani', role: 'Tadika teacher', hello: 'The little ones are colouring. Quietly, for once.' },
  23: { key: 'muthu', name: 'Abang Muthu', role: 'Barber', hello: 'Short at the sides, like always?' },
  24: { key: 'hussin', name: 'Pak Hussin', role: 'Bicycle repairer', hello: 'Tayar pancit? Five minutes.' },
  26: { key: 'normah', name: 'Mak Cik Normah', role: 'Tailor', hello: 'Baju Raya orders already, and it is only Rejab.' },
  27: { key: 'kumar', name: 'Dr. Kumar', role: 'Town doctor', hello: 'Not sick, I hope? Drink more water.' },
  28: { key: 'jah', name: 'Mak Jah', role: 'Baker', hello: 'Roti just out of the oven. Smell that?' },
  33: { key: 'azura', name: 'Cik Azura', role: 'Librarian', hello: 'Shh. The new comics are on the bottom shelf.' },
  34: { key: 'hafiz', name: 'Abang Hafiz', role: 'Looks after the padang', hello: 'Padang’s open. Mind the takraw net.' },
  35: { key: 'karim', name: 'Pak Karim', role: 'Bus driver', hello: 'Next bus to the bandar at four.' },
  38: { key: 'usop', name: 'Pak Usop', role: 'Night market organiser', hello: 'Saturday night the whole town comes here.' }
};
// The family who keep a house while its resident is out on an errand
// (errands.js), so there is always someone at the door to take a parcel.
export const KEEPERS = {
  senah: { place: 3, name: 'Mak Cik Senah', role: 'Pak Mail’s wife', hello: 'Pak Mail ke kebun. Ada barang? Mak Cik ambilkan.' },
  jalil: { place: 4, name: 'Pak Jalil', role: 'Mak Cik Salmah’s husband, retired', hello: 'Salmah hantar kuih. Duduk dulu, {name}.' },
  midah: { place: 6, name: 'Kak Midah', role: 'Abang Kamal’s wife', hello: 'Abang Kamal keluar sekejap. Nak hantar barang?' },
  esah: { place: 13, name: 'Mak Cik Esah', role: 'Pak Abu’s wife', hello: 'Pak Abu tu, tak boleh duduk diam. Ada apa, nak?' },
  rozita: { place: 17, name: 'Puan Rozita', role: 'Encik Faizal’s wife', hello: 'Suami saya keluar. Barang boleh tinggal dengan saya.' },
  som: { place: 18, name: 'Wan Som', role: 'Mak Cik Kiah’s mother', hello: 'Kiah pergi kedai. Wan ada, Wan ada.' }
};
export const KEEPER_KEYS = Object.keys(KEEPERS);
export const keeperAt = place => KEEPER_KEYS.find(k => KEEPERS[k].place === place) || null;
export const RESIDENT_KEYS = Object.values(RESIDENTS).map(r => r.key);
export const residentPlace = key => Number(Object.keys(RESIDENTS).find(place => RESIDENTS[place].key === key));
// The contact who answers at a place: its NPC, else its resident.
export function contactAt(place) {
  const key = npcAt(place);
  if (key) return { key, ...NPCS[key] };
  return RESIDENTS[place] ? { ...RESIDENTS[place], key: null } : null;
}
export const line = (text, name) => text.replaceAll('{name}', name);

export const HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18];
export const PADANG = 34;

// Where each NPC stands: beside the interaction point of their post, facing
// out towards the player. Friends at the padang share it side by side.
// Returns candidate spots in order of preference; the game takes the first
// one that is clear of walls and props.
export function npcPosts(buildings) {
  return postsFor(buildings, NPC_KEYS.map(key => ({ key, place: NPCS[key].place, post: NPCS[key].post })));
}
// The residents and the families who keep house keep to their own doors,
// with more spots to try because shopfronts and verandas are busier than
// the NPCs' posts.
export function residentPosts(buildings) {
  return postsFor(buildings, [...RESIDENT_KEYS.map(key => ({ key, place: residentPlace(key) })), ...KEEPER_KEYS.map(key => ({ key, place: KEEPERS[key].place }))], [[1.3, .6], [-1.3, .6], [1.6, 1.4], [-1.6, 1.4], [0, 2.2], [2.2, 1], [-2.2, 1], [1, 2.6], [-1, 2.6], [0, 3.2]]);
}
function postsFor(buildings, people, around = [[1.3, .6], [-1.3, .6], [1.6, 1.4], [-1.6, 1.4], [0, 2.2]]) {
  const byId = new Map(buildings.map(b => [b.id, b])), posts = {}, shared = {};
  for (const { key, place, post } of people) {
    const b = byId.get(post || place); if (!b) continue;
    const dx = b.door.x - b.x, dz = b.door.z - b.z, len = Math.hypot(dx, dz) || 1, ox = dx / len, oz = dz / len, rx = -oz, rz = ox;
    const slot = shared[b.id] = (shared[b.id] ?? -1) + 1;
    const offsets = post ? [[(slot - 1) * 2.6, 1.8], [(slot - 1) * 2.6, 3.2], [(slot - 1) * 2.6 + 1.3, 2.4]] : around;
    posts[key] = { place: b.id, heading: Math.atan2(ox, oz), spots: offsets.map(([r, f]) => ({ x: b.door.x + rx * r + ox * f, z: b.door.z + rz * r + oz * f })) };
  }
  return posts;
}
