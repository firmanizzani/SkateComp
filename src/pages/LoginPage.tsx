import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0710' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: '#120D1E', border: '1px solid #2D2440' }}
      >
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left */}
          <div className="md:w-2/5 p-8 flex flex-col justify-between" style={{ background: '#1A1428' }}>
            <Logo />
            <div>
              <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Selamat Datang<br />Kembali!
              </h1>
              <p style={{ color: '#8B7DAB', fontSize: 14 }}>
                Masuk untuk melanjutkan ke akun Anda dan ikut kompetisi Inline Skate
              </p>
            </div>
            <div />
          </div>

          {/* Right */}
          <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Login Peserta</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Email</label>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition"
                  style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: '#8B7DAB' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                    style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#8B7DAB' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button type="button" className="text-xs hover:text-purple-400 transition" style={{ color: '#8B7DAB' }}>
                    Lupa password?
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ background: '#7C3AED' }}
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>

              <p className="text-center text-sm" style={{ color: '#8B7DAB' }}>
                Belum punya akun?{' '}
                <Link to="/register" className="font-medium hover:underline" style={{ color: '#A78BFA' }}>
                  Registrasi di sini
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
