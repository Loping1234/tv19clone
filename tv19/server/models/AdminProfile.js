import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminProfileSchema = new mongoose.Schema(
    {
        name: { type: String, default: 'Admin' },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        imageUrl: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
    },
    { timestamps: true }
);

// Hash password before saving
adminProfileSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
adminProfileSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const AdminProfile = mongoose.model('AdminProfile', adminProfileSchema);

/**
 * Get the single admin profile document.
 */
export async function getProfile() {
    return await AdminProfile.findOne();
}

/**
 * Update admin profile fields.
 */
export async function updateProfile(data) {
    let profile = await AdminProfile.findOne();
    if (profile) {
        Object.assign(profile, data);
        await profile.save();
    }
    return profile;
}

export default AdminProfile;