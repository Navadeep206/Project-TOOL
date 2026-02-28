import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import Tasks from './pages/Tasks.jsx';
import Home from './pages/Home.jsx';
import Teams from './pages/Teams.jsx';
import Chat from './pages/Chat.jsx';
import AcceptInvite from './pages/AcceptInvite.jsx';
import Navbar from './components/Navbar.jsx';
import Timeline from './pages/Timeline.jsx';
import Analytics from './pages/Analytics.jsx';
import NotFound from './pages/NotFound.jsx';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuditLogDashboard from './pages/AuditLog/AuditLogDashboard.jsx';
import ApprovalDashboard from './pages/ApprovalDashboard/ApprovalDashboard.jsx';
import NotificationPage from './pages/Notifications/NotificationPage.jsx';

const AppContent = () => {
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
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

import { SocketProvider } from './context/SocketContext.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
