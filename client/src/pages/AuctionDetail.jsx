import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import BiddingPanel from '../components/auction/BiddingPanel'
import BidHistory from '../components/auction/BidHistory'
import BidTest from '../components/auction/BidTest'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { auctionAPI, userAPI } from '../lib/api'
import {
    formatCurrency,
    formatTimeRemaining,
    getAuctionStatus,
    getInitials,
    formatRelativeTime
} from '../lib/utils'
import {
    ArrowLeft,
    Clock,
    User,
    Eye,
    Share2,
    Flag,
    Heart,
    Gavel,
    Users,
    Calendar,
    DollarSign
} from 'lucide-react'

const AuctionDetail = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { socket, isConnected, joinRoom, leaveRoom, placeBid } = useSocket()
    const { toast } = useToast()

    const [auction, setAuction] = useState(null)
    const [bidHistory, setBidHistory] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState(null)
    const [isWatched, setIsWatched] = useState(false)

    useEffect(() => {
        if (roomId) {
            loadAuction()
        }
    }, [roomId])

    useEffect(() => {
        if (socket && auction && isAuthenticated) {
            joinRoom(roomId)

            // Socket event listeners - using correct event names from backend
            socket.on('bid-placed', handleBidPlaced)
            socket.on('bid-update', handleBidUpdate) // Backend emits this event
            socket.on('user-joined-notification', handleUserJoined)
            socket.on('user-quit-auction', handleUserLeft)
            socket.on('online-users-updated', handleOnlineUsersUpdate)
            socket.on('auction-joined', handleAuctionJoined)
            socket.on('auction-ended', handleAuctionEnded)
            socket.on('consecutive-bid-error', handleConsecutiveBidError)
            socket.on('error', handleSocketError)

            return () => {
                socket.off('bid-placed')
                socket.off('bid-update')
                socket.off('user-joined-notification')
                socket.off('user-quit-auction')
                socket.off('online-users-updated')
                socket.off('auction-joined')
                socket.off('auction-ended')
                socket.off('consecutive-bid-error')
                socket.off('error')
                leaveRoom(roomId)
            }
        }
    }, [socket, auction, isAuthenticated, roomId])

    useEffect(() => {
        if (auction) {
            const interval = setInterval(() => {
                setTimeRemaining(formatTimeRemaining(auction.endTime))
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [auction])

    const loadAuction = async () => {
        try {
            const response = await auctionAPI.getOne(roomId)
            if (response.success) {
                setAuction(response.auction)
                setBidHistory(response.auction.bidHistory || [])
                setOnlineUsers(response.auction.onlineUsers || [])
                setTimeRemaining(formatTimeRemaining(response.auction.endTime))
            }
        } catch (error) {
            console.error('Error loading auction:', error)
            toast.error('Error', 'Failed to load auction details')
            navigate('/auctions')
        } finally {
            setLoading(false)
        }
    }

    const handleBidPlaced = (data) => {
        if (data.roomId === roomId) {
            setAuction(prev => ({
                ...prev,
                currentBid: data.amount,
                highestBidder: data.username
            }))

            setBidHistory(prev => [data, ...prev])

            if (data.username !== user) {
                toast.success('New Bid!', `${data.username} bid ${formatCurrency(data.amount)}`)
            }
        }
    }

    const handleBidUpdate = (data) => {
        // Handle bid updates from socket
        setAuction(prev => ({
            ...prev,
            currentBid: data.highestBid,
            highestBidder: data.highestBidder
        }))

        // Refresh bid history after bid update
        refreshBidHistory()

        if (data.highestBidder !== user) {
            toast.success('New Bid!', `${data.highestBidder} bid ${formatCurrency(data.highestBid)}`)
        }
    }

    const handleUserJoined = (data) => {
        if (data.username !== user) {
            toast.success(`${data.username} joined the auction`)
        }
    }

    const handleUserLeft = (data) => {
        if (data.showAlert && data.username !== user) {
            toast.info(data.message)
        }
        setOnlineUsers(data.onlineUsers || [])
    }

    const handleOnlineUsersUpdate = (data) => {
        setOnlineUsers(data.onlineUsers || [])
    }

    const handleAuctionJoined = (message) => {
        console.log('Joined auction:', message)
    }

    const handleAuctionEnded = (data) => {
        if (data.roomId === roomId) {
            setAuction(prev => ({
                ...prev,
                status: 'ended',
                winner: data.winner,
                finalPrice: data.finalPrice
            }))

            toast.success('Auction Ended!', `Winner: ${data.winner || 'No winner'}`)
        }
    }

    const handleConsecutiveBidError = (data) => {
        toast.error('Consecutive Bid Error', data.message)
    }

    const handleSocketError = (error) => {
        toast.error('Socket Error', error)
    }

    const refreshBidHistory = async () => {
        try {
            const historyResponse = await auctionAPI.getBids(roomId)
            if (Array.isArray(historyResponse)) {
                setBidHistory(historyResponse)
            }
        } catch (error) {
            console.error("Failed to refresh bid history:", error)
        }
    }

    const handlePlaceBid = async (amount) => {
        if (!isConnected || !socket) {
            throw new Error('Not connected to auction')
        }

        const result = await placeBid(roomId, amount)
        if (result && result.success) {
            // Refresh bid history immediately after successful bid
            await refreshBidHistory()
            toast.success('Bid placed successfully!')
        } else {
            throw new Error(result.error || 'Failed to place bid')
        }
        return result
    }

    const handleWatchlistToggle = () => {
        setIsWatched(!isWatched)
        toast.success(isWatched ? 'Removed from watchlist' : 'Added to watchlist')
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: auction.title,
                text: `Check out this auction: ${auction.title}`,
                url: window.location.href
            })
        } catch (error) {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="aspect-video bg-muted rounded-lg"></div>
                            <div className="h-32 bg-muted rounded-lg"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 bg-muted rounded-lg"></div>
                            <div className="h-48 bg-muted rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!auction) {
        return (
            <div className="text-center py-12">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Auction Not Found</h2>
                <p className="text-muted-foreground mb-4">
                    The auction you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate('/auctions')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Auctions
                </Button>
            </div>
        )
    }

    const status = getAuctionStatus(auction)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/auctions')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Auctions
                </Button>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleWatchlistToggle}>
                        <Heart className={`h-4 w-4 mr-2 ${isWatched ? 'fill-red-500 text-red-500' : ''}`} />
                        {isWatched ? 'Watching' : 'Watch'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Auction Image */}
                    <Card>
                        <div className="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
                            {auction.imageUrl ? (
                                <img
                                    src={auction.imageUrl}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                    <Gavel className="h-16 w-16 text-muted-foreground" />
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <Badge
                                    variant={status.status === 'ended' ? 'destructive' : status.status === 'urgent' ? 'warning' : 'success'}
                                    className="shadow-sm"
                                >
                                    {status.text}
                                </Badge>
                            </div>

                            {/* Online Users */}
                            {onlineUsers.length > 0 && (
                                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-background/90 rounded-full px-3 py-1">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-sm font-medium">{onlineUsers.length}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Auction Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl">{auction.title}</CardTitle>
                                    <p className="text-lg text-muted-foreground">{auction.productName}</p>
                                </div>

                                {timeRemaining && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Time Remaining</p>
                                        <p className={`text-lg font-bold ${timeRemaining.urgent ? 'text-red-500' : ''}`}>
                                            {timeRemaining.expired ? 'Ended' : timeRemaining.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Description */}
                            {auction.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-muted-foreground">{auction.description}</p>
                                </div>
                            )}

                            {/* Auction Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm text-muted-foreground">Starting Price</p>
                                    <p className="font-semibold">{formatCurrency(auction.startingPrice)}</p>
                                </div>

                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p className="font-semibold">{formatRelativeTime(auction.createdAt)}</p>
                                </div>

                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm text-muted-foreground">Participants</p>
                                    <p className="font-semibold">{auction.joinedUsers?.length || 0}</p>
                                </div>

                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <Gavel className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm text-muted-foreground">Total Bids</p>
                                    <p className="font-semibold">{bidHistory.length}</p>
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                                <Avatar>
                                    <AvatarFallback>
                                        {getInitials(auction.createdBy)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{auction.createdBy}</p>
                                    <p className="text-sm text-muted-foreground">Auction Creator</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Bidding Panel */}
                    <BiddingPanel
                        auction={auction}
                        currentUser={user}
                        onPlaceBid={handlePlaceBid}
                        isConnected={isConnected}
                        loading={loading}
                    />

                    {/* Bid History */}
                    <BidHistory
                        bids={bidHistory}
                        currentUser={user}
                        highestBidder={auction.highestBidder}
                    />

                    {/* Test Component - Remove this in production */}
                    <BidTest roomId={roomId} />

                    {/* Online Users */}
                    {onlineUsers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Online Users</span>
                                    <Badge variant="secondary">{onlineUsers.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {onlineUsers.map((username) => (
                                        <div key={username} className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(username)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{username}</span>
                                            {username === user && (
                                                <Badge variant="outline" className="text-xs">You</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuctionDetail