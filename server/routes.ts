import express, { type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.ts';
import { authenticateJWT, type AuthRequest, JWT_SECRET } from './middleware/auth.ts';
import { validateBody, LoginSchema, CollectBinsSchema, CreateBinSchema } from './middleware/validate.ts';
import { calculateNearestNeighborRoute } from './routeOptimizer.ts';
import { generateWasteInsights } from './geminiService.ts';

const router = express.Router();

// ==================== AUTH ROUTES ====================

// POST /api/auth/login
router.post('/auth/login', validateBody(LoginSchema), (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const user = db.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
  });
});

// GET /api/auth/me
router.get('/auth/me', authenticateJWT, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// ==================== BIN MANAGEMENT ROUTES ====================

// GET /api/bins
router.get('/bins', authenticateJWT, (req: AuthRequest, res: Response) => {
  const bins = db.getAllBins();
  const logs = db.getCollectionLogs(10);

  // Compute analytics
  const totalBins = bins.length;
  const totalFill = bins.reduce((acc, b) => acc + b.fill_percentage, 0);
  const averageFill = totalBins > 0 ? Math.round((totalFill / totalBins) * 10) / 10 : 0;
  const collectionRequiredCount = bins.filter((b) => b.fill_percentage >= 80 && b.fill_percentage < 100).length;
  const overflowRiskCount = bins.filter((b) => b.fill_percentage >= 100).length;
  const fillingCount = bins.filter((b) => b.fill_percentage >= 50 && b.fill_percentage < 80).length;
  const normalCount = bins.filter((b) => b.fill_percentage < 50).length;

  return res.json({
    bins,
    analytics: {
      totalBins,
      averageFill,
      collectionRequiredCount,
      overflowRiskCount,
      totalNeedingCollection: collectionRequiredCount + overflowRiskCount,
      fillingCount,
      normalCount,
    },
    recentLogs: logs,
  });
});

// POST /api/bins (Add new dustbin)
router.post('/bins', authenticateJWT, validateBody(CreateBinSchema), (req: AuthRequest, res: Response) => {
  const { bin_name, location, coord_x, coord_y } = req.body;
  const created = db.createBin(bin_name, location, coord_x, coord_y);
  return res.status(201).json({ message: 'Dustbin added successfully', bin: created });
});

// POST /api/bins/simulate
router.post('/bins/simulate', authenticateJWT, (req: AuthRequest, res: Response) => {
  const result = db.simulateSensors();
  const bins = result.updatedBins;

  const totalBins = bins.length;
  const totalFill = bins.reduce((acc, b) => acc + b.fill_percentage, 0);
  const averageFill = totalBins > 0 ? Math.round((totalFill / totalBins) * 10) / 10 : 0;
  const collectionRequiredCount = bins.filter((b) => b.fill_percentage >= 80 && b.fill_percentage < 100).length;
  const overflowRiskCount = bins.filter((b) => b.fill_percentage >= 100).length;

  return res.json({
    message: `IoT sensors simulated across ${result.totalSimulated} campus bins.`,
    bins,
    analytics: {
      totalBins,
      averageFill,
      collectionRequiredCount,
      overflowRiskCount,
      totalNeedingCollection: collectionRequiredCount + overflowRiskCount,
    },
  });
});

// POST /api/bins/collect
router.post('/bins/collect', authenticateJWT, validateBody(CollectBinsSchema), (req: AuthRequest, res: Response) => {
  const { binIds } = req.body;
  const result = db.collectBins(binIds);
  const updatedBins = db.getAllBins();

  return res.json({
    message: `Successfully collected ${result.collectedCount} dustbin(s). Fill levels reset to 0%.`,
    collectedCount: result.collectedCount,
    logs: result.logs,
    bins: updatedBins,
  });
});

// GET /api/bins/logs
router.get('/bins/logs', authenticateJWT, (req: AuthRequest, res: Response) => {
  const logs = db.getCollectionLogs(50);
  return res.json({ logs });
});

// POST /api/bins/reset-demo
router.post('/bins/reset-demo', authenticateJWT, (req: AuthRequest, res: Response) => {
  const bins = db.resetAllToDemo();
  return res.json({ message: 'Campus dustbins reset to initial benchmark state.', bins });
});

// ==================== ROUTE OPTIMIZATION ====================

// GET /api/route
router.get('/route', authenticateJWT, (req: AuthRequest, res: Response) => {
  const allBins = db.getAllBins();
  const routeResult = calculateNearestNeighborRoute(allBins);
  return res.json(routeResult);
});

// ==================== AI ASSISTANT ROUTES ====================

// Rate limiting state for AI endpoint (to prevent abuse)
const rateLimitMap = new Map<string, number>();

// POST /api/ai/insights
router.post('/ai/insights', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || 'anonymous';
  const now = Date.now();
  const lastCall = rateLimitMap.get(userId) || 0;

  // 2-second rate limit
  if (now - lastCall < 2000) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before requesting another AI analysis.',
    });
  }
  rateLimitMap.set(userId, now);

  const allBins = db.getAllBins();
  try {
    const insights = await generateWasteInsights(allBins);
    return res.json(insights);
  } catch (err: any) {
    console.error('AI Insights endpoint error:', err);
    return res.status(500).json({ error: 'Failed to generate AI insights', details: err.message });
  }
});

export default router;
