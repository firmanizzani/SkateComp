const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/juri - Admin only: get all juri
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const juriList = await prisma.juri.findMany({
      select: { id_juri: true, nama_juri: true, email: true, no_hp: true,
        penilaian: { select: { id_penilaian: true } }
      }
    });
    return res.json({ success: true, data: juriList });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/juri - Admin only: create juri account
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { nama_juri, email, password, no_hp } = req.body;
    if (!nama_juri || !email || !password) {
      return res.status(400).json({ success: false, message: 'nama_juri, email, dan password wajib diisi.' });
    }
    const existing = await prisma.juri.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });

    const count = await prisma.juri.count();
    const id_juri = `JR${String(count + 1).padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const juri = await prisma.juri.create({
      data: { id_juri, nama_juri, email, password: hashedPassword, no_hp: no_hp || null },
      select: { id_juri: true, nama_juri: true, email: true, no_hp: true }
    });
    return res.status(201).json({ success: true, message: 'Akun juri berhasil dibuat.', data: juri });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/juri/:id - Admin only: delete juri
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await prisma.juri.delete({ where: { id_juri: req.params.id } });
    return res.json({ success: true, message: 'Akun juri berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
