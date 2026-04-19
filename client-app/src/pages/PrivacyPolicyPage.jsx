import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicyPage.css';
import privacyBg from '../assets/images/bg_our_team.jpg';

function PrivacyPolicyPage() {
  return (
    <div className="privacy-policy">
      {/* Hero Banner */}
      <div className="privacy-hero" style={{ backgroundImage: `url(${privacyBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Privacy Policy</h1>
        </div>
      </div>

      <div className="page-container">
        
        <div className="privacy-content">
          <p>
            Memorial Park ("we", "us", or "our") is dedicated to ensuring the privacy 
            and security of all of its individuals who access our website and services. This Privacy Policy outlines how we 
            collect, use, store, and share your information when you use our website or services. Please take the time to read 
            and understand our practices regarding your personal information.
          </p>
          
          <p>
            When someone comes to our website and makes use of our services, we gather, maintain, manage, 
            and share information about them, as other websites typically do. The information we collect depends on the nature 
            of the interactions that you have with us. For example, if a visitor requests a service or is a "Returning of Client" from our homepage 
            form, then we collect their name, email address, and phone number. We only collect information about visitors that they 
            knowingly and willingly provide through our contact forms, email, or other direct contact from them.
          </p>
          
          <p>
            The gathered data is used to facilitate service requests, make payments, offer support, and enhance the 
            user experience. We may also use this information to notify you about changes to our services, to comply with our legal 
            obligations, or to respond to your inquiries. Your information may be shared with our service providers who perform 
            functions on our behalf in relation to our services. Our service providers are obligated to maintain the confidentiality 
            and security of your information.
          </p>
          
          <p>
            We have taken security measures to protect against the loss, misuse, alteration, or access 
            of the information under our control. We implement appropriate technical and organizational measures to ensure a level 
            of security appropriate to the risk, including encryption of personal data, the ability to ensure ongoing confidentiality, 
            integrity, and availability of our systems and services, and the ability to restore access to personal data in a timely 
            manner in the event of a physical or technical incident.
          </p>
          
          <p>
            Additionally, we will use this Privacy Policy to accommodate changes in our practices, technology, or the law. 
            If we make changes to our Privacy Policy, we will post a notice on our website informing you of our new practices.
          </p>
          
          <p>
            For inquiries or concerns regarding this Privacy Policy, please contact us at:
            <br />
            Email: <a href="mailto:info@memorialpark.com">info@memorialpark.com</a>
            <br />
            Address: Memorial Park, Calumpang Rd, Carmona, Cavite, Philippines
          </p>
        </div>
        
        <div className="page-footer">
          <div className="footer-links">
            <Link to="/about">About Us</Link> | 
            <Link to="/team">Our Team</Link> | 
            <span className="active-link">Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
