import type { User, Pendaftaran, HasilLomba, JadwalLomba, LombaInfo } from '../types';

// ─── LOMBA INFO ───────────────────────────────────────────────────
export const LOMBA_LIST: LombaInfo[] = [
  {
    id: 'classic-slalom',
    nama: 'Classic Slalom',
    deskripsi: 'Lomba slalom dengan melewati cone dalam pola tertentu.',
    deskripsiPanjang: 'Lomba melewati susunan cone dengan teknik slalom secara teratur, mengutamakan kontrol, kelancaran, dan ketepatan gerakan.',
    biaya: 175000,
    lokasi: 'Arena 1 (GBK)',
    icon: '🔵',
    kategori: ['Junior Women U9', 'Junior Men U9', 'Junior Women U12', 'Junior Men U12', 'Youth Women', 'Youth Men'],
  },
  {
    id: 'freestyle-slide',
    nama: 'Freestyle Slide',
    deskripsi: 'Menampilkan teknik slide dengan berbagai gaya',
    deskripsiPanjang: 'Kompetisi yang menampilkan keindahan dan kreativitas teknik slide menggunakan inline skate. Peserta dinilai dari variasi, kehalusan, dan gaya gerakan.',
    biaya: 175000,
    lokasi: 'Arena 2 (GBK)',
    icon: '🟣',
    kategori: ['Junior Women U9', 'Junior Men U9', 'Junior Women U12', 'Junior Men U12', 'Youth Women', 'Youth Men'],
  },
  {
    id: 'speed-slalom',
    nama: 'Speed Slalom',
    deskripsi: 'Balapan melewati cone dengan cepat',
    deskripsiPanjang: 'Lomba kecepatan dalam melewati cone yang disusun dalam satu lintasan lurus. Peserta berlomba untuk menyelesaikan lintasan dalam waktu tercepat.',
    biaya: 175000,
    lokasi: 'Arena 1 (GBK)',
    icon: '⚡',
    kategori: ['Junior Women U9', 'Junior Men U9', 'Junior Women U12', 'Junior Men U12', 'Youth Women', 'Youth Men'],
  },
  {
    id: 'skate-race',
    nama: 'Skate Race',
    deskripsi: 'Balapan inline skate dengan kecepatan serta teknik dinamis',
    deskripsiPanjang: 'Perlombaan balap inline skate yang menggabungkan kecepatan tinggi dan teknik berkendara dinamis di lintasan yang telah ditentukan.',
    biaya: 175000,
    lokasi: 'Arena 2 (GBK)',
    icon: '🏁',
    kategori: ['Junior Women U9', 'Junior Men U9', 'Junior Women U12', 'Junior Men U12', 'Youth Women', 'Youth Men'],
  },
];

// ─── JADWAL ───────────────────────────────────────────────────────
export const JADWAL_LIST: JadwalLomba[] = [
  { id: 'j1', tanggal: '23 Mei 2025', lomba: 'Classic Slalom', kategori: 'Junior Men U12', jamMulai: '08:00', lokasi: 'Arena 1' },
  { id: 'j2', tanggal: '23 Mei 2025', lomba: 'Classic Slalom', kategori: 'Youth Men', jamMulai: '10:00', lokasi: 'Arena 1' },
  { id: 'j3', tanggal: '23 Mei 2025', lomba: 'Speed Slalom', kategori: 'Junior Men U12', jamMulai: '12:00', lokasi: 'Arena 2' },
  { id: 'j4', tanggal: '24 Mei 2025', lomba: 'Freestyle Slide', kategori: 'Junior Men U12', jamMulai: '08:00', lokasi: 'Arena 2' },
  { id: 'j5', tanggal: '24 Mei 2025', lomba: 'Skate Race', kategori: 'Youth Men', jamMulai: '14:00', lokasi: 'Arena 1' },
  { id: 'j6', tanggal: '25 Mei 2025', lomba: 'Classic Slalom', kategori: 'Junior Women U12', jamMulai: '09:00', lokasi: 'Arena 1' },
  { id: 'j7', tanggal: '25 Mei 2025', lomba: 'Freestyle Slide', kategori: 'Youth Women', jamMulai: '11:00', lokasi: 'Arena 2' },
  { id: 'j8', tanggal: '25 Mei 2025', lomba: 'Speed Slalom', kategori: 'Youth Men', jamMulai: '13:00', lokasi: 'Arena 1' },
  { id: 'j9', tanggal: '26 Mei 2025', lomba: 'Skate Race', kategori: 'Junior Men U9', jamMulai: '08:00', lokasi: 'Arena 2' },
  { id: 'j10', tanggal: '26 Mei 2025', lomba: 'Classic Slalom', kategori: 'Junior Women U9', jamMulai: '10:00', lokasi: 'Arena 1' },
  { id: 'j11', tanggal: '27 Mei 2025', lomba: 'Speed Slalom', kategori: 'Junior Women U12', jamMulai: '09:00', lokasi: 'Arena 2' },
  { id: 'j12', tanggal: '27 Mei 2025', lomba: 'Freestyle Slide', kategori: 'Junior Men U9', jamMulai: '11:00', lokasi: 'Arena 2' },
  { id: 'j13', tanggal: '28 Mei 2025', lomba: 'Skate Race', kategori: 'Junior Women U12', jamMulai: '08:00', lokasi: 'Arena 1' },
  { id: 'j14', tanggal: '28 Mei 2025', lomba: 'Classic Slalom', kategori: 'Youth Women', jamMulai: '10:00', lokasi: 'Arena 1' },
  { id: 'j15', tanggal: '29 Mei 2025', lomba: 'Speed Slalom', kategori: 'Junior Women U9', jamMulai: '09:00', lokasi: 'Arena 2' },
  { id: 'j16', tanggal: '29 Mei 2025', lomba: 'Freestyle Slide', kategori: 'Youth Men', jamMulai: '13:00', lokasi: 'Arena 2' },
  { id: 'j17', tanggal: '30 Mei 2025', lomba: 'Skate Race', kategori: 'Junior Women U9', jamMulai: '08:00', lokasi: 'Arena 1' },
  { id: 'j18', tanggal: '30 Mei 2025', lomba: 'Classic Slalom', kategori: 'Junior Men U9', jamMulai: '10:00', lokasi: 'Arena 1' },
  { id: 'j19', tanggal: '31 Mei 2025', lomba: 'Speed Slalom', kategori: 'Youth Women', jamMulai: '09:00', lokasi: 'Arena 2' },
  { id: 'j20', tanggal: '31 Mei 2025', lomba: 'Freestyle Slide', kategori: 'Junior Women U9', jamMulai: '11:00', lokasi: 'Arena 2' },
];

// ─── CATEGORY MAPPING ────────────────────────────────────────────
export function getKategoriFromProfile(jenisKelamin: string, tanggalLahir: string): string {
  const birthDate = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  const gender = jenisKelamin === 'Laki-laki' ? 'Men' : 'Women';
  if (age <= 9) return `Junior ${gender} U9`;
  if (age <= 12) return `Junior ${gender} U12`;
  return `Youth ${gender}`;
}

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────
const KEYS = {
  USERS: 'skatecomp_users',
  CURRENT_USER: 'skatecomp_current_user',
  PENDAFTARAN: 'skatecomp_pendaftaran',
  HASIL: 'skatecomp_hasil',
};

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
}
export function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}
export function getCurrentUser(): User | null {
  const id = localStorage.getItem(KEYS.CURRENT_USER);
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}
export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(KEYS.CURRENT_USER, user.id);
  else localStorage.removeItem(KEYS.CURRENT_USER);
}
export function updateCurrentUser(updates: Partial<User>) {
  const users = getUsers();
  const id = localStorage.getItem(KEYS.CURRENT_USER);
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return users[idx];
  }
  return null;
}

export function getPendaftaran(userId?: string): Pendaftaran[] {
  const all = JSON.parse(localStorage.getItem(KEYS.PENDAFTARAN) || '[]') as Pendaftaran[];
  if (userId) return all.filter(p => p.userId === userId);
  return all;
}
export function savePendaftaran(list: Pendaftaran[]) {
  localStorage.setItem(KEYS.PENDAFTARAN, JSON.stringify(list));
}
export function addPendaftaran(item: Pendaftaran) {
  const all = getPendaftaran();
  all.push(item);
  savePendaftaran(all);
}

export function getHasil(userId?: string): HasilLomba[] {
  const all = JSON.parse(localStorage.getItem(KEYS.HASIL) || '[]') as HasilLomba[];
  if (userId) return all.filter(h => h.userId === userId);
  return all;
}
export function saveHasil(list: HasilLomba[]) {
  localStorage.setItem(KEYS.HASIL, JSON.stringify(list));
}

export function generatePendaftaranId(existing: Pendaftaran[]): string {
  const num = existing.length + 1;
  return `PIN-2025-${String(num).padStart(4, '0')}`;
}

export function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

// ─── SEED DEMO DATA ──────────────────────────────────────────────
export function seedDemoData() {
  const users = getUsers();
  if (users.length > 0) {
    // Migrate existing users to have role if missing (for dev safety)
    let dirty = false;
    const updatedUsers = users.map(u => {
      if (!u.role) {
        u.role = u.email.includes('admin.com') ? 'admin' : u.email.includes('juri.com') ? 'juri' : 'peserta';
        dirty = true;
      }
      return u;
    });
    if (dirty) saveUsers(updatedUsers);
    return;
  }

  const demoUser: User = {
    id: 'demo-user-1',
    namaLengkap: 'Andy Santoso',
    email: 'andysantoso@gmail.com',
    noHp: '0811888777',
    tanggalLahir: '2015-04-01',
    jenisKelamin: 'Laki-laki',
    alamat: 'Jl. Asia Afrika No.10',
    password: 'password123',
    role: 'peserta',
    bibNumber: '001',
    createdAt: new Date().toISOString(),
  };

  const adminUsers: User[] = [
    {
      id: 'AD001',
      namaLengkap: 'Rangga Wibowo',
      email: 'rangga@admin.com',
      noHp: '081234567890',
      tanggalLahir: '1990-01-01',
      jenisKelamin: 'Laki-laki',
      alamat: 'Kantor Admin',
      password: 'Bagusadmin001',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'AD002',
      namaLengkap: 'Sinta Marlina',
      email: 'sinta@admin.com',
      noHp: '081234567891',
      tanggalLahir: '1992-02-02',
      jenisKelamin: 'Perempuan',
      alamat: 'Kantor Admin',
      password: 'bagusadmin002',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'AD003',
      namaLengkap: 'Yusuf Hakim',
      email: 'yusuf@admin.com',
      noHp: '081234567892',
      tanggalLahir: '1988-08-08',
      jenisKelamin: 'Laki-laki',
      alamat: 'Kantor Admin',
      password: 'bagusadmin003',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
  ];

  const juriUsers: User[] = [
    {
      id: 'JR001',
      namaLengkap: 'Andi Pratama',
      email: 'andi@juri.com',
      noHp: '081111111111',
      tanggalLahir: '1985-05-05',
      jenisKelamin: 'Laki-laki',
      alamat: 'Arena Lomba',
      password: 'Juricepat001',
      role: 'juri',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'JR002',
      namaLengkap: 'Budi Santoso',
      email: 'budi@juri.com',
      noHp: '082222222222',
      tanggalLahir: '1986-06-06',
      jenisKelamin: 'Laki-laki',
      alamat: 'Arena Lomba',
      password: 'Jurilambat002',
      role: 'juri',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'JR003',
      namaLengkap: 'Citra Lestari',
      email: 'citra@juri.com',
      noHp: '083333333333',
      tanggalLahir: '1989-07-07',
      jenisKelamin: 'Perempuan',
      alamat: 'Arena Lomba',
      password: 'Juripelan003',
      role: 'juri',
      createdAt: new Date().toISOString(),
    }
  ];

  saveUsers([demoUser, ...adminUsers, ...juriUsers]);

  const demoHasil: HasilLomba[] = [
    { id: 'h1', userId: 'demo-user-1', pendaftaranId: 'PIN-2025-0001', lomba: 'Speed Slalom', kategori: 'Junior Men U12', nilaiAkhir: 85.33, peringkat: 2, status: 'Selesai' },
    { id: 'h2', userId: 'demo-user-1', pendaftaranId: 'PIN-2025-0002', lomba: 'Classic Slalom', kategori: 'Junior Men U12', nilaiAkhir: 88, peringkat: 1, status: 'Selesai' },
  ];
  saveHasil(demoHasil);

  const demoPendaftaran: Pendaftaran[] = [
    { id: 'PIN-2025-0001', userId: 'demo-user-1', lomba: 'Speed Slalom', kategori: 'Junior Men U12', tanggalDaftar: '20 Mei 2025', tanggalLomba: '23 Mei 2025', lokasi: 'Arena 2', biaya: 175000, status: 'Terverifikasi', bibNumber: '001' },
    { id: 'PIN-2025-0002', userId: 'demo-user-1', lomba: 'Classic Slalom', kategori: 'Junior Men U12', tanggalDaftar: '20 Mei 2025', tanggalLomba: '25 Mei 2025', lokasi: 'Arena 1', biaya: 175000, status: 'Menunggu' },
  ];
  savePendaftaran(demoPendaftaran);
}
