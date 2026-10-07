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
    hello: 'Aku tengah simpan duit untuk Tamiya. Lepas hantar barang, jom lawan gasing!',
    talk: ['Uncle Lim has the new Tamiya in the window. Mine one day. Soon.', 'Race you to the warung! Kidding. It is too hot.', 'Deliveries pay, {name}. Slowly, but they pay.'] },
  meiling: { id: 'NPC-14', name: 'Mei Ling', age: 16, place: 14, post: 34, role: 'Your friend, a card collector', menu: 'house',
    hello: 'Kalau ada kad berganda, kita boleh tukar. Tengok dulu kad mana yang kamu belum ada.',
    talk: ['I keep my cards in a biscuit tin. Don’t laugh.', 'I found a lost card near the balai raya once. Still looking for its owner.', 'A full sticker set, {name}. Imagine it.'] }
};
export const NPC_KEYS = Object.keys(NPCS);
export const npcAt = place => NPC_KEYS.find(k => NPCS[k].place === place) || null;

// Every other place has a resident or keeper. Houses follow the guide's
// household templates, which set what they ask for.
export const RESIDENTS = {
  1: { name: 'Mak Cik Zaitun', role: 'Amir’s mother', household: 'school', hello: 'Dah balik? Basuh tangan dulu.' },
  3: { name: 'Pak Mail', role: 'Kampung farmer', household: 'garden', hello: 'Hah, mind my chilli seedlings.' },
  4: { name: 'Mak Cik Salmah', role: 'Neighbour who sells kuih', household: 'kenduri', hello: 'Eh, {name}. Mak Cik just fried cucur.' },
  5: { name: 'Kak Rohani', role: 'Neighbour', household: 'baby', hello: 'Shh, the baby just fell asleep.' },
  6: { name: 'Abang Kamal', role: 'Lorry driver', household: 'working', hello: 'Rest day. The lorry needs it more than me.' },
  7: { name: 'Mak Long Timah', role: 'Neighbour', household: 'visitors', hello: 'My sister’s family comes tonight. So much to prepare!' },
  10: { name: 'Pak Long Ismail', role: 'River fisherman', hello: 'Shh. The ikan keli are shy today.' },
  11: { name: 'Cik Aminah', role: 'Nur’s mother', household: 'school', hello: 'Masuklah, have some air sirap.' },
  12: { name: 'Kak Lina', role: 'Neighbour', household: 'cleaning', hello: 'Spring cleaning! Everything out, everything washed.' },
  13: { name: 'Pak Abu', role: 'Retired postman', household: 'garden', hello: 'Thirty years of letters. Every house, every name.' },
  16: { name: 'Kak Yati', role: 'Neighbour', household: 'baby', hello: 'Cakap perlahan sikit, the baby is sleeping.' },
  17: { name: 'Encik Faizal', role: 'Office clerk', household: 'working', hello: 'Saturday at last. No files, no phone calls.' },
  18: { name: 'Mak Cik Kiah', role: 'Neighbour', household: 'visitors', hello: 'Kenapa tercegat? Come in, come in.' },
  19: { name: 'Kak Ani', role: 'Runs the corner shop', hello: 'Kedai Sudut Mini, open till late.' },
  20: { name: 'Cikgu Hani', role: 'Tadika teacher', hello: 'The little ones are colouring. Quietly, for once.' },
  23: { name: 'Abang Muthu', role: 'Barber', hello: 'Short at the sides, like always?' },
  24: { name: 'Pak Hussin', role: 'Bicycle repairer', hello: 'Tayar pancit? Five minutes.' },
  26: { name: 'Mak Cik Normah', role: 'Tailor', hello: 'Baju Raya orders already, and it is only Rejab.' },
  27: { name: 'Dr. Kumar', role: 'Town doctor', hello: 'Not sick, I hope? Drink more water.' },
  28: { name: 'Mak Jah', role: 'Baker', hello: 'Roti just out of the oven. Smell that?' },
  33: { name: 'Cik Azura', role: 'Librarian', hello: 'Shh. The new comics are on the bottom shelf.' },
  34: { name: 'Abang Hafiz', role: 'Looks after the padang', hello: 'Padang’s open. Mind the takraw net.' },
  35: { name: 'Pak Karim', role: 'Bus driver', hello: 'Next bus to the bandar at four.' },
  38: { name: 'Pak Usop', role: 'Night market organiser', hello: 'Saturday night the whole town comes here.' }
};
// The contact who answers at a place: its NPC, else its resident.
export function contactAt(place) {
  const key = npcAt(place);
  if (key) return { key, ...NPCS[key] };
  return RESIDENTS[place] ? { key: null, ...RESIDENTS[place] } : null;
}
export const line = (text, name) => text.replaceAll('{name}', name);

export const HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18];
export const PADANG = 34;

// Where each NPC stands: beside the interaction point of their post, facing
// out towards the player. Friends at the padang share it side by side.
// Returns candidate spots in order of preference; the game takes the first
// one that is clear of walls and props.
export function npcPosts(buildings) {
  const byId = new Map(buildings.map(b => [b.id, b])), posts = {}, shared = {};
  for (const key of NPC_KEYS) {
    const npc = NPCS[key], b = byId.get(npc.post || npc.place); if (!b) continue;
    const dx = b.door.x - b.x, dz = b.door.z - b.z, len = Math.hypot(dx, dz) || 1, ox = dx / len, oz = dz / len, rx = -oz, rz = ox;
    const slot = shared[b.id] = (shared[b.id] ?? -1) + 1;
    const offsets = npc.post ? [[(slot - 1) * 2.6, 1.8], [(slot - 1) * 2.6, 3.2], [(slot - 1) * 2.6 + 1.3, 2.4]] : [[1.3, .6], [-1.3, .6], [1.6, 1.4], [-1.6, 1.4], [0, 2.2]];
    posts[key] = { place: b.id, heading: Math.atan2(ox, oz), spots: offsets.map(([r, f]) => ({ x: b.door.x + rx * r + ox * f, z: b.door.z + rz * r + oz * f })) };
  }
  return posts;
}
