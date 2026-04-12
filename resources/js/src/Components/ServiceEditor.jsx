import React, { useState, useEffect } from 'react';
import './ServiceEditor.css';

const ServiceEditor = ({ service, isOpen, onClose, onSave, canManageServices }) => {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    category: service?.category || 'Grave Maintenance',
    description: service?.description || '',
    price_monthly: service?.price_monthly || '',
    price_quarterly: service?.price_quarterly || '',
    price_yearly: service?.price_yearly || '',
    discount_percentage: service?.discount_percentage || '',
    status: service?.status || 'Active',
    image_path: service?.image_path || '',
  });

  const [previewImage, setPreviewImage] = useState(service?.image_path || null);
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Update form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        category: service.category || 'Grave Maintenance',
        description: service.description || '',
        price_monthly: service.price_monthly || '',
        price_quarterly: service.price_quarterly || '',
        price_yearly: service.price_yearly || '',
        discount_percentage: service.discount_percentage || '',
        status: service.status || 'Active',
        image_path: service.image_path || '',
      });
      setPreviewImage(service.image_path || null);
      setImageFile(null);
    }
  }, [service, isOpen]);

  const serviceCategories = ['Grave Maintenance', 'Services'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div className="service-editor-overlay" onClick={onClose}>
      <div className="service-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="service-editor-header">
          <h2>{service?.id ? 'Edit Service' : 'Add New Service'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="service-editor-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing
          </button>
          <button
            className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        <form onSubmit={handleSubmit} className="service-editor-form">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Service Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter service title"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {serviceCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={6}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="tab-content">
              <div className="pricing-grid">
                <div className="form-group">
                  <label>Monthly Price (₱)</label>
                  <input
                    type="number"
                    name="price_monthly"
                    value={formData.price_monthly}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Quarterly Price (₱)</label>
                  <input
                    type="number"
                    name="price_quarterly"
                    value={formData.price_quarterly}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Yearly Price (₱)</label>
                  <input
                    type="number"
                    name="price_yearly"
                    value={formData.price_yearly}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="pricing-summary">
                <h3>Pricing Summary</h3>
                {formData.price_monthly && (
                  <div className="summary-item">
                    <span>Monthly:</span>
                    <span className="price">₱{parseFloat(formData.price_monthly).toFixed(2)}</span>
                  </div>
                )}
                {formData.price_quarterly && (
                  <div className="summary-item">
                    <span>Quarterly:</span>
                    <span className="price">₱{parseFloat(formData.price_quarterly).toFixed(2)}</span>
                  </div>
                )}
                {formData.price_yearly && (
                  <div className="summary-item">
                    <span>Yearly:</span>
                    <span className="price">₱{parseFloat(formData.price_yearly).toFixed(2)}</span>
                  </div>
                )}
                {formData.discount_percentage && (
                  <div className="summary-item discount">
                    <span>Discount:</span>
                    <span className="discount-badge">{formData.discount_percentage}% OFF</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Service Image</label>
                <div className="image-upload-area">
                  {previewImage ? (
                    <div className="image-preview">
                      <img src={previewImage} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          setPreviewImage(null);
                          setImageFile(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p>Click to upload or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="tab-content">
              <div className="service-preview">
                <div className="preview-hero" style={{
                  backgroundImage: previewImage ? `url(${previewImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div className="preview-overlay"></div>
                  <h1 className="preview-title">{formData.title || 'Service Title'}</h1>
                </div>

                <div className="preview-content">
                  <h2>{formData.title || 'Service Title'}</h2>
                  <p className="preview-description">{formData.description || 'Service description will appear here'}</p>

                  {(formData.price_monthly || formData.price_quarterly || formData.price_yearly) && (
                    <div className="preview-pricing">
                      <h3>Pricing</h3>
                      <div className="pricing-options">
                        {formData.price_monthly && (
                          <div className="pricing-option">
                            <span>Monthly</span>
                            <span className="price">₱{parseFloat(formData.price_monthly).toFixed(2)}</span>
                          </div>
                        )}
                        {formData.price_quarterly && (
                          <div className="pricing-option">
                            <span>Quarterly</span>
                            <span className="price">₱{parseFloat(formData.price_quarterly).toFixed(2)}</span>
                          </div>
                        )}
                        {formData.price_yearly && (
                          <div className="pricing-option">
                            <span>Yearly</span>
                            <span className="price">₱{parseFloat(formData.price_yearly).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button className="preview-btn">Buy Now</button>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={!canManageServices}
            >
              {service?.id ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceEditor;
