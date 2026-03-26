import mongoose from 'mongoose';

const rssFeedSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    subheading: {
        type: String,
        default: '',
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
        index: true,
    },
}, { timestamps: true });

// Index for efficient filtering
rssFeedSchema.index({ category: 1, status: 1 });

const RssFeed = mongoose.model('RssFeed', rssFeedSchema);
export default RssFeed;
