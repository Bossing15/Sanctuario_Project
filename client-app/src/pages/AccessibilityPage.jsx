import React from 'react';
import './AccessibilityPage.css';

function AccessibilityPage() {
  return (
    <div className="accessibility-page">
      <div className="accessibility-container">
        <h1>Accessibility Statement</h1>
        
        <section className="accessibility-section">
          <h2>Our Commitment to Accessibility</h2>
          <p>
            Sanctuario De Carmona Memorial Park is committed to ensuring digital accessibility for people with disabilities. 
            We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>
        </section>

        <section className="accessibility-section">
          <h2>Accessibility Features</h2>
          <p>Our website includes the following accessibility features:</p>
          <ul>
            <li>Keyboard navigation support for all interactive elements</li>
            <li>High contrast color schemes for better readability</li>
            <li>Alt text for all images and visual content</li>
            <li>Semantic HTML structure for screen reader compatibility</li>
            <li>Resizable text and responsive design</li>
            <li>Skip navigation links for quick access to main content</li>
            <li>ARIA labels and roles for enhanced screen reader support</li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2>Browser and Assistive Technology Support</h2>
          <p>
            Our website is designed to work with the following assistive technologies:
          </p>
          <ul>
            <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
            <li>Voice recognition software</li>
            <li>Magnification software</li>
            <li>Speech-to-text applications</li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2>Standards Compliance</h2>
          <p>
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
            These guidelines explain how to make web content more accessible to people with disabilities.
          </p>
        </section>

        <section className="accessibility-section">
          <h2>Known Limitations</h2>
          <p>
            While we work continuously to improve accessibility, some third-party content or embedded media may not fully comply 
            with accessibility standards. We are working with our partners to improve these areas.
          </p>
        </section>

        <section className="accessibility-section">
          <h2>Feedback and Support</h2>
          <p>
            If you experience any difficulty accessing our website or have suggestions for improvement, please contact us:
          </p>
          <ul>
            <li>Email: accessibility@sanctuario.com</li>
            <li>Phone: +63 (0) 123-456-7890</li>
            <li>Hours: Monday - Friday, 9:00 AM - 5:00 PM (Philippine Time)</li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2>Accessibility Tools</h2>
          <p>
            Most browsers include built-in accessibility features. Here are some resources to help you customize your browsing experience:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/6003947" target="_blank" rel="noopener noreferrer">Chrome Accessibility</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/accessibility-features-firefox" target="_blank" rel="noopener noreferrer">Firefox Accessibility</a></li>
            <li><a href="https://support.apple.com/en-us/HT201365" target="_blank" rel="noopener noreferrer">Safari Accessibility</a></li>
            <li><a href="https://support.microsoft.com/en-us/windows/windows-accessibility-features-and-settings-6e3e987b-e112-425f-8c48-e193f4b5e0d0" target="_blank" rel="noopener noreferrer">Windows Accessibility</a></li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2>Last Updated</h2>
          <p>This accessibility statement was last updated on April 19, 2026.</p>
        </section>
      </div>
    </div>
  );
}

export default AccessibilityPage;
