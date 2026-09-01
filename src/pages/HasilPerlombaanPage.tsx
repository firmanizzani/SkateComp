import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { ArrowUpDown } from 'lucide-react';

type Filter = 'Semua' | 'Sudah Dinilai' | 'Belum Dinilai';

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function HasilPerlombaanPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('Semua');
  const [hasilList, setHasilList] = useState<any[]>([]);
  const [sortRankOrder, setSortRankOrder] = useState<'asc' | 'desc' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchHasil = async () => {
      try {
        setLoading(true);
        const [pendaftaranRes, penilaianRes] = await Promise.all([
          apiFetch('/api/pendaftaran'),
          apiFetch('/api/penilaian')
        ]);

        const pendaftaranData = await pendaftaranRes.json();
        const penilaianData = await penilaianRes.json();

        const userPendaftaran = pendaftaranData?.data || [];
        const allPenilaian = penilaianData?.data || penilaianData?.penilaian || [];

        // 1. Group all scores in system by id_pendaftaran to calculate average score per registration
        const registrationMap: Record<string, {
          id_pendaftaran: string;
          id_peserta: string;
          id_jadwal: string;
          lomba: string;
          kategori: string;
          scores: number[];
        }> = {};

        allPenilaian.forEach((pn: any) => {
          const idPf = pn.id_pendaftaran || pn.pendaftaran?.id_pendaftaran;
          if (!idPf) return;

          if (!registrationMap[idPf]) {
            registrationMap[idPf] = {
              id_pendaftaran: idPf,
              id_peserta: String(pn.pendaftaran?.id_peserta || ''),
              id_jadwal: String(pn.pendaftaran?.id_jadwal || pn.pendaftaran?.jadwal?.id_jadwal || 'unknown'),
              lomba: pn.pendaftaran?.jadwal?.jenisLomba?.nama_lomba || '-',
              kategori: pn.pendaftaran?.jadwal?.kategori?.nama_kategori || '-',
              scores: []
            };
          }

          if (pn.nilai_akhir != null) {
            registrationMap[idPf].scores.push(Number(pn.nilai_akhir));
          }
        });

        // 2. Calculate average score for each scored registration in system
        const regResults: Array<{
          id_pendaftaran: string;
          id_peserta: string;
          id_jadwal: string;
          lomba: string;
          kategori: string;
          nilai_rata_rata: number;
        }> = [];

        Object.values(registrationMap).forEach(item => {
          if (item.scores.length > 0) {
            const sum = item.scores.reduce((a, b) => a + b, 0);
            const avg = Number((sum / item.scores.length).toFixed(2));
            regResults.push({
              id_pendaftaran: item.id_pendaftaran,
              id_peserta: item.id_peserta,
              id_jadwal: item.id_jadwal,
              lomba: item.lomba,
              kategori: item.kategori,
              nilai_rata_rata: avg,
            });
          }
        });

        // 3. Group by event (id_jadwal or lomba + kategori) to calculate OVERALL RANKING across ALL participants
        const eventGroups: Record<string, typeof regResults> = {};
        regResults.forEach(item => {
          const eventKey = item.id_jadwal !== 'unknown' ? item.id_jadwal : `${item.lomba}|${item.kategori}`;
          if (!eventGroups[eventKey]) eventGroups[eventKey] = [];
          eventGroups[eventKey].push(item);
        });

        const ranksMap: Record<string, { peringkat: number; nilai_rata_rata: number }> = {};
        Object.values(eventGroups).forEach(group => {
          group.sort((a, b) => b.nilai_rata_rata - a.nilai_rata_rata);
          group.forEach((item, index) => {
            ranksMap[item.id_pendaftaran] = {
              peringkat: index + 1,
              nilai_rata_rata: item.nilai_rata_rata
            };
          });
        });

        // 4. Map user's own registrations with their true average score and true rank
        const finalResults = userPendaftaran.map((pf: any) => {
          const idPf = pf.id_pendaftaran;
          const rankInfo = ranksMap[idPf];
          return {
            id_pendaftaran: idPf,
            lomba: pf.jadwal?.jenisLomba?.nama_lomba || '-',
            kategori: pf.jadwal?.kategori?.nama_kategori || '-',
            tanggal_lomba: pf.jadwal?.tanggal_lomba || '',
            nilai_rata_rata: rankInfo ? rankInfo.nilai_rata_rata : null,
            peringkat: rankInfo ? rankInfo.peringkat : null,
            status: rankInfo ? 'Selesai' : 'Belum'
          };
        });

        setHasilList(finalResults);
      } catch (err: any) {
        setError('Gagal menghubungi server');
      } finally {
        setLoading(false);
      }
    };
    fetchHasil();
  }, [user]);

  const toggleSortRank = () => {
    if (sortRankOrder === null) setSortRankOrder('asc'); // #1 -> #2 -> #3
    else if (sortRankOrder === 'asc') setSortRankOrder('desc'); // #3 -> #2 -> #1
    else setSortRankOrder(null);
  };

  const filtered =
    filter === 'Sudah Dinilai'
      ? hasilList.filter(h => h.status === 'Selesai')
      : filter === 'Belum Dinilai'
      ? hasilList.filter(h => h.status !== 'Selesai')
      : hasilList;

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (!sortRankOrder) return 0;
    const rankA = a.peringkat ?? 999;
    const rankB = b.peringkat ?? 999;
    return sortRankOrder === 'asc' ? rankA - rankB : rankB - rankA;
  });

  const filters: Filter[] = ['Semua', 'Sudah Dinilai', 'Belum Dinilai'];

  return (
    <Layout title="Hasil Perlombaan">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <h2 className="text-xl font-bold text-white mb-4">Hasil Perlombaan Saya</h2>

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
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>Lomba</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>Kategori</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>Nilai Rata-rata</th>
                  <th 
                    className="text-left px-4 py-3 font-medium cursor-pointer hover:text-white transition select-none"
                    onClick={toggleSortRank}
                    style={{ color: '#8B7DAB' }}
                    title="Klik untuk mengurutkan peringkat"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Peringkat</span>
                      <ArrowUpDown size={14} className={sortRankOrder ? 'text-purple-400' : 'text-gray-500'} />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8" style={{ color: '#8B7DAB' }}>
                      Belum ada hasil perlombaan yang diikuti.
                    </td>
                  </tr>
                ) : sortedFiltered.map((h, i) => (
                  <motion.tr
                    key={h.id_pendaftaran || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid #2D2440' }}
                  >
                    <td className="px-4 py-3 text-white font-medium">{h.lomba}</td>
                    <td className="px-4 py-3" style={{ color: '#8B7DAB' }}>{h.kategori}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace' }}>
                      {h.nilai_rata_rata !== null ? h.nilai_rata_rata : '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {h.status === 'Selesai' && h.peringkat ? `${RANK_MEDALS[h.peringkat] || ''} #${h.peringkat}` : '-'}
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
