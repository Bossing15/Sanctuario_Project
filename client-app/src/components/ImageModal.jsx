import { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ImageModal.css';

function ImageModal({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <div 
      className="image-modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {images.length > 1 && (
          <>
            <button className="image-modal-nav prev" onClick={handlePrevious}>
              <FaChevronLeft />
            </button>
            <button className="image-modal-nav next" onClick={handleNext}>
              <FaChevronRight />
            </button>
          </>
        )}

        <div className="image-modal-image-container">
          <img 
            src={images[currentIndex]} 
            alt={`Maintenance ${currentIndex + 1}`}
            className="image-modal-image"
          />
        </div>

        {images.length > 1 && (
          <div className="image-modal-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {images.length > 1 && (
          <div className="image-modal-thumbnails">
            {images.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageModal;
