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
  const backendUrl = 'https://e-commerce-api-v1-2.onrender.com'
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Token from localStorage:', storedToken);
    return storedToken || '';
  });
  
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        console.log('No refresh token available');
        return false;
      }
      
      const response = await fetch(`${backendUrl}/api/Account/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseBody && data.responseBody.data) {
          const tokenData = data.responseBody.data;
          localStorage.setItem('token', tokenData.token);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          setToken(tokenData.token);
          console.log('Token refreshed successfully');
          return true;
        }
      }
      
      console.log('Failed to refresh token');
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };
  const navigate = useNavigate();

  // Resolve variant id by size from Fashion-main variants API (best-effort)
  const resolveVariantId = async (productId, sizeLabel) => {
    if (!sizeLabel) return null;
    try {
      const response = await fetch(`${backendUrl}/api/Products/${productId}/Variants`);
      if (!response.ok) return null;
      const data = await response.json();
      const variants = data?.responseBody?.data || [];
      const match = variants.find(v =>
        String(v.size || '').toLowerCase() === String(sizeLabel).toLowerCase()
      );
      return match?.id || null;
    } catch (e) {
      console.log('resolveVariantId error', e);
      return null;
    }
  };

  const addToCart = async (itemId, size) => {

    if (!size) {
      toast.error("Please select a size");
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
    }
    else {                      
      toast.success("Item added to cart");
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        console.log('Adding to cart with token:', token);
        const productVariantId = await resolveVariantId(itemId, size);
        const response = await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/items`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              productId: Number(itemId),
              quantity: 1,
              productVariantId: productVariantId ?? 0
            })
          },
          refreshToken
        );

        const data = await response.json();
        if (response.ok && data.responseBody) {
          toast.success(data.responseBody.message || 'Product added to cart');
        } else {
          toast.error(data.responseBody?.message || 'Failed to add product to cart');
        }
      } catch (error) {
        console.log(error);
        toast.error('Error adding product to cart');
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

  const updataQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    
    // Update cart in backend if user is logged in
    if (token) {
      try {
        const variantId = await resolveVariantId(itemId, size);
        if (!variantId) {
          console.log('Variant not found for size; skipping backend update');
          return;
        }
        console.log('Updating cart with token:', token);
        await fetchWithTokenRefresh(
          `${backendUrl}/api/Cart/items/${Number(itemId)}/${Number(variantId)}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity: Number(quantity) })
          },
          refreshToken
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCartAmount = () => {
    let total = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            total += cartItems[items][item] * itemInfo.price;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return total;
  };

  const getProducts = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/Products?page=1&pageSize=100`);
      const data = await res.json();
      const list = data?.responseBody?.data || [];
      // Transform to UI shape expected by the app
      const transformed = list.map(p => ({
        _id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.finalPrice ?? p.price,
        image: Array.isArray(p.images) ? p.images.map(img => img.url || img.imageUrl || img.Url).filter(Boolean) : (p.mainImageUrl ? [p.mainImageUrl] : []),
        isActive: p.isActive,
        currency: currency,
        // Best-effort fields to minimize downstream changes
        category: p.categoryName || p.category?.name,
        subCategory: p.subCategoryName || p.subCategory?.name,
        sizes: (p.variants || []).map(v => v.size).filter(Boolean)
      }));
      setProducts(transformed);
    } catch (error) {
      console.log(error);
      toast.error('Failed to load products');
    }
  }

  // Fetch user's cart data from the backend
  const fetchUserCart = async () => {
    console.log('fetchUserCart called, token:', token);
    if (token) {
      try {
        console.log('Making request to GET /api/Cart with token:', token);
        const res = await fetch(`${backendUrl}/api/Cart`, {
          headers: getAuthHeaders(),
          method: 'GET'
        });
        const data = await res.json();
        // Transform Fashion-main cart into local cartItems shape
        const items = data?.responseBody?.data?.items || [];
        const mapped = {};
        for (const it of items) {
          const pid = String(it.productId || it.product?.id);
          const sizeLabel = it.product?.productVariantForCartDto?.size || 'default';
          if (!pid) continue;
          if (!mapped[pid]) mapped[pid] = {};
          mapped[pid][String(sizeLabel)] = it.quantity || 1;
        }
        setCartItems(mapped);
      } catch (error) {
        console.log('Error fetching cart:', error.message);
        if (error.response) {
          console.log('Error response:', error.response.status, error.response.data);
        }
      }
    } else {
      console.log('No token available, skipping cart fetch');
    }
  }

  // Clear user's cart data
  const clearCart = async () => {
    if (token) {
      try {
        console.log('Clearing cart with token:', token);
        const res = await fetch(`${backendUrl}/api/Cart/clear`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) {
          setCartItems({});
          toast.success('Cart cleared successfully');
        } else {
          toast.error('Failed to clear cart');
        }
      } catch (error) {
        console.log('Error clearing cart:', error.message);
        if (error.response) {
          console.log('Error response:', error.response.status, error.response.data);
        }
        toast.error('Failed to clear cart');
      }
    } else {
      // Clear local cart if not logged in
      setCartItems({});
      toast.success('Cart cleared successfully');
    }
  }

  useEffect(() => {
    getProducts()
  }, [])
  
  // Fetch cart data whenever token changes (user logs in)
  useEffect(() => {
    fetchUserCart()
  }, [token])

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
    navigate,
    backendUrl,
    getProducts,
    token,
    setToken,
    refreshToken
  };



  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;