import React from 'react';

export const AuditFilters = ({ search, setSearch, actionFilter, setActionFilter, statusFilter, setStatusFilter }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-900 p-5 rounded-sm border border-zinc-800">
            {/* Search Bar */}
            <div className="flex-1">
                <label htmlFor="searchLogs" className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                    Search Logs
                </label>
                <input
                    type="text"
                    id="searchLogs"
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                    placeholder="Search by action, user, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Action Filter */}
            <div className="w-full md:w-48">
                <label htmlFor="actionFilter" className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                    Resource Type
                </label>
                <select
                    id="actionFilter"
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm focus:outline-none focus:border-purple-500 transition-colors font-mono appearance-none text-sm"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="auth">Auth</option>
                    <option value="project">Project</option>
                    <option value="task">Task</option>
                    <option value="user">User</option>
                    <option value="system">System</option>
                </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-32">
                <label htmlFor="statusFilter" className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                    Status
                </label>
                <select
                    id="statusFilter"
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm focus:outline-none focus:border-purple-500 transition-colors font-mono appearance-none text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                </select>
            </div>
        </div>
    );
};
