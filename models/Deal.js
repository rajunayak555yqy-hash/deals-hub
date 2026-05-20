const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  imageUrl: {
    type: String,
    required: true
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  affiliateLink: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Amazon', 'Flipkart', 'Meesho', 'Other']
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Fashion', 'Home', 'Beauty', 'Fitness', 'Other']
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  hotDeal: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  clicks: {
    type: Number,
    default: 0
  }
  },{timestamps:true});
  
dealSchema.virtual('discountPercent').get(function() {
  if (this.oldPrice && this.oldPrice > 0) {
    return Math.round(((this.oldPrice - this.newPrice) / this.oldPrice) * 100);
  }
  return 0;
});

dealSchema.set('toJSON', { virtuals: true });
dealSchema.set('toObject', { virtuals: true });

dealSchema.index({ title: 'text', brand: 'text', category: 'text' });
dealSchema.index({ platform: 1, active: 1 });
dealSchema.index({ featured: 1, active: 1 });
dealSchema.index({ brand: 1, active: 1 });

module.exports = mongoose.model('Deal', dealSchema);