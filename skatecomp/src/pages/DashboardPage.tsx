import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getPendaftaran, getHasil, JADWAL_LIST } from '../lib/data';

export default function DashboardPage() {
  const { user } = useAuth();
  const pendaftaran = getPendaftaran(user?.id);
  const hasil = getHasil(user?.id);

  const statsItems = [
    { label: 'Pendaftaran\nLomba', value: pendaftaran.length, color: '#A78BFA' },
    { label: 'Pembayaran\nLunas', value: pendaftaran.filter(p => p.status !== 'Menunggu').length, color: '#A78BFA' },
    { label: 'Verifikasi\nTerverifikasi', value: pendaftaran.filter(p => p.status === 'Terverifikasi').length, color: '#A78BFA' },
    { label: 'Prestasi\nTerbaik', value: hasil.length > 0 ? `#${Math.min(...hasil.map(h => h.peringkat))}` : '-', color: '#A78BFA' },
  ];

  const jadwalTerdekat = JADWAL_LIST.slice(0, 3);

  return (
    <Layout title="Dashboard">
      <div className="max-w-5xl mx-auto">
        {/* Inner panel */}
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>

          {/* Welcome Banner */}
          <div className="rounded-xl p-4 mb-5 flex items-center justify-between flex-wrap gap-4" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg text-white flex-shrink-0" style={{ background: '#7C3AED' }}>
                {user?.foto ? <img src={user.foto} alt="avatar" className="w-full h-full object-cover" /> : user?.namaLengkap?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Halo, {user?.namaLengkap}! 👋</p>
                <p className="text-xs" style={{ color: '#8B7DAB' }}>Semangat! Raih podium terbaikmu!</p>
              </div>
            </div>
            {user?.bibNumber && (
              <div className="rounded-lg px-4 py-2 text-center" style={{ background: '#7C3AED22', border: '1px solid #7C3AED' }}>
                <p className="text-xs mb-1" style={{ color: '#A78BFA' }}>Nomor BIB</p>
                <p className="font-bold text-2xl text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{user.bibNumber}</p>
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
            {pendaftaran.length === 0 ? (
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
                    {pendaftaran.slice(0, 3).map(p => (
                      <tr key={p.id} style={{ borderTop: '1px solid #2D2440' }}>
                        <td className="py-2 font-medium" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace' }}>{p.id}</td>
                        <td className="py-2 text-white">{p.lomba}</td>
                        <td className="py-2 hidden sm:table-cell" style={{ color: '#8B7DAB' }}>{p.kategori}</td>
                        <td className="py-2 hidden md:table-cell" style={{ color: '#8B7DAB' }}>{p.tanggalDaftar}</td>
                        <td className="py-2">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
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
              {hasil.length === 0 ? (
                <p className="text-xs" style={{ color: '#8B7DAB' }}>Belum ada hasil perlombaan.</p>
              ) : (
                hasil.slice(0, 3).map(h => (
                  <div key={h.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #2D2440' }}>
                    <div>
                      <p className="text-xs font-medium text-white">{h.lomba}</p>
                      <p className="text-xs" style={{ color: '#8B7DAB' }}>{h.kategori}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace', fontSize: 13 }}>{h.nilaiAkhir}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#10B981', color: '#fff' }}>Selesai</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Jadwal Terdekat */}
            <div className="rounded-xl p-4" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Jadwal Terdekat</h3>
              {jadwalTerdekat.map(j => {
                const [tgl, bln] = j.tanggal.split(' ');
                return (
                  <div key={j.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #2D2440' }}>
                    <div className="rounded-lg p-2 text-center flex-shrink-0 w-12" style={{ background: '#7C3AED' }}>
                      <p className="text-xs font-bold text-white leading-none">{tgl}</p>
                      <p style={{ fontSize: 9, color: '#E9D5FF' }}>{bln}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{j.lomba}</p>
                      <p className="text-xs truncate" style={{ color: '#8B7DAB' }}>{j.kategori} · {j.jamMulai}:00 · {j.lokasi}</p>
                    </div>
                  </div>
                );
              })}
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
