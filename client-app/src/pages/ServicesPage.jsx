import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ServiceDetail from '../components/ServiceDetail';
import './ServicesPage.css';

function ServicesPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch services from backend (public API)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/public/services', {
          headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) throw new Error(`Failed to load services (${response.status})`);
        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Unable to load services right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getFallbackImage = useCallback((category) => {
    try {
      switch (category) {
        case 'Lot Purchases':
          return require('../assets/images/services_pic/pic6.jpg');
        case 'Burial Services':
          return require('../assets/images/services_pic/pic4.webp');
        case 'Grave Maintenance':
        default:
          return require('../assets/images/services_pic/pic1.webp');
      }
    } catch (e) {
      return null;
    }
  }, []);

  const toDetailService = useCallback((svc) => ({
    title: svc.title,
    description: svc.description,
    image: svc.image_path ? `/${svc.image_path}` : getFallbackImage(svc.category),
    prices: {
      monthly: Number(svc.price_monthly || 0),
      quarterly: Number(svc.price_quarterly || 0),
      yearly: Number(svc.price_yearly || 0),
    },
    discount_percentage: svc.discount_percentage ? Number(svc.discount_percentage) : 0,
  }), [getFallbackImage]);

  const handleServiceClick = (svc) => {
    setSelectedService(toDetailService(svc));
  };

  const handleCloseDetail = () => setSelectedService(null);

  // Auto-open service detail based on ?service=slug param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slugParam = params.get('service');
    if (slugParam && services.length > 0) {
      const svc = services.find(s => s.slug === slugParam);
      if (svc) setSelectedService(toDetailService(svc));
    }
  }, [location.search, services, toDetailService]);

  // Categories and filtered list for modern UI

  const categories = ['All', 'Lot Purchases', 'Burial Services', 'Grave Maintenance'];
  const filteredServices = services.filter((s) => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === ''
      ? true
      : (s.title || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="services-page">
      <div className="services-hero-banner">
        <div className="services-hero-content">
          <h1>Our Services</h1>
          <p>Cleaned with care, honored with respect.</p>
        </div>
      </div>

      <div className="services-intro">
        <p>We offer respectful and professional services to support your family — from lot purchases to burial arrangements and ongoing grave maintenance. Explore our offerings grouped by category below.</p>
      </div>

      <div className="services-content">
        {loading && (
          <div className="services-grid"><p>Loading services...</p></div>
        )}
        {error && (
          <div className="services-grid"><p>{error}</p></div>
        )}

         {!loading && !error && (
          <>
            {/* Why choose our services moved above cards */}
            <div className="services-highlight">
              <h2>Why choose our services</h2>
              <p className="highlight-subtitle">We Have Experienced & Expert Caretakers</p>
              <div className="stats-row">
                <div className="stat-shield">
                  <h3>1000+</h3>
                  <p>Graves maintained</p>
                </div>
                <div className="stat-shield">
                  <h3>10+</h3>
                  <p>years experience</p>
                </div>
                <div className="stat-shield">
                  <h3>100%</h3>
                  <p>Equipment & Supplies Provided</p>
                </div>
                <div className="stat-shield">
                  <h3>24/7</h3>
                  <p>Support</p>
                </div>
              </div>
            </div>

            {/* Section Header above selections */}
            <h2 className="services-section-title">Services Offered</h2>

            {/* Controls: Category Tabs + Search */}
            <div className="services-controls">
              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                    <span className="count">
                      {cat === 'All'
                        ? services.length
                        : services.filter((s) => s.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modern Cards Grid */}
            <div className="modern-grid">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  service.category === 'Grave Maintenance' ? (
                    // ProductsServicesPage style for Grave Maintenance
                    <div 
                      key={service.id} 
                      className="ps-service-card"
                      style={{
                        backgroundImage: service.image_path 
                          ? `url(/${service.image_path})` 
                          : `url(${getFallbackImage(service.category)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => handleServiceClick(service)}
                    >
                      <div className="ps-card-overlay"></div>
                      {service.discount_percentage && parseFloat(service.discount_percentage) > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          backgroundColor: '#ff6b35',
                          color: 'white',
                          padding: '8px 14px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          zIndex: 3,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                          🏷️ {service.discount_percentage}% OFF
                        </div>
                      )}
                      <div className="ps-card-content">
                        <h3>{service.title}</h3>
                        <div className="ps-card-underline"></div>
                        <p>{service.description}</p>
                        <button className="ps-read-more-btn">
                          Learn More →
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Original modern-card style for other services
                    <div key={service.id} className="modern-card">
                      <div className="image-wrap">
                        <img
                          src={service.image_path ? `/${service.image_path}` : getFallbackImage(service.category)}
                          alt={service.title}
                        />
                        {service.discount_percentage && parseFloat(service.discount_percentage) > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#ff6b35',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            zIndex: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            🏷️ {service.discount_percentage}% OFF
                          </div>
                        )}
                        <div className="overlay">
                          <span className="category-chip">{service.category}</span>
                          <h3 className="card-title">{service.title}</h3>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-desc">{service.description}</p>
                        <button
                          className="cta"
                          onClick={() => handleServiceClick(service)}
                        >
                          Learn More
                        </button>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <p className="no-results">No services match your filters.</p>
              )}
            </div>
          </>
        )}
      </div>

      {selectedService && (
        <ServiceDetail 
          service={selectedService} 
          onClose={handleCloseDetail}
          navigate={navigate}
        />
      )}
    </div>
  );
}

export default ServicesPage;
