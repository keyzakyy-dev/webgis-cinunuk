import { Router } from 'express';
import {
  listFeatures,
  getFeature,
  createFeature,
  updateFeature,
  deleteFeature,
  importFeatures,
} from '../controllers/featureController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadGeojson } from '../controllers/uploadController.js';

const router = Router();

router.get('/', listFeatures);
router.get('/:id', getFeature);
router.post('/', authenticate, createFeature);
router.put('/:id', authenticate, updateFeature);
router.delete('/:id', authenticate, deleteFeature);
router.post('/import', authenticate, uploadGeojson.single('geojson'), importFeatures);

export default router;
