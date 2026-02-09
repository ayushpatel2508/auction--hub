import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../lib/api'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Check authentication status on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await authAPI.verifyAuth()
            if (response.success && response.user) {
                setUser(response.user.username)
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.log('Not authenticated')
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    // Login updates state (API call handled by component)
    const login = (userData) => {
        setUser(userData)
        setIsAuthenticated(true)
    }

    const logout = async () => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}