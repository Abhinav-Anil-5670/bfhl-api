const express = require('express');
const router = express.Router();
const bfhlController = require('../controllers/bfhlController');
const { validateBfhlInput } = require('../middlewares/validateRequest');


router.post('/', validateBfhlInput, bfhlController.processGraphData);

module.exports = router;