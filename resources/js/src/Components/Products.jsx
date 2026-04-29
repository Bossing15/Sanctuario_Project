import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import maintenanceIcon from "../assets/icons/icons8-services-50.png";
import { TableSkeleton } from "./SkeletonLoader";
import usePermissions from "../utils/usePermissions";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ProductEditor from "./ProductEditor";
import ServiceDetailEditorInline from "./ServiceDetailEditorInline";
import StatsCards from "./StatsCards";
import CrudActions from "./CrudActions";
import { getSequentialIdFromIndex } from "../utils/tableIdGenerator";
import crudUtils from "../utils/crudUtils";
import "./MaintenanceHeader.css";

const Products = () => {
  const navigate = useNavigate();
  const { canPerformActions } = usePermissions();
  const canManageProducts = canPerformActions("graves");
  
  const [viewMode, setViewMode] = useState("Table");
  const [activeProductTab, setActiveProductTab] = useState("Lawn Lots");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/products", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showNotification("Error fetching products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductEditor(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductEditor(true);
  };

  const handleSaveProduct = async (formData, imageFile) => {
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

      const url = editingProduct?.id 
        ? `/api/products/${editingProduct.id}` 
        : "/api/products";
      
      const method = editingProduct?.id ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        setShowProductEditor(false);
        setEditingProduct(null);
        await fetchProducts();
        showNotification(
          editingProduct?.id 
            ? "Product updated successfully!" 
            : "Product created successfully!",
          "success"
        );
      } else {
        showNotification("Failed to save product", "error");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showNotification("Error saving product", "error");
    }
  };

  const handleDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setShowDeleteConfirmModal(true);
  };

  const handleSaveMaintenanceHeader = async (formData) => {
    showNotification("Maintenance header updated!", "success");
  };

  const handleViewProduct = (product) => {
    setEditingProduct(product);
    setShowProductEditor(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      if (response.ok) {
        await fetchProducts();
        showNotification("Product deleted successfully!", "success");
        setShowDeleteConfirmModal(false);
        setProductToDelete(null);
      } else {
        showNotification("Failed to delete product", "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("Error deleting product", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setProductToDelete(null);
  };

  const getFilteredProducts = () => {
    const query = productSearchQuery.toLowerCase();
    return products.filter((product) => {
      return (
        product.id.toString().includes(query) ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.status.toLowerCase().includes(query)
      );
    });
  };

  const getCardViewProducts = () => {
    const query = productSearchQuery.toLowerCase();
    
    return products.filter((product) => {
      const matchesSearch = 
        product.id.toString().includes(query) ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.status.toLowerCase().includes(query);
      return matchesSearch && product.title.toLowerCase() === activeProductTab.toLowerCase();
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
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={confirmDeleteProduct}
          onCancel={closeDeleteConfirmModal}
          isLoading={isDeleting}
        />
      )}

      {(!editingProduct) ? (
        <ProductEditor
          product={editingProduct}
          isOpen={showProductEditor}
          onClose={() => {
            setShowProductEditor(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          canManageServices={canManageProducts}
        />
      ) : (
        <ProductEditor
          product={editingProduct}
          isOpen={showProductEditor}
          onClose={() => {
            setShowProductEditor(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          canManageServices={canManageProducts}
        />
      )}

      <div className="flex items-center mb-8">
        <img src={maintenanceIcon} alt="Products Icon" className="w-10 h-10 object-contain mr-4" />
        <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
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

export default Products;
