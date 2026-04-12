import { useState } from 'react';

export const useDeleteConfirmation = () => {
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const openDeleteConfirm = (itemId, itemName = 'this item') => {
    setDeleteData({ itemId, itemName });
    setShowDeleteConfirmModal(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirmModal(false);
    setDeleteData(null);
  };

  return {
    showDeleteConfirmModal,
    deleteData,
    openDeleteConfirm,
    closeDeleteConfirm,
    setShowDeleteConfirmModal,
    setDeleteData,
  };
};
