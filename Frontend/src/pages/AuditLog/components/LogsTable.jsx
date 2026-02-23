import React from 'react';

export const LogsTable = ({ logs }) => {
    const getStatusColor = (status) => {
        return status === 'success'
            ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50'
            : 'bg-red-900/50 text-red-400 border-red-800/50';
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            admin: 'bg-purple-900/50 text-purple-400 border-purple-800/50 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm',
            manager: 'bg-blue-900/50 text-blue-400 border-blue-800/50 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm',
            member: 'bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm',
            system: 'bg-indigo-900/50 text-indigo-400 border-indigo-800/50 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm',
            unknown: 'bg-orange-900/50 text-orange-400 border-orange-800/50 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm'
        };
        return roleColors[role?.toLowerCase()] || roleColors.unknown;
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col h-full">
            <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4">
                <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span> Activity Records
                </h2>
            </div>
            <div className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-950">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                Date & Time
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                User
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                Action & Resource
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-zinc-900 divide-y divide-zinc-800/50">
                        {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-zinc-400">
                                    {new Date(log.createdAt).toLocaleString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">
                                                {log.userId ? log.userId.name : 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-2 flex items-center gap-3 font-mono">
                                                {log.userId?.email || 'N/A'}
                                                <span className={getRoleBadge(log.userRole)}>
                                                    {log.userRole}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">{log.action}</div>
                                    <div className="text-xs text-zinc-500 font-mono capitalize">{log.resourceType} <span className="text-zinc-600">{log.resourceId ? `[${log.resourceId}]` : ''}</span></div>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-400 max-w-xs truncate" title={log.description}>
                                    {log.description}
                                    <div className="text-[10px] text-zinc-600 font-mono mt-2 tracking-wider">IP: {log.ipAddress}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${getStatusColor(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

