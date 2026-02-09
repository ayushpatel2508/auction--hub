import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { auctionAPI } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'

const BidTest = ({ roomId }) => {
    const [bidHistory, setBidHistory] = useState([])
    const [auction, setAuction] = useState(null)
    const [bidAmount, setBidAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadData()
    }, [roomId])

    const loadData = async () => {
        try {
            // Load auction details
            const auctionResponse = await auctionAPI.getOne(roomId)
            if (auctionResponse.success) {
                setAuction(auctionResponse.auction)
                setBidHistory(auctionResponse.auction.bidHistory || [])
            }

            // Also load bid history separately
            const bidsResponse = await auctionAPI.getBids(roomId)
            if (Array.isArray(bidsResponse)) {
                setBidHistory(bidsResponse)
            }
        } catch (error) {
            setError('Failed to load auction data: ' + error.message)
        }
    }

    const handlePlaceBid = async () => {
        if (!bidAmount) return

        setLoading(true)
        setError('')

        try {
            const response = await auctionAPI.placeBid(roomId, parseFloat(bidAmount))
            if (response.success) {
                setBidAmount('')
                // Reload data to see the new bid
                await loadData()
            }
        } catch (error) {
            setError('Failed to place bid: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Bid Test Component</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                            {error}
                        </div>
                    )}

                    {auction && (
                        <div className="space-y-2">
                            <p><strong>Auction:</strong> {auction.title}</p>
                            <p><strong>Current Bid:</strong> {formatCurrency(auction.currentBid)}</p>
                            <p><strong>Highest Bidder:</strong> {auction.highestBidder || 'None'}</p>
                            <p><strong>Status:</strong> {auction.status}</p>
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <Input
                            type="number"
                            placeholder="Enter bid amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            onClick={handlePlaceBid}
                            disabled={loading || !bidAmount}
                        >
                            {loading ? 'Placing...' : 'Place Bid'}
                        </Button>
                        <Button variant="outline" onClick={loadData}>
                            Refresh
                        </Button>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Bid History ({bidHistory.length} bids)</h3>
                        {bidHistory.length === 0 ? (
                            <p className="text-gray-500">No bids yet</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {bidHistory.map((bid, index) => (
                                    <div
                                        key={`${bid.username}-${bid.amount}-${bid.placedAt}-${index}`}
                                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                    >
                                        <div>
                                            <span className="font-medium">{bid.username}</span>
                                            {bid.isWinning && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    Winning
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{formatCurrency(bid.amount)}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(bid.placedAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default BidTest