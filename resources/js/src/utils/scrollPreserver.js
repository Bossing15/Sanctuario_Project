/**
 * Utility to preserve scroll position when opening/closing modals
 * Prevents page from jumping to top when modal opens
 */

export const preserveScrollPosition = () => {
  const scrollPosition = window.scrollY;
  document.documentElement.style.setProperty('--scroll-position', `-${scrollPosition}px`);
  return scrollPosition;
};

export const restoreScrollPosition = () => {
  document.documentElement.style.removeProperty('--scroll-position');
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    const scrollPosition = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--scroll-position') || '0'
    );
    if (scrollPosition !== 0) {
      window.scrollTo(0, Math.abs(scrollPosition));
    }
  }, 0);
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
