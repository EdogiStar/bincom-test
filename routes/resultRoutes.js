const express = require('express');
const router = express.Router();

const {
  getPollingUnitResults,
  getLgaResults,
} = require('../controllers/resultController');

router.get('/polling-unit/:pollingUnitId', getPollingUnitResults);
router.get('/lga/:lgaId', getLgaResults);

module.exports = router;