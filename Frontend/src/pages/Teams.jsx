import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import { useTeams, useProjects, useAddTeam, useDeleteTeam, useUpdateMember, useRemoveMember, useAddMember, useUpdateUserRole, useCreateApproval } from '../hooks/useData.js';
import { useQuery } from '@tanstack/react-query';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Plus, X } from 'lucide-react';

const Teams = () => {
    const { user } = useAuth();
    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const { data: projects = [], isLoading: projectsLoading } = useProjects();

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

    // For users, simple one-off query for now
    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, { withCredentials: true });
            return res.data.data || [];
        }
    });

    const addTeamMutation = useAddTeam();
    const deleteTeamMutation = useDeleteTeam();
    const updateMemberMutation = useUpdateMember();
    const removeMemberMutation = useRemoveMember();
    const addMemberMutation = useAddMember();

    const isMember = user?.role === ROLES.MEMBER;
    const safeTeams = Array.isArray(teams) ? teams : [];

    const canManageTeam = (team) => {
        if (!user || !team) return false;
        if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER) return true;
        const leadId = typeof team.lead === 'object' ? team.lead._id : team.lead;
        return String(leadId) === String(user._id || user.id);
    };

    // State for New Team Modal
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLead, setNewTeamLead] = useState('');
    const [newTeamProject, setNewTeamProject] = useState('');

    // State for New Member Modal
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [activeTeamId, setActiveTeamId] = useState(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState(ROLES.MEMBER);
    const [invitationData, setInvitationData] = useState(null);
    const [memberEdits, setMemberEdits] = useState({});
    const [showExistingToggle, setShowExistingToggle] = useState(false);
    const [selectedExistingUser, setSelectedExistingUser] = useState('');

    // Confirm Dialog State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    useEffect(() => {
        if (users.length > 0 && !newTeamLead) {
            setNewTeamLead(users[0]._id);
        }
        if (projects.length > 0 && !newTeamProject) {
            setNewTeamProject(projects[0]._id);
        }
    }, [users, projects, newTeamLead, newTeamProject]);

    const getUserNameById = (userIdOrObj) => {
        if (!userIdOrObj) return 'Unknown';
        if (typeof userIdOrObj === 'object' && userIdOrObj.name) return userIdOrObj.name;
        const foundUser = users.find((u) => u._id === String(userIdOrObj));
        return foundUser?.name || 'Unknown';
    };

    const getMemberDisplayName = (member) => {
        if (!member) return 'Unknown';
        if (member.displayName) return member.displayName;
        if (member.name) return member.name;
        return getUserNameById(member.user);
    };

    const getIdTail = (value) => {
        const raw = value ? String(value) : '';
        return raw.length > 6 ? `...${raw.slice(-6)}` : raw || 'N/A';
    };

    const getApiErrorMessage = (error) => {
        const data = error?.response?.data;
        if (!data) return error?.message || 'Failed to perform operation';
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        return JSON.stringify(data);
    };

    const getStatusColor = (status) => {
        if (status === 'Operational' || status === 'Active') {
            return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50';
        } else if (status === 'Standby' || status === 'On Leave') {
            return 'text-amber-400 bg-amber-900/30 border-amber-800/50';
        } else {
            return 'text-red-400 bg-red-900/30 border-red-800/50';
        }
    };

    const handleAddTeam = async (e) => {
        e.preventDefault();

        if (!newTeamName.trim()) {
            notify('Unit Designation is required.', 'error');
            return;
        }

        const newTeam = {
            name: newTeamName,
            project: newTeamProject,
            lead: newTeamLead,
            status: 'Operational',
            members: []
        };

        try {
            await addTeamMutation.mutateAsync(newTeam);
            setNewTeamName('');
            setNewTeamLead('');
            setShowTeamModal(false);
            notify('Unit deployed successfully.', 'success');
        } catch (error) {
            console.error('Error adding team:', error);
            notify(getApiErrorMessage(error), 'error');
        }
    };

    const openMemberModal = (teamId) => {
        const selectedTeam = safeTeams.find((team) => team._id === teamId);
        const draftEdits = {};
        (selectedTeam?.members || []).forEach((member, idx) => {
            const key = String(member._id || idx);
            draftEdits[key] = {
                displayName: getMemberDisplayName(member),
                role: member.role || ''
            };
        });

        setActiveTeamId(teamId);
        setNewMemberEmail('');
        setNewMemberName('');
        setNewMemberRole(ROLES.MEMBER);
        setInvitationData(null);
        setMemberEdits(draftEdits);
        setShowMemberModal(true);
        setShowExistingToggle(false);
    };

    const handleMemberFieldChange = (memberId, field, value) => {
        setMemberEdits((prev) => ({
            ...prev,
            [memberId]: {
                ...(prev[memberId] || {}),
                [field]: value
            }
        }));
    };

    const handleUpdateMember = async (memberId) => {
        if (!activeTeamId) return;

        const payload = memberEdits[memberId] || {};
        const nextRole = (payload.role || '').trim();
        const nextName = (payload.displayName || '').trim();
        if (!nextRole) {
            notify('Role is required.', 'error');
            return;
        }

        try {
            await updateMemberMutation.mutateAsync({
                teamId: activeTeamId,
                memberId,
                updates: { displayName: nextName, role: nextRole }
            });
            notify('Operative records synced.', 'success');
        } catch (error) {
            notify(getApiErrorMessage(error), 'error');
        }
    };

    const handleRemoveMember = (memberId) => {
        if (!activeTeamId) return;
        setConfirmState({
            isOpen: true,
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member from the unit?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await removeMemberMutation.mutateAsync({ teamId: activeTeamId, memberId });
                    notify('Operative removed from roster.', 'success');
                } catch (error) {
                    notify(getApiErrorMessage(error), 'error');
                } finally {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleDeleteTeam = (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Terminate Unit',
            message: 'CRITICAL ACTION: Are you sure you want to terminate this Unit? All data will be purged.',
            type: 'danger',
            confirmText: 'TERMINATE',
            onConfirm: async () => {
                try {
                    await deleteTeamMutation.mutateAsync(id);
                    notify('Unit terminated and purged.', 'success');
                } catch (error) {
                    notify(getApiErrorMessage(error), 'error');
                } finally {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!activeTeamId) return;
        if (!newMemberEmail.trim() || !newMemberRole.trim()) {
            notify('Please fill all fields.', 'error');
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/invite`, {
                email: newMemberEmail,
                name: newMemberName,
                role: newMemberRole,
                projectId: safeTeams.find(t => t._id === activeTeamId)?.project
            }, { withCredentials: true });

            if (res.data.success) {
                setInvitationData({
                    link: res.data.data.debugLink,
                    emailSent: res.data.data.emailSent,
                    email: res.data.data.recipientEmail,
                    message: res.data.message
                });
                setNewMemberEmail('');
                setNewMemberName('');
                notify(res.data.message, res.data.data.emailSent ? 'success' : 'info');
            }
        } catch (error) {
            notify(getApiErrorMessage(error), 'error');
        }
    };

    const handleAddExistingMember = async (e) => {
        e.preventDefault();
        if (!activeTeamId || !selectedExistingUser) {
            notify('Selection required.', 'error');
            return;
        }

        try {
            await addMemberMutation.mutateAsync({
                teamId: activeTeamId,
                userId: selectedExistingUser,
                role: newMemberRole
            });
            setSelectedExistingUser('');
            notify('Operative incorporated into unit rosters.', 'success');
        } catch (error) {
            notify(getApiErrorMessage(error), 'error');
        }
    };

    const updateUserRoleMutation = useUpdateUserRole();
    const createApprovalMutation = useCreateApproval();

    const handleUpdateUserRole = (userId, newRole) => {
        setConfirmState({
            isOpen: true,
            title: 'Promote Personnel',
            message: `Are you sure you want to change this user's system role to ${newRole}?`,
            type: 'warning',
            confirmText: 'PROCEED',
            onConfirm: async () => {
                try {
                    const res = await updateUserRoleMutation.mutateAsync({ userId, role: newRole });

                    if (res.approvalRequired) {
                        const approvalPayload = {
                            requesterId: user._id || user.id,
                            requesterRole: user.role,
                            projectId: projects[0]?._id, // Attach to a default project for context if needed, or update model to make it optional
                            requestType: res.requestType,
                            targetEntityId: userId,
                            reason: `Requested role promotion to ${newRole}`,
                            metadata: { newRole }
                        };

                        await createApprovalMutation.mutateAsync(approvalPayload);
                        notify(res.message, 'info');
                    } else {
                        notify('System role updated successfully.', 'success');
                    }
                } catch (error) {
                    notify(getApiErrorMessage(error), 'error');
                } finally {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const isLoading = teamsLoading || projectsLoading || usersLoading || updateUserRoleMutation.isLoading || createApprovalMutation.isLoading;
    if (isLoading) {
        return (
            <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
            </div>
        );
    }

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
                {/* Header Section */}
                <div className="mb-12 border-b-2 border-zinc-900 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                            <span className="text-blue-500">_</span> Network Units
                        </h1>
                        <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.2em]">Personnel Organization & Deployment</p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="text-right hidden md:block">
                            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider">Total Units: {safeTeams.length}</p>
                            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider mt-1">Total Operatives: {safeTeams.reduce((acc, t) => acc + (Array.isArray(t.members) ? t.members.length : 0), 0)}</p>
                        </div>
                        {!isMember && (
                            <button
                                onClick={() => setShowTeamModal(true)}
                                className="bg-amber-600 hover:bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-sm transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2"
                            >
                                <Plus size={14} strokeWidth={3} /> DEPLOY_UNIT
                            </button>
                        )}
                    </div>
                </div>

                {/* New Team Modal */}
                {!isMember && showTeamModal && (
                    <div className="mb-8 p-6 bg-zinc-900 border border-zinc-700 rounded-sm">
                        <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Initialize New Unit</h3>
                        <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Unit Designation</label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                    placeholder="Enter Designation..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Unit Lead</label>
                                <select
                                    value={newTeamLead}
                                    onChange={(e) => setNewTeamLead(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                >
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Project Assignment</label>
                                <select
                                    value={newTeamProject}
                                    onChange={(e) => setNewTeamProject(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                    required
                                >
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                    {projects.length === 0 && <option value="">-- No Active Projects --</option>}
                                </select>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTeamModal(false)}
                                    className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-700 font-bold uppercase tracking-wider text-sm transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="bg-amber-600 text-black px-4 py-2 rounded-sm hover:bg-amber-500 font-bold uppercase tracking-wider text-sm transition-colors"
                                >
                                    Execute
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showMemberModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-auto p-6 bg-zinc-900 border border-zinc-700 rounded-sm border-t-2 border-t-emerald-500">
                            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">Manage Operative Accrual</h3>
                                <div className="flex bg-zinc-950 p-1 rounded-sm border border-zinc-800">
                                    <button
                                        onClick={() => setShowExistingToggle(false)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${!showExistingToggle ? 'bg-emerald-600 text-black' : 'text-zinc-500'}`}
                                    >
                                        Invite New
                                    </button>
                                    <button
                                        onClick={() => setShowExistingToggle(true)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${showExistingToggle ? 'bg-emerald-600 text-black' : 'text-zinc-500'}`}
                                    >
                                        Add Existing
                                    </button>
                                </div>
                            </div>

                            {!showExistingToggle ? (
                                invitationData ? (
                                    <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-800 rounded-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-2 h-2 rounded-full ${invitationData.emailSent ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                            <p className={`text-[10px] font-mono uppercase tracking-widest ${invitationData.emailSent ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {invitationData.emailSent
                                                    ? `Invitation transmitted to ${invitationData.email}`
                                                    : `Email transmission failed to ${invitationData.email}`}
                                            </p>
                                        </div>

                                        {!invitationData.emailSent && (
                                            <p className="text-zinc-500 text-[10px] font-mono uppercase mb-4 leading-relaxed">
                                                The system could not dispatch the email automatically. Please provide the link below to the operative manually.
                                            </p>
                                        )}

                                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-2">Access Link:</p>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={invitationData.link}
                                                className="flex-1 bg-zinc-950 border border-zinc-800 text-emerald-500 font-mono text-xs p-2 rounded-sm"
                                            />
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(invitationData.link); notify('Copied to system clipboard.', 'success'); }}
                                                className="bg-emerald-600 text-black px-3 py-1 rounded-sm text-[10px] font-bold uppercase"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setInvitationData(null)}
                                            className="mt-6 text-zinc-500 text-[10px] uppercase font-mono hover:text-zinc-300 flex items-center gap-2"
                                        >
                                            <span>[</span> CREATE ANOTHER INVITATION <span>]</span>
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-800 pb-6 mb-6">
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Operative Identity (Name)</label>
                                            <input
                                                type="text"
                                                value={newMemberName}
                                                onChange={(e) => setNewMemberName(e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                                placeholder="Enter Designation..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Operative Email</label>
                                            <input
                                                type="email"
                                                value={newMemberEmail}
                                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                                placeholder="operative@domain.core"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Role/Classification</label>
                                            <select
                                                value={newMemberRole}
                                                onChange={(e) => setNewMemberRole(e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono appearance-none"
                                            >
                                                {Object.values(ROLES).map(role => (
                                                    <option key={role} value={role}>{role.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => { setShowMemberModal(false); setActiveTeamId(null); }}
                                                className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-700 font-bold uppercase tracking-wider text-sm transition-colors"
                                            >
                                                Abort
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-emerald-600 text-black px-4 py-2 rounded-sm hover:bg-emerald-500 font-bold uppercase tracking-wider text-sm transition-colors"
                                            >
                                                Send Invite
                                            </button>
                                        </div>
                                    </form>
                                )
                            ) : (
                                <form onSubmit={handleAddExistingMember} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-800 pb-6 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Select Registered Operative</label>
                                        <select
                                            value={selectedExistingUser}
                                            onChange={(e) => setSelectedExistingUser(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono appearance-none"
                                            required
                                        >
                                            <option value="">-- Select Personnel --</option>
                                            {users.filter(u => {
                                                const currentTeam = safeTeams.find(t => t._id === activeTeamId);
                                                return !currentTeam?.members?.some(m => String(m.user?._id || m.user) === String(u._id));
                                            }).map(u => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Role/Classification</label>
                                        <select
                                            value={newMemberRole}
                                            onChange={(e) => setNewMemberRole(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono appearance-none"
                                        >
                                            {Object.values(ROLES).map(role => (
                                                <option key={role} value={role}>{role.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowMemberModal(false); setActiveTeamId(null); }}
                                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-700 font-bold uppercase tracking-wider text-sm transition-colors"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 text-black px-4 py-2 rounded-sm hover:bg-emerald-500 font-bold uppercase tracking-wider text-sm transition-colors"
                                        >
                                            Incorporate
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div>
                                <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Current Unit Operatives</h4>
                                <div className="space-y-3 font-mono">
                                    {(safeTeams.find((t) => t._id === activeTeamId)?.members || []).map((member, idx) => {
                                        const memberKey = String(member._id || idx);
                                        return (
                                            <div key={memberKey} className="flex flex-col md:flex-row gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-sm">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] text-zinc-600 uppercase mb-1">Display Name</label>
                                                    <input
                                                        type="text"
                                                        value={memberEdits[memberKey]?.displayName ?? getMemberDisplayName(member)}
                                                        onChange={(e) => handleMemberFieldChange(memberKey, 'displayName', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-1.5 text-xs font-mono focus:border-amber-500 outline-none"
                                                    />
                                                </div>
                                                <div className="w-full md:w-32">
                                                    <label className="block text-[10px] text-zinc-600 uppercase mb-1">Role</label>
                                                    <input
                                                        type="text"
                                                        value={memberEdits[memberKey]?.role ?? (member.role || '')}
                                                        onChange={(e) => handleMemberFieldChange(memberKey, 'role', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-1.5 text-xs font-mono focus:border-amber-500 outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateMember(memberKey)}
                                                        className="bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase text-[10px] rounded-sm px-3 py-1.5 h-8"
                                                    >
                                                        Sync
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(memberKey)}
                                                        className="bg-zinc-900 hover:bg-red-900/30 text-red-400 font-bold uppercase text-[10px] rounded-sm px-3 py-1.5 h-8 border border-red-900/20 hover:border-red-900/50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {safeTeams.map((team, idx) => (
                        <div key={team._id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
                            <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-5 relative overflow-hidden font-mono">
                                <div className={`absolute top-0 left-0 w-full h-0.5 ${idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight group-hover:text-amber-500 transition-colors">{team.name}</h2>
                                    <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">REF: {getIdTail(team._id)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-5 text-[10px] font-bold uppercase tracking-widest">
                                    <div>
                                        <span className="text-zinc-600 uppercase">CMD: </span>
                                        <span className="text-zinc-300">{getUserNameById(team.lead)}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border rounded-sm ${getStatusColor(team.status)}`}>{team.status}</span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 font-mono">
                                <div className="flex justify-between items-center mb-5 border-b border-zinc-900 pb-2">
                                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">UNIT_ROSTER ({team.members?.length || 0})</h3>
                                    {canManageTeam(team) && (
                                        <button onClick={() => openMemberModal(team._id)} className="text-[10px] font-black text-amber-600 hover:text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                            <Plus size={10} strokeWidth={3} /> ADD_OP
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {(team.members || []).map((member, i) => (
                                        <div key={member._id || i} className="flex justify-between items-center bg-zinc-950 p-3 rounded-sm border border-zinc-900 hover:border-zinc-800 transition-all">
                                            <div>
                                                <p className="font-black text-zinc-300 text-[11px] uppercase tracking-tight">{getMemberDisplayName(member)}</p>
                                                <p className="font-bold text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{member.role}</p>
                                            </div>
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {canManageTeam(team) && (
                                <div className="bg-zinc-950 border-t border-zinc-900 px-6 py-3 flex gap-2">
                                    <button
                                        onClick={() => openMemberModal(team._id)}
                                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 border border-zinc-800 py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm"
                                    >
                                        MANAGE_UNIT
                                    </button>
                                    {(user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER) && (
                                        <button
                                            onClick={() => handleDeleteTeam(team._id)}
                                            className="bg-zinc-950 hover:bg-red-950/20 text-zinc-800 hover:text-red-600 border border-zinc-900 hover:border-red-900/50 px-3 py-2 rounded-sm transition-all"
                                            title="Terminate Unit"
                                        >
                                            <X size={14} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {safeTeams.length === 0 && (
                        <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-sm bg-zinc-900/50">
                            <p className="text-zinc-500 font-mono text-sm uppercase">No active units detected.</p>
                        </div>
                    )}
                </div>

                {/* System Personnel Section - Admin Only */}
                {user?.role === ROLES.ADMIN && (
                    <div className="border border-zinc-800 rounded-sm bg-zinc-900/20 overflow-hidden">
                        <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4">
                            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-sm inline-block"></span> System Personnel Matrix
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs uppercase tracking-wider">
                                    <thead>
                                        <tr className="text-zinc-500 border-b border-zinc-800">
                                            <th className="pb-3 pr-4">Identity</th>
                                            <th className="pb-3 pr-4">Classification</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {users.map(u => (
                                            <tr key={u._id} className="group hover:bg-zinc-800/20">
                                                <td className="py-4 pr-4">
                                                    <p className="font-bold text-zinc-200">{u.name}</p>
                                                    <p className="text-[10px] text-zinc-600 lowercase">{u.email}</p>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                        className="bg-zinc-950 border border-zinc-800 text-[10px] py-1 px-2 rounded-sm focus:border-amber-500 outline-none"
                                                    >
                                                        {Object.values(ROLES).map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <p className="text-[10px] text-zinc-700">[{u._id.substring(18)}]</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    {...confirmState}
                    onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </div>
    );
};

export default Teams;
