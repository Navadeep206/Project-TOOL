import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApprovalItem from './components/ApprovalItem';
import ApprovalActionModal from './components/ApprovalActionModal';

/**
 * ApprovalDashboard
 * Standalone UI Page for managing Approval Requests.
 * Now natively connected to Express APIs via Axios.
 */
const ApprovalDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
    const [searchQuery, setSearchQuery] = useState('');
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve' | 'reject'

    // Fetch Requests from Backend dynamically based on tabs
    useEffect(() => {
        const fetchApprovals = async () => {
            setIsLoading(true);
            try {
                const endpoint = activeTab === 'pending'
                    ? `${import.meta.env.VITE_API_BASE_URL}/v1/approvals/pending`
                    : `${import.meta.env.VITE_API_BASE_URL}/v1/approvals/history`;

                const response = await axios.get(endpoint, {
                    withCredentials: true
                });
                setRequests(response.data.data || []);
            } catch (error) {
                console.error("Error fetching approvals:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApprovals();
    }, [activeTab]);

    // Filtering Logic
    const filteredRequests = requests.filter(req => {
        // 1. Tab Filter
        const isPendingTab = activeTab === 'pending';
        const isPendingStatus = ['pending', 'in_review'].includes(req.currentStatus);
        if (isPendingTab && !isPendingStatus) return false;
        if (!isPendingTab && isPendingStatus) return false;

        // 2. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                req.reason.toLowerCase().includes(query) ||
                req.requestType.replace('_', ' ').toLowerCase().includes(query) ||
                req.requesterId.toLowerCase().includes(query)
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
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Approval Center</h1>
                        <p className="text-slate-400">Manage, review, and audit elevated privilege requests.</p>
                    </div>

                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search specific reason..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-80 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg w-fit border border-slate-800">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    >
                        Requires Action
                        <span className="ml-2 inline-flex items-center justify-center bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                            {requests.filter(r => ['pending', 'in_review'].includes(r.currentStatus)).length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    >
                        Approval History
                    </button>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-xl">
                            <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-slate-300">Nothing to see here</h3>
                            <p className="text-slate-500 mt-1">No requests match your current filters.</p>
                        </div>
                    ) : (
                        filteredRequests.map(request => (
                            <ApprovalItem
                                key={request.requestId}
                                request={request}
                                isHistory={activeTab === 'history'}
                                onAction={(type) => handleOpenModal(request, type)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Action Modal */}
            <ApprovalActionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                request={selectedRequest}
                actionType={actionType}
            />
        </div>
    );
};

export default ApprovalDashboard;
