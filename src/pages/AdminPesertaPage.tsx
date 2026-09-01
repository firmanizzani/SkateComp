import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { Users, Mail, Phone, Calendar, Search } from 'lucide-react';

interface MappedPeserta {
  id: string;
  namaLengkap: string;
  email: string;
  noHp: string;
  tanggalLahir: string;
  jenisKelamin: string;
  bibNumber?: string;
  alamat: string;
  lombaList: string[];
  kategoriList: string[];
}

export default function AdminPesertaPage() {
  const [pesertaList, setPesertaList] = useState<MappedPeserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/peserta');
        const data = await res.json();
        if (data.success) {
          const mapped: MappedPeserta[] = (data.data || []).map((p: any) => {
            const pendaftaran = p.pendaftaran || [];
            const lombaList = Array.from(new Set(pendaftaran.map((pd: any) => pd.jadwal?.jenisLomba?.nama_lomba).filter(Boolean))) as string[];
            const kategoriList = Array.from(new Set(pendaftaran.map((pd: any) => pd.jadwal?.kategori?.nama_kategori).filter(Boolean))) as string[];
            return {
              id: p.id_peserta,
              namaLengkap: p.nama_peserta || '',
              email: p.email || '',
              noHp: p.no_hp || '-',
              tanggalLahir: p.tanggal_lahir ? new Date(p.tanggal_lahir).toLocaleDateString('id-ID') : '-',
              jenisKelamin: p.jenis_kelamin === 'L' ? 'Laki-laki' : p.jenis_kelamin === 'P' ? 'Perempuan' : p.jenis_kelamin || '-',
              bibNumber: p.nomor_bib || '-',
              alamat: p.alamat || '-',
              lombaList,
              kategoriList,
            };
          });
          setPesertaList(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeserta();
  }, []);

  const uniqueLomba = Array.from(new Set(pesertaList.flatMap(p => p.lombaList))).filter(Boolean);
  const uniqueKategori = Array.from(new Set(pesertaList.flatMap(p => p.kategoriList))).filter(Boolean);

  const filteredPeserta = pesertaList.filter(p => {
    const matchLomba = filterLomba === 'Semua' || p.lombaList.includes(filterLomba);
    const matchKategori = filterKategori === 'Semua' || p.kategoriList.includes(filterKategori);
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      p.namaLengkap.toLowerCase().includes(searchLower) || 
      (p.bibNumber && p.bibNumber.toLowerCase().includes(searchLower)) || 
      p.email.toLowerCase().includes(searchLower);

    return matchLomba && matchKategori && matchSearch;
  });

  return (
    <Layout title="Kelola Peserta">
      <div className="p-6 rounded-2xl space-y-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Daftar Seluruh Peserta</h2>
              <p className="text-sm" style={{ color: '#8B7DAB' }}>
                Lihat detail data diri, cabang lomba, dan kategori usia peserta terdaftar.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Search Input */}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                <th className="pb-3 pl-2">Nama Lengkap</th>
                <th className="pb-3">Lomba & Kategori</th>
                <th className="pb-3">Kontak</th>
                <th className="pb-3">Tanggal Lahir</th>
                <th className="pb-3">Gender</th>
                <th className="pb-3">BIB</th>
                <th className="pb-3">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Memuat data peserta...</td>
                </tr>
              ) : filteredPeserta.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Tidak ada peserta yang cocok dengan filter / pencarian</td>
                </tr>
              ) : (
                filteredPeserta.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 pl-2 font-semibold text-white">{p.namaLengkap}</td>
                    <td className="py-4 space-y-1">
                      {p.lombaList.length > 0 ? (
                        p.lombaList.map((lomba, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">{lomba}</span>
                            {p.kategoriList[idx] && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{p.kategoriList[idx]}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">Belum mendaftar lomba</span>
                      )}
                    </td>
                    <td className="py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#8B7DAB]">
                        <Mail size={12} /> {p.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#8B7DAB]">
                        <Phone size={12} /> {p.noHp}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#8B7DAB]">
                        <Calendar size={12} /> {p.tanggalLahir}
                      </div>
                    </td>
                    <td className="py-4">{p.jenisKelamin}</td>
                    <td className="py-4 font-bold text-purple-400">{p.bibNumber || '-'}</td>
                    <td className="py-4 text-xs text-[#8B7DAB] max-w-[180px] truncate" title={p.alamat}>
                      {p.alamat}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
