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
      {/* Glow ambient background effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10 my-auto">
        {/* Left Branding Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-5/12 text-left py-4 hidden md:block"
        >
          <Logo size="lg" />
          
          <div className="mt-8 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(167, 139, 250, 0.3)', color: '#C4B5FD' }}>
              <Sparkles size={14} /> Portal Resmi Peserta
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Selamat Datang <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300">
                Kembali!
              </span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#A094C2' }}>
              Masuk untuk mengelola pendaftaran lomba, memantau nomor BIB, serta melihat hasil perlombaan Inline Skate Anda.
            </p>
          </div>

          <div className="pt-6 border-t flex items-center gap-3 text-xs" style={{ borderColor: 'rgba(45, 36, 64, 0.7)', color: '#8B7DAB' }}>
            <div className="p-2.5 rounded-xl" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
              <Trophy size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Inline Skate Championship</p>
              <p>Platform Kejuaraan & Real-time Scoring</p>
            </div>
          </div>
        </motion.div>

        {/* Right Floating Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-6/12 lg:w-5/12 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md"
          style={{ 
            background: 'rgba(18, 13, 30, 0.92)', 
            border: '1px solid #2D2440',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="md:hidden mb-6 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Login Peserta
            </h2>
            <p className="text-xs" style={{ color: '#8B7DAB' }}>
              Masukkan email dan password akun terdaftar Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A094C2' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium" style={{ color: '#A094C2' }}>
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
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-white transition"
                  style={{ color: '#8B7DAB' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

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
              {loading ? 'Memuat...' : 'Masuk Sekarang'}
            </button>

            <p className="text-center text-xs mt-3 pt-3 border-t" style={{ borderColor: '#2D2440', color: '#8B7DAB' }}>
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#A78BFA' }}>
                Registrasi di sini
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
