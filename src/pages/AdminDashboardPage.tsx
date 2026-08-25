import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getPendaftaran, savePendaftaran, getUsers, formatRupiah } from '../lib/data';
import type { Pendaftaran, User } from '../types';
import { Users, FileText, Check, X, ShieldAlert, Award } from 'lucide-react';

export default function AdminDashboardPage() {
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    setPendaftaranList(getPendaftaran());
    setUsersList(getUsers());
  }, []);

  const totalPeserta = usersList.filter(u => u.role === 'peserta').length;
  const totalJuri = usersList.filter(u => u.role === 'juri').length;
  const totalPendaftaran = pendaftaranList.length;
  const pendingRegistrations = pendaftaranList.filter(p => p.status === 'Menunggu');
  const totalRevenue = pendaftaranList
    .filter(p => p.status === 'Terverifikasi')
    .reduce((sum, p) => sum + p.biaya, 0);

  const handleUpdateStatus = (id: string, newStatus: 'Terverifikasi' | 'Ditolak') => {
    const list = getPendaftaran();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      // If approved, assign a random bib number if they don't have one
      if (newStatus === 'Terverifikasi' && !list[idx].bibNumber) {
        list[idx].bibNumber = String(1000 + Math.floor(Math.random() * 9000));
      }
      savePendaftaran(list);
      setPendaftaranList(list);
    }
  };

  return (
    <Layout title="Dashboard Admin">
      <div className="space-y-6">
        
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Total Peserta</p>
              <h3 className="text-2xl font-bold text-white">{totalPeserta}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Users size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Total Juri</p>
              <h3 className="text-2xl font-bold text-white">{totalJuri}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Pendaftaran</p>
              <h3 className="text-2xl font-bold text-white">{totalPendaftaran}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <FileText size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Total Pendapatan</p>
              <h3 className="text-xl font-bold text-white">{formatRupiah(totalRevenue)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Award size={24} />
            </div>
          </div>
        </div>

        {/* Pending approvals section */}
        <div className="p-6 rounded-2xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <h2 className="text-lg font-bold text-white mb-4">Verifikasi Pendaftaran & Pembayaran</h2>
          <p className="text-sm mb-6" style={{ color: '#8B7DAB' }}>
            Verifikasi pendaftaran peserta yang masuk untuk menghasilkan Nomor BIB peserta secara otomatis.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                  <th className="pb-3 pl-2">ID Pendaftaran</th>
                  <th className="pb-3">Lomba</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Biaya</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                {pendingRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Semua pendaftaran sudah terverifikasi</td>
                  </tr>
                ) : (
                  pendingRegistrations.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 pl-2 font-mono text-xs">{p.id}</td>
                      <td className="py-4 font-semibold text-white">{p.lomba}</td>
                      <td className="py-4 text-[#8B7DAB]">{p.kategori}</td>
                      <td className="py-4">{formatRupiah(p.biaya)}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full font-medium">
                          Menunggu Verifikasi
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2 space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'Terverifikasi')}
                          className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition inline-flex items-center justify-center"
                          title="Setujui & Beri BIB"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'Ditolak')}
                          className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition inline-flex items-center justify-center"
                          title="Tolak Pendaftaran"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
