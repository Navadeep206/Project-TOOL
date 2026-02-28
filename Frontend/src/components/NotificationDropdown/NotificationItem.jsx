import React from 'react';

// Maps backend enum 'types' to UI presentation
const getNotificationConfig = (type) => {
    switch (type) {
        case 'task_assigned':
            return {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                ),
                bgClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
            };
        case 'status_changed':
            return {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                ),
                bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            };
        case 'deadline_approaching':
            return {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgClass: 'bg-amber-500/20 text-amber-500 border-amber-500/30'
            };
        case 'role_update':
            return {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                ),
                bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            };
        default:
            return {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            };
    }
};

const formatTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationItem = ({ notification, onMarkRead, onAction }) => {
    const config = getNotificationConfig(notification.type);
    const { sender, message, createdAt, isRead, _id, metadata } = notification;

    const isInvite = metadata?.type === 'PROJECT_INVITE';

    return (
        <div
            className={`group relative flex flex-col p-4 hover:bg-slate-800/80 transition-colors cursor-pointer ${!isRead ? 'bg-slate-900' : ''
                }`}
            onClick={(e) => {
                if (!isRead && onMarkRead) onMarkRead(e, _id);
            }}
        >
            <div className="flex items-start">
                {/* Unread dot indicator */}
                {!isRead && (
                    <div className="absolute left-2.5 top-6 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}

                {/* Avatar or Icon */}
                <div className="ml-2 mr-3 mt-1 shrink-0">
                    {sender && sender.profileImage ? (
                        <img src={sender.profileImage} alt="User avatar" className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                    ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${config.bgClass}`}>
                            {config.icon}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-sm ${!isRead ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                        {message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-medium tracking-tight">
                        {formatTimeAgo(createdAt)}
                    </p>
                </div>

                {/* Hover Action: Mark Read Button (Only if unread) */}
                {!isRead && (
                    <button
                        onClick={(e) => onMarkRead(e, _id)}
                        className="opacity-0 group-hover:opacity-100 absolute right-3 top-6 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 rounded-full transition-all"
                        title="Mark as read"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Action Buttons for Invites */}
            {isInvite && onAction && (
                <div className="ml-14 mt-3 flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(_id, 'join', metadata.inviteId);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-500 transition-colors uppercase tracking-wider"
                    >
                        Accept
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(_id, 'reject', metadata.inviteId);
                        }}
                        className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-md border border-slate-700 hover:bg-slate-700 transition-colors uppercase tracking-wider"
                    >
                        Decline
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationItem;
