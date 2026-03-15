import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { LayoutDashboard, Users, Zap, TrendingDown, Layers, Target } from 'lucide-react';

const PRIORITY_COLORS = {
    High: '#ef4444',   // red-500
    Medium: '#f59e0b', // amber-500
    Low: '#10b981'     // emerald-500
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const Analytics = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [metrics, setMetrics] = useState(null);
    const [productivity, setProductivity] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [burnDownData, setBurnDownData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (pid) => {
        if (!pid) return;
        setLoading(true);
        try {
            const [mRes, pRes, dRes, bRes] = await Promise.all([
                axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/analytics/metrics/${pid}`, { withCredentials: true }),
                axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/analytics/productivity/${pid}`, { withCredentials: true }),
                axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/analytics/priority/${pid}`, { withCredentials: true }),
                axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/analytics/burndown/${pid}`, { withCredentials: true })
            ]);

            setMetrics(mRes.data.data);
            setProductivity(pRes.data.data);
            setPriorityData(dRes.data.data);
            setBurnDownData(bRes.data.data);
        } catch (error) {
            console.error("Analytics fetch failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/projects`, { withCredentials: true });
                const fetchedProjects = res.data.data || [];
                setProjects(fetchedProjects);
                if (fetchedProjects.length > 0) {
                    setSelectedProjectId(fetchedProjects[0]._id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Projects fetch failed:", err);
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchData(selectedProjectId);
        }
    }, [selectedProjectId, fetchData]);

    if (loading && projects.length === 0) {
        return (
            <div className="bg-zinc-950 min-h-screen p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 min-h-screen p-6 md:p-8 font-sans text-zinc-300">
            <div className="max-w-full">
                {/* Header & Controls */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-100 uppercase tracking-tight mb-2 flex items-center gap-4">
                            <span className="text-amber-500">_</span> Analytics Engine
                        </h1>
                        <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.2em]">Advanced Logical Diagnostics & Metrics</p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[300px]">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Scope Selection</label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-sm font-mono text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none shadow-xl"
                        >
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                            {projects.length === 0 && <option value="">NO ACTIVE PROJECTS</option>}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="flex items-center gap-3 text-zinc-500 font-mono text-base animate-pulse">
                            <Zap className="h-4 w-4 text-amber-500" />
                            CALCULATING METRICS...
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm font-mono shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-800"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <Layers size={14} className="text-zinc-600" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Load</span>
                                </div>
                                <h3 className="text-3xl font-black text-zinc-100 tracking-tighter">{metrics?.totalTasks || 0}</h3>
                                <p className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-[0.1em]">Total Objectives</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm font-mono shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/30"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <Target size={14} className="text-emerald-500/50" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Success</span>
                                </div>
                                <h3 className="text-3xl font-black text-emerald-500 tracking-tighter">{metrics?.completedTasks || 0}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                                        <div
                                            className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${metrics?.completionPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-500">{Math.round(metrics?.completionPercentage || 0)}%</span>
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm font-mono shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/30"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <TrendingDown size={14} className="text-red-500/50" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Slippage</span>
                                </div>
                                <h3 className="text-3xl font-black text-red-500 tracking-tighter">{metrics?.overdueTasks || 0}</h3>
                                <p className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-[0.1em]">Overdue Directives</p>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm font-mono shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500/30"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <Zap size={14} className="text-amber-500/50" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Ops</span>
                                </div>
                                <h3 className="text-3xl font-black text-amber-500 tracking-tighter">Active</h3>
                                <p className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-[0.1em]">Status Nominal</p>
                            </div>
                        </div>

                        {/* Main Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Productivity Chart */}
                            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm h-[400px] flex flex-col font-mono shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-800"></div>
                                <div className="flex items-center gap-2 mb-6">
                                    <Users size={14} className="text-zinc-600" strokeWidth={2.5} />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Operative Productivity</h3>
                                </div>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productivity} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                            <XAxis type="number" stroke="#52525b" fontSize={12} fontClassName="font-mono" />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                stroke="#52525b"
                                                fontSize={12}
                                                fontClassName="font-mono"
                                                width={100}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 0 }}
                                                itemStyle={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="completedCount" name="Completed" fill="#10b981" radius={[0, 2, 2, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Priority Distribution */}
                            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm h-[400px] flex flex-col font-mono shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-800"></div>
                                <div className="flex items-center gap-2 mb-6">
                                    <LayoutDashboard size={14} className="text-zinc-600" strokeWidth={2.5} />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Priority Spectrum</h3>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={priorityData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="priority"
                                            >
                                                {priorityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#3f3f46'} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 0 }}
                                                itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="font-mono text-[12px] uppercase text-zinc-500">{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Burndown / Trend Line */}
                        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm h-[400px] flex flex-col font-mono shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-800"></div>
                            <div className="flex items-center gap-2 mb-6">
                                <Zap size={14} className="text-amber-500" strokeWidth={2.5} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Objective Acquisition Trend</h3>
                            </div>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={burnDownData}>
                                        <defs>
                                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis dataKey="_id" stroke="#52525b" fontSize={10} fontClassName="font-mono" />
                                        <YAxis stroke="#52525b" fontSize={10} fontClassName="font-mono" />
                                        <Tooltip
                                            contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 0 }}
                                            labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px' }}
                                        />
                                        <Legend verticalAlign="top" align="right" />
                                        <Area type="monotone" dataKey="tasksCreated" name="New Load" stroke="#6366f1" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="tasksDone" name="Secured" stroke="#10b981" fillOpacity={1} fill="url(#colorDone)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && projects.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-sm">
                        <Layers className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                        <h3 className="text-zinc-600 font-mono text-sm uppercase">NO DIAGNOSTIC DATA: ASSIGN PROJECTS TO INITIALIZE</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
