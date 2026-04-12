import { useState, useEffect } from 'react';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Try relative URL first (works with dev server proxy)
      let response = await fetch('/api/site-settings');
      
      // If relative URL fails, try absolute URL (for built/production version)
      if (!response.ok && response.status === 404) {
        console.log('Relative URL failed, trying absolute URL...');
        response = await fetch('http://localhost:8000/api/site-settings');
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Convert settings object to key-value object for easier access
        const settingsObj = {};
        if (data.settings) {
          // The API returns settings as an object where each key contains the full setting object
          Object.entries(data.settings).forEach(([key, setting]) => {
            // Handle both old format (direct value) and new format (object with value property)
            if (typeof setting === 'object' && setting.value !== undefined) {
              settingsObj[key] = setting.value;
            } else {
              settingsObj[key] = setting;
            }
          });
        }
        
        setSettings(settingsObj);
      } else {
        setError('Failed to load site settings');
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      
      // Try absolute URL as fallback
      try {
        console.log('Fetch failed, trying absolute URL as fallback...');
        const response = await fetch('http://localhost:8000/api/site-settings');
        
        if (response.ok) {
          const data = await response.json();
          
          const settingsObj = {};
          if (data.settings) {
            Object.entries(data.settings).forEach(([key, setting]) => {
              if (typeof setting === 'object' && setting.value !== undefined) {
                settingsObj[key] = setting.value;
              } else {
                settingsObj[key] = setting;
              }
            });
          }
          
          setSettings(settingsObj);
        } else {
          setError('Failed to load site settings');
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch also failed:', fallbackErr);
        setError('Failed to load site settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key, defaultValue = '') => {
    return settings[key] || defaultValue;
  };

  return {
    settings,
    loading,
    error,
    getSetting,
    refetch: fetchSettings
  };
};

export default useSiteSettings;