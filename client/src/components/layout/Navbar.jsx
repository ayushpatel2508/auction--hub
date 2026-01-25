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
                                <img className="text-2xl" src='../../../logo.png' />
                            </div>
                            <span className="text-2xl font-bold text-gradient">AuctionHub</span>
                        </Link>
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
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998] md:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Mobile Side Menu - Slides from RIGHT - FULL SCREEN HEIGHT */}
            <div className={`fixed top-0 right-0 h-screen w-3/5 z-[9999] md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`} style={{ background: 'var(--bg-primary)', border: '2px solid var(--accent-primary)' }}>

                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b-2" style={{ borderBottomColor: 'var(--accent-primary)' }}>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                            background: 'var(--gradient-primary)',
                            boxShadow: '0 3px 12px rgba(210, 105, 30, 0.4)'
                        }}>
                        </div>
                        <span className="text-lg font-bold text-gradient">Menu</span>
                    </div>
                    <button
                        onClick={closeMobileMenu}
                        className="p-2 rounded-lg transition-all duration-300 hover:bg-red-100"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Menu Content - Full Height with Proper Scrolling */}
                <div className="flex flex-col h-full">
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">

                        {/* Navigation Links */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                                Navigation
                            </h3>
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                className="flex items-center space-x-4 px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
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
                                className="flex items-center space-x-4 px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
                                style={{
                                    color: 'var(--text-primary)',
                                    background: 'var(--surface-primary)',
                                    border: '1px solid var(--border-primary)'
                                }}
                            >
                                <img src='../../../logo.png' className="text-2xl" />
                                <span className="text-lg">Auctions</span>
                            </Link>
                        </div>

                        {/* User Section */}
                        <div className="pt-6 border-t" style={{ borderTopColor: 'var(--border-secondary)' }}>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Account
                            </h3>
                            {isLoggedIn ? (
                                <div className="space-y-4">
                                    <div className="px-4 py-4 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logged in as:</p>
                                        <p className="font-medium flex items-center space-x-3 mt-2" style={{ color: 'var(--accent-primary)' }}>
                                            <span className="text-xl">👤</span>
                                            <span className="text-lg">{user}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleMobileLogout}
                                        className="flex items-center space-x-4 w-full px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
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
                                    className="flex items-center space-x-4 w-full px-4 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
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
            </div>
        </nav>
    );
};

export default Navbar;