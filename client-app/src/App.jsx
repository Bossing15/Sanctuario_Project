import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TeamPage from './pages/TeamPage';
import UserPage from './pages/UserPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import MyPurchasesPage from './pages/MyPurchasesPage';
import MyServicesPage from './pages/MyServicesPage';
import MyMaintenanceRequestsPage from './pages/MyMaintenanceRequestsPage';
import InternmentPage from './pages/InternmentPage';
import MaintenancePage from './pages/MaintenancePage';
import ProductsServicesPage from './pages/ProductsServicesPage';
import LawnLotsPage from './pages/LawnLotsPage';
import FamilyEstatesPage from './pages/FamilyEstatesPage';
import ColumbariumsPage from './pages/ColumbariumsPage';
import CremationPage from './pages/CremationPage';
import PaymentsPage from './pages/PaymentsPage';
import BillingPage from './pages/BillingPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import TermsPage from './pages/TermsPage';
import AccessibilityPage from './pages/AccessibilityPage';
import ScrollToTop from './components/ScrollToTop';
import './styles/responsive.css';
import './styles/modals.css';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = ['/login', '/signup', '/user', '/payment', '/payment/success', '/payment/cancel', '/my-purchases'].includes(location.pathname);
  const hideFooter = ['/login', '/signup', '/user', '/payment', '/payment/success', '/payment/cancel', '/my-purchases'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ScrollToTop />
      <Routes>
        {/* redirect root to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* home route */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/products-services" element={<ProductsServicesPage />} />
        <Route path="/internment" element={<InternmentPage />} />
        <Route path="/lawn-lots" element={<LawnLotsPage />} />
        <Route path="/family-estates" element={<FamilyEstatesPage />} />
        <Route path="/columbariums" element={<ColumbariumsPage />} />
        <Route path="/cremation" element={<CremationPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        {/* Fixed route to match navbar links */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/login" element={<LoginPage onLogin={() => navigate('/home')} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/my-purchases" element={<MyPurchasesPage />} />
        <Route path="/my-services" element={<MyServicesPage />} />
        <Route path="/my-maintenance-requests" element={<MyMaintenanceRequestsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  useEffect(() => {
    // Ensure viewport meta tag is set for responsive design
    let viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.getElementsByTagName('head')[0].appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    
    // Add responsive class to body
    document.body.classList.add('responsive-body');
  }, []);

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
