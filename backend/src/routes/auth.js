const express = require('express');
const router = express.Router();
const { signup, login, changePassword, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { signupValidation, loginValidation, changePasswordValidation } = require('../middlewares/validation');

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/change-password', protect, changePasswordValidation, changePassword);
router.get('/me', protect, getMe);

module.exports = router;
