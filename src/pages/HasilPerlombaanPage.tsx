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

        const allPendaftaran = pendaftaranData?.data || [];
        const allPenilaian = penilaianData?.data || penilaianData?.penilaian || [];

        // 1. Group scores by id_pendaftaran to calculate average score (ROUND(AVG(pn.nilai_akhir), 2))
        const pendaftaranScoresMap: Record<string, number[]> = {};
        allPenilaian.forEach((pn: any) => {
          const idPf = pn.id_pendaftaran || pn.pendaftaran?.id_pendaftaran;
          if (idPf && pn.nilai_akhir != null) {
            if (!pendaftaranScoresMap[idPf]) pendaftaranScoresMap[idPf] = [];
            pendaftaranScoresMap[idPf].push(Number(pn.nilai_akhir));
          }
        });

        // 2. Map all registrations in system with calculated average score
        const mappedPendaftaran = allPendaftaran.map((pf: any) => {
          const idPf = pf.id_pendaftaran;
          const scores = pendaftaranScoresMap[idPf] || [];
          const jumlahJuri = scores.length;
          const avgScore = jumlahJuri > 0 
            ? Number((scores.reduce((a, b) => a + b, 0) / jumlahJuri).toFixed(2))
            : null;

          return {
            id_pendaftaran: idPf,
            id_peserta: String(pf.id_peserta || pf.peserta?.id_peserta),
            id_jadwal: pf.id_jadwal || pf.jadwal?.id_jadwal || 'unknown',
            lomba: pf.jadwal?.jenisLomba?.nama_lomba || '-',
            kategori: pf.jadwal?.kategori?.nama_kategori || '-',
            tanggal_lomba: pf.jadwal?.tanggal_lomba || '',
            nilai_rata_rata: avgScore,
            jumlah_juri_menilai: jumlahJuri,
          };
        });

        // 3. Group registrations by id_jadwal (event) to calculate overall rank
        const eventGroups: Record<string, typeof mappedPendaftaran> = {};
        mappedPendaftaran.forEach((item: any) => {
          if (!eventGroups[item.id_jadwal]) eventGroups[item.id_jadwal] = [];
          eventGroups[item.id_jadwal].push(item);
        });

        const ranksMap: Record<string, { peringkat: number | null; status: string }> = {};

        Object.values(eventGroups).forEach((group: any[]) => {
          // Sort items with scores descending
          const graded = group.filter((i: any) => i.nilai_rata_rata !== null);
          graded.sort((a: any, b: any) => (b.nilai_rata_rata || 0) - (a.nilai_rata_rata || 0));

          graded.forEach((item: any, idx: number) => {
            ranksMap[item.id_pendaftaran] = {
              peringkat: idx + 1,
              status: 'Selesai'
            };
          });

          group.filter((i: any) => i.nilai_rata_rata === null).forEach((item: any) => {
            ranksMap[item.id_pendaftaran] = {
              peringkat: null,
              status: 'Belum'
            };
          });
        });

        // 4. Filter strictly for logged-in user's registrations ONLY
        const userRegistrations = mappedPendaftaran.filter((i: any) => i.id_peserta === String(user.id));
        const finalResults = userRegistrations.map((item: any) => {
          const rankInfo = ranksMap[item.id_pendaftaran] || { peringkat: null, status: 'Belum' };
          return {
            ...item,
            peringkat: rankInfo.peringkat,
            status: rankInfo.status
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
                  {['Lomba', 'Kategori', 'Nilai Rata-rata', 'Peringkat', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8" style={{ color: '#8B7DAB' }}>
                      Belum ada hasil perlombaan yang diikuti.
                    </td>
                  </tr>
                ) : filtered.map((h, i) => (
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
                      {h.jumlah_juri_menilai > 0 && (
                        <span className="block text-[10px] font-normal text-purple-300/70">
                          ({h.jumlah_juri_menilai} juri)
                        </span>
                      )}
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
