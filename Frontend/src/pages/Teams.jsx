import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';

const Teams = ({ teams, setTeams }) => {
    const { user } = useAuth();
    const isMember = user?.role === ROLES.MEMBER;
    const safeTeams = Array.isArray(teams) ? teams : [];

    // State for New Team Modal
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLead, setNewTeamLead] = useState('');

    // State for New Member Modal
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [activeTeamId, setActiveTeamId] = useState(null);
    const [newMemberUserId, setNewMemberUserId] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');
    const [memberEdits, setMemberEdits] = useState({});

    const [users, setUsers] = useState([]);

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, { withCredentials: true });
                setUsers(res.data);
                if (res.data.length > 0) {
                    setNewTeamLead(res.data[0]._id);
                    setNewMemberUserId(res.data[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

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
        if (!newTeamName.trim() || !newTeamLead.trim()) return;

        const newTeam = {
            name: newTeamName,
            lead: newTeamLead,
            status: 'Operational',
            members: []
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/teams`, newTeam, { withCredentials: true });
            setTeams([...safeTeams, res.data]);
            setNewTeamName('');
            setNewTeamLead('');
            setShowTeamModal(false);
        } catch (error) {
            console.error('Error adding team:', error);
            alert(getApiErrorMessage(error));
        }
    };

    const openMemberModal = (teamId) => {
        const selectedTeam = safeTeams.find((team) => team._id === teamId);
        const draftEdits = {};
        (selectedTeam?.members || []).forEach((member) => {
            const key = String(member._id || '');
            if (!key) return;
            draftEdits[key] = {
                displayName: getMemberDisplayName(member),
                role: member.role || ''
            };
        });

        setActiveTeamId(teamId);
        setNewMemberRole('');
        setMemberEdits(draftEdits);
        if (users.length > 0) {
            setNewMemberUserId(users[0]._id);
        }
        setShowMemberModal(true);
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
            alert('Role is required.');
            return;
        }

        try {
            const res = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/teams/${activeTeamId}/members/${memberId}`,
                { displayName: nextName, role: nextRole },
                { withCredentials: true }
            );

            const updatedTeams = safeTeams.map((team) => (
                team._id === activeTeamId ? res.data : team
            ));
            setTeams(updatedTeams);
            alert('Member updated successfully.');
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!activeTeamId) return;
        if (!newMemberRole.trim() || !newMemberUserId.trim()) {
            alert('Please fill all fields.');
            return;
        }

        const newMember = {
            user: newMemberUserId,
            role: newMemberRole,
            status: 'Active'
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/teams/${activeTeamId}/members`, newMember, { withCredentials: true });
            const updatedTeams = safeTeams.map(team => team._id === activeTeamId ? res.data : team);
            setTeams(updatedTeams);
            setNewMemberUserId(users[0]?._id || '');
            setNewMemberRole('');
            setShowMemberModal(false);
            setActiveTeamId(null);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    return (
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 border-b-2 border-zinc-800 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                            <span className="text-blue-500">_</span> Network Units
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Personnel Organization & Deployment</p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="text-right hidden md:block">
                            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider">Total Units: {safeTeams.length}</p>
                            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider mt-1">Total Operatives: {safeTeams.reduce((acc, t) => acc + (Array.isArray(t.members) ? t.members.length : 0), 0)}</p>
                        </div>
                        {!isMember && (
                            <button
                                onClick={() => setShowTeamModal(true)}
                                className="bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono text-sm uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
                            >
                                + Deploy New Unit
                            </button>
                        )}
                    </div>
                </div>

                {/* Modals */}
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

                {!isMember && showMemberModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-auto p-6 bg-zinc-900 border border-zinc-700 rounded-sm border-t-2 border-t-emerald-500">
                            <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Register New Operative</h3>
                            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-800 pb-6 mb-6">
                                <div>
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Operative User</label>
                                    <select
                                        value={newMemberUserId}
                                        onChange={(e) => setNewMemberUserId(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono appearance-none"
                                    >
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Role/Classification</label>
                                    <input
                                        type="text"
                                        value={newMemberRole}
                                        onChange={(e) => setNewMemberRole(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                        placeholder="Enter Classification..."
                                    />
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
                                        Register
                                    </button>
                                </div>
                            </form>

                            <div>
                                <h4 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Manage Existing Operatives</h4>
                                <div className="space-y-3">
                                    {(safeTeams.find((t) => t._id === activeTeamId)?.members || []).map((member, idx) => {
                                        const memberKey = String(member._id || idx);
                                        return (
                                            <div key={memberKey} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                                                <input
                                                    type="text"
                                                    value={memberEdits[memberKey]?.displayName ?? getMemberDisplayName(member)}
                                                    onChange={(e) => handleMemberFieldChange(memberKey, 'displayName', e.target.value)}
                                                    className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm font-mono"
                                                />
                                                <input
                                                    type="text"
                                                    value={memberEdits[memberKey]?.role ?? (member.role || '')}
                                                    onChange={(e) => handleMemberFieldChange(memberKey, 'role', e.target.value)}
                                                    className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateMember(memberKey)}
                                                    className="bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase text-xs rounded-sm px-3 py-2"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {safeTeams.map((team, idx) => (
                        <div key={team._id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
                            <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-5 relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-1 ${idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-wide group-hover:text-amber-400 transition-colors">{team.name}</h2>
                                    <span className="font-mono text-xs text-zinc-600 uppercase">[{getIdTail(team._id)}]</span>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="font-mono text-xs">
                                        <span className="text-zinc-500 uppercase">Lead: </span>
                                        <span className="text-zinc-300 font-bold">{getUserNameById(team.lead)}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${getStatusColor(team.status)}`}>{team.status}</span>
                                </div>
                            </div>

                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Roster ({team.members?.length || 0})</h3>
                                    {!isMember && (
                                        <button onClick={() => openMemberModal(team._id)} className="text-xs font-mono text-amber-500 hover:text-amber-400 uppercase">+ Add</button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {(team.members || []).map((member, i) => (
                                        <div key={member._id || i} className="flex justify-between items-center bg-zinc-950 p-3 rounded-sm border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                            <div>
                                                <p className="font-bold text-zinc-200 text-sm">{getMemberDisplayName(member)}</p>
                                                <p className="font-mono text-xs text-zinc-500 mt-1">{member.role}</p>
                                            </div>
                                            <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!isMember && (
                                <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-3">
                                    <button onClick={() => openMemberModal(team._id)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 py-2 font-mono text-xs uppercase tracking-widest transition-colors rounded-sm">Manage Unit</button>
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
            </div>
        </div>
    );
};

export default Teams;
