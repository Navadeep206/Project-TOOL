import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import Tasks from './pages/Tasks.jsx';
import Home from './pages/Home.jsx';
import Teams from './pages/Teams.jsx';
import Navbar from './components/Navbar.jsx';
import NotFound from './pages/NotFound.jsx';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuditLogDashboard from './pages/AuditLog/AuditLogDashboard.jsx';

// Mock ObjectIds for references
const u1 = '60d5ecb8b392d7001534f5a1';
const u2 = '60d5ecb8b392d7001534f5a2';
const u3 = '60d5ecb8b392d7001534f5a3';

const App = () => {
  // Shared Teams Data State with industrial structure
  const [teams, setTeams] = useState([
    {
      _id: '60d5ec9af682f50015ea1c5b',
      name: 'Engineering',
      lead: u1, // Alice
      status: 'Operational',
      members: [
        { _id: '60d5ecdcf682f50015ea1c5d', user: u1, role: 'Lead Architect', status: 'Active' },
        { _id: '60d5ecdcf682f50015ea1c5e', user: u2, role: 'Backend Engineer', status: 'Active' },
        { _id: '60d5ecdcf682f50015ea1c5f', user: u3, role: 'Frontend Engineer', status: 'On Leave' }
      ]
    },
    {
      _id: '60d5ec9af682f50015ea1c5c',
      name: 'Design',
      lead: u2,
      status: 'Operational',
      members: [
        { _id: '60d5ecdcf682f50015ea1c60', user: u2, role: 'Lead Designer', status: 'Active' }
      ]
    }
  ]);

  // Global State for Projects with industrial structure
  const [projects, setProjects] = useState([
    { _id: '60d5ecc4f682f50015ea1c61', name: 'Website Redesign', description: 'Overhaul the main marketing site', priority: 'High', status: 'In Progress', dueDate: new Date('2026-03-15').toISOString(), createdBy: u1 },
    { _id: '60d5ecc4f682f50015ea1c62', name: 'Mobile App', description: 'Launch iOS app v1.0', priority: 'High', status: 'In Progress', dueDate: new Date('2026-04-20').toISOString(), createdBy: u2 },
    { _id: '60d5ecc4f682f50015ea1c63', name: 'Marketing', description: 'Q2 Marketing Campaign', priority: 'Medium', status: 'Planning', dueDate: new Date('2026-02-28').toISOString(), createdBy: u3 }
  ]);

  // Global State for Tasks with industrial structure
  const [tasks, setTasks] = useState([
    { _id: '60d5eceef682f50015ea1c64', name: 'Design mockups', description: 'Figma files for homepage', status: 'Done', project: '60d5ecc4f682f50015ea1c61', team: '60d5ec9af682f50015ea1c5c', assignedTo: u2 },
    { _id: '60d5eceef682f50015ea1c65', name: 'Database setup', description: 'Configure MongoDB Atlas', status: 'In Progress', project: '60d5ecc4f682f50015ea1c62', team: '60d5ec9af682f50015ea1c5b', assignedTo: u1 }
  ]);


  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="/tasks" element={<ProtectedRoute><Tasks tasks={tasks} setTasks={setTasks} teams={teams} /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><Teams teams={teams} setTeams={setTeams} /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;