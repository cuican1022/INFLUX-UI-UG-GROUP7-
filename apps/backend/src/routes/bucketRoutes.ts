import { Router } from 'express';
import { BucketsController } from '../controllers/bucketController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const bucketsController = new BucketsController();

router.use(authenticateToken);

router.get('/', bucketsController.getBuckets);
router.get('/:bucketName/measurements', bucketsController.getMeasurements);
router.get('/:bucketName/measurements/:measurement/fields', bucketsController.getFields);

export default router;