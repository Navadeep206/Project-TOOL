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
            <div className="bg-zinc-950 border-b-2 border-zinc-900 px-6 py-5">
                <h2 className="text-sm font-black text-zinc-100 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-sm inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Activity_Records
                </h2>
            </div>
            <div className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-950">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
                                TIMESTAMP
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
                                OPERATIVE
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
                                ACTION_TYPE
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
                                DESCRIPTION
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
                                STATUS
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
                                            <div className="text-[11px] font-black text-zinc-200 group-hover:text-purple-500 transition-colors uppercase tracking-tight">
                                                {log.userId ? log.userId.name : 'UNKNOWN_ENTITY'}
                                            </div>
                                            <div className="text-[9px] text-zinc-600 mt-1.5 flex items-center gap-3 font-mono font-bold uppercase tracking-widest">
                                                {log.userId?.email || 'N/A'}
                                                <span className={getRoleBadge(log.userRole)}>
                                                    {log.userRole}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1">{log.action}</div>
                                    <div className="text-[9px] text-zinc-700 font-black font-mono uppercase tracking-widest">{log.resourceType} <span className="opacity-50">{log.resourceId ? `[${log.resourceId.substring(0, 8)}]` : ''}</span></div>
                                </td>
                                <td className="px-6 py-4 text-[11px] text-zinc-500 max-w-xs truncate font-mono uppercase tracking-tight" title={log.description}>
                                    {log.description}
                                    <div className="text-[8px] text-zinc-800 font-black font-mono mt-1.5 tracking-[0.2em]">IP_ADDR: {log.ipAddress}</div>
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

