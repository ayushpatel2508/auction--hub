import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Gavel, 
    Clock, 
    Users, 
    ArrowLeft, 
    MessageCircle, 
    TrendingUp, 
    Trophy,
    AlertCircle,
    Info,
    Share2,
    LogOut,
    Plus,
    Minus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { auctionAPI } from '../utils/api';
import { getSocket, disconnectSocket } from '../utils/socket';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function SingleAuctions() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [auction, setAuction] = useState(null);
    const [bidAmount, setBidAmount] = useState(0);
    const [bidHistory, setBidHistory] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [isEnded, setIsEnded] = useState(false);
    const [winner, setWinner] = useState(null);
    
    const socketRef = useRef(null);
    const bidEndRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                const response = await auctionAPI.getAuction(roomId);
                if (response.data.success) {
                    const data = response.data.auction;
                    setAuction(data);
                    setBidAmount(data.currentBid + 10); // Default next bid
                    setBidHistory(data.bidHistory || []);
                    setOnlineUsers(data.onlineUsers || []);
                    setIsEnded(data.status === 'ended');
                    setWinner(data.winner);
                }
            } catch (error) {
                toast.error('Failed to load auction');
                navigate('/auctions');
            } finally {
                setLoading(false);
            }
        };

        fetchAuctionData();
    }, [roomId, navigate]);

    // Socket Setup
    useEffect(() => {
        if (!user || !roomId) return;

        const socket = getSocket();
        socketRef.current = socket;

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('join-auction', { roomId, username: user.username });

        socket.on('bid-update', (data) => {
            setAuction(prev => ({ 
                ...prev, 
                currentBid: data.highestBid, 
                highestBidder: data.highestBidder 
            }));
            
            setBidHistory(prev => [{
                username: data.highestBidder,
                amount: data.highestBid,
                placedAt: new Date().toISOString()
            }, ...prev]);

            if (data.highestBidder === user.username) {
                toast.success('Bid placed successfully!');
            } else {
                toast.info(`${data.highestBidder} placed a new bid: $${data.highestBid}`);
            }
        });

        socket.on('online-users-updated', (data) => {
            setOnlineUsers(data.onlineUsers);
        });

        socket.on('user-joined-notification', (data) => {
            toast.info(data.message);
        });

        socket.on('auction-ended', (data) => {
            setIsEnded(true);
            setWinner(data.winner);
            toast.success('Auction ended!', {
                description: data.winner ? `Winner is ${data.winner}` : 'No winner for this auction.'
            });
        });

        socket.on('error', (msg) => {
            toast.error(msg);
        });

        socket.on('consecutive-bid-error', (data) => {
            toast.warning(data.message);
        });

        return () => {
            socket.emit('leave-auction', { roomId, username: user.username, reason: 'route_change' });
            socket.off('bid-update');
            socket.off('online-users-updated');
            socket.off('user-joined-notification');
            socket.off('auction-ended');
            socket.off('error');
            socket.off('consecutive-bid-error');
        };
    }, [user, roomId]);

    // Countdown Timer
    useEffect(() => {
        if (!auction || isEnded) return;

        const timer = setInterval(() => {
            const end = new Date(auction.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setIsEnded(true);
                clearInterval(timer);
                setTimeLeft('Ended');
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [auction, isEnded]);

    const handlePlaceBid = () => {
        if (!user) return navigate('/login');
        if (bidAmount <= auction.currentBid) {
            return toast.error('Bid must be higher than current bid');
        }

        socketRef.current.emit('place-bid', {
            roomId,
            username: user.username,
            bidAmount: Number(bidAmount)
        });
    };

    const handleQuit = async () => {
        try {
            await auctionAPI.quitAuction(roomId);
            socketRef.current.emit('leave-auction', { 
                roomId, 
                username: user.username, 
                reason: 'manual_quit' 
            });
            navigate('/auctions');
        } catch (error) {
            toast.error('Failed to quit auction');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Entering the bidding floor...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Room Header */}
            <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/auctions')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="hidden sm:block">
                            <h2 className="font-bold truncate max-w-[200px] md:max-w-md">{auction?.productName}</h2>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                                Live Room: {roomId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium">{onlineUsers.length} online</span>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link copied to clipboard');
                        }}>
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                        <Button variant="destructive" size="sm" className="gap-2" onClick={handleQuit}>
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Leave Room</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Left: Product Info & Gallery */}
                <div className="lg:col-span-8 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border bg-card overflow-hidden shadow-sm"
                    >
                        <div className="aspect-video relative overflow-hidden bg-muted">
                            <img 
                                src={auction?.imageUrl ? (auction.imageUrl.startsWith('http') ? auction.imageUrl : `http://localhost:5000${auction.imageUrl}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'} 
                                alt={auction?.productName}
                                className="w-full h-full object-cover"
                            />
                            {isEnded && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <div className="text-center p-8 bg-background/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
                                        <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Auction Ended</h2>
                                        {winner ? (
                                            <div className="space-y-2">
                                                <p className="text-white/80">Winner: <span className="text-primary font-bold">{winner}</span></p>
                                                <p className="text-white/60 text-sm">Winning Bid: <span className="text-white font-bold">${auction.currentBid}</span></p>
                                            </div>
                                        ) : (
                                            <p className="text-white/80">No winner for this auction</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-background/80 backdrop-blur-md text-foreground py-1.5 px-3 border-none flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-mono">{timeLeft}</span>
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tighter mb-2">{auction?.productName}</h1>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auction?.createdBy}`} />
                                            <AvatarFallback>SC</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">Seller: <span className="font-bold text-foreground">{auction?.createdBy}</span></span>
                                        <Badge variant="secondary" className="ml-2">Verified</Badge>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Starting Price</p>
                                    <p className="text-2xl font-bold">${auction?.startingPrice}</p>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    Item Description
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {auction?.description || "This premium item is part of an exclusive auction. High-quality craftsmanship and unique features make this a must-have for serious collectors."}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features/Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <Gavel className="h-5 w-5 text-primary mb-2" />
                            <span className="text-xs text-muted-foreground">Total Bids</span>
                            <span className="text-lg font-bold">{bidHistory.length}</span>
                        </div>
                        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <Users className="h-5 w-5 text-primary mb-2" />
                            <span className="text-xs text-muted-foreground">Participants</span>
                            <span className="text-lg font-bold">{onlineUsers.length}</span>
                        </div>
                        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <TrendingUp className="h-5 w-5 text-primary mb-2" />
                            <span className="text-xs text-muted-foreground">Increment</span>
                            <span className="text-lg font-bold">$10</span>
                        </div>
                        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <Shield className="h-5 w-5 text-primary mb-2" />
                            <span className="text-xs text-muted-foreground">Secure</span>
                            <span className="text-lg font-bold">Yes</span>
                        </div>
                    </div>
                </div>

                {/* Right: Bidding Controls & History */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                    {/* Bidding Panel */}
                    <Card className="rounded-3xl border bg-card shadow-lg overflow-hidden border-primary/20">
                        <div className="bg-primary/5 p-6 border-b border-primary/10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-bold">Current Highest Bid</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-primary">${auction?.currentBid}</span>
                                        <TrendingUp className="h-5 w-5 text-emerald-500 animate-bounce" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="success" className="mb-1">Active</Badge>
                                    <p className="text-[10px] text-muted-foreground">{auction?.highestBidder ? `by ${auction.highestBidder}` : 'No bids yet'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {!isEnded ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-grow">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                                            <Input 
                                                type="number" 
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(Number(e.target.value))}
                                                className="pl-8 h-14 rounded-2xl text-xl font-bold border-2 focus-visible:ring-primary/20"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-6 w-10 rounded-lg"
                                                onClick={() => setBidAmount(prev => prev + 10)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-6 w-10 rounded-lg"
                                                onClick={() => setBidAmount(prev => Math.max(auction.currentBid + 10, prev - 10))}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        {[10, 50, 100].map(val => (
                                            <Button 
                                                key={val}
                                                variant="secondary" 
                                                size="sm" 
                                                className="rounded-xl"
                                                onClick={() => setBidAmount(auction.currentBid + val)}
                                            >
                                                +${val}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button 
                                        className="w-full h-16 text-lg font-black rounded-2xl group relative overflow-hidden shadow-xl shadow-primary/20"
                                        onClick={handlePlaceBid}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            PLACE BID NOW
                                            <Gavel className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary group-hover:scale-105 transition-transform duration-300"></div>
                                    </Button>

                                    <p className="text-[10px] text-center text-muted-foreground italic">
                                        By clicking, you commit to purchasing this item at your bid price.
                                    </p>
                                </>
                            ) : (
                                <div className="py-8 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="font-bold text-lg mb-1">Bidding Closed</h3>
                                    <p className="text-sm text-muted-foreground">This auction has officially ended.</p>
                                    <Link to="/auctions">
                                        <Button variant="link" className="mt-2 text-primary">Browse other auctions</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Live Bid History */}
                    <div className="flex-grow flex flex-col min-h-0 bg-card border rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-primary" />
                                Live Activity
                            </h3>
                            <Badge variant="outline" className="animate-pulse">Live</Badge>
                        </div>
                        
                        <ScrollArea className="flex-grow p-4">
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {bidHistory.length > 0 ? (
                                        bidHistory.map((bid, index) => (
                                            <motion.div 
                                                key={`${bid.username}-${bid.amount}-${index}`}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`flex items-start gap-3 p-3 rounded-2xl ${index === 0 ? 'bg-primary/5 border border-primary/10 shadow-sm' : 'hover:bg-muted/50 transition-colors'}`}
                                            >
                                                <Avatar className="h-8 w-8 mt-0.5 border-2 border-background shadow-sm">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bid.username}`} />
                                                    <AvatarFallback>{bid.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-sm font-bold ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                                                            {bid.username} {bid.username === user?.username && '(You)'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDistanceToNow(new Date(bid.placedAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className={`text-lg font-black ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        Placed a bid of <span className="text-foreground">${bid.amount}</span>
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-sm text-muted-foreground">No bids placed yet. Be the first!</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Simple Shield component
function Shield({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
    );
}

// Card for bidding controls
function Card({ children, className }) {
    return (
        <div className={`bg-card rounded-3xl border ${className}`}>
            {children}
        </div>
    );
}
