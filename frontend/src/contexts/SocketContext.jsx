import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for order updates
    newSocket.on('order:updated', (data) => {
      toast.success(`Order #${data.orderId} status updated: ${data.status || 'Updated'}`);
    });

    // Listen for order status changes
    newSocket.on('order:status', (data) => {
      const statusMessages = {
        'Received': 'Your order has been received',
        'In Progress': 'We\'re working on your order',
        'Quality Check': 'Your order is being quality checked',
        'Completed': 'Your order is completed and ready!',
      };
      const message = statusMessages[data.status] || `Order status: ${data.status}`;
      toast.success(message, {
        duration: 5000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinOrderRoom = (orderId) => {
    if (socket && isConnected) {
      socket.emit('join:order', orderId);
    }
  };

  const leaveOrderRoom = (orderId) => {
    if (socket && isConnected) {
      socket.emit('leave:order', orderId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinOrderRoom,
    leaveOrderRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

