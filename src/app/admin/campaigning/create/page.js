
"use client";
import React, { useState, useEffect, } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { LoaderCircle, X } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); 

  // State variables
  const [data, setData] = useState({
    title: "",
    description: "",
    targetAmount: "",
  });
  const [newImages, setNewImages] = useState([]); // Naye upload kiye gaye images
  const [existingImages, setExistingImages] = useState([]); // Database se aayi hui images
  const [deletedImages, setDeletedImages] = useState([]); // Delete ki gayi images ke public IDs
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // ============================================
  // 1. GET API: EDIT MODE MEIN DATA FETCH KARNA
  // ============================================
  useEffect(() => {
    if (!id) return; // Agar id nahi hai to create mode

    const fetchCampaign = async () => {
      setFetchLoading(true);
      try {
        const res = await fetch(`/api/campaign/${id}`);
        const result = await res.json();

        if (result.success && result.campaign) {
          // Data ko form fields mein bharo
          setData({
            title: result.campaign.title,
            description: result.campaign.description,
            targetAmount: result.campaign.targetAmount,
          });
          // Existing images ko set karo
          setExistingImages(result.campaign.media || []);
        } else {
          toast.error(result.message || "Failed to fetch campaign");
        }
      } catch (error) {
        toast.error("Server error while fetching campaign");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  // ============================================
  // 2. FORM HANDLERS
  // ============================================
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  // Existing image delete karna (sirf frontend se hatao, backend delete baad mein hoga)
  const removeExistingImage = (index) => {
    const imgToDelete = existingImages[index];
    // Deleted images ki list mein publicID add karo
    setDeletedImages((prev) => [...prev, imgToDelete.publicID]);
    // Frontend se existing images mein se hatao
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // New image delete karna (jo abhi upload nahi hui)
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = id ? "PATCH" : "POST";
    const api = id ? `/api/campaign/${id}` : "/api/campaign";

    // FormData banayo (files ke liye best hai)
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("targetAmount", data.targetAmount);

    // Naye images ko FormData mein daalo
    newImages.forEach((img) => {
      formData.append("media", img);
    });

    // Delete ki gayi images ke publicIDs bhejo (JSON format mein)
    if (deletedImages.length > 0) {
      formData.append("deletedImages", JSON.stringify(deletedImages));
    }

    try {
      const res = await fetch(api, {
        method,
        body: formData,
        // headers nahi daalna FormData ke saath, browser automatic set karta hai
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);

        // Reset states
        setNewImages([]);
        setDeletedImages([]);

        if (!id) {
          // Create mode: form clear karo
          setData({ title: "", description: "", targetAmount: "" });
          setExistingImages([]);
        } else {
          // Edit mode: updated images set karo
          setExistingImages(result.campaign?.media || []);
        }

        // Redirect karo campaigns list page pe (agar aapka hai)
        setTimeout(() => {
          router.push("/admin/campaigning/campaigns");
        }, 1500);
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 4. UI RENDER
  // ============================================
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 mt-12"><LoaderCircle className="animate-spin w-8 h-8 text-blue-600" /></div>}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 mt-12 ">
        <Toaster position="top-center" />

        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {id ? "Edit Campaign" : "Create Campaign"}
          </h1>
          <p className="text-gray-500 mb-6">
            {id ? "Update your campaign details below" : "Start a new fundraising campaign"}
          </p>

          {fetchLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoaderCircle className="animate-spin w-8 h-8 text-blue-600" />
              <span className="ml-3 text-gray-600">Loading campaign data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Campaign Title *</label>
                <input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  placeholder="e.g., Help John's Medical Treatment"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  placeholder="Explain the purpose, need, and impact of this campaign..."
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Target Amount (₹) *</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={data.targetAmount}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* Image Gallery */}
              <div>
                <label className="block text-gray-700 font-medium mb-3">Campaign Images</label>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Current Images (click × to remove)</p>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={img.url}
                            alt={`Campaign ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(i)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {newImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">New Images to Upload</p>
                    <div className="flex flex-wrap gap-3">
                      {newImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`New ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-blue-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Button */}
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle className="animate-spin w-5 h-5" />
                    {id ? "Updating..." : "Creating..."}
                  </span>
                ) : id ? (
                  "Update Campaign"
                ) : (
                  "Create Campaign"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}