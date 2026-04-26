import mongoose from "mongoose";

const jobApplicantSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    portfolio: { type: String }, // URL
    resume: { type: String },    // Path to uploaded file
    status: { type: String, enum: ['Applied', 'Reviewed', 'Interviewing', 'Hired', 'Rejected'], default: 'Applied' },
    appliedOn: { type: Date, default: Date.now },
    additionalDetails: { type: String }
}, { timestamps: true });

export default mongoose.model("JobApplicant", jobApplicantSchema);
