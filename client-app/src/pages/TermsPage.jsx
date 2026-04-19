import React from 'react';
import './TermsPage.css';

function TermsPage() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms of Use</h1>
        
        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Sanctuario De Carmona 
            Memorial Park's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer 
            of title, and under this license you may not:
          </p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the website</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Disclaimer</h2>
          <p>
            The materials on Sanctuario De Carmona Memorial Park's website are provided on an 'as is' basis. Sanctuario De Carmona 
            Memorial Park makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, 
            without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
            of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Limitations</h2>
          <p>
            In no event shall Sanctuario De Carmona Memorial Park or its suppliers be liable for any damages (including, without limitation, 
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials 
            on Sanctuario De Carmona Memorial Park's website.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on Sanctuario De Carmona Memorial Park's website could include technical, typographical, or photographic 
            errors. Sanctuario De Carmona Memorial Park does not warrant that any of the materials on its website are accurate, complete, 
            or current. Sanctuario De Carmona Memorial Park may make changes to the materials contained on its website at any time without notice.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Links</h2>
          <p>
            Sanctuario De Carmona Memorial Park has not reviewed all of the sites linked to its website and is not responsible for the contents 
            of any such linked site. The inclusion of any link does not imply endorsement by Sanctuario De Carmona Memorial Park of the site. 
            Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Modifications</h2>
          <p>
            Sanctuario De Carmona Memorial Park may revise these terms of service for its website at any time without notice. By using this 
            website, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the Philippines, and you irrevocably 
            submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
