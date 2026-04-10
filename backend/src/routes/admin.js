const express = require('express');
const router = express.Router();
const {
  getDashboard,
  createUser,
  createStore,
  getUsers,
  getStores,
  getOwners,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
const { storeValidation, handleValidationErrors } = require('../middlewares/validation');
const { body } = require('express-validator');

const adminOnly = [protect, authorize('admin')];

const createUserValidation = [
  body('name').trim().isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/)
    .withMessage('Must contain uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Must contain special character'),
  body('address').trim().notEmpty().withMessage('Address required').isLength({ max: 400 }),
  body('role').isIn(['user', 'admin', 'owner']).withMessage('Invalid role'),
  handleValidationErrors,
];

router.get('/dashboard', ...adminOnly, getDashboard);
router.post('/create-user', ...adminOnly, createUserValidation, createUser);
router.post('/create-store', ...adminOnly, storeValidation, createStore);
router.get('/users', ...adminOnly, getUsers);
router.get('/stores', ...adminOnly, getStores);
router.get('/owners', ...adminOnly, getOwners);

module.exports = router;
