import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String }, // Optional header/preview image
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'], default: 'Full-time' },
    department: { type: String },
    postingDate: { type: Date, default: Date.now },
    closingDate: { type: Date },
    experienceLevel: { type: String }, // e.g., 'Entry Level', 'Senior', '3-5 years'
    remoteOption: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'On-site' },
    status: { type: Boolean, default: true }, // Active/Inactive
    description: { type: String },
    requirements: { type: String },
    benefits: { type: String },
    location: { type: String, default: 'Jodhpur, Rajasthan' }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
