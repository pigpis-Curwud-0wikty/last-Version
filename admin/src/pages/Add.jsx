import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subcategoryid, setSubcategoryid] = useState("");
  const [fitType, setFitType] = useState("");
  const [gender, setGender] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Add the product first
      const productData = {
        name,
        description,
        subcategoryid: Number(subcategoryid),
        fitType: Number(fitType),
        gender: Number(gender),
        price: Number(price),
      };

      const productRes = await axios.post(
        "https://e-commerce-api-v1-2.onrender.com/api/AdminOperation",
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newProductId = productRes.data?.id;
      if (!newProductId) throw new Error("Product ID not returned.");

      // 2️⃣ Upload the image (if provided)
      if (image) {
        const formData = new FormData();
        formData.append("images", image); // backend expects array<string> but file upload might be allowed

        await axios.post(
          `https://e-commerce-api-v1-2.onrender.com/api/Products/${newProductId}/images`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success("✅ Product added successfully!");
      resetForm();
    } catch (error) {
      console.error("❌ Error adding product:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
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

      {/* Image Upload */}
      {/* <div>
        <p className="mb-2">Upload Image</p>
        <label htmlFor="image">
          <img
            className="w-24 h-24 object-cover border cursor-pointer"
            src={!image ? assets.upload_area : URL.createObjectURL(image)}
            alt="Upload"
          />
        </label>
        <input
          type="file"
          id="image"
          hidden
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div> */}

      {/* Inputs */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        className="w-full px-3 py-2 border rounded"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full px-3 py-2 border rounded"
        required
      />

      <input
        type="number"
        value={subcategoryid}
        onChange={(e) => setSubcategoryid(e.target.value)}
        placeholder="Subcategory ID"
        className="w-full px-3 py-2 border rounded"
        required
      />

      <input
        type="number"
        value={fitType}
        onChange={(e) => setFitType(e.target.value)}
        placeholder="Fit Type"
        className="w-full px-3 py-2 border rounded"
        required
      />

      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="">Select Gender</option>
        <option value="0">Male</option>
        <option value="1">Female</option>
      </select>

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="w-full px-3 py-2 border rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default Add;
