import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { useParams, useLocation } from "react-router-dom";

// Import components
import AddCategory from "../components/category/AddCategory";
import ViewCategory from "../components/category/ViewCategory";
import ListCategory from "../components/category/ListCategory";
import AddSubCategory from "../components/category/AddSubCategory";
import ListSubCategory from "../components/category/ListSubCategory";

const Categorys = ({ token }) => {
  const { categoryId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [activeTab, setActiveTab] = useState("add");
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  // edit states
  const [editMode, setEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // sub-category states
  const [subCategories, setSubCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryDescription, setSubCategoryDescription] = useState("");
  const [subCategoryDisplayOrder, setSubCategoryDisplayOrder] = useState(1);
  const [subCategoryImages, setSubCategoryImages] = useState([]);
  const [subCategoryMainImage, setSubCategoryMainImage] = useState(null);
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);
  const [editSubCategoryMode, setEditSubCategoryMode] = useState(false);

  // search states for ViewCategory
  const [searchId, setSearchId] = useState(categoryId || "");
  const [searchActive, setSearchActive] = useState(searchParams.get("isActive") || "");
  const [searchDeleted, setSearchDeleted] = useState(searchParams.get("includeDeleted") || "false");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cats = res.data?.responseBody?.data || [];
      setCategories(cats);

      console.log(
        "📌 Available categories:",
        cats.map((c) => ({ id: c.id, name: c.name }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login again.");
      return;
    }
  }, [token]);

  // Update search states when URL parameters change
  useEffect(() => {
    console.log('URL params changed:', { categoryId, searchParams: Object.fromEntries(searchParams), hasInitializedFromUrl });
    
    if (categoryId && !hasInitializedFromUrl) {
      console.log('Setting up category view for ID:', categoryId);
      setSearchId(categoryId);
      setActiveTab("category");
      setHasInitializedFromUrl(true);
    }
    if (searchParams.get("isActive")) {
      setSearchActive(searchParams.get("isActive"));
    }
    if (searchParams.get("includeDeleted")) {
      setSearchDeleted(searchParams.get("includeDeleted"));
    }
  }, [categoryId, searchParams, hasInitializedFromUrl]);

  const handleEditSubCategory = (subCat) => {
    setEditSubCategoryMode(true);
    setEditSubCategoryId(subCat.id);
    setSubCategoryName(subCat.name);
    setSubCategoryDescription(subCat.description);
    setSubCategoryDisplayOrder(subCat.displayOrder);
    setParentCategoryId(Number(subCat.parentCategoryId));
    setActiveTab("add-sub");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 rounded ${
            activeTab === "add" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Add Category
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded ${
            activeTab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Categories List
        </button>
        <button
          onClick={() => setActiveTab("add-sub")}
          className={`px-4 py-2 rounded ${
            activeTab === "add-sub" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Add Sub-Category
        </button>
        <button
          onClick={() => setActiveTab("sub-list")}
          className={`px-4 py-2 rounded ${
            activeTab === "sub-list" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Sub-Categories List
        </button>
        <button
          onClick={() => setActiveTab("category")}
          className={`px-4 py-2 rounded ${
            activeTab === "category" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          View Category
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "add" && (
        <AddCategory token={token} fetchCategories={fetchCategories} setActiveTab={setActiveTab} />
      )}

      {activeTab === "list" && (
        <ListCategory
          token={token}
          categories={categories}
          setCategories={setCategories}
          setActiveTab={setActiveTab}
          handleEditCategory={(cat) => {
            setEditMode(true);
            setEditCategoryId(cat.id);
            setName(cat.name);
            setDescription(cat.description);
            setDisplayOrder(cat.displayOrder);
            setShowModal(true);
          }}
          setParentCategoryId={setParentCategoryId}
          fetchCategories={fetchCategories}
        />
      )}

      {activeTab === "add-sub" && (
        <AddSubCategory
          token={token}
          categories={categories}
          setActiveTab={setActiveTab}
          parentCategoryId={parentCategoryId}
          setParentCategoryId={setParentCategoryId}
          subCategoryName={subCategoryName}
          setSubCategoryName={setSubCategoryName}
          subCategoryDescription={subCategoryDescription}
          setSubCategoryDescription={setSubCategoryDescription}
          subCategoryDisplayOrder={subCategoryDisplayOrder}
          setSubCategoryDisplayOrder={setSubCategoryDisplayOrder}
          subCategoryImages={subCategoryImages}
          setSubCategoryImages={setSubCategoryImages}
          subCategoryMainImage={subCategoryMainImage}
          setSubCategoryMainImage={setSubCategoryMainImage}
          editSubCategoryMode={editSubCategoryMode}
          editSubCategoryId={editSubCategoryId}
        />
      )}

      {activeTab === "sub-list" && (
        <ListSubCategory
          token={token}
          subCategories={subCategories}
          setSubCategories={setSubCategories}
          categories={categories}
          setActiveTab={setActiveTab}
          handleEditSubCategory={handleEditSubCategory}
        />
      )}

      {activeTab === "category" && (
        <div className="p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-bold mb-2">View Category</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Enter Category ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <select
              value={searchActive}
              onChange={(e) => setSearchActive(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">All Active Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={searchDeleted}
              onChange={(e) => setSearchDeleted(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="false">Exclude Deleted</option>
              <option value="true">Include Deleted</option>
            </select>
          </div>
          <ViewCategory
            token={token}
            categoryId={searchId}
            isActive={searchActive === "true" ? true : searchActive === "false" ? false : undefined}
            includeDeleted={searchDeleted === "true"}
          />
        </div>
      )}

      {/* Modal for Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            {/* ...form for edit category remains unchanged... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorys;
