import { Router } from 'express';
import { QueryController } from '../controllers/queryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const queryController = new QueryController();

router.use(authenticateToken);

router.post('/analyze', queryController.analyzeFluxQuery);

export default router;
