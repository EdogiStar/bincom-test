const express = require('express');
const router = express.Router();

const {
  getPollingUnits,
} = require('../controllers/pollingUnitController');

router.get('/', getPollingUnits);

module.exports = router;
