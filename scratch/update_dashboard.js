const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

content = content.replace("import { getPendaftaran, getHasil, JADWAL_LIST } from '../lib/data';", "import { apiFetch } from '../lib/api';\nimport { useState, useEffect } from 'react';");
content = content.replace("export default function DashboardPage() {", `export default function DashboardPage() {
  const [pendaftaran, setPendaftaran] = useState<any[]>([]);
  const [hasil, setHasil] = useState<any[]>([]);
  const [jadwalTerdekat, setJadwalTerdekat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPend, resJadwal, resHasil] = await Promise.all([
          apiFetch('/api/pendaftaran'),
          apiFetch('/api/lomba/jadwal'),
          apiFetch('/api/penilaian')
        ]);
        const dataPend = await resPend.json();
        const dataJadwal = await resJadwal.json();
        const dataHasil = await resHasil.json();

        if (dataPend.success) {
          setPendaftaran(dataPend.data || dataPend.pendaftaran || []);
        }
        if (dataJadwal.success) {
          setJadwalTerdekat((dataJadwal.data || dataJadwal.jadwal || []).slice(0, 3));
        }
        if (dataHasil.success) {
          const allHasil = dataHasil.data || dataHasil.penilaian || [];
          setHasil(allHasil.filter((h: any) => h.nilai_akhir !== null));
        }
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
`);

content = content.replace(/const pendaftaran = getPendaftaran\(user\?\.id\);\n\s*const hasil = getHasil\(user\?\.id\);\n/, '');

const stats_replacement = `const statsItems = [
    { label: 'Pendaftaran\\nLomba', value: pendaftaran.length, color: '#A78BFA' },
    { label: 'Pembayaran\\nLunas', value: pendaftaran.filter(p => p.status_pendaftaran !== 'Menunggu').length, color: '#A78BFA' },
    { label: 'Verifikasi\\nTerverifikasi', value: pendaftaran.filter(p => p.status_pendaftaran === 'Terverifikasi').length, color: '#A78BFA' },
    { label: 'Prestasi\\nTerbaik', value: hasil.length > 0 ? \`#\${Math.min(...hasil.map((h, i) => i + 1))}\` : '-', color: '#A78BFA' },
  ];`;
content = content.replace(/const statsItems = \[[\s\S]*?\];/, stats_replacement);

content = content.replace(/const jadwalTerdekat = JADWAL_LIST\.slice\(0, 3\);\n/, '');

const layoutStart = content.indexOf('<Layout title="Dashboard">');
content = content.substring(0, layoutStart + 26) + `
      <div className="max-w-5xl mx-auto">
        {loading && <p className="text-white text-center py-4">Memuat data...</p>}
        {error && <p className="text-red-500 text-center py-4">{error}</p>}
        {!loading && !error && (
` + content.substring(layoutStart + 65);

content = content.replace(/user\?\.namaLengkap/g, "user?.nama");
content = content.replace(/user\?\.bibNumber/g, "(user?.nomor_bib || user?.bibNumber)");
content = content.replace(/user\.bibNumber/g, "(user.nomor_bib || user.bibNumber)");

content = content.replace(/p\.id/g, "p.id_pendaftaran");
content = content.replace(/p\.lomba/g, "p.jadwal.jenisLomba.nama_lomba");
content = content.replace(/p\.kategori/g, "p.jadwal.kategori.nama_kategori");
content = content.replace(/p\.tanggalDaftar/g, "new Date(p.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })");
content = content.replace(/status=\{p\.status\}/g, "status={p.status_pendaftaran}");

content = content.replace(/h\.id/g, "h.id_penilaian");
content = content.replace(/h\.lomba/g, "h.pendaftaran.jadwal.jenisLomba.nama_lomba");
content = content.replace(/h\.kategori/g, "h.pendaftaran.jadwal.kategori.nama_kategori");
content = content.replace(/h\.nilaiAkhir/g, "h.nilai_akhir");

content = content.replace(/j\.id/g, "j.id_jadwal");
content = content.replace(/const \[tgl, bln\] = j\.tanggal\.split\(' '\);/g, `const dateObj = new Date(j.tanggal_lomba);
                const tgl = dateObj.getDate();
                const bln = dateObj.toLocaleDateString('id-ID', { month: 'short' });`);
content = content.replace(/j\.lomba/g, "j.jenisLomba.nama_lomba");
content = content.replace(/j\.kategori/g, "j.kategori.nama_kategori");
content = content.replace(/j\.jamMulai/g, "j.jam_mulai.slice(0,5)");
content = content.replace(/j\.lokasi/g, "j.lokasi");

content = content.replace(/<\/Layout>/, "        )}\n      </div>\n    </Layout>");

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
