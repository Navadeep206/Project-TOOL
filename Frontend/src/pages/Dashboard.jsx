import { Link } from 'react-router-dom';
import { useProjects, useTasks } from '../hooks/useData.js';

const Dashboard = () => {
    const { data: projects = [], isLoading: projectsLoading } = useProjects();
    const { data: tasks = [], isLoading: tasksLoading } = useTasks();

    const isLoading = projectsLoading || tasksLoading;

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

    if (isLoading) {
        return (
            <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 border-b-2 border-zinc-800 pb-6">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                        <span className="text-amber-500">_</span> Control Panel
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">System Operations & Task Logistics</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex flex-col justify-between h-full">
                            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mb-4">Total Projects</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-bold text-zinc-100">{projects.length}</p>
                                <div className="text-zinc-700 text-4xl group-hover:text-blue-500/20 transition-colors">📦</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex flex-col justify-between h-full">
                            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mb-4">Total Tasks</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-bold text-zinc-100">{tasks.length}</p>
                                <div className="text-zinc-700 text-4xl group-hover:text-emerald-500/20 transition-colors">✓</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <div className="flex flex-col justify-between h-full">
                            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mb-4">Active Operations</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-bold text-zinc-100">{projects.filter(p => p.status === 'In Progress').length}</p>
                                <div className="text-zinc-700 text-4xl group-hover:text-amber-500/20 transition-colors">⚙️</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <div className="flex flex-col justify-between h-full">
                            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mb-4">Secured Objectives</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-bold text-zinc-100">{tasks.filter(t => t.status === 'Done').length}</p>
                                <div className="text-zinc-700 text-4xl group-hover:text-purple-500/20 transition-colors">✓</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Preview Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Projects Preview */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col h-full">
                        <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-sm inline-block"></span> Recent Projects
                            </h2>
                            <Link
                                to="/projects"
                                className="text-zinc-400 hover:text-white font-mono text-sm underline decoration-zinc-700 hover:decoration-zinc-400 transition-all uppercase tracking-wider"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="p-6">
                            {projects.length === 0 ? (
                                <p className="text-zinc-600 font-mono text-sm uppercase text-center py-6">No projects found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {projects.slice(0, 3).map(proj => (
                                        <div key={proj._id} className="bg-zinc-950 border border-zinc-800 rounded-sm p-4 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                            <div>
                                                <h3 className="text-zinc-200 font-bold group-hover:text-amber-400 transition-colors mb-2">{proj.name}</h3>
                                                <span className={`text-[12px] font-mono uppercase tracking-wider px-2 p-0.5 border rounded-sm ${getStatusColor(proj.status)}`}>
                                                    {proj.status}
                                                </span>
                                            </div>
                                            <span className="text-zinc-500 font-mono text-xs">{new Date(proj.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks Preview */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col h-full">
                        <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span> Recent Tasks
                            </h2>
                            <Link
                                to="/tasks"
                                className="text-zinc-400 hover:text-white font-mono text-sm underline decoration-zinc-700 hover:decoration-zinc-400 transition-all uppercase tracking-wider"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="p-6">
                            {tasks.length === 0 ? (
                                <p className="text-zinc-600 font-mono text-sm uppercase text-center py-6">No tasks found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {tasks.slice(0, 3).map(task => (
                                        <div key={task._id} className="bg-zinc-950 border border-zinc-800 rounded-sm p-4 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                            <div>
                                                <h3 className={`font-bold mb-2 group-hover:text-amber-400 transition-colors ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                                    {task.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                    <span className="text-xs font-mono text-zinc-500">[{task.project?.name || 'Global'}]</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
