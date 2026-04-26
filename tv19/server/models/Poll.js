import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        options: [pollOptionSchema],
        totalVotes: { type: Number, default: 0 },
        status: { type: Boolean, default: true }, // active or inactive
        featured: { type: Boolean, default: false }, // Pin to top
        publishedAt: { type: Date, default: Date.now },
        startDate: { type: Date },
        endDate: { type: Date },
        author: { type: String, default: 'Admin' }
    },
    { timestamps: true }
);

export default mongoose.model('Poll', pollSchema);
