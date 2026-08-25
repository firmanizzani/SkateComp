const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// POST /api/auth/login
// Single login endpoint for all roles (peserta, juri, admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    let userRecord = null;
    let role = null;

    // 1. Check peserta table
    const peserta = await prisma.peserta.findUnique({ where: { email } });
    if (peserta) {
      userRecord = peserta;
      role = 'peserta';
    }

    // 2. Check juri table
    if (!userRecord) {
      const juri = await prisma.juri.findUnique({ where: { email } });
      if (juri) {
        userRecord = juri;
        role = 'juri';
      }
    }

    // 3. Check admin table
    if (!userRecord) {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (admin) {
        userRecord = admin;
        role = 'admin';
      }
    }

    if (!userRecord) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Verify password (support both plain text legacy and hashed)
    let isPasswordValid = false;
    if (userRecord.password.startsWith('$2')) {
      // bcrypt hashed
      isPasswordValid = await bcrypt.compare(password, userRecord.password);
    } else {
      // plain text (legacy from SQL seed - will be migrated on first login)
      isPasswordValid = password === userRecord.password;
      // Auto-upgrade to bcrypt hash on first login
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        if (role === 'peserta') {
          await prisma.peserta.update({ where: { id_peserta: userRecord.id_peserta }, data: { password: hashedPassword } });
        } else if (role === 'juri') {
          await prisma.juri.update({ where: { id_juri: userRecord.id_juri }, data: { password: hashedPassword } });
        } else if (role === 'admin') {
          await prisma.admin.update({ where: { id_admin: userRecord.id_admin }, data: { password: hashedPassword } });
        }
        userRecord.password = hashedPassword;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Build JWT payload
    const idField = role === 'peserta' ? 'id_peserta' : role === 'juri' ? 'id_juri' : 'id_admin';
    const nameField = role === 'peserta' ? 'nama_peserta' : role === 'juri' ? 'nama_juri' : 'nama_admin';

    const payload = {
      id: userRecord[idField],
      nama: userRecord[nameField],
      email: userRecord.email,
      role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Remove password from response
    const { password: _, ...safeUser } = userRecord;

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: { ...safeUser, role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/auth/register (Peserta only)
router.post('/register', async (req, res) => {
  try {
    const { nama_peserta, email, password, tanggal_lahir, jenis_kelamin, alamat, no_hp } = req.body;

    if (!nama_peserta || !email || !password || !tanggal_lahir || !jenis_kelamin) {
      return res.status(400).json({ success: false, message: 'Field wajib: nama_peserta, email, password, tanggal_lahir, jenis_kelamin.' });
    }

    const existing = await prisma.peserta.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-generate ID peserta
    const count = await prisma.peserta.count();
    const id_peserta = `PS${String(count + 1).padStart(3, '0')}`;

    const peserta = await prisma.peserta.create({
      data: {
        id_peserta,
        nama_peserta,
        email,
        password: hashedPassword,
        tanggal_lahir: new Date(tanggal_lahir),
        jenis_kelamin,
        alamat: alamat || null,
        no_hp: no_hp || null,
      },
    });

    const { password: _, ...safeUser } = peserta;

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      user: { ...safeUser, role: 'peserta' },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/auth/me - Get current user info
const { verifyToken } = require('../middleware/auth.middleware');
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { id, role } = req.user;
    let userRecord = null;

    if (role === 'peserta') {
      userRecord = await prisma.peserta.findUnique({ where: { id_peserta: id }, select: { id_peserta: true, nama_peserta: true, email: true, no_hp: true, tanggal_lahir: true, jenis_kelamin: true, alamat: true, nomor_bib: true } });
    } else if (role === 'juri') {
      userRecord = await prisma.juri.findUnique({ where: { id_juri: id }, select: { id_juri: true, nama_juri: true, email: true, no_hp: true } });
    } else if (role === 'admin') {
      userRecord = await prisma.admin.findUnique({ where: { id_admin: id }, select: { id_admin: true, nama_admin: true, email: true } });
    }

    if (!userRecord) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    return res.json({ success: true, user: { ...userRecord, role } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id, role } = req.user;
    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: 'Field wajib diisi.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
    
    let userRecord = null;
    if (role === 'peserta') userRecord = await prisma.peserta.findUnique({ where: { id_peserta: id } });
    else if (role === 'juri') userRecord = await prisma.juri.findUnique({ where: { id_juri: id } });
    else if (role === 'admin') userRecord = await prisma.admin.findUnique({ where: { id_admin: id } });
    
    if (!userRecord) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    
    const valid = await bcrypt.compare(oldPassword, userRecord.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Password lama tidak sesuai.' });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    if (role === 'peserta') await prisma.peserta.update({ where: { id_peserta: id }, data: { password: hashed } });
    else if (role === 'juri') await prisma.juri.update({ where: { id_juri: id }, data: { password: hashed } });
    else if (role === 'admin') await prisma.admin.update({ where: { id_admin: id }, data: { password: hashed } });
    
    return res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
