const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/admin/statistik - Dashboard stats
router.get('/statistik', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [totalPeserta, totalJuri, totalPendaftaran, pendaftaranMenunggu, penilaianSelesai] = await Promise.all([
      prisma.peserta.count(),
      prisma.juri.count(),
      prisma.pendaftaran.count(),
      prisma.pendaftaran.count({ where: { status_pendaftaran: 'Menunggu' } }),
      prisma.penilaian.count({ where: { nilai_akhir: { not: null } } }),
    ]);

    // Revenue from verified+paid registrations
    const verified = await prisma.pendaftaran.findMany({
      where: { status_pendaftaran: 'Terverifikasi' },
      include: { jadwal: { include: { jenisLomba: true } } }
    });
    const totalRevenue = verified.reduce((sum, p) => sum + Number(p.jadwal.jenisLomba.biaya_pendaftaran), 0);

    return res.json({
      success: true,
      data: { totalPeserta, totalJuri, totalPendaftaran, pendaftaranMenunggu, penilaianSelesai, totalRevenue }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/rekap-nilai - Full leaderboard
router.get('/rekap-nilai', verifyToken, requireRole('admin', 'juri'), async (req, res) => {
  try {
    const { lomba } = req.query;
    const penilaian = await prisma.penilaian.findMany({
      where: lomba ? { pendaftaran: { jadwal: { jenisLomba: { nama_lomba: lomba } } } } : {},
      include: {
        pendaftaran: {
          include: {
            peserta: { select: { nama_peserta: true, nomor_bib: true } },
            jadwal: { include: { jenisLomba: true, kategori: true } }
          }
        },
        juri: { select: { nama_juri: true } }
      },
      orderBy: { nilai_akhir: 'desc' }
    });
    return res.json({ success: true, data: penilaian });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/pemenang - List all winners
router.get('/pemenang', verifyToken, async (req, res) => {
  try {
    const pemenang = await prisma.pemenang.findMany({
      include: {
        jadwal: { include: { jenisLomba: true, kategori: true } },
        pendaftaran: { include: { peserta: { select: { nama_peserta: true, nomor_bib: true } } } }
      },
      orderBy: [{ id_jadwal: 'asc' }, { peringkat: 'asc' }]
    });
    return res.json({ success: true, data: pemenang });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
