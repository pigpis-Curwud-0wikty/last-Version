import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Settings = ({ token }) => {
  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Fashion Store',
    storeEmail: 'contact@fashionstore.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Fashion St, Style City, SC 12345',
    storeCurrency: currency,
    logoUrl: '',
    enableRegistration: true
  })

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    enableCashOnDelivery: true,
    enableStripe: false,
    enableRazorpay: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    razorpayKeyId: '',
    razorpayKeySecret: ''
  })

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    enableFreeShipping: true,
    freeShippingThreshold: 50,
    flatRateShipping: 5,
    enableLocalPickup: false
  })

  // Loading state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true)
    try {
      // This would be a real API call in a production environment
      // const response = await axios.get(`${backendUrl}/api/settings`, {
      //   headers: { token }
      // })
      
      // if (response.data.success) {
      //   setStoreSettings(response.data.storeSettings)
      //   setPaymentSettings(response.data.paymentSettings)
      //   setShippingSettings(response.data.shippingSettings)
      // } else {
      //   toast.error(response.data.message || 'Failed to fetch settings')
      // }

      // For demonstration, we'll use the default values
      setTimeout(() => {
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Error fetching settings')
      setLoading(false)
    }
  }

  // Save settings
  const saveSettings = async () => {
    setSaving(true)
    try {
      // This would be a real API call in a production environment
      // const response = await axios.post(`${backendUrl}/api/settings`, {
      //   storeSettings,
      //   paymentSettings,
      //   shippingSettings
      // }, {
      //   headers: { token }
      // })
      
      // if (response.data.success) {
      //   toast.success('Settings saved successfully')
      // } else {
      //   toast.error(response.data.message || 'Failed to save settings')
      // }

      // For demonstration, we'll simulate a successful save
      setTimeout(() => {
        toast.success('Settings saved successfully')
        setSaving(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error saving settings')
      setSaving(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSettings()
    }
  }, [token])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings()
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Store Settings</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Store Settings */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSettings.storeEmail}
                  onChange={(e) => setStoreSettings({...storeSettings, storeEmail: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSettings.storePhone}
                  onChange={(e) => setStoreSettings({...storeSettings, storePhone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Currency</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSettings.storeCurrency}
                  onChange={(e) => setStoreSettings({...storeSettings, storeCurrency: e.target.value})}
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                  <option value="₹">INR (₹)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({...storeSettings, storeAddress: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSettings.logoUrl}
                  onChange={(e) => setStoreSettings({...storeSettings, logoUrl: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRegistration"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={storeSettings.enableRegistration}
                    onChange={(e) => setStoreSettings({...storeSettings, enableRegistration: e.target.checked})}
                  />
                  <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-700">
                    Enable user registration
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-4">Payment Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCashOnDelivery"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={paymentSettings.enableCashOnDelivery}
                  onChange={(e) => setPaymentSettings({...paymentSettings, enableCashOnDelivery: e.target.checked})}
                />
                <label htmlFor="enableCashOnDelivery" className="ml-2 block text-sm text-gray-700">
                  Enable Cash on Delivery
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableStripe"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={paymentSettings.enableStripe}
                  onChange={(e) => setPaymentSettings({...paymentSettings, enableStripe: e.target.checked})}
                />
                <label htmlFor="enableStripe" className="ml-2 block text-sm text-gray-700">
                  Enable Stripe Payments
                </label>
              </div>
              
              {paymentSettings.enableStripe && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Public Key</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={paymentSettings.stripePublicKey}
                      onChange={(e) => setPaymentSettings({...paymentSettings, stripePublicKey: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableRazorpay"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={paymentSettings.enableRazorpay}
                  onChange={(e) => setPaymentSettings({...paymentSettings, enableRazorpay: e.target.checked})}
                />
                <label htmlFor="enableRazorpay" className="ml-2 block text-sm text-gray-700">
                  Enable Razorpay Payments
                </label>
              </div>
              
              {paymentSettings.enableRazorpay && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={paymentSettings.razorpayKeyId}
                      onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeyId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key Secret</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={paymentSettings.razorpayKeySecret}
                      onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeySecret: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-4">Shipping Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableFreeShipping"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={shippingSettings.enableFreeShipping}
                  onChange={(e) => setShippingSettings({...shippingSettings, enableFreeShipping: e.target.checked})}
                />
                <label htmlFor="enableFreeShipping" className="ml-2 block text-sm text-gray-700">
                  Enable Free Shipping
                </label>
              </div>
              
              {shippingSettings.enableFreeShipping && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Shipping Threshold ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: parseFloat(e.target.value)})}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flat Rate Shipping Cost ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={shippingSettings.flatRateShipping}
                  onChange={(e) => setShippingSettings({...shippingSettings, flatRateShipping: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableLocalPickup"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={shippingSettings.enableLocalPickup}
                  onChange={(e) => setShippingSettings({...shippingSettings, enableLocalPickup: e.target.checked})}
                />
                <label htmlFor="enableLocalPickup" className="ml-2 block text-sm text-gray-700">
                  Enable Local Pickup
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Settings