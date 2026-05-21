import {
    LayoutDashboard, Briefcase, CheckSquare, Users,
    Calendar, BarChart2, ShieldCheck, Terminal
} from 'lucide-react';

export const SIDEBAR_CONFIG = [
    {
        section: "Core Modules",
        items: [
            { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { id: 'projects', label: 'Projects', path: '/projects', icon: Briefcase },
            { id: 'tasks', label: 'My Tasks', path: '/tasks', icon: CheckSquare },
            { id: 'teams', label: 'Teams', path: '/teams', icon: Users },
        ]
    },
    {
        section: "Insights",
        items: [
            { id: 'timeline', label: 'Timeline', path: '/timeline', icon: Calendar },
            { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart2 },
        ]
    },
    {
        section: "Administration",
        items: [
            {
                id: 'approvals',
                label: 'Approvals',
                path: '/approvals',
                icon: ShieldCheck,
                roles: ['admin', 'manager']
            },
            {
                id: 'audit-logs',
                label: 'Audit Logs',
                path: '/audit-logs',
                icon: Terminal,
                roles: ['admin']
            },
        ]
    }
];

export const TOPBAR_CONFIG = {
    showSearch: true,
    showProjectSelector: true,
    showNotifications: true,
    showProfile: true
};
