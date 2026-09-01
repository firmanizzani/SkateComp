import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: ('admin' | 'juri' | 'peserta')[];
}) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#0A0710' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-purple-300">Memuat sesi...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'juri') return <Navigate to="/juri/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}
