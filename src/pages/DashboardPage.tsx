import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

interface Pendaftaran {
  id_pendaftaran: string | number;
  jadwal: {
    jenisLomba: { nama_lomba: string };
    kategori: { nama_kategori: string };
  };
  tanggal_daftar: string;
  status_pendaftaran: string;
}

interface Jadwal {
  id_jadwal: string | number;
  tanggal_lomba: string;
  jenisLomba: { nama_lomba: string };
  kategori: { nama_kategori: string };
  jam_mulai: string;
  lokasi: string;
}

interface Hasil {
  id_penilaian: string | number;
  nilai_akhir: number | string;
  pendaftaran: {
    jadwal: {
      jenisLomba: { nama_lomba: string };
      kategori: { nama_kategori: string };
    };
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [hasilList, setHasilList] = useState<Hasil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [pendaftaranRes, jadwalRes, hasilRes] = await Promise.all([
          apiFetch('/api/pendaftaran'),
          apiFetch('/api/lomba/jadwal'),
          apiFetch('/api/penilaian')
        ]);
        const pendaftaranData = await pendaftaranRes.json();
        const jadwalData = await jadwalRes.json();
        const hasilData = await hasilRes.json();
        setPendaftaranList(pendaftaranData?.data || []);
        setJadwalList(jadwalData?.data || []);
        setHasilList(hasilData?.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsItems = [
    { label: 'Pendaftaran\nLomba', value: pendaftaranList.length, color: '#A78BFA' },
    { label: 'Pembayaran\nLunas', value: pendaftaranList.filter(p => p.status_pendaftaran !== 'Menunggu').length, color: '#A78BFA' },
    { label: 'Verifikasi\nTerverifikasi', value: pendaftaranList.filter(p => p.status_pendaftaran === 'Terverifikasi').length, color: '#A78BFA' },
    { label: 'Prestasi\nTerbaik', value: hasilList.length > 0 ? 'Ada' : '-', color: '#A78BFA' },
  ];

  const jadwalTerdekat = jadwalList.slice(0, 3);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64 text-white">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-5xl mx-auto">
        {/* Inner panel */}
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>

          {/* Welcome Banner */}
          <div className="rounded-xl p-4 mb-5 flex items-center justify-between flex-wrap gap-4" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg text-white flex-shrink-0" style={{ background: '#7C3AED' }}>
                {user?.foto ? <img src={user.foto} alt="avatar" className="w-full h-full object-cover" /> : user?.nama?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Halo, {user?.nama}! 👋</p>
                <p className="text-xs" style={{ color: '#8B7DAB' }}>Semangat! Raih podium terbaikmu!</p>
              </div>
            </div>
            {user?.nomor_bib && (
              <div className="rounded-lg px-4 py-2 text-center" style={{ background: '#7C3AED22', border: '1px solid #7C3AED' }}>
                <p className="text-xs mb-1" style={{ color: '#A78BFA' }}>Nomor BIB</p>
                <p className="font-bold text-2xl text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{user.nomor_bib}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {statsItems.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl p-4 text-center"
                style={{ background: '#1A1428', border: '1px solid #2D2440' }}
              >
                <p className="text-2xl font-bold mb-1" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace' }}>{s.value}</p>
                <p className="text-xs leading-tight whitespace-pre-line" style={{ color: '#8B7DAB' }}>
                  {s.label.split('\n')[0]}
                </p>
                <p className="text-xs" style={{ color: '#6B5A8A' }}>{s.label.split('\n')[1]}</p>
              </motion.div>
            ))}
          </div>

          {/* Pendaftaran Terakhir */}
          <div className="rounded-xl p-4 mb-4" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Pendaftaran Terakhir</h3>
              <Link to="/riwayat-daftar" className="text-xs font-medium hover:underline" style={{ color: '#A78BFA' }}>
                Lihat Semua
              </Link>
            </div>
            {pendaftaranList.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: '#8B7DAB' }}>Belum ada pendaftaran.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ color: '#8B7DAB' }}>
                      <th className="text-left pb-2 font-medium">ID Pendaftaran</th>
                      <th className="text-left pb-2 font-medium">Lomba</th>
                      <th className="text-left pb-2 font-medium hidden sm:table-cell">Kategori</th>
                      <th className="text-left pb-2 font-medium hidden md:table-cell">Tanggal Daftar</th>
                      <th className="text-left pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendaftaranList.slice(0, 3).map(p => {
                      const tglDaftar = new Date(p.tanggal_daftar).toLocaleDateString('id-ID');
                      return (
                        <tr key={p.id_pendaftaran} style={{ borderTop: '1px solid #2D2440' }}>
                          <td className="py-2 font-medium" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace' }}>{p.id_pendaftaran}</td>
                          <td className="py-2 text-white">{p.jadwal?.jenisLomba?.nama_lomba}</td>
                          <td className="py-2 hidden sm:table-cell" style={{ color: '#8B7DAB' }}>{p.jadwal?.kategori?.nama_kategori}</td>
                          <td className="py-2 hidden md:table-cell" style={{ color: '#8B7DAB' }}>{tglDaftar}</td>
                          <td className="py-2">
                            <StatusBadge status={p.status_pendaftaran} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hasil Terbaru */}
            <div className="rounded-xl p-4" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Hasil Perlombaan Terbaru</h3>
              {hasilList.length === 0 ? (
                <p className="text-xs" style={{ color: '#8B7DAB' }}>Belum ada hasil perlombaan.</p>
              ) : (
                hasilList.slice(0, 3).map(h => (
                  <div key={h.id_penilaian} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #2D2440' }}>
                    <div>
                      <p className="text-xs font-medium text-white">{h.pendaftaran?.jadwal?.jenisLomba?.nama_lomba}</p>
                      <p className="text-xs" style={{ color: '#8B7DAB' }}>{h.pendaftaran?.jadwal?.kategori?.nama_kategori}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace', fontSize: 13 }}>{h.nilai_akhir}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#10B981', color: '#fff' }}>Selesai</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Jadwal Terdekat */}
            <div className="rounded-xl p-4" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Jadwal Terdekat</h3>
              {jadwalTerdekat.length === 0 ? (
                <p className="text-xs" style={{ color: '#8B7DAB' }}>Belum ada jadwal terdekat.</p>
              ) : (
                jadwalTerdekat.map(j => {
                  const dateObj = new Date(j.tanggal_lomba);
                  const tgl = dateObj.getDate();
                  const bln = dateObj.toLocaleString('id-ID', { month: 'short' });
                  return (
                    <div key={j.id_jadwal} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #2D2440' }}>
                      <div className="rounded-lg p-2 text-center flex-shrink-0 w-12" style={{ background: '#7C3AED' }}>
                        <p className="text-xs font-bold text-white leading-none">{tgl}</p>
                        <p style={{ fontSize: 9, color: '#E9D5FF' }}>{bln}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{j.jenisLomba?.nama_lomba}</p>
                        <p className="text-xs truncate" style={{ color: '#8B7DAB' }}>{j.kategori?.nama_kategori} · {j.jam_mulai} · {j.lokasi}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Terverifikasi: { bg: '#10B98120', color: '#10B981' },
    Menunggu: { bg: '#F59E0B20', color: '#F59E0B' },
    Ditolak: { bg: '#EF444420', color: '#EF4444' },
  };
  const s = map[status] || { bg: '#2D2440', color: '#8B7DAB' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
