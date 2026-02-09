import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Home, ArrowLeft, Search, Gavel } from 'lucide-react'

const NotFound = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardContent className="text-center py-12 px-6">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">404</div>
                        <Gavel className="h-16 w-16 text-muted-foreground mx-auto" />
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold">Page Not Found</h1>
                        <p className="text-muted-foreground">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <Button asChild className="flex-1">
                            <Link to="/">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                            <Link to="/auctions">
                                <Search className="h-4 w-4 mr-2" />
                                Browse Auctions
                            </Link>
                        </Button>
                    </div>

                    {/* Back Link */}
                    <div className="mt-6">
                        <Button variant="ghost" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default NotFound