import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format time remaining
export const formatTimeRemaining = (endTime) => {
  const now = new Date().getTime()
  const end = new Date(endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { text: 'Ended', expired: true, urgent: false }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const urgent = diff < 5 * 60 * 1000 // Less than 5 minutes

  if (days > 0) {
    return { text: `${days}d ${hours}h`, expired: false, urgent: false }
  } else if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, expired: false, urgent: false }
  } else if (minutes > 0) {
    return { text: `${minutes}m ${seconds}s`, expired: false, urgent }
  } else {
    return { text: `${seconds}s`, expired: false, urgent: true }
  }
}

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate avatar initials
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Validate bid amount
export const validateBidAmount = (amount, currentBid, minIncrement = 1) => {
  const numAmount = parseFloat(amount)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, message: 'Please enter a valid amount' }
  }
  
  if (numAmount <= currentBid) {
    return { valid: false, message: `Bid must be higher than ${formatCurrency(currentBid)}` }
  }
  
  if (numAmount < currentBid + minIncrement) {
    return { valid: false, message: `Minimum bid is ${formatCurrency(currentBid + minIncrement)}` }
  }
  
  return { valid: true, message: '' }
}

// Calculate next minimum bid
export const getMinimumBid = (currentBid, increment = 1) => {
  return currentBid + increment
}

// Get auction status
export const getAuctionStatus = (auction) => {
  const now = new Date().getTime()
  const end = new Date(auction.endTime).getTime()
  
  if (auction.status === 'ended' || now >= end) {
    return {
      status: 'ended',
      text: 'Ended',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  }
  
  const timeLeft = end - now
  if (timeLeft < 5 * 60 * 1000) { // Less than 5 minutes
    return {
      status: 'urgent',
      text: 'Ending Soon',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  }
  
  return {
    status: 'active',
    text: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
}

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Socket URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Categories for auctions
export const AUCTION_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Collectibles',
  'Art',
  'Books',
  'Jewelry',
  'Automotive',
  'Other'
]

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'ending-soon', label: 'Ending Soon' },
]