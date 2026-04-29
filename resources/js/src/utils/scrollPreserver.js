/**
 * Utility to preserve scroll position when opening/closing modals
 * Prevents page from jumping to top when modal opens/closes
 */

let savedScrollPosition = 0;

export const preserveScrollPosition = () => {
  savedScrollPosition = window.scrollY;
  document.documentElement.style.setProperty('--scroll-position', `-${savedScrollPosition}px`);
  return savedScrollPosition;
};

export const restoreScrollPosition = () => {
  document.documentElement.style.removeProperty('--scroll-position');
  document.body.style.position = '';
  document.body.style.top = '';
  
  // Restore scroll position after DOM updates
  if (savedScrollPosition > 0) {
    window.scrollTo(0, savedScrollPosition);
  }
};

/**
 * Hook to manage modal scroll locking
 * Usage: useModalScrollLock(isModalOpen)
 */
export const useModalScrollLock = (isOpen) => {
  if (isOpen) {
    preserveScrollPosition();
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
    restoreScrollPosition();
  }
};
