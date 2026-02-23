import React from 'react';

/**
 * ActivityItem
 * Renders an individual line in the Activity Timeline.
 * Expects an activity object modeled after the Backend schema.
 */
const ActivityItem = ({ activity, isLast }) => {
    const { userName, actionType, message, createdAt } = activity;

    // Simple relative time formatter
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // Determine icon & colors based on action type
    const getActionConfig = (type) => {
        switch (type) {
            case 'create':
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    ),
                    bgColor: 'bg-emerald-500/20',
                    textColor: 'text-emerald-400',
                    ringColor: 'ring-emerald-500/30'
                };
            case 'update':
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    ),
                    bgColor: 'bg-blue-500/20',
                    textColor: 'text-blue-400',
                    ringColor: 'ring-blue-500/30'
                };
            case 'delete':
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    ),
                    bgColor: 'bg-red-500/20',
                    textColor: 'text-red-400',
                    ringColor: 'ring-red-500/30'
                };
            case 'status':
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-amber-500/20',
                    textColor: 'text-amber-400',
                    ringColor: 'ring-amber-500/30'
                };
            case 'assign':
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    ),
                    bgColor: 'bg-indigo-500/20',
                    textColor: 'text-indigo-400',
                    ringColor: 'ring-indigo-500/30'
                };
            default:
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-slate-700',
                    textColor: 'text-slate-300',
                    ringColor: 'ring-slate-600'
                };
        }
    };

    const config = getActionConfig(actionType);

    return (
        <div className="relative flex gap-4 items-start group">
            {/* Vertical Timeline Line */}
            {!isLast && (
                <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-slate-800 group-hover:bg-slate-700 transition-colors duration-300"></div>
            )}

            {/* Icon / Avatar Bubble */}
            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 ring-4 ring-[#0f172a] ${config.bgColor} ${config.textColor}`}>
                {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                    <div className="text-sm">
                        <span className="font-semibold text-slate-200">{userName}</span>{' '}
                        {/* The generated readable message trims the username internally, but for mock display we assume the message contains everything. 
                If the message already includes the username, we can slice it or just render message.
                For robustness, let's assume `message` is the full string like "Rahul updated task".
            */}
                        <span className="text-slate-400">
                            {message.startsWith(userName) ? message.slice(userName.length).trim() : message}
                        </span>
                    </div>

                    <div className="text-xs text-slate-500 whitespace-nowrap font-medium flex-shrink-0">
                        {timeAgo(createdAt)}
                    </div>
                </div>

                {/* Optional Context Box (e.g. for status changes showing old -> new) */}
                {(actionType === 'status' || actionType === 'update') && activity.newValue && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                            {activity.oldValue && Object.keys(activity.oldValue).length > 0 && (
                                <>
                                    <span className="line-through opacity-70">
                                        {JSON.stringify(activity.oldValue).replace(/["{}]/g, '').replace(/:/g, ': ')}
                                    </span>
                                    <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                            <span className="text-emerald-400/90 font-medium">
                                {JSON.stringify(activity.newValue).replace(/["{}]/g, '').replace(/:/g, ': ')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityItem;
