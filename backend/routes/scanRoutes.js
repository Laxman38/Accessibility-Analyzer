import express from 'express';
const router = express.Router();

import { scanUrl, scanHtml, getScanHistory, exportReport, deleteScan } from '../controllers/scanController.js';
import { validateScanUrl } from '../middleware/validateInput.js';

router.post('/url', validateScanUrl, scanUrl);
router.post('/html', scanHtml);

router.get('/history', getScanHistory);
router.get('/export/:scanId/:type', exportReport);

router.delete('/:scanId', deleteScan);

export default router;