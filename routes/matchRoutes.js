const express = require('express');
const router = express.Router();
const jwtAuth = require('../middlewares/jwtAuth')
const matchController = require('../controllers/match');
// const isAuthenticated = require('../middlewares/isAuthenticated')
const isAdminAuthenticated = require('../middlewares/isAdminAuthenticated')

router.get('/dashboard', matchController.getDashboard);


// Admin permission
router.post('/admin/schedule-match', jwtAuth, isAdminAuthenticated, matchController.scheduleMatch);
router.post('/admin/cancel-match/:matchId', jwtAuth, isAdminAuthenticated, matchController.cancelMatch);

module.exports = router;