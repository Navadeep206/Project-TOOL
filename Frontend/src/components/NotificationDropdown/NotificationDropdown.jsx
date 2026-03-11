import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

/**
 * NotificationDropdown
 * A completely decoupled, standalone UI module for Global Navbars.
 * Now connected to real backend APIs via Axios.
 */
const NotificationDropdown = ({ iconSize = 24 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications from Backend on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/v1/notifications`, {
                    params: { limit: 10 },
                    withCredentials: true
                });
                setNotifications(response.data?.data?.notifications || []);
                setUnreadCount(response.data?.data?.unreadCount || 0);
            } catch (error) {
                console.error("Notifications fetch error:", error);
            }
        };

        fetchNotifications();
    }, []);

    // API Call payload: PATCH /api/v1/notifications/:id/read
    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation(); // Don't trigger outer link clicks
        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/v1/notifications/${id}/read`, {}, { withCredentials: true });

            // Optimistic UI Update
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    // API Call payload: PATCH /api/v1/notifications/read-all
    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/v1/notifications/read-all`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <div className="relative font-mono" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-white transition-all focus:outline-none rounded-sm hover:bg-zinc-800/50 group"
            >
                <Bell size={iconSize} className="group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />

                {/* Unread Badge - Scaled up */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-black text-white items-center justify-center shadow-lg border-2 border-[#09090b]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-zinc-950 border border-zinc-800 rounded-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden transform origin-top-right transition-all">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List Body */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <svg className="w-12 h-12 mx-auto text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-sm text-zinc-400">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800 border-t border-b border-zinc-800/50">
                                {notifications.slice(0, 5).map(notification => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        onMarkRead={handleMarkAsRead}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - Link to full page */}
                    <Link
                        to="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block bg-zinc-950 px-4 py-3 text-center border-t border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                    >
                        <span className="text-sm font-black text-amber-500 uppercase tracking-widest">View all notifications</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
