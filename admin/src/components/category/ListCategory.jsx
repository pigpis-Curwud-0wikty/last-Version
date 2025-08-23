import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../../App";
import { useNavigate } from "react-router-dom";

const ListCategory = ({
  token,
  categories,
  setCategories,
  setActiveTab,
  handleEditCategory,
  setParentCategoryId,
  fetchCategories: parentFetchCategories, // optional fetch from parent
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState(""); // "", "true", "false"
  const [isDeleted, setIsDeleted] = useState(""); // "", "true", "false"
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search || undefined,
          isActive: isActive || undefined,
          isDeleted: isDeleted || undefined,
          page,
          pageSize,
        },
      });

      const cats = res.data?.responseBody?.data || [];
      const totalCount = res.data?.responseBody?.totalCount || cats.length;

      const normalized = cats.map((cat) => {
        const mainImage =
          cat.images?.find((i) => i.isMain) || cat.images?.[0] || null;
        return { ...cat, mainImage };
      });

      setCategories(normalized);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token, search, isActive, isDeleted, page]);

  // ✅ Delete
  const removeCategory = async (id) => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`${backendUrl}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.statuscode === 200) toast.success("Category deleted ✅");
      else toast.error(res.data?.responseBody?.message || "Delete failed");
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ Activate / Deactivate / Restore
  const activateCategory = async (cat) => {
    if (!cat.mainImage) return toast.error("Upload a main image first!");
    try {
      await axios.patch(
        `${backendUrl}/api/categories/${cat.id}/activate`,
        {}, // body
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { isActive: true }, // ✨ مهم
        }
      );
      toast.success("Category activated ✅");
      fetchCategories();
    } catch (err) {
      console.error("Activation failed:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Activation failed");
    }
  };

  const deactivateCategory = async (id) => {
    try {
      await axios.patch(
        `${backendUrl}/api/categories/${id}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { isActive: false }, // ✨ مهم
        }
      );
      toast.success("Category deactivated ❌");
      fetchCategories();
    } catch (err) {
      console.error("Deactivation failed:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Deactivation failed");
    }
  };

  const restoreCategory = async (id) => {
    try {
      await axios.put(
        `${backendUrl}/api/categories/${id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Category restored ✅");
      fetchCategories();
    } catch (err) {
      console.error("Restore failed:", err);
      toast.error("Restore failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Categories List</h2>

      <button
        onClick={() => setActiveTab("add")}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Add New Category
      </button>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded w-60"
        />
        <select
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All (Active/Inactive)</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={isDeleted}
          onChange={(e) => {
            setIsDeleted(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All (Deleted/Not Deleted)</option>
          <option value="true">Deleted</option>
          <option value="false">Not Deleted</option>
        </select>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white cursor-pointer"
              onClick={() => {
                console.log(
                  "Card clicked, navigating to category:",
                  cat.id,
                  cat.isActive,
                  cat.isDeleted
                );
                navigate(
                  `/category/view/${cat.id}?isActive=${cat.isActive ? "true" : "false"}&includeDeleted=${cat.isDeleted ? "true" : "false"}`
                );
              }}
            >
              {cat.mainImage ? (
                <img
                  src={cat.mainImage.url}
                  alt={cat.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-3 text-gray-500">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {cat.description || "No description"}
              </p>
              <p
                className={`text-xs font-medium mb-1 ${cat.isActive ? "text-green-600" : "text-red-600"}`}
              >
                {cat.isActive ? "Active ✅" : "Inactive ❌"}
              </p>
              <p
                className={`text-xs font-medium mb-3 ${cat.isDeleted ? "text-gray-500" : "text-blue-600"}`}
              >
                {cat.isDeleted ? "Deleted 🗑️" : "Not Deleted"}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCategory(cat);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(cat.id);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                {cat.isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deactivateCategory(cat.id);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      activateCategory(cat);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Activate
                  </button>
                )}
                {cat.isDeleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreCategory(cat.id);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Restore
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("add-sub");
                    setParentCategoryId(cat.id);
                  }}
                  className="bg-indigo-500 text-white px-3 py-1 rounded"
                >
                  Add Subcategory
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "Navigating to category:",
                      cat.id,
                      cat.isActive,
                      cat.isDeleted
                    );
                    navigate(
                      `/category/view/${cat.id}?isActive=${cat.isActive ? "true" : "false"}&includeDeleted=${cat.isDeleted ? "true" : "false"}`
                    );
                  }}
                  className="bg-purple-500 text-white px-3 py-1 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => removeCategory(deleteId)}
                disabled={deleteLoading}
                className={`px-4 py-2 ${deleteLoading ? "bg-red-300" : "bg-red-500 hover:bg-red-600"} text-white rounded-md`}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCategory;
