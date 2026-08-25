const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/pendaftaran - Admin: all, Peserta: own
router.get('/', verifyToken, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'peserta') where.id_peserta = req.user.id;

    const data = await prisma.pendaftaran.findMany({
      where,
      include: {
        peserta: { select: { nama_peserta: true, nomor_bib: true } },
        jadwal: { include: { jenisLomba: true, kategori: true } },
        pembayaran: true,
        penilaian: { include: { juri: { select: { nama_juri: true } } } },
        pemenang: true,
      },
      orderBy: { tanggal_daftar: 'desc' }
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/pendaftaran - Peserta only: register for an event
router.post('/', verifyToken, requireRole('peserta'), async (req, res) => {
  try {
    const { id_jadwal } = req.body;
    if (!id_jadwal) return res.status(400).json({ success: false, message: 'id_jadwal wajib diisi.' });

    const id_peserta = req.user.id;

    // Prevent duplicate registration
    const existing = await prisma.pendaftaran.findFirst({ where: { id_peserta, id_jadwal } });
    if (existing) return res.status(409).json({ success: false, message: 'Anda sudah mendaftar pada jadwal ini.' });

    // Auto-generate ID
    const count = await prisma.pendaftaran.count();
    const id_pendaftaran = `DF${String(count + 1).padStart(3, '0')}`;

    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        id_pendaftaran,
        id_peserta,
        id_jadwal,
        tanggal_daftar: new Date(),
        status_pendaftaran: 'Menunggu',
      },
      include: { jadwal: { include: { jenisLomba: true, kategori: true } } }
    });

    return res.status(201).json({ success: true, message: 'Pendaftaran berhasil dikirim. Menunggu verifikasi admin.', data: pendaftaran });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/pendaftaran/:id/status - Admin only: approve/reject
router.patch('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status_pendaftaran } = req.body;
    if (!['Terverifikasi', 'Ditolak', 'Menunggu'].includes(status_pendaftaran)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }

    let updateData = { status_pendaftaran };

    // If approved, assign BIB number automatically if not set
    if (status_pendaftaran === 'Terverifikasi') {
      const pd = await prisma.pendaftaran.findUnique({ where: { id_pendaftaran: req.params.id }, include: { peserta: true } });
      if (pd && !pd.peserta.nomor_bib) {
        const bibCount = await prisma.peserta.count({ where: { nomor_bib: { not: null } } });
        const newBib = String(1001 + bibCount);
        await prisma.peserta.update({ where: { id_peserta: pd.id_peserta }, data: { nomor_bib: newBib } });
      }
    }

    const updated = await prisma.pendaftaran.update({
      where: { id_pendaftaran: req.params.id },
      data: updateData,
      include: { peserta: { select: { nama_peserta: true, nomor_bib: true } } }
    });
    return res.json({ success: true, message: `Status pendaftaran berhasil diubah ke ${status_pendaftaran}.`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
