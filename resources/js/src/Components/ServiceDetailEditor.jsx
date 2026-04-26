import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ServiceDetailEditor.css';

const ServiceDetailEditor = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Services',
    description: '',
    price_monthly: '',
    price_quarterly: '',
    price_yearly: '',
    discount_percentage: '',
    status: 'Active',
    image_path: '',
    pricing_title: '',
    pricing_subtitle: '',
    package_title: '',
    package_description: '',
    package_note: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchService = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/services/${serviceId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const serviceData = data.service || data;
        setService(serviceData);
        setFormData({
          title: serviceData.title || '',
          category: serviceData.category || 'Services',
          description: serviceData.description || '',
          price_monthly: serviceData.price_monthly || '',
          price_quarterly: serviceData.price_quarterly || '',
          price_yearly: serviceData.price_yearly || '',
          discount_percentage: serviceData.discount_percentage || '',
          status: serviceData.status || 'Active',
          image_path: serviceData.image_path || '',
          pricing_title: serviceData.pricing_title || `PURCHASE ${(serviceData.title || '').toUpperCase()} PACKAGE`,
          pricing_subtitle: serviceData.pricing_subtitle || 'Select your package and proceed to payment.',
          package_title: serviceData.package_title || `${serviceData.title || ''} Package`,
          package_description: serviceData.package_description || `Complete ${(serviceData.title || '').toLowerCase()} services for your loved one`,
          package_note: serviceData.package_note || 'Price will be calculated at checkout',
        });
        setPreviewImage(serviceData.image_path ? `/storage/${serviceData.image_path}` : null);
        
        // Load gallery images
        if (serviceData.gallery_images && Array.isArray(serviceData.gallery_images)) {
          const galleryImgs = serviceData.gallery_images.map(img => ({
            preview: `/storage/${img}`,
            path: img,
            isExisting: true
          }));
          setGalleryImages(galleryImgs);
        }
      } else {
        showNotification("Failed to load service", "error");
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      showNotification("Error loading service", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const submitData = new FormData();
      
      submitData.append("title", formData.title);
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("status", formData.status);
      submitData.append("price_monthly", formData.price_monthly || null);
      submitData.append("price_quarterly", formData.price_quarterly || null);
      submitData.append("price_yearly", formData.price_yearly || null);
      submitData.append("discount_percentage", formData.discount_percentage || null);
      submitData.append("pricing_title", formData.pricing_title || null);
      submitData.append("pricing_subtitle", formData.pricing_subtitle || null);
      submitData.append("package_title", formData.package_title || null);
      submitData.append("package_description", formData.package_description || null);
      submitData.append("package_note", formData.package_note || null);
      
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const response = await fetch(`/api/services/${serviceId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        showNotification("Service updated successfully!", "success");
        setTimeout(() => {
          navigate('/services');
        }, 1500);
      } else {
        showNotification("Failed to save service", "error");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      showNotification("Error saving service", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="service-detail-editor-container">
        <div className="loading-spinner">Loading service...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-editor-container">
        <div className="error-message">Service not found</div>
      </div>
    );
  }

  const displayGalleryImage = galleryImages.length > 0 ? galleryImages[selectedGalleryImage]?.preview : previewImage;

  return (
    <div className="service-detail-editor-full">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="editor-header-bar">
        <button className="back-btn" onClick={() => navigate('/services')}>
          ← Back to Services
        </button>
        <h1>Edit {formData.title}</h1>
      </div>

      <form onSubmit={handleSave} className="service-detail-form">
        {/* Title Section */}
        <div className="title-section">
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
        <div className="description-section">
          {editingField === 'description' ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="description-input"
              rows={3}
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

        {/* Hero Image Section */}
        <div className="hero-image-section">
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
                    onChange={handleImageChange}
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

        {/* Gallery Section */}
        <div className="gallery-section">
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
        <div className="pricing-section-full">
          {editingField === 'pricing_title' ? (
            <input
              type="text"
              name="pricing_title"
              value={formData.pricing_title}
              onChange={handleInputChange}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="pricing-title-input"
            />
          ) : (
            <h2 
              className="pricing-title editable"
              onClick={() => setEditingField('pricing_title')}
            >
              {formData.pricing_title}
              <span className="edit-hint">Click to edit</span>
            </h2>
          )}

          {editingField === 'pricing_subtitle' ? (
            <textarea
              name="pricing_subtitle"
              value={formData.pricing_subtitle}
              onChange={handleInputChange}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="pricing-subtitle-input"
              rows={2}
            />
          ) : (
            <p 
              className="pricing-subtitle editable"
              onClick={() => setEditingField('pricing_subtitle')}
            >
              {formData.pricing_subtitle}
              <span className="edit-hint">Click to edit</span>
            </p>
          )}

          {formData.discount_percentage > 0 && (
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fff3e0',
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              border: '2px solid #ff6b35'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ff6b35'
              }}>
                🎉 Special Offer: {formData.discount_percentage}% OFF All Plans!
              </span>
            </div>
          )}

          <div className="package-info-container">
            <div className="package-info">
              {editingField === 'package_title' ? (
                <input
                  type="text"
                  name="package_title"
                  value={formData.package_title}
                  onChange={handleInputChange}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  className="package-title-input"
                />
              ) : (
                <h3 
                  className="package-title-display editable"
                  onClick={() => setEditingField('package_title')}
                >
                  {formData.package_title}
                  <span className="edit-hint">Click to edit</span>
                </h3>
              )}

              {editingField === 'package_description' ? (
                <textarea
                  name="package_description"
                  value={formData.package_description}
                  onChange={handleInputChange}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  className="package-description-input"
                  rows={2}
                />
              ) : (
                <p 
                  className="package-description-display editable"
                  onClick={() => setEditingField('package_description')}
                >
                  {formData.package_description}
                  <span className="edit-hint">Click to edit</span>
                </p>
              )}

              {editingField === 'package_note' ? (
                <input
                  type="text"
                  name="package_note"
                  value={formData.package_note}
                  onChange={handleInputChange}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  className="package-note-input"
                />
              ) : (
                <p 
                  className="package-note-display editable"
                  onClick={() => setEditingField('package_note')}
                >
                  {formData.package_note}
                  <span className="edit-hint">Click to edit</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prices Section */}
        <div className="prices-section">
          <h2 className="prices-header">Prices</h2>
          
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
        </div>

        {/* Status Section */}
        <div className="status-section">
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
        <div className="form-actions-full">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/services')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceDetailEditor;
