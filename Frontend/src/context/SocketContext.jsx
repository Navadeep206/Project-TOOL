import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Initialize socket connection with withCredentials for cookie support
        const newSocket = io(import.meta.env.VITE_API_BASE_URL.replace('/api', ''), {
            withCredentials: true,
            // We can still pass auth: { token } if it's available in some storage
            // but relying on cookies is more secure for HttpOnly setups.
        });

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to server:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
