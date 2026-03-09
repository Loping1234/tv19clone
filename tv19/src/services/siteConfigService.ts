import axios from "axios";

const CONFIG_URL = "/api/config";

export interface SiteConfig {
    siteName: string;
    siteEmail: string;
    officeAddress: string;
    faviconUrl: string;
    siteIconUrl: string;
}

/**
 * Fetch the site configuration from the backend.
 * This includes siteName, favicon, site icon, etc.
 */
export const getSiteConfig = async (): Promise<SiteConfig> => {
    const response = await axios.get<SiteConfig>(CONFIG_URL);
    return response.data;
};

/**
 * Apply site config to the document head (favicon + title).
 * Call this once on app startup.
 */
export const applySiteConfig = (config: SiteConfig) => {
    // Update page title
    if (config.siteName) {
        document.title = config.siteName;
    }

    // Update favicon
    if (config.faviconUrl) {
        let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = config.faviconUrl;
        link.type = ""; // clear type so browser auto-detects
    }
};
