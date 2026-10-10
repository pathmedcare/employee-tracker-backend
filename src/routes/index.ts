import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount Auth routes under /api/v1/auth & /api/v1/devices
router.use('/auth', authRoutes);
router.use('/', authRoutes); // To support POST /devices/register under /api/v1/devices/register

export default router;
