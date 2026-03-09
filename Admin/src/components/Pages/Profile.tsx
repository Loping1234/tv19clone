import { useState } from 'react'

export default function Profile() {
    const [name, setName] = useState('Admin')
    const [email, setEmail] = useState('userjdr1@gmail.com')
    const [image, setImage] = useState<string | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setImage(event.target?.result as string)
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    return (
        <div className="profile-page">
            <h1 className="profile-page-title">PROFILE</h1>

            <div className="profile-card">
                <div className="profile-image-container">
                    <div className="profile-image-box">
                        {image ? (
                            <img src={image} alt="Profile" className="profile-preview" />
                        ) : (
                            <div className="profile-placeholder">
                                {/* Default placeholder or current user image */}
                                <img src="https://via.placeholder.com/150" alt="Placeholder" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-form">
                    <div className="profile-form-group">
                        <label className="profile-label">Image</label>
                        <div className="profile-upload-wrapper">
                            <div className="profile-file-input-container">
                                <label className="profile-file-btn">
                                    Choose File
                                    <input type="file" onChange={handleImageChange} accept="image/*" />
                                </label>
                                <span className="profile-file-name">No file chosen</span>
                            </div>
                            <button className="profile-upload-btn">Upload</button>
                        </div>
                    </div>

                    <div className="profile-form-group">
                        <label className="profile-label">Name</label>
                        <input
                            type="text"
                            className="profile-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="profile-form-group">
                        <label className="profile-label">Email</label>
                        <input
                            type="email"
                            className="profile-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button className="profile-submit-btn">Submit</button>
                </div>
            </div>

            <footer className="profile-footer">
                2026 © TV19.
            </footer>
        </div>
    )
}
