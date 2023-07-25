const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match');

router.get('/dashboard', matchController.getDashboard);

module.exports = router;