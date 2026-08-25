import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { formatRupiah } from '../lib/data';
import { apiFetch } from '../lib/api';

interface JenisLomba {
  id_jenis_lomba: string | number;
  nama_lomba: string;
  deskripsi: string;
  biaya_pendaftaran: number;
}

export default function InformasiLombaPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Semua');
  const [lombaList, setLombaList] = useState<JenisLomba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJenisLomba = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/lomba/jenis');
        const data = await res.json();
        setLombaList(data?.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat informasi lomba');
      } finally {
        setLoading(false);
      }
    };
    fetchJenisLomba();
  }, []);

  const filtered = filter === 'Semua' ? lombaList : lombaList.filter(l => l.nama_lomba === filter);

  const LombaIcon = ({ nama }: { nama: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Classic Slalom': (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 22,14 10,14" fill="#7C3AED" opacity="0.8"/>
          <circle cx="16" cy="22" r="7" fill="#5B21B6" opacity="0.6"/>
        </svg>
      ),
      'Freestyle Slide': (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="20" cy="7" r="3" fill="#A78BFA"/>
          <path d="M6 26 C6 26, 11 16, 16 14 C19 13, 21 14, 22 16 L25 24" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <circle cx="12" cy="27" r="2" fill="#7C3AED"/>
          <circle cx="23" cy="27" r="2" fill="#7C3AED"/>
        </svg>
      ),
      'Speed Slalom': (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke="#7C3AED" strokeWidth="2" fill="none"/>
          <circle cx="16" cy="16" r="8" fill="#5B21B6" opacity="0.4"/>
          <path d="M16 8 L16 16 L22 16" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      'Skate Race': (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="13" width="24" height="6" rx="1" fill="#7C3AED" opacity="0.3"/>
          <path d="M4 13 L16 4 L28 13" stroke="#7C3AED" strokeWidth="2" fill="none"/>
          <path d="M4 19 L16 28 L28 19" stroke="#7C3AED" strokeWidth="1" fill="none" opacity="0.5"/>
          <rect x="13" y="8" width="6" height="16" fill="#A78BFA" opacity="0.5"/>
        </svg>
      ),
    };
    return (
      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#2D2440' }}>
        {iconMap[nama] || <span className="text-2xl text-white">🏆</span>}
      </div>
    );
  };

  return (
    <Layout title="Informasi Lomba">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <h2 className="text-xl font-bold text-white mb-5">Informasi Lomba</h2>

          {loading ? (
            <div className="text-center py-8 text-white">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              {/* Filter */}
              <div className="flex flex-wrap gap-2 mb-5">
                {['Semua', ...lombaList.map(l => l.nama_lomba)].map(f => (
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

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {filtered.map((lomba, i) => (
                  <motion.div
                    key={lomba.id_jenis_lomba}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    style={{ background: '#1A1428', border: '1px solid #2D2440' }}
                  >
                    <LombaIcon nama={lomba.nama_lomba} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-0.5">{lomba.nama_lomba}</h3>
                      <p className="text-sm" style={{ color: '#8B7DAB' }}>{lomba.deskripsi}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#8B7DAB' }}>Biaya Pendaftaran</p>
                        <p className="text-sm font-semibold text-white">{formatRupiah(lomba.biaya_pendaftaran)}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/informasi-lomba/${lomba.id_jenis_lomba}`)}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                        style={{ background: '#7C3AED' }}
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
