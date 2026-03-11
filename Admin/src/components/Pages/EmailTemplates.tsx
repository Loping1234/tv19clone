import { useState } from 'react';
import { Edit, Eye } from 'react-feather';
import ViewTemplate from './ViewTemplate';
import EditTemplate from './EditTemplate';

const TV19_HEADER = `<div style="text-align:center;padding:24px 20px;">
    <h2 style="font-size:24px;font-weight:800;color:#333;margin:0;">
      <span style="display:inline-block;background:#ffaa1d;color:#fff;border-radius:50%;width:36px;height:36px;line-height:36px;font-size:16px;text-align:center;">TV</span>
      <span style="font-size:14px;color:#333;">19</span> NEWS
    </h2>
  </div>`;

const TV19_FOOTER = (extraNote?: string) => `<div style="border-top:1px solid #eee;padding:16px 40px;text-align:center;font-size:12px;color:#999;">
    <p style="margin:0;">© {year} {site_title}. All rights reserved.</p>
    ${extraNote ? `<p style="margin:8px 0 0 0;font-size:11px;color:#aaa;">${extraNote}</p>` : ''}
  </div>`;

const templateContents: Record<number, string> = {
    1: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="background:linear-gradient(135deg,#ff5252 0%,#ffab40 100%);color:#fff;padding:30px 40px;">
    <h3 style="font-size:22px;font-weight:700;margin:0 0 12px 0;line-height:1.3;">Thank You for Submitting Your Advertising Request!</h3>
    <p style="margin:0;font-size:14px;line-height:1.6;opacity:0.95;">Hello {full_name}, we've successfully received your request. Our Media &amp; Partnerships team will review your details and contact you shortly with the next steps.</p>
  </div>
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.6;">
    <p>Hi {full_name},</p>
    <p>Thank you for your interest in advertising with <strong>{company_name}</strong>. Below is a summary of the details you submitted.</p>
    <div style="background:#fffdf2;border:1px solid #ffe0b2;padding:16px 20px;border-radius:4px;margin:24px 0;">
      <h4 style="font-size:13px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;color:#ff5252;">MEDIA TEAM RESPONSE</h4>
      <p style="margin:0;font-size:13px;">Our advertising team typically responds within <strong>24-48 business hours (Mon-Fri)</strong>.</p>
    </div>
    <h4 style="font-size:16px;font-weight:700;color:#222;margin:24px 0 16px 0;border-bottom:1px solid #eee;padding-bottom:8px;">Your Submission</h4>
    <table style="width:100%;border:1px solid #eee;border-collapse:collapse;">
      <tr>
        <td style="padding:16px;vertical-align:top;border-right:1px solid #eee;width:50%;">
          <h5 style="font-size:13px;font-weight:600;color:#ff5252;margin:0 0 12px 0;">Advertiser Details</h5>
          <p style="margin:0 0 8px 0;"><strong>Name:</strong><br/>{full_name}</p>
          <p style="margin:0 0 8px 0;"><strong>Company:</strong><br/>{advertising_company_name}</p>
          <p style="margin:0 0 8px 0;"><strong>Email:</strong><br/>{email}</p>
          <p style="margin:0;"><strong>Website:</strong><br/>{website}</p>
        </td>
        <td style="padding:16px;vertical-align:top;width:50%;">
          <h5 style="font-size:13px;font-weight:600;color:#ff5252;margin:0 0 12px 0;">Details</h5>
          <p style="margin:0 0 8px 0;"><strong>Budget Range:</strong><br/>{budget}</p>
          <p style="margin:0;"><strong>Target Categories:</strong><br/>{target_categories}</p>
        </td>
      </tr>
    </table>
    <div style="background:#fdfdfd;border:1px solid #eee;padding:16px;margin:24px 0;">
      <h5 style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px 0;">Additional Requirements</h5>
      <p style="margin:0;color:#555;font-size:13px;font-style:italic;">{message}</p>
    </div>
    <h5 style="font-size:15px;font-weight:700;color:#222;margin:0 0 12px 0;">What Happens Next?</h5>
    <ol style="margin:0;padding-left:20px;color:#444;">
      <li style="margin-bottom:6px;font-size:14px;">Our media team reviews your campaign requirements.</li>
      <li style="margin-bottom:6px;font-size:14px;">We prepare a tailored proposal with available placements and pricing.</li>
      <li style="margin-bottom:6px;font-size:14px;">You'll receive our detailed response at <strong>{email}</strong> within 24-48 hours.</li>
    </ol>
    <div style="border-top:1px solid #eee;padding-top:20px;margin-top:24px;font-size:13px;color:#555;line-height:1.6;">
      <p>We look forward to helping your brand reach our engaged audience.</p>
      <p>Best regards,<br/><strong>{company_name}</strong> Media &amp; Partnerships Team</p>
      <p style="color:#ff5252;">{company_website}</p>
    </div>
  </div>
</div>`,

    2: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:20px;font-weight:700;color:#222;margin:0 0 16px 0;">Your email address was changed</h3>
    <p style="color:#888;">Hi {user_name},</p>
    <p style="color:#666;">This is a confirmation that the email address on your {site_name} account was changed on <strong>{requested_at}</strong>.</p>
    <p style="color:#666;">If you made this change, no further action is needed.</p>
    <p style="color:#666;">If you <strong>did not</strong> make this change, please secure your account immediately by resetting your password and contacting our support team.</p>
    <h4 style="font-size:15px;font-weight:700;color:#222;margin:24px 0 12px 0;">Change details</h4>
    <ul style="list-style:disc;padding-left:20px;color:#555;font-size:14px;line-height:2;">
      <li><strong>Date &amp; time:</strong> {requested_at}</li>
      <li><strong>IP address/IP:</strong> {ip}</li>
      <li><strong>Browser:</strong> {browser}</li>
    </ul>
    <p style="margin-top:24px;color:#444;"><strong>Need help?</strong> Contact us at <span style="color:#ff5252;">{support_email}</span> .</p>
    <p style="margin-top:24px;color:#444;">Thanks,<br/><strong>{company_name}</strong> Support Team</p>
  </div>
  ${TV19_FOOTER()}
</div>`,

    3: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:20px;font-weight:700;color:#222;margin:0 0 16px 0;">Confirm Your New Email Address</h3>
    <p style="color:#888;">Hi {user_name},</p>
    <p style="color:#666;">We received a request to change the email address associated with your {site_name} account.</p>
    <p style="color:#444;"><strong>Requested at:</strong> {requested_at}</p>
    <p style="color:#666;">To complete this change, please verify your new email address by clicking the button below.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="{verify_url}" style="display:inline-block;background:linear-gradient(90deg,#ff5252,#ffab40);color:#fff;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:700;font-size:14px;">Verify New Email</a>
    </div>
    <p style="color:#666;">If you did <u>not</u> request this change, please ignore this email or contact our support team immediately.</p>
    <p style="margin-top:24px;color:#444;"><strong>Need help?</strong> Contact us at <span style="color:#ff5252;">{support_email}</span> .</p>
  </div>
  ${TV19_FOOTER()}
</div>`,

    4: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:20px;font-weight:700;color:#222;margin:0 0 8px 0;">Thank you for contacting us!</h3>
    <p style="color:#888;">Hi {user_name},</p>
    <p style="color:#666;">We have received your message and appreciate you reaching out to us. Our team will review your inquiry and get back to you as soon as possible.</p>
    <div style="background:#f8f9fa;border:1px solid #eee;border-radius:6px;padding:20px;margin:24px 0;">
      <h4 style="font-size:14px;font-weight:700;color:#222;margin:0 0 12px 0;">Your Message Details</h4>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Name:</strong> {user_name}</p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Email:</strong> {email}</p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Subject:</strong> {subject}</p>
      <p style="margin:0;font-size:13px;"><strong>Message:</strong><br/>{message}</p>
    </div>
    <p style="color:#666;">We typically respond within <strong>24-48 business hours</strong>.</p>
    <p style="margin-top:24px;color:#444;">Thanks,<br/><strong>{company_name}</strong> Support Team</p>
  </div>
  ${TV19_FOOTER()}
</div>`,

    5: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:20px;font-weight:700;color:#222;margin:0 0 8px 0;">Forgot your password?</h3>
    <p style="font-weight:600;color:#333;margin:0 0 4px 0;">We received a request to reset your password.</p>
    <p style="color:#888;font-size:13px;margin:0 0 24px 0;">If you didn't make this request, simply ignore this email.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="{reset_url}" style="display:inline-block;background:linear-gradient(90deg,#ff5252,#ffab40);color:#fff;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:700;font-size:14px;">Reset Password</a>
    </div>
  </div>
  ${TV19_FOOTER()}
</div>`,

    6: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="background:linear-gradient(135deg,#ff5252 0%,#ffab40 100%);color:#fff;padding:20px 40px;text-align:center;">
    <h3 style="font-size:20px;font-weight:700;margin:0 0 8px 0;">New Article Just for You!</h3>
    <p style="margin:0;font-size:13px;opacity:0.95;">Hello {{ $user_name }}, we've found a story you might enjoy in {{ $interest_category }}</p>
  </div>
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.6;">
    <h4 style="font-size:13px;font-weight:700;color:#ff5252;text-transform:uppercase;margin:0 0 16px 0;">RECOMMENDED FOR YOU</h4>
    <div style="border:1px solid #eee;border-radius:6px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div style="width:80px;height:60px;background:#f0f0f0;border-radius:4px;flex-shrink:0;"></div>
        <div style="flex:1;">
          <p style="margin:0;font-size:12px;color:#999;">{{ $news_title }}</p>
        </div>
      </div>
      <p style="margin:12px 0 4px 0;font-size:11px;color:#999;">{{ $interest_category }}</p>
      <h4 style="font-size:16px;font-weight:700;color:#222;margin:0 0 8px 0;">{{ $news_title }}</h4>
      <p style="margin:0 0 16px 0;font-size:13px;color:#666;">{{ $news_excerpt }}</p>
      <div style="text-align:center;">
        <a href="{article_url}" style="display:inline-block;background:linear-gradient(90deg,#ff5252,#ffab40);color:#fff;text-decoration:none;padding:10px 24px;border-radius:4px;font-weight:700;font-size:13px;">Read Full Article</a>
      </div>
    </div>
    <p style="text-align:center;font-size:13px;color:#666;">You're receiving this email because you showed interest in <strong>{{ $interest_category }}</strong> on TV19 News. We'll keep sending you stories that match your preferences.</p>
  </div>
  ${TV19_FOOTER('If you no longer wish to receive these recommendations, you can update your preferences in your account settings.')}
</div>`,

    7: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:18px;font-weight:700;color:#222;margin:0 0 4px 0;">Hi {user_name}</h3>
    <p style="color:#444;margin:0 0 8px 0;"><strong>Browser:</strong> {browser}</p>
    <p style="color:#444;margin:0 0 8px 0;"><strong>OS:</strong> {os}</p>
    <p style="color:#444;margin:0 0 8px 0;"><strong>IP:</strong> {ip}</p>
  </div>
  ${TV19_FOOTER()}
</div>`,

    8: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:20px;font-weight:700;color:#222;margin:0 0 4px 0;">Password Updated</h3>
    <h4 style="font-size:16px;font-weight:700;color:#222;margin:0 0 4px 0;">Hi {user_name}</h4>
    <p style="color:#888;margin:0 0 16px 0;">Your password has been updated successfully.</p>
    <p style="color:#444;margin:0 0 8px 0;"><strong>Browser:</strong> {browser}</p>
    <p style="color:#444;margin:0 0 8px 0;"><strong>OS:</strong> {os}</p>
    <p style="color:#444;margin:0 0 8px 0;"><strong>IP:</strong> {ip}</p>
  </div>
  ${TV19_FOOTER()}
</div>`,

    9: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:18px;font-weight:700;color:#222;margin:0 0 4px 0;">Hi {user_name}</h3>
    <p style="color:#888;margin:0 0 24px 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="{confirm_url}" style="display:inline-block;background:linear-gradient(90deg,#ff5252,#ffab40);color:#fff;text-decoration:none;padding:12px 32px;border-radius:4px;font-weight:700;font-size:14px;">Confirm Account</a>
    </div>
    <h4 style="font-size:16px;font-weight:700;color:#222;text-align:center;margin:24px 0 0 0;">Thank you for Registration!</h4>
  </div>
  ${TV19_FOOTER()}
</div>`,

    10: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  ${TV19_HEADER}
  <div style="padding:30px 40px;color:#444;font-size:14px;line-height:1.8;">
    <h3 style="font-size:20px;font-weight:700;color:#222;margin:0 0 16px 0;">New Contact Us Submission</h3>
    <p style="color:#666;">You have received a new inquiry from the contact form on your website.</p>
    <div style="background:#f8f9fa;border:1px solid #eee;border-radius:6px;padding:20px;margin:24px 0;">
      <h4 style="font-size:14px;font-weight:700;color:#222;margin:0 0 12px 0;">Contact Details</h4>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Name:</strong> {user_name}</p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Email:</strong> {email}</p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Phone:</strong> {phone}</p>
      <p style="margin:0;font-size:13px;"><strong>Message:</strong><br/>{message}</p>
    </div>
    <p style="color:#666;">Please respond to this inquiry at your earliest convenience.</p>
    <p style="margin-top:24px;color:#444;">Thanks,<br/><strong>{company_name}</strong> Support Team</p>
  </div>
  ${TV19_FOOTER()}
</div>`,
};

const mockEmailTemplates = [
    { id: 1, title: 'Advertisement Lead', subject: 'Advertisement Lead', updatedOn: 'Feb 17, 2026 05:37 PM', content: templateContents[1] },
    { id: 2, title: 'Change Email Notification', subject: 'Change Email Notification', updatedOn: 'Jan 09, 2026 11:54 AM', content: templateContents[2] },
    { id: 3, title: 'Change Email Verification', subject: 'Change Email Verification', updatedOn: 'Jan 09, 2026 11:00 AM', content: templateContents[3] },
    { id: 4, title: 'Contact Form Submission confirmation', subject: 'Contact Form Submission confirmation', updatedOn: 'Dec 31, 2025 11:43 AM', content: templateContents[4] },
    { id: 5, title: 'Forgot Password', subject: 'Forgot Password', updatedOn: 'Dec 22, 2025 02:17 PM', content: templateContents[5] },
    { id: 6, title: 'Personalized News', subject: 'Personalized News Update', updatedOn: 'Dec 03, 2025 12:55 PM', content: templateContents[6] },
    { id: 7, title: 'Admin Change Email Notification', subject: 'Admin Change Email Notification', updatedOn: 'Nov 26, 2025 02:12 PM', content: templateContents[7] },
    { id: 8, title: 'Admin Change Password Notification', subject: 'Admin Change Password Notification', updatedOn: 'Nov 26, 2025 02:12 PM', content: templateContents[8] },
    { id: 9, title: 'User Registration', subject: 'Account Verification', updatedOn: 'Nov 26, 2025 02:07 PM', content: templateContents[9] },
    { id: 10, title: 'Contact Us', subject: 'Contact Us', updatedOn: 'Nov 26, 2025 02:07 PM', content: templateContents[10] },
];

export default function EmailTemplates() {
    const [entries, setEntries] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState(mockEmailTemplates as any[]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    // Save handler — updates the template in the list so changes are reflected live
    const handleSaveTemplate = (updatedTemplate: any) => {
        setTemplates(prev => prev.map(t =>
            t.id === updatedTemplate.id
                ? { ...t, title: updatedTemplate.title, subject: updatedTemplate.subject, content: updatedTemplate.content, updatedOn: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) }
                : t
        ));
        setEditingTemplate(null);
    };

    if (selectedTemplate) {
        return <ViewTemplate template={selectedTemplate} onBack={() => setSelectedTemplate(null)} />;
    }

    if (editingTemplate) {
        return <EditTemplate template={editingTemplate} onBack={() => setEditingTemplate(null)} onSave={handleSaveTemplate} />;
    }

    return (
        <div className="categories-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title">EMAIL TEMPLATES</h1>
                <div className="cat-breadcrumb">
                    <span>Emails</span> <span className="cat-bc-sep">›</span> <span>Email Templates</span>
                </div>
            </div>

            <div className="cat-card email-tpl-card">
                <div className="cat-controls-row">
                    <div className="cat-show-entries">
                        <span>Show</span>
                        <select value={entries} onChange={(e) => setEntries(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="cat-search">
                        <span>Search:</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="cat-table-responsive">
                    <table className="cat-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>S No.</th>
                                <th><span className="th-content">Title <span className="sort-icon">⇅</span></span></th>
                                <th><span className="th-content">Subject <span className="sort-icon">⇅</span></span></th>
                                <th><span className="th-content">Updated On <span className="sort-icon">⇅</span></span></th>
                                <th style={{ width: '100px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((tpl, index) => (
                                <tr key={tpl.id}>
                                    <td style={{ fontWeight: 500 }}>{index + 1}</td>
                                    <td>{tpl.title}</td>
                                    <td>{tpl.subject}</td>
                                    <td>{tpl.updatedOn}</td>
                                    <td>
                                        <div className="cat-action-btns">
                                            <button className="cat-action-btn edit-btn" onClick={() => setEditingTemplate(tpl)}><Edit size={14} /></button>
                                            <button className="cat-action-btn view-btn" onClick={() => setSelectedTemplate(tpl)}><Eye size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="cat-pagination-row">
                    <div className="cat-pagination">
                        <button className="cat-page-btn default">First</button>
                        <button className="cat-page-btn default">Previous</button>
                        <button className="cat-page-btn active">1</button>
                        <button className="cat-page-btn default">Next</button>
                        <button className="cat-page-btn default">Last</button>
                    </div>
                </div>
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>
                2026 © TV19.
            </footer>
        </div>
    );
}
