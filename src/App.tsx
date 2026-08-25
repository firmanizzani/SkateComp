import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilPage from './pages/ProfilPage';
import InformasiLombaPage from './pages/InformasiLombaPage';
import DetailLombaPage from './pages/DetailLombaPage';
import JadwalLombaPage from './pages/JadwalLombaPage';
import PendaftaranPage from './pages/PendaftaranPage';
import RiwayatDaftarPage from './pages/RiwayatDaftarPage';
import HasilPerlombaanPage from './pages/HasilPerlombaanPage';
import PengaturanAkunPage from './pages/PengaturanAkunPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPesertaPage from './pages/AdminPesertaPage';
import AdminJuriPage from './pages/AdminJuriPage';
import AdminRekapPage from './pages/AdminRekapPage';

// Juri Pages
import JuriDashboardPage from './pages/JuriDashboardPage';

export default function App() {
  return (
    <BrowserRouter basename={window.location.pathname.startsWith('/Lomba-InlineSkate') ? '/Lomba-InlineSkate' : ''}>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected - Peserta Only */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['peserta']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute allowedRoles={['peserta', 'juri', 'admin']}><ProfilPage /></ProtectedRoute>} />
          <Route path="/informasi-lomba" element={<ProtectedRoute allowedRoles={['peserta']}><InformasiLombaPage /></ProtectedRoute>} />
          <Route path="/informasi-lomba/:id" element={<ProtectedRoute allowedRoles={['peserta']}><DetailLombaPage /></ProtectedRoute>} />
          <Route path="/jadwal-lomba" element={<ProtectedRoute allowedRoles={['peserta']}><JadwalLombaPage /></ProtectedRoute>} />
          <Route path="/pendaftaran" element={<ProtectedRoute allowedRoles={['peserta']}><PendaftaranPage /></ProtectedRoute>} />
          <Route path="/riwayat-daftar" element={<ProtectedRoute allowedRoles={['peserta']}><RiwayatDaftarPage /></ProtectedRoute>} />
          <Route path="/hasil-perlombaan" element={<ProtectedRoute allowedRoles={['peserta']}><HasilPerlombaanPage /></ProtectedRoute>} />
          <Route path="/pengaturan-akun" element={<ProtectedRoute allowedRoles={['peserta', 'juri', 'admin']}><PengaturanAkunPage /></ProtectedRoute>} />

          {/* Protected - Juri Only */}
          <Route path="/juri/dashboard" element={<ProtectedRoute allowedRoles={['juri']}><JuriDashboardPage /></ProtectedRoute>} />

          {/* Protected - Admin Only */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/peserta" element={<ProtectedRoute allowedRoles={['admin']}><AdminPesertaPage /></ProtectedRoute>} />
          <Route path="/admin/juri" element={<ProtectedRoute allowedRoles={['admin']}><AdminJuriPage /></ProtectedRoute>} />
          <Route path="/admin/rekap" element={<ProtectedRoute allowedRoles={['admin']}><AdminRekapPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
