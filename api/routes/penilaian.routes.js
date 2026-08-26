const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// GET /api/penilaian - Get scores (Filtered by role: juri gets their own, admin gets all, peserta gets their own)
router.get('/', verifyToken, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'juri') {
      where.id_juri = req.user.id;
    }

    const data = await prisma.penilaian.findMany({
      where,
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
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/penilaian - Juri: submit score
router.post('/', verifyToken, requireRole('juri'), async (req, res) => {
  try {
    const { id_pendaftaran, aspek_1, aspek_2, aspek_3, catatan_penilaian } = req.body;
    const id_juri = req.user.id;

    if (!id_pendaftaran || aspek_1 == null || aspek_2 == null || aspek_3 == null) {
      return res.status(400).json({ success: false, message: 'id_pendaftaran dan ketiga aspek wajib diisi.' });
    }

    // Check if this juri already scored this registration
    const existing = await prisma.penilaian.findFirst({ where: { id_pendaftaran, id_juri } });

    const nilai_akhir = ((Number(aspek_1) + Number(aspek_2) + Number(aspek_3)) / 3).toFixed(2);

    const count = await prisma.penilaian.count();
    const id_penilaian = `PN${String(count + 1).padStart(4, '0')}`;

    let penilaian;
    if (existing) {
      // Update existing
      penilaian = await prisma.penilaian.update({
        where: { id_penilaian: existing.id_penilaian },
        data: { aspek_1, aspek_2, aspek_3, nilai_akhir, catatan_penilaian: catatan_penilaian || null }
      });
    } else {
      penilaian = await prisma.penilaian.create({
        data: { id_penilaian, id_pendaftaran, id_juri, aspek_1, aspek_2, aspek_3, nilai_akhir, catatan_penilaian: catatan_penilaian || null }
      });
    }

    return res.status(201).json({ success: true, message: 'Penilaian berhasil disimpan.', data: penilaian });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
