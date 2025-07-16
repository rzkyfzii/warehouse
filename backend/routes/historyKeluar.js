import express from 'express';
import db from '../db.js';

const router = express.Router();

// Ambil semua data history_keluar (dengan filter metode opsional)
router.get('/', (req, res) => {
  const { metode } = req.query;

  let sql = 'SELECT * FROM history_keluar';
  const params = [];

  if (metode && metode !== 'Semua') {
    sql += ' WHERE metode = ?';
    params.push(metode);
  }

  sql += ' ORDER BY tanggal DESC';

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Gagal ambil history_keluar:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

export default router;
