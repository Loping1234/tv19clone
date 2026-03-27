import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  description: { type: String, default: "" },
  icon: { type: String, default: "" },
  order: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  isMainCategory: { type: Boolean, default: false },
}, { timestamps: true });

// Index for faster queries
categorySchema.index({ parent: 1, order: 1 });
categorySchema.index({ slug: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
