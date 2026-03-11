import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApprovalItem from './components/ApprovalItem';
import ApprovalActionModal from './components/ApprovalActionModal';
import DecisionHistoryModal from './components/DecisionHistoryModal';
import { useAuth } from '../../context/AuthContext';

/**
 * ApprovalDashboard
 * Standalone UI Page for managing Approval Requests.
 * Now natively connected to Express APIs via Axios.
 */
const ApprovalDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history' | 'my-requests'
    const [searchQuery, setSearchQuery] = useState('');
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'view_history'

    // Fetch Requests from Backend dynamically based on tabs
    useEffect(() => {
        const fetchApprovals = async () => {
            setIsLoading(true);
            try {
                let endpoint = '';
                switch (activeTab) {
                    case 'pending':
                        endpoint = `${import.meta.env.VITE_API_BASE_URL}/v1/approvals/pending`;
                        break;
                    case 'history':
                        endpoint = `${import.meta.env.VITE_API_BASE_URL}/v1/approvals/history`;
                        break;
                    case 'my-requests':
                        endpoint = `${import.meta.env.VITE_API_BASE_URL}/v1/approvals/my-requests`;
                        break;
                    default:
                        endpoint = `${import.meta.env.VITE_API_BASE_URL}/v1/approvals/pending`;
                }

                const response = await axios.get(endpoint, {
                    params: { page: pagination.page, limit: pagination.limit },
                    withCredentials: true
                });
                setRequests(response.data.data || []);
                if (response.data.pagination) {
                    setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
                }
            } catch (error) {
                console.error("Error fetching approvals:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApprovals();
    }, [activeTab, pagination.page]);

    // Filtering Logic
    const filteredRequests = requests.filter(req => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                req.reason.toLowerCase().includes(query) ||
                req.requestType.replace('_', ' ').toLowerCase().includes(query) ||
                (req.requesterId?.username || '').toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Modal Handlers
    const handleOpenModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setActionType(null);
    };

    const handleConfirmAction = async (comments) => {
        if (!selectedRequest) return;

        try {
            // Send REST call to backend
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/v1/approvals/${selectedRequest._id}/decide`, {
                decision: actionType === 'approve' ? 'approved' : 'rejected',
                comments: comments
            }, { withCredentials: true });

            // Remove purely from UI sequentially instead of hard reloading
            setRequests(prev => prev.filter(req => req._id !== selectedRequest._id));
        } catch (error) {
            console.error("Action Failed:", error);
        }

        handleCloseModal();
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8 font-mono">
            <div className="max-w-full space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase">Approval Center</h1>
                        <p className="text-zinc-500 text-xs uppercase tracking-widest">Manage, review, and audit elevated privilege requests.</p>
                    </div>

                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="SEARCH SPECIFIC REASON..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-80 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-sm py-2 pl-10 pr-4 focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-700 text-xs uppercase tracking-wider"
                        />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 bg-zinc-900/50 p-1 rounded-sm w-fit border border-zinc-800">
                    <button
                        onClick={() => { setActiveTab('pending'); setPagination(p => ({ ...p, page: 1 })); }}
                        className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-amber-600 text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                        Requires Action
                    </button>
                    <button
                        onClick={() => { setActiveTab('my-requests'); setPagination(p => ({ ...p, page: 1 })); }}
                        className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'my-requests' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                        My Requests
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setPagination(p => ({ ...p, page: 1 })); }}
                        className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                        Review Audit Log
                    </button>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-sm">
                            <svg className="w-16 h-16 mx-auto text-zinc-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nothing to see here</h3>
                            <p className="text-zinc-600 mt-1 text-[10px] uppercase">No requests match your current filters.</p>
                        </div>
                    ) : (
                        <>
                            {filteredRequests.map(request => (
                                <ApprovalItem
                                    key={request._id}
                                    request={request}
                                    currentUser={user}
                                    isHistory={activeTab === 'history'}
                                    isOwnRequest={activeTab === 'my-requests'}
                                    onAction={(type) => handleOpenModal(request, type)}
                                />
                            ))}

                            {/* Pagination Toggle */}
                            <div className="flex items-center justify-between pt-6 border-t border-zinc-800 font-mono">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                    Showing <span className="text-zinc-400">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-zinc-400">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-zinc-400">{pagination.total}</span> entries
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={pagination.page * pagination.limit >= pagination.total}
                                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Action Modal */}
            <ApprovalActionModal
                isOpen={isModalOpen && ['approve', 'reject'].includes(actionType)}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                request={selectedRequest}
                actionType={actionType}
            />

            {/* History Modal */}
            <DecisionHistoryModal
                isOpen={isModalOpen && actionType === 'view_history'}
                onClose={handleCloseModal}
                request={selectedRequest}
            />
        </div>
    );
};

export default ApprovalDashboard;
