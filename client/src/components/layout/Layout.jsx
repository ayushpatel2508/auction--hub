import React from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { ToastProvider, ToastViewport } from '../ui/toast'
import { Toaster } from '../common/Toaster'

const Layout = ({ children }) => {
    const location = useLocation()
    const isSingleAuctionPage = location.pathname.startsWith('/auction/')

    return (
        <ToastProvider>
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>
                {!isSingleAuctionPage && <Footer />}
                <ToastViewport />
                <Toaster />
            </div>
        </ToastProvider>
    )
}

export default Layout