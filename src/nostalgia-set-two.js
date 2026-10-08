// Set two uses existing townsfolk and games. Device battle/care simulation is
// intentionally outside these keepsake stories; their objects are rewards.
const stop = (place, label, clue, extra = {}) => ({ place, label, clue, ...extra });
const noGrind = { deliveries: 0, destinations: 0, long: 0 };
const job = (tag, from, stops, item, note) => ({ id: `S-${tag}`, story: tag, kind: 'parcel', requester: from, from, to: stops.at(-1), stops, item, qty: stops.length, cost: 0, upah: 100, note });
export const SET_TWO_QUESTS = {
  nostalgia_G02: { set: 2, afterChapter: 13, later: true, giver: 'Faiz', npc: 'faiz', place: 34, title: 'Satu Lagi Link Battle',
    intro: 'Aku jumpa dua Digimon lama. Bantu empat delivery ke tiga destinasi, kemudian jejak kawan yang selalu berlawan dengan aku lepas sekolah. Menang Selekoh Lapan untuk kenangan kita.',
    grind: { deliveries: 4, destinations: 3, long: 0 }, trail: [
      stop(29, 'Cari rekod kawan Faiz', 'Cikgu Farid jumpa nama kawan Faiz dalam rekod kelab. Dia selalu meminjam komik di perpustakaan.'),
      stop(33, 'Semak rekod kelab di perpustakaan', 'Cik Azura masih ingat dua budak menunggu bas sambil membandingkan Digimon. Tanya Pak Karim.'),
      stop(35, 'Dengar cerita Pak Karim', 'Pak Karim menyampaikan jemputan pertemuan mereka. Menang sekali di Selekoh Lapan, kemudian kembali kepada Faiz. Dua kawan itu sudah bersedia berjumpa semula.')
    ], challenges: [{ game: 'tamiya', tracks: ['eight'], count: 1, label: 'Tempat pertama di Selekoh Lapan' }],
    choices: [{ label: 'Pemain ketiga', memory: 'Pemain ketiga dalam persahabatan lama kami, daripada Faiz.' }, { label: 'Janji berjumpa lagi', memory: 'Dua Digimon lama dan janji untuk berjumpa lagi.' }] },
  nostalgia_G03: { set: 2, afterChapter: 13, later: false, giver: 'Cikgu Hani', npc: null, place: 20, title: 'Penjaga Waktu Rehat',
    intro: 'Cikgu nak siapkan nota penjagaan untuk aktiviti tadika. Cari tiga nota: makan, kebersihan dan rehat. Lepas itu datang semula pada hari game berikutnya.',
    grind: noGrind, trail: [
      stop(30, 'Dapatkan nota makan', 'Makcik Ros tulis nota: beri makan bila perlu, jangan berlebihan. Nota kebersihan ada dengan Kak Lina.'),
      stop(12, 'Dapatkan nota kebersihan', 'Kak Lina tulis nota: tempat yang bersih memudahkan kita menjaga benda kecil. Nenek ada nota rehat.'),
      stop(2, 'Dapatkan nota rehat', 'Nenek tulis nota rehat. Tiga nota sudah lengkap. Bawa ke Cikgu Hani esok, selepas tidur di rumah.'),
      stop(20, 'Lawatan kedua kepada Cikgu Hani', 'Cikgu Hani sudah menyediakan aktiviti tadika menggunakan tiga nota kamu. Peranti simpanannya menjadi hadiah untuk usaha kamu.', { waitDays: 1 })
    ], challenges: [], choices: [{ label: 'Benda kecil pun penting', memory: 'Benda kecil pun perlukan orang yang ambil peduli. Hadiah Cikgu Hani.' }, { label: 'Nota penjagaan pertama', memory: 'Tiga nota dan dua hari yang mengajar aku menjaga dengan sabar.' }] },
  nostalgia_P01: { set: 2, afterChapter: 13, later: false, giver: 'Cik Azura', npc: null, place: 33, title: 'Lukisan di Tepi Halaman',
    intro: 'Ada lakaran di celah majalah ini. Tiga sudut pekan kelihatan sama: sekolah, kedai mainan dan balai raya. Cari pelukisnya; kita minta izin sebelum pamerkan salinan.',
    grind: noGrind, trail: [
      stop(29, 'Padankan lakaran sekolah', 'Tingkap sekolah dalam lakaran sepadan dengan pejabat lama. Cikgu Farid kenal gaya tulisan, tetapi mahu kamu semak lakaran kedai dahulu.'),
      stop(25, 'Padankan lakaran kedai mainan', 'Uncle Lim kenal susunan tingkap dalam lakaran kedua. Pelukis pernah meninggalkan nota di balai raya.'),
      stop(32, 'Padankan lakaran balai raya', 'Pak Salleh padankan sudut ketiga. Mak Cik Normah pernah bercerita tentang lakaran yang belum siap.'),
      stop(26, 'Minta izin daripada pelukis', 'Mak Cik Normah mengaku dia pelukisnya. Dia benarkan satu salinan dipamerkan. Serahkan izin ini kepada Cik Azura.'),
      stop(33, 'Serahkan izin pameran', 'Cik Azura menerima salinan dan izin pelukis. Dia menghadiahkan majalah GEMPAK simpanannya sebagai kenangan lakaran yang akhirnya dilihat.')
    ], challenges: [], choices: [{ label: 'Lukisan yang berani dipamerkan', memory: 'Lakaran Mak Cik Normah yang akhirnya dilihat orang. Daripada Cik Azura.' }, { label: 'Tiga sudut pekan', memory: 'Sekolah, kedai dan balai raya dalam satu lakaran kenangan.' }] },
  nostalgia_P04: { set: 2, afterChapter: 13, later: true, requires: ['nostalgia_P02'], giver: 'Faiz', npc: 'faiz', place: 34, title: 'Komik yang Tak Pulang',
    intro: 'Nama dalam komik pinjam ni buat aku teringat kawan lama. Tolong semak rekod perpustakaan, nota sekolah dan cerita kami berdua. Komik asal kena dipulangkan.',
    grind: noGrind, trail: [
      stop(33, 'Semak rekod pinjaman komik', 'Cik Azura jumpa tarikh pinjaman. Ada nota sekolah terselit pada hari komik itu sepatutnya dipulangkan.'),
      stop(29, 'Baca nota sekolah lama', 'Nota itu menerangkan pertukaran kelas yang mengejut. Faiz tidak tahu pemilik komik sudah berpindah. Mei Ling menyimpan alamatnya.'),
      stop(14, 'Dengar penjelasan kawan lama', 'Mei Ling menyampaikan cerita bekas rakan mereka: dia sangka komiknya sudah hilang. Faiz pula sangka kawan itu tidak mahu berjumpa lagi.'),
      stop(33, 'Pulangkan komik asal', 'Perpustakaan menerima komik asal untuk pemiliknya. Dua kawan bersetuju berbaik semula dan menyediakan salinan hadiah. Jumpa Faiz.')
    ], challenges: [], choices: [{ label: 'Persahabatan dipulihkan', memory: 'Komik dipulangkan, persahabatan dibuka semula. Daripada Faiz dan kawan lamanya.' }, { label: 'Janji pulangkan pinjaman', memory: 'Kenangan bahawa barang pinjam mesti sampai semula kepada pemiliknya.' }] },
  nostalgia_M05: { set: 2, afterChapter: 13, later: false, giver: 'Kak Ita', npc: 'ita', place: 21, title: 'Semua Bawa Kerusi',
    intro: 'Malam Senario belum jadi sebab kabel, kerusi dan jemputan belum siap. Tiga parcel khas ada di bengkel dan balai raya. Siapkan semuanya, kemudian jumpa Pak Salleh selepas 7 malam.',
    grind: noGrind, trail: [
      stop(36, 'Hantar kabel AV ke balai raya', 'Kabel AV sudah sampai di balai raya. Pak Salleh perlukan kerusi daripada stor.', { delivery: job('senario-kabel', 36, [32], 'kabelav', 'Kabel AV malam Senario: Collect di Pak Man, kemudian Deliver parcel di balai raya.') }),
      stop(32, 'Ambil dan hantar kerusi lipat', 'Kerusi sudah diserahkan kepada Kak Ita. Jemput tiga rumah untuk malam tayangan.', { delivery: job('senario-kerusi', 32, [21], 'kerusilipat', 'Kerusi malam Senario: Collect di Pak Salleh, kemudian Deliver parcel kepada Kak Ita.') }),
      stop(32, 'Hantar tiga jemputan', 'Tiga keluarga sudah menerima jemputan. Persediaan selesai; datang ke balai raya selepas 19:00 pada mana-mana hari.', { delivery: job('senario-jemputan', 32, [4, 11, 18], 'jemputan', 'Jemputan malam Senario: hantar ke rumah 4, 11 dan 18 mengikut urutan.') }),
      stop(32, 'Sertai malam tayangan selepas 19:00', 'Kerusi tersusun, kabel terpasang dan jiran-jiran berkumpul. Satu pekan ketawa bersama. Kak Ita ada VCD simpanan untuk kamu.', { afterMinute: 19 * 60 })
    ], challenges: [], choices: [{ label: 'Satu lorong ketawa', memory: 'Malam satu lorong ketawa bersama. Hadiah Kak Ita selepas malam Senario.' }, { label: 'Semua bawa kerusi', memory: 'Malam yang menjadi kerana semua orang membawa sedikit bantuan.' }] },
  nostalgia_I05: { set: 2, afterChapter: 13, later: false, giver: 'Pak Karim', npc: null, place: 35, title: 'Panggilan Selepas Sekolah',
    intro: 'Dua kad telefon ini mengingatkan aku pada murid yang menunggu bas dan tak dapat hubungi rumah. Jejak sekolah, warung dan keluarga yang membantu hari itu.',
    grind: noGrind, trail: [
      stop(29, 'Cari saksi di sekolah', 'Cikgu Farid teringat murid yang menunggu selepas kelas. Kak Ita di warung memberinya air sementara menunggu.'),
      stop(21, 'Dengar saksi di warung', 'Kak Ita mengiringi murid ke telefon awam dekat hentian bas. Pak Karim cuba menelefon, tetapi nombor keluarga sudah berubah.'),
      stop(35, 'Jejaki panggilan di hentian bas', 'Pak Karim menunjuk tempat telefon awam dahulu. Pak Abu, posmen yang kenal setiap alamat, berjaya menghubungi keluarga itu.'),
      stop(13, 'Kenal pasti orang yang membantu', 'Pak Abu akhirnya mendapat nombor baharu keluarga. Keluarga meminta ucapan terima kasih disampaikan kepada semua yang menunggu bersama.'),
      stop(32, 'Serahkan ucapan terima kasih', 'Pak Salleh menerima ucapan keluarga untuk papan balai raya. Pak Karim menyediakan sepasang kad telefon KL 98 untuk kamu.')
    ], challenges: [], choices: [{ label: 'Seseorang akan datang', memory: 'Kad kecil yang pernah bermakna seseorang sedang datang menjemput. Daripada Pak Karim.' }, { label: 'Terima kasih satu pekan', memory: 'Dua kad telefon dan cerita orang pekan yang tidak meninggalkan seorang murid sendirian.' }] },
  nostalgia_I03: { set: 2, afterChapter: 13, later: true, giver: 'Pak Man', npc: 'man', place: 36, title: 'Kereta Pertama Ayah',
    intro: 'Keluarga ni nak model Wira pertama mereka. Bantu lima delivery ke tiga destinasi, termasuk dua laluan 60 m+. Lepas cari resit petrol dan gambar lama, model boleh siap pada hari game berikutnya.',
    grind: { deliveries: 5, destinations: 3, long: 2 }, trail: [
      stop(37, 'Cari resit petrol Wira lama', 'Pak Din jumpa resit petrol dalam buku lama. Nama pada belakangnya ialah Encik Faizal.'),
      stop(17, 'Cari gambar keluarga', 'Encik Faizal menunjukkan gambar Wira pertama keluarganya. Bawa butiran model dan warna itu kepada Pak Man.'),
      stop(36, 'Serahkan bukti kepada Pak Man', 'Pak Man menerima resit dan gambar. Dia mula menyiapkan miniatur Wira. Tidur di rumah dan datang semula pada hari game berikutnya.'),
      stop(36, 'Kembali pada hari game berikutnya', 'Miniatur Wira sudah siap. Keluarga menyimpan satu, dan Pak Man menyediakan model pasangan untuk kamu.', { waitDays: 1 })
    ], challenges: [], choices: [{ label: 'Langkah pertama keluarga', memory: 'Model kecil untuk langkah besar sebuah keluarga. Daripada Pak Man.' }, { label: 'Resit dan gambar lama', memory: 'Dua bukti kecil yang membawa kereta pertama ayah kembali dalam kenangan.' }] },
  nostalgia_P05: { set: 2, afterChapter: 13, later: true, newKeepsakes: 3, giver: 'Mei Ling', npc: 'meiling', place: 34, title: 'Pertukaran yang Kami Ingat',
    intro: 'Dua pengumpul ingat satu pertukaran kad dengan cara berbeza. Baca senarai, nota dan cerita kedua-duanya. Menang Dam Haji Jaguh dan race Jaguh untuk buktikan kesabaran kamu.',
    grind: noGrind, trail: [
      stop(25, 'Periksa senarai kad pertama', 'Uncle Lim menyimpan senarai pertama. Pemiliknya menganggap kad yang diberi cuma pinjaman. Senarai kedua ada dengan Cik Azura.'),
      stop(33, 'Periksa nota pertukaran', 'Cik Azura jumpa nota: tukar dulu, bincang kemudian. Kedua-dua pengumpul memberikan maksud berbeza kepada ayat itu.'),
      stop(15, 'Dengar pengumpul pertama', 'Faiz menyampaikan cerita pengumpul pertama. Dia mahu kadnya dihargai, bukan semata-mata menang dalam pertukaran.'),
      stop(14, 'Dengar pengumpul kedua', 'Mei Ling menyampaikan cerita pengumpul kedua. Mereka bersetuju membuat pertukaran baharu secara adil. Menang Dam Haji Jaguh dan Tamiya Jaguh, kemudian jumpa Mei Ling untuk kad hadiah berasingan.')
    ], challenges: [{ game: 'dam', level: 'jaguh', count: 1, label: 'Kalahkan Pak Din di Dam Haji Jaguh' }, { game: 'tamiya', tracks: ['jaguh'], count: 1, label: 'Tempat pertama di Tamiya Jaguh' }],
    choices: [{ label: 'Kepercayaan lebih berharga', memory: 'Diperoleh melalui kepercayaan dan dua cabaran Jaguh. Daripada Mei Ling.' }, { label: 'Pertukaran yang dipersetujui', memory: 'Kad yang mengingatkan aku bahawa pertukaran terbaik dipersetujui kedua-dua pihak.' }] }
};
export const SET_TWO_IDS = Object.keys(SET_TWO_QUESTS);
export const SET_TWO_EXHIBITION = {
  nostalgia_G02: 'Faiz bertemu semula kawan lamanya melalui rekod sekolah, komik dan cerita Pak Karim. Empat penghantaran membantu pertemuan mereka. Kemenangan Selekoh Lapan mengakhiri perjalanan, dan Digimon menjadi kenangan seorang pemain ketiga.',
  nostalgia_G03: 'Nota makan Makcik Ros, nota kebersihan Kak Lina dan nota rehat Nenek menjadi aktiviti tadika Cikgu Hani. Pada hari berikutnya, Tamagotchi simpanannya menjadi hadiah kerana menjaga benda kecil dengan sabar.',
  nostalgia_P01: 'Tiga sudut pekan dalam lakaran membawa kami kepada Mak Cik Normah. Dengan izinnya, Cik Azura menerima salinan untuk perpustakaan dan menghadiahkan GEMPAK sebagai kenangan keberanian seorang pelukis.',
  nostalgia_P04: 'Rekod perpustakaan dan nota sekolah menjelaskan komik yang tidak dipulangkan. Dua kawan akhirnya mendengar cerita masing-masing. Komik asal kembali kepada pemiliknya; salinan Mutiara Naga menjadi hadiah persahabatan.',
  nostalgia_M05: 'Kabel, kerusi dan tiga jemputan sampai melalui tangan seorang penghantar. Selepas 7 malam, jiran-jiran berkumpul di balai raya. VCD Kak Ita mengingatkan kami kepada malam satu lorong ketawa bersama.',
  nostalgia_I05: 'Seorang murid menunggu bas tanpa dapat menghubungi rumah. Guru, Kak Ita, Pak Karim dan Pak Abu membantu sehingga keluarga datang. Sepasang kad telefon membawa ucapan terima kasih itu kepada satu pekan.',
  nostalgia_I03: 'Resit petrol Pak Din dan gambar Encik Faizal membantu Pak Man menyiapkan miniatur Wira pertama sebuah keluarga. Lima penghantaran dan lawatan pada hari berikutnya membawa model pasangan kepada pemain.',
  nostalgia_P05: 'Senarai kad, nota pertukaran dan dua cerita menjelaskan salah faham lama. Selepas kedua-dua pengumpul bersetuju dan dua cabaran Jaguh dimenangi, Mei Ling memberi kad Charizard berasingan dengan dedikasi pilihan pemain.'
};
