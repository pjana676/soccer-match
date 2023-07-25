const express = require('express');
const router = express.Router();
const jwtAuth = require('../middlewares/jwtAuth')
const matchController = require('../controllers/match');
const isAuthenticated = require('../middlewares/isAuthenticated')
const isAdminAuthenticated = require('../middlewares/isAdminAuthenticated')

router.get('/dashboard', matchController.getDashboard);


// Admin permission
router.post('/admin/schedule-match', jwtAuth, isAdminAuthenticated, matchController.scheduleMatch);
router.put('/admin/cancel-match/:matchId', jwtAuth, isAdminAuthenticated, matchController.cancelMatch);

// User Access
router.get('/list', jwtAuth, isAuthenticated, matchController.getMatchInfo);
router.put('/subscribe/:matchId', jwtAuth, isAuthenticated, matchController.matchSubscribe);
router.put('/unsubscribe/:subscriptionId', jwtAuth, isAuthenticated, matchController.matchUnSubscribe);

module.exports = router;