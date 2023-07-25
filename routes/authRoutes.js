const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/register', authController.registerUser);
router.post('/login', authController.login);
// router.post('/auth/logout', authController.logout);

module.exports = router;