import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
        description: { type: String, default: '' },
        metaKeyword: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        icon: { type: String, default: '' },
        order: { type: Number, default: 0 },
        status: { type: Boolean, default: true },
        isMainCategory: { type: Boolean, default: false },
        rssUrls: [{ type: String, trim: true }],
    },
    { timestamps: true }
);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;