import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Add = ({ token }) => {
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subcategoryid, setSubcategoryid] = useState("");
  const [fitType, setFitType] = useState("");
  const [gender, setGender] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ✅ Store subcategories fetched from API
  const [subcategories, setSubcategories] = useState([]);

  // ✅ Fit Types (static list)
  const fitTypes = [
    { id: 1, name: "Slim" },
    { id: 2, name: "Regular" },
    { id: 3, name: "Oversized" },
  ];

  // Handle main image preview
  useEffect(() => {
    if (mainImage) {
      const objectUrl = URL.createObjectURL(mainImage);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [mainImage]);

  // ✅ Fetch subcategories on mount
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await API.subcategories.getAll(token);
        console.log("📦 Subcategories response:", res);
        setSubcategories(res.data); // ✅ استخدم الـ array من داخل res
      } catch (err) {
        console.error("❌ Failed to fetch subcategories:", err);
      }
    };

    fetchSubcategories();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name,
        description,
        subcategoryid: Number(subcategoryid),
        fitType: Number(fitType),
        gender: Number(gender),
        price: Number(price),
      };

      console.log(
        "📤 Product Data Sent:",
        JSON.stringify(productData, null, 2)
      );

      // ✅ إنشاء المنتج
      const productRes = await API.products.create(productData, token);

      // ✅ اطبع الرد كامل عشان نشوف شكله
      console.log(
        "📥 Full Product Response:",
        JSON.stringify(productRes, null, 2)
      );

      // ✅ نحاول نجيب الـ ID من كل مكان ممكن
      const newProductId =
        productRes?.responseBody?.data?.id ||
        productRes?.data?.id ||
        productRes?.id;

      if (!newProductId) {
        throw new Error("❌ Product ID not returned from API.");
      }

      console.log("✅ Extracted Product ID:", newProductId);

      // ✅ رفع الصور
      if (mainImage) {
        await API.images.uploadMain(newProductId, mainImage, token);
        console.log("📤 Main image uploaded!");
      }

      if (additionalImages.length > 0) {
        await API.images.uploadAdditional(
          newProductId,
          additionalImages,
          token
        );
        console.log("📤 Additional images uploaded!");
      }

      toast.success("✅ Product added successfully!");
      resetForm();
    } catch (err) {
      console.error(
        "❌ Error adding product:",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewProducts = () => {
    navigate("/products");
  };

  const resetForm = () => {
    setMainImage(null);
    setAdditionalImages([]);
    setPreviewUrl(null);
    setName("");
    setDescription("");
    setSubcategoryid("");
    setFitType("");
    setGender("");
    setPrice("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 items-start w-full max-w-md p-4 border rounded-lg bg-white shadow"
    >
      <h2 className="text-lg font-semibold">Add Product</h2>

      {/* Main Image Upload */}
      <div>
        <p className="mb-2">Upload Main Image</p>
        <label htmlFor="mainImage" className="cursor-pointer">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center">
            {previewUrl ? (
              <img
                className="w-full h-full object-cover"
                src={previewUrl}
                alt="Product Preview"
              />
            ) : (
              <span className="text-gray-500 text-xs text-center">
                Click to upload
              </span>
            )}
          </div>
        </label>
        <input
          type="file"
          id="mainImage"
          hidden
          accept="image/*"
          onChange={(e) => setMainImage(e.target.files[0])}
        />
      </div>

      {/* Additional Images Upload */}
      <div>
        <p className="mb-2">Upload Additional Images</p>
        <label htmlFor="additionalImages" className="cursor-pointer">
          <div className="w-full h-16 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs">
              {additionalImages.length > 0
                ? `${additionalImages.length} images selected`
                : "Click to upload multiple images"}
            </span>
          </div>
        </label>
        <input
          type="file"
          id="additionalImages"
          hidden
          multiple
          accept="image/*"
          onChange={(e) => setAdditionalImages(Array.from(e.target.files))}
        />
      </div>

      {/* Product Name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        className="w-full px-3 py-2 border rounded"
        required
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full px-3 py-2 border rounded"
        required
      />

      {/* ✅ Subcategory Select */}
      <select
        value={subcategoryid}
        onChange={(e) => setSubcategoryid(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="">Select Subcategory</option>
        {subcategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>

      {/* ✅ Fit Type Select */}
      <select
        value={fitType}
        onChange={(e) => setFitType(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="">Select Fit Type</option>
        {fitTypes.map((fit) => (
          <option key={fit.id} value={fit.id}>
            {fit.name}
          </option>
        ))}
      </select>

      {/* Gender Select */}
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="">Select Gender</option>
        <option value="1">Male</option>
        <option value="2">Female</option>
      </select>

      {/* Price */}
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="w-full px-3 py-2 border rounded"
        required
      />

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
        <button
          type="button"
          onClick={handlePreviewProducts}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
        >
          Preview Products
        </button>
      </div>
    </form>
  );
};

export default Add;
