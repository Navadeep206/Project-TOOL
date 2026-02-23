import { useState } from 'react';

const Teams = ({ teams, setTeams }) => {
    // State for New Team Modal
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLead, setNewTeamLead] = useState('');

    // State for New Member Modal
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [activeTeamId, setActiveTeamId] = useState(null);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');

    const getStatusColor = (status) => {
        if (status === 'Operational' || status === 'Active') {
            return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50';
        } else if (status === 'Standby' || status === 'On Leave') {
            return 'text-amber-400 bg-amber-900/30 border-amber-800/50';
        } else {
            return 'text-red-400 bg-red-900/30 border-red-800/50';
        }
    };

    // Add New Team Handler
    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName.trim() || !newTeamLead.trim()) return;

        const newId = `t${teams.length + 1}`;
        const newTeam = {
            id: newId,
            name: newTeamName,
            lead: newTeamLead,
            status: 'Operational',
            members: []
        };

        try {
            const res = await axios.post('http://localhost:5000/api/teams', newTeam);
            setTeams([...teams, res.data]);
            setNewTeamName('');
            setNewTeamLead('');
            setShowTeamModal(false);
        } catch (error) {
            console.error('Error adding team:', error);
            alert('Failed to add team');
        }
    };

    // Open Member Modal specifically for a team
    const openMemberModal = (teamId) => {
        setActiveTeamId(teamId);
        setShowMemberModal(true);
    };

    // Add New Member Handler
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim() || !newMemberRole.trim() || !activeTeamId) return;

        const newMember = {
            name: newMemberName,
            role: newMemberRole,
            status: 'Active'
        };

        const teamToUpdate = teams.find(team => team.id === activeTeamId);
        if (!teamToUpdate) return;

        const updatedMembers = [...teamToUpdate.members, newMember];

        try {
            const res = await axios.put(`http://localhost:5000/api/teams/${activeTeamId}`, { members: updatedMembers });

            const updatedTeams = teams.map(team => {
                if (team.id === activeTeamId) {
                    return res.data;
                }
                return team;
            });

            setTeams(updatedTeams);
            setNewMemberName('');
            setNewMemberRole('');
            setShowMemberModal(false);
            setActiveTeamId(null);
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add member to team');
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
                            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider">Total Units: {teams.length}</p>
                            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider mt-1">Total Operatives: {teams.reduce((acc, t) => acc + t.members.length, 0)}</p>
                        </div>
                        <button
                            onClick={() => setShowTeamModal(true)}
                            className="bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono text-sm uppercase tracking-wider px-4 py-2 rounded-sm transition-colors"
                        >
                            + Deploy New Unit
                        </button>
                    </div>
                </div>

                {/* --- Modals for Adding Entities --- */}
                {/* Add Team Form/Modal */}
                {showTeamModal && (
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
                                <input
                                    type="text"
                                    value={newTeamLead}
                                    onChange={(e) => setNewTeamLead(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                    placeholder="Assign Commander..."
                                />
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

                {/* Add Member Form/Modal */}
                {showMemberModal && (
                    <div className="mb-8 p-6 bg-zinc-900 border border-zinc-700 rounded-sm border-t-2 border-t-emerald-500">
                        <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Register New Operative to {teams.find(t => t.id === activeTeamId)?.name}</h3>
                        <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Operative Name</label>
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                    placeholder="Enter Alias..."
                                    autoFocus
                                />
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
                    </div>
                )}


                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teams.map((team, idx) => (
                        <div key={team._id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
                            {/* Team Header */}
                            <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-5 relative overflow-hidden">
                                {/* Decorative line */}
                                <div className={`absolute top-0 left-0 w-full h-1 ${idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>

                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-wide group-hover:text-amber-400 transition-colors">
                                        {team.name}
                                    </h2>
                                    <span className="font-mono text-xs text-zinc-600 uppercase" title={team._id}>[...{team._id.substring(18)}]</span>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="font-mono text-xs">
                                        <span className="text-zinc-500 uppercase">Unit Lead: </span>
                                        <span className="text-zinc-300 font-bold" title={team.lead}>...{team.lead.substring(18)}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${getStatusColor(team.status)}`}>
                                        {team.status}
                                    </span>
                                </div>
                            </div>

                            {/* Team Roster */}
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Roster ({team.members.length})</h3>
                                    <button
                                        onClick={() => openMemberModal(team._id)}
                                        className="text-xs font-mono text-amber-500 hover:text-amber-400 transition-colors uppercase"
                                    >
                                        + Add
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {team.members.length === 0 ? (
                                        <div className="text-center py-4 text-xs font-mono text-zinc-600 uppercase">No operatives assigned</div>
                                    ) : (
                                        team.members.map((member, i) => (
                                            <div key={member._id || i} className="flex justify-between items-center bg-zinc-950 p-3 rounded-sm border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                                <div>
                                                    <p className="font-bold text-zinc-200 text-sm" title={member.user}>User: ...{member.user.substring(18)}</p>
                                                    <p className="font-mono text-xs text-zinc-500 mt-1">{member.role}</p>
                                                </div>
                                                <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-3">
                                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 py-2 font-mono text-xs uppercase tracking-widest transition-colors rounded-sm">
                                    Manage Unit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Teams;
