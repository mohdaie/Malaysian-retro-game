export const EVIDENCE = [
  {
    "id": "E01",
    "title": "Mei Ling, S05 · E01",
    "type": "rekod",
    "text": "Batch hilang dan sela Jumaat 15:20-15:35; belum tahu pelaku.",
    "hearsay": false
  },
  {
    "id": "E02",
    "title": "Badrul, S05-S06 · E02",
    "type": "dakwaan",
    "text": "Nampak beg Faiz, tidak mengenal muka pembawa.",
    "hearsay": true
  },
  {
    "id": "E03",
    "title": "Ros, S07 · E03",
    "type": "keterangan",
    "text": "Faiz membantu di kantin; tidak melihat setiap minit.",
    "hearsay": false
  },
  {
    "id": "E04",
    "title": "Farid, S08 · E04",
    "type": "rekod disahkan",
    "text": "Faiz 15:10-15:40 di kumpulan kerja kantin.",
    "hearsay": false
  },
  {
    "id": "E05",
    "title": "Johnny, S09 · E05",
    "type": "keterangan",
    "text": "Badrul meminjam beg Faiz di padang; isi kemudian tidak dilihat.",
    "hearsay": false
  },
  {
    "id": "E06",
    "title": "Logeswaran, S09 · E06",
    "type": "keterangan",
    "text": "Menunggu Faiz di kantin; waktu tepat ikut buku Farid.",
    "hearsay": false
  },
  {
    "id": "E07",
    "title": "Salmah, S10 · E07",
    "type": "keterangan",
    "text": "Kotak ditumpangkan di bangku, bukan pesanan rumah.",
    "hearsay": false
  },
  {
    "id": "E08",
    "title": "Salmah, S10 · E08",
    "type": "cebisan",
    "text": "Pita biru biasa; bukan identiti pemilik.",
    "hearsay": false
  },
  {
    "id": "E09",
    "title": "Rahman, S11 · E09",
    "type": "rekod",
    "text": "Pesanan Salmah ialah gula tengah hari, bukan kotak petang.",
    "hearsay": false
  },
  {
    "id": "E10",
    "title": "Timah, S11 · E10",
    "type": "keterangan",
    "text": "Kotak menuju hentian bas selepas rintik; muka tidak kelihatan.",
    "hearsay": false
  },
  {
    "id": "E11",
    "title": "Karim, S12 · E11",
    "type": "keterangan",
    "text": "Badrul menegur dan membawa kotak ke sekolah; tidak mengetahui isi.",
    "hearsay": false
  },
  {
    "id": "E12",
    "title": "Din + Karim, S13 · E12",
    "type": "rekod",
    "text": "Hentian 15:45 Jumaat yang sama; bukan masa kecurian.",
    "hearsay": false
  },
  {
    "id": "E13",
    "title": "Pak Man, S14 · E13",
    "type": "label dan nota",
    "text": "Label 7C dari kereta Badrul ketika suis dibaiki.",
    "hearsay": false
  },
  {
    "id": "E14",
    "title": "Lim/Mei Ling, S16 · E14",
    "type": "rekod",
    "text": "Barang batch hilang tiada rekod jualan, pinjaman atau stok contoh.",
    "hearsay": false
  },
  {
    "id": "E15",
    "title": "Farid + Mei Ling, S17 · E15",
    "type": "fizikal",
    "text": "Gear 7C dalam kotak sekolah; cikgu menyimpannya.",
    "hearsay": false
  },
  {
    "id": "E16",
    "title": "Farid, S17 · E16",
    "type": "rekod disahkan",
    "text": "Badrul membawa kotak sekolah sekitar 16:00; penafian tidak sepadan.",
    "hearsay": false
  },
  {
    "id": "E17",
    "title": "Faiz, S15 · E17",
    "type": "resit",
    "text": "Asal sah koleksi motor Faiz; tidak menjawab semua kecurian secara sendiri.",
    "hearsay": false
  },
  {
    "id": "E18",
    "title": "Badrul, S20 · E18",
    "type": "percanggahan",
    "text": "Terus balik berubah menjadi singgah sekolah; perlu pemeriksaan.",
    "hearsay": false
  },
  {
    "id": "E19",
    "title": "Lim/Farid, S21 · E19",
    "type": "pemeriksaan",
    "text": "Motor 7A, roller 7B, motor/gear 7C dipadankan dengan rekod dan dipulangkan.",
    "hearsay": false
  }
];
export const DEDUCTIONS = [
 {id:"A",title:"Waktu siapa tidak sepadan dengan tuduhan Jumaat?",requires:["E01","E04",["E03","E06"]],answer:"Faiz berada di kantin dalam sela stok terakhir hilang.",wrong:["Faiz tidak pernah datang kedai.","Faiz bersalah kerana ada motor baharu."],hint:"Bandingkan sela kiraan stok dengan rekod persiapan kantin."},
 {id:"B",title:"Siapa membawa beg, dan ke mana kotaknya pergi?",requires:["E05","E11","E12","E16"],answer:"Beg Faiz dipinjam Badrul; kotak dibawa Badrul ke sekolah.",wrong:["Timah melihat muka pencuri.","Pemilik beg mesti pembawa kotak."],hint:"Bezakan pemilik beg daripada orang yang meminjamnya. Cari rekod penerimaan."},
 {id:"C",title:"Adakah asal alat ganti boleh disahkan?",requires:["E13","E14","E15"],answer:"Ada barang batch hilang tanpa rekod jualan; perlu semakan bersama Badrul.",wrong:["Semua barang dari kedai ialah barang curi.","Label sahaja membuktikan pencuri."],hint:"Padankan label bengkel, rekod kedai dan gear yang disimpan cikgu."}
];
