import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
    formatCurrency,
    validateBidAmount,
    getMinimumBid
} from '../../lib/utils'
import {
    Gavel,
    Plus,
    DollarSign,
    Zap,
    AlertCircle
} from 'lucide-react'

const BiddingPanel = ({
    auction,
    currentUser,
    onPlaceBid,
    isConnected,
    loading = false
}) => {
    const [bidAmount, setBidAmount] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const minBid = getMinimumBid(auction.currentBid)
    const isAuctionEnded = auction.status === 'ended'
    const isCreator = auction.createdBy === currentUser
    const isHighestBidder = auction.highestBidder === currentUser

    const quickBidAmounts = [
        minBid,
        minBid + 5,
        minBid + 10,
        minBid + 25
    ]

    const handleBidSubmit = async (amount) => {
        if (isSubmitting || !isConnected) return

        const validation = validateBidAmount(amount, auction.currentBid)
        if (!validation.valid) {
            setError(validation.message)
            return
        }

        setError('')
        setIsSubmitting(true)

        try {
            const result = await onPlaceBid(parseFloat(amount))
            if (result && !result.success) {
                throw new Error(result.error)
            }
            setBidAmount('')
        } catch (error) {
            setError(error.message || 'Failed to place bid')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleQuickBid = (amount) => {
        handleBidSubmit(amount)
    }

    const handleCustomBid = (e) => {
        e.preventDefault()
        if (bidAmount) {
            handleBidSubmit(bidAmount)
        }
    }

    const handleBidAmountChange = (e) => {
        setBidAmount(e.target.value)
        if (error) setError('')
    }

    if (isAuctionEnded) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                        <Gavel className="h-5 w-5" />
                        <span>Auction Ended</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-lg font-semibold mb-2">
                            Final Price: {formatCurrency(auction.finalPrice || auction.currentBid)}
                        </p>
                        {auction.winner ? (
                            <p className="text-muted-foreground">
                                Won by <span className="font-medium">{auction.winner}</span>
                            </p>
                        ) : (
                            <p className="text-muted-foreground">No winner</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isCreator) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Gavel className="h-5 w-5" />
                        <span>Your Auction</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                            You cannot bid on your own auction
                        </p>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold">
                                Current Bid: {formatCurrency(auction.currentBid)}
                            </p>
                            {auction.highestBidder && (
                                <p className="text-sm text-muted-foreground">
                                    Leading: {auction.highestBidder}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Gavel className="h-5 w-5" />
                    <span>Place Your Bid</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Connection Status */}
                {!isConnected && (
                    <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                            Connecting to auction...
                        </span>
                    </div>
                )}

                {/* Current Status */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Bid</span>
                        <span className="text-lg font-bold">{formatCurrency(auction.currentBid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Minimum Bid</span>
                        <span className="font-medium text-green-600">{formatCurrency(minBid)}</span>
                    </div>
                    {isHighestBidder && (
                        <Badge variant="success" className="w-full justify-center">
                            You are the highest bidder!
                        </Badge>
                    )}
                </div>

                {/* Quick Bid Buttons */}
                <div>
                    <p className="text-sm font-medium mb-2">Quick Bid</p>
                    <div className="grid grid-cols-2 gap-2">
                        {quickBidAmounts.map((amount) => (
                            <Button
                                key={amount}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickBid(amount)}
                                disabled={!isConnected || isSubmitting}
                                className="flex items-center space-x-1"
                            >
                                <Zap className="h-3 w-3" />
                                <span>{formatCurrency(amount)}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Custom Bid */}
                <div>
                    <p className="text-sm font-medium mb-2">Custom Bid</p>
                    <form onSubmit={handleCustomBid} className="space-y-3">
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                step="0.01"
                                min={minBid}
                                placeholder={`Minimum ${formatCurrency(minBid)}`}
                                value={bidAmount}
                                onChange={handleBidAmountChange}
                                className="pl-10"
                                disabled={!isConnected || isSubmitting}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>{error}</span>
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!isConnected || !bidAmount || isSubmitting}
                            size="lg"
                        >
                            {isSubmitting ? (
                                'Placing Bid...'
                            ) : (
                                <>
                                    <Gavel className="h-4 w-4 mr-2" />
                                    Place Bid
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Bid Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Bids are binding and cannot be retracted</p>
                    <p>• You will be notified if you are outbid</p>
                    <p>• Auction ends automatically at the specified time</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default BiddingPanel