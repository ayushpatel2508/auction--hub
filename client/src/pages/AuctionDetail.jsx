import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import BiddingPanel from '../components/auction/BiddingPanel'
import BidHistory from '../components/auction/BidHistory'
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
    DollarSign,
    Lock,
    Key,
    LogOut,
    Copy,
    Check
} from 'lucide-react'

const AuctionDetail = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { socket, isConnected, joinRoom, leaveRoom, placeBid } = useSocket()
    const { toast } = useToast()

    const [auction, setAuction] = useState(null)
    const [bidHistory, setBidHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState(null)
    const [isWatched, setIsWatched] = useState(false)
    const [showUnlockScreen, setShowUnlockScreen] = useState(false)
    const [passkeyInput, setPasskeyInput] = useState('')
    const [unlocking, setUnlocking] = useState(false)
    const [isQuitting, setIsQuitting] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [showParticipantsDialog, setShowParticipantsDialog] = useState(false)

    useEffect(() => {
        if (roomId) {
            loadAuction()
        }
    }, [roomId])

    useEffect(() => {
        if (socket && auction && isAuthenticated && isConnected) {
            joinRoom(roomId)

            socket.on('bid-placed', handleBidPlaced)
            socket.on('bid-update', handleBidUpdate)
            socket.on('user-joined-notification', handleUserJoined)
            socket.on('user-quit-auction', handleUserLeft)
            socket.on('auction-joined', handleAuctionJoined)
            socket.on('auction-ended', handleAuctionEnded)
            socket.on('consecutive-bid-error', handleConsecutiveBidError)
            socket.on('error', handleSocketError)

            return () => {
                socket.off('bid-placed')
                socket.off('bid-update')
                socket.off('user-joined-notification')
                socket.off('user-quit-auction')
                socket.off('auction-joined')
                socket.off('auction-ended')
                socket.off('consecutive-bid-error')
                socket.off('error')
                leaveRoom(roomId)
            }
        }
    }, [socket, auction, isAuthenticated, roomId, isConnected])

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
                setTimeRemaining(formatTimeRemaining(response.auction.endTime))
                setShowUnlockScreen(false)
                
                if (isAuthenticated) {
                    try {
                        const watchRes = await userAPI.getWatchlist()
                        if (watchRes.auctions) {
                            setIsWatched(watchRes.auctions.some(a => a.roomId === roomId || a._id === roomId))
                        }
                    } catch (e) {
                        console.error("Failed to load watchlist status", e)
                    }
                }
            }
        } catch (error) {
            console.error('Error loading auction:', error)
            if (error.message.includes('Passkey required') || error.message.includes('Private room')) {
                setShowUnlockScreen(true)
            } else {
                toast.error('Error', 'Failed to load auction details')
                navigate('/auctions')
            }
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
        if (auction && data.joinedUsers) {
            setAuction(prev => ({...prev, joinedUsers: data.joinedUsers}))
        }
    }

    const handleUserLeft = (data) => {
        if (data.showAlert && data.username !== user) {
            toast.info(data.message)
        }
        if (auction && data.joinedUsers) {
            setAuction(prev => ({...prev, joinedUsers: data.joinedUsers}))
        }
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

    const handleWatchlistToggle = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to use watchlist')
            return
        }
        try {
            const response = await userAPI.toggleWatchlist(roomId)
            if (response.success) {
                setIsWatched(response.isAdded)
                toast.success(response.isAdded ? 'Added to watchlist' : 'Removed from watchlist')
            }
        } catch (error) {
            toast.error('Failed to update watchlist')
        }
    }

    const handleShare = () => {
        setShowShareDialog(true)
    }

    const handleCopyLink = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
            toast.success('Link copied to clipboard!')
        } catch (error) {
            // Fallback for older browsers
            try {
                const textField = document.createElement('textarea')
                textField.innerText = url
                document.body.appendChild(textField)
                textField.select()
                document.execCommand('copy')
                textField.remove()
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
                toast.success('Link copied to clipboard!')
            } catch (err) {
                console.error('Failed to copy:', err)
                toast.error('Failed to copy link', 'Please copy it manually from the address bar')
            }
        }
    }

    const handleUnlock = async (e) => {
        e.preventDefault()
        if (!passkeyInput.trim()) return
        
        setUnlocking(true)
        try {
            const response = await auctionAPI.unlockRoom(roomId, passkeyInput.trim())
            if (response.success) {
                toast.success('Room Unlocked!')
                setLoading(true)
                loadAuction() // Reload the auction data now that we have access
            }
        } catch (error) {
            toast.error('Invalid Passkey', 'The passkey you entered is incorrect')
        } finally {
            setUnlocking(false)
        }
    }

    const handleQuitAuction = async () => {
        if (window.confirm("Are you sure you want to permanently exit this auction? All your previous bids will be deleted and you will be removed from the participant list.")) {
            setIsQuitting(true)
            try {
                const response = await auctionAPI.quit(roomId)
                if (response.success) {
                    toast.success("Successfully exited the auction.")
                    navigate('/auctions')
                }
            } catch (error) {
                toast.error("Failed to exit auction", error.message)
                setIsQuitting(false)
            }
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

    if (showUnlockScreen) {
        return (
            <div className="max-w-md mx-auto py-12">
                <Card className="text-center shadow-lg border-primary/20">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Private Auction Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            This is a private auction. You need a passkey from the creator to view or bid on this item.
                        </p>
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Enter passkey"
                                    value={passkeyInput}
                                    onChange={(e) => setPasskeyInput(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 text-center tracking-widest font-mono font-bold uppercase"
                                    disabled={unlocking}
                                    maxLength={8}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={!passkeyInput.trim() || unlocking}>
                                {unlocking ? 'Verifying...' : 'Unlock Room'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
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
    const creatorName = auction.createdBy?.username || auction.createdBy;
    const highestBidderName = auction.highestBidder?.username || auction.highestBidder;
    const winnerName = auction.winner?.username || auction.winner;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/auctions')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Auctions
                </Button>

                <div className="flex items-center space-x-2">
                    {creatorName !== user && auction.status !== 'ended' && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleQuitAuction}
                            disabled={isQuitting}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            {isQuitting ? 'Exiting...' : 'Exit Auction'}
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleWatchlistToggle}>
                        <Heart className={`h-4 w-4 mr-2 ${isWatched ? 'fill-red-500 text-red-500' : ''}`} />
                        {isWatched ? 'Watching' : 'Watch'}
                    </Button>
                    {auction.status !== 'ended' && (
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    )}
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
                        </div>
                    </Card>

                    {/* Auction Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <CardTitle className="text-2xl">{auction.title}</CardTitle>
                                        {auction.isPrivate && (
                                            <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold">
                                                <span>Private</span>
                                                <Lock className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
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

                                <div 
                                    className="text-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                                    onClick={() => setShowParticipantsDialog(true)}
                                >
                                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm text-muted-foreground">Participants</p>
                                    <p className="font-semibold">{auction.joinedUsers?.length || 0}</p>
                                    <p className="text-xs text-primary mt-1">View list</p>
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
                                        {getInitials(creatorName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{creatorName}</p>
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
                        highestBidder={highestBidderName}
                        auctionStatus={auction.status}
                    />
            </div>
            </div>
            {showShareDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md animate-in fade-in zoom-in shadow-xl">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Share2 className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Share Auction</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <p className="text-muted-foreground text-center text-sm">
                                Copy the link below to share this auction room with others.
                            </p>
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={window.location.href}
                                    readOnly
                                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 select-all font-mono"
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={handleCopyLink}
                                    className={`shrink-0 ${isCopied ? 'text-green-500 border-green-500 hover:text-green-600 hover:bg-green-50' : ''}`}
                                >
                                    {isCopied ? (
                                        <Check className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Copy className="h-4 w-4 mr-2" />
                                    )}
                                    {isCopied ? 'Copied' : 'Copy'}
                                </Button>
                            </div>
                            
                            <Button 
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                                onClick={() => setShowShareDialog(false)}
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Participants Dialog */}
            <Dialog open={showParticipantsDialog} onOpenChange={setShowParticipantsDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Joined Participants
                        </DialogTitle>
                        <DialogDescription>
                            Users who have joined this auction room
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-y-auto space-y-4 py-4">
                        {auction.joinedUsers && auction.joinedUsers.length > 0 ? (
                            auction.joinedUsers.map((participantUser, index) => {
                                const pName = participantUser?.username || participantUser;
                                return (
                                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                            {getInitials(pName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{pName}</span>
                                </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p>No participants yet</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AuctionDetail