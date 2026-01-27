import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auctionAPI, userAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import CreateAuction from '../components/CreateAuction';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [joinedAuctions, setJoinedAuctions] = useState([]);
    const [createdAuctions, setCreatedAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllJoined, setShowAllJoined] = useState(false);
    const [showAllCreated, setShowAllCreated] = useState(false);

    // Override body background for warm theme
    useEffect(() => {
        const originalBackground = document.body.style.background;
        document.body.style.background = 'var(--bg-primary)';

        // Cleanup: restore original background when component unmounts
        return () => {
            document.body.style.background = originalBackground;
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserAuctions();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]); // Remove fetchUserAuctions from dependencies

    const fetchUserAuctions = async () => {
        try {
            setLoading(true);

            const [joinedRes, createdRes] = await Promise.all([
                userAPI.getJoinedAuctions(),
                userAPI.getMyAuctions()
            ]);

            // Sort by newest first (createdAt descending)
            const sortedJoined = (joinedRes.data.auctions || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            const sortedCreated = (createdRes.data.auctions || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setJoinedAuctions(sortedJoined);
            setCreatedAuctions(sortedCreated);

        } catch (error) {
            // Error fetching user auctions
        } finally {
            setLoading(false);
        }
    };

    const handleQuit = async (roomId) => {
        try {
            const ypos = window.scrollY

            const res = await auctionAPI.quitAuction(roomId)

            // Remove from local state instead of refetching (better UX)
            setJoinedAuctions(prev => prev.filter(auction => auction.roomId !== roomId))

            window.scrollTo(0, ypos)
        }
        catch (err) {
            alert("Failed to quit auction")
        }
    }

    const handleDelete = async (roomId) => {
        try {
            const ypos = window.scrollY

            const res = await auctionAPI.endAuction(roomId)

            // Remove from local state
            setCreatedAuctions(prev => prev.filter(auction => auction.roomId !== roomId))

            window.scrollTo(0, ypos)
        }
        catch (err) {
            alert("Failed to delete auction")
        }
    }

    const formatTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const timeDiff = Math.max(0, Math.floor((end - now) / 1000));

        if (timeDiff <= 0) return "Ended";

        const hours = Math.floor(timeDiff / 3600);
        const minutes = Math.floor((timeDiff % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m left`;
        } else if (minutes > 0) {
            return `${minutes}m left`;
        } else {
            return `${timeDiff}s left`;
        }
    };



    const AuctionCard = ({ auction, cardType = "joined" }) => (
        <div className="card p-6 hover:transform hover:scale-[1.02] transition-all duration-300 rounded-xl border-2 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{auction.title}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${auction.status === 'active'
                    ? 'status-warning'
                    : 'status-ended'
                    } border-2`}>
                    {auction.status === 'active' ? '🟢 Active' : '🔴 Ended'}
                </div>
            </div>

            <p className="mb-6 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {auction.description || 'No description provided'}
            </p>

            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg p-3 border min-w-[100px] h-[80px] flex flex-col justify-center items-center" style={{ background: 'rgba(255, 255, 255, 0.8)', borderColor: 'var(--border-secondary)' }}>
                        <p className="text-xs text-gray-500 mb-1">
                            {auction.status === 'active' ? 'Current Bid' : 'Final Bid'}
                        </p>
                        <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>${auction.currentBid}</p>
                    </div>
                    <div className="rounded-lg p-3 border min-w-[100px] h-[80px] flex flex-col justify-center items-center" style={{ background: 'rgba(255, 255, 255, 0.8)', borderColor: 'var(--border-secondary)' }}>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className={`text-sm font-medium ${auction.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                            {auction.status === 'active' ? formatTimeLeft(auction.endTime) : 'Ended'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{
                        background: 'var(--gradient-primary)'
                    }}>
                        {auction.createdBy.charAt(0).toUpperCase()}
                    </div> */}
                    <span className="text-sm text-black">Created by</span>
                    <span className="text-sm text-gray-600 font-medium">{auction.createdBy}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                    {cardType === "created" ? (
                        // For created auctions
                        auction.status === 'active' ? (
                            <button
                                onClick={() => handleDelete(auction.roomId)}
                                className="btn btn-error w-full text-sm"
                            >

                                Delete Auction
                            </button>
                        ) : (
                            <div className="rounded-lg p-3 text-center" style={{
                                background: 'var(--accent-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '8px'
                            }}>
                                <span className="rounded-lg font-medium text-sm text-white">
                                    {auction.winner ? ` Won by: ${auction.winner}` : ' No winner'}
                                </span>
                            </div>
                        )
                    ) : (
                        // For joined auctions
                        auction.status === 'active' ? (
                            <button
                                onClick={() => handleQuit(auction.roomId)}
                                className="btn btn-warning w-full text-sm"
                            >
                                Quit Auction
                            </button>
                        ) : (
                            <div className="rounded-lg p-3 text-center" style={{
                                background: 'var(--accent-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '8px'
                            }}>
                                <span className="rounded-lg font-medium text-sm text-white">
                                    {auction.winner === user ? '🏆 You Won!' :
                                        auction.winner ? ` Won by: ${auction.winner}` :
                                            ' Ended - No Winner'}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>

            <button
                onClick={() => navigate(`/auction/${auction.roomId}`)}
                className={`btn w-full ${auction.status === 'active' ? 'btn-primary' : ''}`}
                style={auction.status !== 'active' ? { background: 'var(--accent-secondary)', color: 'white' } : {}}
            >
                {auction.status === 'active' ? 'View Auction' : 'View Results'}
            </button>
        </div>

    );

    if (!isAuthenticated) {
        return (
            <div style={{
                background: 'var(--bg-primary)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="card p-12 text-center max-w-lg mx-auto rounded-xl border-2 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{
                        background: 'var(--gradient-primary)',
                        boxShadow: '0 3px 12px rgba(210, 105, 30, 0.4)'
                    }}>
                        <span className="text-4xl">🏛️</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                        Welcome to MyAuction
                    </h1>
                    <p className="text-xl mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Join the excitement of live bidding! Please log in to view your auctions and participate in real-time bidding.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary text-lg px-8 py-4 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <span>🚀</span>
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{
                background: 'var(--bg-primary)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-6" style={{
                        borderColor: 'rgba(210, 105, 30, 0.3)',
                        borderTopColor: 'var(--accent-primary)'
                    }}></div>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading your auctions...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--bg-primary)',
            minHeight: '100vh',
            color: 'var(--text-primary)',
            width: '100%'
        }}>
            <div className="container background: 'var(--bg-primary)', mx-auto px-6 py-12" style={{
                background: 'transparent'
            }}>
                {/* Welcome Section */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-6">

                        <div className="text-left">
                            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                Welcome back, <span className="text-gradient">{user}</span>!
                            </h1>
                            <p className="text-xl mt-2" style={{ color: 'var(--text-secondary)' }}>
                                Manage your auctions and continue bidding
                            </p>
                        </div>
                    </div>
                </div>

                {/* Joined Auctions Section */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Joined Auctions ({joinedAuctions.length})
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Active auctions + past month results</p>
                        </div>
                        <button
                            onClick={() => navigate('/auctions')}
                            className="btn btn-secondary px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium hover:bg-orange-100 flex items-center gap-2"
                        >
                            Browse All Auctions
                        </button>
                    </div>

                    {joinedAuctions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {joinedAuctions.slice(0, showAllJoined ? joinedAuctions.length : 5).map((auction) => (
                                    <AuctionCard key={auction._id} auction={auction} cardType="joined" />
                                ))}
                            </div>

                            {joinedAuctions.length > 5 && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setShowAllJoined(!showAllJoined)}
                                        className="btn btn-ghost"
                                    >
                                        {showAllJoined ? 'Show Less' : `Show More (${joinedAuctions.length - 5} more)`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card p-12 text-center rounded-xl border-2 backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border" style={{
                                background: 'var(--surface-hover)',
                                borderColor: 'var(--border-secondary)'
                            }}>
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>No Joined Auctions</h3>
                            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>You haven't joined any auctions yet. Start bidding to see them here!</p>
                            <button
                                onClick={() => navigate('/auctions')}
                                className="btn btn-primary px-6 py-3 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 flex items-center gap-2 mx-auto"
                            >
                                Browse Auctions
                            </button>
                        </div>
                    )}
                </div>

                {/* Created Auctions Section */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold  mb-2" style={{ color: 'var(--text-primary)' }}>
                                Your Auctions ({createdAuctions.length})
                            </h2>
                            <p className="text-gray-400">Auctions you've created</p>
                        </div>
                        <CreateAuction onAuctionCreated={fetchUserAuctions}>
                            <button className="btn btn-primary">
                                Create New Auction
                            </button>
                        </CreateAuction>
                    </div>

                    {createdAuctions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {createdAuctions.slice(0, showAllCreated ? createdAuctions.length : 5).map((auction) => (
                                    <AuctionCard key={auction._id} auction={auction} cardType="created" />
                                ))}
                            </div>

                            {createdAuctions.length > 5 && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setShowAllCreated(!showAllCreated)}
                                        className="btn btn-ghost"
                                    >
                                        <span>{showAllCreated ? '📤' : '📥'}</span>
                                        {showAllCreated ? 'Show Less' : `Show More (${createdAuctions.length - 5} more)`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card p-12 text-center rounded-xl border-2 backdrop-blur-sm">

                            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>No Created Auctions</h3>
                            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>You haven't created any auctions yet. Start your first auction today!</p>
                            <CreateAuction onAuctionCreated={fetchUserAuctions}>
                                <button className="btn btn-primary px-6 py-3 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 flex items-center gap-2 mx-auto">
                                    Create Your First Auction
                                </button>
                            </CreateAuction>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;