

interface ViewPageProps {
    page: any;
    onBack: () => void;
}

export default function ViewPage({ page, onBack }: ViewPageProps) {
    return (
        <div className="view-template-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title" style={{ textTransform: 'uppercase' }}>VIEW PAGE</h1>
                <div className="cat-breadcrumb">
                    <span onClick={onBack} style={{ cursor: 'pointer' }}>Pages</span> <span className="cat-bc-sep">›</span> <span>View Page</span>
                </div>
            </div>

            <div style={{ background: '#fff', marginTop: '20px', padding: '24px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.8', marginBottom: '16px' }}>
                    <div>Meta Title : {page.metaTitle || ''}</div>
                    <div>Meta Keywords : {page.metaKeywords || ''}</div>
                    <div>Meta Description : {page.metaDescription || ''}</div>
                    <div>Page Title : {page.title}</div>
                    <div>Page Content</div>
                </div>

                <div 
                    className="page-content-preview" 
                    style={{ 
                        background: '#f8f9fa', 
                        minHeight: '400px',
                        overflow: 'hidden'
                    }}
                >
                    {page.content ? (
                        <div dangerouslySetInnerHTML={{ __html: page.content }} />
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                            No content available for this page.
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button 
                        onClick={onBack}
                        style={{
                            background: 'linear-gradient(90deg, #ff7a59, #ffab40)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 24px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        ⟵ Back
                    </button>
                </div>
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>
                2026 © TV19.
            </footer>
        </div>
    );
}
