import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../services/AuthContext';
import { getPreferences, updatePreferences, getNotifications, updateNotifications } from '../../../services/userService';
import '../../css/Preferences/PreferencesModal.css';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_CATEGORIES = [
  { id: 'trending', label: 'Trending', icon: 'fas fa-fire' },
  { id: 'india', label: 'India', icon: 'fas fa-flag' },
  { id: 'world', label: 'World', icon: 'fas fa-globe' },
  { id: 'politics', label: 'Politics', icon: 'fas fa-landmark' },
  { id: 'business', label: 'Business', icon: 'fas fa-chart-line' },
  { id: 'technology', label: 'Technology', icon: 'fas fa-microchip' },
  { id: 'sports', label: 'Sports', icon: 'fas fa-futbol' },
  { id: 'entertainment', label: 'Entertainment', icon: 'fas fa-film' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'fas fa-heart' },
  { id: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
  { id: 'finance', label: 'Finance', icon: 'fas fa-coins' },
  { id: 'crime', label: 'Crime', icon: 'fas fa-gavel' },
  { id: 'science', label: 'Science', icon: 'fas fa-flask' },
  { id: 'health', label: 'Health', icon: 'fas fa-heartbeat' },
  { id: 'environment', label: 'Environment', icon: 'fas fa-leaf' },
  { id: 'opinion', label: 'Opinion', icon: 'fas fa-comment-dots' },
  { id: 'astrology', label: 'Astrology', icon: 'fas fa-star' },
  { id: 'arts', label: 'Arts', icon: 'fas fa-palette' },
];

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [breakingNewsAlerts, setBreakingNewsAlerts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      Promise.all([getPreferences(), getNotifications()])
        .then(([prefs, notifs]) => {
          setSelectedCategories(prefs.categories || []);
          setBreakingNewsAlerts(notifs.breakingNews || false);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updatePreferences(selectedCategories),
        updateNotifications(breakingNewsAlerts),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="prefs-overlay" onClick={onClose}>
      <div className="prefs-modal" onClick={(e) => e.stopPropagation()}>
        <button className="prefs-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="prefs-header">
          <h2><i className="fas fa-sliders-h"></i> My Preferences</h2>
          <p>Select your interests to personalize your news feed</p>
        </div>

        {loading ? (
          <div className="prefs-loading">Loading preferences...</div>
        ) : (
          <>
            <div className="prefs-section">
              <h3>News Categories</h3>
              <p className="prefs-hint">Pick at least 3 categories for the best experience</p>
              <div className="prefs-grid">
                {AVAILABLE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`prefs-chip ${selectedCategories.includes(cat.id) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <i className={cat.icon}></i>
                    <span>{cat.label}</span>
                    {selectedCategories.includes(cat.id) && <i className="fas fa-check check-icon"></i>}
                  </button>
                ))}
              </div>
            </div>

            <div className="prefs-section">
              <h3><i className="fas fa-bell"></i> Notifications</h3>
              <label className="prefs-toggle-row">
                <div className="prefs-toggle-info">
                  <strong>Breaking News Alerts</strong>
                  <span>Get email notifications for breaking news stories</span>
                </div>
                <div
                  className={`prefs-toggle ${breakingNewsAlerts ? 'active' : ''}`}
                  onClick={() => { setBreakingNewsAlerts(!breakingNewsAlerts); setSaved(false); }}
                >
                  <div className="prefs-toggle-knob"></div>
                </div>
              </label>
            </div>

            <div className="prefs-footer">
              <span className="prefs-count">{selectedCategories.length} categories selected</span>
              <button
                className={`prefs-save-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreferencesModal;
