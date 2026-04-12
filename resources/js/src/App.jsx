import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import CustomersPage from "./Components/Customers";
import Billing from "./Components/Billing";
import PaymentHistoryDetails from "./Components/PaymentHistoryDetails";
import Graves from "./Components/Graves";
import Navbar from "./Components/Navbar";
import Admin from "./Components/Admin";
import Settings from "./Components/Settings";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Profile from "./Components/Profile";
import RequirementManagement from "./Components/RequirementManagement";
import InquiriesManagement from "./Components/InquiriesManagement";
import MessagesManagement from "./Components/MessagesManagement";
import AdminPaymentSuccess from "./Components/AdminPaymentSuccess";
import AdminPaymentCancel from "./Components/AdminPaymentCancel";
import Maintenance from "./Components/Maintenance";
import Services from "./Components/Services";
import Products from "./Components/Products";
import ServiceDetailEditor from "./Components/ServiceDetailEditor";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/login'} replace />;
  }
  
  return children;
};

const RootRedirect = () => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const Layout = ({ children, collapsed, setCollapsed }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setMounted(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const isAuthPage = ["/login", "/admin/login", "/register", "/forgot-password", "/admin/payment/success", "/admin/payment/cancel"].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
      {!isAuthPage && <Navbar collapsed={collapsed} />}

      <main
        className={`${
          isAuthPage
            ? "h-screen w-screen m-0 p-0 overflow-hidden"
            : `overflow-auto min-h-screen ${
                collapsed ? "collapsed" : ""
              } ${mounted ? "no-transition" : ""}`
        }`}
        style={isAuthPage ? { margin: 0, padding: 0, width: '100vw', height: '100vh' } : {}}
      >
        {children}
      </main>
    </>
  );
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add preload class to disable animations on initial load
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('preload');
      const timer = setTimeout(() => {
        root.classList.remove('preload');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Router>
      <Layout collapsed={collapsed} setCollapsed={setCollapsed} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard collapsed={collapsed} />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute requiredRole="admin">
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute requiredRole="admin">
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/billing/history" element={
            <ProtectedRoute requiredRole="admin">
              <PaymentHistoryDetails />
            </ProtectedRoute>
          } />
          <Route path="/graves" element={
            <ProtectedRoute requiredRole="admin">
              <Graves />
            </ProtectedRoute>
          } />
          <Route path="/requirements" element={
            <ProtectedRoute requiredRole="admin">
              <RequirementManagement />
            </ProtectedRoute>
          } />
          <Route path="/inquiries" element={
            <ProtectedRoute requiredRole="admin">
              <InquiriesManagement />
            </ProtectedRoute>
          } />
          <Route path="/maintenance-requests" element={
            <ProtectedRoute requiredRole="admin">
              <Maintenance />
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute requiredRole="admin">
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/services/:serviceId/edit" element={
            <ProtectedRoute requiredRole="admin">
              <ServiceDetailEditor />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute requiredRole="admin">
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute requiredRole="admin">
              <MessagesManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="admin">
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/payment/success" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPaymentSuccess />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/payment/cancel" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPaymentCancel />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;