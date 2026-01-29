import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-0"></div>
            
            <div className="text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="mb-8 inline-block"
                >
                    <div className="bg-primary/10 p-8 rounded-[3rem] relative">
                        <Gavel className="h-24 w-24 text-primary" />
                        <motion.div 
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-lg"
                        >
                            OUT OF BOUNDS
                        </motion.div>
                    </div>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-8xl font-black tracking-tighter mb-4"
                >
                    404
                </motion.h1>
                
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold mb-6"
                >
                    The hammer has fallen.
                </motion.h2>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-lg mb-10 max-w-md mx-auto"
                >
                    This page has either been sold, expired, or never existed in our catalog. Let's get you back to the bidding floor.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/">
                        <Button size="lg" className="rounded-2xl px-8 gap-2 group">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link to="/auctions">
                        <Button size="lg" variant="outline" className="rounded-2xl px-8 gap-2 group">
                            <Search className="h-4 w-4" />
                            Browse Auctions
                        </Button>
                    </Link>
                </motion.div>
                
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => window.history.back()}
                    className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back to previous page
                </motion.button>
            </div>
        </div>
    );
}
