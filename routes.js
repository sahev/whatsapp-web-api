import { Router } from 'express';
const router = Router();
import { createInstance, getInstance, getQrBase64, logoutInstance, remove, sendText } from './src/controllers/instance.controller.js';

router.post('/instance', createInstance);
router.get('/instance/:id', getInstance);
router.get('/instance/:id/qr', getQrBase64);
router.post('/instance/:id/logout', logoutInstance);
router.delete('/instance/:id', remove);

router.post('/message', sendText);

export default router;