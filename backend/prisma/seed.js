const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seed data...');

  // ─── 1. JENIS LOMBA ────────────────────────────────────────────
  console.log('📋 Seeding jenis_lomba...');
  await prisma.jenisLomba.createMany({
    data: [
      { id_jenis_lomba: 'JL001', nama_lomba: 'Classic Slalom',  biaya_pendaftaran: 175000 },
      { id_jenis_lomba: 'JL002', nama_lomba: 'Freestyle Slide', biaya_pendaftaran: 200000 },
      { id_jenis_lomba: 'JL003', nama_lomba: 'Speed Slalom',    biaya_pendaftaran: 175000 },
      { id_jenis_lomba: 'JL004', nama_lomba: 'Skate Race',      biaya_pendaftaran: 225000 },
    ],
    skipDuplicates: true,
  });

  // ─── 2. KATEGORI LOMBA ─────────────────────────────────────────
  console.log('📋 Seeding kategori_lomba...');
  await prisma.kategoriLomba.createMany({
    data: [
      { id_kategori: 'KT001', nama_kategori: 'Junior Women U9',  jenis_kelamin: 'P', usia_min: 6,  usia_maks: 8  },
      { id_kategori: 'KT002', nama_kategori: 'Junior Men U9',    jenis_kelamin: 'L', usia_min: 6,  usia_maks: 8  },
      { id_kategori: 'KT003', nama_kategori: 'Junior Women U12', jenis_kelamin: 'P', usia_min: 9,  usia_maks: 11 },
      { id_kategori: 'KT004', nama_kategori: 'Junior Men U12',   jenis_kelamin: 'L', usia_min: 9,  usia_maks: 11 },
      { id_kategori: 'KT005', nama_kategori: 'Youth Women',      jenis_kelamin: 'P', usia_min: 12, usia_maks: 17 },
      { id_kategori: 'KT006', nama_kategori: 'Youth Men',        jenis_kelamin: 'L', usia_min: 12, usia_maks: 17 },
    ],
    skipDuplicates: true,
  });

  // ─── 3. JADWAL LOMBA ───────────────────────────────────────────
  console.log('📋 Seeding jadwal_lomba...');
  const jadwalData = [
    { id_jadwal: 'JD001', id_jenis_lomba: 'JL001', id_kategori: 'KT001', tanggal_lomba: new Date('2026-10-10'), jam_mulai: '08:00:00', jam_selesai: '09:00:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD002', id_jenis_lomba: 'JL001', id_kategori: 'KT002', tanggal_lomba: new Date('2026-10-10'), jam_mulai: '09:15:00', jam_selesai: '10:15:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD003', id_jenis_lomba: 'JL001', id_kategori: 'KT003', tanggal_lomba: new Date('2026-10-10'), jam_mulai: '10:30:00', jam_selesai: '11:30:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD004', id_jenis_lomba: 'JL001', id_kategori: 'KT004', tanggal_lomba: new Date('2026-10-10'), jam_mulai: '13:00:00', jam_selesai: '14:00:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD005', id_jenis_lomba: 'JL001', id_kategori: 'KT005', tanggal_lomba: new Date('2026-10-10'), jam_mulai: '14:15:00', jam_selesai: '15:15:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD006', id_jenis_lomba: 'JL001', id_kategori: 'KT006', tanggal_lomba: new Date('2026-10-10'), jam_mulai: '15:30:00', jam_selesai: '16:30:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD007', id_jenis_lomba: 'JL002', id_kategori: 'KT001', tanggal_lomba: new Date('2026-10-11'), jam_mulai: '08:00:00', jam_selesai: '09:00:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD008', id_jenis_lomba: 'JL002', id_kategori: 'KT002', tanggal_lomba: new Date('2026-10-11'), jam_mulai: '09:15:00', jam_selesai: '10:15:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD009', id_jenis_lomba: 'JL002', id_kategori: 'KT003', tanggal_lomba: new Date('2026-10-11'), jam_mulai: '10:30:00', jam_selesai: '11:30:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD010', id_jenis_lomba: 'JL002', id_kategori: 'KT004', tanggal_lomba: new Date('2026-10-11'), jam_mulai: '13:00:00', jam_selesai: '14:00:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD011', id_jenis_lomba: 'JL002', id_kategori: 'KT005', tanggal_lomba: new Date('2026-10-11'), jam_mulai: '14:15:00', jam_selesai: '15:15:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD012', id_jenis_lomba: 'JL002', id_kategori: 'KT006', tanggal_lomba: new Date('2026-10-11'), jam_mulai: '15:30:00', jam_selesai: '16:30:00', lokasi: 'Arena A' },
    { id_jadwal: 'JD013', id_jenis_lomba: 'JL003', id_kategori: 'KT001', tanggal_lomba: new Date('2026-10-12'), jam_mulai: '08:00:00', jam_selesai: '09:00:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD014', id_jenis_lomba: 'JL003', id_kategori: 'KT002', tanggal_lomba: new Date('2026-10-12'), jam_mulai: '09:15:00', jam_selesai: '10:15:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD015', id_jenis_lomba: 'JL003', id_kategori: 'KT003', tanggal_lomba: new Date('2026-10-12'), jam_mulai: '10:30:00', jam_selesai: '11:30:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD016', id_jenis_lomba: 'JL003', id_kategori: 'KT004', tanggal_lomba: new Date('2026-10-12'), jam_mulai: '13:00:00', jam_selesai: '14:00:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD017', id_jenis_lomba: 'JL003', id_kategori: 'KT005', tanggal_lomba: new Date('2026-10-12'), jam_mulai: '14:15:00', jam_selesai: '15:15:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD018', id_jenis_lomba: 'JL003', id_kategori: 'KT006', tanggal_lomba: new Date('2026-10-12'), jam_mulai: '15:30:00', jam_selesai: '16:30:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD019', id_jenis_lomba: 'JL004', id_kategori: 'KT001', tanggal_lomba: new Date('2026-10-13'), jam_mulai: '08:00:00', jam_selesai: '09:00:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD020', id_jenis_lomba: 'JL004', id_kategori: 'KT002', tanggal_lomba: new Date('2026-10-13'), jam_mulai: '09:15:00', jam_selesai: '10:15:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD021', id_jenis_lomba: 'JL004', id_kategori: 'KT003', tanggal_lomba: new Date('2026-10-13'), jam_mulai: '10:30:00', jam_selesai: '11:30:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD022', id_jenis_lomba: 'JL004', id_kategori: 'KT004', tanggal_lomba: new Date('2026-10-13'), jam_mulai: '13:00:00', jam_selesai: '14:00:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD023', id_jenis_lomba: 'JL004', id_kategori: 'KT005', tanggal_lomba: new Date('2026-10-13'), jam_mulai: '14:15:00', jam_selesai: '15:15:00', lokasi: 'Arena B' },
    { id_jadwal: 'JD024', id_jenis_lomba: 'JL004', id_kategori: 'KT006', tanggal_lomba: new Date('2026-10-13'), jam_mulai: '15:30:00', jam_selesai: '16:30:00', lokasi: 'Arena B' },
  ];
  await prisma.jadwalLomba.createMany({ data: jadwalData, skipDuplicates: true });

  // ─── 4. ADMIN ──────────────────────────────────────────────────
  console.log('👤 Seeding admin...');
  await prisma.admin.createMany({
    data: [
      { id_admin: 'AD001', nama_admin: 'Rangga Wibowo', email: 'rangga@admin.com', password: await bcrypt.hash('Bagusadmin001', 10) },
      { id_admin: 'AD002', nama_admin: 'Sinta Marlina',  email: 'sinta@admin.com',  password: await bcrypt.hash('bagusadmin002', 10) },
      { id_admin: 'AD003', nama_admin: 'Yusuf Hakim',    email: 'yusuf@admin.com',  password: await bcrypt.hash('bagusadmin003', 10) },
    ],
    skipDuplicates: true,
  });

  // ─── 5. JURI ───────────────────────────────────────────────────
  console.log('👤 Seeding juri...');
  await prisma.juri.createMany({
    data: [
      { id_juri: 'JR001', nama_juri: 'Andi Pratama',  no_hp: '081111111111', email: 'andi@juri.com',  password: await bcrypt.hash('Juricepat001',  10) },
      { id_juri: 'JR002', nama_juri: 'Budi Santoso',  no_hp: '082222222222', email: 'budi@juri.com',  password: await bcrypt.hash('Jurilambat002', 10) },
      { id_juri: 'JR003', nama_juri: 'Citra Lestari', no_hp: '083333333333', email: 'citra@juri.com', password: await bcrypt.hash('Juripelan003',  10) },
    ],
    skipDuplicates: true,
  });

  // ─── 6. PESERTA (sample — first 10 from SQL) ───────────────────
  console.log('👤 Seeding peserta (sample 10)...');
  const pesertaSample = [
    { id_peserta: 'PS001', nama_peserta: 'Salsabila Anggraini', tanggal_lahir: new Date('2020-05-23'), jenis_kelamin: 'P', alamat: 'Jl. Melati No. 29, Bekasi',     no_hp: '08232458591', email: 'salsabila.anggraini1@email.com', nomor_bib: '1001', password: 'Trek427%'    },
    { id_peserta: 'PS002', nama_peserta: 'Kirana Permatasari',  tanggal_lahir: new Date('2020-09-25'), jenis_kelamin: 'P', alamat: 'Jl. Mawar No. 28, Tangerang',    no_hp: '08741445199', email: 'kirana.permatasari2@email.com',  nomor_bib: '1002', password: 'Kilat762!'   },
    { id_peserta: 'PS003', nama_peserta: 'Citra Safitri',       tanggal_lahir: new Date('2017-11-12'), jenis_kelamin: 'P', alamat: 'Jl. Cempaka No. 70, Surabaya',   no_hp: '08388536477', email: 'citra.safitri3@email.com',       nomor_bib: '1003', password: 'Tangkas328%' },
    { id_peserta: 'PS004', nama_peserta: 'Kirana Ramadhani',    tanggal_lahir: new Date('2020-07-21'), jenis_kelamin: 'P', alamat: 'Jl. Cempaka No. 55, Bandung',    no_hp: '08453608513', email: 'kirana.ramadhani4@email.com',    nomor_bib: '1004', password: 'Meluncur669$'},
    { id_peserta: 'PS005', nama_peserta: 'Nur Kusuma',          tanggal_lahir: new Date('2020-08-24'), jenis_kelamin: 'P', alamat: 'Jl. Kenanga No. 13, Bandung',    no_hp: '08545437923', email: 'nur.kusuma5@email.com',          nomor_bib: '1005', password: 'Balap686%'   },
    { id_peserta: 'PS036', nama_peserta: 'Eko Kurniawan',       tanggal_lahir: new Date('2019-06-21'), jenis_kelamin: 'L', alamat: 'Jl. Mawar No. 75, Yogyakarta',   no_hp: '08176261415', email: 'eko.kurniawan36@email.com',      nomor_bib: '1036', password: 'Putar817$'   },
    { id_peserta: 'PS061', nama_peserta: 'Nadia Kusuma',        tanggal_lahir: new Date('2015-08-08'), jenis_kelamin: 'P', alamat: 'Jl. Cempaka No. 116, Bogor',     no_hp: '08746188935', email: 'nadia.kusuma61@email.com',       nomor_bib: '1061', password: 'Meluncur659!' },
    { id_peserta: 'PS096', nama_peserta: 'Hendra Santoso',      tanggal_lahir: new Date('2016-02-03'), jenis_kelamin: 'L', alamat: 'Jl. Kamboja No. 98, Tangerang',  no_hp: '08988987516', email: 'hendra.santoso96@email.com',     nomor_bib: '1096', password: 'Panah988@'   },
    { id_peserta: 'PS122', nama_peserta: 'Aulia Permatasari',   tanggal_lahir: new Date('2010-10-10'), jenis_kelamin: 'P', alamat: 'Jl. Cempaka No. 112, Yogyakarta',no_hp: '08697933143', email: 'aulia.permatasari122@email.com', nomor_bib: '1122', password: 'Putar669@'   },
    { id_peserta: 'PS160', nama_peserta: 'Guntur Ramadhan',     tanggal_lahir: new Date('2011-06-12'), jenis_kelamin: 'L', alamat: 'Jl. Anggrek No. 13, Bandung',    no_hp: '08797017548', email: 'guntur.ramadhan160@email.com',   nomor_bib: '1160', password: 'Arena486@'   },
  ];

  for (const p of pesertaSample) {
    await prisma.peserta.upsert({
      where: { id_peserta: p.id_peserta },
      update: {},
      create: {
        ...p,
        password: await bcrypt.hash(p.password, 10),
      },
    });
  }

  console.log('✅ Seed selesai!');
  console.log('');
  console.log('📌 Akun untuk login:');
  console.log('   ADMIN    → rangga@admin.com    | Bagusadmin001');
  console.log('   ADMIN    → sinta@admin.com     | bagusadmin002');
  console.log('   JURI     → andi@juri.com       | Juricepat001');
  console.log('   JURI     → budi@juri.com       | Jurilambat002');
  console.log('   PESERTA  → salsabila.anggraini1@email.com | Trek427%');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
