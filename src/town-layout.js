// Authored metre-scale plan. Rendering and the numbered map share these records.
export const TOWN_BOUNDS = { minX: -78, maxX: 76, minZ: -66, maxZ: 66 };
export const DISTRICTS = [
  { id: 'kampung', name: 'Kampung Melati', color: '#c87537', x: -48, z: -4, w: 36, d: 119 },
  { id: 'terrace', name: 'Taman Kenangan', color: '#9271b4', x: 53, z: 15, w: 45, d: 44 },
  { id: 'pekan', name: 'Pekan lama', color: '#b95670', x: 14, z: -16, w: 66, d: 30 },
  { id: 'community', name: 'Sekolah & komuniti', color: '#4a9270', x: 21, z: -47, w: 87, d: 34 },
  { id: 'transport', name: 'Pasar & stesen bas', color: '#4b8db4', x: 33, z: 51, w: 87, d: 29 }
];
const building = (id, name, zone, kind, x, z, w, d) => ({ id, name, zone, kind, x, z, w, d });
export const BUILDINGS = [
  building(1, 'Rumah Amir', 'kampung', 'home', -43, 27, 10, 8),
  building(2, 'Rumah Tok', 'kampung', 'house', -51, -47, 9, 7),
  building(3, 'Rumah Pak Mail', 'kampung', 'house', -37, -47, 9, 7),
  building(4, 'Rumah Mak Cik Salmah', 'kampung', 'house', -51, -27, 9, 7),
  building(5, 'Rumah Jiran A', 'kampung', 'house', -37, -27, 9, 7),
  building(6, 'Rumah Jiran B', 'kampung', 'house', -51, -11, 9, 7),
  building(7, 'Rumah Jiran C', 'kampung', 'house', -37, -11, 9, 7),
  building(8, 'Rumah Warisan Kosong', 'kampung', 'house', -51, 51, 9, 7),
  building(9, 'Wakaf Kebun', 'kampung', 'pavilion', -37, 51, 7, 6),
  building(10, 'Pondok Tepi Sungai', 'kampung', 'pavilion', -76, -17, 4, 5),
  building(11, 'Rumah Nur', 'terrace', 'terrace', 35, 16, 6.8, 7),
  building(12, 'Rumah Kak Lina', 'terrace', 'terrace', 42, 16, 6.8, 7),
  building(13, 'Rumah Pak Abu', 'terrace', 'terrace', 49, 16, 6.8, 7),
  building(14, 'Rumah Jiran D', 'terrace', 'terrace', 56, 16, 6.8, 7),
  building(15, 'Rumah Jiran E', 'terrace', 'terrace', 35, 31, 6.8, 7),
  building(16, 'Rumah Jiran F', 'terrace', 'terrace', 42, 31, 6.8, 7),
  building(17, 'Rumah Jiran G', 'terrace', 'terrace', 49, 31, 6.8, 7),
  building(18, 'Rumah Jiran H', 'terrace', 'terrace', 56, 31, 6.8, 7),
  building(19, 'Kedai Sudut Mini', 'terrace', 'mini-shop', 70, -10, 9, 8),
  building(20, 'Tadika Kenangan', 'terrace', 'nursery', 70, 18, 9, 10),
  building(21, 'Warung Pak Mat', 'pekan', 'warung', 12, -6.5, 11, 6.5),
  building(22, 'Kedai Runcit 99', 'pekan', 'shop', -10, -24, 8.8, 10),
  building(23, 'Kedai Gunting', 'pekan', 'shop', -1, -24, 8.8, 10),
  building(24, 'Kedai Basikal', 'pekan', 'shop', 8, -24, 8.8, 10),
  building(25, 'Alat Tulis & Game', 'pekan', 'shop', 17, -24, 8.8, 10),
  building(26, 'Kedai Jahit', 'pekan', 'shop', 26, -24, 8.8, 10),
  building(27, 'Klinik & Farmasi', 'pekan', 'shop', 35, -24, 8.8, 10),
  building(28, 'Kedai Roti & Kuih', 'pekan', 'shop', 44, -24, 8.8, 10),
  building(29, 'SK Seri Kenangan', 'community', 'school', -3, -50, 38, 10),
  building(30, 'Kantin Sekolah', 'community', 'canteen', -14, -36, 10, 6),
  building(31, 'Masjid Seri Kenangan', 'community', 'mosque', 48, -39, 12, 11),
  building(32, 'Balai Raya', 'community', 'hall', 37, -56, 13, 8),
  building(33, 'Perpustakaan Mini', 'community', 'library', 55, -56, 12, 8),
  building(34, 'Gelanggang Serbaguna', 'community', 'court', 9, -36, 14, 8),
  building(35, 'Perhentian Bas', 'transport', 'station', 52, 39, 13, 9),
  building(36, 'Bengkel & Tayar', 'transport', 'workshop', 33, 56, 10, 10),
  building(37, 'Kiosk Petrol Retro', 'transport', 'petrol', 70, 50, 9, 8),
  building(38, 'Tapak Pasar Malam', 'transport', 'market', 8, 52, 24, 20)
];
export const ROADS = [
  { x: 0, z: 4, w: 150, d: 8, kind: 'asphalt' },
  { x: -25, z: 0, w: 7, d: 132, kind: 'asphalt' },
  { x: 62, z: 0, w: 7, d: 132, kind: 'asphalt' },
  { x: -43, z: 1, w: 4, d: 114, kind: 'dirt' },
  { x: -44, z: -36, w: 30, d: 3, kind: 'dirt' },
  { x: -44, z: -18, w: 30, d: 3, kind: 'dirt' },
  { x: 4, z: 37, w: 90, d: 4, kind: 'dirt' },
  { x: 17, z: -13, w: 69, d: 4, kind: 'dirt' },
  { x: 29, z: -1, w: 4, d: 30, kind: 'dirt' },
  { x: 46, z: 9, w: 30, d: 3, kind: 'dirt' },
  { x: 46, z: 24, w: 30, d: 3, kind: 'dirt' },
  { x: 24, z: 49, w: 4, d: 30, kind: 'dirt' },
  { x: 39, z: 43, w: 32, d: 3, kind: 'dirt' },
  { x: 44, z: 53, w: 3, d: 25, kind: 'dirt' },
  { x: 40, z: -49, w: 4, d: 10, kind: 'dirt' }
];
export const BRIDGES = [{ x: -65, z: 4, w: 13, d: 8 }, { x: -65, z: 37, w: 13, d: 8 }];
export function districtAt(x, z) {
  if (x < -29) return DISTRICTS[0];
  if (z < -30) return DISTRICTS[3];
  if (z > 35) return DISTRICTS[4];
  if (x > 30 && z > -17) return DISTRICTS[1];
  return DISTRICTS[2];
}
