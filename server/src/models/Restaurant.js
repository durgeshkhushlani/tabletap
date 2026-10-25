const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    currency: { type: String, default: 'INR' },
    taxPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
