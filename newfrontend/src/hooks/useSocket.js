import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { auctionAPI } from '../lib/api'

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth()
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          username: user
        }
      })

      socketRef.current.on('connect', () => {
        setIsConnected(true)
        console.log('Socket connected:', socketRef.current.id)
      })

      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        console.log('Socket disconnected')
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [user, isAuthenticated])

  const joinRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      // Use the correct socket event name that matches the backend
      socketRef.current.emit('join-auction', { roomId, username: user })
    }
  }

  const leaveRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      // Use the correct socket event name that matches the backend
      socketRef.current.emit('leave-auction', { roomId, username: user, reason: 'manual_quit' })
    }
  }

  const placeBid = async (roomId, amount) => {
    try {
      // Use HTTP API for placing bids as it's more reliable
      const response = await auctionAPI.placeBid(roomId, amount)
      return { success: true, data: response }
    } catch (error) {
      console.error('Error placing bid:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom,
    placeBid
  }
}