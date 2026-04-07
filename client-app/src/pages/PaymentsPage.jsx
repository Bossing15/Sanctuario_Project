import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/LoginPromptModal';
import './PaymentsPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

// Credit/Debit Card Logos
import visaLogo from '../assets/images/visa.png';
import mastercardLogo from '../assets/images/master-crad-logo.png';
import jcbLogo from '../assets/images/jcb.png';

// E-Wallet Logos
import gcashLogo from '../assets/images/gcash-logo.png';
import mayaLogo from '../assets/images/maya-logo.png';
import grabpayLogo from '../assets/images/grab-pay-logo.png';

// Bank Logos
import bpiLogo from '../assets/images/bpi-logo.webp';
import unionbankLogo from '../assets/images/union-bank-logo.png';
import bdoLogo from '../assets/images/BDO-Logo-.jpg';
import chinabankLogo from '../assets/images/Chinabank-Logo.png';

function PaymentsPage() {
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handlePaymentMethodClick = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    // Navigate directly to billing page
    navigate('/billing');
  };

  return (
    <div className="payments-page">
      {/* Hero Banner */}
      <div className="payments-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Payments</h1>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="payment-section">
        <div className="section-content">
          <h2>Available Payment Methods</h2>
          <div className="section-underline"></div>
          <p className="payment-methods-subtitle">We accept the following payment methods through PayMongo. Click on any payment method to view and pay your outstanding balances.</p>
        </div>
      </div>

      {/* Credit/Debit Cards Section */}
      <div className="payment-section">
        <div className="section-content">
          <h2>Credit & Debit Cards</h2>
          <div className="section-underline"></div>
          
          <div className="banks-grid">
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={visaLogo} alt="Visa" />
            </div>
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={mastercardLogo} alt="Mastercard" />
            </div>
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={jcbLogo} alt="JCB" />
            </div>
          </div>
        </div>
      </div>

      {/* E-Wallets Section */}
      <div className="payment-section alt-bg">
        <div className="section-content">
          <h2>E-Wallets</h2>
          <div className="section-underline"></div>
          
          <div className="ewallets-grid">
            <div className="ewallet-card clickable" onClick={handlePaymentMethodClick}>
              <img src={gcashLogo} alt="GCash" />
            </div>
            <div className="ewallet-card clickable" onClick={handlePaymentMethodClick}>
              <img src={mayaLogo} alt="Maya" />
            </div>
            <div className="ewallet-card clickable" onClick={handlePaymentMethodClick}>
              <img src={grabpayLogo} alt="GrabPay" />
            </div>
          </div>
        </div>
      </div>

      {/* Online Banking Section */}
      <div className="payment-section">
        <div className="section-content">
          <h2>Online Banking</h2>
          <div className="section-underline"></div>
          
          <div className="banks-grid">
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={bpiLogo} alt="BPI" />
            </div>
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={unionbankLogo} alt="UnionBank" />
            </div>
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={bdoLogo} alt="BDO" />
            </div>
            <div className="bank-logo clickable" onClick={handlePaymentMethodClick}>
              <img src={chinabankLogo} alt="China Bank" />
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  );
}

export default PaymentsPage;
