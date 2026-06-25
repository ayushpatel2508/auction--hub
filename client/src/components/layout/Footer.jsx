import React from 'react'
import { Link } from 'react-router-dom'
import {
    Gavel,
    Heart,
    Zap,
    Users
} from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-muted/30 border-t mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand Section */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Link to="/" className="flex items-center space-x-2 shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Gavel className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold">AuctionHub</span>
                        </Link>
                        
                        <p className="text-muted-foreground max-w-lg text-sm text-center md:text-left">
                            The world's leading online auction platform. Discover amazing deals,
                            bid on incredible items, and join millions of satisfied buyers and sellers.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="flex items-center space-x-6 shrink-0">
                        <div className="flex items-center space-x-2 text-sm font-medium">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>Real-time Bidding</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm font-medium">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Trusted Community</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                        <span>© {currentYear} AuctionHub. All rights reserved.</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center space-x-1">
                            <span>Made with</span>
                            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                            <span>for auction enthusiasts</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer