import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { formatRupiah } from '../lib/data';
import { apiFetch } from '../lib/api';
import { Users, FileText, Check, X, ShieldAlert, Award } from 'lucide-react';

interface Pendaftaran {
  id_pendaftaran: string;
  jadwal: {
    jenisLomba: { nama_lomba: string; biaya_pendaftaran: number };
    kategori: { nama_kategori: string };
  };
  tanggal_daftar: string;
  status_pendaftaran: string;
  peserta: {
    nama_peserta: string;
    nomor_bib?: string;
  };
}

export default function AdminDashboardPage() {
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
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

  const handleUpdateStatus = async (id: string, newStatus: 'Terverifikasi' | 'Ditolak') => {
    try {
      const res = await apiFetch(`/api/pendaftaran/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_pendaftaran: newStatus })
      });
      const data = await res.json();
      if (data.success) {
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
            Verifikasi pendaftaran peserta yang masuk untuk menghasilkan Nomor BIB peserta secara otomatis.
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
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                {pendingRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Semua pendaftaran sudah terverifikasi</td>
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
                          Menunggu Verifikasi
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2 space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(p.id_pendaftaran, 'Terverifikasi')}
                          className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition inline-flex items-center justify-center"
                          title="Setujui & Beri BIB"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(p.id_pendaftaran, 'Ditolak')}
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
