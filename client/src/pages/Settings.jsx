import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAuth } from '../contexts/AuthContext'
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from 'lucide-react'

const Settings = () => {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Profile Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input value={user} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input placeholder="your.email@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input placeholder="Enter your full name" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <span>Notification Preferences</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Notification settings will be available soon. You'll be able to customize
                                when and how you receive updates about your auctions and bids.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Security Settings</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Security settings including password change and two-factor authentication
                                will be available in a future update.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5" />
                                <span>Billing & Payments</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Payment methods and billing history will be available when payment
                                processing is implemented.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Settings