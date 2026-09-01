import { Router } from 'express';
import {
  listLayers,
  getLayerWithFeatures,
  createLayer,
  updateLayer,
  deleteLayer,
} from '../controllers/layerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', listLayers);
router.get('/:id', getLayerWithFeatures);
router.post('/', authenticate, createLayer);
router.put('/:id', authenticate, updateLayer);
router.delete('/:id', authenticate, deleteLayer);

export default router;
