import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCamera, FaSignOutAlt, FaUserPlus, FaExchangeAlt, FaEdit } from 'react-icons/fa';
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePictureUrl') ? `http://localhost:8000${localStorage.getItem('profilePictureUrl')}` : null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const userInfo = {
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || 'No email available'
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploadingPicture(true);

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please log in to upload profile picture');
        setIsUploadingPicture(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/profile/upload-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const fullUrl = `http://localhost:8000${data.profile_picture_url}`;
        setProfilePicture(fullUrl);
        localStorage.setItem('profilePictureUrl', data.profile_picture_url);
        alert('Profile picture updated successfully!');
      } else {
        alert(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profilePictureUrl');
    onClose();
    navigate('/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup');
  };

  const handleSwitchAccount = () => {
    alert('Switch Account feature will be implemented soon');
  };

  const handleEditName = () => {
    setEditedName(userInfo.name);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      localStorage.setItem('userName', editedName.trim());
      setIsEditingName(false);
      // Optionally, you could also update the backend here
      // updateNameOnServer(editedName.trim());
    }
  };

  const handleCancelEdit = () => {
    setEditedName('');
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modern Header with Gradient */}
        <div className="profile-modal-header">
          <div className="header-content">
            <div className="header-title">
              <h2>My Profile</h2>
              <p>Manage your account and preferences</p>
            </div>
            <button className="profile-modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="header-decoration"></div>
        </div>

        <div className="profile-modal-content">
          {/* Hero Profile Section */}
          <div className="profile-hero-section">
            <div className="profile-avatar-container">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <FaUser className="profile-avatar-icon" />
                </div>
              )}
              <button 
                className="profile-picture-upload-btn"
                onClick={handleProfilePictureClick}
                disabled={isUploadingPicture}
                title="Change profile picture"
              >
                <FaCamera />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="profile-user-info">
              <div className="user-name-section">
                {isEditingName ? (
                  <div className="name-edit-container">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleNameKeyPress}
                      className="name-edit-input"
                      autoFocus
                      maxLength={50}
                    />
                    <div className="name-edit-buttons">
                      <button className="name-save-btn" onClick={handleSaveName}>
                        ✓
                      </button>
                      <button className="name-cancel-btn" onClick={handleCancelEdit}>
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="profile-user-name">{userInfo.name}</h3>
                    <button className="edit-name-btn" onClick={handleEditName}>
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  </>
                )}
              </div>
              <p className="profile-user-email">{userInfo.email}</p>
              <div className="profile-badges">
                {/* Badges removed as requested */}
              </div>
            </div>
          </div>

          {/* Modern Stats Cards */}
          <div className="profile-stats-section">
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">Active Services</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5</div>
              <div className="stat-label">Completed Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">Years Member</div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="profile-info-cards">
            <div className="info-card">
              <div className="info-card-header">
                <h4>Account Information</h4>
              </div>
              <div className="info-card-content">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{userInfo.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{userInfo.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">January 2021</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Action Buttons */}
          <div className="profile-actions-section">
            <div className="action-buttons-grid">
              <button className="modern-action-btn primary-btn" onClick={handleSignup}>
                <div className="btn-icon-wrapper">
                  <FaUserPlus className="btn-icon" />
                </div>
                <div className="btn-content">
                  <span className="btn-title">Create Account</span>
                  <span className="btn-subtitle">Register new account</span>
                </div>
              </button>
              
              <button className="modern-action-btn secondary-btn" onClick={handleSwitchAccount}>
                <div className="btn-icon-wrapper">
                  <FaExchangeAlt className="btn-icon" />
                </div>
                <div className="btn-content">
                  <span className="btn-title">Switch Account</span>
                  <span className="btn-subtitle">Change account</span>
                </div>
              </button>
            </div>
            
            <button className="modern-action-btn logout-btn full-width" onClick={handleLogout}>
              <div className="btn-icon-wrapper">
                <FaSignOutAlt className="btn-icon" />
              </div>
              <div className="btn-content">
                <span className="btn-title">Sign Out</span>
                <span className="btn-subtitle">Logout from your account</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;