import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Dashboard = ({ token }) => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Count all items from a paginated endpoint by iterating pages until fewer than pageSize are returned
  const countAllFromEndpoint = async (path, baseParams = {}, pageSize = 100) => {
    let page = 1
    let total = 0
    const maxPages = 1000 // safety cap
    try {
      while (page <= maxPages) {
        const resp = await axios.get(`${backendUrl}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, pageSize, ...baseParams },
        })
        const list = resp?.data?.responseBody?.data
        if (!Array.isArray(list)) break
        total += list.length
        if (list.length < pageSize) break
        page += 1
      }
    } catch (err) {
      console.error(`Error counting ${path}:`, err?.response?.data || err)
      throw err
    }
    return total
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch totals from new paginated APIs
      const [totalProducts, totalOrders] = await Promise.all([
        countAllFromEndpoint('/api/Products', { isActive: true, includeDeleted: false }, 200),
        countAllFromEndpoint('/api/Order', {}, 200),
      ])
      setStats((prev) => ({ ...prev, totalProducts, totalOrders }))

      // Fetch a page of orders from the new API (for recent + popularity)
      const ordersListResp = await axios.get(`${backendUrl}/api/Order`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize: 50 },
      })
      const ordersList = Array.isArray(ordersListResp?.data?.responseBody?.data)
        ? ordersListResp.data.responseBody.data
        : []

      // Recent Orders: last 5 by createdAt
      const recent = [...ordersList]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5)
        .map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          total: o.total,
          createdAt: o.createdAt,
          status: o.status,
        }))
      setRecentOrders(recent)

      // Popular Products: aggregate from detailed items of these orders (fetch details)
      const details = await Promise.all(
        ordersList.map(async (o) => {
          try {
            const detailResp = await axios.get(`${backendUrl}/api/Order/${encodeURIComponent(o.id)}` , {
              headers: { Authorization: `Bearer ${token}` },
            })
            return detailResp?.data?.responseBody?.data
          } catch (e) {
            return null
          }
        })
      )
      const productFrequency = {}
      details.filter(Boolean).forEach((d) => {
        const items = Array.isArray(d?.items) ? d.items : []
        items.forEach((it) => {
          const pid = it?.product?.id || it?.productId
          const qty = Number(it?.quantity || 0)
          if (!pid) return
          productFrequency[pid] = (productFrequency[pid] || 0) + qty
        })
      })

      // Fetch products to map names/images
      const productsResp = await axios.get(`${backendUrl}/api/Products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, pageSize: 500, isActive: true, includeDeleted: false },
      })
      const productsList = Array.isArray(productsResp?.data?.responseBody?.data)
        ? productsResp.data.responseBody.data
        : []
      const byId = new Map(productsList.map((p) => [String(p.id), p]))

      const popular = Object.entries(productFrequency)
        .map(([id, soldCount]) => {
          const p = byId.get(String(id))
          return p
            ? {
                id: p.id,
                name: p.name,
                soldCount: Number(soldCount) || 0,
                price: p.price,
                image: Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : null,
              }
            : null
        })
        .filter(Boolean)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5)
      setPopularProducts(popular)

      // Calculate stats
      const totalRevenue = ordersList.reduce((sum, order) => sum + (order.total || 0), 0)
      setStats((prev) => ({ ...prev, totalRevenue }))
    } catch (err) {
      console.error('Dashboard load error:', err?.response?.data || err)
      toast.error('Failed to load dashboard data')
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
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{String(order.id).substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currency}{order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View all orders
                  </button>
                </div>
              </div>
            ) : (
              <p>No recent orders available.</p>
            )}
          </div>

          {/* Popular Products */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Popular Products</h3>
            {popularProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden flex">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-gray-500 text-xs">Product</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-semibold">{currency}{product.price}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.soldCount} sold</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="mt-2 px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View all products
                  </button>
                </div>
              </div>
            ) : (
              <p>No popular products found.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard