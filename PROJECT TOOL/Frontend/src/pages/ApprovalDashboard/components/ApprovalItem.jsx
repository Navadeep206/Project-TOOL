import React from 'react';

const getStatusConfig = (status) => {
    const configs = {
        pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Pending Review' },
        in_review: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'In Review' },
        approved: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Approved' },
        rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
        cancelled: { color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Cancelled' },
    };
    return configs[status] || configs.pending;
};

const getTypeLabel = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const ApprovalItem = ({ request, isHistory, isOwnRequest, onAction, currentUser }) => {
    const statusConfig = getStatusConfig(request.currentStatus);
    const requesterName = request.requesterId?.fullname || request.requesterId?.username || 'Unknown User';

    // RBAC logic for frontend button visibility
    const canDecide = () => {
        if (!currentUser || isOwnRequest || isHistory) return false;

        const userRole = currentUser.role?.toUpperCase();
        const requiredLevel = request.approvalLevel?.toUpperCase();

        if (requiredLevel === 'ADMIN') return userRole === 'ADMIN';
        if (requiredLevel === 'MANAGER') return ['ADMIN', 'MANAGER'].includes(userRole);

        return false;
    };

    const showActions = canDecide() && ['pending', 'in_review'].includes(request.currentStatus);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5 hover:border-zinc-700 transition-colors shadow-2xl font-mono">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

                {/* Main Info */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-200 uppercase text-sm tracking-tight">
                            {requesterName}
                        </span>
                        <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-sm border border-zinc-800 bg-zinc-950 font-bold uppercase tracking-widest">
                            {request.requesterRole}
                        </span>
                        {request.projectId?.name && (
                            <span className="text-[10px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-sm border border-blue-500/20 font-bold uppercase tracking-widest">
                                PROJECT: {request.projectId.name}
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                {getTypeLabel(request.requestType)}
                            </h3>
                            <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-bold uppercase tracking-widest ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-xs border-l-2 border-amber-600 pl-3 py-1 my-3 text-zinc-500 italic uppercase tracking-wider leading-relaxed">
                            "{request.reason}"
                        </p>

                        {/* Metadata / Proposed Changes Context */}
                        {request.metadata && Object.keys(request.metadata).length > 0 && (
                            <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded-sm flex flex-wrap gap-4">
                                {request.metadata.newRole && (
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase text-zinc-600 font-bold mb-1 tracking-widest">PROPOSED ROLE</span>
                                        <span className="text-xs text-amber-500 font-bold tracking-widest uppercase">{request.metadata.newRole}</span>
                                    </div>
                                )}
                                {request.metadata.newDeadline && (
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase text-zinc-600 font-bold mb-1 tracking-widest">PROPOSED DEADLINE</span>
                                        <span className="text-xs text-blue-500 font-bold uppercase">{new Date(request.metadata.newDeadline).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {request.requestType === 'project_deletion' && (
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase text-red-500 font-bold mb-1 tracking-widest underline decoration-double">IRREVERSIBLE ACTION</span>
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">COMPLETE PROJECT TERMINATION</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-800">#</span> {request.requestId?.slice(0, 8)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-zinc-800">@</span> {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        {request.requiredApprovals > 1 && (
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1 bg-zinc-800 rounded-sm overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500"
                                        style={{ width: `${(request.currentLevel / request.requiredApprovals) * 100}%` }}
                                    />
                                </div>
                                <span className="text-zinc-500">
                                    {request.currentLevel}/{request.requiredApprovals} CLEARED
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action / Result Block */}
                <div className="lg:w-1/3 flex flex-col justify-center">
                    {showActions ? (
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => onAction('reject')}
                                className="flex-1 px-4 py-2 border border-red-900/30 bg-red-950/20 text-red-500 rounded-sm hover:bg-red-900/40 hover:border-red-500/50 transition-all font-bold text-[10px] uppercase tracking-widest"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onAction('approve')}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-sm transition-all font-bold text-[10px] uppercase tracking-widest"
                            >
                                Approve
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {request.decisionHistory?.length > 0 && (
                                <button
                                    onClick={() => onAction('view_history')}
                                    className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-sm transition-all text-[10px] font-bold uppercase tracking-widest border border-zinc-700"
                                >
                                    View Decision History
                                </button>
                            )}
                            {isOwnRequest && ['pending', 'in_review'].includes(request.currentStatus) && (
                                <button
                                    className="w-full px-4 py-2 border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-400/30 rounded-sm transition-all text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Cancel Request
                                </button>
                            )}
                            {!isOwnRequest && !isHistory && !showActions && (
                                <div className="text-center p-3 bg-zinc-950 rounded-sm border border-zinc-900 border-dashed">
                                    <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-black italic">Awaiting higher authority</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalItem;
