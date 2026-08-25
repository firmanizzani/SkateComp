import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Info, ClipboardList, BookOpen,
  Trophy, Settings, LogOut, Menu, X, Home, Users, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Layout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dynamic Navigation based on Role
  let navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profil', path: '/profil', icon: User },
    { label: 'Informasi Lomba', path: '/informasi-lomba', icon: Info },
    { label: 'Pendaftaran', path: '/pendaftaran', icon: ClipboardList },
    { label: 'Riwayat Daftar', path: '/riwayat-daftar', icon: BookOpen },
    { label: 'Hasil Perlombaan', path: '/hasil-perlombaan', icon: Trophy },
    { label: 'Pengaturan Akun', path: '/pengaturan-akun', icon: Settings },
  ];

  let bottomNav = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Lomba', path: '/informasi-lomba', icon: Info },
    { label: 'Daftar', path: '/pendaftaran', icon: ClipboardList },
    { label: 'Riwayat', path: '/riwayat-daftar', icon: BookOpen },
    { label: 'Profil', path: '/profil', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems = [
      { label: 'Dashboard Admin', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Kelola Peserta', path: '/admin/peserta', icon: Users },
      { label: 'Kelola Juri', path: '/admin/juri', icon: UserCheck },
      { label: 'Rekap Nilai', path: '/admin/rekap', icon: Trophy },
      { label: 'Pengaturan Akun', path: '/pengaturan-akun', icon: Settings },
    ];

    bottomNav = [
      { label: 'Home', path: '/admin/dashboard', icon: Home },
      { label: 'Peserta', path: '/admin/peserta', icon: Users },
      { label: 'Juri', path: '/admin/juri', icon: UserCheck },
      { label: 'Rekap', path: '/admin/rekap', icon: Trophy },
    ];
  } else if (user?.role === 'juri') {
    navItems = [
      { label: 'Dashboard Juri', path: '/juri/dashboard', icon: LayoutDashboard },
      { label: 'Pengaturan Akun', path: '/pengaturan-akun', icon: Settings },
    ];

    bottomNav = [
      { label: 'Home', path: '/juri/dashboard', icon: Home },
      { label: 'Profil', path: '/profil', icon: User },
      { label: 'Settings', path: '/pengaturan-akun', icon: Settings },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/informasi-lomba') return location.pathname.startsWith('/informasi-lomba');
    return location.pathname === path;
  };

  const avatarInitial = user?.namaLengkap?.[0]?.toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-4">
        <Logo />
      </div>

      {/* User info */}
      <div className="px-4 pb-4" style={{ borderBottom: '1px solid #2D2440' }}>
        <div className="flex items-center gap-3 px-1 py-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0"
            style={{ background: user?.foto ? 'transparent' : '#7C3AED' }}
          >
            {user?.foto ? (
               <img src={user.foto} alt="avatar" className="w-full h-full object-cover" />
            ) : avatarInitial}
          </div>
          <span className="text-sm font-medium text-white truncate">{user?.namaLengkap || 'User'}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(path)
                ? 'text-white'
                : 'hover:bg-white/5'
            }`}
            style={isActive(path) ? { background: '#7C3AED', color: '#fff' } : { color: '#8B7DAB' }}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #2D2440' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all hover:bg-red-500/10"
          style={{ color: '#EF4444' }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0710' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-52 flex-shrink-0 h-full"
        style={{ background: '#120D1E', borderRight: '1px solid #2D2440' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 h-full w-52 z-50 flex flex-col"
              style={{ background: '#120D1E', borderRight: '1px solid #2D2440' }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4"
                style={{ color: '#8B7DAB' }}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-4 md:px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #2D2440', background: '#0A0710' }}
        >
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{ color: '#8B7DAB' }}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-base font-semibold" style={{ color: '#8B7DAB' }}>{title}</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          className="md:hidden flex items-center justify-around px-2 py-2 flex-shrink-0"
          style={{ background: '#120D1E', borderTop: '1px solid #2D2440' }}
        >
          {bottomNav.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition"
              style={{ color: isActive(path) ? '#A78BFA' : '#8B7DAB' }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10 }}>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
