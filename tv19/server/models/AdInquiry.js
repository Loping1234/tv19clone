import mongoose from "mongoose";

const adInquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
    status: { type: String, enum: ['New', 'Contacted', 'Resolved', 'Spam'], default: 'New' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("AdInquiry", adInquirySchema);
