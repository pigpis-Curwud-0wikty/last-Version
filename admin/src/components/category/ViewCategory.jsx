import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../../App";

const ViewCategory = ({ token, categoryId, isActive, includeDeleted }) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategory = async () => {
    if (!categoryId) return;

    setLoading(true);
    try {
      console.log("this token:", token);
      const response = await axios.get(
        `${backendUrl}/api/categories/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            isActive: isActive?.toString(),
            includeDeleted: includeDeleted?.toString(),
          },
        }
      );

      // 🖨️ اطبع الرد زي ما هو
      console.log("📦 Full API response:", response);
      console.log("📦 Response.data:", response.data);

      if (response.status === 200) {
        setCategory(response.data?.responseBody?.data || null);
        setError(null);
      } else {
        setError("Unexpected status code: " + response.status);
      }
    } catch (err) {
      console.error("❌ Error fetching category:", err);
      if (err.response) {
        console.error("❌ API error response:", err.response.data);
        const status = err.response.status;
        if (status === 404) setError("Category not found.");
        else if (status === 500) setError("Server error. Try later.");
        else setError(err.response.data?.message || "Error fetching category.");
      } else {
        setError(err.message || "Network error.");
      } 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) fetchCategory();
  }, [categoryId, isActive, includeDeleted]);

  if (!categoryId)
    return <div className="p-4">Enter category ID to search.</div>;
  if (loading) return <div className="p-4">Loading category details...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!category) return <div className="p-4">No category found.</div>;

  const mainImage = category.images?.find((img) => img.isMain);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        Category Details: {category.name}
      </h2>

      <div className="mb-4">
        <p>
          <strong>ID:</strong> {category.id}
        </p>
        <p>
          <strong>Description:</strong> {category.description}
        </p>
        <p>
          <strong>Display Order:</strong> {category.displayOrder}
        </p>
        <p>
          <strong>Active:</strong> {category.isActive ? "Yes" : "No"}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(category.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Modified At:</strong>{" "}
          {new Date(category.modifiedAt).toLocaleString()}
        </p>
      </div>

      {mainImage && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Main Image</h3>
          <img
            src={mainImage.url}
            alt={category.name}
            className="w-48 h-48 object-cover rounded-md shadow-sm"
          />
        </div>
      )}

      {category.images && category.images.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">All Images</h3>
          <div className="flex flex-wrap gap-2">
            {category.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`Category ${category.name} image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md shadow-sm"
              />
            ))}
          </div>
        </div>
      )}

      {category.subCategories && category.subCategories.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Sub Categories</h3>
          <ul className="list-disc pl-5">
            {category.subCategories.map((sub) => (
              <li key={sub.id} className="mb-2">
                <p>
                  <strong>Name:</strong> {sub.name}
                </p>
                <p>
                  <strong>Description:</strong> {sub.description}
                </p>
                <p>
                  <strong>Active:</strong> {sub.isActive ? "Yes" : "No"}
                </p>
                {sub.images && sub.images.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sub.images.map((subImg, idx) => (
                      <img
                        key={idx}
                        src={subImg.url}
                        alt={`Subcategory ${sub.name} image ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewCategory;
