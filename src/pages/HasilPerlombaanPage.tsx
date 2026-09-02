import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Trophy, Search, ArrowUpDown } from 'lucide-react';

type PesertaFilter = 'Semua' | 'Sudah Dinilai' | 'Belum Dinilai';

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface RekapHasil {
  id_pendaftaran: string;
  nomor_bib: string;
  nama_peserta: string;
  lomba: string;
  kategori: string;
  jumlah_juri_menilai: number;
  nilai_rata_rata: number | null;
}

export default function HasilPerlombaanPage() {
  const { user } = useAuth();
  const isJuriOrAdmin = user?.role === 'juri' || user?.role === 'admin';

  // State for Juri/Admin Leaderboard View
  const [rekapList, setRekapList] = useState<RekapHasil[]>([]);
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'default' | 'bib' | 'score'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for Peserta Own Results View
  const [pesertaFilter, setPesertaFilter] = useState<PesertaFilter>('Semua');
  const [pesertaHasilList, setPesertaHasilList] = useState<any[]>([]);
  const [sortRankOrder, setSortRankOrder] = useState<'asc' | 'desc' | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    if (isJuriOrAdmin) {
      // Fetch full leaderboard rekap for Juri / Admin
      const fetchRekap = async () => {
        try {
          setLoading(true);
          const res = await apiFetch('/api/admin/rekap-nilai');
          const data = await res.json();
          if (data.success) {
            setRekapList(data.data || []);
          } else {
            setError(data.message || 'Gagal memuat rekap nilai');
          }
        } catch (err: any) {
          setError('Gagal menghubungi server');
        } finally {
          setLoading(false);
        }
      };
      fetchRekap();
    } else {
      // Fetch own results for Peserta
      const fetchPesertaHasil = async () => {
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

          setPesertaHasilList(finalResults);
        } catch (err: any) {
          setError('Gagal menghubungi server');
        } finally {
          setLoading(false);
        }
      };
      fetchPesertaHasil();
    }
  }, [user, isJuriOrAdmin]);

  // Sorting helpers for Juri/Admin Leaderboard
  const handleSortBib = () => {
    if (sortField !== 'bib') {
      setSortField('bib');
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortField('default');
    }
  };

  const handleSortScore = () => {
    if (sortField !== 'score') {
      setSortField('score');
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortDirection('asc');
    } else {
      setSortField('default');
    }
  };

  const uniqueLomba = Array.from(new Set(rekapList.map(h => h.lomba))).filter(Boolean);
  const uniqueKategori = Array.from(new Set(rekapList.map(h => h.kategori))).filter(Boolean);

  const filteredRekap = rekapList.filter(h => {
    const matchLomba = filterLomba === 'Semua' || h.lomba === filterLomba;
    const matchKategori = filterKategori === 'Semua' || h.kategori === filterKategori;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      h.nama_peserta.toLowerCase().includes(searchLower) || 
      h.nomor_bib.toLowerCase().includes(searchLower) || 
      h.id_pendaftaran.toLowerCase().includes(searchLower);

    return matchLomba && matchKategori && matchSearch;
  });

  const sortedRekap = [...filteredRekap].sort((a, b) => {
    if (sortField === 'bib') {
      const bibA = parseInt(a.nomor_bib || '') || 0;
      const bibB = parseInt(b.nomor_bib || '') || 0;
      if (bibA !== 0 && bibB !== 0) {
        return sortDirection === 'asc' ? bibA - bibB : bibB - bibA;
      }
      return sortDirection === 'asc' 
        ? (a.nomor_bib || '').localeCompare(b.nomor_bib || '') 
        : (b.nomor_bib || '').localeCompare(a.nomor_bib || '');
    }
    if (sortField === 'score') {
      const scoreA = a.nilai_rata_rata ?? -1;
      const scoreB = b.nilai_rata_rata ?? -1;
      return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    }
    return 0;
  });

  // Sorting helpers for Peserta View
  const toggleSortRank = () => {
    if (sortRankOrder === null) setSortRankOrder('asc');
    else if (sortRankOrder === 'asc') setSortRankOrder('desc');
    else setSortRankOrder(null);
  };

  const filteredPeserta =
    pesertaFilter === 'Sudah Dinilai'
      ? pesertaHasilList.filter(h => h.status === 'Selesai')
      : pesertaFilter === 'Belum Dinilai'
      ? pesertaHasilList.filter(h => h.status !== 'Selesai')
      : pesertaHasilList;

  const sortedPeserta = [...filteredPeserta].sort((a, b) => {
    if (!sortRankOrder) return 0;
    const rankA = a.peringkat ?? 999;
    const rankB = b.peringkat ?? 999;
    return sortRankOrder === 'asc' ? rankA - rankB : rankB - rankA;
  });

  const pesertaFilters: PesertaFilter[] = ['Semua', 'Sudah Dinilai', 'Belum Dinilai'];

  return (
    <Layout title="Hasil Perlombaan">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          
          {isJuriOrAdmin ? (
            /* ─── JURI & ADMIN LEADERBOARD VIEW ─── */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Hasil & Papan Peringkat Perlombaan</h2>
                    <p className="text-sm" style={{ color: '#8B7DAB' }}>
                      Rekapitulasi nilai rata-rata peserta dari seluruh juri secara real-time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }} />
                  <input
                    type="text"
                    placeholder="Cari nama peserta / BIB..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                </div>

                <div>
                  <select
                    value={filterLomba}
                    onChange={e => setFilterLomba(e.target.value)}
                    className="w-full rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  >
                    <option value="Semua">Semua Jenis Lomba</option>
                    {uniqueLomba.map(lomba => (
                      <option key={lomba} value={lomba}>{lomba}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filterKategori}
                    onChange={e => setFilterKategori(e.target.value)}
                    className="w-full rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  >
                    <option value="Semua">Semua Kategori Usia</option>
                    {uniqueKategori.map(kat => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-white">Memuat data papan peringkat...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #2D2440' }}>
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr style={{ background: '#1A1428', borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                        <th className="py-3 pl-4 w-16">Rank</th>
                        <th 
                          className="py-3 w-28 cursor-pointer hover:text-white transition select-none"
                          onClick={handleSortBib}
                          title="Klik untuk mengurutkan No. BIB"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>No. BIB</span>
                            <ArrowUpDown size={14} className={sortField === 'bib' ? 'text-purple-400' : 'text-gray-500'} />
                          </div>
                        </th>
                        <th className="py-3 w-44">Nama Peserta</th>
                        <th className="py-3 w-36">Cabang Lomba</th>
                        <th className="py-3 w-36">Kategori</th>
                        <th 
                          className="py-3 text-right pr-4 w-40 cursor-pointer hover:text-white transition select-none"
                          onClick={handleSortScore}
                          title="Klik untuk mengurutkan nilai rata-rata"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Nilai Rata-rata</span>
                            <ArrowUpDown size={14} className={sortField === 'score' ? 'text-purple-400' : 'text-gray-500'} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                      {sortedRekap.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            {rekapList.length === 0 ? 'Belum ada data penilaian masuk' : 'Tidak ada hasil yang cocok dengan filter'}
                          </td>
                        </tr>
                      ) : (
                        sortedRekap.map((h, index) => {
                          const rank = index + 1;
                          return (
                            <tr key={h.id_pendaftaran} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 pl-4 font-bold">
                                {rank === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold" title="Juara 1">🥇</span>}
                                {rank === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-black text-xs font-bold" title="Juara 2">🥈</span>}
                                {rank === 3 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-black text-xs font-bold" title="Juara 3">🥉</span>}
                                {rank > 3 && <span className="pl-1.5 text-xs text-[#8B7DAB]">{rank}</span>}
                              </td>
                              <td className="py-3.5 font-mono text-xs text-[#A78BFA]">{h.nomor_bib}</td>
                              <td className="py-3.5 font-semibold text-white truncate" title={h.nama_peserta}>{h.nama_peserta}</td>
                              <td className="py-3.5 text-[#8B7DAB] truncate" title={h.lomba}>{h.lomba}</td>
                              <td className="py-3.5 text-[#8B7DAB] truncate" title={h.kategori}>{h.kategori}</td>
                              <td className="py-3.5 pr-4 text-right font-bold text-[#A78BFA]" style={{ fontFamily: 'Space Mono, monospace' }}>
                                {h.nilai_rata_rata !== null ? h.nilai_rata_rata : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* ─── PESERTA OWN RESULTS VIEW ─── */
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Hasil Perlombaan Saya</h2>

              <div className="flex flex-wrap gap-2 mb-5">
                {pesertaFilters.map(f => (
                  <button
                    key={f}
                    onClick={() => setPesertaFilter(f)}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
                    style={pesertaFilter === f
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
                      {sortedPeserta.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8" style={{ color: '#8B7DAB' }}>
                            Belum ada hasil perlombaan yang diikuti.
                          </td>
                        </tr>
                      ) : sortedPeserta.map((h, i) => (
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
          )}

        </div>
      </div>
    </Layout>
  );
}
