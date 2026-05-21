import React from 'react';

export const AuditFilters = ({ search, setSearch, actionFilter, setActionFilter, statusFilter, setStatusFilter }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-900 p-5 rounded-sm border border-zinc-800">
            {/* Search Bar */}
            <div className="flex-1">
                <label htmlFor="searchLogs" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                    SEARCH_LOGS
                </label>
                <input
                    type="text"
                    id="searchLogs"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm focus:outline-none focus:border-purple-500 transition-all font-mono text-[11px] uppercase tracking-wider placeholder-zinc-800 shadow-xl"
                    placeholder="QUERY: ACTION, OPERATIVE, OR DESCRIPTION..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Action Filter */}
            <div className="w-full md:w-48">
                <label htmlFor="actionFilter" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                    RESOURCE_TYPE
                </label>
                <select
                    id="actionFilter"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm focus:outline-none focus:border-purple-500 transition-all font-mono appearance-none text-[11px] font-black uppercase tracking-wider cursor-pointer shadow-xl"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                >
                    <option value="">ALL_TYPES</option>
                    <option value="auth">AUTH</option>
                    <option value="project">PROJECT</option>
                    <option value="task">TASK</option>
                    <option value="user">USER</option>
                    <option value="system">SYSTEM</option>
                </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-32">
                <label htmlFor="statusFilter" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                    STATUS
                </label>
                <select
                    id="statusFilter"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm focus:outline-none focus:border-purple-500 transition-all font-mono appearance-none text-[11px] font-black uppercase tracking-wider cursor-pointer shadow-xl"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">ALL</option>
                    <option value="success">SUCCESS</option>
                    <option value="failure">FAILURE</option>
                </select>
            </div>
        </div>
    );
};
