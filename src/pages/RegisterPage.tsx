import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'juri') navigate('/juri/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#0A0710' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-purple-300">Memuat sesi...</p>
        </div>
      </div>
    );
  }
  const [form, setForm] = useState({
    namaLengkap: '',
    email: '',
    noHp: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    alamat: '',
    password: '',
    konfirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.namaLengkap || !form.email || !form.noHp || !form.tanggalLahir || !form.password) {
      setError('Semua field wajib diisi'); return;
    }
    if (form.password !== form.konfirmPassword) {
      setError('Password tidak cocok'); return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter'); return;
    }
    if (!agree) {
      setError('Anda harus menyetujui syarat & ketentuan'); return;
    }
    setLoading(true);
    const result = await register({
      nama_peserta: form.namaLengkap,
      email: form.email,
      password: form.password,
      tanggal_lahir: form.tanggalLahir,
      jenis_kelamin: form.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
      alamat: form.alamat || '-',
      no_hp: form.noHp,
    });
    if (result.ok) navigate('/dashboard');
    else setError(result.error || 'Registrasi gagal');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0710' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: '#120D1E', border: '1px solid #2D2440' }}
      >
        <div className="p-8">
          <Logo />
          <h2 className="text-2xl font-bold text-white mt-6 mb-6">Buat Akun Peserta</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.namaLengkap}
                onChange={e => set('namaLengkap', e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Email</label>
                <input
                  type="email"
                  placeholder="Masukkan email aktif"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Nomor HP</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxx"
                  value={form.noHp}
                  onChange={e => set('noHp', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Tanggal Lahir</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.tanggalLahir}
                    onChange={e => set('tanggalLahir', e.target.value)}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: form.tanggalLahir ? '#F1EEF8' : '#8B7DAB' }}
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8B7DAB' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Jenis Kelamin</label>
                <select
                  value={form.jenisKelamin}
                  onChange={e => set('jenisKelamin', e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Buat Password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showKonfirm ? 'text' : 'password'}
                    placeholder="Ulangi Password"
                    value={form.konfirmPassword}
                    onChange={e => set('konfirmPassword', e.target.value)}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                  <button type="button" onClick={() => setShowKonfirm(!showKonfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                    {showKonfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <span className="text-sm" style={{ color: '#8B7DAB' }}>
                Saya setuju dengan{' '}
                <button type="button" className="hover:underline" style={{ color: '#A78BFA' }}>Syarat & Ketentuan</button>
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-400 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: '#7C3AED' }}
            >
              {loading ? 'Memuat...' : 'Daftar Sekarang'}
            </button>

            <p className="text-center text-sm" style={{ color: '#8B7DAB' }}>
              Sudah punya akun?{' '}
              <Link to="/login" className="font-medium hover:underline" style={{ color: '#A78BFA' }}>
                Login di sini
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
