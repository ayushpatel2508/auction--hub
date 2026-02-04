import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { auctionAPI } from '../lib/api'
import { AUCTION_CATEGORIES } from '../lib/utils'
import {
    Upload,
    DollarSign,
    Clock,
    FileText,
    Tag,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle,
    Gavel
} from 'lucide-react'

const CreateAuction = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        title: '',
        productName: '',
        description: '',
        startingPrice: '',
        duration: '60', // minutes
        category: 'Other'
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid file type', 'Please select an image file')
                return
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large', 'Please select an image smaller than 5MB')
                return
            }

            setImageFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => setImagePreview(e.target.result)
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters'
        }

        if (!formData.productName.trim()) {
            newErrors.productName = 'Product name is required'
        } else if (formData.productName.length > 100) {
            newErrors.productName = 'Product name must be less than 100 characters'
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters'
        }

        if (!formData.startingPrice) {
            newErrors.startingPrice = 'Starting price is required'
        } else if (parseFloat(formData.startingPrice) <= 0) {
            newErrors.startingPrice = 'Starting price must be greater than 0'
        } else if (parseFloat(formData.startingPrice) > 1000000) {
            newErrors.startingPrice = 'Starting price must be less than $1,000,000'
        }

        if (!formData.duration) {
            newErrors.duration = 'Duration is required'
        } else if (parseInt(formData.duration) < 1) {
            newErrors.duration = 'Duration must be at least 1 minute'
        } else if (parseInt(formData.duration) > 10080) { // 1 week
            newErrors.duration = 'Duration must be less than 1 week'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            const submitData = new FormData()
            submitData.append('title', formData.title.trim())
            submitData.append('productName', formData.productName.trim())
            submitData.append('description', formData.description.trim())
            submitData.append('startingPrice', formData.startingPrice)
            submitData.append('duration', formData.duration)
            submitData.append('category', formData.category)

            if (imageFile) {
                submitData.append('image', imageFile)
            }

            const response = await auctionAPI.create(submitData)

            if (response.success) {
                toast.success('Auction Created!', 'Your auction is now live and accepting bids.')
                navigate(`/auction/${response.auction.roomId}`)
            }
        } catch (error) {
            console.error('Error creating auction:', error)

            // Handle specific error messages
            if (error.message.includes('upload image')) {
                toast.error('Image Upload Failed', 'Please try uploading a different image or try again.')
            } else {
                toast.error('Failed to create auction', error.message || 'Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const getDurationText = (minutes) => {
        if (minutes < 60) return `${minutes} minutes`
        if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`
        return `${Math.floor(minutes / 1440)} days`
    }

    const presetDurations = [
        { value: '30', label: '30 minutes' },
        { value: '60', label: '1 hour' },
        { value: '180', label: '3 hours' },
        { value: '360', label: '6 hours' },
        { value: '720', label: '12 hours' },
        { value: '1440', label: '1 day' },
        { value: '2880', label: '2 days' },
        { value: '4320', label: '3 days' },
        { value: '10080', label: '1 week' }
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Create New Auction</h1>
                <p className="text-muted-foreground">
                    List your item and start receiving bids from buyers worldwide
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Tag className="h-5 w-5" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                Auction Title *
                            </label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Vintage Guitar in Excellent Condition"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={errors.title ? 'border-red-500' : ''}
                                disabled={loading}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.title}</span>
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formData.title.length}/100 characters
                            </p>
                        </div>

                        {/* Product Name */}
                        <div className="space-y-2">
                            <label htmlFor="productName" className="text-sm font-medium">
                                Product Name *
                            </label>
                            <Input
                                id="productName"
                                name="productName"
                                placeholder="e.g., Fender Stratocaster Electric Guitar"
                                value={formData.productName}
                                onChange={handleInputChange}
                                className={errors.productName ? 'border-red-500' : ''}
                                disabled={loading}
                            />
                            {errors.productName && (
                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.productName}</span>
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label htmlFor="category" className="text-sm font-medium">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={loading}
                            >
                                {AUCTION_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Describe your item's condition, features, and any important details..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.description ? 'border-red-500' : ''
                                    }`}
                                disabled={loading}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.description}</span>
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Image Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ImageIcon className="h-5 w-5" />
                            <span>Product Image</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {imagePreview ? (
                            <div className="space-y-4">
                                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2"
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Image ready for upload
                                </p>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Upload product image</p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={loading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => document.getElementById('image-upload').click()}
                                    disabled={loading}
                                >
                                    Choose File
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pricing & Duration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5" />
                            <span>Pricing & Duration</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Starting Price */}
                        <div className="space-y-2">
                            <label htmlFor="startingPrice" className="text-sm font-medium">
                                Starting Price (USD) *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="startingPrice"
                                    name="startingPrice"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={formData.startingPrice}
                                    onChange={handleInputChange}
                                    className={`pl-10 ${errors.startingPrice ? 'border-red-500' : ''}`}
                                    disabled={loading}
                                />
                            </div>
                            {errors.startingPrice && (
                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.startingPrice}</span>
                                </p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label htmlFor="duration" className="text-sm font-medium">
                                Auction Duration *
                            </label>

                            {/* Preset Duration Buttons */}
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {presetDurations.map((preset) => (
                                    <Button
                                        key={preset.value}
                                        type="button"
                                        variant={formData.duration === preset.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFormData(prev => ({ ...prev, duration: preset.value }))}
                                        disabled={loading}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>

                            {/* Custom Duration Input */}
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="1"
                                    max="10080"
                                    placeholder="Duration in minutes"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className={`pl-10 ${errors.duration ? 'border-red-500' : ''}`}
                                    disabled={loading}
                                />
                            </div>

                            {formData.duration && !errors.duration && (
                                <p className="text-sm text-muted-foreground flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    <span>Auction will run for {getDurationText(parseInt(formData.duration))}</span>
                                </p>
                            )}

                            {errors.duration && (
                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{errors.duration}</span>
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/auctions')}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? (
                            'Creating Auction...'
                        ) : (
                            <>
                                <Gavel className="h-4 w-4 mr-2" />
                                Create Auction
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Terms */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p className="font-medium">Before creating your auction:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Ensure your item description is accurate and complete</li>
                                <li>Set a fair starting price to attract bidders</li>
                                <li>Choose an appropriate duration for your auction</li>
                                <li>You cannot modify the auction once it's created</li>
                                <li>You are responsible for fulfilling the sale if there's a winner</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateAuction