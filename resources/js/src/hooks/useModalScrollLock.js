import { useEffect } from 'react';

/**
 * Hook to lock/unlock body scroll when modal is open
 * @param {boolean} isOpen - Whether the modal is open
 */
export const useModalScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Add scroll lock class to body
      document.body.classList.add('modal-open');
      // Also set overflow hidden as backup
      document.body.style.overflow = 'hidden';
    } else {
      // Remove scroll lock class from body
      document.body.classList.remove('modal-open');
      // Remove inline overflow style
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);
};

export default useModalScrollLock;
