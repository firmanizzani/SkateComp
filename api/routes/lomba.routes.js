const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /api/lomba/jenis - Get all event types
router.get('/jenis', verifyToken, async (req, res) => {
  try {
    const data = await prisma.jenisLomba.findMany({ orderBy: { nama_lomba: 'asc' } });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/lomba/kategori - Get all categories
router.get('/kategori', verifyToken, async (req, res) => {
  try {
    const data = await prisma.kategoriLomba.findMany({ orderBy: { nama_kategori: 'asc' } });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/lomba/jadwal - Get all schedules
router.get('/jadwal', verifyToken, async (req, res) => {
  try {
    const data = await prisma.jadwalLomba.findMany({
      include: { jenisLomba: true, kategori: true },
      orderBy: { tanggal_lomba: 'asc' }
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/lomba/jadwal/:id
router.get('/jadwal/:id', verifyToken, async (req, res) => {
  try {
    const data = await prisma.jadwalLomba.findUnique({
      where: { id_jadwal: req.params.id },
      include: { jenisLomba: true, kategori: true, pendaftaran: { include: { peserta: true } } }
    });
    if (!data) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
