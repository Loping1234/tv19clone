import React, { useState } from 'react'

export default function Social() {
    const [socials, setSocials] = useState({
        facebook: 'https://www.facebook.com/',
        whatsapp: 'https://www.whatsapp.com/',
        instagram: 'https://www.instagram.com/',
        twitter: 'https://twitter.com/home?lang=en',
        linkedin: 'https://www.linkedin.com/feed/',
        youtube: 'https://www.youtube.com/',
        telegram: 'https://web.telegram.org/',
    })

    const handleChange = (field: keyof typeof socials, value: string) => {
        setSocials(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="config-page">
            <div className="config-card">
                {/* Facebook */}
                <div className="config-field">
                    <label className="config-label">Facebook</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.facebook}
                        onChange={e => handleChange('facebook', e.target.value)}
                    />
                </div>

                {/* WhatsApp */}
                <div className="config-field">
                    <label className="config-label">WhatsApp</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.whatsapp}
                        onChange={e => handleChange('whatsapp', e.target.value)}
                    />
                </div>

                {/* Instagram */}
                <div className="config-field">
                    <label className="config-label">Instagram</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.instagram}
                        onChange={e => handleChange('instagram', e.target.value)}
                    />
                </div>

                {/* Twitter */}
                <div className="config-field">
                    <label className="config-label">Twitter</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.twitter}
                        onChange={e => handleChange('twitter', e.target.value)}
                    />
                </div>

                {/* LinkedIn */}
                <div className="config-field">
                    <label className="config-label">Linked In</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.linkedin}
                        onChange={e => handleChange('linkedin', e.target.value)}
                    />
                </div>

                {/* YouTube */}
                <div className="config-field">
                    <label className="config-label">YouTube</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.youtube}
                        onChange={e => handleChange('youtube', e.target.value)}
                    />
                </div>

                {/* Telegram */}
                <div className="config-field">
                    <label className="config-label">Telegram</label>
                    <input
                        type="url"
                        className="config-input"
                        value={socials.telegram}
                        onChange={e => handleChange('telegram', e.target.value)}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="config-footer">
                2026 © TV19.
            </div>
        </div>
    )
}
