import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import type { User } from '../types';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminPesertaPage() {
  const [pesertaList, setPesertaList] = useState<User[]>([]);

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        const res = await apiFetch('/api/peserta');
        const data = await res.json();
        if (data.success) {
          const mapped = (data.data || []).map((p: any) => ({
            id: p.id_peserta,
            namaLengkap: p.nama_peserta,
            email: p.email,
            noHp: p.no_hp || '-',
            tanggalLahir: p.tanggal_lahir ? new Date(p.tanggal_lahir).toLocaleDateString('id-ID') : '-',
            jenisKelamin: p.jenis_kelamin === 'L' ? 'Laki-laki' : p.jenis_kelamin === 'P' ? 'Perempuan' : p.jenis_kelamin,
            bibNumber: p.nomor_bib,
            alamat: p.alamat || '-'
          }));
          setPesertaList(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPeserta();
  }, []);

  return (
    <Layout title="Kelola Peserta">
      <div className="p-6 rounded-2xl space-y-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Daftar Seluruh Peserta</h2>
            <p className="text-sm" style={{ color: '#8B7DAB' }}>
              Lihat detail data diri dan akun peserta yang terdaftar pada sistem.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                <th className="pb-3 pl-2">Nama Lengkap</th>
                <th className="pb-3">Kontak</th>
                <th className="pb-3">Tanggal Lahir</th>
                <th className="pb-3">Gender</th>
                <th className="pb-3">BIB</th>
                <th className="pb-3">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
              {pesertaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Belum ada peserta terdaftar</td>
                </tr>
              ) : (
                pesertaList.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 pl-2 font-semibold text-white">{p.namaLengkap}</td>
                    <td className="py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#8B7DAB]">
                        <Mail size={12} /> {p.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#8B7DAB]">
                        <Phone size={12} /> {p.noHp}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#8B7DAB]">
                        <Calendar size={12} /> {p.tanggalLahir}
                      </div>
                    </td>
                    <td className="py-4">{p.jenisKelamin}</td>
                    <td className="py-4 font-bold text-purple-400">{p.bibNumber || '-'}</td>
                    <td className="py-4 text-xs text-[#8B7DAB] max-w-[200px] truncate" title={p.alamat}>
                      {p.alamat}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
