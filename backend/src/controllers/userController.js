const Store = require('../models/Store');
const Rating = require('../models/Rating');

// GET /api/user/stores
const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', order = 'asc' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSort = ['name', 'address', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';

    const stores = await Store.find(filter)
      .populate('owner', 'name email')
      .sort({ [sortField]: sortOrder });

    const userId = req.user._id;

    const storesWithData = await Promise.all(
      stores.map(async (store) => {
        const storeObj = store.toObject();

        const ratings = await Rating.find({ store: store._id });
        storeObj.averageRating =
          ratings.length > 0
            ? parseFloat((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1))
            : null;
        storeObj.totalRatings = ratings.length;

        const userRating = await Rating.findOne({ store: store._id, user: userId });
        storeObj.userRating = userRating ? userRating.rating : null;
        storeObj.userRatingId = userRating ? userRating._id : null;

        return storeObj;
      })
    );

    res.json({ success: true, data: { stores: storesWithData, count: stores.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/ratings
const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const existingRating = await Rating.findOne({ user: req.user._id, store: storeId });
    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this store. Use PUT to update.',
      });
    }

    const newRating = await Rating.create({
      user: req.user._id,
      store: storeId,
      rating,
    });

    res.status(201).json({ success: true, message: 'Rating submitted successfully', data: { rating: newRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/ratings/:id
const updateRating = async (req, res) => {
  try {
    const { rating } = req.body;

    const existingRating = await Rating.findById(req.params.id);
    if (!existingRating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    if (existingRating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this rating' });
    }

    existingRating.rating = rating;
    await existingRating.save();

    res.json({ success: true, message: 'Rating updated successfully', data: { rating: existingRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStores, submitRating, updateRating };
