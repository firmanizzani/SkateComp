const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/peserta - Admin only: get all peserta
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const pesertaList = await prisma.peserta.findMany({
      select: {
        id_peserta: true,
        nama_peserta: true,
        tanggal_lahir: true,
        jenis_kelamin: true,
        alamat: true,
        no_hp: true,
        email: true,
        nomor_bib: true,
        pendaftaran: {
          select: {
            id_pendaftaran: true,
            status_pendaftaran: true,
            jadwal: {
              select: {
                jenisLomba: { select: { nama_lomba: true } },
                kategori: { select: { nama_kategori: true } },
              }
            }
          }
        }
      },
      orderBy: { nama_peserta: 'asc' }
    });
    return res.json({ success: true, data: pesertaList });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/peserta/:id - Admin or the peserta themselves
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }
    const peserta = await prisma.peserta.findUnique({
      where: { id_peserta: id },
      select: {
        id_peserta: true, nama_peserta: true, tanggal_lahir: true,
        jenis_kelamin: true, alamat: true, no_hp: true, email: true, nomor_bib: true,
        pendaftaran: {
          include: {
            jadwal: { include: { jenisLomba: true, kategori: true } },
            pembayaran: true,
            penilaian: true,
            pemenang: true,
          }
        }
      }
    });
    if (!peserta) return res.status(404).json({ success: false, message: 'Peserta tidak ditemukan.' });
    return res.json({ success: true, data: peserta });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/peserta/:id - Update peserta profile
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }
    const { nama_peserta, no_hp, alamat } = req.body;
    const updated = await prisma.peserta.update({
      where: { id_peserta: id },
      data: { nama_peserta, no_hp, alamat },
      select: { id_peserta: true, nama_peserta: true, email: true, no_hp: true, alamat: true, nomor_bib: true }
    });
    return res.json({ success: true, message: 'Profil berhasil diupdate.', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
