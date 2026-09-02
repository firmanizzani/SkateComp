const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const supabase = require('../lib/supabase');
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
    const { id_jadwal, bukti_pembayaran } = req.body;
    if (!id_jadwal) return res.status(400).json({ success: false, message: 'id_jadwal wajib diisi.' });

    const id_peserta = req.user.id;

    const jadwal = await prisma.jadwalLomba.findUnique({
      where: { id_jadwal },
      include: { jenisLomba: true }
    });

    if (!jadwal) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });

    // Prevent duplicate registration for the same jenis_lomba
    const existing = await prisma.pendaftaran.findFirst({
      where: {
        id_peserta,
        status_pendaftaran: { in: ['Menunggu', 'Terverifikasi'] },
        jadwal: {
          id_jenis_lomba: jadwal.id_jenis_lomba
        }
      }
    });
    if (existing) return res.status(409).json({ success: false, message: `Anda sudah mendaftar pada jenis lomba ${jadwal.jenisLomba.nama_lomba}.` });

    // Auto-generate synced IDs: DF001 <-> PB001
    const lastPendaftaran = await prisma.pendaftaran.findFirst({
      orderBy: { id_pendaftaran: 'desc' }
    });

    let nextNum = 1;
    if (lastPendaftaran && lastPendaftaran.id_pendaftaran) {
      const match = lastPendaftaran.id_pendaftaran.match(/\d+/);
      if (match) {
        nextNum = parseInt(match[0], 10) + 1;
      }
    } else {
      const count = await prisma.pendaftaran.count();
      nextNum = count + 1;
    }

    const seqStr = String(nextNum).padStart(3, '0');
    const id_pendaftaran = `DF${seqStr}`;
    const id_pembayaran = `PB${seqStr}`;

    // Upload bukti pembayaran ke Supabase Storage jika ada (Base64 Data URL)
    let buktiPublicUrl = null;
    if (bukti_pembayaran && bukti_pembayaran.startsWith('data:')) {
      try {
        // Pisahkan header dan data dari Base64 data URL
        const matches = bukti_pembayaran.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpg';
          const fileName = `${id_pendaftaran}_${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('bukti-pembayaran')
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: false,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('bukti-pembayaran')
              .getPublicUrl(fileName);
            buktiPublicUrl = publicUrlData?.publicUrl || null;
          } else {
            console.error('Upload Storage gagal:', uploadError.message);
          }
        }
      } catch (uploadErr) {
        console.error('Error saat upload bukti:', uploadErr.message);
      }
    }

    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        id_pendaftaran,
        id_peserta,
        id_jadwal,
        tanggal_daftar: new Date(),
        status_pendaftaran: 'Menunggu',
        pembayaran: {
          create: {
            id_pembayaran,
            tanggal_pembayaran: new Date(),
            nominal: jadwal.jenisLomba.biaya_pendaftaran,
            bukti_pembayaran: buktiPublicUrl,
            status_pembayaran: 'Menunggu',
          }
        }
      },
      include: {
        jadwal: { include: { jenisLomba: true, kategori: true } },
        pembayaran: true,
      }
    });

    return res.status(201).json({ success: true, message: 'Pendaftaran berhasil dikirim. Menunggu verifikasi admin.', data: pendaftaran });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/pendaftaran/:id/status - Admin only: approve/reject
router.patch('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status_pendaftaran, status_pembayaran } = req.body;
    if (status_pendaftaran && !['Terverifikasi', 'Ditolak', 'Menunggu'].includes(status_pendaftaran)) {
      return res.status(400).json({ success: false, message: 'Status pendaftaran tidak valid.' });
    }

    let targetStatusPendaftaran = status_pendaftaran || 'Menunggu';
    let targetStatusPembayaran = status_pembayaran || (targetStatusPendaftaran === 'Terverifikasi' ? 'Lunas' : targetStatusPendaftaran === 'Ditolak' ? 'Ditolak' : 'Menunggu');

    await prisma.pembayaran.updateMany({
      where: { id_pendaftaran: req.params.id },
      data: { status_pembayaran: targetStatusPembayaran }
    });

    // If approved, assign BIB number automatically if not set
    if (targetStatusPendaftaran === 'Terverifikasi') {
      const pd = await prisma.pendaftaran.findUnique({ where: { id_pendaftaran: req.params.id }, include: { peserta: true } });
      if (pd && !pd.peserta.nomor_bib) {
        const bibCount = await prisma.peserta.count({ where: { nomor_bib: { not: null } } });
        const newBib = String(1001 + bibCount);
        await prisma.peserta.update({ where: { id_peserta: pd.id_peserta }, data: { nomor_bib: newBib } });
      }
    }

    const updated = await prisma.pendaftaran.update({
      where: { id_pendaftaran: req.params.id },
      data: { status_pendaftaran: targetStatusPendaftaran },
      include: {
        peserta: { select: { nama_peserta: true, nomor_bib: true } },
        pembayaran: true
      }
    });
    return res.json({ success: true, message: `Status berhasil diubah.`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
