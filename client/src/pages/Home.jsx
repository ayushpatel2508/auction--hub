import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import AuctionCard from '../components/auction/AuctionCard'
import { auctionAPI, adminAPI, userAPI, publicAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
    Gavel,
    TrendingUp,
    Users,
    Clock,
    ArrowRight,
    Sparkles,
    Shield,
    Zap
} from 'lucide-react'

const Home = () => {
    const { isAuthenticated } = useAuth()
    const [featuredAuctions, setFeaturedAuctions] = useState([])
    const [stats, setStats] = useState({ totalAuctions: 0, totalUsers: 0, totalBids: 0 })
    const [watchlist, setWatchlist] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadHomeData()
    }, [isAuthenticated]) // Reload when auth state changes

    const loadHomeData = async () => {
        try {
            // Parallel requests for better performance
            const [auctionsRes, statsRes, watchlistRes] = await Promise.all([
                auctionAPI.getAll({ limit: 3, sort: 'newest' }).catch(() => ({ auctions: [] })),
                // Get real stats from public API (no authentication required)
                publicAPI.getStats().catch(() => ({
                    stats: { totalUsers: 0, totalAuctions: 0, totalBids: 0 }
                })),
                isAuthenticated ? userAPI.getWatchlist().catch(() => ({ auctions: [] })) : Promise.resolve({ auctions: [] })
            ])

            setFeaturedAuctions(auctionsRes.auctions?.slice(0, 3) || [])
            setStats(statsRes.stats || { totalUsers: 0, totalAuctions: 0, totalBids: 0 })

            // Extract roomIds for easier checking
            if (watchlistRes.auctions) {
                setWatchlist(watchlistRes.auctions.map(a => a.roomId))
            }
        } catch (error) {
            console.error('Error loading home data:', error)
            setFeaturedAuctions([])
            setStats({ totalUsers: 0, totalAuctions: 0, totalBids: 0 })
        } finally {
            setLoading(false)
        }
    }

    const handleWatchlistToggle = async (roomId) => {
        if (!isAuthenticated) return // Should probably redirect to login or show toast

        try {
            const response = await userAPI.toggleWatchlist(roomId)
            if (response.success) {
                setWatchlist(response.watchlist)
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error)
        }
    }

    const features = [
        {
            icon: Zap,
            title: 'Real-time Bidding',
            description: 'Experience live auctions with instant bid updates and notifications'
        },
        {
            icon: Shield,
            title: 'Secure Transactions',
            description: 'Your bids and personal information are protected with enterprise-grade security'
        },
        {
            icon: Users,
            title: 'Community Driven',
            description: 'Join thousands of buyers and sellers in our vibrant auction community'
        }
    ]

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-12">
                <div className="space-y-4">
                    <Badge variant="secondary" className="px-4 py-2">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Welcome to the Future of Auctions
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Discover Amazing
                        <span className="text-primary block">Auction Deals</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join live auctions, bid on incredible items, and discover great deals.
                        Start your auction journey today with AuctionHub.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                        <Link to="/auctions">
                            <Gavel className="h-5 w-5 mr-2" />
                            Browse Auctions
                        </Link>
                    </Button>
                    {!isAuthenticated && (
                        <Button variant="outline" size="lg" asChild>
                            <Link to="/register">
                                Get Started Free
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{stats.totalAuctions}+</div>
                        <div className="text-sm text-muted-foreground">Total Auctions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{stats.totalUsers}+</div>
                        <div className="text-sm text-muted-foreground">Registered Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{stats.totalBids}+</div>
                        <div className="text-sm text-muted-foreground">Bids Placed</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="space-y-8">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold">Why Choose AuctionHub?</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Experience the most advanced auction platform with features designed for both buyers and sellers
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <Card key={index} className="text-center">
                                <CardHeader>
                                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </section>

            {/* Featured Auctions */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Recent Auctions</h2>
                        <p className="text-muted-foreground">Discover the latest auctions just added to our platform</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/auctions">
                            View All
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>

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
                ) : featuredAuctions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredAuctions.map((auction) => (
                            <div key={auction.roomId || Math.random()}>
                                <AuctionCard
                                    auction={auction}
                                    isWatched={watchlist.includes(auction.roomId)}
                                    onWatchlistToggle={handleWatchlistToggle}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Auctions Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Be the first to create an auction and start selling!
                            </p>
                            {isAuthenticated && (
                                <Button asChild>
                                    <Link to="/create-auction">Create First Auction</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="text-center space-y-6 py-12 bg-muted/30 rounded-2xl">
                    <h2 className="text-3xl font-bold">Ready to Start Bidding?</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Join thousands of users who trust AuctionHub for their buying and selling needs.
                        Sign up today and get access to exclusive auctions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link to="/register">
                                Create Free Account
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link to="/login">
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </section>
            )}
        </div>
    )
}

export default Home