import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { LOMBA_LIST, formatRupiah } from '../lib/data';

export default function DetailLombaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lomba = LOMBA_LIST.find(l => l.id === id);

  if (!lomba) return (
    <Layout title="Detail Lomba">
      <div className="flex items-center justify-center h-64">
        <p style={{ color: '#8B7DAB' }}>Lomba tidak ditemukan.</p>
      </div>
    </Layout>
  );

  const LombaIllustration = () => (
    <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: '#2D2440' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {lomba.nama === 'Classic Slalom' && (
          <>
            <polygon points="24,4 34,22 14,22" fill="#7C3AED" opacity="0.9"/>
            <circle cx="24" cy="34" r="10" fill="#5B21B6" opacity="0.7"/>
          </>
        )}
        {lomba.nama === 'Freestyle Slide' && (
          <>
            <circle cx="30" cy="10" r="5" fill="#A78BFA"/>
            <path d="M8 38 C8 38, 16 24, 24 20 C28 18, 32 20, 34 24 L38 36" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="40" r="3" fill="#7C3AED"/>
            <circle cx="36" cy="40" r="3" fill="#7C3AED"/>
          </>
        )}
        {lomba.nama === 'Speed Slalom' && (
          <>
            <circle cx="24" cy="24" r="18" stroke="#7C3AED" strokeWidth="3" fill="none"/>
            <circle cx="24" cy="24" r="11" fill="#5B21B6" opacity="0.4"/>
            <path d="M24 12 L24 24 L34 24" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round"/>
          </>
        )}
        {lomba.nama === 'Skate Race' && (
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
              <h2 className="text-2xl font-bold text-white">{lomba.nama}</h2>
            </div>
          </div>

          <p className="text-sm mb-6" style={{ color: '#C4B5D0', lineHeight: 1.7 }}>{lomba.deskripsiPanjang}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-white mb-2">Kategori yang tersedia:</p>
              <ul className="flex flex-col gap-1">
                {lomba.kategori.map(k => (
                  <li key={k} className="flex items-center gap-2 text-sm" style={{ color: '#C4B5D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C3AED' }} />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-white mb-1">Biaya Pendaftaran</p>
                <p className="text-base font-bold" style={{ color: '#F1EEF8' }}>{formatRupiah(lomba.biaya)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Lokasi</p>
                <p className="text-sm" style={{ color: '#C4B5D0' }}>{lomba.lokasi}</p>
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
