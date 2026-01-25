import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');
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

    const handleSearch = (term) => {
        if (term.trim()) {
            navigate(`/auctions?search=${encodeURIComponent(term.trim())}`);
        } else {
            navigate('/auctions');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const handleMobileSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(mobileSearchTerm);
        setIsMobileMenuOpen(false); // Close mobile menu after search
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
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <span className="text-2xl font-bold text-gradient">AuctionHub</span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search auctions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input w-full px-5 py-3 rounded-xl border-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 backdrop-blur-sm transition-all duration-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-3 transition-colors text-lg"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                🔍
                            </button>
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">

                        {/* Main Navigation */}
                        <div className="hidden md:flex space-x-6">
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

                        </div>

                        {/* User Section */}
                        <div className="flex items-center space-x-4">
                            {isLoggedIn ? (
                                <>
                                    {/* Logout Button - Desktop Only */}
                                    <button
                                        onClick={handleLogout}
                                        className="hidden md:block btn btn-secondary hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 border"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                /* Login Button */
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

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t-2" style={{ borderTopColor: 'var(--accent-primary)' }}>
                        <div className="px-4 py-4 space-y-4" style={{ background: 'var(--bg-primary)' }}>

                            {/* Mobile Search */}
                            <form onSubmit={handleMobileSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search auctions..."
                                    value={mobileSearchTerm}
                                    onChange={(e) => setMobileSearchTerm(e.target.value)}
                                    className="input w-full px-5 py-3 rounded-xl border-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 backdrop-blur-sm transition-all duration-300"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-3 transition-colors text-lg"
                                    style={{ color: 'var(--accent-primary)' }}
                                >
                                    🔍
                                </button>
                            </form>

                            {/* Mobile Navigation Links */}
                            <div className="space-y-2">
                                <Link
                                    to="/"
                                    onClick={closeMobileMenu}
                                    className="block px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                                    style={{
                                        color: 'var(--text-primary)',
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)'
                                    }}
                                >
                                    🏠 Home
                                </Link>
                                <Link
                                    to="/auctions"
                                    onClick={closeMobileMenu}
                                    className="block px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                                    style={{
                                        color: 'var(--text-primary)',
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-primary)'
                                    }}
                                >
                                    🏛️ Auctions
                                </Link>
                            </div>

                            {/* Mobile User Section */}
                            {isLoggedIn ? (
                                <div className="pt-4 border-t" style={{ borderTopColor: 'var(--border-secondary)' }}>
                                    <div className="mb-3 px-4 py-2 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logged in as:</p>
                                        <p className="font-medium" style={{ color: 'var(--accent-primary)' }}>👤 {user}</p>
                                    </div>
                                    <button
                                        onClick={handleMobileLogout}
                                        className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                                        style={{
                                            background: 'var(--accent-primary)',
                                            color: 'var(--bg-primary)'
                                        }}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t" style={{ borderTopColor: 'var(--border-secondary)' }}>
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="block w-full px-4 py-3 rounded-lg font-medium text-center transition-all duration-300 hover:shadow-md"
                                        style={{
                                            background: 'var(--accent-primary)',
                                            color: 'var(--bg-primary)'
                                        }}
                                    >
                                        🔑 Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;