import { useState, useMemo } from 'react';

const Tasks = ({ tasks, setTasks, teams }) => {
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('Pending');
    const [newTaskTeam, setNewTaskTeam] = useState(teams.length > 0 ? teams[0]._id : '');
    const [newTaskPerson, setNewTaskPerson] = useState(teams.length > 0 && teams[0].members.length > 0 ? teams[0].members[0].user : 'Unassigned');

    // Generate a fake ObjectId
    const generateObjectId = () => {
        const timestamp = (Math.floor(new Date().getTime() / 1000)).toString(16);
        return timestamp + "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => (
            Math.floor(Math.random() * 16).toString(16)
        )).toLowerCase();
    };

    // Derived state for available members based on selected team
    const availableMembers = useMemo(() => {
        const team = teams.find(t => t._id === newTaskTeam);
        return team ? team.members : [];
    }, [newTaskTeam, teams]);

    // Update person when team changes, or fallback
    const handleTeamChange = (e) => {
        const selectedTeamId = e.target.value;
        setNewTaskTeam(selectedTeamId);
        const team = teams.find(t => t._id === selectedTeamId);
        if (team && team.members.length > 0) {
            setNewTaskPerson(team.members[0].user);
        } else {
            setNewTaskPerson('Unassigned');
        }
    };

    // Delete task
    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t._id !== id));
    };

    // Update task status
    const updateTaskStatus = (id, newStatus) => {
        setTasks(tasks.map(t =>
            t._id === id ? { ...t, status: newStatus } : t
        ));
    };

    // Toggle task to completed
    const markTaskCompleted = (id, currentStatus) => {
        const nextStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
        updateTaskStatus(id, nextStatus);
    };

    // Add task
    const addTask = (e) => {
        e.preventDefault();

        if (!newTaskName || newTaskName.trim() === '') {
            alert('Please enter a task name');
            return;
        }

        const newTask = {
            _id: generateObjectId(),
            name: newTaskName.trim(),
            status: newTaskStatus,
            team: newTaskTeam,
            assignedTo: newTaskPerson,
            project: '60d5ecc4f682f50015ea1c61' // Hardcoded default project link for mock
        };

        setTasks([...tasks, newTask]);
        setNewTaskName('');
        setNewTaskStatus('Pending');
        // Reset to first team
        if (teams.length > 0) {
            setNewTaskTeam(teams[0]._id);
            setNewTaskPerson(teams[0].members[0]?.user || 'Unassigned');
        }
        setShowTaskModal(false);
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
                        <button
                            onClick={() => setShowTaskModal(!showTaskModal)}
                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-sm hover:bg-zinc-700 hover:text-white font-mono text-sm transition-all"
                        >
                            + ADD_TASK
                        </button>
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

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Team Unit</label>
                                        <select
                                            value={newTaskTeam}
                                            onChange={handleTeamChange}
                                            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                        >
                                            {teams.map(t => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Operative</label>
                                        <select
                                            value={newTaskPerson}
                                            onChange={(e) => setNewTaskPerson(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono appearance-none"
                                            disabled={availableMembers.length === 0}
                                        >
                                            {availableMembers.map(member => (
                                                <option key={member.user} value={member.user}>User: ...{member.user.substring(18)}</option>
                                            ))}
                                            {availableMembers.length === 0 && (
                                                <option value="Unassigned">N/A</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

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
                                                    <span className="bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800 truncate max-w-[120px]" title={task.team}>Team: {...task.team.substring(18)}</span>
                                                    <span className="bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800 truncate max-w-[120px]" title={task.assignedTo}>User: {...task.assignedTo?.substring(18)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteTask(task._id)}
                                                className="text-zinc-600 hover:text-red-500 transition-colors focus:outline-none flex-shrink-0"
                                                title="Terminate Task"
                                            >
                                                ✕
                                            </button>
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
