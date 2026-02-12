import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Gavel, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react'

import { authAPI } from '../lib/api'

const Register = () => {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.username) {
            newErrors.username = 'Username is required'
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        } else if (formData.username.length > 20) {
            newErrors.username = 'Username must be less than 20 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores'
        }

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        } else if (formData.password.length > 25) {
            newErrors.password = 'Password must not exceed 25 characters'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            const result = await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            })

            if (result.success) {
                toast.success('Account Created!', 'Welcome to AuctionHub! You can now start bidding.')

                // Login the user immediately
                login(result.username)

                // Small delay to ensure state is updated
                setTimeout(() => {
                    navigate('/', { replace: true })
                }, 100)
            }
        } catch (error) {
            toast.error('Registration Failed', error.response?.data?.msg || error.message || 'Please try again with different credentials.')
        } finally {
            setLoading(false)
        }
    }

    const passwordStrength = () => {
        const password = formData.password
        if (!password) return { strength: 0, text: '', color: '' }

        let strength = 0
        if (password.length >= 6) strength++
        if (password.length >= 8) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        const levels = [
            { text: 'Very Weak', color: 'text-red-500' },
            { text: 'Weak', color: 'text-orange-500' },
            { text: 'Fair', color: 'text-yellow-500' },
            { text: 'Good', color: 'text-blue-500' },
            { text: 'Strong', color: 'text-green-500' }
        ]

        return { strength, ...levels[Math.min(strength, 4)] }
    }

    const passwordInfo = passwordStrength()

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Gavel className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold">AuctionHub</span>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Create Account</CardTitle>
                        <CardDescription>
                            Join AuctionHub and start bidding on amazing items
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                        disabled={loading}
                                        maxLength={25}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {formData.password && (
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-muted rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${passwordInfo.strength === 0 ? 'bg-red-500' :
                                                    passwordInfo.strength === 1 ? 'bg-orange-500' :
                                                        passwordInfo.strength === 2 ? 'bg-yellow-500' :
                                                            passwordInfo.strength === 3 ? 'bg-blue-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${(passwordInfo.strength / 4) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs ${passwordInfo.color}`}>
                                            {passwordInfo.text}
                                        </span>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        disabled={loading}
                                        maxLength={25}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                    )}
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                                size="lg"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Links */}
                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Sign in here
                                </Link>
                            </p>
                            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                                ← Back to Home
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Terms */}
                <p className="text-xs text-muted-foreground text-center">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-foreground">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register