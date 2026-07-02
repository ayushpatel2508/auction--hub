import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowLeft, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import AuctionCard from '../components/auction/AuctionCard'
import { userAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const WonAuctions = () => {
    const { isAuthenticated } = useAuth()
    const [wonAuctions, setWonAuctions] = useState([])
    const [watchlist, setWatchlist] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isAuthenticated) {
            loadData()
        }
    }, [isAuthenticated])

    const loadData = async () => {
        setLoading(true)
        try {
            const [wonRes, watchlistRes] = await Promise.all([
                userAPI.getWonAuctions(),
                userAPI.getWatchlist().catch(() => ({ auctions: [] }))
            ])

            if (wonRes.success) {
                setWonAuctions(wonRes.auctions || [])
            }
            
            if (watchlistRes.auctions) {
                setWatchlist(watchlistRes.auctions.map(a => a.roomId || a._id))
            }
        } catch (error) {
            console.error('Error loading won auctions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleWatchlistToggle = async (roomId) => {
        try {
            const response = await userAPI.toggleWatchlist(roomId)
            if (response.success) {
                setWatchlist(prev => 
                    response.isAdded 
                        ? [...prev, roomId] 
                        : prev.filter(id => id !== roomId)
                )
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center py-12">
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
                        <p className="text-muted-foreground mb-4">
                            Please sign in to view the auctions you have won.
                        </p>
                        <Button asChild>
                            <Link to="/login">Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <h1 className="text-3xl font-bold tracking-tight">Won Auctions</h1>
                    </div>
                    <p className="text-muted-foreground mt-2">
                        View and manage all the auctions you have successfully won!
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/auctions">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Browse More Auctions
                    </Link>
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
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
            ) : wonAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wonAuctions.map((auction) => (
                        <AuctionCard
                            key={auction.roomId || auction._id}
                            auction={auction}
                            isWatched={watchlist.includes(auction.roomId || auction._id)}
                            onWatchlistToggle={handleWatchlistToggle}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-16">
                        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                        <h3 className="text-2xl font-semibold mb-2">No Wins Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            You haven't won any auctions yet. Start bidding on your favorite items to claim your first victory!
                        </p>
                        <Button size="lg" asChild>
                            <Link to="/auctions">
                                <Gavel className="h-5 w-5 mr-2" />
                                Start Bidding
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default WonAuctions
