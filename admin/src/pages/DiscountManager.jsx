import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import DiscountForm from "../components/discount/DiscountForm";
import DiscountList from "../components/discount/DiscountList";
import DiscountFilter from "../components/discount/DiscountFilter";

const DiscountManager = ({ token }) => {
  // State for discount form
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: 0,
    startDate: "",
    endDate: "",
    description: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  // State for discounts
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState({
    where: "",
    orderBy: "",
    minDiscount: "",
    maxDiscount: "",
    startDateAfter: "",
    endDateBefore: "",
  });

  // Fetch all discounts
  const fetchDiscounts = async () => {
    setDiscountsLoading(true);
    try {
      // Apply filters to the API call
      const params = {
        page,
        pageSize,
        ...filter
      };
      
      const response = await API.discounts.list(params, token);
      console.log("Response from API:", response); // DEBUG
      setDiscounts(response.responseBody?.data || []);
      setTotalItems(response.responseBody?.totalCount || 0);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to load discounts");
    } finally {
      setDiscountsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [token, page, pageSize]); // Re-fetch when pagination changes

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      discountPercent: 0,
      startDate: "",
      endDate: "",
      description: "",
    });
    setEditMode(false);
    setEditId(null);
  };

  // Load discount for editing
  const handleEditDiscount = async (id) => {
    try {
      const discount = await API.discounts.getById(id, token);
      setFormData({
        id: id, // Include the ID for product association
        name: discount.name || "",
        discountPercent: discount.discountPercent || 0,
        startDate: discount.startDate
          ? new Date(discount.startDate).toISOString().slice(0, 16)
          : "",
        endDate: discount.endDate
          ? new Date(discount.endDate).toISOString().slice(0, 16)
          : "",
        description: discount.description || "",
      });
      setEditMode(true);
      setEditId(id);
    } catch (error) {
      console.error("Error loading discount for edit:", error);
      toast.error("Failed to load discount details");
    }
  };

  // Submit form (create or update)
  const handleSubmitDiscount = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      formData.discountPercent < 1 ||
      formData.discountPercent > 100
    ) {
      toast.error(
        "Please fill all required fields. Discount percentage must be between 1 and 100."
      );
      return;
    }

    setDiscountLoading(true);
    try {
      const discountData = {
        name: formData.name,
        discountPercent: parseInt(formData.discountPercent),
        startDate: formData.startDate || new Date().toISOString(),
        endDate:
          formData.endDate ||
          new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ).toISOString(),
        description: formData.description || "",
      };

      if (!token) {
        toast.error("User is not authenticated");
        return;
      }

      if (editMode) {
        await API.discounts.update(editId, discountData, token);
        toast.success("Discount updated successfully");
      } else {
        await API.discounts.create(discountData, token);
        toast.success("Discount created successfully");
      }

      resetForm();
      fetchDiscounts(); // Refresh list
    } catch (error) {
      console.error("Error saving discount:", error.response?.data || error);
      toast.error(
        editMode ? "Failed to update discount" : "Failed to create discount"
      );
    } finally {
      setDiscountLoading(false);
    }
  };

  // Delete discount
  const handleDeleteDiscount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount?"))
      return;

    try {
      await API.discounts.delete(id, token);
      toast.success("Discount deleted successfully");

      // تحديث الجدول بعد الحذف
      await fetchDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    }
  };

  // Activate/Deactivate discount
  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        // Deactivate
        await API.discounts.deactivate(id, token);
        toast.success("Discount deactivated");
      } else {
        // Activate
        await API.discounts.activate(id, token);
        toast.success("Discount activated");
      }

      // تحديث الجدول بعد نجاح العملية
      await fetchDiscounts();
    } catch (error) {
      console.error("Error toggling discount status:", error);
      toast.error("Failed to update discount status");
    }
  };

  // Restore deleted discount
  const handleRestoreDiscount = async (id) => {
    try {
      await API.discounts.restore(id, token);
      toast.success("Discount restored successfully");

      // تحديث الجدول بعد الاستعادة
      await fetchDiscounts();
    } catch (error) {
      console.error("Error restoring discount:", error);
      toast.error("Failed to restore discount");
    }
  };

  // Validate discount
  const handleValidateDiscount = async (id) => {
    try {
      const result = await API.discounts.validate(id, token);
      toast.info(`Discount validation: ${result ? "Valid" : "Invalid"}`);
    } catch (error) {
      console.error("Error validating discount:", error);
      toast.error("Failed to validate discount");
    }
  };

  // Calculate discount
  const handleCalculateDiscount = async (id, originalPrice) => {
    try {
      const result = await API.discounts.calculate(id, originalPrice, token);
      return result;
    } catch (error) {
      console.error("Error calculating discount:", error);
      if (error.response && error.response.data && error.response.data.message === "No products associated with this discount") {
        // If the backend explicitly tells us there are no products, let's handle it
        toast.info("Please associate products with this discount first");
      } else {
        toast.error("Failed to calculate discount");
      }
      return null;
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Apply filters and fetch discounts
  const handleApplyFilters = () => {
    // Reset to first page when applying new filters
    setPage(1);
    fetchDiscounts();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Discount Management</h2>

      {/* Discount Form */}
      <DiscountForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmitDiscount={handleSubmitDiscount}
        resetForm={resetForm}
        editMode={editMode}
        discountLoading={discountLoading}
        token={token}
      />

      {/* Filters */}
      <DiscountFilter
        filters={filter}
        handleFilterChange={handleFilterChange}
        handleApplyFilters={handleApplyFilters}
      />

      {/* Discount List */}
      <DiscountList
        discounts={discounts}
        loading={discountsLoading}
        handleEditDiscount={handleEditDiscount}
        handleDeleteDiscount={handleDeleteDiscount}
        handleToggleActive={handleToggleActive}
        handleRestoreDiscount={handleRestoreDiscount}
        handleCalculateDiscount={handleCalculateDiscount}
        fetchDiscounts={fetchDiscounts} // ← لازم تضيف هذا
        currentPage={page}
        totalPages={Math.ceil(totalItems / pageSize)}
        handlePreviousPage={() => handlePageChange(page - 1)}
        handleNextPage={() => handlePageChange(page + 1)}
      />
    </div>
  );
};

export default DiscountManager;
