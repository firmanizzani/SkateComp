import { useState, useRef } from 'react';
import { Camera, Edit2, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function ProfilPage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    namaLengkap: user?.namaLengkap || '',
    noHp: user?.noHp || '',
    alamat: user?.alamat || '',
    jenisKelamin: user?.jenisKelamin || 'Laki-laki',
  });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateUser({ foto: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUser(form as any);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const rows = [
    { label: 'Nama Lengkap', value: user?.namaLengkap || '-', field: 'namaLengkap' },
    { label: 'Tanggal Lahir', value: formatTanggal(user?.tanggalLahir || ''), field: null },
    { label: 'Jenis Kelamin', value: user?.jenisKelamin || '-', field: null },
    { label: 'Alamat', value: user?.alamat || '-', field: 'alamat' },
    { label: 'Nomor HP', value: user?.noHp || '-', field: 'noHp' },
    { label: 'Email', value: user?.email || '-', field: null },
  ];

  return (
    <Layout title="Profil">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 flex items-center justify-center font-bold text-3xl text-white" style={{ borderColor: '#7C3AED', background: '#7C3AED' }}>
                {user?.foto ? (
                  <img src={user.foto} alt="avatar" className="w-full h-full object-cover" />
                ) : user?.namaLengkap?.[0]?.toUpperCase()}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-1.5 rounded-lg text-sm font-medium border transition hover:bg-purple-900/30"
                style={{ borderColor: '#7C3AED', color: '#A78BFA' }}
              >
                <span className="flex items-center gap-1.5"><Camera size={14} /> Ubah Foto</span>
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2D2440' }}>
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center"
                    style={{ borderBottom: i < rows.length - 1 ? '1px solid #2D2440' : undefined }}
                  >
                    <div className="w-36 md:w-44 px-4 py-3 flex-shrink-0 text-sm" style={{ color: '#8B7DAB', background: '#1A1428' }}>
                      {row.label}
                    </div>
                    <div className="flex-1 px-4 py-3 text-sm text-white">
                      {editing && row.field ? (
                        row.field === 'jenisKelamin' ? (
                          <select
                            value={(form as any)[row.field]}
                            onChange={e => setForm(f => ({ ...f, [row.field!]: e.target.value }))}
                            className="rounded px-2 py-1 text-sm outline-none"
                            style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                          >
                            <option>Laki-laki</option>
                            <option>Perempuan</option>
                          </select>
                        ) : (
                          <input
                            value={(form as any)[row.field]}
                            onChange={e => setForm(f => ({ ...f, [row.field!]: e.target.value }))}
                            className="rounded px-2 py-1 text-sm outline-none w-full"
                            style={{ background: '#0A0710', border: '1px solid #2D2440', color: '#F1EEF8' }}
                          />
                        )
                      ) : (
                        <span style={{ color: row.label === 'Email' ? '#8B7DAB' : '#F1EEF8' }}>{row.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-5">
            {saved && <span className="text-sm text-green-400 flex items-center gap-1">✓ Profil disimpan</span>}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium border transition hover:bg-white/5"
                  style={{ borderColor: '#2D2440', color: '#8B7DAB' }}
                >
                  <span className="flex items-center gap-1.5"><X size={14} /> Batal</span>
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: '#7C3AED' }}
                >
                  <span className="flex items-center gap-1.5"><Save size={14} /> Simpan</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: '#7C3AED' }}
              >
                <span className="flex items-center gap-1.5"><Edit2 size={14} /> Edit Profil</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
