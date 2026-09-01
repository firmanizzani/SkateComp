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

// GET /api/admin/rekap-nilai - Full leaderboard, one row per pendaftaran with AVG nilai
router.get('/rekap-nilai', verifyToken, requireRole('admin', 'juri'), async (req, res) => {
  try {
    // 1. Fetch all pendaftaran that are Terverifikasi (or all) with their penilaian
    const allPendaftaran = await prisma.pendaftaran.findMany({
      where: { status_pendaftaran: 'Terverifikasi' },
      include: {
        peserta: { select: { nama_peserta: true, nomor_bib: true } },
        jadwal: { include: { jenisLomba: true, kategori: true } },
        penilaian: {
          select: { id_penilaian: true, nilai_akhir: true, id_juri: true, aspek_1: true, aspek_2: true, aspek_3: true, catatan_penilaian: true }
        }
      }
    });

    // 2. Aggregate: compute ROUND(AVG(nilai_akhir), 2) per pendaftaran
    const aggregated = allPendaftaran.map(pf => {
      const scores = pf.penilaian
        .filter(p => p.nilai_akhir != null)
        .map(p => Number(p.nilai_akhir));

      const jumlah_juri = scores.length;
      const nilai_rata_rata = jumlah_juri > 0
        ? Number((scores.reduce((a, b) => a + b, 0) / jumlah_juri).toFixed(2))
        : null;

      return {
        id_pendaftaran: pf.id_pendaftaran,
        nomor_bib: pf.peserta?.nomor_bib || '-',
        nama_peserta: pf.peserta?.nama_peserta || '-',
        lomba: pf.jadwal?.jenisLomba?.nama_lomba || '-',
        kategori: pf.jadwal?.kategori?.nama_kategori || '-',
        tanggal_lomba: pf.jadwal?.tanggal_lomba || null,
        jumlah_juri_menilai: jumlah_juri,
        nilai_rata_rata,
        penilaian_detail: pf.penilaian
      };
    });

    // 3. Sort by nilai_rata_rata DESC (null last)
    aggregated.sort((a, b) => {
      if (a.nilai_rata_rata === null && b.nilai_rata_rata === null) return 0;
      if (a.nilai_rata_rata === null) return 1;
      if (b.nilai_rata_rata === null) return -1;
      return b.nilai_rata_rata - a.nilai_rata_rata;
    });

    return res.json({ success: true, data: aggregated });
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
