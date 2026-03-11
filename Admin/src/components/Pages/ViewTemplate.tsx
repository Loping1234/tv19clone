interface ViewTemplateProps {
    template: any;
    onBack: () => void;
}

export default function ViewTemplate({ template, onBack }: ViewTemplateProps) {
    return (
        <div className="view-template-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title" style={{textTransform: 'uppercase'}}>VIEW TEMPLATE</h1>
                <div className="cat-breadcrumb">
                    <span onClick={onBack} style={{cursor: 'pointer'}}>Emails</span> <span className="cat-bc-sep">›</span> <span>View Template</span>
                </div>
            </div>

            <div className="vt-header-info">
                <div className="vt-row">
                    <span className="vt-label">Title :</span>
                    <span className="vt-value">{template.title}</span>
                </div>
                {template.subject && (
                    <div className="vt-row">
                        <span className="vt-label">Subject :</span>
                        <span className="vt-value">{template.subject}</span>
                    </div>
                )}
                <div className="vt-row">
                    <span className="vt-label">Template</span>
                </div>
            </div>

            <div className="vt-content-wrapper">
                <div className="vt-email-card">
                    {template.content ? (
                        /* Render live-edited HTML from CKEditor */
                        <div dangerouslySetInnerHTML={{ __html: template.content }} />
                    ) : (
                        /* Default hardcoded template */
                        <>
                            <div className="vt-email-header">
                                <h2><span>TV 19</span> NEWS</h2>
                            </div>
                            <div className="vt-email-banner">
                                <h3>Thank You for Submitting Your Advertising Request!</h3>
                                <p>
                                    Hello {'{full_name}'}, we've successfully received your request. Our
                                    Media & Partnerships team will review your details and contact you
                                    shortly with the next steps.
                                </p>
                            </div>

                            <div className="vt-email-body">
                                <p>Hi {'{full_name}'},</p>
                                <p>
                                    Thank you for your interest in advertising with <strong>{'{company_name}'}</strong>. Below is a summary of the
                                    details you submitted.
                                </p>

                                <div className="vt-response-box">
                                    <h4 className="vt-text-red">MEDIA TEAM RESPONSE</h4>
                                    <p>Our advertising team typically responds within <strong>24-48 business hours (Mon-Fri)</strong>.</p>
                                </div>

                                <h4 className="vt-section-title">Your Submission</h4>

                                <div className="vt-grid-2">
                                    <div className="vt-grid-col">
                                        <h5 className="vt-text-red">Advertiser Details</h5>
                                        <div className="vt-detail-item">
                                            <span className="vt-detail-label">Name:</span>
                                            <span className="vt-detail-value">{'{full_name}'}</span>
                                        </div>
                                        <div className="vt-detail-item">
                                            <span className="vt-detail-label">Company:</span>
                                            <span className="vt-detail-value">{'{advertising_company_name}'}</span>
                                        </div>
                                        <div className="vt-detail-item">
                                            <span className="vt-detail-label">Email:</span>
                                            <span className="vt-detail-value">{'{email}'}</span>
                                        </div>
                                        <div className="vt-detail-item">
                                            <span className="vt-detail-label">Website:</span>
                                            <span className="vt-detail-value">{'{website}'}</span>
                                        </div>
                                    </div>
                                    <div className="vt-grid-col vt-col-right">
                                        <h5 className="vt-text-red">Details</h5>
                                        <div className="vt-detail-item">
                                            <span className="vt-detail-label">Budget Range:</span>
                                            <span className="vt-detail-value">{'{budget}'}</span>
                                        </div>
                                        <div className="vt-detail-item">
                                            <span className="vt-detail-label">Target Categories:</span>
                                            <span className="vt-detail-value">{'{target_categories}'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="vt-requirements-box">
                                    <h5>Additional Requirements</h5>
                                    <p>{'{message}'}</p>
                                </div>

                                <div className="vt-next-steps">
                                    <h5>What Happens Next?</h5>
                                    <ol>
                                        <li>Our media team reviews your campaign requirements.</li>
                                        <li>We prepare a tailored proposal with available placements and pricing.</li>
                                        <li>You'll receive our detailed response at <strong>{'{email}'}</strong> within 24-48 hours.</li>
                                    </ol>
                                </div>

                                <div className="vt-email-footer">
                                    <p>We look forward to helping your brand reach our engaged audience.</p>
                                    <p>Best regards,<br/><strong>{'{company_name}'}</strong> Media & Partnerships Team</p>
                                    <p className="vt-text-red">{'{company_website}'}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="vt-bottom-actions">
                <button className="vt-back-btn" onClick={onBack}>
                    ⟵ Back
                </button>
            </div>
        </div>
    );
}
