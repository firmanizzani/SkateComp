import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import heroImg from '../assets/hero.png';

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email dan password wajib diisi'); return; }
    setLoading(true);
    const result = await login(email, password);
    if (result.ok && result.user) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'juri') {
        navigate('/juri/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Login gagal');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row" style={{ background: '#0A0710' }}>
      {/* Left Panel: Full Screen Hero & Branding */}
      <div 
        className="hidden md:flex md:w-1/2 lg:w-5/12 relative overflow-hidden flex-col justify-between p-10 lg:p-14 border-r"
        style={{ 
          borderColor: '#2D2440',
          backgroundImage: `linear-gradient(135deg, rgba(10, 7, 16, 0.82) 0%, rgba(18, 13, 30, 0.95) 100%), url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Glow ambient effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)', color: '#C4B5FD' }}>
              <Sparkles size={14} /> Portal Resmi Peserta
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Selamat Datang <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300">
                Kembali!
              </span>
            </h1>
            <p className="text-base text-gray-300 max-w-md leading-relaxed" style={{ color: '#A094C2' }}>
              Masuk untuk mengelola pendaftaran lomba, memantau nomor BIB, serta melihat hasil perlombaan Inline Skate Anda.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 pt-6 border-t" style={{ borderColor: 'rgba(45, 36, 64, 0.6)' }}>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#8B7DAB' }}>
            <div className="p-2 rounded-lg" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
              <Trophy size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Inline Skate Championship</p>
              <p>Platform Kejuaraan & Real-time Scoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Full Screen Login Form (No floating card box) */}
      <div className="w-full md:w-1/2 lg:w-7/12 min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo visible on mobile only */}
          <div className="md:hidden mb-8">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Login Peserta
            </h2>
            <p className="text-sm" style={{ color: '#8B7DAB' }}>
              Masukkan akun terdaftar Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A094C2' }}>
                Alamat Email
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                style={{ background: '#120D1E', border: '1px solid #2D2440', color: '#F1EEF8' }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium" style={{ color: '#A094C2' }}>
                  Password
                </label>
                <button 
                  type="button" 
                  className="text-xs hover:underline transition" 
                  style={{ color: '#A78BFA' }}
                  onClick={() => alert('Untuk reset password silakan hubungi Admin / Panitia melalui kontak resmi.')}
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-12"
                  style={{ background: '#120D1E', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:text-white transition"
                  style={{ color: '#8B7DAB' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 rounded-xl p-3.5 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-60 mt-2 shadow-lg shadow-purple-900/30"
              style={{ background: '#7C3AED' }}
            >
              {loading ? 'Memuat...' : 'Masuk Sekarang'}
            </button>

            <div className="text-center text-sm mt-4 pt-4 border-t" style={{ borderColor: '#1F1830', color: '#8B7DAB' }}>
              Belum memiliki akun peserta?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#A78BFA' }}>
                Registrasi di sini
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
