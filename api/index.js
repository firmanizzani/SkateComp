require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const pesertaRoutes = require('./routes/peserta.routes');
const juriRoutes = require('./routes/juri.routes');
const adminRoutes = require('./routes/admin.routes');
const lombaRoutes = require('./routes/lomba.routes');
const pendaftaranRoutes = require('./routes/pendaftaran.routes');
const penilaianRoutes = require('./routes/penilaian.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/peserta', pesertaRoutes);
app.use('/api/juri', juriRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lomba', lombaRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/penilaian', penilaianRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Skate Competition API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
