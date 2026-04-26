import mongoose from "mongoose";

const defaultImageSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: Boolean, default: true },
}, { timestamps: true });

const DefaultImage = mongoose.model("DefaultImage", defaultImageSchema);

export default DefaultImage;
