import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleConnection } from './modules/jam/handler';
import jamRoutes from './modules/jam/routes';
import { handleNotificationConnection } from './modules/notifications/handler';
import { handleMetricsConnection, handleMetricsRest } from './modules/metrics/handler';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();
app.use(express.json());

const server = http.createServer(app);

// Three WebSocket servers: jam, notifications, admin metrics
const jamWss = new WebSocketServer({ noServer: true });
const notifyWss = new WebSocketServer({ noServer: true });
const metricsWss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/notifications') {
    notifyWss.handleUpgrade(request, socket, head, (ws) => {
      notifyWss.emit('connection', ws, request);
    });
  } else if (pathname === '/admin/metrics') {
    metricsWss.handleUpgrade(request, socket, head, (ws) => {
      metricsWss.emit('connection', ws, request);
    });
  } else if (pathname === '/' || pathname === '/jam') {
    // Jam sessions on / (backwards compatible) or /jam
    jamWss.handleUpgrade(request, socket, head, (ws) => {
      jamWss.emit('connection', ws, request);
    });
  } else {
    // Reject unknown paths
    socket.destroy();
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Jam REST endpoints under /jam prefix
app.use('/jam', jamRoutes);

// Metrics REST endpoint
app.get('/admin/metrics', (req, res) => {
  handleMetricsRest(req, res);
});

jamWss.on('connection', (ws) => {
  handleConnection(ws);
});

notifyWss.on('connection', (ws) => {
  handleNotificationConnection(ws);
});

metricsWss.on('connection', (ws) => {
  handleMetricsConnection(ws);
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
