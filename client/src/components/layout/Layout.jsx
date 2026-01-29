import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from 'sonner';

export function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased">
            <Navbar />
            <main className="flex-grow pt-16">
                <Outlet />
            </main>
            <Footer />
            <Toaster position="top-right" expand={false} richColors closeButton />
        </div>
    );
}
