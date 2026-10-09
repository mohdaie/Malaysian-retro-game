# RETROMALAYSIA
## CHAPTER 1: KAWAN SEBELUM GARIS PENAMAT

Dialog, storyboard, siasatan, delivery dan progression lengkap

Versi skrip 1.0 | 9 Oktober 2026 | Pekan Seri Kenangan, sekitar 2001

Dokumen mengandungi spoiler keseluruhan bab. Semua dialog di bawah ialah teks permainan, kecuali nota pengarahan dan jadual pembangunan. `{nama}` diganti dengan nama pilihan pemain; Amir dan Nur menggunakan skrip sama. Pemain menggunakan saya dengan orang dewasa, aku/kau sesama kawan.

## 1. Cerita yang dikunci

Cuti sekolah baru bermula. Pemain kembali mengenali pekan melalui kerja penghantaran, rumah jiran dan permainan petang. Faiz, anak keluarga senang yang suka menunjukkan koleksinya, berkawan baik dengan Mei Ling, pelajar pintar dan anak Uncle Lim. Mei Ling membantu menjaga kedai alat tulis, mainan dan elektronik bapanya. Dia tahu barang kedai, tetapi bukan pelumba Tamiya.

Stok motor dan alat ganti Tamiya hilang beberapa kali. Orang mula mengaitkannya dengan Faiz kerana dia kerap datang dan pernah bercakap besar tentang motor baharu. Badrul, kawan yang mula-mula membantu pemain, mengukuhkan sangkaan itu melalui cerita separuh benar. Johnny dan Logeswaran masing-masing menyimpan pemerhatian yang tidak lengkap.

Pemain menyiasat tiga perkara: di mana Faiz ketika kejadian terakhir, bagaimana bungkusan bergerak melalui pekan, dan dari mana datangnya alat ganti tanpa rekod jualan. Keterangan rumah, kantin, bengkel, perhentian bas dan sekolah saling melengkapi. Barang bertanda kedai sahaja tidak membuktikan kecurian. Pemain perlu menggabungkan asal stok, percanggahan cerita dan pemeriksaan yang dibuat dengan izin.

Plot twist: orang yang membantu menyusun siasatan ialah pencurinya. Badrul mengambil alat ganti untuk menyiapkan kereta perlumbaannya dan membiarkan Faiz dipersalahkan. Dia mengaku selepas bukti diperiksa, memulangkan barang dan membetulkan cerita di hadapan kumpulan yang mendengar tuduhan. Keluarga dan cikgu mengurus akibatnya; pemain tidak menghukum sendiri.

Kejohanan sekolah berlangsung selepas nama Faiz dibersihkan. Lima peserta ialah pemain, Faiz, Badrul, Johnny dan Logeswaran. Mei Ling serta Uncle Lim mengurus pendaftaran dan hadiah. Badrul hanya boleh berlumba selepas barang dipulangkan dan pemeriksaan diselesaikan; dia menggunakan kereta pinjaman asas tanpa barang curi. Menang kejohanan diperlukan untuk menutup bab dan memperoleh Lightning Magnum. Kalah tidak mengulang siasatan.

## 2. Semakan sumber dan perubahan yang diperlukan

| Bahagian | Dapatan semakan | Keputusan skrip ini |
| --- | --- | --- |
| Repo utama | `mohdaie/Malaysian-retro-game`, package.json v2.11.1 | Rujukan keadaan main ketika semakan; tiada push/merge dalam tugasan ini |
| Kod tempatan | v2.12.1, commit `1aaa058`; kisah RM30 dan kaset | Diganti oleh skrip kecurian; versi lama tidak dicampur |
| Mei Ling | NPC-14, rumah 14, post padang 34, pelumba dalam kod | Anak Uncle Lim; post utama kedai 25; rumah 14 kekal alamat; tiada slot pelumba |
| Faiz | NPC-13, rumah 15, post padang 34 | Kawan kaya, ada koleksi; protagonis yang difitnah |
| Budak taman | Adam, Hakim, Aisyah, Ah Keong, Siti, Ravi | Hakim -> Badrul; Ah Keong -> Johnny; Ravi -> Logeswaran. Adam, Aisyah, Siti kekal |
| Tamiya | Tiga trek, tiga peserta termasuk Mei Ling, 12 alat ganti | Kejohanan lima peserta dan ganjaran Magnum perlu dibina |
| Wang | Kod menyimpan sen; upah kerja lazim sekitar RM0.60-RM3.50 | Semua angka dokumen dalam RM; jangan darab sepuluh sekali lagi |
| Potret | Registry hanya Amir/Nur; tangkap layar menunjukkan banyak sheet NPC lain | Gunakan hasil asal; padanan dan crop perlu disahkan. Jangan jana semula atau guna sheet orang lain |

Semakan kod: `src/cast.js`, `src/crowds.js`, `src/chapter-data.js`, `src/dialogue-portraits.js`, `src/economy.js`, `src/tamiya.js`, `src/tamiya-parts.js`, `src/tamiya-progress.js`. Skrip ini hasil reka bentuk lengkap, belum diimplementasikan atau diuji dalam game.

## 3. Watak, lokasi dan fungsi

| Watak / identiti | Lokasi | Peranan dan batas pengetahuan |
| --- | --- | --- |
| Pemain: Amir/Nur | Rumah 1/11 | Menyambung keterangan; tidak membaca fikiran NPC |
| Faiz `faiz` | Rumah 15, padang 34 | Kawan baik Mei Ling; barang koleksinya dibeli, bukan bukti dia mencuri |
| Mei Ling `meiling` | Kedai 25, rumah 14 | Anak Uncle Lim; tahu stok, menjaga nama kedai, mahu percaya Faiz |
| Uncle Lim `lim` | Kedai 25 | Pemilik; boleh sahkan buku jualan dan barang, bukan tahu siapa pelaku |
| Badrul, asal `hakim` | Padang 34; rumah 17 sebagai tempat panggil | Kawan membantu; pencuri; rumah ini alamat operasi crowd, bukan penetapan ibu bapa baharu |
| Johnny, asal `keong` | Kedai sudut 19, padang 34; pintu rumah 18 | Saksi beg Faiz berada di padang; tidak melihat kecurian |
| Logeswaran, asal `ravi` | Padang 34; pintu rumah 5 | Saksi tempat Faiz sebelum/selepas kantin; memilih kata dengan tepat |
| Pak Rahman `rahman` | Runcit 22 | Mentor delivery; mengenali pita bungkusan, bukan kandungannya |
| Makcik Ros `ros` | Kantin 30 | Melihat Faiz membantu sepanjang sela kejadian terakhir |
| Cikgu Farid `farid` | Sekolah 29 | Rekod kehadiran persiapan sekolah dan penyelia kejohanan |
| Nenek `nenek` | Rumah Tok 2 | Congkak dan pandangan tentang persahabatan; tiada bukti rahsia ajaib |
| Atuk `atuk` | Rumah 8/padang 34 | Gasing dan disiplin mencuba; bukan pakar motor Tamiya |
| Makcik Salmah `salmah` | Rumah 4 | Menerima bungkusan di bangku beranda pada petang kejadian |
| Kak Rohani `rohani` | Rumah 5 | Tahu bangku beranda boleh dilihat dari jalan; bukan bukti pelaku |
| Mak Long Timah `timah` | Rumah 7 | Melihat laluan kotak sebelum hujan; tidak kenal wajah |
| Pak Abu `abu` | Rumah 13 | Bekas posmen; membantu bezakan catatan penerima dan sangkaan |
| Pak Man `man` | Bengkel 36 | Menemui serpihan label 7C dalam celah kereta Badrul selepas membaiki suis |
| Pak Hussin `hussin` | Kedai basikal 24 | Pernah melihat kotak dibawa ke sekolah, tidak mengesahkan isi |
| Pak Karim `karim` | Perhentian bas 35 | Melihat Badrul membawa kotak lama; ingatan masa dibetulkan melalui tiket |
| Pak Din `din` | Kiosk 37 | Dam Haji; menyimpan resit berhenti bas, bukan saksi kecurian |
| Kak Ita `ita` | Warung 21 | Delivery makanan dan tempat dengar khabar |
| Pak Mat `pakmat` | Kebun 9 | Bekalan kantin; menerangkan jalan kampung yang biasa digunakan |
| Pak Salleh `salleh` | Balai raya 32 | Penyelia pertemuan, notis pembetulan dan majlis penutup |
| Ustaz Hassan `hassan` | Masjid 31 | Ruang refleksi: jangan menyebarkan nama sebelum semak |
| Makcik Normah `normah` | Jahit 26 | Ukur reben hadiah; side job, bukan saksi utama |
| Cik Azura `azura` | Perpustakaan 33 | Komik dan side job; rekod sekolah mesti disahkan Farid |
| Abang Kamal `kamal` | Rumah 6 | Angkut meja; benih kisah orang dewasa untuk Chapter 2 |
| Abang Hafiz `hafiz` | Padang 34 | Penjagaan trek, latihan dan panggilan budak selepas waktu keluar |

Penduduk lain kekal menerima kerja biasa. Bab ini memperkenalkan banyak rumah, tetapi tidak memaksa setiap orang mempunyai bukti atau kaitan rahsia dengan pencuri.

## 4. Kebenaran kejadian: rujukan penulis sahaja

| Masa relatif | Peristiwa sebenar | Apa yang pemain boleh buktikan |
| --- | --- | --- |
| Selasa sebelum cuti | Badrul mengambil satu Motor Torque ketika membantu membawa kotak kosong | Motor berkod stok 7A dipulangkan dalam pemeriksaan akhir; rekod tiada jualan |
| Khamis sebelum cuti | Dia mengambil sepasang Roller Aluminium | Roller berkod stok 7B; diletakkan dalam kereta yang dibawa ke bengkel |
| Jumaat, 15:10-15:40 | Faiz membantu mengangkat minuman di kantin dengan Ros dan Farid | Buku persiapan + keterangan Ros + Logeswaran di pintu kantin |
| Jumaat, 15:20-15:35 | Badrul mengambil satu Motor Dash dan satu Gear Sprint dari batch 7C | Buku stok Mei Ling mengunci sela kehilangan; barang diperiksa kemudian |
| Jumaat, sekitar 15:25 | Johnny nampak Badrul meminjam beg Faiz di padang | Beg sahaja tidak membuktikan isi; cerita asal Badrul bercanggah |
| Jumaat, sekitar 15:35 | Kotak diletakkan di bangku beranda Salmah: pembawa kata mahu ambil semula selepas hujan | Salmah hanya menerima di bangku; kotak tidak pernah dihantar kepadanya secara rasmi |
| Jumaat, sekitar 15:45 | Badrul mengambil kotak dan lalu di perhentian bas, kemudian ke sekolah | Timah nampak laluan; Karim sahkan nama selepas keterangan + tiket hentian |
| Jumaat, lewat petang | Kotak dibuka di meja persiapan sekolah. Serpihan label melekat pada kereta | Sampul serpihan 7C dari Pak Man + kotak kosong di sekolah |
| Sabtu, awal permainan | Badrul mencadangkan Faiz sebagai orang terakhir membawa kotak | Dakwaan tersimpan sebagai dakwaan, bukan fakta |

Kod 7A/7B/7C ialah batch fiksyen kedai. Tanda batch tidak unik kepada seorang pemilik; rekod jualan dan pemeriksaan barang tetap diperlukan. Tiada CCTV, telefon pintar, bukti daripada Walkman atau akses ke rumah tanpa izin.

## 5. Storyboard keseluruhan

Ini storyboard produksi bertulis: sudut kamera, bunyi, aksi, interaksi dan hasil. Panel gambar baharu tidak dijana; gaya kekal ilustrasi komikal Amir/Nur, garis tebal dan warna hangat.

| Scene | Visual / bunyi / transisi | Aktiviti dan hasil |
| --- | --- | --- |
| P00 | POV bilik 2026; hujan, kipas; swipe album Walkman/Digimon, Too Phat/kad; notifikasi | Tekan Klik sini; fade album ke pekan; pilih Amir/Nur dan nama |
| S01 | Kamera aras pinggang di beranda; kasut sekolah di pintu | Ibu perkenalkan kerja; D01 |
| S02 | Tracking beg grocery; papan harga tulisan tangan | Rahman ajar accept/pickup/deliver; D02 |
| S03 | Close-up biji congkak; teko atas meja | Kenal Nenek; permainan pilihan; D03 |
| S04 | Wide padang; lima budak, radio jauh, bunyi motor kecil | Kenal semua sebelum tuduhan; latihan Tamiya; Faiz show off ringan |
| S05 | Kedai: Mei Ling menutup buku stok; Uncle Lim kira rak kosong | Kecurian diketahui; D04; siasatan dibuka |
| S06 | Bangku padang, beg biru di bawah | Badrul membantu, dakwaan awal; pemain memilih laluan |
| S07 | Kebun -> kantin; pinggan dan kerusi disusun | D05; Ros memberi masa Faiz di kantin |
| S08 | Sekolah; buku persiapan di meja guru | D06; Farid mengesahkan sela masa |
| S09 | Padang; Johnny menimbang kad, Loges pegang buku | Dua keterangan bebas; gabungkan alibi |
| S10 | Warung -> beranda Salmah; kamera kekal di luar rumah | D07; bungkusan tidak dihantar kepada Salmah secara rasmi |
| S11 | Bekas kuih, reben biru tertinggal pada bangku | D08/D09; nota penerimaan dan laluan sebelum hujan |
| S12 | Perhentian bas; tiket kertas, bas berlalu | D10; Karim membetulkan ingatan masa melalui tiket |
| S13 | Kiosk; papan Dam Haji, kipas kecil | D11; Dam pilihan, salinan resit hentian |
| S14 | Kedai -> bengkel; Walkman lama di sisi skru | D12; label 7C dalam sampul, bukan barang bukti dari muzik |
| S15 | Bengkel -> rumah Faiz/padang; Faiz menguji Walkman | D13; asal koleksi Faiz, reaksi selepas alibi |
| S16 | Kedai; buku stok dan buku jualan sebelah-menyebelah | Semak tiada jualan batch hilang; simpan fakta belum tentukan pelaku |
| S17 | Sekolah; izin guru, kotak di meja terbuka | D14; gear 7C dan resit kerja Badrul; percanggahan laluan |
| S18 | Beranda Atuk; gasing berputar, petang redup | D15/D16; gasing pilihan dan ruang bernafas sebelum pendedahan |
| S19 | Buku pemain: kad bukti diseret berpasangan | Tiga rumusan: alibi, laluan kotak, asal stok; pilihan salah boleh semak lagi |
| S20 | Padang; Badrul kelihatan biasa, tidak ada muzik penjahat | Tunjuk percanggahan; dia mempertahankan cerita; jemput semakan |
| S21 | Balai raya; kumpulan kecil, kotak di atas meja | D17; pemeriksaan berizin; twist dan pengakuan |
| S22 | Kedai dan padang; dialog pendek bersama semua | D18; pembetulan nama Faiz dan pemulangan stok; siasatan selesai |
| S23 | Sekolah: trek dipasang, Mei Ling pegang borang | Pendaftaran lima pelumba; D19; kedai upgrade/latihan terbuka |
| S24 | Close-up launch meter -> wide trek -> pit | Kejohanan tiga pusingan; kalah/seri/quit boleh sambung ulang |
| S25 | Podium kecil, reben kain, Magnum dalam kotak | D20; hadiah unik; penutup persahabatan |
| S26 | Meja balai raya; foto lama Kamal/Pak Man sekilas | Teaser dewasa Chapter 2; free roam dan side quest kekal |

## 6. Skrip utama lengkap

### P00 - Album yang memanggil

Lima panel: bilik biasa 2026; telefon di tangan; gambar meja awal 2000; gambar kawan/basikal; notifikasi. Teks monolog tidak menyebut lelaki/perempuan atau kerjaya tertentu.

Pemain: Balik kerja, tengok telefon. Esok ulang lagi.
Pemain: Eh... macam meja dekat rumah dulu.
Pemain: Petang-petang tinggal beg sekolah, terus keluar. Tak payah janji panjang. Semua dah tahu nak jumpa dekat mana.
Pemain: Rindu pula zaman tu.
Notifikasi: Nak balik zaman 2000?
Butang: Klik sini.

Tekan: hujan senyap, bunyi basikal dan burung masuk; pilihan karakter/nama; load pekan. Abaikan: telefon kekal, butang boleh ditekan kemudian. Cutscene boleh skip selepas pilihan tersedia; skip tidak memintas pemilihan atau hadiah.

### S01 - Pesan dari beranda

Syarat: save baharu atau permulaan revisi cerita. Amir di rumah 1; Nur di rumah 11. Ibu ialah Zaitun untuk Amir, Aminah untuk Nur; potret ikut orang sebenar.

Ibu: Dah siap? Kalau nak keluar, bawa sekali bungkusan ni ke kedai Pak Rahman.
Pemain: Apa dalam ni?
Ibu: Bekas yang Mak pinjam. Satu dah kering, satu lagi Mak lap tadi.
Pemain: Saya nak pergi padang dulu.
Ibu: Kedai tu sejalan. Hantar dulu, lepas tu pergilah. Pak Rahman pun ada cari orang tolong.
Pemain: Tolong apa?
Ibu: Hantar barang. Dapatlah duit poket sikit. Jangan semua beli air batu.
Pemain: Saya hantar sekarang.

Pilihan Tangguh: Ibu: Letak dekat pintu dulu. Bila nak pergi, ambil. Mak tak suruh berlari.
Sambung selepas tutup: Ibu: Dua bekas dekat pintu tu. Pak Rahman, kedai runcit. Itu saja.
Hasil: D01 dibuka; pemain bebas berjalan; HUD memaparkan kerja sebenar, bukan semua rahsia bab.

### S02 - Buku kecil Pak Rahman

Syarat: D01 diserahkan; dialog dibuka berasingan selepas resit upah.

Pak Rahman: Haa, elok. Mak kau ingat juga bekas ni.
Pemain: Dia kata Pak Rahman cari orang hantar barang.
Pak Rahman: Ada. Nenek pesan gula. Barang dah bayar, kau cuma tolong bawa.
Pemain: Kalau saya salah rumah?
Pak Rahman: Tengok nama pada pesanan. Bukan main letak saja. Rumah Tok, nombor dua.
Pemain: Upahnya?
Pak Rahman: Seringgit dua puluh. Aku tulis siap-siap. Bila penerima dah ambil, baru kira selesai.
Pemain: Kalau saya ada kerja lain sekali?
Pak Rahman: Pilih yang kau mampu. Bungkusan cerita satu dulu. Kerja biasa boleh bawa dua lagi kalau muat.
Pemain: Baik, saya cuba.
Pak Rahman: Beg tu pinjam pakai. Pulangkan barang kalau tak jadi hantar. Jangan hilang begitu saja.

Hasil: D02 dan kerja prepaid biasa dibuka. HUD: Terima pesanan -> Ambil gula -> Hantar kepada Nenek. Tutorial boleh dibuka semula daripada buku.

### S03 - Beranda dan congkak

Syarat: D02 selesai. Congkak pilihan; memilih Tak sekarang terus memberi perbualan yang sama. Tiada petunjuk kes dikunci pada kemenangan.

Nenek: Letak atas bangku. Jangan dekat hujung, nanti jatuh.
Pemain: Pak Rahman kata gula dah dibayar.
Nenek: Ya, Nenek pesan semalam. Duit upah kau lain, jangan campur dengan harga gula.
Pemain: Nenek buat kuih untuk siapa?
Nenek: Salmah. Sekolah nak buat hari aktiviti. Orang dewasa pun sibuk macam budak nak berlumba.
Pemain: Perlumbaan Tamiya?
Nenek: Itulah. Faiz cerita sampai Nenek rasa Nenek pun pandai pasang motor.
Pemain: Dia memang ada banyak barang.
Nenek: Banyak barang, banyak cerita. Tapi kalau nak kenal orang, duduk dengar dia dulu.
Nenek: Nak main congkak sementara kuih sejuk?

Main selesai, menang: Nenek: Pandai mengira kau. Tapi lain kali jangan senyum awal sangat.
Main selesai, kalah: Nenek: Haa, sekali lagi nanti. Kalah dekat beranda bukan kena buang sekolah.
Tangguh: Nenek: Tak apa. Kuih dah boleh bawa. Salmah tunggu dekat rumahnya.
Hasil: D03; permintaan congkak kekal sebagai aktiviti hubungan, bukan gate utama.

### S04 - Geng padang

Syarat: D03 selesai; masuk padang membuka perkenalan semua lima budak. Satu sesi latihan perlu selesai untuk memahami kawalan; kereta asas pinjaman disediakan, menang tidak wajib.

Faiz: Eh, {nama}! Mari sini. Tengok motor baru aku. Ayah belikan masa pergi bandar.
Johnny: Kau sebut dari tadi. Cuba masuk selekoh dulu.
Faiz: Janganlah rosakkan semangat orang.
Mei Ling: Kalau tayar senget, motor mahal pun tak membantu.
Faiz: Anak tauke memang semua dia tahu.
Mei Ling: Aku tengok kau pasang terbalik tiga kali. Itu bukan rahsia kedai.
Logeswaran: Sudah. Kereta dah ada, trek pun ada. Jalanlah.
Badrul: Kau belum ada kereta, {nama}? Pakai yang asas ni dulu. Faiz, bagi dia cuba.
Faiz: Ambillah. Jangan campur dengan Magnum dalam kotak tu. Yang itu aku simpan.
Pemain: Kejohanan sekolah tu semua boleh masuk?
Mei Ling: Boleh. Ayah urus hadiah, aku pegang borang. Cikgu Farid yang semak kereta.
Pemain: Kau masuk sekali?
Mei Ling: Aku jaga meja pendaftaran. Nak kira markah lima orang pun dah cukup pening.
Badrul: Nanti aku tunjuk kau mana trek yang susah. Jangan terus beli motor paling mahal.

Selesai latihan: Faiz: Haa, dah rasa? Keluar trek tu biasa. Yang penting tahu kenapa.
Quit latihan: Mei Ling: Kereta boleh simpan dulu. Bila lapang, sambung satu race sampai keputusan keluar.
Hasil: katalog Tamiya dibuka; S05; lima orang sudah dikenali sebelum tuduhan. Tiada gambaran Badrul bersalah secara visual.

### S05 - Rak yang kosong

Syarat: latihan S04 selesai. Boleh dipanggil di kedai; Mei Ling tidak serentak di padang.

Mei Ling: {nama}, tolong letak kotak kosong sebelah sana. Jangan dekat rak motor.
Pemain: Kenapa rak tu kosong?
Uncle Lim: Stok kurang lagi. Selasa motor satu, Khamis roller. Semalam motor dengan gear pula.
Pemain: Mungkin orang beli, belum tulis?
Mei Ling: Aku dah kira dengan ayah. Yang keluar ikut jualan lain. Yang ini tak ada.
Uncle Lim: Saya belum tahu siapa ambil. Saya nak semak, bukan pilih nama cepat-cepat.
Faiz: Kalau orang tanya pasal motor aku, resit ada dekat rumah.
Mei Ling: Aku tak kata kau ambil, Faiz.
Faiz: Tapi dekat padang dah ada orang kata macam tu.
Pemain: Siapa yang nampak?
Faiz: Itulah. Semua kata dengar orang.
Badrul: Aku boleh tolong ingat balik. Semalam aku nampak beg Faiz dekat kedai.
Uncle Lim: Beg bukan orang. Barang dalam beg pun kamu belum tengok.
Mei Ling: Aku tulis masa kira stok semalam. Kalau kau nak semak, kita guna catatan ni.
Uncle Lim: Hantar dulu poster sekolah. Kerja kedai tetap kena jalan.

Hasil: D04; E01 buku stok 7A/7B/7C, E02 dakwaan Badrul. HUD: Barang hilang. Apa yang benar-benar dilihat? Tiada nama pencuri dipaparkan.

### S06 - Kawan yang menawarkan bantuan

Syarat: D04 selesai. Siasatan boleh dijeda; tiga laluan A/B/C dibuka serentak.

Badrul: Susah juga. Orang dengar Faiz ada motor baru, terus sambung cerita sendiri.
Pemain: Kau kata nampak beg dia.
Badrul: Beg biru. Aku tahu beg dia. Kotak pun macam dari kedai.
Pemain: Kau nampak Faiz pegang?
Badrul: Dari jauh. Tak nampak muka betul-betul.
Johnny: Itu lain daripada kau cakap dekat warung tadi.
Badrul: Aku cakap beg dia saja.
Logeswaran: Faiz ada dekat kantin juga petang tu.
Badrul: Mungkin sebelum itu. Kau boleh tanya Ros. Aku tolong tanya orang lain.
Pemain: Aku nak catat apa orang nampak. Yang dengar daripada orang, aku asingkan dulu.
Johnny: Elok. Nanti nama beg pun kena panggil datang sekolah.

Pilihan Tanyai Faiz: Faiz: Aku nak orang dengar dulu sebelum mereka putuskan. Aku tak lari.
Pilihan Semak kedai: Mei Ling: Buku stok ada. Bila kau ada soalan khusus, tunjuk catatannya.
Pilihan Saya sambung kerja: Badrul: Pergilah. Petang nanti kami dekat sini.
Hasil: persoalan A alibi, B perjalanan kotak, C stok. Peluang memilih laluan, bukan tiga jawapan kepada satu teka-teki.

### S07 - Kantin selepas loceng

Syarat: laluan A dibuka; D05 menghantar sayur. Ros boleh diajak bercakap tanpa D05; delivery memberi upah, tidak membeli keterangan.

Makcik Ros: Sayur letak dekat bakul, bukan atas meja cikgu.
Pemain: Makcik, petang Jumaat Faiz ada dekat sini?
Makcik Ros: Ada. Tolong angkat minuman dari stor sampai kerusi dah siap susun.
Pemain: Lebih kurang pukul berapa?
Makcik Ros: Lepas tiga. Cikgu Farid tulis nama yang membantu.
Pemain: Makcik nampak dia sepanjang masa?
Makcik Ros: Aku dekat dapur, keluar masuk. Cikgu dekat meja, Loges tunggu dia dekat pintu.
Pemain: Dia ada keluar sekejap tak?
Makcik Ros: Kalau ada, aku tak nampak. Makcik keluar masuk dapur juga. Cikgu dekat luar, tanya dia sekali.
Pemain: Saya semak buku cikgu.
Makcik Ros: Bagus. Bawa sekali bekas makanan ni. Dia pesan untuk orang pasang trek.

Hasil: E03 keterangan Ros; D06. Catatan belum disahkan waktu tepat, tidak terus membebaskan Faiz bagi semua kejadian.

### S08 - Masa pada buku persiapan

Syarat: E03; D06 boleh selesai sebelum/selepas dialog, tetapi perlu selesai sebelum pertemuan akhir.

Cikgu Farid: Buku persiapan? Ada. Kamu nak semak bahagian mana?
Pemain: Jumaat, masa Faiz tolong di kantin.
Cikgu Farid: Tiga sepuluh mula. Tiga empat puluh selesai angkat barang. Cikgu sendiri semak kumpulan itu.
Pemain: Barang di kedai hilang antara tiga dua puluh dengan tiga tiga puluh lima.
Cikgu Farid: Kalau catatan kedai itu tepat, memang waktu yang sama. Kamu dapat masa kedai itu daripada siapa?
Pemain: Mei Ling kira stok sebelum keluar dan selepas kembali.
Cikgu Farid: Baik. Cikgu benarkan kamu salin baris Faiz. Nama murid lain tak perlu kamu bawa.
Pemain: Jadi petang itu Faiz tak sempat ke kedai?
Cikgu Farid: Petang Jumaat, cerita itu tak kena. Tapi Selasa dan Khamis hari lain. Itu kita belum semak.
Cikgu Farid: Jangan umumkan tuduhan baru. Kalau ada barang, bawa kepada cikgu atau Uncle Lim.

Hasil: E04 rekod 15:10-15:40; dialog sambung Johnny/Loges dibuka. D14 pemeriksaan sekolah belum terbuka sehingga petunjuk kotak diterima.

### S09 - Dua orang, dua bahagian cerita

Johnny, apabila E04 ditunjuk:
Johnny: Faiz tinggalkan beg dekat padang sebelum pergi kantin.
Pemain: Siapa pegang selepas itu?
Johnny: Badrul kata nak pinjam bawa kotak. Aku bagi sebab beg tu depan kami. Aku patut tanya Faiz dulu.
Pemain: Kau nampak dia ambil barang kedai?
Johnny: Tak. Beg kosong masa dia ambil. Lepas itu aku sambung main kad, tak tengok dia pergi kedai pun.
Pemain: Jadi beg Faiz boleh ada dekat kedai tanpa Faiz.
Johnny: Ya. Aku bagi beg saja. Aku tak tahu dalamnya jadi apa.

Logeswaran, apabila E03/E04 ditunjuk:
Logeswaran: Aku tunggu Faiz dekat pintu kantin. Dia keluar selepas cikgu habis kira kotak.
Pemain: Kau ingat dia keluar sebelum hujan?
Logeswaran: Hujan baru mula rintik. Tapi waktu tepat ikut buku cikgu, bukan aku.
Pemain: Badrul ada dengan kau?
Logeswaran: Dia kata pergi ambil benda sekejap. Bila kami sampai padang balik, dia belum ada.
Pemain: Kau pernah dengar Faiz mengaku ambil stok?
Logeswaran: Tidak. Dia cakap motor baru dari bandar. Orang lain yang sambung ayat itu.

Hasil: E05 beg dipinjam Badrul; E06 saksi Loges. Rumusan A memerlukan E01 sela stok + E04 rekod + salah satu E03/E06. Johnny diperlukan untuk rumusan B/C, bukan paksa tiga alibi yang sama.

### S10 - Bungkusan di bangku Salmah

Syarat: laluan B dibuka; D07. Dialog semakan boleh diakses tanpa menerima kerja.

Makcik Salmah: Makanan ni betul alamatnya. Yang semalam lain cerita.
Pemain: Semalam ada bungkusan salah?
Makcik Salmah: Budak letak kotak atas bangku. Katanya nak ambil semula lepas hujan. Aku tengah goreng cucur, tak sempat tengok muka.
Pemain: Dia kata kotak untuk Makcik?
Makcik Salmah: Tak. Dia cuma nak tumpang tempat kering.
Pemain: Pak Rahman ada tulis pesanan untuk rumah ni?
Makcik Salmah: Ada, tapi itu gula. Kotak semalam bukan pesanan gula.
Pemain: Saya boleh lihat reben dan kertas yang tertinggal?
Makcik Salmah: Boleh. Ada dalam bekas kuih tu. Jangan ambil barang rumah orang tanpa tanya.
Pemain: Saya pulangkan bekas kepada Nenek dulu.
Makcik Salmah: Haa. Kalau nampak Timah, tanya dia. Dia dekat pagar masa hujan nak turun.

Hasil: E07 tiada penerima rasmi, E08 cebisan pita biru; D08 dan D09. Pita biru biasa; ia menghubungkan laluan, bukan identiti.

### S11 - Rumah-rumah yang menyambung laluan

Pak Rahman, semak E08:
Pak Rahman: Pita biru ni aku pakai juga. Kedai lain pun ada.
Pemain: Kotak di rumah Salmah ada kerja rasmi?
Pak Rahman: Buku aku: gula dihantar tengah hari. Tak ada kotak petang tu. Ini salinan baris pesanan.
Pemain: Jadi barang itu tidak dihantar atas nama kedai Pak Rahman.
Pak Rahman: Betul. Tapi jangan sebab ada pita, kau terus kata barang aku.

Pak Abu, semak E07 dan salinan pesanan:
Pak Abu: Penerima tak pesan, penghantar kata nak ambil semula. Itu tumpang letak, bukan delivery selesai.
Pemain: Saya ingat orang hantar sesuatu kepada Salmah.
Pak Abu: Nama atas kertas dengan siapa yang betul-betul terima tu dua perkara. Catat kedua-duanya.

Mak Long Timah, selepas D09:
Mak Long Timah: Aku nampak kotak bawah jaket. Budak tu jalan ke arah bas, bukan balik padang.
Pemain: Faiz?
Mak Long Timah: Eh, mana Mak Long tahu. Muka terlindung. Kau tanya nama dulu, nanti Mak Long terikut cerita pula.
Pemain: Sebelum atau selepas hujan?
Mak Long Timah: Selepas rintik mula. Aku baru angkat kain. Karim ada dekat hentian masa tu.

Kak Rohani, pilihan di rumah 5:
Kak Rohani: Bangku Salmah nampak dari jalan. Orang boleh tumpang letak barang, ramai lalu situ.
Pemain: Maknanya sesiapa boleh ambil?
Kak Rohani: Boleh jadi. Tapi aku tak tengok siapa ambil. Jangan tulis aku saksi.

Hasil: E09 rekod Rahman bukan kotak, E10 arah bas. D10 dibuka. Rumah tidak memberi jawapan ajaib; pemain menilai had setiap keterangan.

### S12 - Pak Karim membetulkan ingatan

Syarat: E10; D10. Jika datang lebih awal, Karim masih memberi perbualan umum dan meminta soalan khusus.

Pak Karim: Kotak dekat hentian? Ada budak lalu. Badrul, rasanya.
Pemain: Rasanya, atau Pak Karim kenal dia?
Pak Karim: Dia tegur aku. Aku kenal nama sebab selalu tanya bas bandar. Tapi masa aku tak berani agak.
Pemain: Timah kata selepas hujan rintik.
Pak Karim: Aku mula-mula ingat sebelum hujan. Tunggu, buku tiket ada di kiosk. Pak Din simpan lepas aku minum.
Pemain: Badrul naik bas?
Pak Karim: Tak. Dia berjalan ke sekolah. Katanya nak letak kotak persiapan.
Pemain: Apa dalam kotak?
Pak Karim: Aku tak buka. Kotak lama, tepi koyak. Itu saja yang aku nampak.
Pemain: Saya ambil buku tiket dan semak masa hentian.
Pak Karim: Terima kasih. Aku lebih rela betulkan masa daripada pertahankan ingatan yang salah.

Hasil: E11 Badrul ke sekolah, kategori keterangan; D11. Identiti disokong sapaan langsung, isi kotak masih belum diketahui.

### S13 - Kiosk, dam dan satu resit

Syarat: E11; Pak Din memberikan D11. Dam Haji pilihan sebelum atau selepas menerima kerja.

Pak Din: Karim tinggal buku kecilnya. Bukan kali pertama.
Pemain: Dia minta semak masa bas berhenti Jumaat.
Pak Din: Ini resit isi minyak. Bas dia berhenti sini tiga empat puluh lima. Kita tanya dia sahkan baris tu saja.
Pemain: Dia ingat sebelum hujan, Timah kata selepas.
Pak Din: Orang ingat lain-lain. Kertas ni pun kena tengok tarikh, jangan resit minggu lalu.
Pemain: Jumaat yang sama. Nombor bas pun sama.
Pak Din: Haa. Bawa sampul ni. Baris penumpang tak ada kena-mengena, aku dah lipat asing.
Pak Din: Nak duduk main dam sekejap? Kepala tengah penuh cerita, elok rehat.
Pemain: Lepas hantar saya datang balik.
Pak Din: Datanglah. Papan tak lari.

Apabila D11 diserahkan:
Pak Karim: Betul. Tiga empat puluh lima. Badrul tegur aku semasa hentian itu. Aku betulkan catatan aku: selepas hujan mula, bukan sebelum.
Pemain: Jadi pukul tiga empat puluh lima itu masa dia tegur Pak Karim?
Pak Karim: Ya, masa dia lalu sini. Dari kedai pukul berapa, aku tak tahu.

Dam menang: Pak Din: Hah, kena makan buah aku. Jangan cerita satu pekan.
Dam kalah: Pak Din: Tengok langkah ketiga tadi. Kau kejar satu buah, tinggal ruang belakang.
Dam quit: Pak Din: Kita simpan papan. Bila nak sambung, duduk lagi.
Hasil: E12 masa hentian disahkan; permainan tidak wajib dan tidak memadam petunjuk.

### S14 - Label di celah kereta

Syarat: laluan C dibuka; D12. Pak Man punya keterangan boleh didengar awal, tetapi memahami label memerlukan E01.

Pak Man: Tali pemacu sampai. Walkman Faiz boleh siap hari ini.
Pemain: Pak Man baiki Tamiya juga?
Pak Man: Suis kecil boleh. Kereta Badrul dia hantar Jumaat, lepas hujan. Suis longgar.
Pemain: Ada tukar motor?
Pak Man: Tidak. Dia bawa kereta dah pasang. Aku betulkan suis saja.
Pemain: Ini kertas kecil di meja?
Pak Man: Jatuh dari celah badan keretanya. Aku simpan sebab mungkin label barang. Ada 7C, titik dakwat merah.
Pemain: Kedai Uncle Lim ada batch 7C. Boleh saya bawa label ni untuk semak?
Pak Man: Boleh. Aku tulis dari kereta siapa ia jatuh dan masa diterima. Jangan tambah aku nampak dia mencuri.
Pemain: Saya belum tahu sama ada barang itu dibeli.
Pak Man: Itu soalan yang betul. Ada tanda kedai tak semestinya barang curi.
Pak Man: Walkman ini pula milik Faiz. Jangan buka kaset orang. Hantar balik bila siap.

Hasil: E13 sampul serpihan label + nota kerja Pak Man; D13. Walkman ialah barang Faiz dan nostalgia hubungan, bukan alat mengesan kecurian.

### S15 - Faiz, resit dan rasa malu

Syarat: D13; soalan lanjut mengikut petunjuk. Dialog boleh berlaku sebelum alibi lengkap.

Faiz: Bunyi dah elok. Sebelum ni macam kaset kena tarik.
Pemain: Pak Man tukar tali dalamnya.
Faiz: Ayah beli yang ni masa pergi bandar. Tamiya pun banyak dia belikan. Aku tahu aku asyik cerita benda sama.
Pemain: Orang kata kau ada motor dari kedai Uncle Lim.
Faiz: Yang baru aku beli dari bandar. Ini resit, tarikhnya sebelum stok kedai hilang.
Pemain: Yang ini memang kau beli dari bandar. Barang yang hilang dekat kedai itu aku kena semak lagi.
Faiz: Semaklah. Aku pun tak tahu nak tunjuk pada siapa. Bila aku keluarkan kotak, orang kata aku menunjuk lagi.
Pemain: Mei Ling nak semak dengan betul.
Faiz: Aku tahu dia susah. Itu kedai ayah dia. Aku marah sebab sangka dia percaya orang lain dulu.
Pemain: Kau boleh cakap sendiri dengan dia nanti.
Faiz: Nanti aku cuba. Jangan paksa dia jawab sekarang.

Jika alibi A disahkan:
Pemain: Buku cikgu dengan cerita Ros sepadan. Kau dekat kantin ketika stok Jumaat hilang.
Faiz: Terima kasih. Tapi aku tak nak kau cari orang lain semata-mata nak gantikan nama aku.
Pemain: Aku semak barang dan cerita yang bercanggah dulu.

Jika belum: Pemain: Aku belum cukup maklumat. Aku simpan resit ni sebagai salinan, bukan keputusan.
Faiz: Baik. Kalau ada soalan, datang. Aku dekat rumah atau padang.
Hasil: E17 resit koleksi Faiz; R01 dibuka. Kawan kaya boleh show off dan tetap tidak bersalah; pengakuan menunjuk tidak dijadikan hukuman moral untuk kecurian.

### S16 - Apa yang keluar dari kedai?

Syarat: E01 dan E13. Pilih Semak asal barang; dua buku dipaparkan bersama.

Pemain: Label ni jatuh dari kereta Badrul di bengkel. Ada 7C dan titik merah.
Mei Ling: Titik itu ayah letak untuk stok dalam kotak yang sampai Jumaat. Beberapa barang sudah dijual sebelum aku keluar.
Pemain: Jadi label saja belum cukup.
Uncle Lim: Betul. Mari semak motor, gear dan roller satu-satu.
Mei Ling: Motor Dash 7C yang hilang tiada dalam baris jualan. Gear Sprint pun tiada. Batch 7A satu Torque kurang, 7B roller kurang.
Pemain: Ada barang contoh yang boleh dipinjam?
Uncle Lim: Barang contoh ada cop CONTOH. Yang hilang bukan itu. Tempahan belum dibayar pun ada nama, dan tetap ada dalam stok simpan.
Mei Ling: Ini salinan bahagian berkaitan. Nombor batch sahaja tak menunjukkan siapa ambil.
Jika E11 sudah ada, Pemain: Badrul kata dia tidak pergi sekolah petang itu. Karim nampak dia bawa kotak ke sana.
Jika E11 belum ada, Pemain: Label ini dari kereta Badrul. Saya masih perlu semak bagaimana kotak itu bergerak petang Jumaat.
Uncle Lim: Kalau mahu semak meja sekolah, minta izin cikgu. Kamu tidak perlu masuk rumah sesiapa.
Mei Ling: Aku nak nama Faiz dibersihkan kalau dia tak buat. Aku juga nak ayah dapat barang semula. Dua-dua penting.

Hasil: E14 rekod batch tiada jualan/pinjaman; D14 tersedia di Hafiz setelah E11/E12. Rumusan C belum boleh disahkan tanpa barang sebenar E15 dan pemeriksaan E19.

### S17 - Kotak persiapan sekolah

Syarat: E11 + E12 + E13 + E14; minta izin Farid. D14 diterima di padang, dihantar ke sekolah. Boleh periksa dahulu, tetapi D14 mesti selesai sebelum pertemuan.

Abang Hafiz: Kain lap dan borang pemeriksaan ni bawa kepada cikgu. Aku tutup trek dulu, barang belum disemak jangan guna race.
Cikgu Farid: Kotak di meja itu? Ya, Badrul yang bawa Jumaat. Dia kata alat untuk persiapan trek.
Pemain: Boleh semak kotak itu dengan cikgu?
Cikgu Farid: Boleh. Cikgu buka di sini. Jangan sentuh barang lain dalam stor.
Mei Ling: Ini sarung gear batch 7C. Gear masih ada, belum dipasang.
Pemain: Kotak ini bukan semua barang yang hilang.
Cikgu Farid: Betul. Kita simpan gear ini, label dan catatan di satu tempat. Badrul perlu diberi peluang menerangkan asalnya.
Pemain: Dalam borang ada namanya sebagai orang yang membawa kotak.
Cikgu Farid: Itu tulisan dia. Cikgu terima sendiri sekitar empat petang. Cikgu boleh sahkan, bukan kamu agak tulisan.
Pemain: Ini bercanggah dengan cerita dia tidak pergi sekolah.
Mei Ling: Tapi belum menjelaskan motor dan roller lain. Kita semak bersama ayah, bukan terus jerit dekat padang.

Hasil: E15 Gear Sprint 7C dijumpai dengan izin; E16 borang penerimaan disahkan Farid. Gear disimpan oleh Farid, pemain membawa rekod/thumbnail sahaja. Badrul tidak mengaku secara automatik apabila clue ini ditemui.

### S18 - Sebelum membuat keputusan

Syarat: S15 membuka D15; boleh dilakukan sambil laluan lain. D16 menyediakan ruang balai raya.

Faiz: Gasing Atuk masih dalam kotak aku. Aku pinjam minggu lepas, belum pulang.
Pemain: Aku lalu sana. Boleh bawa.
Faiz: Terima kasih. Pinjam bukan ambil. Atuk dah tiga kali tanya.

Atuk, menerima D15:
Atuk: Ini dia. Faiz ingat juga.
Pemain: Semua orang tengah cerita pasal barang kedai.
Atuk: Atuk dengar. Tapi cerita Atuk dengar bukan bukti Atuk nampak.
Pemain: Kalau ada orang bercakap lain daripada catatan?
Atuk: Tanya bahagian yang lain itu. Bagi dia jawab. Kalau salah, betulkan. Kalau memang ambil, pulangkan.
Pemain: Atuk ada kerja untuk balai raya?
Atuk: Kotak permainan ni. Salleh nak susun untuk hari aktiviti. Hantar bila kau lapang.
Atuk: Nak cuba gasing satu kali? Tangan jangan keras sangat.

Gasing menang/rekod baik: Atuk: Haa, tegak! Tengok lama sikit, jangan baru pusing dah angkat.
Gasing jatuh: Atuk: Tali longgar. Cuba lagi nanti. Kayu ni tak marah orang belajar.
Tak main: Atuk: Tak apa. Kotak tu ada tali lebih. Jangan tinggal tepi jalan.

Pak Salleh, menerima D16:
Pak Salleh: Aku boleh sediakan meja untuk semakan. Bukan perbicaraan satu kampung.
Pemain: Saya nak bukti diperiksa, bukan orang menjerit.
Pak Salleh: Baik. Cikgu dengan Uncle Lim mesti ada. Siapa yang ada keterangan pun datang, yang lain tak payah berkerumun.
Hasil: balai raya tersedia; congkak/dam/gasing kekal hubungan pilihan dan tidak menyekat alibi.

### S19 - Pemain menyusun cerita

Syarat: bukti ditemui, tetapi jumlah sahaja bukan jawapan. Pemain memilih kad, kemudian memilih kesimpulan. Tiga rumusan boleh diselesaikan dalam apa-apa urutan.

Rumusan A, pasangan E01 + E04, sokongan E03 atau E06:
Soalan: Waktu siapa tidak sepadan dengan tuduhan Jumaat?
Jawapan betul: Faiz berada di kantin dalam sela stok terakhir hilang.
Pemain: Masa dalam dua catatan bertindih. Faiz sedang membantu di kantin.
Jawapan salah: Faiz tidak pernah datang kedai.
Pemain: Ini tak membuktikan dia tak pernah datang. Ia cuma menerangkan petang Jumaat.

Rumusan B, E05 + E11/E12 + E16:
Soalan: Siapa boleh membawa beg itu, dan ke mana kotaknya pergi?
Jawapan betul: Beg Faiz dipinjam Badrul; kotak dibawa Badrul ke sekolah.
Pemain: Pemilik beg tidak semestinya pembawa. Catatan sekolah menyambung cerita Johnny dan Karim.
Jawapan salah: Timah melihat muka pencuri.
Pemain: Timah sendiri kata dia tak nampak muka. Aku tak boleh isi tempat kosong itu.

Rumusan C awal, E13 + E14 + E15:
Soalan: Adakah alat ganti yang ditemui mempunyai asal jualan yang boleh disahkan?
Jawapan betul: Ada barang batch hilang tanpa rekod jualan; perlu semakan bersama Badrul.
Pemain: Gear yang cikgu simpan sepadan dengan stok kurang. Label dari bengkel perlu dibandingkan dengan barang dalam kereta.
Jawapan salah: Semua barang dari kedai ialah barang curi.
Pemain: Banyak barang dijual dengan sah. Tanda kedai sahaja belum cukup.

Tiga rumusan betul membuka S20. Rumusan tidak bernama Pencuri Badrul sebelum semakan. Salah memilih tidak memadam kad, mengenakan denda atau memulakan scene lain.

### S20 - Cerita yang semakin sempit

Syarat: A + B + C awal disahkan; D01-D16 selesai. Badrul dipanggil di padang/pintu rumah jika crowd pulang.

Badrul: Dah dapat apa-apa? Aku rasa kau tanya Faiz sekali lagi.
Pemain: Aku dah tanya. Dia dekat kantin masa stok terakhir hilang.
Badrul: Mungkin dia datang selepas itu.
Pemain: Aku tak kata semua dah selesai. Aku nak tanya cerita kau petang Jumaat.
Badrul: Aku dekat padang. Lepas tu balik.
Pemain: Johnny kata kau pinjam beg Faiz. Karim kata kau bawa kotak ke sekolah.
Badrul: Kotak kosong saja. Untuk trek.
Pemain: Tadi kau kata terus balik. Cikgu terima kotak itu dan sahkan namanya pada borang.
Badrul: Aku terlupa sebut singgah sekolah. Banyak benda hari tu.
Pemain: Dalam kotak ada gear batch yang kedai sedang cari. Pak Man pula simpan label dari kereta kau.
Badrul: Kau dah percaya aku ambil?
Pemain: Aku nak barang diperiksa bersama Uncle Lim dan cikgu. Kau boleh terangkan asalnya di sana.
Badrul: Kalau aku bawa kereta, jangan buka sendiri.
Pemain: Cikgu yang semak dengan kau. Aku tak sentuh.
Badrul: ...Baik. Aku datang.

Jika pemain memilih Tuduh terus sebelum syarat lengkap:
Badrul: Kau dengar daripada siapa? Bawa benda yang boleh disemak dulu.
HUD: Masih ada percanggahan belum disemak. Tiada pengakuan, tiada hukuman, tiada reset.
Hasil: E18 percanggahan cerita Badrul, janji pertemuan S21 dan D17. Badrul setuju hadir; jika pemain keluar/ tidur, acara menunggu.

### S21 - Orang yang paling membantu

Syarat: S20 + D17; Farid, Lim, Mei Ling, Faiz, Badrul, Johnny, Logeswaran hadir. Kamera kumpulan kecil, bukan orang kampung mengejek. Pemeriksaan hanya ruang kereta dan kotak yang Badrul bawa dengan izin.

Pak Salleh: Kita semak benda satu-satu. Jangan potong orang bercakap.
Cikgu Farid: Badrul, kamu izinkan cikgu buka badan kereta ini untuk semak barang dengan kamu?
Badrul: Ya, cikgu.
Uncle Lim: Motor Torque 7A, roller 7B. Label 7C pada motor Dash yang belum dipasang. Gear 7C cikgu simpan dari meja sekolah.
Mei Ling: Ini empat jenis barang yang kurang. Buku jualan dan pinjaman tiada baris untuknya.
Cikgu Farid: Dari mana kamu dapat barang ini?
Badrul: Saya... ada simpan lama.
Pemain: Batch 7C baru sampai Jumaat. Label dari kereta kau pun ikut catatan kerja Pak Man hari itu.
Badrul: Aku cuma nak kereta aku siap.
Faiz: Apa maksud kau?
Badrul: Aku ambil. Mula-mula motor satu. Lepas itu roller. Jumaat aku ambil lagi.
Mei Ling: Kenapa kau biarkan orang sebut nama Faiz?
Badrul: Bila orang nampak beg dia, aku diam. Lepas itu aku kata aku nampak beg dekat kedai. Aku tahu apa yang orang akan fikir.
Johnny: Kau pinjam beg tu daripada aku. Aku ingat kau angkat barang persiapan.
Badrul: Aku memang angkat kotak. Tapi bukan barang yang aku patut ambil.
Logeswaran: Kau ajak kami tolong siasat. Kau dah tahu dari awal.
Badrul: Aku takut kalau aku mengaku, semua orang tak nak berkawan lagi. Aku buat lagi teruk.
Faiz: Aku cerita besar pasal barang aku. Kau boleh marah aku. Tapi kau tak boleh guna itu untuk kata aku pencuri.
Badrul: Aku tahu. Aku salah. Bukan sebab kau kaya, bukan sebab kau menunjuk. Aku yang pilih ambil.
Uncle Lim: Barang kembali sekarang. Yang sudah digunakan kita periksa. Cikgu akan hubungi penjaga kamu untuk urusan mengganti kerosakan dan bantuan di kedai.
Cikgu Farid: Nama Faiz mesti dibetulkan kepada orang yang mendengar cerita itu. Hal seterusnya cikgu urus bersama penjaga, bukan kawan-kawan menghukum sendiri.
Mei Ling: Aku mahu kedai ayah kembali elok. Aku juga mahu kau berhenti sebut cerita separuh.
Badrul: Aku akan cakap sendiri. Faiz, aku minta maaf.
Faiz: Aku dengar. Tapi bukan terus jadi macam biasa. Bagi aku masa.

Hasil: E19 pemeriksaan fizikal disahkan, confession disimpan selepas bukti, kes resolved. Semua barang 7A/7B/7C berada dalam jagaan Lim/Farid. D18 dibuka. Pengakuan tidak menjadikan pilihan rumusan terdahulu sia-sia.

### S22 - Betulkan nama, bukan sekadar minta maaf

Syarat: S21; D18 notis pembetulan kepada Rahman. Semasa pembetulan ringkas di padang, pemain mesti hadir untuk menamatkan scene, tetapi NPC menunggu tanpa deadline.

Pak Rahman: Notis cikgu dah sampai. Aku letak dekat papan yang orang selalu baca.
Pemain: Nama Faiz sudah dibersihkan.
Pak Rahman: Aku pun ada ulang cerita beg biru. Aku akan betulkan pada orang yang aku beritahu.

Badrul: Aku yang ambil barang dari kedai Uncle Lim. Faiz tak ambil. Beg dia aku pinjam, kemudian aku biarkan orang tuduh dia.
Johnny: Aku juga salah cakap bila belum nampak isi beg. Aku akan betulkan.
Logeswaran: Kita tak perlu tambah cerita lagi. Yang sudah disahkan, itu yang kita sebut.
Mei Ling: Faiz, aku patut cakap apa yang aku tahu dari awal. Aku asyik kira stok, sampai kau rasa aku dah pilih pihak.
Faiz: Aku pula terus marah. Aku tak dengar kau cakap pun. Aku minta maaf sebab cakap anak tauke macam kau tak ada kerja lain.
Mei Ling: Lepas ni kalau nak tunjuk motor, tunjuklah. Jangan jadikan semua orang macam penonton kau saja.
Faiz: Baik. Kau jaga borang nanti, aku jaga kereta aku sendiri.
Pemain: Kejohanan masih jadi?
Cikgu Farid: Jadi. Semua kereta diperiksa. Badrul boleh ikut dengan kereta pinjaman asas selepas pemulangan selesai. Barang curi tidak masuk trek.
Badrul: Aku terima, cikgu.

Hasil: siasatan selesai kekal; kejohanan unlocked; R02-R06 dibuka mengikut syarat hubungan. Kemenangan tidak diperlukan untuk membetulkan fitnah, tetapi diperlukan untuk penutup bab dan hadiah utama.

### S23 - Daftar dan bina kereta sendiri

Syarat: S22; D19 reben tiba. Cikgu Farid membuka Hari Aktiviti apabila pemain menekan Bersedia; tiada tarikh yang boleh terlepas.

Mei Ling: Lima nama. Kau, Faiz, Badrul, Johnny, Logeswaran. Aku tulis nama pilihan kau, ya?
Pemain: Ya. Kereta asas boleh masuk?
Mei Ling: Boleh. Tapi trek bukan semua lurus. Tengok keputusan latihan, baru pilih barang.
Faiz: Aku laju dekat oval. Kalau masuk selekoh macam terbang, itu hal lain.
Johnny: Aku pilih grip. Biar dia potong sekarang, dekat selekoh kita tengok.
Logeswaran: Aku nak habis tiga pusingan dulu. Kereta terbalik tak dapat markah kerana mahal.
Badrul: Aku pakai kereta pinjaman cikgu. Barang yang aku pulangkan semua dah asing.
Pemain: Kalau kalah boleh cuba lagi?
Mei Ling: Boleh. Pusingan kejohanan baru, catatan siasatan tak berubah. Hadiah Magnum cuma satu kali.
Uncle Lim: Barang lama yang kamu beli tidak perlu beli semula. Cuba pasang balik. Jangan beli dua motor untuk satu kereta.
Mei Ling: Brek Sponge RM4.00. Tayar Sponge RM5.50. Dua-dua membantu, tapi tak menggantikan cara kamu pilih setup.
Pemain: Saya nak latihan dahulu.
Mei Ling: Baik. Tekan Latihan. Bila betul-betul bersedia, baru Daftar kejohanan.

Hasil: training dan garage bebas, tournament run baru sahaja dibuka apabila confirm start. HUD menunjukkan duit, pilihan latihan/kerja/kedai tanpa mendedahkan setup juara.

### S24 - Tiga trek, lima peserta

Pusingan 1, Oval Pekan:
Cikgu Farid: Kereta di belakang garisan. Tunggu kiraan.
Faiz: Haa, ini bahagian aku.
Johnny: Tengok papan keputusan dulu baru cakap.
Mei Ling: Tiga... dua... satu!

Pusingan 2, Selekoh Lapan:
Johnny: Lurus tak panjang. Jangan tengok motor saja.
Logeswaran: Aku tukar setup stabil. Kereta sama, tak perlu beli yang baru.
Badrul: Aku cuba habiskan tanpa keluar trek.
Mei Ling: Susunan markah tadi disimpan. Pusingan kedua bermula.

Pusingan 3, Litar Jaguh:
Faiz: Kalau landing senget, habislah.
Pemain: Aku dah uji brek masa latihan.
Mei Ling: Boleh semak garage sebelum mula. Bila dah launch, ikut aturan pit.
Cikgu Farid: Semua ikut laluan dan pusingan yang sama. Sedia?

Kalah keseluruhan:
Mei Ling: Kali ini belum nombor satu. Tengok sini: masa hilang paling banyak dekat {bahagian}. Catatan ada dalam buku.
Pemain: Aku boleh buat kerja dulu?
Mei Ling: Boleh. Kejohanan seterusnya tunggu kau. Bukti kes semua masih disimpan.
Faiz: Nanti latihan sama-sama. Aku pun bukan setiap kali lepas ramp elok.

Seri mata:
Mei Ling: Mata sama. Jumlah masa semua pusingan dibandingkan. Kalau masih sama, satu pusingan penentuan di Selekoh Lapan.
Cikgu Farid: Tidak ada cabutan nasib untuk tentukan juara.

Quit sebelum keputusan:
Mei Ling: Kau berhenti sebelum pusingan selesai. Pusingan ini belum ada keputusan. Yang sebelum ini tetap disimpan.
Pemain: Aku sambung nanti.
Mei Ling: Boleh. Pilih Sambung kejohanan, bukan daftar baru kalau nak kekalkan markah tadi.

Menang:
Mei Ling: Jumlah markah... {nama}, nombor satu!
Faiz: Haa, kereta hasil hantar barang boleh tahan juga.
Johnny: Jangan bagi dia cerita motor dari pagi sampai petang pula.
Pemain: Aku cerita satu kali saja.
Logeswaran: Itu Faiz pun pernah janji.

Hasil: tournamentWon disimpan sekali; D20 tersedia. Faiz boleh menang pusingan, Johnny selekoh, Loges konsisten; Badrul tidak menjadi bos berkualiti curi selepas kes selesai.

### S25 - Kotak Magnum

Syarat: tournamentWon + D20; majlis di balai raya boleh diaktifkan walaupun waktu malam. Semua penonton yang dipanggil untuk acara menunggu pemain.

Pak Salleh: Sijil dah sampai. Uncle Lim, kotak hadiah boleh bawa ke depan.
Uncle Lim: Lightning Magnum ini barang hadiah, bukan stok yang hilang. Simpan elok-elok.
Mei Ling: Aku dah tulis nama dan tarikh dalam kad koleksi. Kalau buka lagi, bukan dapat kotak kedua.
Pemain: Terima kasih. Saya simpan.
Faiz: Kau beli upgrade pakai duit kerja sendiri. Lain rasa, kan?
Pemain: Ya. Tapi kalau aku tak tahu kenapa kereta keluar trek, beli motor lagi pun tak membantu.
Johnny: Haa. Itu boleh tulis besar dekat padang.
Badrul: Tahniah. Aku tak nak janji panjang. Barang kedai aku urus dengan ayah dan cikgu dulu.
Mei Ling: Buat yang kau dah janji. Yang lain ambil masa.
Logeswaran: Petang esok kalau nak latihan, kami ada.
Faiz: Bawa Magnum tengok saja dulu. Jangan campur barang koleksi dengan kereta pinjam orang.
Pemain: Baik. Lepas ni, kita berlumba dengan barang sendiri.

Hasil: `nostalgia_T01` Lightning Magnum awarded idempotent; Chapter 1 complete. Menggunakan item sedia ada selepas padanan disahkan; tidak mencipta collectible Magnum kedua.

### S26 - Pekan masih ada cerita

Syarat: hadiah diterima; scene 20-30 saat, boleh skip, tiada objektif Chapter 2 yang belum dibina.

Abang Kamal: Meja ni nak letak mana, Salleh?
Pak Man: Jangan letak dekat dinding. Dulu meja yang sama kita guna buat benda lain.
Pemain: Benda apa?
Abang Kamal: Panjang ceritanya. Dalam gambar ni, tengok baju dia. Semua orang ingat dia paling baik.
Pak Man: Kau jangan mula cerita separuh pula.
Abang Kamal: Haa, nanti kita duduk betul-betul. Bukan malam ni.
Pak Salleh: Budak-budak dah ada cerita mereka. Orang dewasa pun ada bahagian sendiri.
Pemain: Saya datang lagi nanti.

Hasil: teaser sahaja. HUD: Apa seterusnya? Kerja aktif / cabaran ditemui / latihan geng. KLCC, Proton Wira dan kad Telekom disimpan untuk cerita dewasa Chapter 2; tidak diberi melalui main Chapter 1.

## 7. Semua delivery Chapter 1

### Peraturan yang sama untuk setiap kerja

20 delivery utama menghubungkan persiapan kejohanan dengan perjalanan siasatan. Satu kerja cerita aktif pada satu masa, dua kerja biasa boleh digabungkan jika muat. Kerja yang telah dibuka tetapi belum diterima kekal dalam buku. Pemain boleh memilih urutan kerja laluan A/B/C; bukan dipaksa menerima D05 sebelum D12.

Setiap kerja: Terima -> Ambil di pengirim -> Bawa -> Serah di penerima -> Upah -> Dialog susulan yang berasingan. Menutup dialog selepas serah tidak menarik balik upah atau penyerahan. Dialog penting disambung melalui Sambung cerita. Semua parcel utama prepaid, modal RM0, tiada expiry dan upah dibayar sekali. Penerima atau penjaga rumah boleh mengambil parcel; hanya NPC yang tahu keterangan boleh memberi dialog siasatan. Penghantaran tidak membeli keterangan: dialog saksi boleh didengar sebelum kerja selesai apabila prasyarat petunjuknya ada.

Pemain tidak perlu membeli semula motor curi, mengganti hutang Badrul, menjual collectible atau membayar yuran masuk untuk menyambung bab. Catatan bukti tidak memakan ruang beg dan tidak boleh dijual. Barang bukti fizikal kekal pada cikgu/pemilik.

### Jadual setiap kerja utama

| ID | Pengirim -> penerima / tempat | Barang, kuantiti / ruang | Upah | Buka apabila | Tujuan / selepas serah |
| --- | --- | --- | --- | --- | --- |
| D01 | Ibu, rumah 1 Amir atau 11 Nur -> Rahman 22 | 2 bekas dalam 1 parcel / 1 | RM0.80 | S01 | Tutorial; buka S02 dan D02 |
| D02 | Rahman 22 -> Nenek 2 | 1 pek gula / 1 | RM1.20 | S02 | Beranda Nenek; S03, D03 |
| D03 | Nenek 2 -> Salmah 4 | 1 kotak kuih / 1 | RM1.20 | S03 | Kenal rumah dan persiapan sekolah; S04 |
| D04 | Lim/Mei Ling 25 -> Farid 29 | 1 ikat poster aktiviti / 1 | RM1.20 | S05 | Sekolah tahu persiapan; tiga laluan dibuka S06 |
| D05 | Pak Mat 9 -> Ros 30 | 1 bakul sayur / 3 | RM1.60 | Laluan A | Kerja kantin dan S07; D06 |
| D06 | Ros 30 -> Farid 29 | 2 bungkus makanan dalam 1 parcel / 3 | RM1.40 | S07 | Bekalan persiapan; S08 |
| D07 | Kak Ita 21 -> Salmah 4 | 1 parcel makan tengah hari / 3 | RM1.50 | Laluan B | S10; penerimaan bungkusan Jumaat |
| D08 | Salmah 4 -> Nenek 2 | 1 bekas kuih kosong / 1 | RM1.00 | S10 | Memulangkan pinjaman; Nenek boleh jelaskan bekas kuih bukan kotak alat ganti |
| D09 | Nenek 2 -> Timah 7 | 1 termos teh berisi / 1 | RM1.30 | S10 | S11; saksi laluan sebelum hujan |
| D10 | Timah 7 -> Karim 35 | 1 termos kosong milik Karim / 1 | RM1.60 | E10 arah bas | Pulangkan pinjaman keluarga; S12 |
| D11 | Din 37 -> Karim 35 | 1 sampul salinan resit hentian / 0 | RM1.20 | S12 | Sahkan masa 15:45; S13 |
| D12 | Lim 25 -> Man 36 | 1 tali pemacu Walkman yang dipesan / 1 | RM1.40 | Laluan C | Siapkan Walkman; S14 |
| D13 | Man 36 -> Faiz 15 atau post 34 | 1 Walkman milik Faiz, dibungkus / 1 | RM1.60 | S14 | S15; resit koleksi dan R01 |
| D14 | Hafiz 34 -> Farid 29 | 1 parcel kain lap + borang trek / 1 | RM1.40 | E11+E12+E13+E14 | Pemeriksaan bersama guru; S17 |
| D15 | Faiz 15/34 -> Atuk 8/34 | 1 gasing pinjaman / 1 | RM1.20 | S15 | S18; permainan pilihan, tanggungjawab pinjam |
| D16 | Atuk 8/34 -> Salleh 32 | 1 kotak permainan / 3 | RM1.80 | D15 selesai | Meja semakan dan hari aktiviti disediakan |
| D17 | Rahman 22 -> Salleh 32 | 1 kotak air untuk pertemuan / 3 | RM1.60 | S20 dan D01-D16 selesai | S21 boleh dimulakan, peserta menunggu |
| D18 | Farid 29 -> Rahman 22 | 1 notis pembetulan bertandatangan / 0 | RM1.20 | S21 | Pembetulan khabar, S22; bukan notis mengejek Badrul |
| D19 | Normah 26 -> Farid 29 | 1 ikat reben hadiah siap / 1 | RM1.40 | S22 | Pendaftaran S23; keperluan kejohanan siap |
| D20 | Farid 29 -> Salleh 32 | 1 sampul keputusan dan sijil / 0 | RM1.20 | tournamentWon | S25, hadiah dan ending |

Jumlah upah utama: RM26.80. Sebelum kejohanan (D01-D19): RM25.60. Sebelum pertemuan semakan (D01-D16): RM21.40. Semua angka ialah imbangan reka bentuk, bukan hasil playtest. Upah dipaparkan pada tawaran dan dikunci ketika menerima kerja.

Alamat NPC ialah alamat penerima, bukan semestinya posisi tubuh. D13 dan D15 boleh diserahkan terus kepada NPC di post padang jika aktif; penerimaan rumah menggunakan keeper/counter sah yang sama, tidak menghasilkan bayaran kedua. HUD menyebut pilihan lokasi sebenar pada waktu itu.

### Dialog tawaran, pickup dan penerimaan setiap kerja

Empat baris setiap kerja: tawaran pengirim, jawapan pemain ketika menerima, pickup pengirim, penerimaan penerima. Upah dipaparkan sebagai resit UI, bukan empat kali diterangkan dalam dialog.

#### D01 - Bekas dari rumah
Ibu: Dua bekas ni pulangkan kepada Pak Rahman. Mak dah basuh.
Pemain: Saya bawa sekali bila keluar.
Ibu: Ambil dekat pintu. Bungkusan yang ada tali merah, bukan beg sekolah.
Pak Rahman: Bekas dah sampai. Terima kasih. Ini duit tolong hantar; lepas ni ada kerja lain kalau kau mahu.

#### D02 - Gula untuk Nenek
Pak Rahman: Nenek pesan gula. Rumah Tok nombor dua, upah seringgit dua puluh.
Pemain: Saya ambil pesanan itu.
Pak Rahman: Ini peknya. Dah dibayar, jangan beli lagi.
Nenek: Haa, gula Nenek. Letak dekat teko. Duit kerja kau Pak Rahman dah titipkan.

#### D03 - Kuih Salmah
Nenek: Kuih ini Salmah pesan untuk persiapan sekolah. Boleh tolong bawa?
Pemain: Boleh. Rumah nombor empat, ya?
Nenek: Ya. Pegang rata, jangan terbalikkan penutup.
Makcik Salmah: Cantik sampai. Bekas pinjam Nenek, nanti Makcik kirim balik.

#### D04 - Poster sekolah
Mei Ling: Poster hari aktiviti dah siap. Cikgu Farid tunggu di sekolah.
Pemain: Aku boleh hantar.
Uncle Lim: Ini satu ikat. Jangan koyak sebab selit dengan skru atau motor.
Cikgu Farid: Letak atas meja. Cikgu semak tajuk dan tarikh dulu. Upah kerja kamu sudah disediakan.

#### D05 - Bakul sayur
Pak Mat: Ros pesan yang ni. Dah pilih yang elok, kau tak perlu petik lagi.
Pemain: Saya hantar ke kantin.
Pak Mat: Bakul berat sedikit. Kalau beg penuh, habiskan barang lain dulu.
Makcik Ros: Sayur sampai elok. Pak Mat ingat pesan aku. Duduk sekejap kalau nak tanya apa-apa.

#### D06 - Makanan persiapan
Makcik Ros: Dua bungkus untuk orang pasang trek. Hantar kepada cikgu, bukan bagi budak berlumba dulu.
Pemain: Saya serah di pejabat sekolah.
Makcik Ros: Nama cikgu ada pada kertas. Pegang bahagian bawah bekas.
Cikgu Farid: Terima kasih. Cikgu simpan untuk mereka selepas kerja selesai.

#### D07 - Makan tengah hari Salmah
Kak Ita: Salmah pesan makan. Dia sibuk siapkan kuih, tak sempat datang.
Pemain: Saya bawa ke rumahnya.
Kak Ita: Ini bungkus yang bernama Salmah. Yang sebelah untuk orang lain.
Makcik Salmah: Haa, alamat betul kali ini. Letak dekat bangku yang kering.

#### D08 - Bekas kuih pulang
Makcik Salmah: Bekas Nenek dah kosong. Makcik basuh dulu, baru kau bawa.
Pemain: Saya pulangkan kepada Nenek.
Makcik Salmah: Ini bekasnya. Kertas yang kau tanya tadi Makcik asingkan, jangan buang dengan sampah.
Nenek: Elok. Bekas ini memang untuk kuih, bukan kotak barang kedai. Nenek boleh pakai lagi.

#### D09 - Teh untuk Timah
Nenek: Timah bantu angkat barang hari aktiviti. Hantarkan teh ini.
Pemain: Rumah nombor tujuh?
Nenek: Ya. Penutup termos dah ketat. Jangan buka di jalan.
Mak Long Timah: Sampai pun. Terima kasih. Kalau nak tanya pasal petang hujan tu, duduk sini.

#### D10 - Termos Pak Karim
Mak Long Timah: Karim tinggal termos ini lepas singgah. Hantar balik ke hentian, ya?
Pemain: Saya memang nak pergi sana.
Mak Long Timah: Dah kosong dan bersih. Termos biru, bukan yang Nenek kirim tadi.
Pak Karim: Haa, aku ingat tertinggal dalam bas. Timah simpan rupanya.

#### D11 - Masa pada kertas
Pak Din: Karim minta salinan resit hentian. Hantar sampul ini kepadanya.
Pemain: Saya bawa, kemudian saya minta dia sahkan masanya.
Pak Din: Bahagian yang berkaitan aku tanda. Baris lain biar berlipat.
Pak Karim: Ini nombor bas aku, Jumaat yang sama. Tiga empat puluh lima, betul.

#### D12 - Alat kecil untuk Walkman
Uncle Lim: Pak Man pesan tali pemacu ini. Dia tengah baiki Walkman Faiz.
Pemain: Saya hantar ke bengkel.
Mei Ling: Satu pek kecil. Jangan buka, nanti hilang di dalam beg.
Pak Man: Haa, saiz betul. Sekarang baru bunyi kaset tak senget.

#### D13 - Walkman kembali
Pak Man: Siap. Ini Faiz punya. Pulangkan kepadanya, bukan letak atas trek.
Pemain: Saya jumpa dia di rumah atau padang.
Pak Man: Aku bungkus dengan kain. Kasetnya biar dalam kotak, jangan main sambil berjalan.
Faiz: Terima kasih. Bunyi dah elok. Aku boleh simpan kainnya untuk pulangkan nanti.

#### D14 - Kain dan borang trek
Abang Hafiz: Kain lap dengan borang ni cikgu minta. Trek kena semak sebelum kejohanan.
Pemain: Saya hantar ke sekolah.
Abang Hafiz: Dua benda dalam satu parcel. Jangan tinggal borang saja.
Cikgu Farid: Cukup semuanya. Meja pemeriksaan boleh disediakan sekarang.

#### D15 - Gasing pinjaman
Faiz: Gasing Atuk ada dengan aku. Tolong pulangkan, aku tak mahu dia tunggu lagi.
Pemain: Aku ambil dan bawa.
Faiz: Ini gasing dan talinya, satu set. Bukan hadiah, masih milik Atuk.
Atuk: Ya, yang ini. Kayu masih elok. Faiz boleh pinjam lagi kalau dia ingat pulangkan.

#### D16 - Kotak permainan balai raya
Atuk: Salleh minta kotak permainan. Ada papan kecil, biji dan tali.
Pemain: Saya hantar ke balai raya.
Atuk: Penutup dah ikat. Letak dulu kalau nak main gasing, jangan dukung sambil tarik tali.
Pak Salleh: Sampai lengkap. Aku sediakan meja, nanti orang boleh duduk semak dan berbual elok-elok.

#### D17 - Air untuk pertemuan
Pak Rahman: Salleh pesan air untuk pertemuan. Bawa kotak ni, cukup satu perjalanan.
Pemain: Saya hantar sebelum mereka mula.
Pak Rahman: Ambil di tepi kaunter. Jangan campur dengan kotak kosong yang nak buang.
Pak Salleh: Terima kasih. Semua yang diperlukan sudah ada. Bila kau bersedia, kita mula semakan.

#### D18 - Pembetulan khabar
Cikgu Farid: Notis ini jelaskan Faiz tidak mengambil stok. Letak di papan Pak Rahman.
Pemain: Saya serahkan kepadanya.
Cikgu Farid: Jangan ubah ayatnya. Kita membetulkan fakta, bukan mengajak orang menghina budak lain.
Pak Rahman: Aku letak di sini. Aku sendiri akan beritahu orang yang pernah dengar cerita dari aku.

#### D19 - Reben hadiah
Makcik Normah: Reben siap. Kemas tepinya, baru elok ikat hadiah sekolah.
Pemain: Saya bawa kepada Cikgu Farid.
Makcik Normah: Ini satu ikat dalam kertas. Kalau terkena hujan, simpan bawah bungkusan lain.
Cikgu Farid: Cantik. Hadiah dan meja pendaftaran sudah lengkap.

#### D20 - Sijil juara
Cikgu Farid: Keputusan akhir dan sijil kamu dalam sampul ini. Pak Salleh mengurus penyampaian.
Pemain: Saya bawa ke balai raya.
Cikgu Farid: Nombor keputusan sudah dicatat. Kalau sampul hilang dari paparan, cikgu boleh keluarkan salinan yang sama.
Pak Salleh: Juara dah datang. Kita sambung penyampaian hadiah; keputusan kamu tak perlu dibuat semula.

### Respons kerja gagal, tangguh atau sambung

Pengirim, belum ambil: Bungkusan masih di sini. Kalau nak sambung, ambil pesanan yang sama.
Pengirim, batal sebelum pickup: Baik. Barang belum keluar, bila mahu hantar nanti boleh terima semula.
Pengirim, batal selepas pickup: Pulangkan bungkusan asal dulu. Lepas terima balik, pesanan dibuka semula. Tiada upah atau wang yang ditolak untuk parcel prepaid.
Penerima salah: Nama pada parcel ini bukan saya. Semak dalam buku; jangan tinggalkan di sini.
Beg penuh: Parcel ini perlukan {ruang} ruang. Ada {baki} ruang sekarang. Serah kerja lain atau pulangkan barang dulu; pesanan ini tidak hilang.
Penerima sudah mengambil: Parcel ini sudah diterima. Upah sudah dicatat; dialog cerita boleh disambung tanpa bayaran lagi.
Keeper rumah: Saya boleh ambil barang. Kalau nak tanya tentang {NPC}, dia di {lokasi}; kalau sudah malam, panggil di pintu rumah.
Kedai tutup: Counter penerimaan masih boleh serah parcel cerita. Untuk membeli atau berbual panjang, pilih Tunggu hingga buka; tiada kiraan luput.

## 8. Kerja hubungan dan collectible budak sekolah

Enam kerja di bawah pilihan, kekal selepas bab selesai. Ia memberi collectible melalui pertolongan dan hubungan, tanpa menjadikan item bukti kecurian. Pemain boleh menolak hadiah; item kekal boleh dituntut sekali kemudian. Ganjaran unik berdasarkan ID, bukan setiap kali scene dimainkan.

| ID | Syarat / route / barang | Upah / ganjaran / tujuan |
| --- | --- | --- |
| R01 | Selepas D13; Faiz 15/34 -> Man 36 -> Faiz. Pulangkan 1 kain pembalut dan bawa 1 nota penjagaan; dua leg satu job, ruang 1 | RM1.20 total; Walkman simpanan Faiz yang satu lagi selepas dialog akhir. Walkman dibaiki D13 tetap milik Faiz |
| R02 | Selepas S22 + R01; Faiz -> Johnny 18/34 -> Faiz. 1 album Too Phat pinjaman dipulangkan; ruang 1 | RM1.20 total; salinan album Whutthadilly? Faiz yang berasingan, bukan merampas pinjaman Johnny |
| R03 | Selepas S22; Logeswaran 5/34 -> Kak Ani 19 -> Logeswaran. 1 nota tempahan + 1 pek bateri prepaid; ruang 1 | RM1.40; buka cabaran tiga latihan di tiga trek. Selepas semua selesai tanpa perlu menang, Faiz memberi Digimon simpanannya |
| R04 | Selepas S22; Johnny 18/34 -> Azura 33 -> Johnny. 1 komik pinjaman + 1 slip pulang; ruang 1 | RM1.20; kad Charizard daripada kad pendua Johnny selepas cabaran pertukaran yang disemak Mei Ling |
| R05 | Selepas S22; Mei Ling 25 -> Hani 20 -> Mei Ling. 1 parcel alat tulis + 1 slip terima; ruang 1 | RM1.20; buka cerita Tamagotchi Hani, lawatan pilihan dua sesi pada hari berbeza; hadiah pendua Hani selepas sesi kedua |
| R06 | Selepas S22; Badrul 17/34 -> Lim 25 -> Farid 29. 1 parcel pembalut dan bekas kerja kedai yang tertinggal, disemak orang dewasa; ruang 1 | RM1.00; tiada collectible. Buka satu dialog pemulihan; bukan upah membeli pengampunan Faiz |

Modal semua R01-R06: RM0. Satu job boleh mempunyai dua stop; hanya satu total upah pada stop terakhir. Barang quest diasingkan daripada stok biasa. R03-R05 memerlukan milestone cabaran selepas delivery; delivery sahaja tidak memberi semua collectible.

### R01 - Satu lagi Walkman
Faiz: Kain bengkel tu masih dengan aku. Aku tak nak Pak Man cari pula. Tolong pulangkan, minta nota penjagaannya sekali.
Pemain: Aku hantar dan bawa balik notanya.
Pak Man: Tali pemacu elok. Jangan tinggal dalam panas kereta. Ini nota untuk Faiz.
Faiz: Terima kasih. Yang dibaiki tu aku simpan. Yang satu lagi ini ayah bagi masa aku kecil, sekarang jarang guna.
Pemain: Kau pasti nak bagi?
Faiz: Ya. Bukan upah kerana kau bersihkan nama aku. Kau tolong jaga barang pinjaman dari sebelum itu lagi. Kalau kau mahu, ambillah.
Pemain: Aku simpan elok-elok.

### R02 - Album yang dipinjam
Faiz: Johnny pinjam album aku. Dia kata dah habis dengar. Boleh ambil balik bila lalu rumahnya?
Johnny: Ini album dia. Kaset aku sendiri ada, aku nak tengok kulitnya saja. Jangan campur, yang ini pinjaman.
Pemain: Aku bawa balik.
Faiz: Sampai elok. Aku ada satu lagi salinan, ayah tersalah beli dulu. Kau boleh simpan yang kedua.
Pemain: Ini yang selalu kau dengar?
Faiz: Ya. Dulu aku ingat hafal lagu terus pandai naik pentas. Mei Ling kata hafal kerja sekolah dulu.

### R03 - Bateri dan Digimon
Logeswaran: Kak Ani simpan bateri yang aku pesan. Duit dah bayar. Tolong ambilkan satu pek; aku jaga trek.
Kak Ani: Pek bertulis Loges. Bukan bateri pinjam dari radio kedai.
Logeswaran: Terima kasih. Cuba habiskan latihan setiap trek. Yang susah itu bukan wajib menang, cuma jangan quit sebelum keputusan.
Faiz, selepas tiga latihan: Kau dah cuba semua trek. Benda ni pula tak ada selekoh, tapi kena jaga juga.
Pemain: Digimon?
Faiz: Aku ada yang lain. Yang ini kau simpan. Dulu aku bawa sampai dalam kelas, cikgu simpan atas meja sehari.
Pemain: Jadi jangan bunyikan masa orang mengajar.
Faiz: Haa. Itu aku sudah belajar.

### R04 - Kad pendua Johnny
Johnny: Komik Cik Azura aku dah habis. Pulangkan, bawa slipnya balik. Aku tak nak nama aku terus dalam buku pinjaman.
Cik Azura: Buku elok. Ini slip, nama Johnny sudah dipadam dari senarai belum pulang.
Johnny: Terima kasih. Aku ada kad pendua, tapi Mei Ling suruh semak sebelum tukar dengan orang.
Mei Ling: Pilih dua kad pendua yang kau mahu tukar. Kad hadiah atau barang bukti tak boleh dipilih. Tengok keadaan dan senarai kedua-dua orang.
Pemain: Yang ini pendua aku. Johnny, kau setuju?
Johnny: Setuju. Charizard yang satu ini memang pendua aku. Yang pertama aku simpan.
Mei Ling: Kedua-dua setuju, baru sah. Kalau belum ada pendua, pergi buat cabaran kad biasa dulu. Tawaran ini tak luput.

Syarat pertukaran: dua kad pendua biasa yang diperoleh melalui aktiviti/pembelian; kedua-dua pemilik mengesahkan; tidak perlu tiga collectible lain dan tidak mengunci main chapter. Nilai/cabaran ini reka bentuk, perlu mengganti quest Charizard lama supaya tidak ada dua jalan memberi item unik yang sama.

### R05 - Benda kecil yang perlu dijaga
Mei Ling: Cikgu Hani pesan alat tulis. Aku dah susun, bawa slip pulang selepas dia terima.
Cikgu Hani: Letak atas rak tinggi. Budak kecil suka anggap pensel baru semua miliknya.
Pemain: Itu Tamagotchi?
Cikgu Hani: Ya. Cikgu ada dua. Yang ini boleh tunjuk cara jaga kalau kamu singgah lagi.
Mei Ling: Slip dah sampai. Kalau nak dengar cerita Hani, pergi bila dia lapang. Kerja kedai ini sudah selesai.
Hani, sesi pertama: Yang kecil pun kena tengok waktunya. Bukan bagi makan semua sekali, kemudian lupa.
Hani, sesi kedua hari berikutnya: Kamu ingat datang semula. Yang satu lagi cikgu simpan, yang ini kamu boleh koleksi. Cerita jaganya kamu sudah tahu.

Jika belum hari berikutnya: Hani: Kita baru tengok tadi. Esok dalam waktu permainan singgah lagi. Bab utama tak perlu tunggu benda ini.

### R06 - Apa yang dibuat selepas mengaku
Badrul: Cikgu dengan ayah dah semak. Ada satu barang yang belum balik kedai. Aku nak serah dengan catatan, bukan selit diam-diam.
Pemain: Aku boleh bawa parcel. Tapi aku tak boleh janji Faiz terus percaya kau.
Badrul: Aku tahu. Yang ini kerja aku betulkan dulu.
Uncle Lim: Parcel ini sepadan catatan pemulangan. Ini pengesahan untuk cikgu.
Cikgu Farid: Rekod lengkap. Bantuan kerja kedai dan urusan kerosakan masih kami pantau. Kamu tak perlu mengulang pengakuan untuk dapat upah baru.
Badrul, selepas: Terima kasih kerana hantar. Kalau nanti aku cakap satu benda, kau boleh semak. Aku tak marah.

R06 tidak memulangkan item yang sudah diserahkan di S21 sekali lagi: ia ialah parcel pembalut/alat kedai yang dikenal pasti selepas semakan, bukan motor/roller batch 7A-7C. Faiz tidak diwajibkan memaafkan untuk progression.

### Penyelarasan collectible lama

| Item | Jalan baharu | Apa yang perlu dielakkan |
| --- | --- | --- |
| Walkman `nostalgia_G04` | R01 dengan barang simpanan berasingan | Jangan pindahkan Walkman utama Faiz tanpa izin |
| Too Phat `nostalgia_M02` | R02, salinan pendua | Jangan jadikan dedikasi Rizal/Lan atau kaset bukti |
| Lightning Magnum `nostalgia_T01` | Juara kejohanan S25 | Tiada hadiah percuma selepas satu race latihan |
| Digimon | R03 + tiga latihan lengkap | Selaraskan item ID sebenar; satu ganjaran sahaja |
| Charizard | R04 + pertukaran dua pendua | Ganti syarat quest lama, bukannya duplicate reward |
| Tamagotchi | R05 + dua sesi Hani | Side quest sahaja, tidak paksa tidur untuk kes utama |
| KLCC, Proton Wira, Telekom | Cerita dewasa kemudian | Tiada forced reward main Chapter 1 |

Save lama yang sudah memiliki collectible kekal memilikinya. Jalan baharu boleh dilalui untuk cerita, tetapi ganjaran item unik tidak ditambah lagi.

## 9. Ekonomi dan kejohanan

### Duit delivery benar-benar membantu

Wallet baharu dalam kod ialah RM2.00. D01-D04 menambah RM4.40, jadi RM6.40 tersedia jika tidak dibelanjakan. Upgrade pertama Brek Sponge RM4.00 boleh dicapai awal. Tayar Sponge RM5.50 memberi pilihan lain; kedua-duanya RM9.50. Kereta asas pinjaman tersedia untuk seluruh Chapter 1 dan semua retry. Parts milik pemain boleh dipasang/dicabut pada kereta latihan tanpa hilang; setup disimpan. Membeli Pekan Runner sendiri RM12.00 ialah pilihan, bukan syarat siasatan atau penyertaan.

| Alat ganti dalam kod | Harga | Peranan / trade-off |
| --- | --- | --- |
| Brek Sponge | RM4.00 | Landing stabil, sedikit kurang laju |
| Tayar Slick | RM4.50 | Lurus laju, grip selekoh kurang |
| Gear Torque | RM5.00 | Selekoh dan ramp, top speed kurang |
| Tayar Sponge | RM5.50 | Grip, sedikit drag |
| Gear Sprint | RM6.50 | Lurus laju, grip kurang |
| Bateri Burst | RM7.00 | Kuasa awal, cas cepat habis |
| Brek Heavy | RM7.50 | Landing lebih terkawal, kelajuan lebih rendah |
| Roller Aluminium | RM8.50 | Stabil pada dinding/lane changer, berat |
| Motor Torque | RM9.00 | Tarikan sekata, tambahan laju kecil |
| Bateri Endurance | RM10.00 | Tahan lama, pecut awal lebih rendah |
| Roller Bearing | RM11.00 | Momentum lancar, bukan grip paling tinggi |
| Motor Dash | RM12.00 | Laju, drain dan kawalan lebih sukar |

Sebelum kejohanan, wallet tanpa belanja ialah RM27.60 (RM2.00 + RM25.60). Membeli Runner RM12.00 dan tayar+brek RM9.50 meninggalkan RM6.10. Menggunakan kereta latihan menjimatkan modal untuk pelbagai setup. Kerja biasa dan R jobs membantu jika duit sudah dibelanjakan. Parts tidak haus/hilang apabila kalah; tiada yuran retry. Jangan menambah consumable berbayar yang menghasilkan kebuntuan selepas duit habis.

### Format kejohanan yang mesti dibina

Lima peserta bersaing dalam tiga pusingan acara: Oval Pekan, Selekoh Lapan, Litar Jaguh. Setiap perlumbaan tiga lap. Paparan mesti menyokong lima peserta; engine sekarang hanya tiga. Semua mendapat jarak/set segmen dan aturan launch/pit yang setara; lebihan panjang laluan visual tidak boleh menguntungkan lorong tertentu. Badrul tidak menggunakan build curi.

Mata setiap race: tempat 1 = 5, tempat 2 = 3, tempat 3 = 2, tempat 4 = 1, tempat 5/DNF = 0. Tiga race dijumlahkan. Seri mata: jumlah masa sah termasuk penalti derail; DNF bernilai 600 saat untuk pengiraan tiebreak dan tidak dianggap masa terbaik. Jika seri tepat masih berlaku, satu race Selekoh Lapan antara peserta seri. Tiada coin toss; hanya markah dan masa yang menentukan kemenangan.

Pemain boleh ubah setup/parts di antara race. Launch tidak sempurna, grip rendah, cas rendah dan derail ditunjukkan sebagai sebab, bukan mesej umum Cuba lagi. Tutorial race boleh kalah; tiga permainan kampung boleh kalah atau ditangguh. Juara kejohanan diperlukan untuk S25. Untuk loss retry, keputusan tournament terdahulu kekal sebagai sejarah; run baharu mempunyai ID baharu tanpa reset kes atau duit.

Ganjaran wang kejohanan yang dirancang: juara RM3.00 sekali; peserta bukan juara RM0.50 untuk setiap run lengkap, maksimum tiga run berbayar sebelum juara. Selepas juara, wang ulang maksimum satu run setiap hari game; collectible tidak ulang. Restart/quit sebelum keputusan tidak memberi wang. Aturan ini berasingan daripada achievement Tamiya lama dan perlu mengelakkan bayaran berganda.

Sasaran tuning: starter stock boleh mencuba tetapi sukar juara; build grip/brek bajet dan launch baik mempunyai jalan menang yang nyata; build mahal serba laju boleh gagal di ramp. Sasaran bukan peratus kemenangan yang telah diukur. Wajib playtest starter, build RM9.50, build torque dan build mahal sebelum difficulty dikunci. Jika tiada build bajet boleh menang, turunkan tuning lawan; jangan paksa pembelian Emperor RM50 untuk tamat Chapter 1.

## 10. Jadual keadaan dan pemulihan progression

Cerita menggunakan syarat deterministik. Pelaku, petunjuk dan lokasi pemulihan tidak diacak. Tidak ada kebarangkalian pemain menerima bukti utama; apabila syarat dipenuhi, interaksi mesti tersedia. Rawak tawaran kerja biasa tidak boleh digunakan untuk membuka bab.

| Keadaan | Syarat masuk / tindakan yang membuka seterusnya | Apa yang kekal jika keluar |
| --- | --- | --- |
| C1-00 Mula | Pilih karakter/nama; S01 | Nama, karakter, checkpoint prologue |
| C1-01 Belajar kerja | D01 -> S02 -> D02 -> S03 -> D03 | Setiap job ada status; upah tidak ulang |
| C1-02 Kenal geng | S04 + satu latihan selesai, kalah dibenarkan | Kenal semua, katalog, peralatan pinjaman |
| C1-03 Stok kurang | S05 -> D04 -> S06 | E01/E02, tiga persoalan dibuka |
| C1-A Alibi | S07/E03 -> S08/E04 -> S09/E05/E06 | Bukti boleh dilihat semula; D05/D06 bebas disambung |
| C1-B Kotak | S10 -> S11 -> S12 -> D11/S13 | E07-E12; D07-D11 kekal tawaran/aktif/selesai |
| C1-C Stok | S14/E13 -> S16/E14 | D12/D13, E17 resit Faiz; tiada dakwaan akhir |
| C1-04 Pemeriksaan sekolah | E11+E12+E13+E14 -> S17 | E15/E16 disimpan oleh Farid; D14 boleh disambung |
| C1-05 Rumah dan balai raya | S15 -> D15 -> S18 -> D16 | Tempat semakan tersedia; permainan pilihan tidak gate |
| C1-06 Rumusan | A: E01+E04+(E03 atau E06); B: E05+E11+E12+E16; C: E13+E14+E15 | Setiap rumusan disahkan berasingan; salah pilih tidak reset |
| C1-07 Cabar cerita | Ketiga-tiga rumusan + D01-D16 -> S20 | E18, jemputan Badrul, D17 |
| C1-08 Semak bersama | D17 + mula S21; pemeriksaan -> pengakuan | E19, kes resolved; barang dalam jagaan dewasa |
| C1-09 Pulihkan nama | D18 + S22 | Kes solved kekal; pendaftaran dan R jobs tersedia |
| C1-10 Hari aktiviti | D19 + S23, tekan Bersedia | Lima peserta; training/garage/job boleh diteruskan |
| C1-11 Race 1-3 | Setiap race selesai -> markah dan checkpoint race seterusnya | Tidak perlu ulang race sah jika pause; pit/elapsed disimpan |
| C1-12 Belum juara | Run lengkap tetapi bukan rank 1 | Ganjaran capped, hasil/diagnostik, kes tidak ulang |
| C1-13 Juara | Rank 1 -> tournamentWon -> D20 | Menang kekal walaupun belum ambil hadiah |
| C1-14 Penutup | D20 + S25 -> hadiah sekali -> S26 | Chapter complete; semua kerja/cabaran pilihan kekal |

Enam urutan laluan sah: A-B-C, A-C-B, B-A-C, B-C-A, C-A-B, C-B-A. S17 menunggu B dan C lengkap; ini sambungan sengaja, bukan keperluan A dibuat dahulu. S09 diperlukan sebelum rumusan B kerana Johnny menerangkan beg. Jika pemain memulakan C, dialog S16 tentang Karim diganti dengan varian belum tahu E11 yang telah ditulis.

### Kes yang berpotensi tersekat dan respons wajib

| Kejadian pemain | Respons sistem / dialog / laluan kembali |
| --- | --- |
| Pergi terus kepada Badrul pada awal game | Perkenalan atau dialog umum; tiada pengakuan/bukti masa depan |
| Datang sekolah sebelum kotak diketahui | Farid berbual biasa; kotak tidak boleh dirampas; pemeriksaan muncul selepas E11-E14 |
| Buat delivery laluan C dahulu | D12/D13 tersedia; label disimpan; HUD nyatakan asal jualan belum disemak |
| Jumpa saksi tanpa parcel | Keterangan dibuka dengan clue; parcel masih kerja berasingan, tidak hilang |
| Salah pilih pasangan bukti | Jawapan khusus tentang apa yang tidak disokong; kad kekal dan pilihan boleh diulang |
| Menuduh Johnny/Faiz daripada satu cerita | NPC membetulkan had keterangan; tiada fail-state atau kehilangan hubungan wajib |
| Menutup dialog di tengah | Simpan scene dan baris seterusnya; Sambung cerita tersedia dengan speaker yang betul |
| Reload sesudah serah tetapi sebelum dialog | Upah/serah kekal, dialog belum selesai kekal; jangan ulang parcel |
| Batal job cerita sebelum ambil | Tawaran job ID sama kembali; tiada reset bukti |
| Batal selepas ambil | Item pulang ke pengirim secara transaksi; hanya selepas pulang tawaran kembali |
| Beg penuh / sudah tiga job | Panel tunjuk ruang/slot; kerja cerita tidak hilang. Boleh serah/batal kerja biasa dengan refund sah |
| Wang kosong | Prepaid jobs + kereta latihan + retry percuma; tak perlu modal untuk petunjuk |
| Pembekal kurang stok untuk kerja purchase biasa | Restock/tunggu, batal atau prepaid alternatif; tidak menyekat story parcel |
| NPC sedang berjalan | HUD gunakan lokasi hidup; interaksi tidak berpindah ke speaker lain secara senyap |
| Budak pulang malam | Panggil di pintu rumah/panel tunggu hingga petang; story actor dipastikan wujud dalam adegan |
| Keeper terima parcel | Status serah sahaja; keterangan sah masih menunggu NPC asal, arah ke lokasi atau panggil rumah |
| Kejohanan sudah bermula tanpa pemain | Tidak berlaku: acara menunggu butang Bersedia; tiada tarikh luput |
| Tutup app tengah race | Resume round ID, elapsed, setup, pits, markah. Jika data round tidak sah, ulang race itu sahaja tanpa bayaran/penalti |
| Kalah tournament berkali-kali | Boleh kerja/upgrade/latihan/retry; petunjuk, pembetulan fitnah dan sijil lama tidak dipadam |
| Seri markah/masa | Aturan tiebreak jelas; tidak tiba-tiba kalah kerana posisi dalam array peserta |
| Menang kemudian quit sebelum D20 | tournamentWon kekal, sijil boleh diambil; tidak perlu menang lagi |
| Sudah memiliki Magnum dari save lama | S25 memberi cerita/pengiktirafan tetapi tidak collectible kedua |
| R quest tidak dibuat | Main bab tetap selesai; hadiah pilihan dan quest boleh dibuat kemudian |
| Tamat bab ketika job biasa aktif | HUD mendahulukan kerja aktif dan tidak menyembunyikan destinasi |
| Tukar Amir/Nur | Save masing-masing; nama/speaker/potret tidak bocor ke karakter lain |
| Save lama masuk revisi baharu | Kekalkan wang, koleksi dan kerja biasa; migrasi parcel lama secara terjamin; jangan bayar semula job yang selesai |

### Prinsip simpan yang wajib

Simpan transaksi serah/upah/ganjaran dengan satu ID unik sebelum animasi atau dialog berjalan. Simpan terpisah: jobDelivered, paymentClaimed, sceneCompleted, evidenceSeen, deductionVerified, caseResolved, tournamentRun, tournamentWon, rewardClaimed. Jangan guna satu indeks scene sahaja untuk semua perkara. Pengesahan keadaan dihitung daripada flag, bukan nombor hari atau jumlah friendship yang boleh turun.

Barang hilang versi lama tidak disembunyikan dalam inventori. Semasa migrasi, parcel cerita lama yang dibatalkan dipulangkan/refund mengikut jenisnya; jangan buang barang peribadi yang mempunyai item ID serupa. Old main/side quest pemberi Magnum diganti atau diselaraskan. Testing mesti memastikan kedua-dua laluan tidak membayar ganjaran yang sama.

## 11. Panel kiri, buku dan potret dialog

### Panel kiri yang benar-benar membantu

Panel memaparkan satu tindakan pilihan pemain sebagai fokus; persoalan siasatan tidak diganti spoiler. Urutan kandungan: tajuk pendek, tindakan/persoalan, satu fakta terbaru, progress, kemudian butang berkaitan. Popup transient tidak menggantikan kad utama.

| Konteks | Teks utama | Maklumat tambahan / butang |
| --- | --- | --- |
| Belum ambil parcel | Ambil gula di kedai Pak Rahman | Penerima Nenek; RM1.20; ruang 1; Ambil / Buku |
| Sedang bawa parcel | Hantar gula kepada Nenek | Rumah Tok; jarak dari kedudukan pemain; 0/1 serah; Tunjuk arah |
| Ada dua stop pilihan | Pulangkan kain kepada Pak Man | Stop 1/2; upah total RM1.20 pada akhir; destinasi stop semasa |
| Baru dengar tuduhan | Beg siapa, pembawa siapa? | Dakwaan belum disahkan; 0/3 rumusan; Buku / Pilih persoalan |
| Sedang semak alibi | Di mana Faiz ketika stok berkurang? | Masa stok dan masa kantin telah dicatat; Bandingkan / Bantuan |
| Laluan kotak belum lengkap | Kotak itu dihantar kepada siapa? | Salmah menumpangkan, bukan penerima; Petunjuk ditemui 3; Buku |
| Bukti cukup, rumusan belum dibuat | Ada catatan yang boleh dibandingkan | 2/3 rumusan disahkan; Susun petunjuk |
| Semua rumusan, job belum selesai | Persiapan semakan belum lengkap | 14/16 delivery awal; senaraikan dua job belum selesai tanpa spoiler |
| S20 lengkap | Bawa air ke balai raya untuk semakan | D17; selepas serah Mula semakan; lokasi peserta |
| Kes selesai | Bersedia untuk kejohanan sekolah | D19 / Latihan / Kedai / Duit poket |
| Kalah tournament | Kereta kehilangan masa di ramp | Keputusan sebenar; Latihan / Garage / Cari kerja |
| Menang | Ambil sijil daripada Cikgu Farid | D20; hadiah belum dituntut; Tunjuk arah |
| Bab selesai | Apa seterusnya? | Kerja aktif dahulu; side quest ditemui; cabaran geng; tiada teaser menjadi job palsu |

Popup yang perlu: Pesanan diterima, Parcel diambil, Serahan 1/2, Upah RMx.xx, Petunjuk dicatat, Dakwaan disahkan/dibetulkan, Rumusan belum tepat, Garage disimpan, Keputusan race, Hadiah dituntut. Popup hanya untuk peristiwa baru, bukan berulang setiap reload. Tap popup boleh membuka catatan asal apabila sesuai.

### Bantuan bertingkat tanpa terus memberi jawapan

Pemain menekan Bantuan sendiri. Tahap tersimpan untuk persoalan itu sahaja; tidak dibuka automatik kerana pemain berjalan lama.

Alibi:
1. Ada dua catatan masa. Adakah kedua-duanya bertindih?
2. Kantin dan buku persiapan sekolah merekodkan aktiviti petang itu.
3. Jumpa Ros, semak buku Farid, kemudian padankan sela stok dengan masa Faiz di kantin.

Kotak:
1. Adakah pemilik beg semestinya orang yang membawanya?
2. Bandingkan cerita padang, beranda dan perhentian bas.
3. Tanya Johnny tentang beg, semak masa dengan Karim/Din, kemudian minta izin Farid melihat catatan kotak sekolah.

Stok:
1. Barang bertanda kedai mungkin dibeli atau dipinjam. Apa yang boleh membezakannya?
2. Buku jualan, label bengkel dan barang di meja sekolah berkaitan.
3. Tunjuk label Pak Man kepada Lim, semak batch dan rekod pinjaman, kemudian bandingkan dengan gear yang cikgu simpan.

### Buku: fakta dan dakwaan diasingkan

Halaman pertama tindakan semasa, bukan 20 job yang belum dibuka. Empat tab: Kerja, Persoalan, Kenangan, Penduduk. Kerja tunjuk label Accepted/Pickup/Carrying/Delivered dan tick setiap stop. Persoalan gunakan kad thumbnail pendek; butiran dialog penuh boleh dibuka. Kenangan hanya item yang sudah diterima; Penduduk hanya perkenalan yang sudah berlaku. Nama pelaku tidak bocor daripada tag, tooltip atau data yang dipaparkan.

Contoh kad:
Dakwaan: Badrul nampak beg Faiz dekat kedai. Sumber: Badrul. Muka pembawa tidak dikenal pasti.
Disahkan: Faiz membantu di kantin 15:10-15:40. Sumber: buku Farid + keterangan Ros.
Perlu semak: Label 7C jatuh dari kereta Badrul. Sumber: Pak Man. Asal pembelian belum disahkan.

Tiada tick palsu untuk bukti yang belum dibandingkan. Tiga rumusan besar mempunyai progress tersendiri, berasingan daripada jumlah delivery dan pendaftaran race.

### Potret bulat setiap speaker

Setiap baris dialog mesti mempunyai speaker ID sebenar, termasuk pilihan salah, respons kerja, pertemuan ramai dan monolog pemain. Paparan: bulatan potret, nama dan teks. Baris Farid guna potret Farid, bukan potret orang yang memulakan interaksi; pemain guna Amir/Nur dan nama pilihannya.

Sheet NPC dalam tangkap layar pengguna memang wujud. Fail asal dan label perlu dipadankan sebelum crop; carian fail pada sesi semakan ini belum memperoleh set asal penuh. Jumlah tepat 40 sheet belum dihitung. Ini status pemetaan aset, bukan alasan menjana semula.

Gunakan kepala/ekspresi yang sudah ada pada sheet. Crop metadata menyimpan source dan bounding box; sheet asli tidak diubah. Jika sheet tertentu belum dipadankan, sembunyikan bulatan bagi watak itu sambil nama dan teks kekal, seperti permintaan pengguna. Tiada silhouette rawak, potret Amir sebagai NPC atau muka baru tanpa rujukan. Badrul/Johnny/Logeswaran mewarisi model crowd yang dipilih; padanan sheet asal dilakukan dahulu, bukan menganggap sheet Adam ialah Hakim.

Ekspresi bertukar hanya apabila tersedia pada sheet: neutral untuk kerja, bimbang ketika Faiz dituduh, tegas semasa semakan, gembira ketika podium. UI landscape pendek mengekalkan teks utama dan potret terbaca; butiran panjang masuk buku. Pemain boleh membesarkan teks dan membuka sejarah percakapan tanpa memajukan scene.

## 12. Dialog penduduk dan ulang kunjungan

Dialog umum ini membantu pekan terasa hidup tanpa memberi clue masa depan. Dipilih mengikut case state; line selepas resolved tidak boleh muncul sebelum S21.

| Watak | Sebelum kes diketahui | Ketika siasatan | Selepas nama Faiz dibetulkan |
| --- | --- | --- | --- |
| Rahman | Nak beli atau hantar barang? Buku aku ada dua pesanan. | Yang aku tulis dalam buku boleh semak. Yang aku dengar, belum tentu. | Notis dah dipasang. Kalau orang tanya, aku betulkan. |
| Nenek | Main congkak dulu, kuih baru angkat. | Nenek boleh dengar. Tapi jangan jadikan cerita Nenek bukti yang Nenek tak nampak. | Kalau dah selesai, duduk main. Tak perlu semua petang jadi soal jawab. |
| Atuk | Tali gasing gulung ketat. Kayu tak boleh diajar kalau tali longgar. | Pinjam itu ada janji pulang. Jangan campur dengan ambil tanpa izin. | Orang boleh betulkan salah, tapi kena buat, bukan cakap saja. |
| Ros | Nak tambah kuah? Bawa pinggan, bukan tangan kosong. | Tanya masa yang tepat, nanti Makcik cuba ingat. | Kejohanan jalan, kantin pun jalan. Siapa kalah tetap lapar. |
| Salmah | Cucur baru siap. Hati-hati panas. | Bangku itu tempat orang tumpang, bukan alamat semua parcel. | Kotak dah tak bersusun. Makcik dapat balik beranda. |
| Timah | Kain belum kering, awan dah gelap. | Aku boleh cerita arah dia jalan. Mukanya aku memang tak nampak. | Hujan sehari, cerita jadi seminggu. Elok dah dibetulkan. |
| Rohani | Perlahan sikit. Baru saja anak tidur. | Aku tak tengok pembawa. Aku cuma tahu bangku itu nampak dari jalan. | Kalau nak lepak, padang sana. Bayi ini tak minat motor. |
| Abu | Surat lama jangan terus buang. Kadang alamatnya berguna. | Pisahkan penerima, pembawa dan orang yang hanya dengar. | Catatan yang betul lebih berguna daripada ingatan paling kuat. |
| Hussin | Kalau tayar pancit, tolak sini. Jangan tunggang atas rim. | Kotak aku nampak ke arah sekolah. Isi dia aku tak tahu. | Basikal siap. Budak-budak boleh ke padang semula. |
| Karim | Bas bandar nanti. Kalau tak naik, beri ruang orang menunggu. | Masa aku dah betulkan ikut resit. Bukan mempertahankan ingatan lama. | Kalau bawa hadiah naik bas, pegang sendiri. Jangan tinggal atas tempat duduk. |
| Din | Dam siap. Nak main atau beli air dulu? | Tengok langkah yang orang buat, bukan langkah yang kau harap dia buat. | Haa, kes selesai. Sekarang tengok siapa kena makan buah dam. |
| Man | Skru kecil jangan campur dalam bekas kuih. | Aku sahkan barang yang masuk bengkel saja. | Barang pinjaman dah pulang, bengkel kurang satu benda untuk dicari. |
| Ita | Makanan bernama orang jangan tertukar. | Khabar warung cepat jalan. Betulkan secepat ia tersebar. | Nak jamu geng? Pesan dulu, jangan datang lima orang lepas lauk habis. |
| Mat | Pilih kangkung yang elok, jangan cabut semua. | Jalan kampung ramai guna. Tapak kasut saja belum kenal orang. | Hantar sayur masih ada upah. Juara pun boleh bekerja. |
| Hassan | Ada bekas jamuan nak pulang. Boleh tolong bila lapang. | Kalau belum pasti, jangan sebut nama di tempat ramai. | Membetulkan khabar pun satu tanggungjawab. |
| Normah | Tunggu sekejap, jarum masih dalam kain. | Reben sekolah belum siap. Cerita kedai saya dengar saja. | Hadiah dah diikat. Jangan tarik reben sampai rosak jahitan. |
| Azura | Komik boleh pinjam. Pulangkan sebelum pinjam lagi. | Rekod sekolah tanya cikgu, buku pinjaman saya lain. | Nama Johnny dah bersih dalam buku pinjaman juga. |
| Hani | Pensel baru bukan hadiah untuk semua, nanti berebut. | Cikgu tak tahu kes kedai. Kalau nak alat tulis, Mei Ling yang urus. | Aktiviti sekolah selesai, kerja tadika belum. |
| Kamal | Meja nak angkut? Beritahu mana, bukan main angkat. | Aku tolong angkut. Yang budak-budak buat, aku tak nampak semuanya. | Ada gambar lama dengan Pak Man. Nanti kita duduk cerita. |
| Hafiz | Jangan pijak trek. Kasut berlumpur tinggal di tepi. | Trek latihan terbuka, kereta kejohanan mesti diperiksa. | Kejohanan boleh ulang. Padang tetap kena dijaga. |

Mei Ling, sebelum kecurian: Kalau nak tengok barang, boleh. Kalau nak beli, jangan buka kotak dahulu.
Mei Ling, semasa kes: Aku masih kawan Faiz. Aku juga anak ayah aku. Aku tak mahu kedua-duanya rosak kerana orang tak semak.
Mei Ling, selepas kes: Borang di sini, kedai di sana. Aku boleh terangkan parts, tapi bukan berlumba untuk kau.
Faiz, sebelum kes: Aku ada Walkman, tapi bateri dah lemah. Jangan ketawa, barang mahal pun kena tukar bateri.
Faiz, semasa kes: Aku ada di sini. Tanya aku sendiri, jangan tanya orang yang tak nampak aku.
Faiz, selepas kes: Kalau nak cuba kereta aku, tanya dulu. Lepas itu pulangkan. Senang saja.
Johnny, sebelum kes: Kad yang bengkok tu letak asing. Jangan cakap elok masa nak tukar.
Johnny, semasa kes: Aku cakap apa aku nampak. Kalau semalam aku tambah, aku betulkan.
Johnny, selepas kes: Nak race atau tukar kad? Jangan buat dua-dua atas trek.
Logeswaran, sebelum kes: Kita cuba satu setup, baru tukar. Kalau semua tukar sekali, tak tahu mana yang membantu.
Logeswaran, semasa kes: Aku tunggu Faiz di kantin. Waktu tepat ikut buku cikgu.
Logeswaran, selepas kes: Aku masih pilih habis race dengan baik. Baru tengok siapa laju.
Badrul, sebelum kes: Aku boleh tunjuk jalan kalau kau belum kenal pekan.
Badrul, semasa kes: Aku tolong tanya juga. Kau semak yang dekat kantin dulu.
Badrul, selepas kes: Barang yang aku pinjam kali ini aku tulis. Kalau nak pulang, aku pulang sendiri.

## 13. Semakan skrip dan syarat sebelum implementasi live

Semakan dokumen: pelaku sama dari awal hingga akhir; tiada Rizal/Lan; Mei Ling tidak berlumba; collectible dewasa dikeluarkan daripada main chapter; salah bukti, kalah race, duit habis dan pulang malam semuanya mempunyai laluan kembali. Harga parts dan baseline delivery dibandingkan dengan kod tempatan. Upah 20 job utama berjumlah RM26.80.

Dokumen tidak mendakwa ujian gameplay versi ini telah lulus. 207 ujian yang dilaporkan dahulu ialah versi RM30, bukan skrip kecurian ini. Sebelum live, semakan berikut perlu dibuat pada implementasi sebenar:

1. Enam urutan laluan A/B/C pada save kosong, termasuk datang kepada NPC lebih awal dan lewat malam.
2. Semua 20 job: accept, pickup, wrong endpoint, keeper, serah, bayaran sekali, batal sebelum/selepas ambil, reload pada setiap fasa.
3. Semua kad rumusan: belum ditemui tidak dipaparkan; pilihan salah, batal dan resume tidak consume clue.
4. Semua speaker/portrait bagi scene kumpulan, nama Amir/Nur dan dialog resume.
5. Lima peserta race, kesamaan jarak, skor tiga trek, DNF, seri, pit, pause, reload dan run retry.
6. Starter stock, starter + upgrade RM9.50 dan kereta lebih mahal: jalan menang bajet perlu disahkan melalui playtest.
7. Semua hadiah unik lama/baharu: tidak duplicate, termasuk side quest dan achievement yang sedia ada.
8. Save v2.11.1/v2.12.1: wang, item dan kerja biasa kekal; parcel lama tidak tersangkut atau membayar dua kali.
9. Mobile portrait dan landscape: panel kiri, dialog, buku, tombol bukti dan race tidak menutup kawalan.
10. Selepas ending: delivery, R01-R06, latihan dan tawaran biasa masih boleh diterima/disambung.

Anggaran reka bentuk masa main: 75-120 minit untuk laluan utama dengan membaca dan beberapa retry; lebih panjang dengan collectible/cabaran. Ini sasaran pacing yang perlu diukur, bukan masa siap yang dijamin. Jangan memanjangkan masa dengan menunggu jam tanpa aktiviti.

## 14. Katalog kad petunjuk

| ID | Asal / jenis | Makna dan had |
| --- | --- | --- |
| E01 | Mei Ling, S05 / rekod | Batch hilang dan sela Jumaat 15:20-15:35; belum tahu pelaku. |
| E02 | Badrul, S05-S06 / dakwaan | Nampak beg Faiz, tidak mengenal muka pembawa. |
| E03 | Ros, S07 / keterangan | Faiz membantu di kantin; tidak melihat setiap minit. |
| E04 | Farid, S08 / rekod disahkan | Faiz 15:10-15:40 di kumpulan kerja kantin. |
| E05 | Johnny, S09 / keterangan | Badrul meminjam beg Faiz di padang; isi kemudian tidak dilihat. |
| E06 | Logeswaran, S09 / keterangan | Menunggu Faiz di kantin; waktu tepat ikut buku Farid. |
| E07 | Salmah, S10 / keterangan | Kotak ditumpangkan di bangku, bukan pesanan rumah. |
| E08 | Salmah, S10 / cebisan | Pita biru biasa; bukan identiti pemilik. |
| E09 | Rahman, S11 / rekod | Pesanan Salmah ialah gula tengah hari, bukan kotak petang. |
| E10 | Timah, S11 / keterangan | Kotak menuju hentian bas selepas rintik; muka tidak kelihatan. |
| E11 | Karim, S12 / keterangan | Badrul menegur dan membawa kotak ke sekolah; tidak mengetahui isi. |
| E12 | Din + Karim, S13 / rekod | Hentian 15:45 Jumaat yang sama; bukan masa kecurian. |
| E13 | Pak Man, S14 / label dan nota | Label 7C dari kereta Badrul ketika suis dibaiki. |
| E14 | Lim/Mei Ling, S16 / rekod | Barang batch hilang tiada rekod jualan, pinjaman atau stok contoh. |
| E15 | Farid + Mei Ling, S17 / fizikal | Gear 7C dalam kotak sekolah; cikgu menyimpannya. |
| E16 | Farid, S17 / rekod disahkan | Badrul membawa kotak sekolah sekitar 16:00; penafian tidak sepadan. |
| E17 | Faiz, S15 / resit | Asal sah koleksi motor Faiz; tidak menjawab semua kecurian secara sendiri. |
| E18 | Badrul, S20 / percanggahan | Terus balik berubah menjadi singgah sekolah; perlu pemeriksaan. |
| E19 | Lim/Farid, S21 / pemeriksaan | Motor 7A, roller 7B, motor/gear 7C dipadankan dengan rekod dan dipulangkan. |

## 15. Semua template kerja biasa dalam kod

Lampiran ini baseline v2.12.1 yang benar-benar dibaca, berasingan daripada 20 job cerita baharu. Satu template menghasilkan tawaran berlainan mengikut kuantiti, route dan bilangan kerja yang pernah diberi. Julat upah di bawah ialah julat ASAS satu unit, bukan total setiap job. Wang dibayar sekali, barang purchase diganti kosnya pada akhir.

Kapasiti kod: 12 ruang beg, maksimum 3 job, wallet mula RM2.00. Formula upah satu stop: bulat kepada RM0.10 bagi interpolasi julat asas mengikut jarak route 20-120m, kemudian tambah RM0.20 bagi setiap unit kecil tambahan atau RM0.40 bagi unit besar tambahan. Formula tiga stop jemputan: interpolasi satu TOTAL julat berdasarkan route/160m, bukan upah setiap rumah. Nilai route ini unit jarak game, bukan tempoh deadline.

### Template pembelian dan penghantaran

Langkah setiap baris: terima di peminta -> pergi pembekal -> beli kuantiti menggunakan modal yang dikunci -> serah kepada peminta -> kos sebenar yang dikunci + upah dibayar. Batal sebelum beli tiada kos; batal selepas beli memulangkan barang dan modal. Story job tidak menggunakan laluan modal ini.

| Template | Peminta / destinasi akhir | Pembekal | Barang / kuantiti | Harga unit; modal | Asas upah |
| --- | --- | --- | --- | --- | --- |
| BUY-rahman-1 | Pak Rahman | Kedai Uncle Lim (25) | Beg kertas, 1-2; ruang 1 seunit | RM0.80; RM0.80-RM1.60 | RM0.80-RM1.20 |
| BUY-rahman-2 | Pak Rahman | Kedai Uncle Lim (25) | Label harga, 1-2; ruang 1 seunit | RM0.60; RM0.60-RM1.20 | RM0.70-RM1.10 |
| BUY-din-1 | Pak Din | Bengkel (36) | Sarung tangan kerja, 1-2; ruang 1 seunit | RM1.10; RM1.10-RM2.20 | RM1.00-RM1.60 |
| BUY-din-2 | Pak Din | Kedai Uncle Lim (25) | Buku resit, 1-2; ruang 1 seunit | RM0.70; RM0.70-RM1.40 | RM0.80-RM1.30 |
| BUY-lim-1 | Uncle Lim | Runcit (22) | Kotak, 1-2; ruang 3 seunit | RM0.60; RM0.60-RM1.20 | RM0.80-RM1.20 |
| BUY-lim-2 | Uncle Lim | Runcit (22) | Kain lap, 1-2; ruang 1 seunit | RM0.70; RM0.70-RM1.40 | RM0.70-RM1.10 |
| BUY-ros-1 | Makcik Ros | Runcit (22) | Telur, 1-2; ruang 3 seunit | RM1.50; RM1.50-RM3.00 | RM1.00-RM1.60 |
| BUY-ros-2 | Makcik Ros | Kebun Pak Mat (9) | Bakul sayur, 1-2; ruang 3 seunit | RM1.30; RM1.30-RM2.60 | RM1.20-RM1.80 |
| BUY-farid-1 | Cikgu Farid | Kedai Uncle Lim (25) | Buku latihan, 1-2; ruang 1 seunit | RM1.30; RM1.30-RM2.60 | RM1.00-RM1.50 |
| BUY-farid-2 | Cikgu Farid | Kedai Uncle Lim (25) | Kapur, 1-3; ruang 1 seunit | RM0.60; RM0.60-RM1.80 | RM0.80-RM1.20 |
| BUY-man-1 | Pak Man | Kiosk petrol (37) | Minyak pelincir, 1-2; ruang 1 seunit | RM1.60; RM1.60-RM3.20 | RM1.00-RM1.60 |
| BUY-man-2 | Pak Man | Runcit (22) | Sabun & kain, 1-2; ruang 1 seunit | RM0.80; RM0.80-RM1.60 | RM0.80-RM1.30 |
| BUY-ita-1 | Kak Ita | Kebun Pak Mat (9) | Bakul sayur, 1-2; ruang 3 seunit | RM1.30; RM1.30-RM2.60 | RM1.20-RM1.80 |
| BUY-ita-2 | Kak Ita | Runcit (22) | Gula, 1-3; ruang 1 seunit | RM0.80; RM0.80-RM2.40 | RM0.90-RM1.40 |
| BUY-salleh-1 | Pak Salleh | Runcit (22) | Air kotak, 1-2; ruang 3 seunit | RM1.30; RM1.30-RM2.60 | RM1.20-RM1.80 |
| BUY-salleh-2 | Pak Salleh | Kedai Uncle Lim (25) | Poster, 1-2; ruang 1 seunit | RM1.10; RM1.10-RM2.20 | RM1.00-RM1.60 |
| BUY-hassan-1 | Ustaz Hassan | Warung Kak Ita (21) | Bungkusan makanan, 1-2; ruang 3 seunit | RM2.00; RM2.00-RM4.00 | RM1.20-RM2.00 |
| BUY-hassan-2 | Ustaz Hassan | Runcit (22) | Pencuci, 1-2; ruang 1 seunit | RM1.00; RM1.00-RM2.00 | RM1.00-RM1.60 |
| BUY-pakmat-1 | Pak Mat | Runcit (22) | Benih, 1-3; ruang 1 seunit | RM0.70; RM0.70-RM2.10 | RM1.20-RM1.80 |
| BUY-pakmat-2 | Pak Mat | Bengkel (36) | Sarung tangan kebun, 1-1; ruang 1 seunit | RM1.10; RM1.10-RM1.10 | RM1.20-RM1.80 |
| BUY-nenek-1 | Nenek | Runcit (22) | Beras, 1-3; ruang 3 seunit | RM2.00; RM2.00-RM6.00 | RM1.00-RM1.60 |
| BUY-nenek-2 | Nenek | Runcit (22) | Teh, 1-2; ruang 1 seunit | RM0.70; RM0.70-RM1.40 | RM0.80-RM1.30 |
| BUY-atuk-1 | Atuk | Kedai Uncle Lim (25) | Gasing, 1-1; ruang 1 seunit | RM2.80; RM2.80-RM2.80 | RM1.00-RM1.60 |
| BUY-atuk-2 | Atuk | Kedai Uncle Lim (25) | Tali wau, 1-2; ruang 1 seunit | RM0.90; RM0.90-RM1.80 | RM0.80-RM1.40 |
| BUY-faiz-1 | Faiz | Kedai Uncle Lim (25) | Komik, 1-2; ruang 1 seunit | RM0.80; RM0.80-RM1.60 | RM0.60-RM1.00 |
| BUY-faiz-2 | Faiz | Kedai Uncle Lim (25) | Pensel, 1-2; ruang 1 seunit | RM0.60; RM0.60-RM1.20 | RM0.60-RM1.00 |
| BUY-meiling-1 | Mei Ling | Kedai Uncle Lim (25) | Pelekat, 1-2; ruang 0 seunit | RM0.60; RM0.60-RM1.20 | RM0.60-RM1.00 |
| BUY-meiling-2 | Mei Ling | Kedai Uncle Lim (25) | Buku skrap, 1-1; ruang 1 seunit | RM1.10; RM1.10-RM1.10 | RM0.70-RM1.10 |
| BUY-school-1 | Isi rumah sekolah | Kedai Uncle Lim (25) | Buku latihan, 1-2; ruang 1 seunit | RM1.30; RM1.30-RM2.60 | RM1.00-RM1.80 |
| BUY-school-2 | Isi rumah sekolah | Kedai Uncle Lim (25) | Pensel, 1-2; ruang 1 seunit | RM0.60; RM0.60-RM1.20 | RM1.00-RM1.60 |
| BUY-baby-1 | Isi rumah bayi | Runcit (22) | Lampin, 1-2; ruang 3 seunit | RM1.20; RM1.20-RM2.40 | RM1.00-RM1.80 |
| BUY-baby-2 | Isi rumah bayi | Runcit (22) | Sabun & kain, 1-2; ruang 1 seunit | RM0.80; RM0.80-RM1.60 | RM1.00-RM1.60 |
| BUY-working-1 | Isi rumah bekerja | Warung Kak Ita (21) | Bungkusan makanan, 1-2; ruang 3 seunit | RM2.00; RM2.00-RM4.00 | RM1.00-RM1.80 |
| BUY-working-2 | Isi rumah bekerja | Runcit (22) | Roti, 1-2; ruang 1 seunit | RM1.20; RM1.20-RM2.40 | RM1.00-RM1.60 |
| BUY-garden-1 | Isi rumah kebun | Runcit (22) | Benih, 1-3; ruang 1 seunit | RM0.70; RM0.70-RM2.10 | RM1.20-RM2.00 |
| BUY-garden-2 | Isi rumah kebun | Bengkel (36) | Sarung tangan kebun, 1-1; ruang 1 seunit | RM1.10; RM1.10-RM1.10 | RM1.20-RM2.00 |
| BUY-kenduri-1 | Isi rumah kenduri | Runcit (22) | Beras, 2-3; ruang 3 seunit | RM2.00; RM4.00-RM6.00 | RM2.00-RM3.50 |
| BUY-kenduri-2 | Isi rumah kenduri | Kebun Pak Mat (9) | Bakul sayur, 1-2; ruang 3 seunit | RM1.30; RM1.30-RM2.60 | RM2.00-RM3.00 |
| BUY-visitors-1 | Isi rumah tetamu | Runcit (22) | Teh, 1-2; ruang 1 seunit | RM0.70; RM0.70-RM1.40 | RM1.20-RM2.20 |
| BUY-visitors-2 | Isi rumah tetamu | Warung Kak Ita (21) | Bungkusan makanan, 1-2; ruang 3 seunit | RM2.00; RM2.00-RM4.00 | RM1.20-RM2.20 |
| BUY-cleaning-1 | Isi rumah pembersihan | Runcit (22) | Sabun & kain, 1-2; ruang 1 seunit | RM0.80; RM0.80-RM1.60 | RM1.00-RM1.80 |
| BUY-cleaning-2 | Isi rumah pembersihan | Runcit (22) | Kain lap, 1-2; ruang 1 seunit | RM0.70; RM0.70-RM1.40 | RM1.00-RM1.60 |

### Template parcel prepaid

Langkah setiap baris: terima/ambil di pengirim -> serah ke penerima yang dipilih dalam tawaran. Modal RM0, kuantiti 1 parcel kecuali tawaran menyatakan cargo barang berkuantiti. `A / B / C` bermaksud satu destinasi dipilih, bukan wajib tiga stop. Jemputan ditanda tiga stop secara khusus. Upah tiga stop dibayar di penghujung route.

| Template | Pengirim | Pilihan destinasi | Barang / ruang seunit | Asas upah / stops |
| --- | --- | --- | --- | --- |
| SEND-rahman-1 | Pak Rahman | Rumah penerima terpilih | Barang dapur; 3 | RM1.00-RM1.60; 1 stop |
| SEND-rahman-2 | Pak Rahman | Kantin (30) | Telur; 3 | RM1.00-RM1.60; 1 stop |
| SEND-rahman-3 | Pak Rahman | Balai raya (32) | Air kotak; 3 | RM1.20-RM1.80; 1 stop |
| SEND-rahman-4 | Pak Rahman | Kiosk petrol (37) | Bekalan; 1 | RM0.80-RM1.20; 1 stop |
| SEND-din-1 | Pak Din | Bengkel (36) | Minyak pelincir; 1 | RM0.80-RM1.30; 1 stop |
| SEND-din-2 | Pak Din | Padang (34) | Air kotak; 3 | RM1.00-RM1.50; 1 stop |
| SEND-din-3 | Pak Din | Runcit (22) / Kedai Uncle Lim (25) / Bengkel (36) | Bekalan; 1 | RM0.80-RM1.20; 1 stop |
| SEND-lim-1 | Uncle Lim | Sekolah (29) | Pesanan alat tulis; 1 | RM1.00-RM1.50; 1 stop |
| SEND-lim-2 | Uncle Lim | Balai raya (32) | Poster; 1 | RM1.00-RM1.50; 1 stop |
| SEND-lim-3 | Uncle Lim | Rumah Atuk (8) / Rumah Mei Ling (14) / Rumah Faiz (15) | Bekalan; 1 | RM0.80-RM1.20; 1 stop |
| SEND-ros-1 | Makcik Ros | Sekolah (29) / Balai raya (32) | Bungkusan hidangan; 1 | RM1.00-RM1.60; 1 stop |
| SEND-ros-2 | Makcik Ros | Rumah penerima terpilih | Bungkusan hidangan; 1 | RM1.00-RM1.60; 1 stop |
| SEND-farid-1 | Cikgu Farid | Balai raya (32) | Notis; 0 | RM0.80-RM1.20; 1 stop |
| SEND-farid-2 | Cikgu Farid | Rumah penerima terpilih | Buku latihan tertinggal; 1 | RM0.80-RM1.40; 1 stop |
| SEND-man-1 | Pak Man | Kiosk petrol (37) / Kebun Pak Mat (9) | Sarung tangan kerja; 1 | RM0.80-RM1.30; 1 stop |
| SEND-man-2 | Pak Man | Rumah Atuk (8) | Mainan lama; 1 | RM1.00-RM1.50; 1 stop |
| SEND-ita-1 | Kak Ita | Rumah penerima terpilih | Bungkusan hidangan; 1 | RM1.00-RM1.60; 1 stop |
| SEND-ita-2 | Kak Ita | Masjid (31) / Balai raya (32) | Bungkusan makanan; 3 | RM1.20-RM1.80; 1 stop |
| SEND-ita-3 | Kak Ita | Rumah penerima terpilih | Kuih buatan sendiri; 1 | RM0.80-RM1.40; 1 stop |
| SEND-salleh-1 | Pak Salleh | Rumah penerima terpilih | Kad jemputan; 0 | RM1.50-RM2.50; 3 stop |
| SEND-salleh-2 | Pak Salleh | Sekolah (29) / Runcit (22) / Kedai Uncle Lim (25) | Notis; 0 | RM0.80-RM1.20; 1 stop |
| SEND-hassan-1 | Ustaz Hassan | Rumah penerima terpilih | Kad jemputan; 0 | RM1.50-RM2.50; 3 stop |
| SEND-hassan-2 | Ustaz Hassan | Rumah penerima terpilih | Bekas makanan; 1 | RM0.60-RM1.00; 1 stop |
| SEND-pakmat-1 | Pak Mat | Kantin (30) / Warung Kak Ita (21) | Hasil kebun; 3 | RM1.00-RM1.60; 1 stop |
| SEND-pakmat-2 | Pak Mat | Rumah Tok (2) | Bakul hadiah; 3 | RM0.80-RM1.60; 1 stop |
| SEND-nenek-1 | Nenek | Rumah penerima terpilih | Kuih buatan sendiri; 1 | RM0.80-RM1.40; 1 stop |
| SEND-nenek-2 | Nenek | Rumah penerima terpilih | Bekas makanan; 1 | RM0.60-RM1.00; 1 stop |
| SEND-nenek-3 | Nenek | Rumah Atuk (8) | Bungkusan hidangan; 1 | RM0.80-RM1.20; 1 stop |
| SEND-atuk-1 | Atuk | Bengkel (36) | Mainan lama; 1 | RM1.00-RM1.50; 1 stop |
| SEND-atuk-2 | Atuk | Rumah penerima terpilih | Komik pinjam; 1 | RM0.60-RM1.00; 1 stop |
| SEND-faiz-1 | Faiz | Rumah Mei Ling (14) | Komik pinjam; 1 | RM0.60-RM1.00; 1 stop |
| SEND-faiz-2 | Faiz | Sekolah (29) | Buku latihan tertinggal; 1 | RM0.80-RM1.40; 1 stop |
| SEND-meiling-1 | Mei Ling | Rumah Faiz (15) | Komik pinjam; 1 | RM0.60-RM1.00; 1 stop |
| SEND-meiling-2 | Mei Ling | Sekolah (29) | Pesanan alat tulis; 1 | RM0.80-RM1.20; 1 stop |
| SEND-school-1 | Isi rumah sekolah | Sekolah (29) | Buku latihan tertinggal; 1 | RM0.80-RM1.40; 1 stop |
| SEND-kenduri-1 | Isi rumah kenduri | Rumah penerima terpilih | Kad jemputan; 0 | RM1.50-RM2.50; 3 stop |
| SEND-kenduri-2 | Isi rumah kenduri | Rumah penerima terpilih | Kuih buatan sendiri; 1 | RM0.80-RM1.40; 1 stop |
| SEND-visitors-1 | Isi rumah tetamu | Rumah penerima terpilih | Bekas makanan; 1 | RM0.60-RM1.00; 1 stop |
| SEND-garden-1 | Isi rumah kebun | Rumah penerima terpilih | Bakul hadiah; 3 | RM0.80-RM1.60; 1 stop |
| SEND-cleaning-1 | Isi rumah pembersihan | Rumah penerima terpilih | Bekas makanan; 1 | RM0.60-RM1.00; 1 stop |

### Rumah yang menggunakan template

| Jenis | Penduduk / rumah |
| --- | --- |
| Isi rumah sekolah | Mak Cik Zaitun (1), Cik Aminah (11) |
| Isi rumah bayi | Kak Rohani (5), Kak Yati (16) |
| Isi rumah bekerja | Abang Kamal (6), Encik Faizal (17) |
| Isi rumah kebun | Pak Mail (3), Pak Abu (13) |
| Isi rumah kenduri | Mak Cik Salmah (4) |
| Isi rumah tetamu | Mak Long Timah (7), Mak Cik Kiah (18) |
| Isi rumah pembersihan | Kak Lina (12) |

Rumah Nenek, Atuk, Mei Ling dan Faiz menggunakan template NPC mereka sendiri. Rumah 1 Amir dan 11 Nur menggunakan school. Kedai/service lain yang tiada template pembelian khusus boleh menjadi penerima pada route umum; jangan mengiklankan job pemberi yang belum dikonfigurasi. Kejohanan memindahkan post Mei Ling ke kedai tetapi alamat penghantaran rumah 14 perlu kekal disokong.

### Dialog reusable kerja biasa

NPC tawaran beli: Ada pesanan {barang}, {kuantiti}. Ambil dari {pembekal}, kemudian hantar semula ke sini. Modal {kos}, nanti diganti bersama upah {upah}.

Pemain terima beli: Baik. Saya ambil jumlah yang tertulis.

Pembekal pickup beli: Ini {kuantiti} {barang}. Pesanan untuk {peminta}, betul? Harga yang dipersetujui {kos}.

NPC terima beli: Cukup. Ini ganti modal {kos}, dan {upah} upah kerja. Terima kasih.

NPC tawaran prepaid: Bungkusan {barang} ini untuk {penerima}. Barang dah dibayar, upah {upah}.

Pemain terima prepaid: Saya bawa kepada {penerima}.

NPC pickup prepaid: Ini parcel dengan nama penerima. Semak sebelum bawa.

Penerima prepaid: Ya, ini pesanan saya. Terima kasih, kerja kamu sudah dicatat.

NPC tawaran tiga stop: Tiga rumah pada senarai ini. Setiap rumah satu jemputan. Upah {upah} untuk seluruh perjalanan.

Penerima stop bukan akhir: Jemputan saya sudah sampai. Rumah seterusnya dalam senarai, ya?

Penerima stop akhir: Ini rumah terakhir. Semua penerima sudah dicatat, upah penuh boleh dituntut.

Modal tidak cukup: Duit belum cukup untuk membeli pesanan ini. Kamu boleh pilih parcel yang sudah dibayar; pesanan ini boleh ditangguh atau dibatalkan.

Stok kurang: Barang belum cukup. Jangan ganti barang lain tanpa persetujuan. Tunggu stok, atau batalkan pesanan dan pilih kerja lain.

Jumlah baseline yang diekstrak: 42 template purchase dan 40 template prepaid. Reka bentuk Chapter 1 menambah 20 job utama dan enam job hubungan; ini tidak bermaksud semua template baseline wajib diselesaikan untuk tamat bab.
