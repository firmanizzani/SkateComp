import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import heroImg from '../assets/hero.png';

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
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-10"
      style={{ 
        background: '#0A0710',
        backgroundImage: `linear-gradient(135deg, rgba(10, 7, 16, 0.88) 0%, rgba(18, 13, 30, 0.92) 100%), url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md relative z-10 my-auto"
        style={{ 
          background: 'rgba(18, 13, 30, 0.92)', 
          border: '1px solid #2D2440',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="mb-6">
          <Logo size="md" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Buat Akun Peserta
          </h2>
          <p className="text-xs" style={{ color: '#8B7DAB' }}>
            Isi formulir di bawah ini untuk mendaftar akun kompetisi SkateComp
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap sesuai identitas"
              value={form.namaLengkap}
              onChange={e => set('namaLengkap', e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
              style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Email</label>
              <input
                type="email"
                placeholder="Masukkan email aktif"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Nomor HP / WA</label>
              <input
                type="tel"
                placeholder="08xxxxxxxx"
                value={form.noHp}
                onChange={e => set('noHp', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Tanggal Lahir</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.tanggalLahir}
                  onChange={e => set('tanggalLahir', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: form.tanggalLahir ? '#F1EEF8' : '#8B7DAB' }}
                />
                <Calendar size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8B7DAB' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Jenis Kelamin</label>
              <select
                value={form.jenisKelamin}
                onChange={e => set('jenisKelamin', e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Buat Password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showKonfirm ? 'text' : 'password'}
                  placeholder="Ulangi Password"
                  value={form.konfirmPassword}
                  onChange={e => set('konfirmPassword', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
                <button type="button" onClick={() => setShowKonfirm(!showKonfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                  {showKonfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded"
            />
            <span className="text-xs" style={{ color: '#8B7DAB' }}>
              Saya setuju dengan{' '}
              <button type="button" className="hover:underline" style={{ color: '#A78BFA' }}>Syarat & Ketentuan</button>
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-400 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition hover:opacity-90 disabled:opacity-60 mt-2 shadow-lg shadow-purple-900/40 text-sm"
            style={{ background: '#7C3AED' }}
          >
            {loading ? 'Memuat...' : 'Daftar Sekarang'}
          </button>

          <p className="text-center text-xs mt-3 pt-3 border-t" style={{ borderColor: '#2D2440', color: '#8B7DAB' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#A78BFA' }}>
              Login di sini
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
