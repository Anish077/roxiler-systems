const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'owner'] } }),
      Store.countDocuments(),
      Rating.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalStores, totalRatings },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/create-user
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!['user', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, address, role });

    res.status(201).json({ success: true, message: 'User created successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/create-store
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }
    if (owner.role !== 'owner') {
      return res.status(400).json({ success: false, message: 'Specified user is not a store owner' });
    }

    const existing = await Store.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Store email already in use' });
    }

    const store = await Store.create({ name, email, address, owner: ownerId });

    res.status(201).json({ success: true, message: 'Store created successfully', data: { store } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (address) filter.address = { $regex: address, $options: 'i' };
    if (role) filter.role = role;

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const users = await User.find(filter)
      .sort({ [sortField]: sortOrder })
      .select('-password');

    // For store owners, fetch their store's average rating
    const usersWithRatings = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        if (user.role === 'owner') {
          const store = await Store.findOne({ owner: user._id });
          if (store) {
            const ratings = await Rating.find({ store: store._id });
            const avg =
              ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : null;
            userObj.storeRating = avg ? parseFloat(avg.toFixed(1)) : null;
            userObj.storeName = store.name;
          }
        }
        return userObj;
      })
    );

    res.json({ success: true, data: { users: usersWithRatings, count: users.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/stores
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (address) filter.address = { $regex: address, $options: 'i' };

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSort = ['name', 'email', 'address', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const stores = await Store.find(filter)
      .populate('owner', 'name email')
      .sort({ [sortField]: sortOrder });

    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const storeObj = store.toObject();
        const ratings = await Rating.find({ store: store._id });
        storeObj.averageRating =
          ratings.length > 0
            ? parseFloat((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1))
            : null;
        storeObj.totalRatings = ratings.length;
        return storeObj;
      })
    );

    res.json({ success: true, data: { stores: storesWithRatings, count: stores.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/owners - list users with role owner for store creation
const getOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner' }).select('name email');
    res.json({ success: true, data: { owners } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, createUser, createStore, getUsers, getStores, getOwners };
