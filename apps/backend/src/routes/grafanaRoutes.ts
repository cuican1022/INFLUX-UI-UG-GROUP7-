import { Router } from 'express';
import { GrafanaController } from '../controllers/grafanaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const grafanaController = new GrafanaController();

router.use(authenticateToken);

router.post('/dashboard', grafanaController.createDashboard);
router.get('/datasources', grafanaController.getDatasources);

export default router;
