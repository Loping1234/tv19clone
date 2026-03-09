import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        url: { type: String, required: true, unique: true },
        image: { type: String, default: "" },
        source: { type: String, default: "" },
        category: { type: String, default: "top" },
        publishedAt: { type: Date, default: Date.now },
        content: { type: String, default: "" },

        // Admin Toggles
        status: { type: Boolean, default: false }, // active/inactive on the main site
        featured: { type: Boolean, default: false },
        trending: { type: Boolean, default: false },
        top: { type: Boolean, default: false },
        breaking: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const News = mongoose.model("News", newsSchema);

export default News;
