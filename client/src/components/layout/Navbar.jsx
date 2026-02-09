import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '../../lib/utils'
import {
    Menu,
    X,
    Home,
    Gavel,
    Plus,
    User,
    LogOut,
    Bell,
    Heart,
    Trophy,
    MessageCircle,
    TrendingUp,
    Star,
    ChevronDown
} from 'lucide-react'

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const isActive = (path) => location.pathname === path

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/auctions', label: 'Auctions', icon: Gavel },
        { path: '/categories', label: 'Categories', icon: Star },
    ]

    const userMenuItems = isAuthenticated ? [
        { path: '/dashboard', label: 'Dashboard', icon: User },
        { path: '/watchlist', label: 'Watchlist', icon: Heart },
        { path: '/won-auctions', label: 'Won Auctions', icon: Trophy },
        { path: '/messages', label: 'Messages', icon: MessageCircle },
    ] : []

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Gavel className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold">AuctionHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Desktop Auth Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <Button variant="ghost" size="sm">
                                    <Bell className="h-4 w-4" />
                                    <Badge variant="destructive" className="ml-1 h-2 w-2 p-0">
                                        <span className="sr-only">3 notifications</span>
                                    </Badge>
                                </Button>

                                {/* Create Auction */}
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/create-auction">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Auction
                                    </Link>
                                </Button>

                                {/* User Menu */}
                                <div className="relative group">
                                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{user}</span>
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg dropdown-menu z-50">
                                        <div className="py-1">
                                            {userMenuItems.map((item) => {
                                                const Icon = item.icon
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                )
                                            })}
                                            <hr className="my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent transition-colors w-full text-left"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link to="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-background">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}

                            {isAuthenticated ? (
                                <>
                                    {/* Quick Actions */}
                                    <Link
                                        to="/create-auction"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span>Create Auction</span>
                                    </Link>

                                    {/* User Info */}
                                    <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-md">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <span className="text-sm font-medium">{user}</span>
                                            <p className="text-xs text-muted-foreground">Logged in</p>
                                        </div>
                                    </div>

                                    {/* User Menu Items */}
                                    {userMenuItems.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        )
                                    })}

                                    {/* Logout */}
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2 px-3 py-2">
                                    <Link
                                        to="/login"
                                        className="block w-full text-center py-2 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block w-full text-center py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar