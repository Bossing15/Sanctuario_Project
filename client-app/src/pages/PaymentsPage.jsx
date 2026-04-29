import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/LoginPromptModal';
import { PAYMENT_LOGOS, LOGO_ALT_TEXT, LOGO_CLASSES } from '../config/logoConfig';
import './PaymentsPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

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
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.visa} alt={LOGO_ALT_TEXT.visa} />
            </div>
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.mastercard} alt={LOGO_ALT_TEXT.mastercard} />
            </div>
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.jcb} alt={LOGO_ALT_TEXT.jcb} />
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
            <div className={LOGO_CLASSES.ewalletCard} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.gcash} alt={LOGO_ALT_TEXT.gcash} />
            </div>
            <div className={LOGO_CLASSES.ewalletCard} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.maya} alt={LOGO_ALT_TEXT.maya} />
            </div>
            <div className={LOGO_CLASSES.ewalletCard} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.grabpay} alt={LOGO_ALT_TEXT.grabpay} />
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
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.bpi} alt={LOGO_ALT_TEXT.bpi} />
            </div>
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.unionbank} alt={LOGO_ALT_TEXT.unionbank} />
            </div>
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.bdo} alt={LOGO_ALT_TEXT.bdo} />
            </div>
            <div className={LOGO_CLASSES.bankLogo} onClick={handlePaymentMethodClick}>
              <img src={PAYMENT_LOGOS.chinabank} alt={LOGO_ALT_TEXT.chinabank} />
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
