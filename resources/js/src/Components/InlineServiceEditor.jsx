import React, { useState, useEffect } from 'react';
import './InlineServiceEditor.css';

const InlineServiceEditor = ({ service, isOpen, onClose, onSave, canManageServices }) => {
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

  const [editingField, setEditingField] = useState(null);
  const [previewImage, setPreviewImage] = useState(service?.image_path || null);
  const [imageFile, setImageFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);

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
      setPreviewImage(service.image_path ? `/storage/${service.image_path}` : null);
      setImageFile(null);
      
      // Load gallery images from service
      if (service.gallery_images && Array.isArray(service.gallery_images)) {
        const galleryImgs = service.gallery_images.map(img => ({
          preview: `/storage/${img}`,
          path: img,
          isExisting: true
        }));
        setGalleryImages(galleryImgs);
      } else {
        setGalleryImages([]);
      }
      
      setSelectedGalleryImage(0);
      setEditingField(null);
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
    if (selectedGalleryImage >= galleryImages.length - 1) {
      setSelectedGalleryImage(Math.max(0, galleryImages.length - 2));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imageFile);
  };

  if (!isOpen) return null;

  const displayGalleryImage = galleryImages.length > 0 ? galleryImages[selectedGalleryImage]?.preview : previewImage;

  return (
    <div className="inline-editor-overlay" onClick={onClose}>
      <div className="inline-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inline-editor-header">
          <h2>Edit {formData.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="inline-editor-form">
          {/* Hero Section */}
          <div className="editor-hero-section">
            <div 
              className="hero-image-container editable"
              onClick={() => editingField === 'hero' ? setEditingField(null) : setEditingField('hero')}
            >
              {editingField === 'hero' ? (
                <div className="edit-mode">
                  <label className="file-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageChange}
                      className="file-input"
                    />
                    <span className="upload-text">Click to change hero image</span>
                  </label>
                </div>
              ) : (
                <>
                  <img src={previewImage} alt="Hero" className="hero-image" />
                  <div className="edit-overlay">
                    <span className="edit-hint">Click to edit</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="editor-title-section">
            {editingField === 'title' ? (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="title-input"
              />
            ) : (
              <h1 
                className="title-display editable"
                onClick={() => setEditingField('title')}
              >
                {formData.title}
                <span className="edit-hint">Click to edit</span>
              </h1>
            )}
          </div>

          {/* Description Section */}
          <div className="editor-description-section">
            {editingField === 'description' ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="description-input"
                rows={4}
              />
            ) : (
              <p 
                className="description-display editable"
                onClick={() => setEditingField('description')}
              >
                {formData.description}
                <span className="edit-hint">Click to edit</span>
              </p>
            )}
          </div>

          {/* Gallery Section */}
          <div className="editor-gallery-section">
            <div className="gallery-main">
              <img src={displayGalleryImage} alt="Gallery" className="main-image" />
            </div>
            <div className="gallery-thumbnails">
              {galleryImages.length > 0 ? (
                <>
                  {galleryImages.map((img, index) => (
                    <div key={index} className="thumbnail-wrapper">
                      <img
                        src={img.preview}
                        alt={`Gallery ${index}`}
                        className={`thumbnail ${selectedGalleryImage === index ? 'active' : ''}`}
                        onClick={() => setSelectedGalleryImage(index)}
                      />
                      <button
                        type="button"
                        className="remove-thumbnail"
                        onClick={() => removeGalleryImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="add-thumbnail">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImageChange}
                      className="file-input"
                    />
                    <span>+ Add</span>
                  </label>
                </>
              ) : (
                <label className="add-gallery-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageChange}
                    className="file-input"
                  />
                  <span>Click to add gallery images</span>
                </label>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="editor-pricing-section">
            <h2 className="pricing-title">PURCHASE {formData.title.toUpperCase()} PACKAGE</h2>
            <p className="pricing-subtitle">Select your package and proceed to payment.</p>

            <div className="package-info-container">
              <div className="package-info">
                <h3>{formData.title} Package</h3>
                <p>Complete {formData.title.toLowerCase()} services for your loved one</p>
                <p className="package-price">Price will be calculated at checkout</p>
              </div>
            </div>

            {/* Pricing Fields */}
            <div className="pricing-fields">
              <div className="pricing-field">
                <label>Monthly Price (₱)</label>
                {editingField === 'price_monthly' ? (
                  <input
                    type="number"
                    name="price_monthly"
                    value={formData.price_monthly}
                    onChange={handleInputChange}
                    onBlur={() => setEditingField(null)}
                    autoFocus
                    step="0.01"
                    min="0"
                    className="price-input"
                  />
                ) : (
                  <div 
                    className="price-display editable"
                    onClick={() => setEditingField('price_monthly')}
                  >
                    {formData.price_monthly ? `₱${formData.price_monthly}` : 'Not set'}
                    <span className="edit-hint">Click to edit</span>
                  </div>
                )}
              </div>

              <div className="pricing-field">
                <label>Quarterly Price (₱)</label>
                {editingField === 'price_quarterly' ? (
                  <input
                    type="number"
                    name="price_quarterly"
                    value={formData.price_quarterly}
                    onChange={handleInputChange}
                    onBlur={() => setEditingField(null)}
                    autoFocus
                    step="0.01"
                    min="0"
                    className="price-input"
                  />
                ) : (
                  <div 
                    className="price-display editable"
                    onClick={() => setEditingField('price_quarterly')}
                  >
                    {formData.price_quarterly ? `₱${formData.price_quarterly}` : 'Not set'}
                    <span className="edit-hint">Click to edit</span>
                  </div>
                )}
              </div>

              <div className="pricing-field">
                <label>Yearly Price (₱)</label>
                {editingField === 'price_yearly' ? (
                  <input
                    type="number"
                    name="price_yearly"
                    value={formData.price_yearly}
                    onChange={handleInputChange}
                    onBlur={() => setEditingField(null)}
                    autoFocus
                    step="0.01"
                    min="0"
                    className="price-input"
                  />
                ) : (
                  <div 
                    className="price-display editable"
                    onClick={() => setEditingField('price_yearly')}
                  >
                    {formData.price_yearly ? `₱${formData.price_yearly}` : 'Not set'}
                    <span className="edit-hint">Click to edit</span>
                  </div>
                )}
              </div>

              <div className="pricing-field">
                <label>Discount (%)</label>
                {editingField === 'discount_percentage' ? (
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    onBlur={() => setEditingField(null)}
                    autoFocus
                    step="0.01"
                    min="0"
                    max="100"
                    className="price-input"
                  />
                ) : (
                  <div 
                    className="price-display editable"
                    onClick={() => setEditingField('discount_percentage')}
                  >
                    {formData.discount_percentage ? `${formData.discount_percentage}%` : 'No discount'}
                    <span className="edit-hint">Click to edit</span>
                  </div>
                )}
              </div>
            </div>

            <button type="button" className="save-btn-preview">Save Changes</button>
          </div>

          {/* Status Section */}
          <div className="editor-status-section">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="status-select"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={!canManageServices}
            >
              Save All Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InlineServiceEditor;
