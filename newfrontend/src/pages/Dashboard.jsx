import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import AuctionCard from '../components/auction/AuctionCard'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { userAPI } from '../lib/api'
import {
    formatCurrency,
    formatRelativeTime,
    getInitials,
    getAuctionStatus
} from '../lib/utils'
import {
    Plus,
    Gavel,
    Trophy,
    Clock,
    TrendingUp,
    Eye,
    DollarSign,
    Users,
    Calendar,
    Star,
    Heart,
    Settings
} from 'lucide-react'

const Dashboard = () => {
    const { user } = useAuth()
    const { toast } = useToast()

    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        myAuctions: [],
        joinedAuctions: [],
        myBids: [],
        wonAuctions: [],
        stats: {
            totalAuctions: 0,
            totalBids: 0,
            totalWon: 0,
            totalSpent: 0
        }
    })

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        setLoading(true)
        try {
            const [myAuctions, joinedAuctions, myBids, wonAuctions] = await Promise.all([
                userAPI.getMyAuctions().catch(() => ({ auctions: [] })),
                userAPI.getJoinedAuctions().catch(() => ({ auctions: [] })),
                userAPI.getMyBids().catch(() => ({ bids: [] })),
                userAPI.getWonAuctions().catch(() => ({ wonAuctions: [] }))
            ])

            const stats = {
                totalAuctions: myAuctions.auctions?.length || 0,
                totalBids: myBids.bids?.length || 0,
                totalWon: wonAuctions.wonAuctions?.length || 0,
                totalSpent: wonAuctions.wonAuctions?.reduce((sum, auction) => sum + (auction.finalPrice || 0), 0) || 0
            }

            setData({
                myAuctions: myAuctions.auctions || [],
                joinedAuctions: joinedAuctions.auctions || [],
                myBids: myBids.bids || [],
                wonAuctions: wonAuctions.wonAuctions || [],
                stats
            })
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            toast.error('Error', 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'text-primary' }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-muted ${color}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const BidItem = ({ bid }) => {
        const timeAgo = formatRelativeTime(bid.placedAt)

        return (
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                        <p className="font-medium">Bid on Auction #{bid.roomId}</p>
                        <p className="text-sm text-muted-foreground">{timeAgo}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{formatCurrency(bid.amount)}</p>
                    <Badge variant={bid.isWinning ? 'success' : 'secondary'} className="text-xs">
                        {bid.isWinning ? 'Winning' : 'Outbid'}
                    </Badge>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-muted rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                            {getInitials(user)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user}!</h1>
                        <p className="text-muted-foreground">
                            Manage your auctions and track your bidding activity
                        </p>
                    </div>
                </div>

                <Button asChild>
                    <Link to="/create-auction">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Auction
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Gavel}
                    title="My Auctions"
                    value={data.stats.totalAuctions}
                    subtitle="Total created"
                    color="text-blue-600"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Total Bids"
                    value={data.stats.totalBids}
                    subtitle="Bids placed"
                    color="text-green-600"
                />
                <StatCard
                    icon={Trophy}
                    title="Auctions Won"
                    value={data.stats.totalWon}
                    subtitle="Successful bids"
                    color="text-yellow-600"
                />
                <StatCard
                    icon={DollarSign}
                    title="Total Spent"
                    value={formatCurrency(data.stats.totalSpent)}
                    subtitle="On won auctions"
                    color="text-purple-600"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="my-auctions">My Auctions</TabsTrigger>
                    <TabsTrigger value="my-bids">My Bids</TabsTrigger>
                    <TabsTrigger value="won-auctions">Won</TabsTrigger>
                    <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.myBids.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.myBids.slice(0, 5).map((bid, index) => (
                                            <BidItem key={index} bid={bid} />
                                        ))}
                                        {data.myBids.length > 5 && (
                                            <Button variant="outline" size="sm" onClick={() => setActiveTab('my-bids')}>
                                                View All Bids
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No recent bidding activity</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Auctions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Gavel className="h-5 w-5" />
                                    <span>Active Auctions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.myAuctions.filter(a => a.status === 'active').length > 0 ? (
                                    <div className="space-y-3">
                                        {data.myAuctions
                                            .filter(a => a.status === 'active')
                                            .slice(0, 3)
                                            .map((auction) => {
                                                const status = getAuctionStatus(auction)
                                                return (
                                                    <div key={auction.roomId} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{auction.title}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Current: {formatCurrency(auction.currentBid)}
                                                            </p>
                                                        </div>
                                                        <Badge variant={status.status === 'urgent' ? 'warning' : 'success'}>
                                                            {status.text}
                                                        </Badge>
                                                    </div>
                                                )
                                            })}
                                        <Button variant="outline" size="sm" onClick={() => setActiveTab('my-auctions')}>
                                            View All My Auctions
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">No active auctions</p>
                                        <Button size="sm" asChild>
                                            <Link to="/create-auction">Create Your First Auction</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* My Auctions Tab */}
                <TabsContent value="my-auctions" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">My Auctions</h2>
                        <Button asChild>
                            <Link to="/create-auction">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New
                            </Link>
                        </Button>
                    </div>

                    {data.myAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.myAuctions.map((auction) => (
                                <AuctionCard key={auction.roomId} auction={auction} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Auctions Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first auction to start selling items
                                </p>
                                <Button asChild>
                                    <Link to="/create-auction">Create First Auction</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* My Bids Tab */}
                <TabsContent value="my-bids" className="space-y-6">
                    <h2 className="text-2xl font-semibold">My Bids</h2>

                    {data.myBids.length > 0 ? (
                        <div className="space-y-4">
                            {data.myBids.map((bid, index) => (
                                <BidItem key={index} bid={bid} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Bids Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Start bidding on auctions to see your activity here
                                </p>
                                <Button asChild>
                                    <Link to="/auctions">Browse Auctions</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Won Auctions Tab */}
                <TabsContent value="won-auctions" className="space-y-6">
                    <h2 className="text-2xl font-semibold">Won Auctions</h2>

                    {data.wonAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.wonAuctions.map((auction) => (
                                <Card key={auction.roomId}>
                                    <div className="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
                                        {auction.imageUrl ? (
                                            <img
                                                src={auction.imageUrl}
                                                alt={auction.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Gavel className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-3 left-3" variant="success">
                                            <Trophy className="h-3 w-3 mr-1" />
                                            Won
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold mb-2">{auction.title}</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Final Price:</span>
                                                <span className="font-semibold">{formatCurrency(auction.finalPrice)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Won:</span>
                                                <span className="text-sm">{formatRelativeTime(auction.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Won Auctions</h3>
                                <p className="text-muted-foreground mb-4">
                                    Keep bidding to win your first auction!
                                </p>
                                <Button asChild>
                                    <Link to="/auctions">Browse Auctions</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Watchlist Tab */}
                <TabsContent value="watchlist" className="space-y-6">
                    <h2 className="text-2xl font-semibold">Watchlist</h2>

                    <Card>
                        <CardContent className="text-center py-12">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Watchlist Coming Soon</h3>
                            <p className="text-muted-foreground mb-4">
                                Save auctions you're interested in and get notified when they're ending soon
                            </p>
                            <Button asChild>
                                <Link to="/auctions">Browse Auctions</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Dashboard