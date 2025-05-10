import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { oauth2Client } from './calendar.js';
import bookingRoutes from './api/booking.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', bookingRoutes);

// OAuth login
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });
  res.redirect(url);
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens
    const tokenPath = path.resolve('./tokens.json');
    await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));

    res.send('✅ Auth successful! You can now book appointments.');
  } catch (err) {
    console.error('Error during OAuth callback:', err);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
