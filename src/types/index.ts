export interface User {
  id: string;
  namaLengkap: string;
  email: string;
  noHp: string;
  tanggalLahir: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  alamat: string;
  password: string;
  role: 'admin' | 'juri' | 'peserta';
  foto?: string;
  bibNumber?: string;
  createdAt: string;
}

export interface Pendaftaran {
  id: string;
  userId: string;
  lomba: string;
  kategori: string;
  tanggalDaftar: string;
  tanggalLomba: string;
  lokasi: string;
  biaya: number;
  status: 'Menunggu' | 'Terverifikasi' | 'Ditolak';
  buktiPembayaran?: string;
  metodePembayaran?: 'QRIS' | 'Transfer Bank';
  bibNumber?: string;
}

export interface HasilLomba {
  id: string;
  userId: string;
  pendaftaranId: string;
  lomba: string;
  kategori: string;
  nilaiAkhir: number;
  peringkat: number;
  status: 'Selesai' | 'Berlangsung' | 'Belum';
}

export interface JadwalLomba {
  id: string;
  tanggal: string;
  lomba: string;
  kategori: string;
  jamMulai: string;
  lokasi: string;
}

export type LombaType = 'Classic Slalom' | 'Freestyle Slide' | 'Speed Slalom' | 'Skate Race';

export interface LombaInfo {
  id: string;
  nama: LombaType;
  deskripsi: string;
  deskripsiPanjang: string;
  biaya: number;
  lokasi: string;
  kategori: string[];
  icon: string;
}
