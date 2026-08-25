import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  role: 'admin' | 'juri' | 'peserta';
  no_hp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  nomor_bib?: string;
  foto?: string;
  // Alias fields untuk backward compatibility
  namaLengkap?: string;
  noHp?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  bibNumber?: string;
}

interface LoginResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
}

interface RegisterData {
  nama_peserta: string;
  email: string;
  password: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat?: string;
  no_hp?: string;
}

interface RegisterResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => Promise<{ ok: boolean; error?: string }>;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Helper ──────────────────────────────────────────────────────────────────
function normalizeUser(raw: Record<string, string>, role: string): AuthUser {
  const jenisKelaminRaw = raw.jenis_kelamin;
  const jenisKelaminFormatted = jenisKelaminRaw === 'L' ? 'Laki-laki' : jenisKelaminRaw === 'P' ? 'Perempuan' : jenisKelaminRaw;
  const nama = raw.nama_peserta || raw.nama_juri || raw.nama_admin || '';
  return {
    id: raw.id_peserta || raw.id_juri || raw.id_admin || '',
    nama,
    email: raw.email,
    role: role as AuthUser['role'],
    no_hp: raw.no_hp,
    tanggal_lahir: raw.tanggal_lahir,
    jenis_kelamin: jenisKelaminRaw,
    alamat: raw.alamat,
    nomor_bib: raw.nomor_bib,
    // Alias fields
    namaLengkap: nama,
    noHp: raw.no_hp,
    tanggalLahir: raw.tanggal_lahir,
    jenisKelamin: jenisKelaminFormatted,
    bibNumber: raw.nomor_bib,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Cek token saat pertama kali load halaman
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Verifikasi token dengan memanggil /api/auth/me
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(normalizeUser(data.user, data.user.role));
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { ok: false, error: data.message || 'Email atau password salah' };
      }

      localStorage.setItem('token', data.token);
      const normalizedUser = normalizeUser(data.user, data.user.role);
      setUser(normalizedUser);
      return { ok: true, user: normalizedUser };
    } catch {
      return { ok: false, error: 'Gagal menghubungi server. Periksa koneksi internet Anda.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<RegisterResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        return { ok: false, error: result.message || 'Registrasi gagal' };
      }

      localStorage.setItem('token', result.token);
      setUser(normalizeUser(result.user, 'peserta'));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Gagal menghubungi server. Periksa koneksi internet Anda.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<AuthUser>): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Tidak ada user yang login.' };
    try {
      const token = localStorage.getItem('token');
      // Map alias fields back to backend fields
      const body: Record<string, string | undefined> = {};
      if (updates.nama || updates.namaLengkap) body.nama_peserta = updates.nama || updates.namaLengkap;
      if (updates.no_hp || updates.noHp) body.no_hp = updates.no_hp || updates.noHp;
      if (updates.alamat) body.alamat = updates.alamat;
      if (updates.foto) { setUser(u => u ? { ...u, ...updates } : null); return { ok: true }; }
      
      if (user.role === 'peserta') {
        const res = await fetch(`/api/peserta/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.success) return { ok: false, error: data.message };
      }
      
      // Update local state
      setUser(u => {
        if (!u) return null;
        const newUser = { ...u, ...updates };
        // Re-sync alias fields
        if (updates.nama || updates.namaLengkap) { newUser.namaLengkap = newUser.nama; }
        if (updates.no_hp || updates.noHp) { newUser.noHp = newUser.no_hp; }
        return newUser;
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Gagal menghubungi server.' };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
