// backend/server.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import itemsRouter from './routes/items.js';
import categoriesRouter from './routes/categories.js';
import stockOutRouter from './routes/stockOut.js';
import historyKeluarRoute from './routes/historyKeluar.js';
import stockInRouter from './routes/stockIn.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Router
app.use('/api/items', itemsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stock-out', stockOutRouter);
app.use('/api/history-keluar', historyKeluarRoute);
app.use('/api/stock-in', stockInRouter);

// ✅ Route test untuk memastikan server ini yang jalan
app.get('/', (req, res) => {
  res.send("✅ Backend aktif dari server.js ini");
});

// 🔍 Debug semua route terdaftar
console.log("🔍 Daftar route terdaftar:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
    console.log(`${methods} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
        console.log(`${methods} ${middleware.regexp}${handler.route.path}`);
      }
    });
  }
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server berjalan di http://0.0.0.0:${PORT}`);
});
