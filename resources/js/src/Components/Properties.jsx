import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import maintenanceIcon from "../assets/icons/icons8-services-50.png";
import { TableSkeleton } from "./SkeletonLoader";
import usePermissions from "../utils/usePermissions";
import ArchiveConfirmationModal from "./ArchiveConfirmationModal";
import PropertyEditor from "./PropertyEditor";
import ProductEditor from "./ProductEditor";
import ServiceDetailEditorInline from "./ServiceDetailEditorInline";
import StatsCards from "./StatsCards";
import CrudActions from "./CrudActions";
import { getSequentialIdFromIndex } from "../utils/tableIdGenerator";
import crudUtils from "../utils/crudUtils";
import "./MaintenanceHeader.css";

const Properties = () => {
  const navigate = useNavigate();
  const { canPerformActions } = usePermissions();
  const canManageProperties = canPerformActions("graves");
  
  const [viewMode, setViewMode] = useState("Table");
  const [activePropertyTab, setActivePropertyTab] = useState("Lawn Lots");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertySearchQuery, setPropertySearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
  const [propertyToArchive, setPropertyToArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/properties", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      showNotification("Error fetching properties", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowPropertyEditor(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowPropertyEditor(true);
  };

  const handleSaveProperty = async (formData, imageFile) => {
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

      const url = editingProperty?.id 
        ? `/api/properties/${editingProperty.id}` 
        : "/api/properties";
      
      const method = editingProperty?.id ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        setShowPropertyEditor(false);
        setEditingProperty(null);
        await fetchProperties();
        showNotification(
          editingProperty?.id 
            ? "Property updated successfully!" 
            : "Property created successfully!",
          "success"
        );
      } else {
        showNotification("Failed to save property", "error");
      }
    } catch (error) {
      console.error("Error saving property:", error);
      showNotification("Error saving property", "error");
    }
  };

  const handleArchiveProperty = (propertyId) => {
    setPropertyToArchive(propertyId);
    setShowArchiveConfirmModal(true);
  };

  const handleSaveMaintenanceHeader = async (formData) => {
    showNotification("Maintenance header updated!", "success");
  };

  const handleViewProperty = (property) => {
    setEditingProperty(property);
    setShowPropertyEditor(true);
  };

  const confirmArchiveProperty = async () => {
    if (!propertyToArchive) return;
    setIsArchiving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/properties/${propertyToArchive}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true })
      });

      if (response.ok) {
        await fetchProperties();
        showNotification("Property archived successfully!", "success");
        setShowArchiveConfirmModal(false);
        setPropertyToArchive(null);
      } else {
        showNotification("Failed to archive property", "error");
      }
    } catch (error) {
      console.error("Error archiving property:", error);
      showNotification("Error archiving property", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  const closeArchiveConfirmModal = () => {
    setShowArchiveConfirmModal(false);
    setPropertyToArchive(null);
  };

  const getFilteredProperties = () => {
    const query = propertySearchQuery.toLowerCase();
    return properties.filter((property) => {
      return (
        property.id.toString().includes(query) ||
        property.title.toLowerCase().includes(query) ||
        property.category.toLowerCase().includes(query) ||
        property.status.toLowerCase().includes(query)
      );
    });
  };

  const getCardViewProperties = () => {
    const query = propertySearchQuery.toLowerCase();
    
    return properties.filter((property) => {
      const matchesSearch = 
        property.id.toString().includes(query) ||
        property.title.toLowerCase().includes(query) ||
        property.category.toLowerCase().includes(query) ||
        property.status.toLowerCase().includes(query);
      return matchesSearch && property.title.toLowerCase() === activePropertyTab.toLowerCase();
    });
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" ? "" : ""} {notification.message}
          </div>
        </div>
      )}

      {showArchiveConfirmModal && (
        <ArchiveConfirmationModal
          isOpen={showArchiveConfirmModal}
          title="Archive Property"
          message="Are you sure you want to archive this property? You can restore it later."
          onConfirm={confirmArchiveProperty}
          onCancel={closeArchiveConfirmModal}
          isLoading={isArchiving}
        />
      )}

      {(!editingProperty) ? (
        <ProductEditor
          property={editingProperty}
          isOpen={showPropertyEditor}
          onClose={() => {
            setShowPropertyEditor(false);
            setEditingProperty(null);
          }}
          onSave={handleSaveProperty}
          canManageServices={canManageProperties}
        />
      ) : (
        <ProductEditor
          property={editingProperty}
          isOpen={showPropertyEditor}
          onClose={() => {
            setShowPropertyEditor(false);
            setEditingProperty(null);
          }}
          onSave={handleSaveProperty}
          canManageServices={canManageProperties}
        />
      )}

      <div className="flex items-center mb-8">
        <img src={maintenanceIcon} alt="Properties Icon" className="w-10 h-10 object-contain mr-4" />
        <h1 className="text-3xl font-bold text-gray-800">Properties Management</h1>
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
                    ? "bg-gradient-to-r from-[#1B3022] to-[#2A4D36] text-white shadow-md"
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
                { label: 'Total Properties', value: properties.length },
                { label: 'Active', value: properties.filter(p => p.status === 'Active').length },
                { label: 'Lawn Lots', value: properties.filter(p => p.title === 'Lawn Lots').length },
                { label: 'Family Estates', value: properties.filter(p => p.title === 'Family Estates').length },
                { label: 'Columbariums', value: properties.filter(p => p.title === 'Columbariums').length }
              ]} />

              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-semibold text-gray-800">Properties List</h5>
                <div className="flex gap-2">
                  <button 
                    onClick={fetchProperties}
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
                    placeholder="Search properties by name, category, or status..."
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
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
                      <th>Property_ID</th>
                      <th>Property_Name</th>
                      <th>Category</th>
                      <th>Monthly_Price</th>
                      <th>Quarterly_Price</th>
                      <th>Yearly_Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredProperties().length > 0 ? (
                      getFilteredProperties().map((property, index) => (
                        <tr key={property.id}>
                          <td className="font-mono">{getSequentialIdFromIndex(index)}</td>
                          <td className="font-bold">{property.title}</td>
                          <td>{property.category}</td>
                          <td>{property.price_monthly || "N/A"}</td>
                          <td>{property.price_quarterly || "N/A"}</td>
                          <td>{property.price_yearly || "N/A"}</td>
                          <td className="text-center">
                            {property.status === "Active" ? (
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
                              onView={() => handleViewProperty(property)}
                              onEdit={() => handleEditProperty(property)}
                              onArchive={() => handleArchiveProperty(property.id)}
                              onToggleStatus={() => {}}
                              showView={true}
                              showEdit={true}
                              showArchive={true}
                              showToggle={false}
                              disabled={!canManageProperties}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row">
                        <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#6b7280", fontStyle: "italic" }}>
                          No properties available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Property Button - Bottom Right */}
              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleAddProperty}
                  disabled={!canManageProperties}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all text-lg ${canManageProperties ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  + Add Property
                </button>
              </div>
            </>
          )}

          {/* Cards View */}
          {viewMode === "Cards" && (
            <>
              {/* Property Tabs - Inside Cards View */}
              <nav className="mb-8">
                <div className="flex space-x-3" role="tablist">
                  {["Lawn Lots", "Family Estates", "Columbariums"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activePropertyTab === tab}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer
                        ${
                          activePropertyTab === tab
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                        }`}
                      onClick={() => setActivePropertyTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </nav>

              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-semibold text-gray-800">Properties</h5>
              </div>

              {/* Property Detail View - Show editor inline */}
              {getCardViewProperties().length > 0 ? (
                <div>
                  {getCardViewProperties().map((property) => (
                    <ServiceDetailEditorInline
                      key={property.id}
                      service={property}
                      onSave={handleSaveProperty}
                      canManageServices={canManageProperties}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No properties available for this category
                </div>
              )}

              {/* Add Property Button - Bottom Right */}
              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleAddProperty}
                  disabled={!canManageProperties}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all text-lg ${canManageProperties ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  + Add Property
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Properties;
