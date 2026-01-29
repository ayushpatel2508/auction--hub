import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    Gavel, 
    Clock, 
    LayoutGrid, 
    List, 
    ChevronDown,
    SearchX,
    TrendingUp,
    Calendar,
    DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { auctionAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Auctions() {
    const [auctions, setAuctions] = useState([]);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await auctionAPI.getAllAuctions();
                if (response.data.success) {
                    setAuctions(response.data.auctions);
                    setFilteredAuctions(response.data.auctions);
                }
            } catch (error) {
                console.error('Error fetching auctions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    useEffect(() => {
        let result = [...auctions];

        // Filter by Search
        if (searchTerm) {
            result = result.filter(a => 
                a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by Tab
        if (activeTab === 'live') {
            result = result.filter(a => a.status === 'active');
        } else if (activeTab === 'ended') {
            result = result.filter(a => a.status === 'ended');
        }

        // Sort
        if (sortBy === 'price-high') {
            result.sort((a, b) => b.currentBid - a.currentBid);
        } else if (sortBy === 'price-low') {
            result.sort((a, b) => a.currentBid - b.currentBid);
        } else if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'ending-soon') {
            result.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        }

        setFilteredAuctions(result);
    }, [searchTerm, activeTab, sortBy, auctions]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col gap-8">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Live Auctions</h1>
                        <p className="text-muted-foreground">Discover and bid on unique items from around the world.</p>
                    </div>
                    
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            type="text" 
                            placeholder="Search by product name or title..." 
                            className="pl-12 py-7 rounded-2xl border-2 focus-visible:ring-primary/20 bg-muted/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="all" className="rounded-lg px-6">All Auctions</TabsTrigger>
                            <TabsTrigger value="live" className="rounded-lg px-6">Live Now</TabsTrigger>
                            <TabsTrigger value="ended" className="rounded-lg px-6">Recently Ended</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="rounded-xl gap-2">
                                    <Filter className="h-4 w-4" />
                                    Sort: {sortBy.replace('-', ' ')}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Sort Auctions By</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Newest First
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('ending-soon')}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Ending Soon
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('price-high')}>
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Highest Price
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('price-low')}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Lowest Price
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center bg-muted/50 rounded-xl p-1 border">
                            <Button 
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                                size="icon" 
                                className="h-9 w-9 rounded-lg"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                                size="icon" 
                                className="h-9 w-9 rounded-lg"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Auction List */}
                {loading ? (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="rounded-3xl border bg-card p-4 space-y-4 animate-pulse">
                                <div className="aspect-square rounded-2xl bg-muted"></div>
                                <div className="h-6 w-2/3 bg-muted rounded"></div>
                                <div className="h-4 w-1/2 bg-muted rounded"></div>
                                <div className="flex justify-between pt-4">
                                    <div className="h-8 w-24 bg-muted rounded-full"></div>
                                    <div className="h-8 w-24 bg-muted rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAuctions.length > 0 ? (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredAuctions.map((auction) => (
                                <motion.div 
                                    key={auction.roomId}
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`group relative rounded-3xl border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden ${
                                        viewMode === 'list' ? 'flex flex-col md:flex-row gap-6 p-4' : ''
                                    }`}
                                >
                                    <div className={`${viewMode === 'list' ? 'md:w-64 h-48 flex-shrink-0' : 'aspect-[4/3]'} overflow-hidden relative rounded-2xl`}>
                                        <img 
                                            src={auction.imageUrl ? (auction.imageUrl.startsWith('http') ? auction.imageUrl : `http://localhost:5000${auction.imageUrl}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'} 
                                            alt={auction.productName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none">
                                                {auction.status === 'active' ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                        Live
                                                    </span>
                                                ) : 'Ended'}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className={`p-4 ${viewMode === 'list' ? 'flex-grow flex flex-col justify-between' : ''}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{auction.productName}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="secondary" className="text-[10px] py-0">{auction.createdBy}</Badge>
                                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {auction.status === 'active' ? (
                                                        <span>Ends in {formatDistanceToNow(new Date(auction.endTime))}</span>
                                                    ) : 'Expired'}
                                                </div>
                                            </div>
                                            {viewMode === 'list' && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {auction.description || "No description provided for this item."}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className={`flex items-center justify-between pt-4 ${viewMode === 'grid' ? 'border-t border-border/50 mt-2' : ''}`}>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Bid</p>
                                                <p className="text-xl font-black text-primary">${auction.currentBid}</p>
                                            </div>
                                            <Link to={`/auction/${auction.roomId}`}>
                                                <Button size="sm" className="rounded-xl px-4 group">
                                                    {auction.status === 'active' ? 'Bid Now' : 'View Result'}
                                                    <Gavel className="ml-2 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed"
                    >
                        <SearchX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">No auctions found</h3>
                        <p className="text-muted-foreground mb-8">Try adjusting your search or filters to find what you're looking for.</p>
                        <Button 
                            variant="outline" 
                            className="rounded-xl"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveTab('all');
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
