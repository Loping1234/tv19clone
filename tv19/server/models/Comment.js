import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true, maxLength: 2000 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    },
    { timestamps: true }
);

// Index for efficient fetching of comments per article
commentSchema.index({ articleId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
