import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { getCurrentUser, setCurrentUser, getUsers, saveUsers, seedDemoData } from '../lib/data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (data: Omit<User, 'id' | 'createdAt' | 'bibNumber' | 'role'>) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    seedDemoData();
    const u = getCurrentUser();
    setUser(u);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: 'Email atau password salah' };
    setCurrentUser(found);
    setUser(found);
    return { ok: true, user: found };
  }, []);

  const register = useCallback((data: Omit<User, 'id' | 'createdAt' | 'bibNumber' | 'role'>) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'Email sudah terdaftar' };
    }
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      role: 'peserta',
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    setUser(newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
      setUser(users[idx]);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
