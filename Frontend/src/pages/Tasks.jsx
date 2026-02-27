import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';

const Tasks = ({ teams, tasks, setTasks, projects }) => {
    const { user } = useAuth();
    const isMember = user?.role === ROLES.MEMBER;
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Form States
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('Pending');
    const [newTaskProject, setNewTaskProject] = useState(projects?.length > 0 ? projects[0]._id : '');
    const [newTaskTeam, setNewTaskTeam] = useState(teams?.length > 0 ? teams[0]._id : '');
    const [newTaskPerson, setNewTaskPerson] = useState('Unassigned');

    const memberOptionValue = (member) => String(member.user);
    const getMemberLabel = (member) => member.displayName || member.name || `User: ${member.user.substring(18)}`;

    useEffect(() => {
        if (projects?.length > 0 && !newTaskProject) {
            setNewTaskProject(projects[0]._id);
        }
    }, [projects, newTaskProject]);

    // Derived state for available teams based on selected project
    const availableTeams = useMemo(() => {
        if (!newTaskProject) return [];
        return teams.filter(t => t.project?._id === newTaskProject || t.project === newTaskProject);
    }, [newTaskProject, teams]);

    // Derived state for available members based on selected team
    const availableMembers = useMemo(() => {
        const team = availableTeams.find(t => t._id === newTaskTeam);
        return team ? (team.members || []).filter((member) => member.user) : [];
    }, [newTaskTeam, availableTeams]);

    // Sync team and person defaults when available teams/members change
    useEffect(() => {
        if (availableTeams.length > 0) {
            if (!newTaskTeam || !availableTeams.some(t => t._id === newTaskTeam)) {
                setNewTaskTeam(availableTeams[0]._id);
            }
        } else {
            if (newTaskTeam !== '') setNewTaskTeam('');
        }
    }, [availableTeams, newTaskTeam]);

    useEffect(() => {
        if (!newTaskTeam || availableMembers.length === 0) {
            if (newTaskPerson !== 'Unassigned') setNewTaskPerson('Unassigned');
            return;
        }

        const firstMemberValue = memberOptionValue(availableMembers[0]);
        if (newTaskPerson !== firstMemberValue) {
            setNewTaskPerson(firstMemberValue);
        }
    }, [newTaskTeam, availableMembers, newTaskPerson]);

    // Update person when team changes, or fallback
    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value;
        setNewTaskTeam(selectedTeamId);
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, { withCredentials: true });
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error: You do not have permission to delete this task.");
        }
    };

    // Update task status
    const updateTaskStatus = async (id, newStatus) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, { status: newStatus }, { withCredentials: true });
            // Standardized: res.data.data contains the task
            setTasks(tasks.map(t => t._id === id ? res.data.data : t));
        } catch (error) {
            console.error("Error updating status:", error);
            alert(`Error: ${error.response?.data?.message || 'Failed to update status.'}`);
        }
    };

    // Toggle task to completed
    const markTaskCompleted = (id, currentStatus) => {
        const nextStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
        updateTaskStatus(id, nextStatus);
    };

    // Add task
    const addTask = async (e) => {
        e.preventDefault();

        if (!newTaskName || newTaskName.trim() === '') {
            alert('Please enter a task name');
            return;
        }

        if (!newTaskProject) {
            alert('A task must be assigned to an active Project.');
            return;
        }

        const newTask = {
            name: newTaskName.trim(),
            status: newTaskStatus,
            project: newTaskProject,
            createdBy: user?._id || user?.id
        };

        // If user is Admin/Manager, they can enforce assignment. Otherwise, logic delegates.
        if (user?.role !== ROLES.MEMBER) {
            newTask.team = newTaskTeam;
            if (newTaskPerson === 'Unassigned') {
                newTask.assignedTo = null;
            } else {
                newTask.assignedTo = newTaskPerson;
            }
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/tasks`, newTask, { withCredentials: true });
            // Standardized: res.data.data contains the task
            setTasks([...tasks, res.data.data]);
            setNewTaskName('');
            setNewTaskStatus('Pending');
            setShowTaskModal(false);
        } catch (error) {
            console.error("Error creating task:", error);
            alert(`Error: ${error.response?.data?.message || 'Failed to assign Task'}`);
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
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 border-b-2 border-zinc-800 pb-6">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                        <span className="text-emerald-500">_</span> Task Queue
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Active Operations & Directives</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col h-full">
                    {/* Panel Header */}
                    <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span> T_Queue
                        </h2>
                        {!isMember && (
                            <button
                                onClick={() => setShowTaskModal(!showTaskModal)}
                                className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-sm hover:bg-zinc-700 hover:text-white font-mono text-sm transition-all"
                            >
                                + ADD_TASK
                            </button>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        {/* Add Task Form */}
                        {showTaskModal && (
                            <form onSubmit={addTask} className="bg-zinc-950 p-5 rounded-sm mb-6 border border-zinc-800">
                                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Assign New Task</h3>

                                <div className="mb-4">
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Task Parameters</label>
                                    <input
                                        type="text"
                                        value={newTaskName}
                                        onChange={(e) => setNewTaskName(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                        placeholder="Enter directives..."
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Project Binding</label>
                                    <select
                                        value={newTaskProject}
                                        onChange={(e) => setNewTaskProject(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                    >
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                        {projects.length === 0 && <option value="">-- No Active Projects --</option>}
                                    </select>
                                </div>

                                {!isMember ? (
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Team Unit (Optional)</label>
                                            <select
                                                value={newTaskTeam}
                                                onChange={handleTeamChange}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {availableTeams?.map(t => (
                                                    <option key={t._id} value={t._id}>{t.name}</option>
                                                ))}
                                                {availableTeams.length === 0 && <option value="">No Teams in Project</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Operative (Optional)</label>
                                            <select
                                                value={newTaskPerson}
                                                onChange={(e) => setNewTaskPerson(e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                                disabled={!newTaskTeam || availableMembers.length === 0}
                                            >
                                                {availableMembers.map(member => (
                                                    <option key={member._id || member.user || member.displayName} value={memberOptionValue(member)}>
                                                        {getMemberLabel(member)}
                                                    </option>
                                                ))}
                                                {(!newTaskTeam || availableMembers.length === 0) && (
                                                    <option value="Unassigned">N/A</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Notice</label>
                                        <p className="text-zinc-400 text-xs font-mono bg-zinc-900 p-3 border border-zinc-800 rounded-sm">Members cannot assign tasks to Operatives. This task will remain unassigned upon creation.</p>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Initial Status</label>
                                    <select
                                        value={newTaskStatus}
                                        onChange={(e) => setNewTaskStatus(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 max-w-sm">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-amber-600 text-black px-4 py-2 rounded-sm hover:bg-amber-500 font-bold uppercase tracking-wider text-sm transition-colors"
                                    >
                                        Execute
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="flex-none bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-700 font-bold uppercase tracking-wider text-sm transition-colors"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tasks List */}
                        {tasks.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-sm bg-zinc-950/50 flex-1">
                                <p className="text-zinc-600 font-mono text-sm uppercase">Queue Empty.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                {tasks.map(task => (
                                    <div key={task._id} className={`bg-zinc-950 border rounded-sm p-5 transition-all group relative ${task.status === 'Done' ? 'border-zinc-800 opacity-60' : 'border-zinc-700 hover:border-emerald-500/50'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="pr-4 w-full">
                                                <p className={`text-lg font-medium mb-2 truncate ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                                    {task.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                                    <span className="bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800 truncate max-w-[120px]" title={task.project}>Proj: {task.project?.substring(18) || 'N/A'}</span>
                                                    {task.team && <span className="bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800 truncate max-w-[120px]" title={task.team}>Team: {task.team.substring(18)}</span>}
                                                    {task.assignedTo && <span className="bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800 truncate max-w-[120px]" title={task.assignedTo}>User: {task.assignedTo.substring(18)}</span>}
                                                </div>
                                            </div>
                                            {!isMember && (
                                                <button
                                                    onClick={() => deleteTask(task._id)}
                                                    className="text-zinc-600 hover:text-red-500 transition-colors focus:outline-none flex-shrink-0"
                                                    title="Terminate Task"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border rounded-sm ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <button
                                                onClick={() => markTaskCompleted(task._id, task.status)}
                                                className={`text-xs font-mono uppercase font-bold tracking-wider px-4 py-2 rounded-sm transition-all border ${task.status === 'Done'
                                                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                                    : 'bg-emerald-900/40 text-emerald-400 border-emerald-800 hover:bg-emerald-800 hover:text-emerald-100'
                                                    }`}
                                            >
                                                {task.status === 'Done' ? 'Reopen' : 'Complete'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
