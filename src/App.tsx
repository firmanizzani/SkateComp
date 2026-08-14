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

export default function App() {
  return (
    <BrowserRouter basename="/Lomba-InlineSkate">
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
          <Route path="/informasi-lomba" element={<ProtectedRoute><InformasiLombaPage /></ProtectedRoute>} />
          <Route path="/informasi-lomba/:id" element={<ProtectedRoute><DetailLombaPage /></ProtectedRoute>} />
          <Route path="/jadwal-lomba" element={<ProtectedRoute><JadwalLombaPage /></ProtectedRoute>} />
          <Route path="/pendaftaran" element={<ProtectedRoute><PendaftaranPage /></ProtectedRoute>} />
          <Route path="/riwayat-daftar" element={<ProtectedRoute><RiwayatDaftarPage /></ProtectedRoute>} />
          <Route path="/hasil-perlombaan" element={<ProtectedRoute><HasilPerlombaanPage /></ProtectedRoute>} />
          <Route path="/pengaturan-akun" element={<ProtectedRoute><PengaturanAkunPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
