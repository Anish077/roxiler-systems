const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');

// GET /api/owner/dashboard
const getDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'No store found for this owner' });
    }

    const ratings = await Rating.find({ store: store._id })
      .populate('user', 'name email address')
      .sort({ createdAt: -1 });

    const averageRating =
      ratings.length > 0
        ? parseFloat((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1))
        : null;

    res.json({
      success: true,
      data: {
        store: {
          _id: store._id,
          name: store.name,
          email: store.email,
          address: store.address,
        },
        averageRating,
        totalRatings: ratings.length,
        ratings: ratings.map((r) => ({
          _id: r._id,
          rating: r.rating,
          user: r.user,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard };
