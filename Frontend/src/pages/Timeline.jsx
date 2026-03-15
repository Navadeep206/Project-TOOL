import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Timeline = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('week'); // days tracking
    const containerRef = useRef(null);

    // Timeline Settings
    const dayWidth = 100; // px per day
    const rowHeight = 60;
    const sidebarWidth = 250;

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/tasks/timeline`, { withCredentials: true });
                setTasks(res.data.data);
            } catch (error) {
                toast.error('Failed to load timeline data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimeline();
    }, []);

    const { startDate, endDate, days } = useMemo(() => {
        if (tasks.length === 0) {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21);
            return { startDate: start, endDate: end, days: 28 };
        }

        const startDates = tasks.map(t => new Date(t.startDate));
        const endDates = tasks.map(t => new Date(t.dueDate));

        let start = new Date(Math.min(...startDates));
        let end = new Date(Math.max(...endDates));

        // Buffer
        start.setDate(start.getDate() - 10);
        end.setDate(end.getDate() + 20);

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { startDate: start, endDate: end, days: diffDays };
    }, [tasks]);

    const dateRange = useMemo(() => {
        const arr = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            arr.push(d);
        }
        return arr;
    }, [startDate, days]);

    const getTaskPosition = (task) => {
        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);

        const offsetDays = Math.floor((start - startDate) / (1000 * 60 * 60 * 24));
        const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

        return {
            left: offsetDays * dayWidth,
            width: durationDays * dayWidth
        };
    };

    const handleTaskMove = async (taskId, deltaDays) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task || task.isBlocked) {
            if (task?.isBlocked) toast.error('Cannot move blocked task');
            return;
        }

        const newStart = new Date(task.startDate);
        newStart.setDate(newStart.getDate() + deltaDays);

        const newDue = new Date(task.dueDate);
        newDue.setDate(newDue.getDate() + deltaDays);

        try {
            await axios.put(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/tasks/${taskId}`, {
                startDate: newStart.toISOString(),
                dueDate: newDue.toISOString()
            }, { withCredentials: true });

            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, startDate: newStart.toISOString(), dueDate: newDue.toISOString() } : t));
            toast.success('Task rescheduled');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    if (isLoading) return (
        <div className="bg-zinc-950 h-[calc(100vh-4rem)] flex items-center justify-center font-mono">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm tracking-widest uppercase">Initializing Temporal Uplink...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-zinc-950 h-[calc(100vh-4rem)] flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="h-20 border-b-2 border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-8 z-30">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <span className="text-amber-500">_</span> Gantt_Control
                        </h2>
                        <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-[0.2em] mt-0.5">Project Temporal Mapping</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest">Live_Sync_Active</span>
                </div>
            </div>

            {/* Timeline Viewport */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#050505]">
                {/* Scale Switcher */}
                <div className="h-10 bg-zinc-900/30 border-b border-zinc-900 px-6 flex items-center gap-4">
                    <div className="flex bg-zinc-950 p-1 rounded-sm border border-zinc-800">
                        {['Day', 'Week'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode.toLowerCase())}
                                className={`px-5 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === mode.toLowerCase() ? 'bg-zinc-800 text-amber-500 shadow-lg border border-zinc-700' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar relative" ref={containerRef}>
                    {/* Grid Background */}
                    <div
                        className="absolute top-0 bottom-0 pointer-events-none"
                        style={{ width: days * dayWidth, left: sidebarWidth }}
                    >
                        {dateRange.map((date, idx) => (
                            <div
                                key={idx}
                                className={`absolute top-0 bottom-0 border-r border-zinc-900/50 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-zinc-900/10' : ''}`}
                                style={{ left: idx * dayWidth, width: dayWidth }}
                            >
                                <div className="p-2 text-[11px] font-mono font-bold text-zinc-700 whitespace-nowrap uppercase">
                                    {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Task Rows */}
                    <div className="relative pt-10" style={{ minWidth: (days * dayWidth) + sidebarWidth }}>
                        {tasks.map((task, idx) => {
                            const pos = getTaskPosition(task);
                            return (
                                <div key={task._id} className="flex group" style={{ height: rowHeight }}>
                                    {/* Sidebar Name */}
                                    <div className="w-[250px] sticky left-0 bg-[#050505] border-r border-zinc-900 z-10 flex items-center px-6 gap-3 group-hover:bg-zinc-900/50 transition-colors font-mono">
                                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'Done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : task.isBlocked ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-zinc-300 truncate uppercase tracking-tight">{task.name}</p>
                                            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5">{task.project?.name || 'ROOT'}</p>
                                        </div>
                                    </div>

                                    {/* Task Bar */}
                                    <div className="relative flex-1">
                                        <div
                                            className={`absolute top-3 bottom-3 rounded cursor-move transition-shadow hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] border flex flex-col justify-center px-3 z-20 ${task.status === 'Done'
                                                ? 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400'
                                                : task.isBlocked
                                                    ? 'bg-red-900/30 border-red-800/50 text-red-500'
                                                    : 'bg-zinc-900/80 border-zinc-700 text-zinc-300'}`}
                                            style={{ left: pos.left, width: pos.width }}
                                            onMouseDown={(e) => {
                                                const startX = e.clientX;
                                                const onMouseMove = (moveE) => {
                                                    const deltaX = moveE.clientX - startX;
                                                    const deltaDays = Math.round(deltaX / dayWidth);
                                                    if (deltaDays !== 0) {
                                                        // Visual feedback only here?
                                                    }
                                                };
                                                const onMouseUp = (upE) => {
                                                    document.removeEventListener('mousemove', onMouseMove);
                                                    document.removeEventListener('mouseup', onMouseUp);
                                                    const deltaX = upE.clientX - startX;
                                                    const deltaDays = Math.round(deltaX / dayWidth);
                                                    if (deltaDays !== 0) handleTaskMove(task._id, deltaDays);
                                                };
                                                document.addEventListener('mousemove', onMouseMove);
                                                document.addEventListener('mouseup', onMouseUp);
                                            }}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] truncate">{task.name}</span>
                                            <div className="flex justify-between items-center mt-1.5 opacity-60">
                                                <span className="text-[8px] font-black font-mono text-zinc-400">{new Date(task.startDate).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}</span>
                                                <span className="text-[8px] font-black font-mono text-zinc-400">{new Date(task.dueDate).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        {/* Dependency Lines (simplified visual placeholders) */}
                                        {task.dependents?.map(depId => {
                                            const depTask = tasks.find(t => t._id === depId);
                                            if (!depTask) return null;
                                            // Simple horizontal line to indicate link
                                            return null;
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #18181b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #27272a;
                }
            `}} />
        </div>
    );
};

export default Timeline;
