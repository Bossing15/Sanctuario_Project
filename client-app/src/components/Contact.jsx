import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import useSettings from '../hooks/useSettings';
import './Contact.css';

function Contact() {
  const { getSetting, loading } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  if (loading) {
    return <div className="page-container"><p>Loading...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="announcement-section">
        <div className="announcement-overlay"></div>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-card">
            <FaMapMarkerAlt className="info-icon" />
            <h3>{getSetting('contact_location_title', 'Location')}</h3>
            <p>{getSetting('contact_address', 'Memorial Park, Carmona, Cavite')}</p>
          </div>
          <div className="info-card">
            <FaClock className="info-icon" />
            <h3>{getSetting('contact_hours_title', 'Business Hours')}</h3>
            <p>{getSetting('contact_hours_content', 'Our team is available every day from Monday to Sunday, 8:00 AM to 5:00 PM, ready to provide respectful and reliable grave cleaning services.')}</p>
          </div>
          <div className="info-card">
            <FaPhone className="info-icon" />
            <h3>Contact Information</h3>
            <p>{getSetting('contact_phone', '+63 912 345 6789')}</p>
            <p>{getSetting('contact_email', 'info@sanctuario.com')}</p>
          </div>
        </div>

        <div className="contact-form-container">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={submitted ? 'submitted' : ''}
            >
              {submitted ? 'Message Sent!' : getSetting('contact_cta_text', 'Send Message')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
