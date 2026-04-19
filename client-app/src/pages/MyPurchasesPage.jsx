import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaReceipt } from 'react-icons/fa';
import './MyPurchasesPage.css';

function MyPurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!userId) {
        setError('Please log in to view your purchases');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/payments?client_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPurchases(data.data || data);
      } else {
        setError('Failed to load purchases');
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-badge completed',
      pending: 'status-badge pending',
      overdue: 'status-badge overdue',
      failed: 'status-badge failed'
    };
    
    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="my-purchases-page">
      {/* Hero Banner */}
      <div className="purchases-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>My Lot Purchases</h1>
        </div>
      </div>

      <div className="purchases-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
          <FaArrowLeft />
        </button>
      </div>

      <div className="purchases-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading your purchases...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <FaReceipt className="empty-icon" />
            <p>No purchases found</p>
            <button className="btn-primary" onClick={() => navigate('/services')}>
              Browse Services
            </button>
          </div>
        ) : (
          <div className="purchases-list">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="purchase-card">
                <div className="purchase-header">
                  <div className="purchase-ref">
                    <span className="ref-label">Reference:</span>
                    <span className="ref-number">{purchase.payment_reference}</span>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>
                
                <div className="purchase-details">
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{purchase.description || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount">{formatCurrency(purchase.amount)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{purchase.payment_method}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {purchase.paid_date ? formatDate(purchase.paid_date) : formatDate(purchase.created_at)}
                    </span>
                  </div>
                  
                  {purchase.penalty_amount > 0 && (
                    <div className="detail-row penalty">
                      <span className="detail-label">Penalty:</span>
                      <span className="detail-value">{formatCurrency(purchase.penalty_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPurchasesPage;
