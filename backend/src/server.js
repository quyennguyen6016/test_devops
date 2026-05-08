require('dotenv').config();
const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

app.get('/api/health' , (req, res) => {
    res.json({ ok: true});
});

app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.send('Order Tracking System Backend is running');
});

app.use(errorHandler);

// === START SERVER ===
// Only start the server when this file is run directly (not imported in tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
  });
}

module.exports = app;