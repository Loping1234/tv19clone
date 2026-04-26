import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true, lowercase: true, trim: true },
        password: { type: String }, // Optional for Google OAuth users
        imageUrl: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        googleId: { type: String },

        // Bookmarks — Save & Read Later
        savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],

        // Category Preferences — Personalized Feed
        preferences: {
            categories: [{ type: String }], // e.g., ["sports", "technology", "business"]
        },

        // Notification Settings — Breaking News Alerts
        notifications: {
            breakingNews: { type: Boolean, default: false },
            lastAlertSentAt: { type: Date, default: null },
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
