import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
    formatCurrency,
    formatTimeRemaining,
    getAuctionStatus,
    getInitials,
    API_BASE_URL
} from '../../lib/utils'
import {
    Clock,
    User,
    Eye,
    Heart,
    Gavel
} from 'lucide-react'

const AuctionCard = ({ auction, onWatchlistToggle, isWatched = false }) => {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(auction.endTime))
    const status = getAuctionStatus(auction)

    useEffect(() => {
        if (status.status === 'ended') return

        const interval = setInterval(() => {
            setTimeRemaining(formatTimeRemaining(auction.endTime))
        }, 1000)

        return () => clearInterval(interval)
    }, [auction.endTime, status.status])

    const handleWatchlistClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onWatchlistToggle?.(auction.roomId)
    }

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <Link to={`/auction/${auction.roomId}`}>
                {/* Image */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                    {auction.imageUrl ? (
                        <img
                            src={auction.imageUrl}
                            alt={auction.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Gavel className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge
                            variant={status.status === 'ended' ? 'destructive' : status.status === 'urgent' ? 'warning' : 'success'}
                            className="shadow-sm"
                        >
                            {status.text}
                        </Badge>
                    </div>

                    {/* Watchlist Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                        onClick={handleWatchlistClick}
                    >
                        <Heart className={`h-4 w-4 ${isWatched ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>

                    {/* Online Users Count */}
                    {auction.onlineUsers && auction.onlineUsers.length > 0 && (
                        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-background/80 rounded-full px-2 py-1">
                            <Eye className="h-3 w-3" />
                            <span className="text-xs font-medium">{auction.onlineUsers.length}</span>
                        </div>
                    )}
                </div>

                <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {auction.title}
                    </h3>

                    {/* Product Name */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {auction.productName}
                    </p>

                    {/* Current Bid */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Current Bid</p>
                            <p className="text-xl font-bold text-primary">
                                {formatCurrency(auction.currentBid)}
                            </p>
                        </div>
                        {auction.highestBidder && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Leading Bidder</p>
                                <div className="flex items-center space-x-1">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">
                                            {getInitials(auction.highestBidder)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{auction.highestBidder}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center space-x-2 mb-3">
                        <Clock className={`h-4 w-4 ${timeRemaining.urgent ? 'text-red-500' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${timeRemaining.urgent ? 'text-red-500' : ''}`}>
                            {timeRemaining.expired ? 'Auction Ended' : `${timeRemaining.text} remaining`}
                        </span>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            by <span className="font-medium">{auction.createdBy}</span>
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    <Button className="w-full" disabled={status.status === 'ended'}>
                        {status.status === 'ended' ? 'Auction Ended' : 'Place Bid'}
                    </Button>
                </CardFooter>
            </Link>
        </Card>
    )
}

export default AuctionCard