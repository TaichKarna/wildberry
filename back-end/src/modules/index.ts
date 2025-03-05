import express from "express";
import routes from './routes';
import webhooksRoutes from './webhooks';

const router = express.Router();

router.use('/', routes);
router.use('/webhooks', webhooksRoutes);

export default router;
