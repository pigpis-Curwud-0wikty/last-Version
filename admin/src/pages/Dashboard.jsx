import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch products count
      const productsResponse = await axios.get(`${backendUrl}/api/Product/admin/list`, {
        headers: { token }
      })
      
      // Fetch orders
      const ordersResponse = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token }
      })

      if (productsResponse.data.message === 'Products listed successfully' && 
          ordersResponse.data.success) {
        
        const products = productsResponse.data.products
        const orders = ordersResponse.data.orders
        
        // Calculate stats
        const totalProducts = products.length
        const totalOrders = orders.length
        const pendingOrders = orders.filter(order => order.status === 'Pending' || !order.status).length
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0)
        
        // Get recent orders (last 5)
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
        
        // Calculate popular products based on order frequency
        const productFrequency = {}
        orders.forEach(order => {
          order.items.forEach(item => {
            if (productFrequency[item.productId]) {
              productFrequency[item.productId] += item.quantity
            } else {
              productFrequency[item.productId] = item.quantity
            }
          })
        })
        
        // Map product IDs to actual products and sort by popularity
        const popularProducts = products
          .filter(product => productFrequency[product._id])
          .map(product => ({
            ...product,
            soldCount: productFrequency[product._id] || 0
          }))
          .sort((a, b) => b.soldCount - a.soldCount)
          .slice(0, 5)
        
        setStats({
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders
        })
        setRecentOrders(recentOrders)
        setPopularProducts(popularProducts)
      } else {
        toast.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  return (
    <div className="dashboard">
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Products</h3>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Revenue</h3>
              <p className="text-2xl font-bold">{currency}{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Pending Orders</h3>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.address ? `${order.address.firstName} ${order.address.lastName}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currency}{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No recent orders found.</p>
            )}
          </div>

          {/* Popular Products */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Popular Products</h3>
            {popularProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularProducts.map((product) => (
                  <div key={product._id} className="border rounded-lg overflow-hidden flex">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img src={product.image[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-gray-500 text-xs">{product.category} - {product.subCategory}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-semibold">{currency}{product.price}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.soldCount} sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No popular products found.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard