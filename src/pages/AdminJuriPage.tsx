import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import type { User } from '../types';
import { ShieldCheck, UserPlus } from 'lucide-react';

export default function AdminJuriPage() {
  const [juriList, setJuriList] = useState<User[]>([]);
  
  // Create Judge states
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadJuripole();
  }, []);

  const loadJuripole = async () => {
    try {
      const res = await apiFetch('/api/juri');
      const data = await res.json();
      if (data.success) {
        const mapped = (data.data || []).map((j: any) => ({
          id: j.id_juri,
          namaLengkap: j.nama_juri,
          email: j.email,
          noHp: j.no_hp || '-',
          password: '•••••••• (Terenkripsi)',
          role: 'juri' as const
        }));
        setJuriList(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddJuri = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nama || !email || !password) {
      setErrorMsg('Nama, Email, dan Password wajib diisi');
      return;
    }

    try {
      const res = await apiFetch('/api/juri', {
        method: 'POST',
        body: JSON.stringify({
          nama_juri: nama,
          email: email,
          password: password,
          no_hp: noHp || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Juri ${nama} berhasil ditambahkan!`);
        setNama('');
        setEmail('');
        setNoHp('');
        setPassword('');
        loadJuripole();
      } else {
        setErrorMsg(data.message || 'Gagal menambahkan juri');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    }
  };

  return (
    <Layout title="Kelola Juri">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Judge List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-purple-400" size={20} />
              Daftar Juri Terdaftar
            </h2>
            <p className="text-sm mb-6" style={{ color: '#8B7DAB' }}>
              Juri di bawah ini memiliki akses masuk ke halaman khusus penilaian untuk memberikan poin kepada peserta.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2D2440', color: '#8B7DAB' }} className="text-xs font-semibold uppercase">
                    <th className="pb-3 pl-2">Nama Juri</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">No. Handphone</th>
                    <th className="pb-3">Password Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-[#F1EEF8]">
                  {juriList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">Belum ada juri terdaftar</td>
                    </tr>
                  ) : (
                    juriList.map((j) => (
                      <tr key={j.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 pl-2 font-semibold text-white">{j.namaLengkap}</td>
                        <td className="py-4 text-[#8B7DAB]">{j.email}</td>
                        <td className="py-4">{j.noHp}</td>
                        <td className="py-4 font-mono text-xs">{j.password}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Add Judge Form */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserPlus className="text-purple-400" size={18} />
              Tambah Juri Baru
            </h3>
            <p className="text-xs mb-4" style={{ color: '#8B7DAB' }}>
              Daftarkan akun juri secara manual. Akun ini tidak dapat didaftarkan melalui halaman registrasi publik.
            </p>

            <form onSubmit={handleAddJuri} className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama juri"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="juri@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Nomor HP</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxx"
                  value={noHp}
                  onChange={e => setNoHp(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Password Awal</label>
                <input
                  type="text"
                  required
                  placeholder="Buat password login juri"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                  {successMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition mt-2"
              >
                Daftarkan Juri
              </button>
            </form>
          </div>
        </div>

      </div>
    </Layout>
  );
}
