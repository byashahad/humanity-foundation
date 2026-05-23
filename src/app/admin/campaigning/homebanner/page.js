"use client"

import { useState } from "react"
import { ImagePlus, Loader2 } from "lucide-react"

const Page = () => {
    const [title, setTitle] = useState("")
    const [images, setImages] = useState([])
    const [preview, setPreview] = useState([])
    const [loading, setLoading] = useState(false)

    const handleImages = (e) => {
        const files = Array.from(e.target.files)

        setImages(files)

        const previewUrls = files.map((file) => URL.createObjectURL(file))
        setPreview(previewUrls)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)

            const formdata = new FormData()

            formdata.append("title", title)

            for (const image of images) {
                formdata.append("media", image)
            }

            const res = await fetch("/api/hero", {
                method: "POST",
                body: formdata,
            })

            const data = await res.json()

            if (data.success) {
                alert("Hero Created Successfully ✅")

                setTitle("")
                setImages([])
                setPreview([])
            } else {
                alert(data.error)
            }

        } catch (error) {
            console.log(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 md:p-8">

                <h1 className="text-3xl font-bold text-center mb-8">
                    Home Banner Upload
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Banner Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter banner title"
                            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Upload Images
                        </label>

                        <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">

                            <ImagePlus className="w-12 h-12 text-gray-400 mb-3" />

                            <p className="text-gray-600 font-medium">
                                Click to upload multiple images
                            </p>

                            <span className="text-sm text-gray-400 mt-1">
                                PNG, JPG, WEBP
                            </span>

                            <input
                                type="file"
                                multiple
                                hidden
                                onChange={handleImages}
                            />
                        </label>
                    </div>

                    {/* Preview Images */}
                    {preview.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {preview.map((img, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden rounded-xl border"
                                >
                                    <img
                                        src={img}
                                        alt="preview"
                                        className="w-full h-32 object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Uploading...
                            </>
                        ) : (
                            "Submit Banner"
                        )}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default Page