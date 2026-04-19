import React, { useState } from 'react';
import './ContactPage.css';
import contactBg from '../assets/images/pexels-brett-sayles-3653998.jpg';
import AlertModal from '../components/AlertModal';

function ContactPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting contact form:', formData);

    try {
      const response = await fetch('http://localhost:8000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setAlertModal({
          show: true,
          type: 'success',
          message: 'Thank you for contacting us! We will get back to you soon.'
        });
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setAlertModal({
          show: true,
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact">
      {/* Hero Banner */}
      <div className="contact-hero" style={{ backgroundImage: `url(${contactBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p className="hero-subtitle">We are available until 5pm, 365 days a year.</p>
        </div>
      </div>

      <div className="page-container">
        <div className="contact-message">
          <p>Send us a message anytime we'd be honored to serve you.</p>
          <div className="message-underline"></div>
        </div>

        <div className="contact-info-text">
          <p>We understand how important it is to keep your loved ones' resting place clean, beautiful, and well-cared for and we're here to help you do just that.</p>
          <p>Our team is available every day from Monday to Sunday, 8:00 AM to 5:00 PM. Ready to provide respectful and reliable grave cleaning services. Whether you prefer to call, text, or email, we're always here to listen, respond, and serve you promptly. Your convenience and peace of mind matter to us.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-form-container">
            <h3 className="form-header">Message Us:</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input 
                  type="text" 
                  name="first_name"
                  placeholder="First name" 
                  value={formData.first_name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  name="last_name"
                  placeholder="Last name" 
                  value={formData.last_name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Your email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Your phone number" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <textarea 
                  name="message"
                  placeholder="Your message or question" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>

          <div className="location-container">
            <h3>Our Location:</h3>
            <div className="map-container">
              <iframe 
                title="Sanctuario De Carmona Memorial Park Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.6602565565424!2d120.96191007580673!3d14.28934168694247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d77a5bb94d8d%3A0x4e9750ec3c9d1ba6!2sMemorial%20Park!5e0!3m2!1sen!2sph!4v1715817600000!5m2!1sen!2sph" 
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            <p>Memorial Park,</p>
            <p>Calumpang Rd, Carmona, 4116 Cavite</p>
            <div className="map-buttons">
              <a href="https://goo.gl/maps/YourActualGoogleMapsLink" target="_blank" rel="noopener noreferrer" className="map-button">Get Directions</a>
              <a href="tel:+639123456789" className="map-button">Call Us</a>
            </div>
          </div>
        </div>
        

      </div>

      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, type: '', message: '' })}
        />
      )}
    </div>
  );
}

export default ContactPage;
