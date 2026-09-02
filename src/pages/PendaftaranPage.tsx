import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Upload, Trash2, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  LOMBA_LIST, JADWAL_LIST, getKategoriFromProfile, formatRupiah
} from '../lib/data';

const STEPS = ['Pilih Lomba', 'Data Peserta', 'Konfirmasi', 'Pembayaran', 'Selesai'];

// ─── STEP INDICATOR ─────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6 overflow-x-auto">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
              style={{
                borderColor: i + 1 <= current ? '#7C3AED' : '#2D2440',
                background: i + 1 === current ? '#7C3AED' : i + 1 < current ? '#7C3AED22' : '#1A1428',
                color: i + 1 <= current ? (i + 1 === current ? '#fff' : '#A78BFA') : '#8B7DAB',
              }}
            >
              {i + 1 < current ? <Check size={14} /> : i + 1}
            </div>
            <span className="text-xs mt-1 whitespace-nowrap hidden sm:block" style={{ color: i + 1 === current ? '#F1EEF8' : '#8B7DAB' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="w-8 sm:w-14 h-0.5 mx-1 mt-0 sm:-mt-4 transition-all" style={{ background: i + 1 < current ? '#7C3AED' : '#2D2440' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── STEP 1: Pilih Lomba ────────────────────────────────────────
function Step1({ selected, onSelect, kategori, setKategori, availableKategori }: {
  selected: string[]; onSelect: (id: string) => void;
  kategori: string; setKategori: (k: string) => void;
  availableKategori: string[];
}) {
  const LombaCard = ({ lomba }: { lomba: typeof LOMBA_LIST[0] }) => {
    const active = selected.includes(lomba.id);
    const iconMap: Record<string, React.ReactNode> = {
      'Classic Slalom': <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><polygon points="16,2 22,14 10,14" fill="#A78BFA"/><circle cx="16" cy="22" r="8" fill="#7C3AED" opacity="0.7"/></svg>,
      'Freestyle Slide': <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="20" cy="7" r="4" fill="#A78BFA"/><path d="M6 26 C6 26, 11 16, 16 14 C19 13, 21 14, 22 16 L25 24" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="12" cy="27" r="2.5" fill="#7C3AED"/><circle cx="23" cy="27" r="2.5" fill="#7C3AED"/></svg>,
      'Speed Slalom': <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="#A78BFA" strokeWidth="2" fill="none"/><path d="M16 8 L16 16 L22 16" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/></svg>,
      'Skate Race': <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="3" y="13" width="26" height="6" rx="1.5" fill="#7C3AED" opacity="0.4"/><path d="M3 13 L16 4 L29 13" stroke="#A78BFA" strokeWidth="2" fill="none"/><path d="M3 19 L16 28 L29 19" stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.4"/></svg>,
    };

    return (
      <button
        onClick={() => onSelect(lomba.id)}
        className="rounded-xl p-4 flex flex-col items-start gap-3 w-full transition-all border-2"
        style={{
          background: active ? '#2D1B69' : '#1A1428',
          borderColor: active ? '#7C3AED' : '#2D2440',
        }}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2D2440' }}>
              {iconMap[lomba.nama]}
            </div>
            <div className="text-left">
              <p className="font-semibold text-white text-sm">{lomba.nama}</p>
              <p className="text-sm font-medium" style={{ color: '#A78BFA' }}>{formatRupiah(lomba.biaya)}</p>
            </div>
          </div>
          {active && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: '#7C3AED' }}><Check size={12} color="#fff" /></div>}
        </div>
      </button>
    );
  };

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-1">Pilih Jenis Lomba</h3>
      <p className="text-sm mb-4" style={{ color: '#8B7DAB' }}>Pilih jenis lomba yang ingin diikuti</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {LOMBA_LIST.map(l => <LombaCard key={l.id} lomba={l} />)}
      </div>

      {selected.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Pilih Kategori</h3>
          <p className="text-sm mb-3" style={{ color: '#8B7DAB' }}>
            Kategori yang tersedia sesuai dengan data diri Anda
          </p>
          <div className="flex flex-col gap-2">
            {availableKategori.map(k => (
              <label key={k} className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border transition" style={{ background: kategori === k ? '#1A1428' : 'transparent', borderColor: '#2D2440' }}>
                <input
                  type="radio"
                  name="kategori"
                  value={k}
                  checked={kategori === k}
                  onChange={() => setKategori(k)}
                  className="accent-purple-600"
                />
                <span className="text-sm text-white">{k}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 2: Data Peserta ────────────────────────────────────────
function Step2({ user }: { user: any }) {
  const formatTanggal = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const rows = [
    { label: 'Nama Lengkap', value: user?.namaLengkap || '-' },
    { label: 'Tanggal Lahir', value: formatTanggal(user?.tanggalLahir || '') },
    { label: 'Jenis Kelamin', value: user?.jenisKelamin || '-' },
    { label: 'No. HP', value: user?.noHp || '-' },
    { label: 'Email', value: user?.email || '-' },
    { label: 'Alamat', value: user?.alamat || '-' },
    { label: 'Nomor BIB', value: user?.bibNumber || 'Akan dibuat setelah pembayaran terverifikasi' },
  ];

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-1">Data Peserta</h3>
      <p className="text-sm mb-4" style={{ color: '#8B7DAB' }}>Periksa kembali data diri Anda</p>
      <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #2D2440' }}>
        {rows.map((row, i) => (
          <div key={i} className="flex" style={{ borderBottom: i < rows.length - 1 ? '1px solid #2D2440' : undefined }}>
            <div className="w-36 md:w-44 px-4 py-3 text-sm flex-shrink-0" style={{ color: '#8B7DAB', background: '#1A1428' }}>{row.label}</div>
            <div className="flex-1 px-4 py-3 text-sm" style={{ color: row.label === 'Nomor BIB' && !user?.bibNumber ? '#8B7DAB' : '#F1EEF8' }}>{row.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
        <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
        <p style={{ color: '#8B7DAB' }}>Pastikan data di atas sudah benar. Jika ingin mengubah data, silakan ubah di menu Profil</p>
      </div>
    </div>
  );
}

// ─── STEP 3: Konfirmasi ─────────────────────────────────────────
function Step3({ selectedLomba, kategori, user, agreed, setAgreed }: {
  selectedLomba: typeof LOMBA_LIST[0][];
  kategori: string; user: any;
  agreed: boolean; setAgreed: (v: boolean) => void;
}) {
  const jadwal = JADWAL_LIST.find(j => j.lomba === selectedLomba[0]?.nama && j.kategori === kategori);
  const total = selectedLomba.reduce((s, l) => s + l.biaya, 0);

  const rows = [
    { label: 'Peserta', value: user?.namaLengkap },
    { label: 'Lomba', value: selectedLomba.map(l => l.nama).join(', ') },
    { label: 'Kategori', value: kategori },
    { label: 'Tanggal Lomba', value: jadwal?.tanggal || '-' },
    { label: 'Lokasi', value: jadwal ? `Arena ${jadwal.lokasi.replace('Arena ', '')}` : '-' },
    { label: 'Biaya Pendaftaran', value: selectedLomba.map(l => formatRupiah(l.biaya)).join(' + ') },
  ];

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-1">Konfirmasi Pendaftaran</h3>
      <p className="text-sm mb-4" style={{ color: '#8B7DAB' }}>Periksa ringkasan pendaftaran Anda</p>

      <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #2D2440' }}>
        {rows.map((row, i) => (
          <div key={i} className="flex" style={{ borderBottom: '1px solid #2D2440' }}>
            <div className="w-36 md:w-44 px-4 py-3 text-sm flex-shrink-0" style={{ color: '#8B7DAB', background: '#1A1428' }}>{row.label}</div>
            <div className="flex-1 px-4 py-3 text-sm text-white">{row.value}</div>
          </div>
        ))}
        <div className="flex items-center" style={{ background: '#2D1B69' }}>
          <div className="w-36 md:w-44 px-4 py-3 text-sm font-bold flex-shrink-0 text-white">Total Pembayaran</div>
          <div className="flex-1 px-4 py-3 text-sm font-bold" style={{ color: '#F1EEF8', fontFamily: 'Space Mono, monospace', fontSize: 15 }}>{formatRupiah(total)}</div>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-purple-600 flex-shrink-0"
        />
        <span className="text-sm" style={{ color: '#8B7DAB' }}>
          Saya memastikan data pendaftaran sudah benar dan menyetujui peraturan perlombaan
        </span>
      </label>
    </div>
  );
}

// ─── STEP 4: Pembayaran ─────────────────────────────────────────
function Step4({ total, bukti, setBukti, metode, setMetode }: {
  total: number;
  bukti: File | null; setBukti: (f: File | null) => void;
  metode: 'QRIS' | 'Transfer Bank'; setMetode: (m: 'QRIS' | 'Transfer Bank') => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(val);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File maksimal 5MB'); return; }
    setBukti(file);
  };

  const banks = [
    { name: 'Bank Central Asia', short: 'BCA', no: '1234 5678 8010', an: 'a.n. Inline Skate Competition', color: '#006FBA' },
    { name: 'Bank Republik Indonesia', short: 'BRI', no: '0987 6543 2100', an: 'a.n. Inline Skate Competition', color: '#00529B' },
    { name: 'Bank Mandiri', short: 'mandiri', no: '1122 3344 5566', an: 'a.n. Inline Skate Competition', color: '#003D7A' },
  ];

  return (
    <div>
      {/* Tab */}
      <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #2D2440' }}>
        {(['QRIS', 'Transfer Bank'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMetode(m)}
            className="flex-1 py-2.5 text-sm font-medium transition"
            style={metode === m ? { background: '#7C3AED', color: '#fff' } : { background: '#1A1428', color: '#8B7DAB' }}
          >
            {m}
          </button>
        ))}
      </div>

      {metode === 'QRIS' ? (
        <div>
          <p className="text-sm mb-3" style={{ color: '#8B7DAB' }}>Scan QR Code di bawah ini menggunakan aplikasi pembayaran Anda</p>
          <div className="flex flex-col items-center">
            <div className="rounded-xl p-4 mb-3" style={{ background: '#fff', width: 180, height: 180 }}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                {/* QR Code visual dummy */}
                {Array.from({ length: 10 }, (_, r) =>
                  Array.from({ length: 10 }, (_, c) => {
                    const parity = (r + c + r * c) % 3 === 0 || (r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3);
                    return parity ? <rect key={`${r}-${c}`} x={c * 10} y={r * 10} width={9} height={9} fill="#1a1428" /> : null;
                  })
                )}
                {/* Corner markers */}
                <rect x="0" y="0" width="28" height="28" fill="none" stroke="#1a1428" strokeWidth="3"/>
                <rect x="5" y="5" width="18" height="18" fill="#1a1428"/>
                <rect x="9" y="9" width="10" height="10" fill="white"/>
                <rect x="72" y="0" width="28" height="28" fill="none" stroke="#1a1428" strokeWidth="3"/>
                <rect x="77" y="5" width="18" height="18" fill="#1a1428"/>
                <rect x="81" y="9" width="10" height="10" fill="white"/>
                <rect x="0" y="72" width="28" height="28" fill="none" stroke="#1a1428" strokeWidth="3"/>
                <rect x="5" y="77" width="18" height="18" fill="#1a1428"/>
                <rect x="9" y="81" width="10" height="10" fill="white"/>
              </svg>
            </div>
            <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2" style={{ background: '#2D1B69', border: '1px solid #7C3AED' }}>
              <span className="text-sm" style={{ color: '#8B7DAB' }}>Total Pembayaran</span>
              <span className="font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{formatRupiah(total)}</span>
            </div>
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg w-full text-xs" style={{ background: '#1A1428', color: '#8B7DAB' }}>
              <Info size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#A78BFA' }} />
              QR Code berlaku selama 30 menit. Selesaikan pembayaran sebelum waktu habis
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm mb-3" style={{ color: '#8B7DAB' }}>Lakukan transfer ke salah satu rekening berikut:</p>
          <div className="flex flex-col gap-2 mb-3">
            {banks.map(b => (
              <div key={b.short} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
                <div className="w-14 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white text-xs" style={{ background: b.color }}>
                  {b.short === 'mandiri' ? 'mandiri' : b.short}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white">{b.name}</p>
                  <p className="font-bold text-white text-sm" style={{ fontFamily: 'Space Mono, monospace' }}>{b.no}</p>
                  <p className="text-xs" style={{ color: '#8B7DAB' }}>{b.an}</p>
                </div>
                <button
                  onClick={() => handleCopy(b.no.replace(/\s/g, ''))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
                  style={{ background: '#7C3AED', color: '#fff' }}
                >
                  {copied === b.no.replace(/\s/g, '') ? <Check size={12} /> : 'Salin'}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-3" style={{ background: '#2D1B69', border: '1px solid #7C3AED' }}>
            <span className="text-sm" style={{ color: '#8B7DAB' }}>Total Pembayaran</span>
            <span className="font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>{formatRupiah(total)}</span>
          </div>
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs mb-3" style={{ background: '#1A1428', border: '1px solid #F59E0B44', color: '#F59E0B' }}>
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            <span><strong>Penting!</strong> Setelah melakukan pembayaran jangan lupa unggah bukti pembayaran</span>
          </div>
        </div>
      )}

      {/* Upload */}
      <h4 className="text-sm font-bold text-white mt-4 mb-1">Upload Bukti Pembayaran</h4>
      <p className="text-xs mb-3" style={{ color: '#8B7DAB' }}>Unggah bukti pembayaran Anda</p>

      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />

      {!bukti ? (
        <div
          className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors"
          style={{ borderColor: dragging ? '#7C3AED' : '#2D2440', background: dragging ? '#2D1B6920' : '#1A1428' }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <Upload size={28} style={{ color: '#8B7DAB' }} />
          <p className="text-sm" style={{ color: '#8B7DAB' }}>Klik atau drag file ke sini</p>
          <p className="text-xs" style={{ color: '#6B5A8A' }}>JPG, PNG, PDF (Maks. 5MB)</p>
        </div>
      ) : (
        <div className="rounded-xl p-3" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
          <p className="text-xs mb-2" style={{ color: '#8B7DAB' }}>File yang diunggah</p>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#0A0710', border: '1px solid #2D2440' }}>
            <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#5B21B6' }}>
              <span className="text-xs text-white font-bold">{bukti.name.split('.').pop()?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{bukti.name}</p>
              <p className="text-xs" style={{ color: '#8B7DAB' }}>{(bukti.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => setBukti(null)} style={{ color: '#EF4444' }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 5: Selesai ────────────────────────────────────────────
function Step5({ onLihatRiwayat, onDashboard }: {
  onLihatRiwayat: () => void; onDashboard: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
        <Check size={32} color="white" />
      </div>
      <h3 className="text-xl font-bold text-white">Pembayaran Berhasil Dikirim!</h3>
      <p className="text-sm text-center" style={{ color: '#8B7DAB' }}>Terima kasih, pembayaran Anda telah kami terima.</p>

      <div className="w-full rounded-xl p-4 mt-2" style={{ background: '#1A1428', border: '1px solid #2D2440' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">Status Pembayaran</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: '#F59E0B10', border: '1px solid #F59E0B33' }}>
          <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>⏳ Menunggu Verifikasi</span>
        </div>
        <p className="text-xs mt-2" style={{ color: '#8B7DAB' }}>Admin akan memverifikasi pembayaran Anda maksimal 1×24 jam.</p>
      </div>

      <button
        onClick={onLihatRiwayat}
        className="w-full py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
        style={{ background: '#7C3AED' }}
      >
        Lihat Riwayat Daftar
      </button>
      <button
        onClick={onDashboard}
        className="w-full py-3 rounded-xl font-semibold transition hover:bg-white/5"
        style={{ border: '1px solid #2D2440', color: '#F1EEF8' }}
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────
export default function PendaftaranPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedLombaIds, setSelectedLombaIds] = useState<string[]>([]);
  const [kategori, setKategori] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [metode, setMetode] = useState<'QRIS' | 'Transfer Bank'>('QRIS');
  const [bukti, setBukti] = useState<File | null>(null);
  const [, setPendaftaranIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dbJadwalList, setDbJadwalList] = useState<any[]>([]);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const res = await apiFetch('/api/lomba/jadwal');
        const data = await res.json();
        if (data.success) {
          setDbJadwalList(data.data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil data jadwal', err);
      }
    };
    fetchJadwal();
  }, []);

  const availableKategori = user
    ? [getKategoriFromProfile(user.jenisKelamin ?? '', user.tanggalLahir ?? '')]
    : [];

  const selectedLomba = LOMBA_LIST.filter(l => selectedLombaIds.includes(l.id));
  const total = selectedLomba.reduce((s, l) => s + l.biaya, 0);

  const toggleLomba = (id: string) => {
    setSelectedLombaIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (step === 1) {
      if (selectedLombaIds.length === 0) { setError('Pilih minimal 1 jenis lomba'); return false; }
      if (!kategori) { setError('Pilih kategori'); return false; }
    }
    if (step === 3 && !agreed) { setError('Centang persetujuan peraturan'); return false; }
    if (step === 4 && !bukti) { setError('Upload bukti pembayaran terlebih dahulu'); return false; }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          };
          img.onerror = () => reject(new Error('Gagal memuat gambar'));
          img.src = e.target?.result as string;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      }
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) return;
    setSubmitting(true);
    setError('');

    try {
      let buktiDataUrl = '';
      if (bukti) {
        try {
          buktiDataUrl = await convertFileToBase64(bukti);
        } catch (e) {
          console.error('Gagal membaca file bukti', e);
        }
      }

      const createdIds: string[] = [];

      for (const lomba of selectedLomba) {
        // Find matching schedule in database based on nama_lomba and nama_kategori
        const matchingJadwal = dbJadwalList.find(j => {
          const matchLomba = j.jenisLomba?.nama_lomba?.toLowerCase() === lomba.nama?.toLowerCase();
          const matchKategori = j.kategori?.nama_kategori?.toLowerCase() === kategori?.toLowerCase();
          return matchLomba && matchKategori;
        });

        if (!matchingJadwal) {
          setError(`Jadwal tidak ditemukan di database untuk ${lomba.nama} (${kategori}).`);
          setSubmitting(false);
          return;
        }

        const res = await apiFetch('/api/pendaftaran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_jadwal: matchingJadwal.id_jadwal,
            bukti_pembayaran: buktiDataUrl || bukti?.name || 'bukti_pembayaran.png'
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || 'Gagal mendaftar lomba.');
          setSubmitting(false);
          return;
        }

        if (data.data?.id_pendaftaran) {
          createdIds.push(data.data.id_pendaftaran);
        }
      }

      setPendaftaranIds(createdIds);
      setStep(5);
    } catch (err: any) {
      setError('Gagal menyimpan pendaftaran ke server: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Pendaftaran">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: '#120D1E', border: '1px solid #2D2440' }}>
          <h2 className="text-xl font-bold text-white mb-1">Pendaftaran Lomba</h2>
          <p className="text-sm mb-5" style={{ color: '#8B7DAB' }}>Ikuti langkah-langkah pendaftaran di bawah ini</p>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <Step1
                  selected={selectedLombaIds}
                  onSelect={toggleLomba}
                  kategori={kategori}
                  setKategori={setKategori}
                  availableKategori={availableKategori}
                />
              )}
              {step === 2 && <Step2 user={user} />}
              {step === 3 && (
                <Step3
                  selectedLomba={selectedLomba}
                  kategori={kategori}
                  user={user}
                  agreed={agreed}
                  setAgreed={setAgreed}
                />
              )}
              {step === 4 && (
                <Step4
                  total={total}
                  bukti={bukti}
                  setBukti={setBukti}
                  metode={metode}
                  setMetode={setMetode}
                />
              )}
              {step === 5 && (
                <Step5
                  onLihatRiwayat={() => navigate('/riwayat-daftar')}
                  onDashboard={() => navigate('/dashboard')}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-xs text-red-400 mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
              {error}
            </p>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid #2D2440' }}>
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition hover:bg-white/5 disabled:opacity-50"
                  style={{ borderColor: '#2D2440', color: '#F1EEF8' }}
                >
                  <ArrowLeft size={15} /> Kembali
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: '#7C3AED' }}
                >
                  Lanjutkan <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#7C3AED' }}
                >
                  {submitting ? 'Memproses...' : 'Kirim Pembayaran'} <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
