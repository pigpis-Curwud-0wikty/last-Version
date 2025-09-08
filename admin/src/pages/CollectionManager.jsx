import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// Import components
import AddCollection from "../components/collection/AddCollection";
import ViewCollection from "../components/collection/ViewCollection";
import ListCollection from "../components/collection/ListCollection";

const CollectionManager = ({ token }) => {
  const { collectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState("add");
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);
  const [collections, setCollections] = useState([]);

  // form states for collection
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  // edit collection states
  const [editMode, setEditMode] = useState(false);
  const [editCollectionId, setEditCollectionId] = useState(null);

  // search states for ViewCollection
  const [searchId, setSearchId] = useState(collectionId || "");
  const [searchActive, setSearchActive] = useState(
    searchParams.get("isActive") || ""
  );
  const [searchDeleted, setSearchDeleted] = useState(
    searchParams.get("includeDeleted") || "false"
  );

  // Fetch collections
  const fetchCollections = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/Collection`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cols = res.data?.responseBody?.data || [];
      setCollections(cols);

      console.log(
        "📌 Available collections:",
        cols.map((c) => ({ id: c.id, name: c.name }))
      );
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Error fetching collections");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login again.");
      return;
    }
  }, [token]);

  // Update search states when URL parameters change
  useEffect(() => {
    if (collectionId && !hasInitializedFromUrl) {
      setSearchId(collectionId);

      // Check if we're on the edit page
      if (location.pathname.includes("/edit/")) {
        // Set edit mode
        setEditMode(true);
        setEditCollectionId(Number(collectionId));
        setActiveTab("add");

        // Fetch collection details for editing
        const fetchCollectionDetails = async () => {
          try {
            const res = await axios.get(
              `${backendUrl}/api/Collection/${collectionId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const col = res.data?.responseBody?.data || {};
            setName(col.name || "");
            setDescription(col.description || "");
            setDisplayOrder(col.displayOrder || 1);

            if (col.images?.length > 0) {
              setImages(col.images.filter((img) => !img.isMain));
              setMainImage(col.images.find((img) => img.isMain));
            }
          } catch (error) {
            console.error("Error fetching collection details:", error);
            toast.error("Error fetching collection details");
          }
        };

        fetchCollectionDetails();
      } else if (location.pathname.includes("/view/")) {
        setActiveTab("view");
      }

      setHasInitializedFromUrl(true);
    }
  }, [collectionId, location.pathname, token, hasInitializedFromUrl]);

  // Handle edit collection
  const handleEditCollection = (id) => {
    setEditMode(true);
    setEditCollectionId(id);
    setActiveTab("add");
    navigate(`/collection/edit/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Collection Management</h1>

      <div className="mb-6 flex space-x-4">     
        <button
          className={`px-4 py-2 rounded ${activeTab === "add" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => {
            setActiveTab("add");
            setEditMode(false);
            setEditCollectionId(null);
            navigate("/collection-manager");
          }}
        >
          {editMode ? "Edit Collection" : "Add Collection"}
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "view" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => {
            setActiveTab("view");
            navigate("/collection-manager");
          }}
        >
          View Collection
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "collection-list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => {
            setActiveTab("collection-list");
            navigate("/collection-manager");
          }}
        >
          Collection List
        </button>
      </div>

      {activeTab === "add" && (
        <AddCollection
          token={token}
          editCollectionMode={editMode}
          editCollectionId={editCollectionId}
          fetchCollections={fetchCollections}
          setCollections={setCollections}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === "view" && (
        <ViewCollection
          token={token}
          collectionId={searchId}
          isActive={searchActive}
          includeDeleted={searchDeleted}
        />
      )}

      {activeTab === "collection-list" && (
        <ListCollection
          token={token}
          collections={collections}
          setCollections={setCollections}
          setActiveTab={setActiveTab}
          handleEditCollection={handleEditCollection}
        />
      )}
    </div>
  );
};

export default CollectionManager; 