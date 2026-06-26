import React, { createContext, useContext, useState } from 'react'

const ModalContext = createContext(null)

export const useModal = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}

export const ModalProvider = ({ children }) => {
    const [isCreateAuctionOpen, setIsCreateAuctionOpen] = useState(false)

    const openCreateAuction = () => setIsCreateAuctionOpen(true)
    const closeCreateAuction = () => setIsCreateAuctionOpen(false)

    return (
        <ModalContext.Provider 
            value={{ 
                isCreateAuctionOpen, 
                openCreateAuction, 
                closeCreateAuction 
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}
