import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

type Filter = 'Semua' | 'Sudah Dinilai' | 'Belum Dinilai';

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function HasilPerlombaanPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('Semua');
  const [hasilList, setHasilList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHasil = async () => {
      try {
        const res = await apiFetch('/api/penilaian');
        const data = await res.json();
        if (data.success) {
          const allHasil = data.data || data.penilaian || [];

          // Group assessments by id_jadwal (competition + category event)
          const groups: Record<string, any[]> = {};
          allHasil.forEach((h: any) => {
            const jadwalId = h.pendaftaran?.id_jadwal || 'unknown';
            if (!groups[jadwalId]) {
              groups[jadwalId] = [];
            }
            groups[jadwalId].push(h);
          });

          // Sort descending and rank within each group
          const ranked: any[] = [];
          Object.keys(groups).forEach(jadwalId => {
            const group = groups[jadwalId];
            group.sort((a: any, b: any) => Number(b.nilai_akhir || 0) - Number(a.nilai_akhir || 0));
            group.forEach((h: any, index: number) => {
              ranked.push({
                ...h,
                peringkat: index + 1,
                lomba: h.pendaftaran?.jadwal?.jenisLomba?.nama_lomba || '-',
                kategori: h.pendaftaran?.jadwal?.kategori?.nama_kategori || '-',
                status: h.nilai_akhir !== null ? 'Selesai' : 'Belum'
              });
            });
          });

          // If current user is peserta, filter to show only their own assessments
          const filteredHasil = user?.role === 'peserta'
            ? ranked.filter((h: any) => String(h.pendaftaran?.id_peserta) === String(user.id))
            : ranked;

          setHasilList(filteredHasil);
        } else {
          setError(data.message || 'Gagal mengambil hasil perlombaan');
        }
      } catch (err: any) {
        setError('Gagal menghubungi server');
      } finally {
        setLoading(false);
      }
    };
    fetchHasil();
  }, [user]);

  const filtered =
    filter === 'Sudah Dinilai'
      ? hasilList.filter(h => h.status === 'Selesai')
      : filter === 'Belum Dinilai'
      ? hasilList.filter(h => h.status !== 'Selesai')
      : hasilList;

  const filters: Filter[] = ['Semua', 'Sudah Dinilai', 'Belum Dinilai'];

  return (
    <Layout title="Hasil Perlombaan">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <h2 className="text-xl font-bold text-white mb-4">Hasil Perlombaan</h2>

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
                style={filter === f
                  ? { background: '#7C3AED', color: '#fff' }
                  : { background: '#1A1428', border: '1px solid #2D2440', color: '#8B7DAB' }
                }
              >
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="text-white text-center py-4">Memuat data...</p>}
          {error && <p className="text-red-500 text-center py-4">{error}</p>}

          {/* Table */}
          {!loading && !error && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D2440' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1A1428', borderBottom: '1px solid #2D2440' }}>
                  {['Lomba', 'Kategori', 'Nilai Akhir', 'Peringkat', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8" style={{ color: '#8B7DAB' }}>
                      Belum ada hasil perlombaan.
                    </td>
                  </tr>
                ) : filtered.map((h, i) => (
                  <motion.tr
                    key={h.id_penilaian || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid #2D2440' }}
                  >
                    <td className="px-4 py-3 text-white font-medium">{h.lomba}</td>
                    <td className="px-4 py-3" style={{ color: '#8B7DAB' }}>{h.kategori}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace' }}>
                      {h.nilai_akhir || '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {h.status === 'Selesai' ? `${RANK_MEDALS[h.peringkat] || ''} #${h.peringkat}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={h.status === 'Selesai' ? { background: '#10B98120', color: '#10B981' } : { background: '#F59E0B20', color: '#F59E0B' }}
                      >
                        {h.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
