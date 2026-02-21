import { useState } from 'react';

const Projects = ({ projects, setProjects }) => {
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectPriority, setNewProjectPriority] = useState('Medium');

    // Simple function to add project
    const addProject = (e) => {
        e.preventDefault();

        if (!newProjectName || newProjectName.trim() === '') {
            alert('Please enter a project name');
            return;
        }

        const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
        const newProj = {
            id: maxId + 1,
            name: newProjectName.trim(),
            priority: newProjectPriority,
            status: 'Planning',
            date: 'TBD'
        };

        setProjects([...projects, newProj]);
        setNewProjectName('');
        setNewProjectPriority('Medium');
        setShowModal(false);
    };

    // Delete project
    const deleteProject = (id) => {
        setProjects(projects.filter(p => p.id !== id));
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
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 border-b-2 border-zinc-800 pb-6">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                        <span className="text-blue-500">_</span> Active Projects
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Global Operation Logistics</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col">
                    {/* Panel Header */}
                    <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-sm inline-block"></span> Deployment Roster
                        </h2>
                        <button
                            onClick={() => setShowModal(!showModal)}
                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-sm hover:bg-zinc-700 hover:text-white font-mono text-sm transition-all"
                        >
                            + ADD_PROJ
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Add Project Form */}
                        {showModal && (
                            <form onSubmit={addProject} className="bg-zinc-950 p-5 rounded-sm mb-6 border border-zinc-800">
                                <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Initialize New Project</h3>

                                <div className="mb-4">
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Project Designation</label>
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
                                    <label className="block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Priority Level</label>
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

                                <div className="flex gap-3 max-w-xs">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-amber-600 text-black px-4 py-2 rounded-sm hover:bg-amber-500 font-bold uppercase tracking-wider text-sm transition-colors"
                                    >
                                        Deploy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-none bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-sm hover:bg-zinc-700 font-bold uppercase tracking-wider text-sm transition-colors"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Projects List */}
                        {projects.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-sm bg-zinc-950/50">
                                <p className="text-zinc-600 font-mono text-sm uppercase">No active projects detected.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(proj => (
                                    <div key={proj.id} className="bg-zinc-950 border border-zinc-800 rounded-sm p-5 hover:border-zinc-600 transition-colors group relative flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-zinc-200 group-hover:text-amber-400 transition-colors truncate pr-2">{proj.name}</h3>
                                                <button
                                                    onClick={() => deleteProject(proj.id)}
                                                    className="text-zinc-600 hover:text-red-500 transition-colors focus:outline-none flex-shrink-0"
                                                    title="Terminate"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border rounded-sm ${getPriorityColor(proj.priority)}`}>
                                                    {proj.priority} PR
                                                </span>
                                                <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border rounded-sm ${getStatusColor(proj.status)}`}>
                                                    {proj.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500 font-mono">
                                            <span>ID: {proj.id.toString().padStart(4, '0')}</span>
                                            <span>ETA: {proj.date}</span>
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

export default Projects;
