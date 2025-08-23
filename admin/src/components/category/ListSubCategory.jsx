import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../App";

const ListSubCategory = ({
  token,
  subCategories,
  setSubCategories,
  categories,
  setActiveTab,
  handleEditSubCategory,
  setParentCategoryId,
}) => {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState(""); // "", "true", "false"
  const [isDeleted, setIsDeleted] = useState(""); // "", "true", "false"
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search || undefined,
          isActive: isActive || undefined,
          isDeleted: isDeleted || undefined,
          page,
          pageSize,
        },
      });

      // Use correct response structure
      const subCats = res.data?.data || [];
      const totalCount = subCats.length;

      const normalized = subCats.map((sc) => ({
        ...sc,
        mainImage: sc.mainImage || sc.images?.find((i) => i.isMain) || null,
      }));

      setSubCategories(normalized);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      toast.error("Failed to fetch sub-categories");
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [token, search, isActive, isDeleted, page]);

  const removeSubCategory = async (id) => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`${backendUrl}/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.statusCode === 200) toast.success("Sub-category deleted ✅");
      else toast.error(res.data?.message || "Delete failed");
      setDeleteId(null);
      fetchSubCategories();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const activateSubCategory = async (subCat) => {
    if (!subCat.mainImage) return toast.error("Upload a main image first!");
    try {
      await axios.patch(`${backendUrl}/api/subcategories/${subCat.id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Sub-category activated ✅");
      fetchSubCategories();
    } catch (err) {
      toast.error("Activation failed");
    }
  };

  const deactivateSubCategory = async (id) => {
    try {
      await axios.patch(`${backendUrl}/api/subcategories/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Sub-category deactivated ❌");
      fetchSubCategories();
    } catch (err) {
      toast.error("Deactivation failed");
    }
  };

  const restoreSubCategory = async (id) => {
    try {
      await axios.put(`${backendUrl}/api/subcategories/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Sub-category restored ✅");
      fetchSubCategories();
    } catch (err) {
      toast.error("Restore failed");
    }
  };

  const getParentCategoryName = (categoryId) => {
    const parent = categories.find((cat) => cat.id === categoryId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sub-Categories List</h2>

      <button
        onClick={() => setActiveTab("add-sub")}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Add New Sub-Category
      </button>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search sub-categories..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded w-60"
        />
        <select value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="">All (Active/Inactive)</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={isDeleted} onChange={(e) => { setIsDeleted(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="">All (Deleted/Not Deleted)</option>
          <option value="true">Deleted</option>
          <option value="false">Not Deleted</option>
        </select>
      </div>

      {/* Sub-category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subCategories.length === 0 ? <p>No sub-categories found.</p> :
          subCategories.map((subCat) => (
            <div key={subCat.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white">
              {subCat.mainImage ? (
                <img src={subCat.mainImage.url} alt={subCat.name} className="w-full h-40 object-cover rounded mb-3" />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-3 text-gray-500">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-lg mb-1">{subCat.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                Parent: 
                <span 
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/categories/${subCat.categoryId}`);
                  }}
                >
                  {getParentCategoryName(subCat.categoryId)}
                </span>
              </p>
              <p className={`text-xs font-medium mb-1 ${subCat.isActive ? "text-green-600" : "text-red-600"}`}>
                {subCat.isActive ? "Active ✅" : "Inactive ❌"}
              </p>
              <p className={`text-xs font-medium mb-3 ${subCat.deleted ? "text-gray-500" : "text-blue-600"}`}>
                {subCat.deleted ? "Deleted 🗑️" : "Not Deleted"}
              </p>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleEditSubCategory(subCat)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => setDeleteId(subCat.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                {subCat.deleted && (
                  <button onClick={() => restoreSubCategory(subCat.id)} className="bg-green-500 text-white px-3 py-1 rounded">Restore</button>
                )}
                {subCat.isActive ? (
                  <button onClick={() => deactivateSubCategory(subCat.id)} className="bg-yellow-500 text-white px-3 py-1 rounded">Deactivate</button>
                ) : (
                  <button onClick={() => activateSubCategory(subCat)} className="bg-green-500 text-white px-3 py-1 rounded">Activate</button>
                )}
              </div>
            </div>
          ))
        }
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Next</button>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this sub-category?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={() => removeSubCategory(deleteId)} disabled={deleteLoading} className={`px-4 py-2 ${deleteLoading ? "bg-red-300" : "bg-red-500 hover:bg-red-600"} text-white rounded-md`}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSubCategory;
