import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import Tasks from './pages/Tasks.jsx';
import Home from './pages/Home.jsx';
import Teams from './pages/Teams.jsx';
import AcceptInvite from './pages/AcceptInvite.jsx';
import Navbar from './components/Navbar.jsx';
import NotFound from './pages/NotFound.jsx';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuditLogDashboard from './pages/AuditLog/AuditLogDashboard.jsx';
import ApprovalDashboard from './pages/ApprovalDashboard/ApprovalDashboard.jsx';
import NotificationPage from './pages/Notifications/NotificationPage.jsx';

const AppContent = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchData = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setProjects([]);
      setTasks([]);
      return;
    }

    try {
      const [teamsRes, projectsRes, tasksRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/teams`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks`, { withCredentials: true })
      ]);

      if (Array.isArray(teamsRes.data.data)) setTeams(teamsRes.data.data);
      if (Array.isArray(projectsRes.data.data)) setProjects(projectsRes.data.data);
      if (Array.isArray(tasksRes.data.data)) setTasks(tasksRes.data.data);
    } catch (error) {
      console.error('Data fetch failed:', error);
      if (error.response?.status === 401) {
        // Stale session - auto logout
        localStorage.removeItem('sys_auth_user');
        window.location.href = '/login';
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#09090b', // zinc-950
            border: '1px solid #27272a', // zinc-800
            color: '#f4f4f5', // zinc-100
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            borderRadius: '2px' // rounded-sm
          }
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard projects={projects} tasks={tasks} teams={teams} /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects projects={projects} setProjects={setProjects} /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks tasks={tasks} setTasks={setTasks} teams={teams} projects={projects} /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams teams={teams} setTeams={setTeams} /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/approvals" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ApprovalDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;
