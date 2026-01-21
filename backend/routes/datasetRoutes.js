const express = require('express');
const router = express.Router();
const { uploadDataset, getDatasets, getDatasetData } = require('../controllers/datasetController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route: POST /api/datasets/upload
// Middleware chain: Check Token -> Handle File Upload -> Process Data
router.post('/upload', protect, upload.single('file'), uploadDataset);
router.get('/', protect, getDatasets);       // <--- NEW: List all
router.get('/:id', protect, getDatasetData); // <--- NEW: Get single data
module.exports = router;