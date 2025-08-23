import React, { useState } from "react";
import { toast } from "react-toastify";

import axios from "axios";
import { backendUrl } from "../../App";
import { useNavigate } from "react-router-dom";

const AddCategory = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const navigate = useNavigate();

  const cleanText = (text) => text.replace(/\s+/g, " ").trim();

  const resetForm = () => {
    setName("");
    setDescription("");
    setDisplayOrder(1);
    setImages([]);
    setMainImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must log in first!");
      return;
    }

    const cleanedName = cleanText(name);
    const cleanedDescription = cleanText(description);
    const cleanedOrder = Math.max(1, Number(displayOrder));

    setLoading(true);
    try {
      // 1️⃣ إنشاء الكاتيجوري (بالفورم فقط بدون صور)
      const formData = new FormData();
      formData.append("Name", cleanedName);
      formData.append("Description", cleanedDescription);
      formData.append("DisplayOrder", cleanedOrder);

      const createRes = await axios.post(`${backendUrl}/api/categories`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (createRes.data?.statuscode !== 201) {
        toast.error(createRes.data?.responseBody?.message || "Failed to create category");
        setLoading(false);
        return;
      }

      const categoryId = createRes.data?.responseBody?.data?.id;
      toast.success("Category created ✅");

      // 2️⃣ رفع الصور الإضافية
      if (images.length > 0) {
        const imgForm = new FormData();
        images.forEach((file) => imgForm.append("images", file));

        await axios.post(`${backendUrl}/api/categories/${categoryId}/images`, imgForm, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Additional images uploaded 📸");
      }

      // 3️⃣ رفع الصورة الرئيسية
      if (mainImage) {
        const mainForm = new FormData();
        mainForm.append("image", mainImage);

        await axios.post(`${backendUrl}/api/categories/${categoryId}/images/main`, mainForm, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Main image uploaded 🖼️");
      }

      resetForm();
      // ✅ استخدم useNavigate بدل Navigate
     navigate(`../components/category/ViewCategory${categoryId}?isActive=true&includeDeleted=false`);


    } catch (error) {
      console.error("❌ Error saving category:", error);
      const apiError =
        error.response?.data?.responseBody?.errors?.messages?.[0] ||
        error.response?.data?.responseBody?.message ||
        "Error saving category";
      toast.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Category</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="mb-3">
          <label className="block mb-1">Category Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 w-full"
            placeholder="Category Name"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 w-full"
            placeholder="Description"
            rows="3"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="border px-3 py-2 w-full"
            min="1"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Main Image</label>
          <input
            type="file"
            onChange={(e) => setMainImage(e.target.files[0])}
            className="border px-3 py-2 w-full"
            accept="image/*"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Additional Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="border px-3 py-2 w-full"
            accept="image/*"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${loading ? "bg-gray-400" : "bg-blue-600"} text-white py-2 rounded`}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
