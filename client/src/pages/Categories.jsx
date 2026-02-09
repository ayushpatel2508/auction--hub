import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { AUCTION_CATEGORIES } from '../lib/utils'
import {
    Smartphone,
    Shirt,
    Home,
    Dumbbell,
    Star,
    Palette,
    BookOpen,
    Gem,
    Car,
    Package,
    ArrowRight
} from 'lucide-react'

const Categories = () => {
    const categoryIcons = {
        'Electronics': Smartphone,
        'Fashion': Shirt,
        'Home & Garden': Home,
        'Sports': Dumbbell,
        'Collectibles': Star,
        'Art': Palette,
        'Books': BookOpen,
        'Jewelry': Gem,
        'Automotive': Car,
        'Other': Package
    }

    const categoryDescriptions = {
        'Electronics': 'Smartphones, laptops, gaming consoles, and tech gadgets',
        'Fashion': 'Clothing, shoes, accessories, and designer items',
        'Home & Garden': 'Furniture, decor, appliances, and garden tools',
        'Sports': 'Equipment, memorabilia, and sporting goods',
        'Collectibles': 'Rare items, vintage pieces, and collector\'s items',
        'Art': 'Paintings, sculptures, prints, and artistic creations',
        'Books': 'Rare books, first editions, and literary collections',
        'Jewelry': 'Fine jewelry, watches, and precious accessories',
        'Automotive': 'Cars, motorcycles, parts, and automotive accessories',
        'Other': 'Unique items that don\'t fit other categories'
    }

    const featuredCategories = ['Electronics', 'Fashion', 'Collectibles', 'Art']

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Browse Categories</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Explore our diverse range of auction categories. From electronics to collectibles,
                    find exactly what you're looking for.
                </p>
            </div>

            {/* Featured Categories */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {featuredCategories.map((category) => {
                        const Icon = categoryIcons[category]
                        return (
                            <Card key={category} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                                <Link to={`/auctions?category=${encodeURIComponent(category)}`}>
                                    <CardHeader className="text-center pb-4">
                                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">{category}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground text-center mb-4">
                                            {categoryDescriptions[category]}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary">Popular</Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* All Categories */}
            <div>
                <h2 className="text-2xl font-bold mb-6">All Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AUCTION_CATEGORIES.map((category) => {
                        const Icon = categoryIcons[category] || Package
                        const isFeatured = featuredCategories.includes(category)

                        return (
                            <Card key={category} className="group hover:shadow-md transition-shadow cursor-pointer">
                                <Link to={`/auctions?category=${encodeURIComponent(category)}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold">{category}</h3>
                                                    {isFeatured && (
                                                        <Badge variant="default" className="text-xs">Featured</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {categoryDescriptions[category]}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create a custom search alert and we'll notify you when items matching your criteria are listed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link to="/auctions">
                                Browse All Auctions
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/create-auction">
                                Sell Your Items
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Categories