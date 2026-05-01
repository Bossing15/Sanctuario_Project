/**
 * Centralized Logo Configuration
 * This file manages all logo paths and imports for the application
 * Prevents duplication and makes it easy to update logo paths globally
 */

// Main Sanctuario Logo - Public path for flexibility
export const MAIN_LOGO = '/Sanctuario_Logo_Good.png';

// Logo Fallback SVG (in case image fails to load)
export const LOGO_FALLBACK_SVG = (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#16a34a" opacity="0.1" />
    <path d="M50 20 L65 35 L60 50 L65 65 L50 80 L35 65 L40 50 L35 35 Z" fill="#16a34a" />
  </svg>
);

// Payment Method Logos
export const PAYMENT_LOGOS = {
  // Credit/Debit Card Logos
  visa: require('../assets/images/visa.png'),
  mastercard: require('../assets/images/master-crad-logo.png'),
  jcb: require('../assets/images/jcb.png'),
  
  // E-Wallet Logos
  gcash: require('../assets/images/gcash-logo.png'),
  maya: require('../assets/images/maya-logo.png'),
  grabpay: require('../assets/images/grab-pay-logo.png'),
  
  // Bank Logos
  bpi: require('../assets/images/bpi-logo.webp'),
  unionbank: require('../assets/images/union-bank-logo.png'),
  bdo: require('../assets/images/BDO-Logo-.jpg'),
  chinabank: require('../assets/images/Chinabank-Logo.png'),
};

// Logo Alt Text
export const LOGO_ALT_TEXT = {
  main: 'Sanctuario De Carmona Memorial Park Logo',
  visa: 'Visa',
  mastercard: 'Mastercard',
  jcb: 'JCB',
  gcash: 'GCash',
  maya: 'Maya',
  grabpay: 'GrabPay',
  bpi: 'BPI',
  unionbank: 'UnionBank',
  bdo: 'BDO',
  chinabank: 'China Bank',
};

// Logo CSS Classes - Simplified and flexible
export const LOGO_CLASSES = {
  navbar: 'navbar-logo',
  page: 'page-logo',
  navLogo: 'nav-logo-container',
  bankLogo: 'bank-logo clickable',
  ewalletCard: 'ewallet-card clickable',
  brandLogo: 'brand-logo',
};

// Logo Size Presets for easy customization
export const LOGO_SIZES = {
  navbar: { width: 'auto', height: '50px' },
  mobile: { width: 'auto', height: '40px' },
  page: { width: 'auto', height: '60px' },
  small: { width: 'auto', height: '32px' },
  large: { width: 'auto', height: '80px' },
};
