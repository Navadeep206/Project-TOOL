import React, { useState, useEffect } from 'react';
import { notificationsMock } from '../../components/NotificationDropdown/mockData';
import NotificationItem from '../../components/NotificationDropdown/NotificationItem';

/**
 * NotificationPage
 * Full Standalone UI view of all user notifications with simulated pagination.
 */
const NotificationPage = () => {
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Simulated Fetch
    useEffect(() => {
        setIsLoading(true);
        // Fake 600ms network delay
        setTimeout(() => {
            setNotifications(notificationsMock);
            setIsLoading(false);
        }, 600);
    }, []);

    const handleMarkAsRead = (e, id) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n =>
            n._id === id ? { ...n, isRead: true } : n
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    // Group notifications chronologically (simulated logic for "Today", "Yesterday")
    const groupedNotifications = notifications
        .filter(n => activeTab === 'all' ? true : !n.isRead)
        .reduce((acc, notification) => {
            // In a real app we'd use date-fns or similar to group accurately.
            // Here we simulate by just stringifying the date segment.
            const date = new Date(notification.createdAt);
            const isToday = new Date().toDateString() === date.toDateString();
            const groupKey = isToday ? 'Recent' : 'Earlier';

            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(notification);
            return acc;
        }, {});

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-slate-950 font-mono text-slate-200 py-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-red-500/20 text-red-400 text-sm py-0.5 px-3 rounded-full border border-red-500/30">
                                    {unreadCount} Unread
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 mt-2">Manage all your system alerts and team updates.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0 || isLoading}
                            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Mark all as read
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 border-b border-slate-800 mb-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        All Notifications
                        {activeTab === 'all' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-indigo-500 rounded-t-md"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'unread' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Unread
                        {unreadCount > 0 && activeTab !== 'unread' && <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                        {activeTab === 'unread' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-indigo-500 rounded-t-md"></span>}
                    </button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                <div className="w-10 h-10 bg-slate-800 rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Content State */
                    <div>
                        {Object.keys(groupedNotifications).length === 0 ? (
                            <div className="text-center py-24 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-slate-300">You're all caught up</h3>
                                <p className="text-slate-500 mt-2">No new notifications in this category.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {Object.entries(groupedNotifications).map(([group, items]) => (
                                    <div key={group}>
                                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 ml-1">
                                            {group}
                                        </h3>
                                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-800">
                                            {items.map(notification => (
                                                <div key={notification._id} className="relative group">
                                                    {/* Render the shared Item component */}
                                                    <NotificationItem
                                                        notification={notification}
                                                        onMarkRead={handleMarkAsRead}
                                                    />
                                                    {/* Add an extra delete button specifically for the Page view */}
                                                    <button
                                                        onClick={(e) => handleDelete(e, notification._id)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                                                        title="Delete notification"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
