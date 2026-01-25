import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if user is logged in and get user info
    const isLoggedIn = !!user;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            navigate('/login');
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleMobileLogout = async () => {
        try {
            await logout();
            setIsMobileMenuOpen(false);
            navigate('/login');
        } catch (error) {
            setIsMobileMenuOpen(false);
            navigate('/login');
        }
    };

    return (
        <nav className="shadow-lg backdrop-blur-sm border-b-2" style={{
            background: 'var(--bg-primary)',
            borderBottomColor: 'var(--accent-primary)',
            boxShadow: '0 2px 12px rgba(210, 105, 30, 0.15)',
            color: 'var(--text-primary)'
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 3px 12px rgba(210, 105, 30, 0.4)'
                            }}>
                                <img src="/logo.png" alt="AuctionHub Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-2xl font-bold text-gradient">AuctionHub</span>
                        </Link>
                    </div>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="relative px-4 py-2 font-medium transition-colors duration-300 hover:text-orange-600 group"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Home
                            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                        </Link>
                        <Link
                            to="/auctions"
                            className="relative px-4 py-2 font-medium transition-colors duration-300 hover:text-orange-600 group"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Auctions
                            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                        </Link>

                        {/* Login/Logout Button */}
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 border"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="btn btn-primary hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg transition-all duration-300"
                            style={{
                                color: 'var(--text-primary)',
                                background: isMobileMenuOpen ? 'var(--surface-hover)' : 'transparent'
                            }}
                        >
                            <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={closeMobileMenu}
                    ></div>

                    {/* Sidebar */}
                    <div className="fixed top-0 right-0 w-80 h-full z-50 md:hidden transform transition-transform duration-300"
                        style={{
                            background: 'var(--bg-primary)',
                            boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.2)'
                        }}>

                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-6 border-b-2" style={{ borderBottomColor: 'var(--accent-primary)' }}>
                            <span className="text-lg font-bold text-gradient">Menu</span>
                            <button
                                onClick={closeMobileMenu}
                                className="p-2 rounded-lg transition-all duration-300"
                                style={{
                                    color: 'var(--text-primary)',
                                    background: 'var(--surface-hover)'
                                }}
                            >
                                <span className="text-xl">✕</span>
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="p-6 space-y-6">
                            {/* Navigation Links */}
                            <div className="space-y-4">
                                <Link
                                    to="/"
                                    onClick={closeMobileMenu}
                                    className="block w-full px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md text-center"
                                    style={{
                                        color: 'var(--text-primary)',
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)'
                                    }}
                                >
                                    <span className="text-lg">Home</span>
                                </Link>
                                <Link
                                    to="/auctions"
                                    onClick={closeMobileMenu}
                                    className="block w-full px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md text-center"
                                    style={{
                                        color: 'var(--text-primary)',
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)'
                                    }}
                                >
                                    <span className="text-lg">Auctions</span>
                                </Link>
                            </div>

                            {/* Login/Logout Section */}
                            <div className="pt-6 border-t" style={{ borderTopColor: 'var(--border-secondary)' }}>
                                {isLoggedIn ? (
                                    <div className="space-y-4">
                                        <div className="px-4 py-4 rounded-lg text-center" style={{ background: 'var(--surface-hover)' }}>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logged in as:</p>
                                            <p className="font-medium mt-2" style={{ color: 'var(--accent-primary)' }}>
                                                <span className="text-lg">{user}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleMobileLogout}
                                            className="w-full px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                                            style={{
                                                background: 'var(--accent-primary)',
                                                color: 'var(--bg-primary)'
                                            }}
                                        >
                                            <span className="text-lg">Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="block w-full px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md text-center"
                                        style={{
                                            background: 'var(--accent-primary)',
                                            color: 'var(--bg-primary)'
                                        }}
                                    >
                                        <span className="text-lg">Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;