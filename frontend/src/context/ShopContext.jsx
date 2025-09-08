import { createContext, useState, useEffect } from "react";
// import { products } from "../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchWithTokenRefresh, getAuthHeaders } from "../utils/apiUtils";
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = "https://e-commerce-api-v1-p515.onrender.com";
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    console.log("Token from localStorage:", storedToken);
    return storedToken || "";
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        console.log("No refresh token available");
        return false;
      }

      const response = await fetch(`${backendUrl}/api/Account/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.responseBody && data.responseBody.data) {
          const tokenData = data.responseBody.data;
          localStorage.setItem("token", tokenData.token);
          localStorage.setItem("refreshToken", tokenData.refreshToken);
          setToken(tokenData.token);
          console.log("Token refreshed successfully");
          return true;
        }
      }

      console.log("Failed to refresh token");
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };
  const navigate = useNavigate();

  // Resolve variant id by size from Fashion-main variants API (best-effort)
  const resolveVariantId = async (productId, sizeLabel) => {
    if (!sizeLabel) return null;
    try {
      const response = await fetch(
        `${backendUrl}/api/Products/${productId}/Variants`
      );
      if (!response.ok) return null;
      const data = await response.json();
      const variants = data?.responseBody?.data || [];

      // Helper function to map size label to numeric range
      const mapSizeLabelToRange = (label) => {
        const upper = String(label).toUpperCase();
        switch (upper) {
          case 'S': return { min: 30, max: 32 };
          case 'M': return { min: 33, max: 35 };
          case 'L': return { min: 36, max: 38 };
          case 'XL': return { min: 39, max: 41 };
          case 'XXL': return { min: 42, max: 44 };
          default: return null;
        }
      };

      // First try exact string match
      let match = variants.find(
        (v) => String(v.size || "").toLowerCase() === String(sizeLabel).toLowerCase()
      );

      // If no exact match, try numeric range matching
      if (!match) {
        const range = mapSizeLabelToRange(sizeLabel);
        if (range) {
          match = variants.find((v) => {
            const variantSize = Number(v.size);
            return variantSize >= range.min && variantSize <= range.max;
          });
        }
      }

      // If still no match and we have variants, try to find any variant with available quantity
      if (!match && variants.length > 0) {
        console.warn(`No variant found for size ${sizeLabel}, trying to use first available variant`);
        match = variants.find(v => v.quantity > 0) || variants[0];
      }

      console.log('resolveVariantId:', { productId, sizeLabel, variants, match });
      return match?.id || null;
    } catch (e) {
      console.log("resolveVariantId error", e);
      return null;
    }
  };

  const addToCart = async (itemId, size, color, quantity = 1) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    if (!color) {
      toast.error("Please select a color");
      return;
    }

    // Check if item with same ID and size already exists in cart
    let itemExists = false;
    for (const items in cartItems) {
      if (items === itemId && cartItems[items][size]) {
        itemExists = true;
        break;
      }
    }

    if (itemExists) {
      toast.error("Item already in cart");
      return;
    } else {
      toast.success("Item added to cart");
    }
    let cartData = structuredClone(cartItems);
    const itemKey = `${size}_${color}`; // Create unique key for size+color combination
    if (cartData[itemId]) {
      if (cartData[itemId][itemKey]) {
        cartData[itemId][itemKey] += quantity;
      } else {
        cartData[itemId][itemKey] = quantity;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][itemKey] = quantity;
    }
    setCartItems(cartData);

    if (token) {
      try {
        console.log("Adding to cart with token:", token);
        const productVariantId = await resolveVariantId(itemId, size);

        if (!productVariantId) {
          toast.error("No variant found for the selected size. Please try a different size.");
          return;
        }

        console.log("Using variant ID:", productVariantId);
        const response = await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/items`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json-patch+json'
            },
            body: JSON.stringify({
              productId: Number(itemId),
              quantity: quantity,
              productVariantId: productVariantId,
            }),
          },
          refreshToken
        );

        const data = await response.json();
        console.log("Add to cart response:", data);

        if (response.ok && data.responseBody) {
          toast.success(data.responseBody.message || "Product added to cart");
        } else {
          const errorMessage = data.responseBody?.message || data.message || "Failed to add product to cart";
          toast.error(errorMessage);
          console.error("Add to cart error:", data);
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error("Error adding product to cart. Please try again.");
      }
    }
  };

  const getCartCount = () => {
    let total = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            total += cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return total;
  };

  const updataQuantity = async (itemId, size, color, quantity) => {
    let cartData = structuredClone(cartItems);
    // Handle both old format (no color) and new format (with color)
    const itemKey = color ? `${size}_${color}` : size;
    cartData[itemId][itemKey] = quantity;
    setCartItems(cartData);

    // Update cart in backend if user is logged in
    if (token) {
      try {
        const variantId = await resolveVariantId(itemId, size);
        if (!variantId) {
          console.log("Variant not found for size; skipping backend update");
          return;
        }
        console.log("Updating cart with token:", token);
        await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/items/${Number(itemId)}/${Number(variantId)}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity: Number(quantity) }),
          },
          refreshToken
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCartAmount = () => {
    let amount = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const product = products.find(p => p._id === itemId);
          if (product && product.finalPrice) {
            amount += product.finalPrice * cartItems[itemId][size];
          }
        }
      }
    }
    return amount;
  };


  const getProducts = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/Products?page=1&pageSize=100`);
      const data = await res.json();
      const list = data?.responseBody?.data || [];
      // Transform to UI shape expected by the app
      const transformed = list.map((p) => ({
        _id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.price, // Original price
        finalPrice: p.finalPrice, // Final/discounted price
        image: Array.isArray(p.images)
          ? p.images
            .map((img) => img.url || img.imageUrl || img.Url)
            .filter(Boolean)
          : p.mainImageUrl
            ? [p.mainImageUrl]
            : [],
        isActive: p.isActive,
        currency: currency,
        // Best-effort fields to minimize downstream changes
        category: p.categoryName || p.category?.name,
        subCategory: p.subCategoryName || p.subCategory?.name,
        sizes: (p.variants || []).map((v) => v.size).filter(Boolean),
      }));
      setProducts(transformed);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load products");
    }
  };

  // Fetch user's cart data from the backend
  const fetchUserCart = async () => {
    console.log("fetchUserCart called, token:", token);
    if (token) {
      try {
        console.log("Making request to GET /api/Cart with token:", token);
        const res = await fetch(`${backendUrl}/api/Cart`, {
          headers: getAuthHeaders(),
          method: "GET",
        });
        const data = await res.json();
        // Transform Fashion-main cart into local cartItems shape
        const items = data?.responseBody?.data?.items || [];
        const mapped = {};
        for (const it of items) {
          const pid = String(it.productId || it.product?.id);
          const sizeLabel =
            it.product?.productVariantForCartDto?.size || "default";
          if (!pid) continue;
          if (!mapped[pid]) mapped[pid] = {};
          mapped[pid][String(sizeLabel)] = it.quantity || 1;
        }
        setCartItems(mapped);
      } catch (error) {
        console.log("Error fetching cart:", error.message);
        if (error.response) {
          console.log(
            "Error response:",
            error.response.status,
            error.response.data
          );
        }
      }
    } else {
      console.log("No token available, skipping cart fetch");
    }
  };

  // Clear user's cart data
  const checkout = async () => {
    if (token) {
      try {
        const response = await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/checkout`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          },
          refreshToken
        );

        const data = await response.json();
        if (response.ok && data.responseBody) {
          setCartItems({});
          toast.success(data.responseBody.message || "Checkout successful");
          return true;
        } else {
          toast.error(data.responseBody?.message || "Checkout failed");
          return false;
        }
      } catch (error) {
        console.log("Error during checkout:", error.message);
        if (error.response) {
          console.log(
            "Error response:",
            error.response.status,
            error.response.data
          );
        }
        toast.error("Checkout failed");
        return false;
      }
    } else {
      toast.error("Please log in to checkout");
      return false;
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        console.log("Clearing cart with token:", token);
        const res = await fetch(`${backendUrl}/api/Cart/clear`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          setCartItems({});
          toast.success("Cart cleared successfully");
        } else {
          toast.error("Failed to clear cart");
        }
      } catch (error) {
        console.log("Error clearing cart:", error.message);
        if (error.response) {
          console.log(
            "Error response:",
            error.response.status,
            error.response.data
          );
        }
        toast.error("Failed to clear cart");
      }
    } else {
      // Clear local cart if not logged in
      setCartItems({});
      toast.success("Cart cleared successfully");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Fetch cart data whenever token changes (user logs in)
  useEffect(() => {
    fetchUserCart();
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updataQuantity,
    getCartAmount,
    clearCart,
    checkout, // ✅ New checkout function
    navigate,
    backendUrl,
    getProducts,
    token,
    setToken,
    refreshToken,
    user,
    setUser
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
