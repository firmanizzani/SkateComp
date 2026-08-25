import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getPendaftaran, getHasil, saveHasil } from '../lib/data';
import type { Pendaftaran, HasilLomba } from '../types';
import { Trophy, CheckCircle, Clock } from 'lucide-react';

export default function JuriDashboardPage() {
  const { user } = useAuth();
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [hasilList, setHasilList] = useState<HasilLomba[]>([]);
  const [selectedSub, setSelectedSub] = useState<Pendaftaran | null>(null);
  
  // Score form inputs
  const [aspek1, setAspek1] = useState('');
  const [aspek2, setAspek2] = useState('');
  const [aspek3, setAspek3] = useState('');
  const [catatan, setCatatan] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Load all registrations
    const list = getPendaftaran();
    // Filter only verified registrations to be judged
    const verified = list.filter(p => p.status === 'Terverifikasi');
    setPendaftaranList(verified);

    // Load results
    setHasilList(getHasil());
  }, []);

  const handleSelectParticipant = (sub: Pendaftaran) => {
    setSelectedSub(sub);
    const existing = hasilList.find(h => h.pendaftaranId === sub.id);
    if (existing) {
      // Pre-fill if already graded (mocking database values)
      setAspek1('80');
      setAspek2('82');
      setAspek3('85');
      setCatatan('Sudah dinilai');
    } else {
      setAspek1('');
      setAspek2('');
      setAspek3('');
      setCatatan('');
    }
    setSuccessMsg('');
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !user) return;

    const val1 = parseFloat(aspek1) || 0;
    const val2 = parseFloat(aspek2) || 0;
    const val3 = parseFloat(aspek3) || 0;
    const finalScore = parseFloat(((val1 + val2 + val3) / 3).toFixed(2));

    const currentHasil = getHasil();
    const existingIdx = currentHasil.findIndex(h => h.pendaftaranId === selectedSub.id);

    const newHasil: HasilLomba = {
      id: existingIdx !== -1 ? currentHasil[existingIdx].id : `hasil-${Date.now()}`,
      userId: selectedSub.userId,
      pendaftaranId: selectedSub.id,
      lomba: selectedSub.lomba,
      kategori: selectedSub.kategori,
      nilaiAkhir: finalScore,
      peringkat: existingIdx !== -1 ? currentHasil[existingIdx].peringkat : 0, // Admin will compute actual rankings
      status: 'Selesai'
    };

    if (existingIdx !== -1) {
      currentHasil[existingIdx] = newHasil;
    } else {
      currentHasil.push(newHasil);
    }

    saveHasil(currentHasil);
    setHasilList(currentHasil);
    setSuccessMsg('Penilaian berhasil disimpan!');
    
    // Clear selection after a delay
    setTimeout(() => {
      setSelectedSub(null);
      setSuccessMsg('');
    }, 1500);
  };

  const isGraded = (pendaftaranId: string) => {
    return hasilList.some(h => h.pendaftaranId === pendaftaranId && h.status === 'Selesai');
  };

  const getScore = (pendaftaranId: string) => {
    const found = hasilList.find(h => h.pendaftaranId === pendaftaranId);
    return found ? found.nilaiAkhir : '-';
  };

  return (
    <Layout title="Dashboard Juri">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Participant List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-purple-400" size={20} />
              Daftar Peserta untuk Dinilai
            </h2>
            <p className="text-sm mb-6" style={{ color: '#8B7DAB' }}>
              Pilih peserta dengan status "Terverifikasi" untuk mulai memberikan penilaian aspek.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                    <th className="pb-3 pl-2">ID/BIB</th>
                    <th className="pb-3">Cabang Lomba</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Nilai</th>
                    <th className="pb-3 text-right pr-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                  {pendaftaranList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">Belum ada pendaftaran terverifikasi</td>
                    </tr>
                  ) : (
                    pendaftaranList.map((p) => (
                      <tr key={p.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 pl-2 font-mono text-xs">{p.bibNumber || p.id}</td>
                        <td className="py-4 font-semibold text-white">{p.lomba}</td>
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
                            {isGraded(p.id) ? 'Ubah Nilai' : 'Beri Nilai'}
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

        {/* Right: Grading Form panel */}
        <div className="lg:col-span-1">
          {selectedSub ? (
            <div className="p-6 rounded-2xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
              <h3 className="text-lg font-bold text-white mb-2">Penilaian Peserta</h3>
              <p className="text-xs mb-4" style={{ color: '#8B7DAB' }}>
                Lomba: <span className="text-white font-medium">{selectedSub.lomba}</span><br />
                Kategori: <span className="text-white font-medium">{selectedSub.kategori}</span><br />
                ID: <span className="text-white font-mono">{selectedSub.id}</span>
              </p>

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

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                  >
                    Simpan Nilai
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 rounded-2xl text-center border-dashed border-2 flex flex-col justify-center items-center min-h-[300px]" style={{ borderColor: '#2D2440', background: '#120D1E' }}>
              <Trophy size={40} className="text-purple-500/50 mb-3" />
              <p className="text-sm font-medium text-white mb-1">Pilih Peserta</p>
              <p className="text-xs max-w-[200px]" style={{ color: '#8B7DAB' }}>
                Silakan pilih peserta di tabel sebelah kiri untuk mulai memasukkan poin juri.
              </p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
