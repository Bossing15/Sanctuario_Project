import { useState, useEffect, useRef } from "react";
import graveIcon from "../assets/icons/Graves.png";
import { formatDate } from "../utils/dateFormatter";
import usePermissions from "../utils/usePermissions";
import { TableSkeleton, CardSkeleton } from "./SkeletonLoader";

export default function Graves() {
  const { canPerformActions } = usePermissions();
  const canManageGraves = canPerformActions('graves');
  
  const [activeTab, setActiveTab] = useState("Graves");
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [newService, setNewService] = useState({
    title: "",
    category: "Grave Maintenance",
    description: "",
    price_monthly: "",
    price_quarterly: "",
    price_yearly: "",
    discount_percentage: "",
    photo: null,
    status: "Active"
  });

  // Drag-and-drop upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Real data from database
  const [gravesData, setGravesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Edit service state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editService, setEditService] = useState({
    title: "",
    category: "Grave Maintenance",
    description: "",
    price_monthly: "",
    price_quarterly: "",
    price_yearly: "",
    discount_percentage: "",
    photo: null,
    status: "Active"
  });
  const [isEditDragging, setIsEditDragging] = useState(false);

  // Fetch graves on mount
  useEffect(() => {
    fetchGraves();
  }, []);

  // Fetch services when switching to Add Service or Services tab
  useEffect(() => {
    if (activeTab === "Add Service" || activeTab === "Services") {
      fetchServices();
    }
  }, [activeTab]);

  // Add blur effect to background when modals open
  useEffect(() => {
    if (showModal || showEditModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal, showEditModal]);

  const fetchGraves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('/api/graves', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGravesData(data.graves || []);
    } catch (err) {
      console.error('Error fetching graves:', err);
      setError('Failed to load graves. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched services:', data.services);
        setServices(data.services);
      } else {
        console.error('Failed to fetch services', response.status);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newService.title);
    formData.append('category', newService.category);
    formData.append('description', newService.description);
    formData.append('status', newService.status);
    
    if (newService.price_monthly) formData.append('price_monthly', newService.price_monthly);
    if (newService.price_quarterly) formData.append('price_quarterly', newService.price_quarterly);
    if (newService.price_yearly) formData.append('price_yearly', newService.price_yearly);
    if (newService.discount_percentage) formData.append('discount_percentage', newService.discount_percentage);
    if (newService.photo) formData.append('image', newService.photo);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Service added:', result);
        
        setShowAddServiceForm(false);
        setNewService({ 
          title: "", 
          category: "Grave Maintenance", 
          description: "", 
          price_monthly: "", 
          price_quarterly: "", 
          price_yearly: "", 
          discount_percentage: "",
          photo: null,
          status: "Active"
        });
        
        // Fetch services again to update the list
        await fetchServices();
        alert('Service added successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to add service:', error);
        alert('Failed to add service: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Error adding service: ' + error.message);
    }
  };

  const handleToggleServiceStatus = async (serviceId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const token = localStorage.getItem('authToken');
      const service = services.find(s => s.id === serviceId);
      
      if (!service) {
        alert('Service not found');
        return;
      }
      
      const formData = new FormData();
      formData.append('title', service.title);
      formData.append('category', service.category);
      formData.append('description', service.description);
      formData.append('status', newStatus);
      
      // Include prices with proper values
      formData.append('price_monthly', service.price_monthly || '0');
      formData.append('price_quarterly', service.price_quarterly || '0');
      formData.append('price_yearly', service.price_yearly || '0');

      console.log('Updating service:', serviceId, 'to status:', newStatus);

      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        await fetchServices();
        alert(`Service ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const responseText = await response.text();
        console.error('Failed to update service. Response:', responseText);
        alert('Failed to update service status. Check console for details.');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service: ' + error.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        await fetchServices();
        alert('Service deleted successfully!');
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setEditService({
      title: service.title,
      category: service.category,
      description: service.description,
      price_monthly: service.price_monthly || "",
      price_quarterly: service.price_quarterly || "",
      price_yearly: service.price_yearly || "",
      discount_percentage: service.discount_percentage || "",
      photo: null,
      status: service.status
    });
    setShowEditModal(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', editService.title);
    formData.append('category', editService.category);
    formData.append('description', editService.description);
    formData.append('status', editService.status);
    
    if (editService.price_monthly) formData.append('price_monthly', editService.price_monthly);
    if (editService.price_quarterly) formData.append('price_quarterly', editService.price_quarterly);
    if (editService.price_yearly) formData.append('price_yearly', editService.price_yearly);
    if (editService.discount_percentage) formData.append('discount_percentage', editService.discount_percentage);
    if (editService.photo) formData.append('image', editService.photo);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingService(null);
        setEditService({ 
          title: "", 
          category: "Grave Maintenance", 
          description: "", 
          price_monthly: "", 
          price_quarterly: "", 
          price_yearly: "", 
          discount_percentage: "",
          photo: null,
          status: "Active"
        });
        
        await fetchServices();
        alert('Service updated successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to update service:', error);
        alert('Failed to update service: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service: ' + error.message);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingService(null);
    setEditService({ 
      title: "", 
      category: "Grave Maintenance", 
      description: "", 
      price_monthly: "", 
      price_quarterly: "", 
      price_yearly: "", 
      discount_percentage: "",
      photo: null,
      status: "Active"
    });
  };

  const handleViewGrave = async (graveId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/graves/${graveId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedGrave(data.grave);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching grave details:', err);
      alert('Failed to load grave details. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* <Navbar /> */}

      {/* Grave Details Modal - Rendered at top level */}
      {showModal && selectedGrave && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span className="modal-header-icon">⚰️</span>
                <span>Grave Details</span>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grave ID</label>
                  <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">{selectedGrave.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div>{selectedGrave.status === "Active" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                      ✅ Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                      ❌ Inactive
                    </span>
                  )}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deceased Name</label>
                  <p className="text-gray-900">{selectedGrave.deceased_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Burial Date</label>
                  <p className="text-gray-900">{selectedGrave.burial_date}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grave Location</label>
                  <p className="text-gray-900">{selectedGrave.grave_location}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Added</label>
                  <p className="text-gray-900">{selectedGrave.date_added}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                    <p className="text-gray-900">{selectedGrave.customer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{selectedGrave.customer_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <p className="text-gray-900">{selectedGrave.customer_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship to Deceased</label>
                    <p className="text-gray-900">{selectedGrave.relationship_to_deceased}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800">{selectedGrave.notes}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Grave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span className="modal-header-icon">✏️</span>
                <span>Edit Service</span>
              </div>
              <button className="modal-close" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateService} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Service Title:</label>
                    <input 
                      type="text"
                      required
                      value={editService.title}
                      onChange={(e) => setEditService({...editService, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter service name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Category:</label>
                    <input 
                      type="text"
                      value="Grave Maintenance"
                      readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description:</label>
                  <textarea 
                    rows={4}
                    required
                    value={editService.description}
                    onChange={(e) => setEditService({...editService, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter service description"
                  />
                </div>

                {/* Monthly Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Monthly Price (₱):</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editService.price_monthly}
                    onChange={(e) => setEditService({...editService, price_monthly: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Quarterly Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Quarterly Price (₱):</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editService.price_quarterly}
                    onChange={(e) => setEditService({...editService, price_quarterly: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Yearly Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Yearly Price (₱):</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editService.price_yearly}
                    onChange={(e) => setEditService({...editService, price_yearly: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Discount (%):</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editService.discount_percentage}
                    onChange={(e) => setEditService({...editService, discount_percentage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter discount percentage (0-100)</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Status:</label>
                  <select 
                    value={editService.status}
                    onChange={(e) => setEditService({...editService, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Current Image */}
                {editingService.image_path && !editService.photo && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Current Image:</label>
                    <img 
                      src={`/${editingService.image_path}`} 
                      alt={editingService.title}
                      className="h-32 w-auto object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {/* Upload New Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {editingService.image_path ? 'Replace Image:' : 'Upload Service Photo:'}
                  </label>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => editFileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') editFileInputRef.current?.click(); }}
                    onDragOver={(e) => { e.preventDefault(); setIsEditDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsEditDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsEditDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsEditDragging(false);
                      const file = e.dataTransfer.files && e.dataTransfer.files[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        alert('Please upload an image file.');
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Image must be 2MB or smaller.');
                        return;
                      }
                      setEditService({ ...editService, photo: file });
                    }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isEditDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload an image file.');
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Image must be 2MB or smaller.');
                          return;
                        }
                        setEditService({ ...editService, photo: file });
                      }}
                      className="hidden"
                    />
                    <div className="text-gray-600">
                      {!editService.photo ? (
                        <>
                          <p className="text-sm">
                            Drag & drop an image here, or <span className="text-blue-600 font-semibold">click to browse</span>.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WEBP (max 2MB)</p>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <img
                            src={URL.createObjectURL(editService.photo)}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded"
                          />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">{editService.photo.name}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditService({ ...editService, photo: null });
                              }}
                              className="mt-1 text-xs text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!canManageGraves}
                  className={`px-6 py-2.5 rounded-lg transition-colors font-semibold shadow-md ${
                    canManageGraves
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Update Service
                </button>
              </div>
              </form>
            </div>

            <div className="modal-footer">
            </div>
          </div>
        </div>
      )}

      <div className="px-8 pt-8 graves-container">
        <div className="flex items-center mb-8">
          <img src={graveIcon} alt="Grave Icon" className="w-10 h-10 object-contain mr-4" />
          <h3 className="text-3xl font-bold text-gray-800">Graves & Maintenance</h3>
        </div>

        <nav className="mb-8">
          <div className="flex space-x-3" role="tablist">
            {["Graves", "Add Service", "Services"].map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer
                  ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === "Graves" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h5 className="text-xl font-semibold text-gray-800">Graves Management</h5>
                <p className="text-gray-600 mt-1">Total Graves: {gravesData.length}</p>
              </div>
              <button 
                onClick={fetchGraves}
                className="refresh-btn"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <TableSkeleton rows={8} columns={8} />
            ) : error ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
                <p className="text-gray-700 mb-4">{error}</p>
                <button 
                  onClick={fetchGraves}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : gravesData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">⚰️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Graves Found</h3>
                <p className="text-gray-500">No graves have been registered yet.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Grave_ID</th>
                        <th>Deceased_Name</th>
                        <th>Grave_Location</th>
                        <th>Customer</th>
                        <th>Relationship_to_Deceased</th>
                        <th>Status</th>
                        <th>Date_Added</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...gravesData].sort((a, b) => {
                        if (a.status === "Active" && b.status !== "Active") return -1;
                        if (a.status !== "Active" && b.status === "Active") return 1;
                        return 0;
                      }).map((grave) => (
                        <tr key={grave.id}>
                          <td className="font-mono">{grave.id}</td>
                          <td className="font-bold">{grave.deceased_name}</td>
                          <td>{grave.grave_location}</td>
                          <td>{grave.customer}</td>
                          <td>{grave.relationship_to_deceased}</td>
                          <td className="text-center">
                            <span className={`status-badge ${grave.status === "Active" ? 'active' : 'inactive'}`}>
                              {grave.status}
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(grave.date_added)}</td>
                          <td className="text-center">
                            <button 
                              onClick={() => handleViewGrave(grave.id)}
                              className="table-action-btn primary"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <p className="text-sm">
                    <span className="text-green-600 font-semibold">✅ Active</span> – The Customer is Active and is Paying for the Services.
                  </p>
                  <p className="text-sm">
                    <span className="text-red-600 font-semibold">❌ Inactive</span> – The Customer is Inactive Due to Non-Payment of the Services.
                  </p>
                </div>
              </>
            )}
          </div>
        )}



        {activeTab === "Add Service" && !showAddServiceForm && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-xl font-semibold text-gray-800">Maintenance Services</h5>
              <button 
                onClick={fetchServices}
                className="refresh-btn"
              >
                Refresh
              </button>
            </div>

            {servicesLoading ? (
              <CardSkeleton count={3} />
            ) : (
              <div className="space-y-8">
                {/* Maintenance Services Only */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.filter(s => s.category === 'Grave Maintenance').length > 0 ? (
                      services.filter(s => s.category === 'Grave Maintenance').map((service) => (
                        <div key={service.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                          {service.image_path ? (
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={`/${service.image_path}`} 
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="text-4xl mb-2">🏞️</div>
                                <h6 className="text-lg font-bold">{service.title}</h6>
                              </div>
                            </div>
                          )}
                          <div className="p-6">
                            <h6 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h6>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {service.description}
                            </p>
                            <div className="space-y-2 mb-4">
                              {service.price_monthly && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Monthly:</span>
                                  <span className="font-bold text-gray-800">₱{service.price_monthly}</span>
                                </div>
                              )}
                              {service.price_quarterly && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Quarterly:</span>
                                  <span className="font-bold text-gray-800">₱{service.price_quarterly}</span>
                                </div>
                              )}
                              {service.price_yearly && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Yearly:</span>
                                  <span className="font-bold text-gray-800">₱{service.price_yearly}</span>
                                </div>
                              )}
                              {service.discount_percentage && parseFloat(service.discount_percentage) > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Discount:</span>
                                  <span className="font-bold text-green-600">{service.discount_percentage}% OFF</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                service.status === 'Active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {service.status}
                              </span>
                              {service.discount_percentage && parseFloat(service.discount_percentage) > 0 && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                                  🏷️ {service.discount_percentage}% OFF
                                </span>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditService(service)}
                                disabled={!canManageGraves}
                                className={`flex-1 table-action-btn ${canManageGraves ? 'secondary' : 'disabled'}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                disabled={!canManageGraves}
                                className={`flex-1 table-action-btn ${canManageGraves ? 'danger' : 'disabled'}`}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        No services in this category yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add Service Button */}
            <div className="text-center mt-8">
              <button 
                onClick={() => setShowAddServiceForm(true)}
                disabled={!canManageGraves}
                className={`px-8 py-3 rounded-xl font-bold shadow-md transition-all ${
                  canManageGraves
                    ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add New Service
              </button>
              {!canManageGraves && (
                <p className="text-sm text-orange-600 mt-2">
                  You don't have permission to add services
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "Add Service" && showAddServiceForm && (
          <div>
            <h5 className="text-xl font-semibold mb-6 text-gray-800">Add Service</h5>
            
            {/* Add Service Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
              <form onSubmit={handleAddService} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Service Title:</label>
                    <input 
                      type="text"
                      required
                      value={newService.title}
                      onChange={(e) => setNewService({...newService, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter service name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Category:</label>
                    <input 
                      type="text"
                      value="Grave Maintenance"
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Description:</label>
                    <textarea 
                      rows={4}
                      required
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter service description"
                    />
                  </div>

                  {/* Monthly Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Monthly Price (₱):</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={newService.price_monthly}
                      onChange={(e) => setNewService({...newService, price_monthly: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Quarterly Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Quarterly Price (₱):</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={newService.price_quarterly}
                      onChange={(e) => setNewService({...newService, price_quarterly: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Yearly Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Yearly Price (₱):</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={newService.price_yearly}
                      onChange={(e) => setNewService({...newService, price_yearly: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Discount (%):</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={newService.discount_percentage}
                      onChange={(e) => setNewService({...newService, discount_percentage: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter discount percentage (0-100)</p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Status:</label>
                    <select 
                      value={newService.status}
                      onChange={(e) => setNewService({...newService, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Upload Photo (Drag & Drop + Click) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Upload Service Photo:</label>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files && e.dataTransfer.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload an image file.');
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Image must be 2MB or smaller.');
                          return;
                        }
                        setNewService({ ...newService, photo: file });
                      }}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          if (!file.type.startsWith('image/')) {
                            alert('Please upload an image file.');
                            return;
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image must be 2MB or smaller.');
                            return;
                          }
                          setNewService({ ...newService, photo: file });
                        }}
                        className="hidden"
                        id="photo-upload"
                      />
                      <div className="text-gray-600">
                        {!newService.photo ? (
                          <>
                            <p className="text-sm">
                              Drag & drop an image here, or <span className="text-blue-600 font-semibold">click to browse</span>.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WEBP (max 2MB)</p>
                          </>
                        ) : (
                          <div className="flex items-center justify-center gap-4">
                            <img
                              src={URL.createObjectURL(newService.photo)}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded"
                            />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-800">{newService.photo.name}</p>
                              <button
                                type="button"
                                onClick={() => setNewService({ ...newService, photo: null })}
                                className="mt-1 text-xs text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddServiceForm(false);
                      setNewService({ 
                        title: "", 
                        category: "Grave Maintenance", 
                        description: "", 
                        price_monthly: "", 
                        price_quarterly: "", 
                        price_yearly: "", 
                        discount_percentage: "",
                        photo: null,
                        status: "Active"
                      });
                    }}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!canManageGraves}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                      canManageGraves
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save Service
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {activeTab === "Services" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h5 className="text-xl font-semibold text-gray-800">Services Management</h5>
                <p className="text-gray-600 mt-1">Total Services: {services.length}</p>
              </div>
              <button 
                onClick={fetchServices}
                className="refresh-btn"
              >
                Refresh
              </button>
            </div>

            {servicesLoading ? (
              <TableSkeleton />
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Service Name</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Monthly</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Quarterly</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Yearly</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Discount</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {services.length > 0 ? services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">{service.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{service.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">₱{service.price_monthly || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">₱{service.price_quarterly || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">₱{service.price_yearly || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm">
                            {service.discount_percentage && parseFloat(service.discount_percentage) > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                                {service.discount_percentage}% OFF
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {service.status === "Active" ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                  ✓ Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                  ✗ Inactive
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditService(service)}
                                disabled={!canManageGraves}
                                className={`table-action-btn ${canManageGraves ? 'secondary' : 'disabled'}`}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteService(service.id)}
                                disabled={!canManageGraves}
                                className={`table-action-btn ${canManageGraves ? 'danger' : 'disabled'}`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                            No services found. Add a service to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
