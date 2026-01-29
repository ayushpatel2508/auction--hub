import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Gavel, 
    Upload, 
    Clock, 
    DollarSign, 
    Type, 
    FileText, 
    Loader2, 
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { auctionAPI } from '../utils/api';
import { toast } from 'sonner';

export default function CreateAuction() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        productName: '',
        description: '',
        startingPrice: '',
        duration: '60' // Default 60 minutes
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error('Image size too large', {
                    description: 'Please select an image smaller than 5MB.'
                });
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.productName || !formData.startingPrice || !formData.duration) {
            return toast.error('Missing required fields');
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('productName', formData.productName);
            data.append('description', formData.description);
            data.append('startingPrice', formData.startingPrice);
            data.append('duration', formData.duration);
            if (image) {
                data.append('image', image);
            }

            const response = await auctionAPI.createAuction(data);
            if (response.data.success) {
                toast.success('Auction created!', {
                    description: 'Your item is now live on the bidding floor.'
                });
                navigate(`/auction/${response.data.auction.roomId}`);
            }
        } catch (error) {
            toast.error('Failed to create auction', {
                description: error.response?.data?.msg || 'An unexpected error occurred.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">List New Item</h1>
                        <p className="text-muted-foreground">Setup your auction room and attract bidders</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="md:col-span-5 space-y-6">
                        <Card className="border-2 border-dashed bg-muted/30 overflow-hidden relative group">
                            <CardContent className="p-0">
                                {imagePreview ? (
                                    <div className="relative aspect-square">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="rounded-full gap-2">
                                                <X className="h-4 w-4" />
                                                Remove Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-muted/50 transition-colors p-8 text-center">
                                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                                            <Upload className="h-8 w-8 text-primary" />
                                        </div>
                                        <span className="font-bold text-lg mb-1">Upload Product Image</span>
                                        <span className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max 5MB)</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}
                            </CardContent>
                        </Card>

                        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                Listing Tips
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                                    Use high-quality photos for better engagement.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                                    Be descriptive about the item condition.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
                                    Set a realistic starting price to attract initial bids.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="md:col-span-7">
                        <Card className="rounded-[2rem] shadow-xl border-none bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Auction Details</CardTitle>
                                <CardDescription>Fill in the specifics of your product</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">Auction Title</Label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="title" 
                                            name="title" 
                                            placeholder="e.g. Rare Vintage Collection Sale" 
                                            className="pl-10 h-12 rounded-xl"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productName" className="text-xs font-bold uppercase tracking-wider">Product Name</Label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="productName" 
                                            name="productName" 
                                            placeholder="e.g. 1964 Fender Stratocaster" 
                                            className="pl-10 h-12 rounded-xl"
                                            value={formData.productName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startingPrice" className="text-xs font-bold uppercase tracking-wider">Starting Price ($)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="startingPrice" 
                                                name="startingPrice" 
                                                type="number" 
                                                placeholder="0.00" 
                                                className="pl-10 h-12 rounded-xl font-bold"
                                                value={formData.startingPrice}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider">Duration (Minutes)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="duration" 
                                                name="duration" 
                                                type="number" 
                                                placeholder="60" 
                                                className="pl-10 h-12 rounded-xl"
                                                value={formData.duration}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">Description</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea 
                                            id="description" 
                                            name="description" 
                                            placeholder="Describe the item's condition, history, and unique features..." 
                                            className="pl-10 min-h-[120px] rounded-xl pt-3"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold group" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Launch Auction
                                            <Gavel className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium">
                                    By launching, you agree to our platform fees and selling terms.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Simple Textarea component if shadcn Textarea is missing
function Textarea({ className, ...props }) {
    return (
        <textarea
            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    )
}
