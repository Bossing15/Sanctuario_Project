/**
 * Centralized Logo Configuration
 * This file manages all logo paths and imports for the application
 * Prevents duplication and makes it easy to update logo paths globally
 */

// Main Sanctuario Logo
export const MAIN_LOGO = '/Sanctuario_Logo_Good.png';

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

// Logo CSS Classes
export const LOGO_CLASSES = {
  navbar: 'brand-logo-img navbar',
  page: 'brand-logo-img page',
  navLogo: 'nav-logo enlarged-logo',
  bankLogo: 'bank-logo clickable',
  ewalletCard: 'ewallet-card clickable',
  brandLogo: 'brand-logo',
};
