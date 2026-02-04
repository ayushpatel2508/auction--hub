import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { ToastProvider, ToastViewport } from '../ui/toast'
import { Toaster } from '../common/Toaster'

const Layout = ({ children }) => {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>
                <Footer />
                <ToastViewport />
                <Toaster />
            </div>
        </ToastProvider>
    )
}

export default Layout