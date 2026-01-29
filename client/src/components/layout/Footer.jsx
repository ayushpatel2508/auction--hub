import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Github, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-background border-t">
            <div className="container mx-auto px-4 py-12 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                                <Gavel className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter">
                                BidMaster
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            The world's premier real-time auction platform. Buy and sell unique items with confidence and speed.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Marketplace</h3>
                        <ul className="space-y-2">
                            <li><Link to="/auctions" className="text-sm text-muted-foreground hover:text-primary transition-colors">All Auctions</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Collectibles</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Electronics</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Art & Design</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Safety Center</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community Guidelines</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground text-center md:text-left">
                        © {new Date().getFullYear()} BidMaster Auctions Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            System Operational
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Region:</span>
                            <span className="text-xs font-medium">Global</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
