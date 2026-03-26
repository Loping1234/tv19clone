import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, index: true },
        description: { type: String, default: "" },
        url: { type: String, required: true, unique: true, index: true },
        image: { type: String, default: "" },
        source: { type: String, default: "" },
        category: { type: String, default: "top", index: true },
        publishedAt: { type: Date, default: Date.now, index: true },
        content: { type: String, default: "" },

        // Admin Toggles
        status: { type: Boolean, default: false, index: true }, // active/inactive on the main site
        featured: { type: Boolean, default: false, index: true },
        trending: { type: Boolean, default: false },
        top: { type: Boolean, default: false },
        breaking: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ============================================================
//  DATABASE INDEXES (P0 Performance)
// ============================================================
// Compound indexes for common query patterns
newsSchema.index({ status: 1, category: 1, publishedAt: -1 });
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ title: "text", description: "text", content: "text" });

const News = mongoose.model("News", newsSchema);

export default News;
