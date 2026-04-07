import { useState, useEffect } from 'react';

const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/site-settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      
      // Transform settings into a flat object with key-value pairs
      const transformedSettings = {};
      if (data.settings) {
        Object.entries(data.settings).forEach(([key, setting]) => {
          transformedSettings[key] = setting.value || '';
        });
      }
      
      setSettings(transformedSettings);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      // Set default values if fetch fails
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key, defaultValue = '') => {
    return settings[key] || defaultValue;
  };

  const getDefaultSettings = () => {
    return {
      // Homepage
      homepage_title: 'Welcome to Sanctuario De Carmona Memorial Park',
      homepage_subtitle: 'Your sanctuary for peace and tranquility in the heart of Cavite',
      homepage_hero_image: 'assets/images/pic7.jpg',
      
      // About
      about_title: 'Who We Are',
      about_description: 'Sanctuario De Carmona Memorial Park is a peaceful sanctuary dedicated to honoring the memory of your loved ones.',
      about_story_title: 'Our Story',
      about_story_content: 'Founded in 2024, Sanctuario De Carmona Memorial Park has been a beacon of peace and tranquility in the heart of Cavite.',
      about_mission_title: 'Our Mission',
      about_mission_content: 'We are dedicated to providing a sanctuary where individuals can connect with their inner selves.',
      about_values_title: 'Our Values',
      
      // Services
      services_title: 'Our Products & Services',
      services_description: 'At Sanctuario De Carmona Memorial Park, we provide comprehensive memorial products and services.',
      services_cta_text: 'Explore Our Services',
      
      // Contact
      contact_title: 'Contact Us',
      contact_phone: '+63 912 345 6789',
      contact_email: 'info@sanctuario.com',
      contact_address: 'Sanctuario De Carmona Memorial Park, Carmona, Cavite, Philippines',
      contact_location_title: 'Location',
      contact_hours_title: 'Business Hours',
      contact_hours_content: 'Our team is available every day from Monday to Sunday, 8:00 AM to 5:00 PM.',
      contact_cta_text: 'Contact Us',
      
      // Footer
      footer_company_name: 'Sanctuario De Carmona Memorial Park',
      footer_copyright_text: '© 2024 Sanctuario De Carmona Memorial Park. All rights reserved.',
      footer_description: 'A peaceful sanctuary dedicated to honoring the memory of your loved ones.',
      footer_logo: 'assets/images/Sanctuario_Logo_Good.png',
      footer_grief_support_title: 'A YEAR OF DAILY GRIEF SUPPORT',
      footer_grief_support_text: 'Our support in your time of need does not end after the funeral services. Enter your email below to receive a grief support message from us each day for a year.',
      footer_location_title: 'OUR LOCATION',
      footer_location_address: 'Memorial Park, Calumpang Rd, Carmona, 4116 Cavite',
      footer_phone: 'Tel: 1-888-881-6131',
      footer_fax: 'Fax: 1-617-949-5459',
      
      // Social
      social_facebook: 'https://facebook.com/sanctuario',
      social_instagram: 'https://instagram.com/sanctuario',
      social_twitter: 'https://twitter.com/sanctuario',
      social_youtube: 'https://youtube.com/sanctuario',
      
      // General
      site_name: 'Sanctuario De Carmona Memorial Park',
      site_tagline: 'A Sanctuary for Peace and Remembrance',
      site_logo: 'assets/images/Sanctuario_Logo_Good.png',
    };
  };

  return {
    settings,
    loading,
    error,
    getSetting,
    refetch: fetchSettings
  };
};

export default useSettings;
