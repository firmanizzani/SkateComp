import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { JADWAL_LIST } from '../lib/data';

const PAGE_SIZE = 5;

export default function JadwalLombaPage() {
  const [page, setPage] = useState(1);
  const [filterTanggal, setFilterTanggal] = useState('');

  const uniqueDates = [...new Set(JADWAL_LIST.map(j => j.tanggal))];

  const filtered = filterTanggal
    ? JADWAL_LIST.filter(j => j.tanggal === filterTanggal)
    : JADWAL_LIST;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (val: string) => {
    setFilterTanggal(val);
    setPage(1);
  };

  const pageNumbers = () => {
    const nums = [];
    for (let i = 1; i <= Math.min(totalPages, 4); i++) nums.push(i);
    return nums;
  };

  return (
    <Layout title="Jadwal Lomba">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-bold text-white">Jadwal Lomba</h2>
            <select
              value={filterTanggal}
              onChange={e => handleFilterChange(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: '#1A1428', border: '1px solid #2D2440', color: filterTanggal ? '#F1EEF8' : '#8B7DAB', minWidth: 160 }}
            >
              <option value="">Pilih Tanggal</option>
              {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D2440' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1A1428', borderBottom: '1px solid #2D2440' }}>
                  {['Tanggal', 'Lomba', 'Kategori', 'Jam Mulai', 'Lokasi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#8B7DAB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8" style={{ color: '#8B7DAB' }}>
                      Tidak ada jadwal untuk tanggal ini.
                    </td>
                  </tr>
                ) : (
                  paginated.map((j, i) => (
                    <motion.tr
                      key={j.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid #2D2440' }}
                    >
                      <td className="px-4 py-3 text-white">{j.tanggal}</td>
                      <td className="px-4 py-3 text-white">{j.lomba}</td>
                      <td className="px-4 py-3" style={{ color: '#8B7DAB' }}>{j.kategori}</td>
                      <td className="px-4 py-3" style={{ color: '#8B7DAB' }}>{j.jamMulai}</td>
                      <td className="px-4 py-3" style={{ color: '#8B7DAB' }}>{j.lokasi}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              {pageNumbers().map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition"
                  style={
                    page === n
                      ? { background: '#7C3AED', color: '#fff' }
                      : { background: '#1A1428', border: '1px solid #2D2440', color: '#8B7DAB' }
                  }
                >
                  {n}
                </button>
              ))}
              {totalPages > 4 && (
                <button
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  className="w-8 h-8 rounded-lg text-sm transition"
                  style={{ background: '#1A1428', border: '1px solid #2D2440', color: '#8B7DAB' }}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={14} className="mx-auto" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
