import { useEffect } from 'react';
import { preserveScrollPosition, restoreScrollPosition } from '../utils/scrollPreserver';

/**
 * Hook to lock/unlock body scroll when modal is open
 * @param {boolean} isOpen - Whether the modal is open
 */
export const useModalScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Preserve scroll position and add scroll lock class to body
      preserveScrollPosition();
      document.body.classList.add('modal-open');
      // Also set overflow hidden as backup
      document.body.style.overflow = 'hidden';
    } else {
      // Remove scroll lock class from body
      document.body.classList.remove('modal-open');
      // Remove inline overflow style
      document.body.style.overflow = '';
      // Restore scroll position
      restoreScrollPosition();
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);
};

export default useModalScrollLock;
