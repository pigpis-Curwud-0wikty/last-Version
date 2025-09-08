import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { backendUrl } from "../../App";
import { FaSync } from "react-icons/fa";

const ViewCollection = ({ token, collectionId, isActive, includeDeleted }) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchCollection = useCallback(async () => {
    if (!collectionId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/Collection/${collectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            isActive: isActive?.toString(),
            includeDeleted: includeDeleted?.toString(),
          },
        }
      );

      if (response.status === 200) {
        setCollection(response.data?.responseBody?.data || null);
        setError(null);
      } else {
        setError("Unexpected status code: " + response.status);
      }
    } catch (err) {
      console.error("❌ Error fetching collection:", err);
      if (err.response) {
        console.error("❌ API error response:", err.response.data);
        const status = err.response.status;
        if (status === 404) setError("Collection not found.");
        else if (status === 500) setError("Server error. Try later.");
        else setError(err.response.data?.message || "Error fetching collection.");
      } else {
        setError(err.message || "Network error.");
      } 
    } finally {
      setLoading(false);
    }
  }, [collectionId, isActive, includeDeleted, token]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchCollection();
  };
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      // Turn off auto-refresh
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      setAutoRefresh(false);
    } else {
      // Turn on auto-refresh - refresh every 10 seconds
      const interval = setInterval(() => {
        fetchCollection();
      }, 10000);
      setRefreshInterval(interval);
      setAutoRefresh(true);
    }
  };

  useEffect(() => {
    if (collectionId) fetchCollection();
    
    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [collectionId, isActive, includeDeleted, fetchCollection, refreshInterval]);

  if (!collectionId)
    return <div className="p-4">Enter collection ID to search.</div>;
  if (loading) return <div className="p-4">Loading collection details...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!collection) return <div className="p-4">No collection found.</div>;

  const mainImage = collection.images?.find((img) => img.isMain);

  return (
    <div className="p-4 sm:p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          Collection Details: {collection.name}
        </h2>
        <div className="flex items-center mt-3 md:mt-0 space-x-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm"
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={toggleAutoRefresh}
            className={`px-4 py-2 text-white rounded-md text-sm font-medium transition-colors shadow-sm flex items-center ${autoRefresh ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {autoRefresh ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stop Auto-refresh
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Auto-refresh
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Collection Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">ID:</span>
                <span className="text-gray-800">{collection.id}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">Display Order:</span>
                <span className="text-gray-800">{collection.displayOrder}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${collection.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {collection.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">Created:</span>
                <span className="text-gray-800">{new Date(collection.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">Modified:</span>
                <span className="text-gray-800">{new Date(collection.modifiedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="text-gray-600 font-medium mb-2">Description</h4>
          <p className="text-gray-800">{collection.description || 'No description provided'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Collection Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainImage && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Main Image</h4>
              <div className="bg-gray-100 p-2 rounded-lg inline-block">
                <img
                  src={mainImage.url}
                  alt={collection.name}
                  className="w-full max-w-md h-auto object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              </div>
            </div>
          )}

          {collection.images && collection.images.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">All Images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collection.images.map((img, index) => (
                  <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative group">
                    <img
                      src={img.url}
                      alt={`${collection.name} ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {img.isMain && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products section could be added here in the future */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {autoRefresh ? 'Auto-refreshing every 10 seconds' : 'Click refresh to update data'}
        </p>
      </div>
    </div>
  );
};

export default ViewCollection;