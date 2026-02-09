import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateAuction from './pages/CreateAuction'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Watchlist from './pages/Watchlist'
import Settings from './pages/Settings'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Routes with layout */}
                    <Route path="/" element={
                        <Layout>
                            <Home />
                        </Layout>
                    } />

                    <Route path="/auctions" element={
                        <Layout>
                            <Auctions />
                        </Layout>
                    } />



                    <Route path="/categories" element={
                        <Layout>
                            <Categories />
                        </Layout>
                    } />

                    <Route path="/auction/:roomId" element={
                        <Layout>
                            <AuctionDetail />
                        </Layout>
                    } />

                    {/* Protected routes */}
                    <Route path="/create-auction" element={
                        <ProtectedRoute>
                            <Layout>
                                <CreateAuction />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/watchlist" element={
                        <ProtectedRoute>
                            <Layout>
                                <Watchlist />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <Layout>
                                <Settings />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* Coming Soon Pages */}
                    <Route path="/won-auctions" element={
                        <ProtectedRoute>
                            <Layout>
                                <ComingSoon title="Won Auctions" description="View and manage auctions you've won" />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/messages" element={
                        <ProtectedRoute>
                            <Layout>
                                <ComingSoon title="Messages" description="Communicate with other users and auction creators" />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/help" element={
                        <Layout>
                            <ComingSoon title="Help & Support" description="Get help and support for using AuctionHub" />
                        </Layout>
                    } />

                    {/* 404 */}
                    <Route path="/404" element={
                        <Layout>
                            <NotFound />
                        </Layout>
                    } />

                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App