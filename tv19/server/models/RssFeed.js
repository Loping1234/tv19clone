import mongoose from 'mongoose';

const rssFeedSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    subheading: {
        type: String,
        default: '',
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const RssFeed = mongoose.model('RssFeed', rssFeedSchema);
export default RssFeed;
