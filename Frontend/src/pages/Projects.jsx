import { useState, useEffect } from 'react';
import { usePaginatedProjects, useAddProject, useUpdateProject, useDeleteProject, useCreateApproval } from '../hooks/useData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Search, Plus, X, Calendar } from 'lucide-react';

const Projects = () => {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const itemsPerPage = 6;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: responseData = {}, isLoading } = usePaginatedProjects(currentPage, itemsPerPage, debouncedSearch);
    const projects = responseData.data || [];
    const pagination = responseData.pagination || { totalPages: 1, total: 0 };

    const addProjectMutation = useAddProject();
    const updateProjectMutation = useUpdateProject();
    const deleteProjectMutation = useDeleteProject();
    const createApprovalMutation = useCreateApproval();

    const isMember = user?.role === ROLES.MEMBER;
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectPriority, setNewProjectPriority] = useState('Medium');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [newProjectDeadline, setNewProjectDeadline] = useState('');

    // Confirm Dialog State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    // For Deadline Extension (Custom input handled via message if simple, or separate modal)
    // For simplicity, let's use a small state to hold the temporary new date
    const [extensionRequest, setExtensionRequest] = useState({ isOpen: false, projectId: null, newDate: '' });

    // Notification State
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const notify = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // Simple function to add project
    const addProject = async (e) => {
        e.preventDefault();

        if (!newProjectName || !newProjectDeadline) {
            notify('Project Identifier and Deadline are required.', 'error');
            return;
        }

        const newProj = {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            priority: newProjectPriority,
            status: 'Planning',
            dueDate: new Date(newProjectDeadline).toISOString(),
            createdBy: user?._id || user?.id
        };

        try {
            await addProjectMutation.mutateAsync(newProj);
            setNewProjectName('');
            setNewProjectDescription('');
            setNewProjectPriority('Medium');
            setNewProjectDeadline('');
            setShowModal(false);
            notify('Project deployed successfully.', 'success');
        } catch (error) {
            console.error("Failed to post project:", error);
            notify("Error creating project. Ensure you have the right permissions.", 'error');
        }
    };

    // Delete project
    const deleteProject = (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Terminate Project',
            message: 'CRITICAL ACTION: Are you sure you want to terminate this project? All associated data will be lost.',
            type: 'danger',
            confirmText: 'TERMINATE',
            onConfirm: async () => {
                try {
                    const res = await deleteProjectMutation.mutateAsync(id);

                    if (res.approvalRequired) {
                        const approvalPayload = {
                            requesterId: user._id || user.id,
                            requesterRole: user.role,
                            projectId: id,
                            requestType: res.requestType,
                            targetEntityId: id,
                            reason: "Requested project termination (deletion)"
                        };

                        await createApprovalMutation.mutateAsync(approvalPayload);
                        notify(res.message, 'info');
                    } else {
                        notify('Project terminated.', 'success');
                    }
                } catch (error) {
                    notify("Error deleting project. Ensure you have the right permissions.", 'error');
                } finally {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await updateProjectMutation.mutateAsync({ id, updates: { status: newStatus } });

            if (res.approvalRequired) {
                const approvalPayload = {
                    requesterId: user._id || user.id,
                    requesterRole: user.role,
                    projectId: id,
                    requestType: res.requestType,
                    targetEntityId: id,
                    reason: `Requested project status update to ${newStatus}`
                };

                await createApprovalMutation.mutateAsync(approvalPayload);
                notify(res.message, 'info');
            } else {
                notify(`Status updated to ${newStatus}`, 'success');
            }
        } catch (error) {
            console.error("Failed to update project status:", error);
            notify("Error updating project status.", 'error');
        }
    };

    const handleDeadlineExtension = (id, currentDueDate) => {
        const dateStr = currentDueDate ? new Date(currentDueDate).toISOString().split('T')[0] : '';
        setExtensionRequest({ isOpen: true, projectId: id, newDate: dateStr });
    };

    const submitExtensionRequest = async () => {
        const { projectId: id, newDate } = extensionRequest;
        if (!newDate) return;

        try {
            const res = await updateProjectMutation.mutateAsync({ id, updates: { dueDate: new Date(newDate).toISOString() } });

            if (res.approvalRequired) {
                const approvalPayload = {
                    requesterId: user._id || user.id,
                    requesterRole: user.role,
                    projectId: id,
                    requestType: res.requestType,
                    targetEntityId: id,
                    reason: `Requested deadline extension to ${newDate}`,
                    metadata: { newDeadline: newDate }
                };

                await createApprovalMutation.mutateAsync(approvalPayload);
                notify(res.message, 'info');
            } else {
                notify('Deadline extension applied.', 'success');
            }
        } catch (error) {
            notify("Error requesting deadline extension.", 'error');
        } finally {
            setExtensionRequest({ isOpen: false, projectId: null, newDate: '' });
        }
    };

    const getPriorityColor = (priority) => {
        if (priority === 'High') {
            return 'bg-red-900 text-red-100 border-red-700';
        } else if (priority === 'Medium') {
            return 'bg-amber-900 text-amber-100 border-amber-700';
        } else {
            return 'bg-emerald-900 text-emerald-100 border-emerald-700';
        }
    };

    const getStatusColor = (status) => {
        if (status === 'Done' || status === 'Completed') {
            return 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50';
        } else if (status === 'In Progress') {
            return 'bg-sky-900/50 text-sky-400 border-sky-800/50';
        } else {
            return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
    };

    return (
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-6 right-6 z-[100] p-4 rounded-sm border shadow-2xl animate-in slide-in-from-right duration-300 font-mono text-xs uppercase tracking-widest flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-950 border-red-500 text-red-100' :
                    notification.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-100' :
                        'bg-zinc-900 border-blue-500 text-blue-100'
                    }`}>
                    <span className="w-2 h-2 rounded-full animate-pulse bg-current"></span>
                    {notification.message}
                    <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
                </div>
            )}

            <div className="max-w-full">
                <div className="mb-8 border-b-2 border-zinc-900 pb-6">
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                        <span className="text-blue-500">_</span> Active Projects
                    </h1>
                    <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.2em]">Global Operation Logistics</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col">
                    <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-sm inline-block shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> Deployment Roster
                        </h2>
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
                                <input
                                    type="text"
                                    placeholder="SEARCH IDENTIFIER..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-black uppercase tracking-wider pl-9 pr-3 py-1.5 rounded-sm focus:outline-none focus:border-blue-500 w-48 placeholder-zinc-800"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">✕</button>
                                )}
                            </div>
                            {!isMember && (
                                <button
                                    onClick={() => setShowModal(!showModal)}
                                    className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-4 py-1.5 rounded-sm hover:bg-zinc-800 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-2"
                                >
                                    <Plus size={12} strokeWidth={2.5} /> ADD_UNIT
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {showModal && (
                            <form onSubmit={addProject} className="bg-zinc-950 p-5 rounded-sm mb-6 border border-zinc-800">
                                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Initialize New Project</h3>
                                <div className="mb-4">
                                    <label className="block text-zinc-500 text-sm font-mono uppercase tracking-wider mb-2">Project Designation</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                        placeholder="Enter identifier..."
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-zinc-500 text-sm font-mono uppercase tracking-wider mb-2">Priority Level</label>
                                    <select
                                        value={newProjectPriority}
                                        onChange={(e) => setNewProjectPriority(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                    >
                                        <option value="Low">Low - Routine</option>
                                        <option value="Medium">Medium - Standard</option>
                                        <option value="High">High - Critical</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-zinc-500 text-sm font-mono uppercase tracking-wider mb-2">Operation Deadline</label>
                                    <input
                                        type="date"
                                        value={newProjectDeadline}
                                        onChange={(e) => setNewProjectDeadline(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 max-w-xs">
                                    <button type="submit" className="flex-1 bg-amber-600 text-black px-4 py-2 rounded-sm hover:bg-amber-500 font-bold uppercase tracking-wider text-sm transition-colors">Deploy</button>
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-none bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-700 font-bold uppercase tracking-wider text-sm transition-colors">Abort</button>
                                </div>
                            </form>
                        )}

                        {isLoading ? (
                            <div className="py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-sm bg-zinc-950/50">
                                <p className="text-zinc-600 font-mono text-sm uppercase">No active projects detected.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(proj => (
                                    <div key={proj._id} className="bg-zinc-950 border border-zinc-800 rounded-sm p-5 hover:border-zinc-700 transition-all group relative flex flex-col justify-between shadow-2xl font-mono">
                                        <div>
                                            <div className="flex justify-between items-start mb-5 border-b border-zinc-900 pb-3">
                                                <h3 className="text-base font-black text-zinc-200 group-hover:text-amber-500 transition-colors truncate pr-4 uppercase tracking-tight">{proj.name}</h3>
                                                {!isMember && (
                                                    <button
                                                        onClick={() => deleteProject(proj._id)}
                                                        className="text-zinc-800 hover:text-red-500 transition-all focus:outline-none flex-shrink-0"
                                                        title="Terminate"
                                                    >
                                                        <X size={14} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                            {proj.description && <p className="text-[11px] text-zinc-600 uppercase tracking-tight mb-4 line-clamp-2 leading-relaxed italic">"{proj.description}"</p>}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border rounded-sm ${getPriorityColor(proj.priority)}`}>{proj.priority}_PR</span>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border rounded-sm ${getStatusColor(proj.status)}`}>{proj.status}</span>
                                                {proj.status !== 'Completed' && (
                                                    <select
                                                        onChange={(e) => handleStatusUpdate(proj._id, e.target.value)}
                                                        className="bg-zinc-950 border border-zinc-800 text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                                                        value={proj.status}
                                                    >
                                                        <option value="Planning">Planning</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                                            <span className="truncate w-20" title={proj._id}>REF: {proj._id.substring(18)}</span>
                                            <div className="text-right">
                                                <p
                                                    className="cursor-pointer hover:text-amber-500 transition-colors flex items-center justify-end gap-1.5"
                                                    onClick={() => handleDeadlineExtension(proj._id, proj.dueDate)}
                                                    title="Click to request deadline extension"
                                                >
                                                    <Calendar size={12} className="text-zinc-700 group-hover:text-amber-500" strokeWidth={2} />
                                                    ETA: {new Date(proj.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-between items-center border-t border-zinc-800 pt-4">
                                <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
                                    Total Records: {pagination.total}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1 || isLoading}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm disabled:opacity-50 hover:bg-zinc-700 hover:text-white font-mono text-xs transition-all"
                                    >
                                        &lt; PREV
                                    </button>
                                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs rounded-sm">
                                        PAGE {currentPage} / {pagination.totalPages}
                                    </span>
                                    <button
                                        disabled={currentPage === pagination.totalPages || isLoading}
                                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                        className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm disabled:opacity-50 hover:bg-zinc-700 hover:text-white font-mono text-xs transition-all"
                                    >
                                        NEXT &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                {...confirmState}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Extension Input Modal */}
            {extensionRequest.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-zinc-950 border border-amber-900 shadow-[0_0_20px_rgba(146,64,14,0.1)] rounded-sm overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-sm font-mono text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Request Date Shift
                        </h3>
                        <div className="mb-6">
                            <label className="block text-zinc-500 text-[10px] uppercase font-mono mb-2">New Target Completion Date</label>
                            <input
                                type="date"
                                value={extensionRequest.newDate}
                                onChange={(e) => setExtensionRequest(prev => ({ ...prev, newDate: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 p-2 font-mono text-sm rounded-sm focus:border-amber-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setExtensionRequest({ isOpen: false, projectId: null, newDate: '' })}
                                className="px-4 py-2 text-zinc-500 hover:text-zinc-300 font-mono text-[10px] uppercase tracking-widest transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={submitExtensionRequest}
                                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm"
                            >
                                Request Shift
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
