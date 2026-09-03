import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { Users, Mail, Phone, Calendar, Search, KeyRound, Eye, EyeOff, X } from 'lucide-react';

interface RegistrationPair {
  lomba: string;
  kategori: string;
}

interface MappedPeserta {
  id: string;
  namaLengkap: string;
  email: string;
  noHp: string;
  tanggalLahir: string;
  jenisKelamin: string;
  bibNumber?: string;
  alamat: string;
  pendaftaranPairs: RegistrationPair[];
  lombaList: string[];
  kategoriList: string[];
}

export default function AdminPesertaPage() {
  const [pesertaList, setPesertaList] = useState<MappedPeserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLomba, setFilterLomba] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');

  // Change-password modal state
  const [resetTarget, setResetTarget] = useState<MappedPeserta | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/peserta');
        const data = await res.json();
        if (data.success) {
          const mapped: MappedPeserta[] = (data.data || []).map((p: any) => {
            const pendaftaran = p.pendaftaran || [];
            const pendaftaranPairs: RegistrationPair[] = pendaftaran.map((pd: any) => ({
              lomba: pd.jadwal?.jenisLomba?.nama_lomba || '-',
              kategori: pd.jadwal?.kategori?.nama_kategori || '-'
            }));
            const lombaList = Array.from(new Set(pendaftaranPairs.map(pd => pd.lomba).filter(l => l !== '-')));
            const kategoriList = Array.from(new Set(pendaftaranPairs.map(pd => pd.kategori).filter(k => k !== '-')));

            return {
              id: p.id_peserta,
              namaLengkap: p.nama_peserta || '',
              email: p.email || '',
              noHp: p.no_hp || '-',
              tanggalLahir: p.tanggal_lahir ? new Date(p.tanggal_lahir).toLocaleDateString('id-ID') : '-',
              jenisKelamin: p.jenis_kelamin === 'L' ? 'Laki-laki' : p.jenis_kelamin === 'P' ? 'Perempuan' : p.jenis_kelamin || '-',
              bibNumber: p.nomor_bib || '-',
              alamat: p.alamat || '-',
              pendaftaranPairs,
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

  const uniqueLomba = Array.from(new Set(pesertaList.flatMap(p => p.lombaList))).filter(Boolean);
  const rawKategori = Array.from(new Set(pesertaList.flatMap(p => p.kategoriList))).filter(Boolean);
  const uniqueKategori = sortKategoriList(rawKategori);

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

  const openResetModal = (p: MappedPeserta) => {
    setResetTarget(p);
    setNewPassword('');
    setShowPassword(false);
    setResetMsg(null);
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setNewPassword('');
    setResetMsg(null);
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (newPassword.length < 8) {
      setResetMsg({ type: 'error', text: 'Password minimal 8 karakter.' });
      return;
    }
    setResetLoading(true);
    setResetMsg(null);
    try {
      const res = await apiFetch(`/api/peserta/${resetTarget.id}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setResetMsg({ type: 'success', text: 'Password berhasil diubah!' });
        setTimeout(closeResetModal, 1500);
      } else {
        setResetMsg({ type: 'error', text: data.message || 'Gagal mengubah password.' });
      }
    } catch {
      setResetMsg({ type: 'error', text: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setResetLoading(false);
    }
  };

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
                <th className="pb-3">Lomba &amp; Kategori</th>
                <th className="pb-3">Kontak</th>
                <th className="pb-3">Tanggal Lahir</th>
                <th className="pb-3">Gender</th>
                <th className="pb-3">BIB</th>
                <th className="pb-3">Alamat</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Memuat data peserta...</td>
                </tr>
              ) : filteredPeserta.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Tidak ada peserta yang cocok dengan filter / pencarian</td>
                </tr>
              ) : (
                filteredPeserta.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 pl-2 font-semibold text-white">{p.namaLengkap}</td>
                    <td className="py-4 space-y-1">
                      {p.pendaftaranPairs.length > 0 ? (
                        p.pendaftaranPairs.map((pair, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">{pair.lomba}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{pair.kategori}</span>
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
                    <td className="py-4">
                      <button
                        onClick={() => openResetModal(p)}
                        title="Ganti Password"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
                        style={{ background: '#2D1F4A', color: '#C4B5FD', border: '1px solid #4C3880' }}
                      >
                        <KeyRound size={13} />
                        Ganti Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: '#1A1230', border: '1px solid #3D2D6A' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ganti Password Peserta</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#8B7DAB' }}>{resetTarget.namaLengkap}</p>
                </div>
              </div>
              <button onClick={closeResetModal} className="text-gray-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: '#8B7DAB' }}>Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                  className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {resetMsg && (
              <p className={`text-xs font-medium px-3 py-2 rounded-lg ${resetMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {resetMsg.text}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={closeResetModal}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
                style={{ background: '#2D2440', color: '#8B7DAB', border: '1px solid #3D2D6A' }}
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)', color: '#fff' }}
              >
                {resetLoading ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
