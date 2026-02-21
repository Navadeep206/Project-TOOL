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


const App = () => {
  // Shared Teams Data State
  const [teams, setTeams] = useState([
    {
      id: 't1',
      name: 'Engineering',
      lead: 'Alice',
      status: 'Operational',
      members: [
        { name: 'Alice', role: 'Lead Architect', status: 'Active' },
        { name: 'Bob', role: 'Backend Engineer', status: 'Active' },
        { name: 'Charlie', role: 'Frontend Engineer', status: 'On Leave' }
      ]
    },
    {
      id: 't2',
      name: 'Design',
      lead: 'Eve',
      status: 'Operational',
      members: [
        { name: 'Dave', role: 'UX Researcher', status: 'Active' },
        { name: 'Eve', role: 'Lead Designer', status: 'Active' }
      ]
    },
    {
      id: 't3',
      name: 'Marketing',
      lead: 'Frank',
      status: 'Standby',
      members: [
        { name: 'Frank', role: 'Campaign Manager', status: 'Active' },
        { name: 'Grace', role: 'Content Writer', status: 'Active' },
        { name: 'Heidi', role: 'SEO Specialist', status: 'Active' }
      ]
    }
  ]);

  // Global State for Projects
  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', priority: 'High', status: 'In Progress', date: 'March 15' },
    { id: 2, name: 'Mobile App', priority: 'High', status: 'In Progress', date: 'April 20' },
    { id: 3, name: 'Marketing', priority: 'Medium', status: 'Planning', date: 'Feb 28' }
  ]);

  // Global State for Tasks
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Design mockups', status: 'Done', team: 'Design', person: 'Eve' },
    { id: 2, name: 'Database setup', status: 'In Progress', team: 'Engineering', person: 'Bob' },
    { id: 3, name: 'API endpoints', status: 'In Progress', team: 'Engineering', person: 'Alice' },
    { id: 4, name: 'UI Implementation', status: 'Pending', team: 'Engineering', person: 'Charlie' },
    { id: 5, name: 'Testing', status: 'Pending', team: 'Engineering', person: 'Unassigned' }
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;