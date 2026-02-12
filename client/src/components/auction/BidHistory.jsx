import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { formatCurrency, formatRelativeTime, getInitials } from '../../lib/utils'
import { TrendingUp, Crown } from 'lucide-react'

const BidHistory = ({ bids = [], currentUser, highestBidder, auctionStatus }) => {
    if (!bids.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Bid History</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        No bids placed yet. Be the first to bid!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Bid History</span>
                    <Badge variant="secondary">{bids.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {bids.map((bid, index) => {
                    const isWinning = bid.username === highestBidder && index === 0
                    const isCurrentUser = bid.username === currentUser

                    return (
                        <div
                            key={`${bid.username}-${bid.amount}-${bid.placedAt}`}
                            className={`flex items-center justify-between p-3 rounded-lg border ${isWinning
                                ? 'bg-green-50 border-green-200'
                                : isCurrentUser
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-muted/50'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                            {getInitials(bid.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isWinning && (
                                        <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-sm">
                                            {bid.username}
                                            {isCurrentUser && (
                                                <span className="text-xs text-muted-foreground ml-1">(You)</span>
                                            )}
                                        </span>
                                        {isWinning && (
                                            <Badge variant="success" className="text-xs">
                                                {auctionStatus === 'ended' ? 'Winner' : 'Winning'}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatRelativeTime(bid.placedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`font-bold ${isWinning
                                    ? 'text-green-700'
                                    : isCurrentUser
                                        ? 'text-blue-700'
                                        : 'text-foreground'
                                    }`}>
                                    {formatCurrency(bid.amount)}
                                </p>
                                {index === 0 && (
                                    <p className="text-xs text-muted-foreground">Highest</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

export default BidHistory