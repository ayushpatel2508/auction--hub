import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
    Gavel,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
    Heart,
    Shield,
    Zap,
    Users,
    ArrowRight,
    Send
} from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const footerSections = {
        company: {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Careers', href: '/careers' },
                { label: 'Press', href: '/press' },
                { label: 'Blog', href: '/blog' },
            ]
        },
        marketplace: {
            title: 'Marketplace',
            links: [
                { label: 'Browse Auctions', href: '/auctions' },
                { label: 'Categories', href: '/categories' },
                { label: 'Sell Your Items', href: '/create-auction' },
                { label: 'Buyer Protection', href: '/buyer-protection' },
            ]
        },
        support: {
            title: 'Support',
            links: [
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Safety Tips', href: '/safety' },
                { label: 'Dispute Resolution', href: '/disputes' },
                { label: 'Community Guidelines', href: '/guidelines' },
            ]
        },
        legal: {
            title: 'Legal',
            links: [
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'Accessibility', href: '/accessibility' },
                { label: 'Licenses', href: '/licenses' },
            ]
        }
    }

    const socialLinks = [
        { icon: Facebook, href: 'https://facebook.com/auctionhub', label: 'Facebook' },
        { icon: Twitter, href: 'https://twitter.com/auctionhub', label: 'Twitter' },
        { icon: Instagram, href: 'https://instagram.com/auctionhub', label: 'Instagram' },
        { icon: Linkedin, href: 'https://linkedin.com/company/auctionhub', label: 'LinkedIn' },
        { icon: Github, href: 'https://github.com/auctionhub', label: 'GitHub' },
    ]

    const features = [
        { icon: Shield, text: 'Secure Transactions' },
        { icon: Zap, text: 'Real-time Bidding' },
        { icon: Users, text: 'Trusted Community' },
    ]

    return (
        <footer className="bg-muted/30 border-t">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-2 space-y-4">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Gavel className="h-5 w-5" />
                                </div>
                                <span className="text-xl font-bold">AuctionHub</span>
                            </Link>

                            <p className="text-muted-foreground max-w-sm">
                                The world's leading online auction platform. Discover amazing deals,
                                bid on incredible items, and join millions of satisfied buyers and sellers.
                            </p>

                            {/* Features */}
                            <div className="space-y-2">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon
                                    return (
                                        <div key={index} className="flex items-center space-x-2 text-sm">
                                            <Icon className="h-4 w-4 text-primary" />
                                            <span className="text-muted-foreground">{feature.text}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Newsletter Signup */}
                            <div className="space-y-2">
                                <h4 className="font-semibold">Stay Updated</h4>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Enter your email"
                                        className="flex-1"
                                    />
                                    <Button size="sm">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Get notified about new auctions and exclusive deals
                                </p>
                            </div>
                        </div>

                        {/* Footer Links */}
                        {Object.entries(footerSections).map(([key, section]) => (
                            <div key={key} className="space-y-4">
                                <h4 className="font-semibold">{section.title}</h4>
                                <ul className="space-y-2">
                                    {section.links.map((link, index) => (
                                        <li key={index}>
                                            <Link
                                                to={link.href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="py-8 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Email Us</p>
                                <p className="text-sm text-muted-foreground">support@auctionhub.com</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Call Us</p>
                                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Visit Us</p>
                                <p className="text-sm text-muted-foreground">123 Auction St, NY 10001</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="py-6 border-t">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        {/* Copyright */}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>© {currentYear} AuctionHub. All rights reserved.</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                                <span>Made with</span>
                                <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                                <span>for auction enthusiasts</span>
                            </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">Follow us:</span>
                            <div className="flex items-center space-x-2">
                                {socialLinks.map((social, index) => {
                                    const Icon = social.icon
                                    return (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-8 w-8 p-0"
                                        >
                                            <a
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={social.label}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="py-6 border-t bg-muted/50 -mx-4 px-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm font-medium">Trusted by over 1 million users worldwide</p>
                        <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
                            <span>🔒 SSL Secured</span>
                            <span>✅ Verified Sellers</span>
                            <span>💳 Secure Payments</span>
                            <span>📞 24/7 Support</span>
                            <span>🛡️ Buyer Protection</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer