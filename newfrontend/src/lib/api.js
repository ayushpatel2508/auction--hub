import { API_BASE_URL } from './utils'
import axios from 'axios'

const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Add interceptor for error handling
client.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error)
        if (error.response && error.response.data) {
            throw new Error(error.response.data.msg || error.response.data.message || 'Something went wrong')
        }
        throw error
    }
)

export const authAPI = {
    login: (credentials) => client.post('/auth/login', credentials),
    register: (credentials) => client.post('/auth/register', credentials),
    logout: () => client.post('/auth/logout'),
    verifyAuth: () => client.get('/auth/verify'),
}

export const auctionAPI = {
    getAll: (params = {}) => client.get('/auctions', { params }),
    getOne: (roomId) => client.get(`/auction/${roomId}`),
    create: (formData) => client.post('/auction/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    end: (roomId) => client.post(`/auction/${roomId}/end`),
    delete: (roomId) => client.delete(`/auction/${roomId}`),
    quit: (roomId) => client.post(`/auction/${roomId}/quit`),
    getBids: (roomId) => client.get(`/auction/${roomId}/bids`),
    placeBid: (roomId, amount) => client.post(`/auction/${roomId}/bid`, { amount }),
}

export const userAPI = {
    getProfile: () => client.get('/users/profile'),
    getMyAuctions: () => client.get('/users/my-auctions'),
    getJoinedAuctions: () => client.get('/users/joined-auctions'),
    getMyBids: () => client.get('/users/my-bids'),
    getWonAuctions: () => client.get('/users/won-auctions'),
    
    // Watchlist - Fixed API paths
    getWatchlist: () => client.get('/users/watchlist'),
    toggleWatchlist: (roomId) => client.post(`/users/watchlist/${roomId}`),
}

export const adminAPI = {
    getStats: () => client.get('/admin/stats'),
    getAllUsers: () => client.get('/admin/users'),
    updateUserRole: (userId, role) => client.put(`/admin/users/${userId}/role`, { role }),
}
