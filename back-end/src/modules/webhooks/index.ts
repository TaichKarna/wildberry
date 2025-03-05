import { Router } from 'express';
import appleRoutes from './apple';

const router = Router();

router.use('/apple', appleRoutes);

export default router;
