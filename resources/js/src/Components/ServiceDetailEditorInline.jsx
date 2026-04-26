import React, { useState, useEffect } from 'react';
import './ServiceDetailEditor.css';

const ServiceDetailEditorInline = ({ service, onSave, canManageServices }) => {
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
    if (service) {
      console.log('Service data received:', service);
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
        pricing_title: service.pricing_title || `PURCHASE ${(service.title || '').toUpperCase()} PACKAGE`,
        pricing_subtitle: service.pricing_subtitle || 'Select your package and proceed to payment.',
        package_title: service.package_title || `${service.title || ''} Package`,
        package_description: service.package_description || `Complete ${(service.title || '').toLowerCase()} services for your loved one`,
        package_note: service.package_note || 'Price will be calculated at checkout',
      });
      
      // Set preview image - construct the full URL
      if (service.image_path) {
        console.log('Image path found:', service.image_path);
        // Construct the full storage URL
        const imagePath = `/storage/${service.image_path}`;
        console.log('Full image URL:', imagePath);
        setPreviewImage(imagePath);
      } else {
        console.log('No image path in service data');
        setPreviewImage(null);
      }
      
      if (service.gallery_images && Array.isArray(service.gallery_images) && service.gallery_images.length > 0) {
        console.log('Gallery images found:', service.gallery_images);
        const galleryImgs = service.gallery_images.map(img => {
          const imagePath = `/storage/${img}`;
          return {
            preview: imagePath,
            path: img,
            isExisting: true
          };
        });
        setGalleryImages(galleryImgs);
      } else {
        console.log('No gallery images in service data');
        setGalleryImages([]);
      }
    }
  }, [service]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
      await onSave(formData, imageFile);
      showNotification("Service updated successfully!", "success");
    } catch (error) {
      showNotification("Error saving service", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const displayGalleryImage = galleryImages.length > 0 ? galleryImages[selectedGalleryImage]?.preview : previewImage;

  return (
    <div className="service-detail-form">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSave}>
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



        {/* Image Section - Main editable image with gallery */}
        <div className="gallery-section">
          <label className="gallery-main editable">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              style={{ display: 'none' }}
            />
            {displayGalleryImage ? (
              <>
                <img 
                  src={displayGalleryImage} 
                  alt="Service" 
                  className="main-image"
                  onError={(e) => {
                    console.error('Image failed to load:', displayGalleryImage);
                    e.target.style.display = 'none';
                  }}
                />
                <div className="edit-overlay">
                  <span className="edit-hint">📤 Click to upload new image</span>
                </div>
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '16px',
                flexDirection: 'column',
                gap: '10px',
                borderRadius: '8px'
              }}>
                <span>📷 No image uploaded</span>
                <span style={{ fontSize: '12px', color: '#bbb' }}>Click to upload one</span>
              </div>
            )}
          </label>
          
          {/* Gallery Thumbnails */}
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
                      onError={(e) => {
                        console.error('Thumbnail failed to load:', img.preview);
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                      }}
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
            type="submit"
            className="btn-save"
            disabled={isSaving || !canManageServices}
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceDetailEditorInline;
