import { useState } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function PengaturanAkunPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!form.oldPass || !form.newPass || !form.confirmPass) { setError('Semua field wajib diisi'); return; }
    if (form.newPass.length < 8) { setError('Password baru minimal 8 karakter'); return; }
    if (form.newPass !== form.confirmPass) { setError('Konfirmasi password tidak cocok'); return; }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          oldPassword: form.oldPass,
          newPassword: form.newPass,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mengubah password.');
        return;
      }

      setForm({ oldPass: '', newPass: '', confirmPass: '' });
      setSuccess('Password berhasil diubah!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Gagal menghubungi server.');
    }
  };

  const inputStyle = {
    background: '#0A0710',
    border: '1px solid #2D2440',
    color: '#F1EEF8',
  };

  return (
    <Layout title="Pengaturan Akun">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <h2 className="text-xl font-bold text-white mb-5">Pengaturan Akun</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5"
              style={{ background: '#1A1428', border: '1px solid #2D2440' }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">Ubah Password</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Masukkan password lama</label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      placeholder="Password lama"
                      value={form.oldPass}
                      onChange={e => set('oldPass', e.target.value)}
                      className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                      {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Masukkan password baru"
                      value={form.newPass}
                      onChange={e => set('newPass', e.target.value)}
                      className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#8B7DAB' }}>Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Ulangi password baru"
                      value={form.confirmPass}
                      onChange={e => set('confirmPass', e.target.value)}
                      className="w-full rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-600 transition pr-10"
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7DAB' }}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs text-red-400 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</p>}
                {success && <p className="text-xs text-green-400 px-3 py-2 rounded-lg flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.1)' }}><CheckCircle size={13} />{success}</p>}

                <button
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 mt-1"
                  style={{ background: '#7C3AED' }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl p-5"
              style={{ background: '#1A1428', border: '1px solid #2D2440' }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">Informasi Akun</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Nama Lengkap', value: user?.namaLengkap || '-' },
                  { label: 'Email', value: user?.email || '-' },
                  { label: 'No. HP', value: user?.noHp || '-' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 text-sm" style={{ borderBottom: '1px solid #2D2440' }}>
                    <span style={{ color: '#8B7DAB' }}>{row.label}</span>
                    <span className="text-white font-medium text-right">{row.value}</span>
                  </div>
                ))}
                <div className="mt-3 rounded-lg px-4 py-3 flex items-center gap-2" style={{ background: '#10B98110', border: '1px solid #10B98133' }}>
                  <CheckCircle size={15} style={{ color: '#10B981' }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#10B981' }}>Akun Aktif</p>
                    <p className="text-xs" style={{ color: '#8B7DAB' }}>Akun Anda dalam kondisi aktif dan terverifikasi.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
