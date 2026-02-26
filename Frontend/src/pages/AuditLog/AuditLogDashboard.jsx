import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AuditFilters } from './components/AuditFilters';
import { LogsTable } from './components/LogsTable';
import { SkeletonTable, EmptyState, ErrorState } from './components/UIStates';

export default function AuditLogDashboard() {
    // State for mock loading and data
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust for UI preference

    // Fetch Audit Logs from Backend
    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetching all for client-side pagination/filtering demonstration
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/audit-logs`, {
                    withCredentials: true // Attach JWT
                });

                setLogs(response.data.data || []);
                setIsLoading(false);
            } catch (err) {
                console.error("Audit log network error:", err);
                setError("Failed to fetch audit logs from the backend.");
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // Filter Logic (Client-side since we are fully standalone/mocked)
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch =
                log.description?.toLowerCase().includes(search.toLowerCase()) ||
                log.action?.toLowerCase().includes(search.toLowerCase()) ||
                log.userId?.name?.toLowerCase().includes(search.toLowerCase());

            const matchesAction = actionFilter ? log.resourceType === actionFilter : true;
            const matchesStatus = statusFilter ? log.status === statusFilter : true;

            return matchesSearch && matchesAction && matchesStatus;
        });
    }, [logs, search, actionFilter, statusFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, actionFilter, statusFilter]);

    return (
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300">
            <div className="max-w-7xl mx-auto">
                {/* Header Setup */}
                <div className="mb-12 border-b-2 border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                            <span className="text-purple-500">_</span> Audit Logs
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">System Events & Activity Tracking</p>
                    </div>
                    <button
                        className="inline-flex items-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-mono text-sm transition-all uppercase tracking-wider rounded-sm focus:outline-none focus:border-purple-500"
                        onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/audit-logs/export?format=csv`, '_blank')}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {/* Filters */}
                <AuditFilters
                    search={search} setSearch={setSearch}
                    actionFilter={actionFilter} setActionFilter={setActionFilter}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                />

                {/* Content Area */}
                {error ? (
                    <ErrorState message={error} />
                ) : isLoading ? (
                    <SkeletonTable />
                ) : filteredLogs.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <LogsTable logs={paginatedLogs} />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 border-t border-zinc-800 rounded-sm mt-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-mono uppercase tracking-wider text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 rounded-sm"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative ml-3 inline-flex items-center border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-mono uppercase tracking-wider text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 rounded-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
                                            Showing <span className="text-zinc-300">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-zinc-300">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="text-zinc-300">{filteredLogs.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px border border-zinc-800 rounded-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 text-zinc-500 hover:bg-zinc-800 focus:z-20 disabled:opacity-50 border-r border-zinc-800"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {[...Array(totalPages)].map((_, idx) => {
                                                const pageNumber = idx + 1;
                                                const isCurrent = pageNumber === currentPage;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => setCurrentPage(pageNumber)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-xs font-mono focus:z-20 border-r border-zinc-800 transition-colors ${isCurrent
                                                            ? 'z-10 bg-zinc-800 text-purple-400 font-bold'
                                                            : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                                                            }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 text-zinc-500 hover:bg-zinc-800 focus:z-20 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
