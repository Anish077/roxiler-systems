const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      minlength: [20, 'Store name must be at least 20 characters'],
      maxlength: [60, 'Store name cannot exceed 60 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Store email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [400, 'Address cannot exceed 400 characters'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for average rating
storeSchema.virtual('averageRating', {
  ref: 'Rating',
  localField: '_id',
  foreignField: 'store',
  options: { select: 'rating' },
});

module.exports = mongoose.model('Store', storeSchema);
