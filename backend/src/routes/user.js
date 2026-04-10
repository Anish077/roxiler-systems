const express = require('express');
const router = express.Router();
const { getStores, submitRating, updateRating } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { ratingValidation, handleValidationErrors } = require('../middlewares/validation');
const { body } = require('express-validator');

const userOnly = [protect, authorize('user')];

const updateRatingValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  handleValidationErrors,
];

router.get('/stores', protect, authorize('user'), getStores);
router.post('/ratings', ...userOnly, ratingValidation, submitRating);
router.put('/ratings/:id', ...userOnly, updateRatingValidation, updateRating);

module.exports = router;
