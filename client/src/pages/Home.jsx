import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, 
    TrendingUp, 
    Gavel, 
    Clock, 
    Users, 
    ArrowRight,
    Shield,
    Zap,
    Trophy
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { auctionAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await auctionAPI.getAllAuctions();
                if (response.data.success) {
                    setAuctions(response.data.auctions.slice(0, 6)); // Show first 6 as featured
                }
            } catch (error) {
                console.error('Error fetching auctions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-primary/5 via-background to-background">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                    >
                        <TrendingUp className="h-4 w-4" />
                        <span>Real-time Bidding Floor is Open</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                    >
                        The Future of <br className="hidden md:block" />
                        <span className="text-primary">Online Auctions</span> is Here
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                    >
                        Experience the thrill of live bidding. Secure, fast, and transparent auctions for unique collectibles and premium assets.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <Link to="/auctions">
                            <Button size="lg" className="px-8 py-7 text-lg rounded-2xl group">
                                Start Bidding
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/create-auction">
                            <Button size="lg" variant="outline" className="px-8 py-7 text-lg rounded-2xl">
                                Become a Seller
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-10 border-t"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">$12M+</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Total Volume</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">50k+</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Active Users</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">150+</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Live Rooms</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">99.9%</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Secure Rate</span>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-0"></div>
            </section>

            {/* Featured Auctions */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Auctions</h2>
                            <p className="text-muted-foreground">Don't miss out on these highly anticipated items.</p>
                        </div>
                        <Link to="/auctions">
                            <Button variant="ghost" className="gap-2 group">
                                View All 
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="rounded-3xl border bg-card p-4 space-y-4 animate-pulse">
                                    <div className="aspect-square rounded-2xl bg-muted"></div>
                                    <div className="h-6 w-2/3 bg-muted rounded"></div>
                                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                                    <div className="flex justify-between pt-4">
                                        <div className="h-8 w-24 bg-muted rounded-full"></div>
                                        <div className="h-8 w-24 bg-muted rounded-full"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            auctions.map((auction) => (
                                <motion.div 
                                    key={auction.roomId}
                                    variants={itemVariants}
                                    className="group relative rounded-3xl border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
                                >
                                    <div className="aspect-[4/3] overflow-hidden relative">
                                        <img 
                                            src={auction.imageUrl ? (auction.imageUrl.startsWith('http') ? auction.imageUrl : `http://localhost:5000${auction.imageUrl}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'} 
                                            alt={auction.productName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none">
                                                {auction.status === 'active' ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                        Live
                                                    </span>
                                                ) : 'Ended'}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-4 right-4">
                                            <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 text-white text-xs font-medium flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {auction.status === 'active' ? (
                                                    <span>Ends in {formatDistanceToNow(new Date(auction.endTime))}</span>
                                                ) : 'Expired'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{auction.productName}</h3>
                                            <Badge variant="outline">{auction.createdBy}</Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                            {auction.description || "No description available for this premium auction item."}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Bid</p>
                                                <p className="text-2xl font-black text-primary">${auction.currentBid}</p>
                                            </div>
                                            <Link to={`/auction/${auction.roomId}`}>
                                                <Button className="rounded-xl px-6 group">
                                                    Bid Now
                                                    <Gavel className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why BidMaster?</h2>
                        <p className="text-lg text-muted-foreground">The most advanced features for a seamless auction experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="p-8 border-none shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Secure Transactions</h3>
                            <p className="text-muted-foreground">Every bid and transaction is protected with military-grade encryption and fraud detection.</p>
                        </Card>
                        <Card className="p-8 border-none shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Real-time Sockets</h3>
                            <p className="text-muted-foreground">Never miss a bid with our high-speed WebSocket infrastructure that updates in milliseconds.</p>
                        </Card>
                        <Card className="p-8 border-none shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Verified Sellers</h3>
                            <p className="text-muted-foreground">Our rigorous verification process ensures that all items listed are authentic and as described.</p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-primary-foreground overflow-hidden relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:40px_40px]"></div>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">Ready to join the action?</h2>
                        <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto relative z-10">Create your account today and start participating in exclusive auctions from around the world.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link to="/register">
                                <Button size="lg" variant="secondary" className="px-10 py-7 text-lg rounded-2xl">
                                    Create Free Account
                                </Button>
                            </Link>
                            <Link to="/auctions">
                                <Button size="lg" variant="ghost" className="px-10 py-7 text-lg rounded-2xl text-white hover:bg-white/10">
                                    Browse Auctions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Simple Card component if shadcn Card is missing
function Card({ children, className }) {
    return (
        <div className={`bg-card rounded-3xl border p-6 ${className}`}>
            {children}
        </div>
    );
}
