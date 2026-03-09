import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
    {
        siteName: { type: String, default: "TV19" },
        siteEmail: { type: String, default: "" },
        officeAddress: { type: String, default: "" },
        recaptchaSiteKey: { type: String, default: "" },
        recaptchaSecretKey: { type: String, default: "" },
        faviconUrl: { type: String, default: "" },
        siteIconUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

const SiteConfig = mongoose.model("SiteConfig", siteConfigSchema);

/**
 * Get the single config document, or create a default one if none exists.
 */
export async function getConfig() {
    let config = await SiteConfig.findOne();
    if (!config) {
        config = await SiteConfig.create({});
    }
    return config;
}

/**
 * Update config fields (text fields only, not file uploads).
 */
export async function updateConfig(data) {
    let config = await SiteConfig.findOne();
    if (!config) {
        config = await SiteConfig.create(data);
    } else {
        Object.assign(config, data);
        await config.save();
    }
    return config;
}

export default SiteConfig;
