import mongoose from 'mongoose';

const subheadingSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: Boolean,
    default: true,
  },
  rssUrls: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

// Ensure unique combination of category and slug
subheadingSchema.index({ category: 1, slug: 1 }, { unique: true });


const Subheading = mongoose.model('Subheading', subheadingSchema);
export default Subheading;
