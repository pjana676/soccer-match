const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const jwtAuth = require('../middlewares/jwtAuth')
const matchController = require('../controllers/match');
const isAuthenticated = require('../middlewares/isAuthenticated')
const isAdminAuthenticated = require('../middlewares/isAdminAuthenticated')



const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});


router.get('/dashboard', matchController.getDashboard);


// Admin permission
router.post('/admin/schedule-match', jwtAuth, isAdminAuthenticated, matchController.scheduleMatch);
router.put('/admin/cancel-match/:matchId', jwtAuth, isAdminAuthenticated, matchController.cancelMatch);

// User Access
router.get('/list', jwtAuth, isAuthenticated, matchController.getMatchInfo);
router.get('/registered/dashboard', jwtAuth, isAuthenticated, matchController.registeredDashboard);
router.put('/subscribe/:matchId', jwtAuth, isAuthenticated, matchController.matchSubscribe);
router.put('/unsubscribe/:subscriptionId', jwtAuth, isAuthenticated, matchController.matchUnSubscribe);
router.post('/player-count-from-the-picture/:matchId', jwtAuth, isAuthenticated, upload.single('image'), matchController.playerCountInThePicture);

module.exports = router;