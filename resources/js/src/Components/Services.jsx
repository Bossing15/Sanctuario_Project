import { useState, useEffect } from "react";
import maintenanceIcon from "../assets/icons/Maintenance.png";
import { TableSkeleton } from "./SkeletonLoader";
import usePermissions from "../utils/usePermissions";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ServiceEditor from "./ServiceEditor";
import InlineServiceEditor from "./InlineServiceEditor";
import ServiceDetailEditorInline from "./ServiceDetailEditorInline";
import MaintenanceHeader from "./MaintenanceHeader";
import StatsCards from "./StatsCards";
import CrudActions from "./CrudActions";
import crudUtils from "../utils/crudUtils";
import "./MaintenanceHeader.css";

const Services = () => {
  const { canPerformActions } = usePermissions();
  const canManageServices = canPerformActions("graves");
  const [viewMode, setViewMode] = useState("Table");
  const [activeServiceTab, setActiveServiceTab] = useState("Maintenance");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [showServiceEditor, setShowServiceEditor] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/services", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      showNotification("Error fetching services", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    // If in card view and on Interment or Cremation tab, set the category
    if (viewMode === "Cards" && (activeServiceTab === "Interment" || activeServiceTab === "Cremation")) {
      setEditingService({ category: "Services", title: activeServiceTab });
    }
    setShowServiceEditor(true);
  };

  const handleEditService = (service) => {
    setViewMode("Cards");
    setActiveServiceTab(service.title.toLowerCase().includes("interment") ? "Interment" : service.title.toLowerCase().includes("cremation") ? "Cremation" : "Maintenance");
  };

  const handleSaveService = async (formData, imageFile) => {
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
      
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const url = editingService?.id 
        ? `/api/services/${editingService.id}` 
        : "/api/services";
      
      const method = editingService?.id ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        setShowServiceEditor(false);
        setEditingService(null);
        await fetchServices();
        showNotification(
          editingService?.id 
            ? "Service updated successfully!" 
            : "Service created successfully!",
          "success"
        );
      } else {
        showNotification("Failed to save service", "error");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      showNotification("Error saving service", "error");
    }
  };

  const handleDeleteService = (serviceId) => {
    setServiceToDelete(serviceId);
    setShowDeleteConfirmModal(true);
  };

  const handleSaveMaintenanceHeader = async (formData) => {
    // This is just for the UI - you can extend this to save to a database if needed
    showNotification("Maintenance header updated!", "success");
  };

  const handleViewService = (service) => {
    setEditingService(service);
    setShowServiceEditor(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/services/${serviceToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      if (response.ok) {
        await fetchServices();
        showNotification("Service deleted successfully!", "success");
        setShowDeleteConfirmModal(false);
        setServiceToDelete(null);
      } else {
        showNotification("Failed to delete service", "error");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      showNotification("Error deleting service", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setServiceToDelete(null);
  };

  const getCardViewServices = () => {
    const query = serviceSearchQuery.toLowerCase();
    
    if (activeServiceTab === "Maintenance") {
      return services.filter((service) => {
        const matchesSearch = 
          service.id.toString().includes(query) ||
          service.title.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.status.toLowerCase().includes(query);
        return matchesSearch && service.category === "Grave Maintenance";
      });
    } else if (activeServiceTab === "Interment") {
      return services.filter((service) => {
        const matchesSearch = 
          service.id.toString().includes(query) ||
          service.title.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.status.toLowerCase().includes(query);
        return matchesSearch && service.title.toLowerCase().includes("interment");
      });
    } else if (activeServiceTab === "Cremation") {
      return services.filter((service) => {
        const matchesSearch = 
          service.id.toString().includes(query) ||
          service.title.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.status.toLowerCase().includes(query);
        return matchesSearch && service.title.toLowerCase().includes("cremation");
      });
    }
    return services;
  };

  return (
    <div className="min-h-screen p-8">
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" ? "" : ""} {notification.message}
          </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          title="Delete Service"
          message="Are you sure you want to delete this service? This action cannot be undone."
          onConfirm={confirmDeleteService}
          onCancel={closeDeleteConfirmModal}
          isLoading={isDeleting}
        />
      )}

      {showServiceEditor && (
        <>
          {(activeServiceTab === "Interment" || activeServiceTab === "Cremation" || (editingService && (editingService.title?.toLowerCase().includes('interment') || editingService.title?.toLowerCase().includes('cremation')))) ? (
            <InlineServiceEditor
              service={editingService}
              isOpen={showServiceEditor}
              onClose={() => {
                setShowServiceEditor(false);
                setEditingService(null);
              }}
              onSave={handleSaveService}
              canManageServices={canManageServices}
            />
          ) : (
            <ServiceEditor
              service={editingService}
              isOpen={showServiceEditor}
              onClose={() => {
                setShowServiceEditor(false);
                setEditingService(null);
              }}
              onSave={handleSaveService}
              canManageServices={canManageServices}
            />
          )}
        </>
      )}

      <div className="flex items-center mb-8">
        <img src={maintenanceIcon} alt="Services Icon" className="w-10 h-10 object-contain mr-4" />
        <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
      </div>

      {/* View Mode Tabs */}
      <nav className="mb-8">
        <div className="flex space-x-3" role="tablist">
          {["Table", "Cards"].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={viewMode === tab}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer
                ${
                  viewMode === tab
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                }`}
              onClick={() => setViewMode(tab)}
            >
              {tab} View
            </button>
          ))}
        </div>
      </nav>

      {loading ? (
        <TableSkeleton rows={8} columns={8} />
      ) : (
        <>
          {/* Table View */}
          {viewMode === "Table" && (
            <>
              <StatsCards stats={[
                { label: 'Total Services', value: services.length },
                { label: 'Active', value: services.filter(s => s.status === 'Active').length },
                { label: 'Inactive', value: services.filter(s => s.status !== 'Active').length },
                { label: 'Interment', value: services.filter(s => s.title.toLowerCase().includes('interment')).length }
              ]} />

              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-semibold text-gray-800">Services List</h5>
                <div className="flex gap-2">
                  <button 
                    onClick={fetchServices}
                    className="refresh-btn"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="text"
                    placeholder="Search services by name, category, or status..."
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}
                  />
                  <svg style={{ width: '20px', height: '20px', color: '#6b7280', marginLeft: '0.5rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Service_ID</th>
                      <th>Service_Name</th>
                      <th>Category</th>
                      <th>Monthly_Price</th>
                      <th>Quarterly_Price</th>
                      <th>Yearly_Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.filter((service) => {
                      const query = serviceSearchQuery.toLowerCase();
                      return (
                        service.id.toString().includes(query) ||
                        service.title.toLowerCase().includes(query) ||
                        service.category.toLowerCase().includes(query) ||
                        service.status.toLowerCase().includes(query)
                      );
                    }).length > 0 ? (
                      services.filter((service) => {
                        const query = serviceSearchQuery.toLowerCase();
                        return (
                          service.id.toString().includes(query) ||
                          service.title.toLowerCase().includes(query) ||
                          service.category.toLowerCase().includes(query) ||
                          service.status.toLowerCase().includes(query)
                        );
                      }).map((service) => (
                        <tr key={service.id}>
                          <td className="font-mono">{service.id}</td>
                          <td className="font-bold">{service.title}</td>
                          <td>{service.category}</td>
                          <td>{service.price_monthly || "N/A"}</td>
                          <td>{service.price_quarterly || "N/A"}</td>
                          <td>{service.price_yearly || "N/A"}</td>
                          <td className="text-center">
                            {service.status === "Active" ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <CrudActions
                              onView={() => handleViewService(service)}
                              onEdit={() => handleEditService(service)}
                              onDelete={() => handleDeleteService(service.id)}
                              onToggleStatus={() => {}}
                              showView={true}
                              showEdit={true}
                              showDelete={true}
                              showToggle={false}
                              disabled={!canManageServices}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row">
                        <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#6b7280", fontStyle: "italic" }}>
                          No services available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Service Button - Bottom Right */}
              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleAddService}
                  disabled={!canManageServices}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all text-lg ${canManageServices ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  + Add Service
                </button>
              </div>
            </>
          )}

          {/* Cards View */}
          {viewMode === "Cards" && (
            <>
              {/* Category Tabs - Inside Cards View */}
              <nav className="mb-8">
                <div className="flex space-x-3" role="tablist">
                  {["Maintenance", "Interment", "Cremation"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeServiceTab === tab}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer
                        ${
                          activeServiceTab === tab
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                        }`}
                      onClick={() => setActiveServiceTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </nav>

              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-semibold text-gray-800">Services</h5>
              </div>

              {/* Interment/Cremation Detail View - Show editor inline */}
              {(activeServiceTab === "Interment" || activeServiceTab === "Cremation") && getCardViewServices().length > 0 ? (
                <div>
                  {getCardViewServices().map((service) => (
                    <ServiceDetailEditorInline
                      key={service.id}
                      service={service}
                      onSave={handleSaveService}
                      canManageServices={canManageServices}
                    />
                  ))}
                </div>
              ) : (
                /* Maintenance View - Original Grid */
                <>
                  <MaintenanceHeader 
                    onSave={handleSaveMaintenanceHeader}
                    canManageServices={canManageServices}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCardViewServices().length > 0 ? (
                    getCardViewServices().map((service) => (
                      <div key={service.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <div className="text-white text-center">
                            <h6 className="text-lg font-bold">{service.title}</h6>
                          </div>
                        </div>
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
                                {service.discount_percentage}% OFF
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditService(service)}
                              disabled={!canManageServices}
                              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                canManageServices
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              disabled={!canManageServices}
                              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                canManageServices
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      No services available
                    </div>
                  )}
                </div>

                {/* Add Service Button - Bottom Right */}
                <div className="flex justify-end mt-8">
                  <button 
                    onClick={handleAddService}
                    disabled={!canManageServices}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all text-lg ${canManageServices ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    + Add Service
                  </button>
                </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Services;
