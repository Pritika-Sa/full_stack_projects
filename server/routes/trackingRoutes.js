const express = require('express');
const { saveTracking, getTracking } = require('../controllers/trackingController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, getTracking);
router.post('/', auth, saveTracking);

module.exports = router;
