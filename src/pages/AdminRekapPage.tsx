import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { Trophy, Search, ArrowUpDown } from 'lucide-react';

interface Hasil {
  id_pendaftaran: string;
  nomor_bib: string;
  nama_peserta: string;
  lomba: string;
  kategori: string;
  jumlah_juri_menilai: number;
  nilai_rata_rata: number | null;
}

export default function AdminRekapPage() {
  const [hasilList, setHasilList] = useState<Hasil[]>([]);
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'default' | 'bib' | 'score'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRekap = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/admin/rekap-nilai');
        const data = await res.json();
        if (data.success) {
          // API now returns one row per pendaftaran with averaged score
          setHasilList(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRekap();
  }, []);

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

  const sortKategoriList = (list: string[]) => {
    const getAgeOrder = (str: string) => {
      const s = str.toUpperCase();
      if (s.includes('U9')) return 1;
      if (s.includes('U12')) return 2;
      if (s.includes('YOUTH')) return 3;
      if (s.includes('JUNIOR')) return 4;
      if (s.includes('SENIOR')) return 5;
      return 6;
    };

    const getGenderOrder = (str: string) => {
      const s = str.toUpperCase();
      if (s.includes('WOMEN') || s.includes('PEREMPUAN')) return 2;
      if (s.includes('MEN') || s.includes('LAKI-LAKI') || s.includes('PRIA')) return 1;
      return 3;
    };

    return [...list].sort((a, b) => {
      const ageA = getAgeOrder(a);
      const ageB = getAgeOrder(b);
      if (ageA !== ageB) return ageA - ageB;

      const genderA = getGenderOrder(a);
      const genderB = getGenderOrder(b);
      if (genderA !== genderB) return genderA - genderB;

      return a.localeCompare(b);
    });
  };

  const uniqueLomba = Array.from(new Set(hasilList.map(h => h.lomba))).filter(Boolean);
  const rawKategori = Array.from(new Set(hasilList.map(h => h.kategori))).filter(Boolean);
  const uniqueKategori = sortKategoriList(rawKategori);

  const filteredHasil = hasilList.filter(h => {
    const matchLomba = filterLomba === 'Semua' || h.lomba === filterLomba;
    const matchKategori = filterKategori === 'Semua' || h.kategori === filterKategori;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      h.nama_peserta.toLowerCase().includes(searchLower) || 
      h.nomor_bib.toLowerCase().includes(searchLower) || 
      h.id_pendaftaran.toLowerCase().includes(searchLower);

    return matchLomba && matchKategori && matchSearch;
  });

  const sortedHasil = [...filteredHasil].sort((a, b) => {
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
    return 0; // Default order as fetched
  });

  return (
    <Layout title="Rekap Nilai & Juara">
      <div className="p-6 rounded-2xl space-y-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Papan Peringkat Perlombaan</h2>
              <p className="text-sm" style={{ color: '#8B7DAB' }}>
                Rekapitulasi nilai rata-rata dari semua juri, satu baris per peserta per cabang lomba.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Search Bar */}
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

          {/* Filter Jenis Lomba */}
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

          {/* Filter Kategori Usia */}
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                  <th className="pb-3 pl-2 w-16">Rank</th>
                  <th 
                    className="pb-3 w-28 cursor-pointer hover:text-white transition select-none"
                    onClick={handleSortBib}
                    title="Klik untuk mengurutkan No. BIB"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>No. BIB</span>
                      <ArrowUpDown size={14} className={sortField === 'bib' ? 'text-purple-400' : 'text-gray-500'} />
                    </div>
                  </th>
                  <th className="pb-3 w-44">Nama Peserta</th>
                  <th className="pb-3 w-36">Cabang Lomba</th>
                  <th className="pb-3 w-36">Kategori</th>
                  <th 
                    className="pb-3 text-right pr-2 w-40 cursor-pointer hover:text-white transition select-none"
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
                {sortedHasil.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {hasilList.length === 0 ? 'Belum ada data penilaian masuk' : 'Tidak ada hasil yang cocok dengan filter / pencarian'}
                    </td>
                  </tr>
                ) : (
                  sortedHasil.map((h, index) => {
                    const rank = index + 1;
                    const isScoreAscending = sortField === 'score' && sortDirection === 'asc';
                    const showMedal = !isScoreAscending;
                    return (
                      <tr key={h.id_pendaftaran} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 pl-2 font-bold">
                          {showMedal && rank === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold" title="Juara 1">🥇</span>}
                          {showMedal && rank === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-black text-xs font-bold" title="Juara 2">🥈</span>}
                          {showMedal && rank === 3 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-black text-xs font-bold" title="Juara 3">🥉</span>}
                          {(!showMedal || rank > 3) && <span className="pl-1.5 text-xs text-[#8B7DAB]">{rank}</span>}
                        </td>
                        <td className="py-4 font-mono text-xs">{h.nomor_bib}</td>
                        <td className="py-4 font-semibold text-white truncate" title={h.nama_peserta}>{h.nama_peserta}</td>
                        <td className="py-4 text-[#8B7DAB] truncate" title={h.lomba}>{h.lomba}</td>
                        <td className="py-4 text-xs text-[#8B7DAB] truncate" title={h.kategori}>{h.kategori}</td>
                        <td className="py-4 font-bold text-purple-400 text-right pr-2 text-base">
                          {h.nilai_rata_rata !== null ? h.nilai_rata_rata : <span className="text-gray-500 text-xs font-normal">Belum dinilai</span>}
                          {h.jumlah_juri_menilai > 0 && (
                            <span className="block text-[10px] font-normal text-purple-300/60">({h.jumlah_juri_menilai} juri)</span>
                          )}
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
    </Layout>
  );
}
