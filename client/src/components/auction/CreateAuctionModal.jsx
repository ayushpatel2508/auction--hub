import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { useAuth } from '../../contexts/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { useToast } from '../../hooks/useToast'
import { auctionAPI } from '../../lib/api'
import { AUCTION_CATEGORIES } from '../../lib/utils'
import {
    Upload,
    DollarSign,
    Clock,
    Tag,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle,
    Gavel,
    Lock,
    Copy,
    X
} from 'lucide-react'

const CreateAuctionModal = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { toast } = useToast()
    const { isCreateAuctionOpen, closeCreateAuction } = useModal()

    const [formData, setFormData] = useState({
        title: '',
        productName: '',
        description: '',
        startingPrice: '',
        duration: '60', // minutes
        category: 'Other',
        isPrivate: false
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [createdPasskey, setCreatedPasskey] = useState(null)
    const [createdRoomId, setCreatedRoomId] = useState(null)

    // Reset form when modal opens
    useEffect(() => {
        if (isCreateAuctionOpen) {
            setFormData({
                title: '',
                productName: '',
                description: '',
                startingPrice: '',
                duration: '60',
                category: 'Other',
                isPrivate: false
            })
            setImageFile(null)
            setImagePreview(null)
            setErrors({})
            setCreatedPasskey(null)
            setCreatedRoomId(null)
        }
    }, [isCreateAuctionOpen])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : value
        setFormData(prev => ({ ...prev, [name]: val }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid file type', 'Please select an image file')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large', 'Please select an image smaller than 5MB')
                return
            }

            setImageFile(file)

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
            submitData.append('isPrivate', formData.isPrivate)

            if (imageFile) {
                submitData.append('image', imageFile)
            }

            const response = await auctionAPI.create(submitData)

            if (response.success) {
                toast.success('Auction Created!', 'Your auction is now live and accepting bids.')
                if (response.auction.passkey) {
                    setCreatedPasskey(response.auction.passkey)
                    setCreatedRoomId(response.auction.roomId)
                } else {
                    closeCreateAuction()
                    navigate(`/auction/${response.auction.roomId}`)
                }
            }
        } catch (error) {
            console.error('Error creating auction:', error)
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
        { value: '30', label: '30 min' },
        { value: '60', label: '1 hr' },
        { value: '180', label: '3 hr' },
        { value: '360', label: '6 hr' },
        { value: '720', label: '12 hr' },
        { value: '1440', label: '1 day' },
        { value: '2880', label: '2 days' },
        { value: '4320', label: '3 days' },
        { value: '10080', label: '1 wk' }
    ]

    return (
        <Dialog open={isCreateAuctionOpen} onOpenChange={closeCreateAuction}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
                        <Gavel className="h-6 w-6" />
                        <span>Create New Auction</span>
                    </DialogTitle>
                    <DialogDescription>
                        List your item and start receiving bids from buyers worldwide.
                    </DialogDescription>
                </DialogHeader>

                {createdPasskey ? (
                    <Card className="w-full mt-4">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Private Room Created</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-6 pt-4">
                            <p className="text-muted-foreground">
                                Your private auction is ready. Share this passkey with people you want to invite.
                            </p>
                            
                            <div className="bg-muted p-6 rounded-lg border flex items-center justify-between">
                                <span className="text-3xl font-mono tracking-widest font-bold">
                                    {createdPasskey}
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => {
                                        navigator.clipboard.writeText(createdPasskey)
                                        toast.success('Copied to clipboard!')
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 p-3 rounded text-sm text-left flex gap-2">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>Save this passkey now. It will not be shown again.</p>
                            </div>

                            <Button 
                                className="w-full" 
                                onClick={() => {
                                    closeCreateAuction()
                                    navigate(`/auction/${createdRoomId}`)
                                }}
                            >
                                Enter Auction Room
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardTitle className="flex items-center space-x-2 text-lg">
                                            <Tag className="h-5 w-5" />
                                            <span>Basic Information</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="title" className="text-sm font-medium">Auction Title *</label>
                                            <Input
                                                id="title" name="title"
                                                placeholder="e.g., Vintage Guitar..."
                                                value={formData.title} onChange={handleInputChange}
                                                className={errors.title ? 'border-red-500' : ''} disabled={loading}
                                            />
                                            {errors.title && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.title}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="productName" className="text-sm font-medium">Product Name *</label>
                                            <Input
                                                id="productName" name="productName"
                                                placeholder="e.g., Fender Stratocaster"
                                                value={formData.productName} onChange={handleInputChange}
                                                className={errors.productName ? 'border-red-500' : ''} disabled={loading}
                                            />
                                            {errors.productName && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.productName}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="category" className="text-sm font-medium">Category</label>
                                            <select
                                                id="category" name="category"
                                                value={formData.category} onChange={handleInputChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={loading}
                                            >
                                                {AUCTION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="description" className="text-sm font-medium">Description</label>
                                            <textarea
                                                id="description" name="description" rows={3}
                                                placeholder="Describe your item..."
                                                value={formData.description} onChange={handleInputChange}
                                                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.description ? 'border-red-500' : ''}`} disabled={loading}
                                            />
                                            {errors.description && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.description}</p>}
                                        </div>
                                        
                                        <div 
                                            className="flex items-center space-x-2 pt-2 border-t cursor-pointer select-none"
                                            onClick={() => {
                                                if (!loading) {
                                                    handleInputChange({ target: { name: 'isPrivate', type: 'checkbox', checked: !formData.isPrivate } })
                                                }
                                            }}
                                        >
                                            <input
                                                type="checkbox" id="isPrivate" name="isPrivate"
                                                checked={formData.isPrivate} readOnly
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none" disabled={loading}
                                            />
                                            <div className="space-y-1">
                                                <label htmlFor="isPrivate" className="text-sm font-medium leading-none cursor-pointer">Make this a Private Auction</label>
                                                <p className="text-xs text-muted-foreground">Only users with a passkey can view or join.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                {/* Image Upload */}
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardTitle className="flex items-center space-x-2 text-lg">
                                            <ImageIcon className="h-5 w-5" />
                                            <span>Product Image</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {imagePreview ? (
                                            <div className="space-y-4">
                                                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2">Remove</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm font-medium">Upload product image</p>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" disabled={loading} />
                                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('image-upload').click()} disabled={loading}>Choose File</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Pricing & Duration */}
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardTitle className="flex items-center space-x-2 text-lg">
                                            <DollarSign className="h-5 w-5" />
                                            <span>Pricing & Duration</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="startingPrice" className="text-sm font-medium">Starting Price (USD) *</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="startingPrice" name="startingPrice" type="number" step="0.01" min="0.01"
                                                    placeholder="0.00" value={formData.startingPrice} onChange={handleInputChange}
                                                    className={`pl-10 ${errors.startingPrice ? 'border-red-500' : ''}`} disabled={loading}
                                                />
                                            </div>
                                            {errors.startingPrice && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.startingPrice}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="duration" className="text-sm font-medium">Auction Duration *</label>
                                            <div className="grid grid-cols-3 gap-2 mb-2">
                                                {presetDurations.map((preset) => (
                                                    <Button
                                                        key={preset.value} type="button"
                                                        variant={formData.duration === preset.value ? 'default' : 'outline'}
                                                        size="sm" className="text-xs px-2"
                                                        onClick={() => setFormData(prev => ({ ...prev, duration: preset.value }))}
                                                        disabled={loading}
                                                    >
                                                        {preset.label}
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="duration" name="duration" type="number" min="1" max="10080"
                                                    placeholder="Duration in minutes" value={formData.duration} onChange={handleInputChange}
                                                    className={`pl-10 ${errors.duration ? 'border-red-500' : ''}`} disabled={loading}
                                                />
                                            </div>
                                            {formData.duration && !errors.duration && <p className="text-xs text-muted-foreground text-green-600">Runs for {getDurationText(parseInt(formData.duration))}</p>}
                                            {errors.duration && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.duration}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex space-x-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={closeCreateAuction} disabled={loading} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Creating...' : <><Gavel className="h-4 w-4 mr-2" />Create Auction</>}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default CreateAuctionModal
