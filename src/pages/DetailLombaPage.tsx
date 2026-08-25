import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { formatRupiah } from '../lib/data';
import { apiFetch } from '../lib/api';

interface Jadwal {
  id_jadwal: string | number;
  tanggal_lomba: string;
  jenisLomba: { 
    id_jenis_lomba: string | number;
    nama_lomba: string;
    deskripsi?: string;
    biaya_pendaftaran: number;
  };
  kategori: { nama_kategori: string };
  jam_mulai: string;
  lokasi: string;
}

export default function DetailLombaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJadwal = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/lomba/jadwal');
        const data = await res.json();
        setJadwalList(data?.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat jadwal lomba');
      } finally {
        setLoading(false);
      }
    };
    fetchJadwal();
  }, []);

  const relatedJadwal = jadwalList.filter(j => 
    String(j.jenisLomba?.id_jenis_lomba) === String(id) || 
    j.jenisLomba?.nama_lomba === id
  );

  const lombaInfo = relatedJadwal.length > 0 ? relatedJadwal[0].jenisLomba : null;

  if (loading) {
    return (
      <Layout title="Detail Lomba">
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#8B7DAB' }}>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Detail Lomba">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!lombaInfo) return (
    <Layout title="Detail Lomba">
      <div className="flex items-center justify-center h-64">
        <p style={{ color: '#8B7DAB' }}>Lomba tidak ditemukan.</p>
      </div>
    </Layout>
  );

  const LombaIllustration = () => (
    <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: '#2D2440' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {lombaInfo.nama_lomba === 'Classic Slalom' && (
          <>
            <polygon points="24,4 34,22 14,22" fill="#7C3AED" opacity="0.9"/>
            <circle cx="24" cy="34" r="10" fill="#5B21B6" opacity="0.7"/>
          </>
        )}
        {lombaInfo.nama_lomba === 'Freestyle Slide' && (
          <>
            <circle cx="30" cy="10" r="5" fill="#A78BFA"/>
            <path d="M8 38 C8 38, 16 24, 24 20 C28 18, 32 20, 34 24 L38 36" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="40" r="3" fill="#7C3AED"/>
            <circle cx="36" cy="40" r="3" fill="#7C3AED"/>
          </>
        )}
        {lombaInfo.nama_lomba === 'Speed Slalom' && (
          <>
            <circle cx="24" cy="24" r="18" stroke="#7C3AED" strokeWidth="3" fill="none"/>
            <circle cx="24" cy="24" r="11" fill="#5B21B6" opacity="0.4"/>
            <path d="M24 12 L24 24 L34 24" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round"/>
          </>
        )}
        {lombaInfo.nama_lomba === 'Skate Race' && (
          <>
            <rect x="4" y="20" width="40" height="8" rx="2" fill="#7C3AED" opacity="0.4"/>
            <path d="M4 20 L24 6 L44 20" stroke="#7C3AED" strokeWidth="2.5" fill="none"/>
            <path d="M4 28 L24 42 L44 28" stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <rect x="20" y="12" width="8" height="24" fill="#A78BFA" opacity="0.5"/>
          </>
        )}
      </svg>
    </div>
  );

  // Kategori unik dari jadwal terkait
  const kategoriUnik = [...new Set(relatedJadwal.map(j => j.kategori?.nama_kategori))];
  const lokasiUnik = [...new Set(relatedJadwal.map(j => j.lokasi))];

  return (
    <Layout title="Detail Lomba">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          {/* Back */}
          <button
            onClick={() => navigate('/informasi-lomba')}
            className="flex items-center gap-1 text-sm mb-5 hover:text-white transition"
            style={{ color: '#8B7DAB' }}
          >
            <ArrowLeft size={15} /> Kembali
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-5">
            <LombaIllustration />
            <div>
              <p className="text-xs mb-1" style={{ color: '#8B7DAB' }}>Detail Lomba</p>
              <h2 className="text-2xl font-bold text-white">{lombaInfo.nama_lomba}</h2>
            </div>
          </div>

          {lombaInfo.deskripsi && (
            <p className="text-sm mb-6" style={{ color: '#C4B5D0', lineHeight: 1.7 }}>
              {lombaInfo.deskripsi}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-white mb-2">Kategori yang tersedia:</p>
              <ul className="flex flex-col gap-1">
                {kategoriUnik.map(k => (
                  <li key={k} className="flex items-center gap-2 text-sm" style={{ color: '#C4B5D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C3AED' }} />
                    {k}
                  </li>
                ))}
                {kategoriUnik.length === 0 && (
                  <li className="text-sm" style={{ color: '#C4B5D0' }}>Belum ada kategori</li>
                )}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-white mb-1">Biaya Pendaftaran</p>
                <p className="text-base font-bold" style={{ color: '#F1EEF8' }}>{formatRupiah(lombaInfo.biaya_pendaftaran)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Lokasi</p>
                <p className="text-sm" style={{ color: '#C4B5D0' }}>
                  {lokasiUnik.join(', ') || 'Belum ditentukan'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => navigate('/jadwal-lomba')}
              className="px-6 py-2.5 rounded-lg font-semibold text-white transition hover:opacity-90"
              style={{ background: '#7C3AED' }}
            >
              Lihat Jadwal
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
