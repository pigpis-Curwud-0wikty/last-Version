import axios from "axios";
import { backendUrl } from "../App";

// API service for products, discounts, bulk discounts, and images
const API = {
  // Product APIs
  products: {
    // Create a new product
    create: async (productData, token) => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/Products`,
          productData,
          {
            headers: {
              "Content-Type": "application/json-patch+json",
              Authorization: `Bearer ${token}`, // لو الـ API Protected
            },
          }
        );

        console.log("✅ Product added successfully:", res.data);
        return res.data; // ⬅️ مهم جداً
      } catch (err) {
        console.error("❌ Error adding product:", err.response?.data || err);
        throw err; // ⬅️ كمان مهم عشان الـ Add.jsx يعرف فيه Error
      }
    },

    // Get product list with advanced search
    list: async (params, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.get(
          `${backendUrl}/api/Products/advanced-search`,
          {
            params,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get a single product by ID
    getById: async (productId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.get(
          `${backendUrl}/api/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update a product
    update: async (productId, productData, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.put(
          `${backendUrl}/api/products/${productId}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete a product
    delete: async (productId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.delete(
          `${backendUrl}/api/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Activate a product
    activate: async (productId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.post(
          `${backendUrl}/api/products/${productId}/activate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Deactivate a product
    deactivate: async (productId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.post(
          `${backendUrl}/api/products/${productId}/deactivate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },

  subcategories: {
    getAll: async (token) => {
      const res = await axios.get(`${backendUrl}/api/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; // هيبقى Array of subcategories
    },
  },

  // Image APIs
  images: {
    // Upload main image for a product
    uploadMain: async (productId, file, token) => {
      const formData = new FormData();
      formData.append("Files", file); // أو "image" حسب Swagger

      try {
        const res = await axios.post(
          `${backendUrl}/api/products/${productId}/main-image`, // مثال فقط
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // لا تحدد Content-Type هنا
            },
          }
        );
        return res.data;
      } catch (err) {
        console.error(
          "❌ Error uploading main image:",
          err.response?.data || err
        );
        throw err;
      }
    },

    // Upload additional images for a product
    uploadAdditional: async (productId, imageFiles, token) => {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("Files", file);
      });

      try {
        const res = await axios.post(
          `${backendUrl}/Products/${productId}/images`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Additional images uploaded:", res.data);
        return res.data;
      } catch (err) {
        console.error(
          "❌ Error uploading additional images:",
          err.response?.data || err
        );
        throw err.response?.data || err;
      }
    },

    // Delete an image
    delete: async (productId, imageId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.delete(
          `${backendUrl}/api/Products/${productId}/images/${imageId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },

  // Discount APIs
  discounts: {
    // Create a discount for a product
    create: async (productId, discountData, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.post(
          `${backendUrl}/api/Products/${productId}/discount`,
          discountData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get discounts for a product
    getByProductId: async (productId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.get(
          `${backendUrl}/api/Products/${productId}/discount`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update a discount
    update: async (productId, discountId, discountData, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.put(
          `${backendUrl}/api/Products/${productId}/discount/${discountId}`,
          discountData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete a discount
    delete: async (productId, discountId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.delete(
          `${backendUrl}/api/Products/${productId}/discount/${discountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },

  // Bulk Discount APIs
  bulkDiscounts: {
    // Create a bulk discount
    create: async (bulkDiscountData, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.post(
          `${backendUrl}/api/Products/bulk/discount`,
          bulkDiscountData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get all bulk discounts
    getAll: async (token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.get(
          `${backendUrl}/api/Products/bulk/discount`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update a bulk discount
    update: async (bulkDiscountId, bulkDiscountData, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.put(
          `${backendUrl}/api/Products/bulk/discount/${bulkDiscountId}`,
          bulkDiscountData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete a bulk discount
    delete: async (bulkDiscountId, token) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response = await axios.delete(
          `${backendUrl}/api/Products/bulk/discount/${bulkDiscountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default API;
