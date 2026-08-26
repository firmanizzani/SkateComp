import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { Trophy } from 'lucide-react';

interface Hasil {
  id: string | number;
  id_pendaftaran: string;
  nomor_bib: string;
  nama_peserta: string;
  lomba: string;
  kategori: string;
  nilai_akhir: number;
}

export default function AdminRekapPage() {
  const [hasilList, setHasilList] = useState<Hasil[]>([]);
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRekap = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/admin/rekap-nilai');
        const data = await res.json();
        if (data.success) {
          const mapped = (data.data || []).map((h: any) => ({
            id: h.id_penilaian,
            id_pendaftaran: h.pendaftaran?.id_pendaftaran || '-',
            nomor_bib: h.pendaftaran?.peserta?.nomor_bib || '-',
            nama_peserta: h.pendaftaran?.peserta?.nama_peserta || '-',
            lomba: h.pendaftaran?.jadwal?.jenisLomba?.nama_lomba || '-',
            kategori: h.pendaftaran?.jadwal?.kategori?.nama_kategori || '-',
            nilai_akhir: Number(h.nilai_akhir || 0)
          }));
          setHasilList(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRekap();
  }, []);

  const filteredHasil = filterLomba === 'Semua' 
    ? hasilList 
    : hasilList.filter(h => h.lomba === filterLomba);

  // Sort by score descending to see who is leading
  const sortedHasil = [...filteredHasil].sort((a, b) => b.nilai_akhir - a.nilai_akhir);

  return (
    <Layout title="Rekap Nilai & Juara">
      <div className="p-6 rounded-2xl space-y-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Papan Peringkat Perlombaan</h2>
              <p className="text-sm" style={{ color: '#8B7DAB' }}>
                Rekapitulasi penilaian juri serta pemeringkatan otomatis berdasarkan skor akhir.
              </p>
            </div>
          </div>

          <div>
            <select
              value={filterLomba}
              onChange={e => setFilterLomba(e.target.value)}
              className="rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition min-w-[200px]"
              style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
            >
              <option value="Semua">Semua Cabang Lomba</option>
              <option value="Classic Slalom">Classic Slalom</option>
              <option value="Freestyle Slide">Freestyle Slide</option>
              <option value="Speed Slalom">Speed Slalom</option>
              <option value="Skate Race">Skate Race</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white">Memuat data papan peringkat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                  <th className="pb-3 pl-2 w-16">Rank</th>
                  <th className="pb-3">BIB / No Registrasi</th>
                  <th className="pb-3">Nama Peserta</th>
                  <th className="pb-3">Cabang Lomba</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3 text-right pr-2">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                {sortedHasil.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Belum ada data penilaian masuk</td>
                  </tr>
                ) : (
                  sortedHasil.map((h, index) => {
                    const rank = index + 1;
                    return (
                      <tr key={h.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 pl-2 font-bold">
                          {rank === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold" title="Juara 1">🥇</span>}
                          {rank === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-black text-xs font-bold" title="Juara 2">🥈</span>}
                          {rank === 3 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-black text-xs font-bold" title="Juara 3">🥉</span>}
                          {rank > 3 && <span className="pl-1.5 text-xs text-[#8B7DAB]">{rank}</span>}
                        </td>
                        <td className="py-4 font-mono text-xs">{h.nomor_bib} / {h.id_pendaftaran}</td>
                        <td className="py-4 font-semibold text-white">{h.nama_peserta}</td>
                        <td className="py-4 text-[#8B7DAB]">{h.lomba}</td>
                        <td className="py-4 text-xs text-[#8B7DAB]">{h.kategori}</td>
                        <td className="py-4 font-bold text-purple-400 text-right pr-2 text-base">{h.nilai_akhir}</td>
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
