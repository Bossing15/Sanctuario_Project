import React, { useState, useEffect } from "react";
import settingsIcon from "../assets/icons/Settings.png";
import AlertModal from "./AlertModal";

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('homepage');
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', title: '', message: '' });

  const tabs = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer' },
    { id: 'social', label: 'Social Media' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/site-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
      } else {
        // If no settings exist, initialize defaults
        await initializeDefaults();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setAlertModal({ show: true, type: 'error', title: 'Error', message: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      const response = await fetch('/api/admin/site-settings/initialize-defaults', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: {
          ...prev[activeTab]?.[key],
          value: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Flatten settings for API
      const flatSettings = {};
      Object.keys(settings).forEach(category => {
        Object.keys(settings[category]).forEach(key => {
          flatSettings[key] = settings[category][key].value;
        });
      });

      console.log('Sending settings update:', flatSettings);

      const response = await fetch('/api/admin/site-settings/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ settings: flatSettings }),
      });

      if (response.ok) {
        setAlertModal({ show: true, type: 'success', title: 'Success', message: 'Settings saved successfully! Changes will appear on the client website immediately.' });
        // Refetch to ensure we have the latest data
        fetchSettings();
      } else {
        const errorData = await response.text();
        console.error('Settings save error:', response.status, errorData);
        setAlertModal({ show: true, type: 'error', title: 'Error', message: `Failed to save settings: ${response.status} ${response.statusText}` });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlertModal({ show: true, type: 'error', title: 'Error', message: `Failed to save settings: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', key);

      const response = await fetch('/api/admin/site-settings/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleInputChange(key, data.path);
        setAlertModal({ show: true, type: 'success', title: 'Success', message: 'Image uploaded successfully!' });
      } else {
        setAlertModal({ show: true, type: 'error', title: 'Error', message: 'Failed to upload image' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setAlertModal({ show: true, type: 'error', title: 'Error', message: 'Failed to upload image' });
    }
  };

  const renderField = (key, setting) => {
    const value = setting.value || '';
    
    switch (setting.type) {
      case 'textarea':
        return (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={setting.description}
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleImageUpload(key, file);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {value && (
              <div className="mt-2">
                <img 
                  src={value.startsWith('http') ? value : `/storage/${value}`} 
                  alt="Preview" 
                  className="max-w-xs h-32 object-cover rounded-md border"
                  onError={(e) => {
                    console.error('Image failed to load:', value);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
      
      case 'email':
        return (
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={setting.description}
          />
        );
      
      default:
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder={setting.description}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-8 pt-8 flex-grow">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img src={settingsIcon} alt="Settings Icon" className="w-10 h-10 object-contain mr-4" />
            <div>
              <h3 className="text-3xl font-bold text-gray-800">Site Settings</h3>
              <p className="text-gray-600 mt-1">Manage all content displayed on the client website</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div>
              <h4 className="font-semibold text-blue-900">How to use Site Settings</h4>
              <p className="text-blue-800 text-sm mt-1">
                Use these settings to customize the content displayed on the client website. Changes are saved to the database and will be reflected on the client portal immediately after saving.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="settings-tabs flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {settings[activeTab] && Object.keys(settings[activeTab]).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(settings[activeTab]).map(([key, setting]) => (
                  <div key={key} className="space-y-2 pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          {setting.label}
                        </label>
                        {setting.description && (
                          <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                        )}
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-4">
                        {setting.type}
                      </span>
                    </div>
                    <div className="mt-3">
                      {renderField(key, setting)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No settings available</h3>
                <p className="text-gray-500">Settings for this category will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Save Button */}
      <div className="px-8 py-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            saving 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, type: 'info', title: '', message: '' })}
        />
      )}
    </div>
  );
}


