import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getPendaftaran } from '../lib/data';
import type { Pendaftaran } from '../types';

type Filter = 'Semua' | 'Terverifikasi' | 'Menunggu' | 'Ditolak';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Terverifikasi: { bg: '#10B98120', color: '#10B981' },
    Menunggu: { bg: '#F59E0B20', color: '#F59E0B' },
    Ditolak: { bg: '#EF444420', color: '#EF4444' },
  };
  const s = map[status] || { bg: '#2D2440', color: '#8B7DAB' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

export default function RiwayatDaftarPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('Semua');
  const [detail, setDetail] = useState<Pendaftaran | null>(null);

  const allPendaftaran = getPendaftaran(user?.id);
  const filtered = filter === 'Semua' ? allPendaftaran : allPendaftaran.filter(p => p.status === filter);

  const filters: Filter[] = ['Semua', 'Terverifikasi', 'Menunggu', 'Ditolak'];

  return (
    <Layout title="Riwayat Daftar">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <h2 className="text-xl font-bold text-white">Riwayat Daftar</h2>
            {user?.bibNumber && (
              <div className="rounded-xl p-4 text-right" style={{ background: '#1A1428', border: '1px solid #2D2440', minWidth: 200 }}>
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-xs" style={{ color: '#8B7DAB' }}>Nomor BIB Anda</p>
                  <Info size={12} style={{ color: '#8B7DAB' }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace' }}>{user.bibNumber}</p>
                <p className="text-xs mt-1" style={{ color: '#8B7DAB' }}>Nomor BIB Bersifat unik dan digunakan untuk semua jenis lomba yang diikuti</p>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D2440' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1A1428', borderBottom: '1px solid #2D2440' }}>
                  {['ID', 'Lomba', 'Kategori', 'Tanggal', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8" style={{ color: '#8B7DAB' }}>
                      Tidak ada pendaftaran.
                    </td>
                  </tr>
                ) : filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid #2D2440' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#A78BFA', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>{p.id}</td>
                    <td className="px-4 py-3 text-white">{p.lomba}</td>
                    <td className="px-4 py-3 hidden sm:table-cell" style={{ color: '#8B7DAB' }}>{p.kategori}</td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: '#8B7DAB' }}>{p.tanggalDaftar}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetail(p)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition hover:opacity-80"
                        style={{ background: '#7C3AED22', color: '#A78BFA', border: '1px solid #7C3AED44' }}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BIB info */}
          <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
            <Info size={15} style={{ color: '#A78BFA' }} className="flex-shrink-0" />
            <p style={{ color: '#8B7DAB' }}>
              Nomor BIB hanya dibuat setelah pembayaran pertama terverifikasi. Nomor BIB Anda saat ini:{' '}
              <strong style={{ color: '#A78BFA' }}>{user?.bibNumber || 'Belum ada'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDetail(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: '#1A1428', border: '1px solid #2D2440' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-4">Detail Pendaftaran</h3>
            {[
              ['ID Pendaftaran', detail.id],
              ['Lomba', detail.lomba],
              ['Kategori', detail.kategori],
              ['Tanggal Daftar', detail.tanggalDaftar],
              ['Tanggal Lomba', detail.tanggalLomba],
              ['Lokasi', detail.lokasi],
              ['Status', detail.status],
              ['Metode Bayar', detail.metodePembayaran || '-'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 text-sm" style={{ borderBottom: '1px solid #2D2440' }}>
                <span style={{ color: '#8B7DAB' }}>{label}</span>
                <span className="text-white font-medium">{val}</span>
              </div>
            ))}
            <button
              onClick={() => setDetail(null)}
              className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ background: '#7C3AED', color: '#fff' }}
            >
              Tutup
            </button>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
