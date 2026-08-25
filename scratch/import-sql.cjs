const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ Error: DIRECT_URL atau DATABASE_URL tidak ditemukan di .env");
    process.exit(1);
  }

  console.log("🔌 Menghubungkan ke database Supabase...");
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log("🗑️ Menghapus tabel lama jika ada...");
    await client.query(`
      DROP TABLE IF EXISTS pemenang, penilaian, pembayaran, pendaftaran, jadwal_lomba, kategori_lomba, jenis_lomba, juri, peserta, admin CASCADE;
      DROP TYPE IF EXISTS "JenisKelamin", "StatusPendaftaran", "StatusPembayaran", "Peringkat" CASCADE;
    `);

    console.log("📖 Membaca file SQL...");
    const sqlPath = path.join(__dirname, '..', 'Supabase_Inline_Skate.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL statements by semicolon, but ignore semicolons inside strings/quotes
    const statements = sqlContent
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Langkah 1: Pisahkan tabel creation, inserts, dan updates
    const createAndInsertStatements = [];
    const updatePasswordStatements = [];

    for (const stmt of statements) {
      if (stmt.toLowerCase().includes('update peserta set password =') || stmt.toLowerCase().includes('update juri set password =')) {
        updatePasswordStatements.push(stmt);
      } else if (stmt.toLowerCase().startsWith('alter table') && stmt.toLowerCase().includes('password')) {
        // Skip default invalid MySQL alter statements from file
        continue;
      } else {
        createAndInsertStatements.push(stmt);
      }
    }

    console.log(`🚀 Membuat tabel dan mengimpor data dasar (${createAndInsertStatements.length} perintah)...`);
    for (let i = 0; i < createAndInsertStatements.length; i++) {
      try {
        await client.query(createAndInsertStatements[i]);
      } catch (err) {
        console.error(`⚠️ Error pada perintah #${i + 1}:`, err.message);
      }
    }

    console.log("🔑 Menambahkan kolom password ke tabel peserta, juri, dan admin (PostgreSQL Syntax)...");
    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      ALTER TABLE peserta ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '${defaultPasswordHash}';
      ALTER TABLE juri ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '${defaultPasswordHash}';
    `);

    console.log(`🔒 Mengenkripsi dan memperbarui ${updatePasswordStatements.length} password peserta/juri dengan bcrypt...`);
    for (const updateStmt of updatePasswordStatements) {
      // Ekstrak password dan ID dari query:
      // e.g. UPDATE peserta SET password = 'plaintext' WHERE id_peserta = 'PS123'
      const match = updateStmt.match(/update\s+(peserta|juri)\s+set\s+password\s*=\s*'([^']+)'\s+where\s+(id_peserta|id_juri)\s*=\s*'([^']+)'/i);
      if (match) {
        const table = match[1];
        const plainPassword = match[2];
        const idField = match[3];
        const idValue = match[4];

        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const query = `UPDATE ${table} SET password = $1 WHERE ${idField} = $2`;
        await client.query(query, [hashedPassword, idValue]);
      } else {
        console.log("Gagal mem-parsing update statement:", updateStmt);
      }
    }

    // Pastikan admin ditambahkan jika belum ada di sql
    const adminCheck = await client.query("SELECT COUNT(*) FROM admin");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log("👤 Menambahkan akun admin default...");
      await client.query(`
        INSERT INTO admin (id_admin, nama_admin, email, password) VALUES
        ('AD001', 'Rangga Wibowo', 'rangga@admin.com', '${defaultPasswordHash}'),
        ('AD002', 'Sinta Marlina', 'sinta@admin.com', '${defaultPasswordHash}');
      `);
    }

    console.log("✅ IMPOR SELESAI! Semua data telah diunggah dan terenkripsi aman di Supabase!");
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat impor:", err);
  } finally {
    await client.end();
  }
}

run();
