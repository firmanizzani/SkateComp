import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { formatRupiah } from '../lib/data';
import { apiFetch } from '../lib/api';
import { Users, FileText, Check, X, ShieldAlert, Award, Eye, Image } from 'lucide-react';

interface Pendaftaran {
  id_pendaftaran: string;
  jadwal: {
    jenisLomba: { nama_lomba: string; biaya_pendaftaran: number };
    kategori: { nama_kategori: string };
  };
  tanggal_daftar: string;
  status_pendaftaran: string;
  pembayaran?: {
    id_pembayaran: string;
    status_pembayaran: string;
    nominal: number;
    bukti_pembayaran?: string;
  };
  peserta: {
    nama_peserta: string;
    nomor_bib?: string;
  };
}

export default function AdminDashboardPage() {
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [selectedItem, setSelectedItem] = useState<Pendaftaran | null>(null);
  const [stats, setStats] = useState({
    totalPeserta: 0,
    totalJuri: 0,
    totalPendaftaran: 0,
    pendaftaranMenunggu: 0,
    penilaianSelesai: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, pendaftaranRes] = await Promise.all([
        apiFetch('/api/admin/statistik'),
        apiFetch('/api/pendaftaran')
      ]);
      const statsData = await statsRes.json();
      const pendaftaranData = await pendaftaranRes.json();
      if (statsData.success) setStats(statsData.data);
      if (pendaftaranData.success) setPendaftaranList(pendaftaranData.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingRegistrations = pendaftaranList.filter(p => p.status_pendaftaran === 'Menunggu');

  const handleUpdateStatus = async (id: string, newStatusPendaftaran: 'Terverifikasi' | 'Ditolak', newStatusPembayaran?: 'Lunas' | 'Ditolak') => {
    try {
      const res = await apiFetch(`/api/pendaftaran/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status_pendaftaran: newStatusPendaftaran,
          status_pembayaran: newStatusPembayaran || (newStatusPendaftaran === 'Terverifikasi' ? 'Lunas' : 'Ditolak')
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedItem(null);
        fetchData();
      } else {
        alert(data.message || 'Gagal mengubah status pendaftaran');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard Admin">
        <div className="flex justify-center items-center h-64 text-white">Loading data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard Admin">
        <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Admin">
      <div className="space-y-6">
        
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Total Peserta</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalPeserta}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Users size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Total Juri</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalJuri}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Pendaftaran</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalPendaftaran}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <FileText size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#8B7DAB' }}>Total Pendapatan</p>
              <h3 className="text-xl font-bold text-white">{formatRupiah(stats.totalRevenue)}</h3>
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
            Verifikasi pendaftaran dan pembayaran peserta yang masuk untuk menghasilkan Nomor BIB peserta secara otomatis.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                  <th className="pb-3 pl-2">ID Pendaftaran</th>
                  <th className="pb-3">Peserta</th>
                  <th className="pb-3">Lomba</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Biaya</th>
                  <th className="pb-3">Status Pendaftaran</th>
                  <th className="pb-3">Status Pembayaran</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                {pendingRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">Semua pendaftaran sudah terverifikasi</td>
                  </tr>
                ) : (
                  pendingRegistrations.map((p) => (
                    <tr key={p.id_pendaftaran} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 pl-2 font-mono text-xs text-purple-400">{p.id_pendaftaran}</td>
                      <td className="py-4 text-[#8B7DAB]">{p.peserta?.nama_peserta}</td>
                      <td className="py-4 font-semibold text-white">{p.jadwal?.jenisLomba?.nama_lomba}</td>
                      <td className="py-4 text-[#8B7DAB]">{p.jadwal?.kategori?.nama_kategori}</td>
                      <td className="py-4">{formatRupiah(Number(p.jadwal?.jenisLomba?.biaya_pendaftaran))}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full font-medium">
                          {p.status_pendaftaran}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                          p.pembayaran?.status_pembayaran === 'Lunas' 
                            ? 'text-green-400 bg-green-500/10' 
                            : p.pembayaran?.status_pembayaran === 'Ditolak'
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-yellow-400 bg-yellow-500/10'
                        }`}>
                          {p.pembayaran?.status_pembayaran || 'Menunggu'}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2 space-x-2">
                        <button
                          onClick={() => setSelectedItem(p)}
                          className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white transition inline-flex items-center justify-center border border-purple-500/30"
                          title="Lihat Detail & Bukti Pembayaran"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id_pendaftaran, 'Terverifikasi', 'Lunas')}
                          className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition inline-flex items-center justify-center"
                          title="Setujui (Lunas & Beri BIB)"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id_pendaftaran, 'Ditolak', 'Ditolak')}
                          className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition inline-flex items-center justify-center"
                          title="Tolak Pendaftaran & Pembayaran"
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

      {/* Modal Detail & Bukti Pembayaran */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setSelectedItem(null)}>
          <div className="rounded-2xl p-6 w-full max-w-lg" style={{ background: '#1A1428', border: '1px solid #2D2440' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Detail & Bukti Pembayaran</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-sm text-[#F1EEF8]">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">ID Pendaftaran</span>
                <span className="font-mono text-purple-400">{selectedItem.id_pendaftaran}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Nama Peserta</span>
                <span className="font-semibold text-white">{selectedItem.peserta?.nama_peserta}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Lomba & Kategori</span>
                <span>{selectedItem.jadwal?.jenisLomba?.nama_lomba} ({selectedItem.jadwal?.kategori?.nama_kategori})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Nominal Biaya</span>
                <span className="font-bold text-yellow-400">{formatRupiah(Number(selectedItem.jadwal?.jenisLomba?.biaya_pendaftaran))}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Status Pendaftaran</span>
                <span className="text-yellow-400 font-medium">{selectedItem.status_pendaftaran}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Status Pembayaran</span>
                <span className="text-yellow-400 font-medium">{selectedItem.pembayaran?.status_pembayaran || 'Menunggu'}</span>
              </div>

              {/* Preview Bukti Pembayaran */}
              <div className="mt-4 pt-2">
                <p className="text-xs text-gray-400 mb-2 font-semibold">Bukti Pembayaran (File Transaksi):</p>
                <div className="p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center bg-black/40 gap-2 overflow-hidden">
                  {selectedItem.pembayaran?.bukti_pembayaran &&
                  (selectedItem.pembayaran.bukti_pembayaran.startsWith('data:image/') ||
                   selectedItem.pembayaran.bukti_pembayaran.startsWith('http')) ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <img
                        src={selectedItem.pembayaran.bukti_pembayaran}
                        alt="Bukti Pembayaran"
                        className="max-h-64 rounded-lg object-contain border border-white/10 w-full bg-black/60"
                      />
                      <a
                        href={selectedItem.pembayaran.bukti_pembayaran}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:underline"
                      >
                        Buka Gambar di Tab Baru ↗
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Image size={36} className="text-purple-400" />
                      <span className="text-xs font-mono text-gray-300">
                        {selectedItem.pembayaran?.bukti_pembayaran || 'bukti_transfer.png'}
                      </span>
                      <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                        Telah diunggah oleh peserta
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-3 border-t border-white/10">
              <button
                onClick={() => handleUpdateStatus(selectedItem.id_pendaftaran, 'Terverifikasi', 'Lunas')}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition"
              >
                Setujui & Tandai Lunas
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedItem.id_pendaftaran, 'Ditolak', 'Ditolak')}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
              >
                Tolak Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
