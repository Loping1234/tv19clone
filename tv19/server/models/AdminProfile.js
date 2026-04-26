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
 * Get the admin profile document by ID or find the first one.
 */
export async function getProfile(id) {
    if (id) return await AdminProfile.findById(id);
    return await AdminProfile.findOne();
}

/**
 * Update admin profile fields by ID or find the first one.
 */
export async function updateProfile(data, id) {
    let profile = id ? await AdminProfile.findById(id) : await AdminProfile.findOne();
    if (profile) {
        Object.assign(profile, data);
        await profile.save();
    }
    return profile;
}

export default AdminProfile;