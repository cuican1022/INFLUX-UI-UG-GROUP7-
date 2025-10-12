import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import bucketsRoutes from './routes/bucketRoutes';
import queryRoutes from './routes/queryRoutes';
import grafanaRoutes from './routes/grafanaRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// ----- MIDDLEWARE -----
app.use(cors({
  origin: 'http://localhost:5184'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- ROUTES -----
app.use('/api/auth', authRoutes);
app.use('/api/buckets', bucketsRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/grafana', grafanaRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ----- START SERVER -----
app.listen(PORT, () => {
  console.log(`InfluxDB UI Server is running on port ${PORT}`);
});

export default app;