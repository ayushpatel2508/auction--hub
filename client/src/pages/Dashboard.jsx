import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Gavel, 
    Trophy, 
    History, 
    Settings, 
    User, 
    PlusCircle,
    Clock,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, auctionAPI } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [myAuctions, setMyAuctions] = useState([]);
    const [joinedAuctions, setJoinedAuctions] = useState([]);
    const [wonAuctions, setWonAuctions] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [stats, setStats] = useState({
        totalBids: 0,
        auctionsWon: 0,
        activeBids: 0,
        sellingCount: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [myRes, joinedRes, wonRes, bidsRes] = await Promise.all([
                    userAPI.getMyAuctions(),
                    userAPI.getJoinedAuctions(),
                    userAPI.getWonAuctions(),
                    userAPI.getMyBids()
                ]);

                if (myRes.data.success) setMyAuctions(myRes.data.auctions);
                if (joinedRes.data.success) setJoinedAuctions(joinedRes.data.auctions);
                if (wonRes.data.success) setWonAuctions(wonRes.data.wonAuctions);
                if (bidsRes.data.success) {
                    setMyBids(bidsRes.data.bids);
                    
                    // Simple stats calculation
                    setStats({
                        totalBids: bidsRes.data.bids.length,
                        auctionsWon: wonRes.data.wonAuctions.length,
                        activeBids: joinedRes.data.auctions.length,
                        sellingCount: myRes.data.auctions.length
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    const handleDeleteAuction = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this auction? This cannot be undone.')) return;
        
        try {
            const response = await auctionAPI.deleteAuction(roomId);
            if (response.data.success) {
                toast.success('Auction deleted successfully');
                setMyAuctions(prev => prev.filter(a => a.roomId !== roomId));
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to delete auction');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col gap-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                                <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-background shadow-lg">
                                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter">Hello, {user?.username}</h1>
                            <p className="text-muted-foreground">{user?.email}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant="secondary" className="rounded-lg">Member since 2026</Badge>
                                <Badge variant="outline" className="rounded-lg text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Verified Bidder</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <Link to="/create-auction">
                            <Button className="rounded-2xl gap-2 px-6 py-6 h-auto">
                                <PlusCircle className="h-5 w-5" />
                                <span>New Auction</span>
                            </Button>
                        </Link>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Card className="rounded-[1.5rem] border-none shadow-sm bg-primary/5 hover:bg-primary/10 transition-colors">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-wider text-[10px] font-bold">Total Bids Placed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{stats.totalBids}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border-none shadow-sm bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-wider text-[10px] font-bold text-emerald-600">Auctions Won</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-emerald-600">{stats.auctionsWon}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border-none shadow-sm bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-wider text-[10px] font-bold text-amber-600">Watching / Active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-amber-600">{stats.activeBids}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border-none shadow-sm bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                        <CardHeader className="pb-2">
                            <CardDescription className="uppercase tracking-wider text-[10px] font-bold text-blue-600">Items Selling</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-blue-600">{stats.sellingCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="active" className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <TabsList className="bg-muted/50 p-1 rounded-2xl">
                            <TabsTrigger value="active" className="rounded-xl px-6 py-2 gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Active Bids</span>
                            </TabsTrigger>
                            <TabsTrigger value="my-auctions" className="rounded-xl px-6 py-2 gap-2">
                                <Gavel className="h-4 w-4" />
                                <span>My Auctions</span>
                            </TabsTrigger>
                            <TabsTrigger value="won" className="rounded-xl px-6 py-2 gap-2">
                                <Trophy className="h-4 w-4" />
                                <span>Won Items</span>
                            </TabsTrigger>
                        </TabsList>
                        
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search your activity..." className="pl-9 rounded-xl h-10 border-none bg-muted/50" />
                        </div>
                    </div>

                    <TabsContent value="active" className="mt-0 space-y-4">
                        {joinedAuctions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {joinedAuctions.map((auction) => (
                                    <AuctionDashboardCard key={auction.roomId} auction={auction} type="joined" />
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                icon={<TrendingUp className="h-12 w-12" />}
                                title="No active bids"
                                description="You haven't joined any live auctions yet. Go explore and place your first bid!"
                                action={<Link to="/auctions"><Button className="mt-4 rounded-xl">Explore Auctions</Button></Link>}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="my-auctions" className="mt-0 space-y-4">
                        {myAuctions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myAuctions.map((auction) => (
                                    <AuctionDashboardCard 
                                        key={auction.roomId} 
                                        auction={auction} 
                                        type="owned" 
                                        onDelete={() => handleDeleteAuction(auction.roomId)} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                icon={<PlusCircle className="h-12 w-12" />}
                                title="No auctions created"
                                description="Ready to sell? Create your first auction and start earning today."
                                action={<Link to="/create-auction"><Button className="mt-4 rounded-xl">Create Auction</Button></Link>}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="won" className="mt-0 space-y-4">
                        {wonAuctions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wonAuctions.map((auction) => (
                                    <AuctionDashboardCard key={auction.roomId} auction={auction} type="won" />
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                icon={<Trophy className="h-12 w-12" />}
                                title="No items won yet"
                                description="Don't give up! Your first win is just a bid away."
                                action={<Link to="/auctions"><Button className="mt-4 rounded-xl">Back to Bidding</Button></Link>}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function AuctionDashboardCard({ auction, type, onDelete }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-card border rounded-[1.5rem] overflow-hidden hover:shadow-lg transition-all duration-300"
        >
            <div className="aspect-[16/9] relative overflow-hidden">
                <img 
                    src={auction.imageUrl ? (auction.imageUrl.startsWith('http') ? auction.imageUrl : `http://localhost:5000${auction.imageUrl}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'} 
                    alt={auction.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none">
                        {auction.status === 'active' ? (
                            <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live
                            </span>
                        ) : 'Ended'}
                    </Badge>
                </div>
                {type === 'won' && (
                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                        <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 text-sm font-bold shadow-lg">
                            <Trophy className="mr-2 h-4 w-4" />
                            Winner
                        </Badge>
                    </div>
                )}
            </div>
            
            <div className="p-5">
                <h3 className="font-bold text-lg mb-1 truncate">{auction.productName}</h3>
                <div className="flex items-center text-xs text-muted-foreground gap-1.5 mb-4">
                    <Clock className="h-3.5 w-3.5" />
                    {auction.status === 'active' ? (
                        <span>Ends {formatDistanceToNow(new Date(auction.endTime), { addSuffix: true })}</span>
                    ) : (
                        <span>Ended {formatDistanceToNow(new Date(auction.endTime), { addSuffix: true })}</span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{type === 'won' ? 'Final Price' : 'Current Bid'}</p>
                        <p className={`text-xl font-black ${type === 'won' ? 'text-emerald-600' : 'text-primary'}`}>${auction.currentBid}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {type === 'owned' && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/10 rounded-xl"
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                        )}
                        <Link to={`/auction/${auction.roomId}`}>
                            <Button size="sm" variant={type === 'won' ? 'outline' : 'default'} className="rounded-xl group">
                                {type === 'won' ? 'View Details' : 'Go to Room'}
                                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed text-center px-4">
            <div className="bg-background p-6 rounded-full shadow-sm mb-6 text-muted-foreground">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-2 tracking-tight">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
            {action}
        </div>
    );
}
