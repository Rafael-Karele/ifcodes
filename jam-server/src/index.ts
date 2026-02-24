import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleConnection, broadcastResult } from './ws-handler';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// REST endpoint called by Laravel when Judge0 finishes
app.post('/result', (req, res) => {
  const { jamSessionId, userId, status, testResults } = req.body;

  if (!jamSessionId || !userId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  broadcastResult(jamSessionId, userId, status, testResults || []);
  res.json({ ok: true });
});

wss.on('connection', (ws) => {
  handleConnection(ws);
});

server.listen(PORT, () => {
  console.log(`Jam WebSocket server running on port ${PORT}`);
});
