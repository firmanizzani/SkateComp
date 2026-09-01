import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Pendaftaran } from '../types';
import { Trophy, CheckCircle, Clock, Search, X, ArrowUpDown } from 'lucide-react';

interface ExtendedPendaftaran extends Pendaftaran {
  namaPeserta?: string;
}

export default function JuriDashboardPage() {
  const { user } = useAuth();
  const [pendaftaranList, setPendaftaranList] = useState<ExtendedPendaftaran[]>([]);
  const [hasilList, setHasilList] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<ExtendedPendaftaran | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [sortScoreOrder, setSortScoreOrder] = useState<'asc' | 'desc' | null>(null);
  
  // Score form inputs
  const [aspek1, setAspek1] = useState('');
  const [aspek2, setAspek2] = useState('');
  const [aspek3, setAspek3] = useState('');
  const [catatan, setCatatan] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch pendaftaran
      const resPendaftaran = await apiFetch('/api/pendaftaran');
      const dataPendaftaran = await resPendaftaran.json();
      if (!dataPendaftaran.success) {
        setError(dataPendaftaran.message || 'Gagal memuat data pendaftaran.');
        return;
      }

      // Map registrations
      const mappedList: ExtendedPendaftaran[] = (dataPendaftaran.data || []).map((p: any) => ({
        id: p.id_pendaftaran,
        userId: p.id_peserta,
        namaPeserta: p.peserta?.nama_peserta || 'Peserta',
        lomba: p.jadwal?.jenisLomba?.nama_lomba || '',
        kategori: p.jadwal?.kategori?.nama_kategori || '',
        tanggalDaftar: p.tanggal_daftar,
        tanggalLomba: p.jadwal?.tanggal_lomba || '',
        lokasi: p.jadwal?.lokasi || '',
        biaya: Number(p.jadwal?.jenisLomba?.biaya_pendaftaran) || 0,
        status: p.status_pendaftaran,
        bibNumber: p.peserta?.nomor_bib || undefined
      }));

      // Filter only verified registrations to be judged
      const verified = mappedList.filter(p => p.status === 'Terverifikasi');
      setPendaftaranList(verified);

      // 2. Fetch penilaian (scores)
      const resPenilaian = await apiFetch('/api/penilaian');
      const dataPenilaian = await resPenilaian.json();
      if (dataPenilaian.success) {
        const mappedHasil = (dataPenilaian.data || []).map((h: any) => ({
          id: h.id_penilaian,
          userId: h.pendaftaran?.id_peserta || '',
          pendaftaranId: h.id_pendaftaran,
          lomba: h.pendaftaran?.jadwal?.jenisLomba?.nama_lomba || '',
          kategori: h.pendaftaran?.jadwal?.kategori?.nama_kategori || '',
          nilaiAkhir: Number(h.nilai_akhir) || 0,
          peringkat: 0,
          status: 'Selesai',
          aspek_1: h.aspek_1,
          aspek_2: h.aspek_2,
          aspek_3: h.aspek_3,
          catatan_penilaian: h.catatan_penilaian
        }));
        setHasilList(mappedHasil);
      }
    } catch {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectParticipant = (sub: ExtendedPendaftaran) => {
    setSelectedSub(sub);
    const existing = hasilList.find(h => h.pendaftaranId === sub.id);
    if (existing) {
      setAspek1(existing.aspek_1?.toString() || '');
      setAspek2(existing.aspek_2?.toString() || '');
      setAspek3(existing.aspek_3?.toString() || '');
      setCatatan(existing.catatan_penilaian || '');
    } else {
      setAspek1('');
      setAspek2('');
      setAspek3('');
      setCatatan('');
    }
    setSuccessMsg('');
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !user) return;

    const val1 = parseFloat(aspek1) || 0;
    const val2 = parseFloat(aspek2) || 0;
    const val3 = parseFloat(aspek3) || 0;

    try {
      const res = await apiFetch('/api/penilaian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pendaftaran: selectedSub.id,
          aspek_1: val1,
          aspek_2: val2,
          aspek_3: val3,
          catatan_penilaian: catatan
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal menyimpan nilai.');
        return;
      }

      setSuccessMsg('Penilaian berhasil disimpan!');
      await loadData();
      
      // Clear selection after a delay
      setTimeout(() => {
        setSelectedSub(null);
        setSuccessMsg('');
      }, 1000);
    } catch {
      setError('Gagal menghubungi server.');
    }
  };

  const isGraded = (pendaftaranId: string) => {
    return hasilList.some(h => h.pendaftaranId === pendaftaranId && h.status === 'Selesai');
  };

  const getScore = (pendaftaranId: string) => {
    const found = hasilList.find(h => h.pendaftaranId === pendaftaranId);
    return found ? found.nilaiAkhir : '-';
  };

  const toggleSortScore = () => {
    if (sortScoreOrder === null) setSortScoreOrder('desc');
    else if (sortScoreOrder === 'desc') setSortScoreOrder('asc');
    else setSortScoreOrder(null);
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

  const uniqueLomba = Array.from(new Set(pendaftaranList.map(p => p.lomba))).filter(Boolean);
  const rawKategori = Array.from(new Set(pendaftaranList.map(p => p.kategori))).filter(Boolean);
  const uniqueKategori = sortKategoriList(rawKategori);

  const filteredList = pendaftaranList.filter(p => {
    const matchLomba = filterLomba === 'Semua' || p.lomba === filterLomba;
    const matchKategori = filterKategori === 'Semua' || p.kategori === filterKategori;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      (p.namaPeserta && p.namaPeserta.toLowerCase().includes(searchLower)) ||
      p.id.toLowerCase().includes(searchLower) ||
      (p.bibNumber && p.bibNumber.toLowerCase().includes(searchLower));

    return matchLomba && matchKategori && matchSearch;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (!sortScoreOrder) return 0;
    const scoreA = typeof getScore(a.id) === 'number' ? (getScore(a.id) as number) : -1;
    const scoreB = typeof getScore(b.id) === 'number' ? (getScore(b.id) as number) : -1;
    return sortScoreOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
  });

  return (
    <Layout title="Dashboard Juri">
      <div className="space-y-6">
        
        {/* Main Participant List */}
        <div className="p-6 rounded-2xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Daftar Peserta untuk Dinilai</h2>
                <p className="text-sm" style={{ color: '#8B7DAB' }}>
                  Saring dan cari peserta terverifikasi untuk memasukkan atau mengubah poin penilaian juri.
                </p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pt-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }} />
              <input
                type="text"
                placeholder="Cari nama peserta / BIB / ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              />
            </div>

            {/* Cabang Lomba Dropdown */}
            <div>
              <select
                value={filterLomba}
                onChange={e => setFilterLomba(e.target.value)}
                className="w-full rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              >
                <option value="Semua">Semua Cabang Lomba</option>
                {uniqueLomba.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Kategori Dropdown (U9 -> U12 -> Youth, Men -> Women) */}
            <div>
              <select
                value={filterKategori}
                onChange={e => setFilterKategori(e.target.value)}
                className="w-full rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              >
                <option value="Semua">Semua Kategori Usia</option>
                {uniqueKategori.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                  <th className="pb-3 pl-2">ID / BIB</th>
                  <th className="pb-3">Nama Peserta</th>
                  <th className="pb-3">Cabang Lomba</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Status</th>
                  <th 
                    className="pb-3 cursor-pointer hover:text-white transition select-none"
                    onClick={toggleSortScore}
                    title="Klik untuk mengurutkan nilai"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nilai</span>
                      <ArrowUpDown size={14} className={sortScoreOrder ? 'text-purple-400' : 'text-gray-500'} />
                      {sortScoreOrder && (
                        <span className="text-[10px] text-purple-400 normal-case font-normal">
                          ({sortScoreOrder === 'asc' ? 'Terendah' : 'Tertinggi'})
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Memuat data peserta...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-red-400">{error}</td>
                  </tr>
                ) : pendaftaranList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Belum ada pendaftaran terverifikasi</td>
                  </tr>
                ) : sortedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada peserta yang cocok dengan filter / pencarian</td>
                  </tr>
                ) : (
                  sortedList.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 pl-2 font-mono text-xs">{p.bibNumber || p.id}</td>
                      <td className="py-4 font-semibold text-white">{p.namaPeserta}</td>
                      <td className="py-4 font-semibold text-[#8B7DAB]">{p.lomba}</td>
                      <td className="py-4 text-[#8B7DAB]">{p.kategori}</td>
                      <td className="py-4">
                        {isGraded(p.id) ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full font-medium">
                            <CheckCircle size={12} /> Sudah Dinilai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full font-medium">
                            <Clock size={12} /> Menunggu Nilai
                          </span>
                        )}
                      </td>
                      <td className="py-4 font-bold text-purple-400">{getScore(p.id)}</td>
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => handleSelectParticipant(p)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                        >
                          {isGraded(p.id) ? 'Ubah Nilai' : 'Masukkan Nilai'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Grading Popup */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <div className="w-full max-w-lg p-6 rounded-2xl relative" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
              
              <button
                onClick={() => setSelectedSub(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">
                {isGraded(selectedSub.id) ? 'Ubah Penilaian Peserta' : 'Masukkan Nilai Peserta'}
              </h3>
              <div className="p-3 rounded-lg mb-4 text-xs space-y-1" style={{ background: '#0A0710', border: '1px solid #2D2440' }}>
                <p style={{ color: '#8B7DAB' }}>Nama: <span className="text-white font-semibold">{selectedSub.namaPeserta}</span></p>
                <p style={{ color: '#8B7DAB' }}>Lomba: <span className="text-white font-medium">{selectedSub.lomba}</span></p>
                <p style={{ color: '#8B7DAB' }}>Kategori: <span className="text-white font-medium">{selectedSub.kategori}</span></p>
                <p style={{ color: '#8B7DAB' }}>BIB / ID: <span className="text-white font-mono">{selectedSub.bibNumber || selectedSub.id}</span></p>
              </div>

              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Aspek 1 (Teknik & Kontrol)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    placeholder="Nilai 0 - 100"
                    value={aspek1}
                    onChange={e => setAspek1(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Aspek 2 (Kecepatan & Agilitas)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    placeholder="Nilai 0 - 100"
                    value={aspek2}
                    onChange={e => setAspek2(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Aspek 3 (Kreativitas & Variasi Gaya)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    placeholder="Nilai 0 - 100"
                    value={aspek3}
                    onChange={e => setAspek3(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Catatan / Umpan Balik</label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan ulasan juri..."
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                </div>

                {successMsg && (
                  <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                    {successMsg}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                  >
                    Simpan Nilai
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
