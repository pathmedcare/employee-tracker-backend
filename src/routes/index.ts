import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount under standard /auth and /users
router.use('/auth', authRoutes);
router.use('/', authRoutes);

export default router;
