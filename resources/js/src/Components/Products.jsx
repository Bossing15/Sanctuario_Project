import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import maintenanceIcon from "../assets/icons/icons8-services-50.png";
import { TableSkeleton } from "./SkeletonLoader";
import usePermissions from "../utils/usePermissions";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ProductEditor from "./PropertyEditor";
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteProperty = (propertyId) => {
    setPropertyToDelete(propertyId);
    setShowDeleteConfirmModal(true);
  };

  const handleSaveMaintenanceHeader = async (formData) => {
    showNotification("Maintenance header updated!", "success");
  };

  const handleViewProperty = (property) => {
    setEditingProperty(property);
    setShowPropertyEditor(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/properties/${propertyToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      if (response.ok) {
        await fetchProperties();
        showNotification("Property deleted successfully!", "success");
        setShowDeleteConfirmModal(false);
        setPropertyToDelete(null);
      } else {
        showNotification("Failed to delete property", "error");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      showNotification("Error deleting property", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setPropertyToDelete(null);
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

      {showDeleteConfirmModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone."
          onConfirm={confirmDeleteProperty}
          onCancel={closeDeleteConfirmModal}
          isLoading={isDeleting}
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
                { label: 'Total Products', value: products.length },
                { label: 'Active', value: products.filter(p => p.status === 'Active').length },
                { label: 'Lawn Lots', value: products.filter(p => p.title === 'Lawn Lots').length },
                { label: 'Family Estates', value: products.filter(p => p.title === 'Family Estates').length },
                { label: 'Columbariums', value: products.filter(p => p.title === 'Columbariums').length }
              ]} />

              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-semibold text-gray-800">Products List</h5>
                <div className="flex gap-2">
                  <button 
                    onClick={fetchProducts}
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
                    placeholder="Search products by name, category, or status..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
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
                      <th>Product_ID</th>
                      <th>Product_Name</th>
                      <th>Category</th>
                      <th>Monthly_Price</th>
                      <th>Quarterly_Price</th>
                      <th>Yearly_Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter((product) => {
                      const query = productSearchQuery.toLowerCase();
                      return (
                        product.id.toString().includes(query) ||
                        product.title.toLowerCase().includes(query) ||
                        product.category.toLowerCase().includes(query) ||
                        product.status.toLowerCase().includes(query)
                      );
                    }).length > 0 ? (
                      products.filter((product) => {
                        const query = productSearchQuery.toLowerCase();
                        return (
                          product.id.toString().includes(query) ||
                          product.title.toLowerCase().includes(query) ||
                          product.category.toLowerCase().includes(query) ||
                          product.status.toLowerCase().includes(query)
                        );
                      }).map((product, index) => (
                        <tr key={product.id}>
                          <td className="font-mono">{getSequentialIdFromIndex(index)}</td>
                          <td className="font-bold">{product.title}</td>
                          <td>{product.category}</td>
                          <td>{product.price_monthly || "N/A"}</td>
                          <td>{product.price_quarterly || "N/A"}</td>
                          <td>{product.price_yearly || "N/A"}</td>
                          <td className="text-center">
                            {product.status === "Active" ? (
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
                              onView={() => handleViewProduct(product)}
                              onEdit={() => handleEditProduct(product)}
                              onDelete={() => handleDeleteProduct(product.id)}
                              onToggleStatus={() => {}}
                              showView={true}
                              showEdit={true}
                              showDelete={true}
                              showToggle={false}
                              disabled={!canManageProducts}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row">
                        <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#6b7280", fontStyle: "italic" }}>
                          No products available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Product Button - Bottom Right */}
              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleAddProduct}
                  disabled={!canManageProducts}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all text-lg ${canManageProducts ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  + Add Product
                </button>
              </div>
            </>
          )}

          {/* Cards View */}
          {viewMode === "Cards" && (
            <>
              {/* Product Tabs - Inside Cards View */}
              <nav className="mb-8">
                <div className="flex space-x-3" role="tablist">
                  {["Lawn Lots", "Family Estates", "Columbariums"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeProductTab === tab}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer
                        ${
                          activeProductTab === tab
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                        }`}
                      onClick={() => setActiveProductTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </nav>

              <div className="flex items-center justify-between mb-6">
                <h5 className="text-xl font-semibold text-gray-800">Products</h5>
              </div>

              {/* Product Detail View - Show editor inline */}
              {getCardViewProducts().length > 0 ? (
                <div>
                  {getCardViewProducts().map((product) => (
                    <ServiceDetailEditorInline
                      key={product.id}
                      service={product}
                      onSave={handleSaveProduct}
                      canManageServices={canManageProducts}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No products available for this category
                </div>
              )}

              {/* Add Product Button - Bottom Right */}
              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleAddProduct}
                  disabled={!canManageProducts}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all text-lg ${canManageProducts ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  + Add Product
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
