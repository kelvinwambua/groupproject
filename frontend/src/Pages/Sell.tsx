import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X, Package } from "lucide-react"

export default function SellItem() {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleImageUpload(file: File) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const token = localStorage.getItem('access_token')
      
      const uploadRes = await fetch("http://localhost:8000/api/products/upload", {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")

      setUploadedImageUrl(uploadData.url)
      setImagePreview(URL.createObjectURL(file))
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("Failed to upload image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  function removeImage() {
    setImagePreview(null)
    setUploadedImageUrl(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    if (!uploadedImageUrl) {
      setError("Please upload an image first")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('access_token')

      const productData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
        image_url: uploadedImageUrl,
      }

      const productRes = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      })

      const result = await productRes.json()

      if (!productRes.ok) throw new Error(result.error || "Failed to create product")

      console.log("Product created:", result)
      setSuccess(true)
      
      form.reset()
      setImagePreview(null)
      setUploadedImageUrl(null)

      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Error submitting item:", error)
      setError("Failed to submit item. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Package className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">List Your Product</h1>
          <p className="text-gray-600">Fill in the details to add your item to the marketplace</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Provide accurate information about your product</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <AlertDescription>Product created successfully!</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-center justify-center w-full">
                  {!imagePreview ? (
                    <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        name="image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter product name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your product in detail"
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="0"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !uploadedImageUrl}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}