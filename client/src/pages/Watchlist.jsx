import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Heart, Search } from 'lucide-react'
import AuctionCard from '../components/auction/AuctionCard'
import { userAPI } from '../lib/api'

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadWatchlist()
    }, [])

    const loadWatchlist = async () => {
        try {
            const response = await userAPI.getWatchlist()
            if (response.success) {
                setWatchlist(response.auctions || [])
            }
        } catch (error) {
            console.error('Error loading watchlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFromWatchlist = async (roomId) => {
        try {
            const response = await userAPI.toggleWatchlist(roomId)
            if (response.success) {
                // If it was removed, update local state
                if (!response.watchlist.includes(roomId)) {
                    setWatchlist(current => current.filter(a => a.roomId !== roomId))
                }
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Watchlist</h1>
                <p className="text-muted-foreground">
                    Keep track of auctions you're interested in
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-video bg-muted"></div>
                            <CardContent className="p-4 space-y-3">
                                <div className="h-4 bg-muted rounded"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : watchlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchlist.map((auction) => (
                        <AuctionCard
                            key={auction.roomId}
                            auction={auction}
                            isWatched={true} // Items in watchlist are watched by definition
                            onWatchlistToggle={handleRemoveFromWatchlist}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Your Watchlist is Empty</h3>
                        <p className="text-muted-foreground mb-4">
                            Start adding auctions to your watchlist to keep track of items you're interested in
                        </p>
                        <Button asChild>
                            <Link to="/auctions">
                                <Search className="h-4 w-4 mr-2" />
                                Browse Auctions
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default Watchlist