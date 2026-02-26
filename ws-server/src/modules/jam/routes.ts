import { Router } from 'express';
import { broadcastResult } from './handler';

const router = Router();

// REST endpoint called by Laravel when Judge0 finishes
router.post('/result', (req, res) => {
  const { jamSessionId, userId, status, testResults } = req.body;

  if (!jamSessionId || !userId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  broadcastResult(jamSessionId, userId, status, testResults || []);
  res.json({ ok: true });
});

export default router;
