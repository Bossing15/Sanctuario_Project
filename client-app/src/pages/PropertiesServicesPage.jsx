import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertiesServicesPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';
import lawnLotsImg from '../assets/images/lawn_lots.jpg';
import familyEstateImg from '../assets/images/familt_estate.jpg';
import columbariumImg from '../assets/images/columbarium.jpg';
import intermentImg from '../assets/images/interment.jpg';
import cremationImg from '../assets/images/cremation.jpg';
import maintenanceImg from '../assets/images/pexels-dr-mohammad-hoque-86842308-29413845.jpg';

function PropertiesServicesPage() {
  const navigate = useNavigate();

  const properties = [
    {
      id: 1,
      title: 'Lawn Lots',
      description: 'Lawn Lots are the most basic type and at the same time most economical for...',
      path: '/lawn-lots',
      image: `url(${lawnLotsImg})`
    },
    {
      id: 2,
      title: 'Family Estates',
      description: 'Family Estates display luxury and exclusivity allowing you to have a private and secure place for your...',
      path: '/family-estates',
      image: `url(${familyEstateImg})`
    },
    {
      id: 3,
      title: 'Columbariums',
      description: 'Our indoor and garden columbariums facilities provide settings where you can feel at peace...',
      path: '/columbariums',
      image: `url(${columbariumImg})`
    }
  ];

  const services = [
    {
      id: 1,
      title: 'Interment',
      description: 'Honoring your departed loved ones by giving them a sacred resting place...',
      path: '/internment',
      image: `url(${intermentImg})`
    },
    {
      id: 2,
      title: 'Cremation',
      description: 'At the time to embrace a modern way in the country, we are proud to sponsor our...',
      path: '/cremation',
      image: `url(${cremationImg})`
    },
    {
      id: 3,
      title: 'Maintenance',
      description: 'Professional maintenance services to ensure your loved one\'s resting place remains beautiful and well-kept...',
      path: '/maintenance',
      image: `url(${maintenanceImg})`
    }
  ];

  return (
    <div className="properties-services-page">
      {/* Hero Banner */}
      <div className="ps-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="ps-hero-overlay"></div>
        <div className="ps-hero-content">
          <h1>Properties & Services</h1>
        </div>
      </div>

      {/* Properties Section */}
      <div className="ps-section properties-section">
        <div className="ps-section-header">
          <h2>Properties</h2>
          <div className="section-underline"></div>
        </div>

        <div className="properties-grid">
          {properties.map(property => (
            <div 
              key={property.id} 
              className="property-card"
              style={{ backgroundImage: property.image }}
            >
              <div className="card-overlay"></div>
              <div className="card-content">
                <h3>{property.title}</h3>
                <div className="card-underline"></div>
                <p>{property.description}</p>
                <button 
                  className="read-more-btn"
                  onClick={() => navigate(property.path)}
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="ps-section services-section">
        <div className="ps-section-header">
          <h2>Services</h2>
          <div className="section-underline"></div>
        </div>

        <div className="services-grid">
          {services.map(service => (
            <div 
              key={service.id} 
              className="service-card"
              style={{ backgroundImage: service.image }}
            >
              <div className="card-overlay"></div>
              <div className="card-content">
                <h3>{service.title}</h3>
                <div className="card-underline"></div>
                <p>{service.description}</p>
                <button 
                  className="read-more-btn"
                  onClick={() => navigate(service.path)}
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PropertiesServicesPage;
