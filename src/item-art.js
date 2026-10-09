// Original illustrated objects from a Malaysian town around 2001.
// Kept separate from the economy so descriptions never change item/save IDs.
import { TAMIYA_PARTS } from './tamiya-parts.js?v=2.12.0';
import { TAMIYA_CARS } from './tamiya-cars.js?v=2.12.0';
export const ITEM_ART = {
  kabelav: ['Kabel AV', 'Kabel merah, putih dan kuning untuk malam tayangan jiran-jiran di balai raya.'],
  kerusilipat: ['Kerusi lipat', 'Kerusi stor balai raya. Angkat elok-elok dan pulangkan selepas malam tayangan.'],
  beras: ['Beras kampung', 'Guni beras di kedai runcit. Mak pesan angkat elok-elok, jangan pecah di jalan.'],
  gula: ['Gula pasir', 'Plastik gula diikat getah, bekalan untuk teh panas dan kuih petang.'],
  teh: ['Teh waktu petang', 'Paket teh kertas dari kedai runcit. Bau teh panas dari dapur Nenek.'],
  telur: ['Sepapan telur', 'Dulang telur kadbod, kena jalan perlahan supaya tak pecah.'],
  minuman: ['Air kotak', 'Air kotak dengan straw kecil. Bekal sekolah dan jamuan di balai raya.'],
  sabun: ['Sabun & kain', 'Sabun buku dan kain kapas, untuk basuh selepas bermain di padang.'],
  pencuci: ['Bekalan mencuci', 'Botol pencuci dan berus untuk gotong-royong hujung minggu.'],
  benih: ['Benih kebun', 'Paket benih kecil untuk batas sayur di belakang rumah.'],
  kotak: ['Kotak kedai', 'Kotak terpakai diikat tali rafia. Tempat simpan macam-macam khazanah.'],
  kainlap: ['Kain lap', 'Kain lap berjalur, teman kaunter kedai dan meja warung.'],
  lampin: ['Lampin bayi', 'Pek lampin dari kedai runcit, pesanan rumah yang ada adik kecil.'],
  roti: ['Roti keping', 'Roti dalam plastik berikat. Sapuan kaya sebelum berangkat ke sekolah.'],
  begkertas: ['Beg kertas', 'Beg kertas coklat dilipat rapi di belakang kaunter.'],
  label: ['Label harga', 'Label harga ditulis tangan. Beli satu, simpan baki duit dalam poket.'],
  resit: ['Buku resit', 'Buku resit berkarbon, nombor siri merah dan tulisan pen biru.'],
  bukulatihan: ['Buku latihan', 'Buku garis kulit coklat, nama dan kelas ditulis di petak depan.'],
  kapur: ['Kapur papan hitam', 'Kotak kapur putih. Debu di jari selepas padam papan hitam cikgu.'],
  poster: ['Poster pekan', 'Poster kertas untuk pertandingan dan kenduri, ditampal di papan kenyataan.'],
  taliwau: ['Gelendong tali wau', 'Tali pada gelendong kayu. Tunggu angin petang di padang.'],
  pensel: ['Pensel sekolah', 'Pensel kuning, pemadam merah jambu dan mata yang baru diraut.'],
  bukuskrap: ['Buku skrap', 'Gunting, gam dan keratan majalah untuk projek sekolah.'],
  pelincir: ['Minyak pelincir', 'Botol minyak di bengkel kapcai. Bau bengkel dan bunyi enjin petang.'],
  sarungkerja: ['Sarung tangan bengkel', 'Sarung tangan tebal untuk mengangkat barang di bengkel Pak Man.'],
  sarungkebun: ['Sarung tangan kebun', 'Sarung tangan hijau berlumpur, untuk menolong Pak Mat di kebun.'],
  sayur: ['Bakul sayur', 'Bakul anyaman penuh sayur segar dari kebun kampung.'],
  makanan: ['Bungkusan lauk', 'Lauk dalam bungkusan kertas, dibawa balik dari warung untuk keluarga.'],
  aiskrim: ['Ais krim Malaysia', 'Plastik panjang berisi ais berwarna. Gigit hujung, makan sebelum cair!'],
  keropok: ['Keropok ikan', 'Keropok rangup dalam plastik, jajan selepas sekolah dengan kawan-kawan.'],
  sirap: ['Air sirap bungkus', 'Sirap merah dalam plastik berikat, dengan straw dan ais ketul.'],
  kuihmuih: ['Kuih petang', 'Kuih lapis dan onde-onde di atas daun pisang. Pilih satu sebelum habis.'],
  nasilemak: ['Nasi lemak bungkus', 'Bungkusan kecil daun pisang dan kertas, sambal pedas untuk sarapan.'],
  guli: ['Guli kaca', 'Guli berpusar warna, satu beg kecil untuk main dalam bulatan di tanah.'],
  pelekat: ['Pelekat sekolah', 'Pelekat bintang dan muka senyum untuk buku, bekas pensel dan album.'],
  komik: ['Komik kedai', 'Komik humor tempatan, dibaca ramai-ramai di tangga rumah.'],
  kad: ['Kad koleksi', 'Buka paket, harap dapat kad paling cantik. Kad sama boleh tukar dengan kawan.'],
  gasing: ['Gasing kayu', 'Gasing bertali, dilontar di tanah lapang. Tengok siapa paling lama berpusing.'],
  wau: ['Wau bulan', 'Wau bercorak bunga dengan ekor bulan. Cantik digantung, seronok diterbangkan.'],
  tamiya: ['Mini 4WD', 'Kereta mini bermotor, roller di sisi dan roda kecil. Impian simpan duit poket.'],
  barangdapur: ['Barang dapur', 'Bekalan dapur dalam beg kedai: sayur, bawang dan barang untuk masak malam.'],
  kuih: ['Kuih buatan Nenek', 'Kuih yang Nenek susun di dalam kotak untuk jiran. Jangan makan tengah jalan!'],
  bekas: ['Bekas makanan', 'Bekas bertutup dari rumah jiran. Pulangkan selepas kenduri.'],
  jemputan: ['Kad jemputan', 'Kad bunga dalam sampul, dihantar dari pintu ke pintu untuk kenduri.'],
  notis: ['Notis kampung', 'Helaian notis dari sekolah atau balai raya, sebelum semua guna telefon pintar.'],
  buku: ['Buku tertinggal', 'Buku latihan berbalut plastik, tertinggal selepas kelas.'],
  komikpinjam: ['Komik pinjam', 'Komik yang sudah berlipat di bucu. Pinjam boleh, pulangkan jangan lupa.'],
  mainan: ['Mainan lama', 'Robot plastik lama dari kotak Atuk, masih sayang untuk dibuang.'],
  hasil: ['Hasil kebun', 'Sayur dan buah dibawa terus dari kebun untuk warung.'],
  bakulhadiah: ['Bakul hadiah', 'Bakul anyaman dibalut reben, buah dan biskut untuk orang tersayang.'],
  bekalan: ['Bungkusan bekalan', 'Bungkusan kertas coklat bertali, pesanan dari satu kedai ke kedai lain.'],
  pesanan: ['Pesanan alat tulis', 'Pensel, pembaris dan buku latihan, bekalan baru untuk kelas.'],
  hidangan: ['Hidangan kenduri', 'Tingkat makanan berlapis, dihantar dari dapur ke rumah jiran.']
};

export const ITEM_KINDS = { goods: 'Barang kedai', snack: 'Makanan & minuman', collect: 'Mainan & koleksi', cargo: 'Barang penghantaran' };
for (const [id, car] of Object.entries(TAMIYA_CARS)) ITEM_ART[id] = [`${car.series} · ${car.name}`, car.memory];
export const itemImagePath = id => `./assets/items/${id}.svg`;

for (const [id, part] of Object.entries(TAMIYA_PARTS)) ITEM_ART[id]=[part.name,`${part.note} Parts dari kabinet Uncle Lim, pasang sendiri sebelum jom race.`];
