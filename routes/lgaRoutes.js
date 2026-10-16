const express = require('express');
const router = express.Router();

const { getAllLgas } = require('../controllers/lgaController');

router.get('/', getAllLgas);

module.exports = router;
