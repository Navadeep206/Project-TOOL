import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner text="Verifying clearance..." />;
    }

    if (!user) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        toast.error('ACCESS DENIED: Insufficient clearance level.');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
