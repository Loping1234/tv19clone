import mongoose from "mongoose";

const failedFeedSchema = new mongoose.Schema({
  url: { type: String, required: true },
  category: { type: String, required: true },
  error: { type: String, required: true },
  statusCode: { type: Number },
  attempts: { type: Number, default: 1 },
  lastAttempt: { type: Date, default: Date.now },
}, { timestamps: true });

const FailedFeed = mongoose.model("FailedFeed", failedFeedSchema);

export default FailedFeed;
