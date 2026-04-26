import React, { useState, useEffect } from 'react';
import './SpecializedServiceEditor.css';

const SpecializedServiceEditor = ({ service, isOpen, onClose, onSave, canManageServices }) => {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    category: service?.category || 'Services',
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
  const [galleryImages, setGalleryImages] = useState([]);

  // Update form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        category: service.category || 'Services',
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
      setGalleryImages([]);
    }
  }, [service, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHeroImageChange = (e) => {
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

  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div className="specialized-editor-overlay" onClick={onClose}>
      <div className="specialized-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="specialized-editor-header">
          <h2>{service?.id ? `Edit ${formData.title}` : 'Add New Service'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="specialized-editor-form">
          {/* Current Published Info */}
          {service?.id && (
            <div className="editor-section current-info">
              <h3 className="section-title">Currently Published</h3>
              <div className="current-info-grid">
                {previewImage && (
                  <div className="current-info-item">
                    <label>Current Hero Image</label>
                    <img src={previewImage} alt="Current" className="current-image" />
                  </div>
                )}
                <div className="current-info-item">
                  <label>Current Title</label>
                  <p className="current-value">{formData.title}</p>
                </div>
                <div className="current-info-item">
                  <label>Current Description</label>
                  <p className="current-value">{formData.description}</p>
                </div>
                {formData.price_monthly && (
                  <div className="current-info-item">
                    <label>Current Monthly Price</label>
                    <p className="current-value">₱{formData.price_monthly}</p>
                  </div>
                )}
                {formData.price_quarterly && (
                  <div className="current-info-item">
                    <label>Current Quarterly Price</label>
                    <p className="current-value">₱{formData.price_quarterly}</p>
                  </div>
                )}
                {formData.price_yearly && (
                  <div className="current-info-item">
                    <label>Current Yearly Price</label>
                    <p className="current-value">₱{formData.price_yearly}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Hero Section */}
          <div className="editor-section">
            <h3 className="section-title">Hero Section</h3>
            <div className="form-group">
              <label>Hero Image</label>
              <div className="hero-image-upload">
                {previewImage ? (
                  <div className="hero-preview">
                    <img src={previewImage} alt="Hero Preview" />
                    <button
                      type="button"
                      className="remove-btn"
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
                    <p>Click to upload hero image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="file-input"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="editor-section">
            <h3 className="section-title">Description</h3>
            <div className="form-group">
              <label>Title *</label>
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
          </div>

          {/* Gallery Section */}
          <div className="editor-section">
            <h3 className="section-title">Gallery</h3>
            <div className="form-group">
              <label>Gallery Images</label>
              <div className="gallery-upload">
                <div className="upload-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Click to upload gallery images</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImageChange}
                  className="file-input"
                />
              </div>

              {galleryImages.length > 0 && (
                <div className="gallery-preview">
                  <h4>Gallery Preview</h4>
                  <div className="gallery-grid">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="gallery-item">
                        <img src={img.preview} alt={`Gallery ${index}`} />
                        <button
                          type="button"
                          className="remove-gallery-btn"
                          onClick={() => removeGalleryImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Package Section */}
          <div className="editor-section">
            <h3 className="section-title">Package Information</h3>
            
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Services">Services</option>
              </select>
            </div>

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

          {/* Preview Section */}
          <div className="editor-section">
            <h3 className="section-title">Preview</h3>
            <div className="preview-container">
              <div className="preview-hero" style={{
                backgroundImage: previewImage ? `url(${previewImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div className="preview-overlay"></div>
                <h1 className="preview-title">{formData.title || 'Service Title'}</h1>
              </div>

              <div className="preview-description">
                <h2>{formData.title || 'Service Title'}</h2>
                <p>{formData.description || 'Service description will appear here'}</p>
              </div>

              {galleryImages.length > 0 && (
                <div className="preview-gallery">
                  <div className="gallery-main">
                    <img src={galleryImages[0].preview} alt="Main" />
                  </div>
                  <div className="gallery-thumbnails">
                    {galleryImages.map((img, index) => (
                      <img
                        key={index}
                        src={img.preview}
                        alt={`Thumbnail ${index}`}
                        className="thumbnail"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="preview-package">
                <h2>Purchase {formData.title || 'Service'} Package</h2>
                <p className="package-subtitle">Select your package and proceed to payment.</p>
                <div className="package-info">
                  <h3>{formData.title || 'Service'} Package</h3>
                  <p>Complete {formData.title?.toLowerCase() || 'service'} services for your loved one</p>
                  <p className="package-price">Price will be calculated at checkout</p>
                </div>
                <button className="preview-btn">Save</button>
              </div>
            </div>
          </div>

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

export default SpecializedServiceEditor;
