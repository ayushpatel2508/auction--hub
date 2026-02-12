import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import AuctionCard from '../components/auction/AuctionCard'
import { auctionAPI, userAPI } from '../lib/api'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { debounce, AUCTION_CATEGORIES, SORT_OPTIONS } from '../lib/utils'
import {
    Search,
    Filter,
    SlidersHorizontal,
    Gavel
} from 'lucide-react'

const Auctions = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const { toast } = useToast()
    const { isAuthenticated } = useAuth()

    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
    const [watchlist, setWatchlist] = useState([])
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || 'all',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || ''
    })

    // Debounced search function
    const debouncedSearch = debounce((term) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        setSearchParams(params)
        loadAuctions()
    }, 500)

    useEffect(() => {
        loadData()
    }, [searchParams, isAuthenticated]) // Reload when params or auth changes

    useEffect(() => {
        debouncedSearch(searchTerm)
    }, [searchTerm])

    const loadData = async () => {
        setLoading(true)
        try {
            // Build simple query parameters
            const params = new URLSearchParams()

            // Add search if exists
            if (searchTerm) {
                params.append('search', searchTerm)
            }

            // Add category if not 'all'
            if (selectedCategory && selectedCategory !== 'all') {
                params.append('category', selectedCategory)
            }

            // Add status if not 'all'
            if (filters.status && filters.status !== 'all') {
                params.append('status', filters.status)
            }

            console.log('Loading auctions with params:', params.toString())

            // Make API call
            const auctionResponse = await auctionAPI.getAll(Object.fromEntries(params))
            console.log('Auctions response:', auctionResponse)

            // Set auctions
            setAuctions(auctionResponse.auctions || [])

            // Load watchlist if authenticated
            if (isAuthenticated) {
                try {
                    const watchlistResponse = await userAPI.getWatchlist()
                    if (watchlistResponse.auctions) {
                        const watchlistIds = watchlistResponse.auctions.map(a => a.roomId)
                        setWatchlist(watchlistIds)
                    }
                } catch (error) {
                    console.log('Could not load watchlist:', error)
                }
            }
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error('Error', 'Failed to load auctions. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Handlers kept separate for cleaner diff (loadAuctions replaced by loadData)

    const handleCategoryChange = (category) => {
        console.log('Category changed to:', category)
        setSelectedCategory(category)

        // Update URL
        const params = new URLSearchParams(searchParams)
        if (category !== 'all') {
            params.set('category', category)
        } else {
            params.delete('category')
        }
        setSearchParams(params)

        // Reload data
        loadData()
    }

    const handleSortChange = (sort) => {
        console.log('Sort changed to:', sort)
        setSortBy(sort)

        // Update URL
        const params = new URLSearchParams(searchParams)
        params.set('sort', sort)
        setSearchParams(params)

        // Reload data
        loadData()
    }

    const handleFilterChange = (key, value) => {
        console.log('Filter changed:', key, '=', value)
        setFilters(prev => ({ ...prev, [key]: value }))

        // Update URL
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        setSearchParams(params)

        // Reload data
        loadData()
    }

    // Simplified debounced search usage
    const loadAuctions = loadData

    const handleWatchlistToggle = async (roomId) => {
        if (!isAuthenticated) {
            toast.error('Please login', 'You need to be logged in to modify your watchlist')
            return
        }

        try {
            const response = await userAPI.toggleWatchlist(roomId)
            if (response.success) {
                setWatchlist(response.watchlist)
                const isAdded = response.watchlist.includes(roomId)
                toast.success(isAdded ? 'Added to watchlist' : 'Removed from watchlist')
            }
        } catch (error) {
            toast.error('Error', 'Failed to update watchlist')
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('all')
        setSortBy('newest')
        setFilters({ status: 'all', priceMin: '', priceMax: '' })
        setSearchParams({})
        loadData()
    }

    const activeFiltersCount = [
        searchTerm,
        selectedCategory !== 'all' ? selectedCategory : '',
        filters.status !== 'all' ? filters.status : '',
        filters.priceMin,
        filters.priceMax
    ].filter(Boolean).length

    // Simple client-side sorting
    const getSortedAuctions = () => {
        const sorted = [...auctions]

        if (sortBy === 'oldest') {
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        } else if (sortBy === 'price-low') {
            sorted.sort((a, b) => a.currentBid - b.currentBid)
        } else if (sortBy === 'price-high') {
            sorted.sort((a, b) => b.currentBid - a.currentBid)
        } else if (sortBy === 'ending-soon') {
            sorted.sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
        } else {
            // newest (default)
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }

        return sorted
    }

    const filteredAuctions = getSortedAuctions()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Auctions</h1>
                <p className="text-muted-foreground">
                    Discover amazing deals and bid on incredible items
                </p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search auctions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
                            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
                                <TabsTrigger value="all">All</TabsTrigger>
                                {AUCTION_CATEGORIES.map((category) => (
                                    <TabsTrigger key={category} value={category} className="text-xs">
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        {/* Advanced Filters */}
                        <div className="flex flex-wrap gap-4 items-end">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="ended">Ended</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Min Price</label>
                                <Input
                                    type="number"
                                    placeholder="$0"
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    className="w-24"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Price</label>
                                <Input
                                    type="number"
                                    placeholder="$1000"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    className="w-24"
                                />
                            </div>

                            {/* Sort */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            {activeFiltersCount > 0 && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                    <Badge variant="secondary" className="ml-2">
                                        {activeFiltersCount}
                                    </Badge>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${filteredAuctions.length} auctions found`}
            </p>

            {/* Auctions Grid */}
            {loading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-video bg-muted"></div>
                            <CardContent className="p-4 space-y-3">
                                <div className="h-4 bg-muted rounded"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                                <div className="h-6 bg-muted rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredAuctions.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAuctions.map((auction) => (
                        <AuctionCard
                            key={auction.roomId}
                            auction={auction}
                            onWatchlistToggle={handleWatchlistToggle}
                            isWatched={watchlist.includes(auction.roomId)}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Auctions Found</h3>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search criteria or browse different categories
                        </p>
                        <Button onClick={clearFilters}>Clear All Filters</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default Auctions