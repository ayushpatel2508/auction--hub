import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Construction, ArrowLeft, Home } from 'lucide-react'

const ComingSoon = ({ title = "Coming Soon", description = "This feature is under development and will be available soon." }) => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>

            <Card>
                <CardContent className="text-center py-12">
                    <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
                    <p className="text-muted-foreground mb-6">
                        We're working hard to bring you this feature. Check back soon for updates!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button asChild>
                            <Link to="/">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ComingSoon