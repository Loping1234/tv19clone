import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedinIn, FaLink } from "react-icons/fa";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "15px", marginBottom: "15px" }}>
      <span style={{ fontWeight: 600, fontSize: "14px", color: "#333", marginRight: "10px" }}>Share:</span>
      
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={iconStyle("#1877F2")}
      >
        <FaFacebookF size={16} />
      </a>
      
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        style={iconStyle("#000000")}
      >
        <FaTwitter size={16} />
      </a>
      
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle} %0A ${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={iconStyle("#25D366")}
      >
        <FaWhatsapp size={16} />
      </a>
      
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={iconStyle("#0A66C2")}
      >
        <FaLinkedinIn size={16} />
      </a>

      <button onClick={handleCopy} style={iconStyle("#666666", true)} title="Copy URL">
        <FaLink size={16} />
      </button>

      {copied && <span style={{ fontSize: "12px", color: "#25D366", marginLeft: "5px" }}>Copied!</span>}
    </div>
  );
};

const iconStyle = (bgColor: string, isButton = false): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: bgColor,
  color: "#fff",
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.2s ease",
  ...(isButton && { outline: "none" }),
});

export default ShareButtons;
