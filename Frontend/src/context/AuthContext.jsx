import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('sys_auth_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Setup global interceptor for 401s
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('sys_auth_user');
                    // Only redirect if we're not already on login/register/accept-invite
                    const publicPages = ['/login', '/register', '/accept-invite', '/'];
                    if (!publicPages.includes(window.location.pathname)) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        setLoading(false);
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/users/login`, {
                email,
                password
            }, {
                withCredentials: true
            });

            if (response.data && response.data.data) {
                const userData = {
                    id: response.data.data.id,
                    email: response.data.data.email,
                    name: response.data.data.name,
                    role: response.data.data.role,
                    accessType: response.data.data.accessType
                };
                setUser(userData);
                localStorage.setItem('sys_auth_user', JSON.stringify(userData));
                toast.success(`Uplink established. Welcome, Operative ${userData.name}.`);
                navigate('/dashboard');
                return true;
            }
        } catch (error) {
            console.error("Login attempt failed:", error.response?.data?.message || error.message);
            toast.error(`ACCESS DENIED: ${error.response?.data?.message || 'Invalid credentials'}`);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await axios.post(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/users/register`, {
                name,
                email,
                password
            }, {
                withCredentials: true
            });

            toast.success('Clearance generated. Registration complete.');
            navigate('/login');
            return true;
        } catch (error) {
            console.error("Registration failed:", error.response?.data?.message || error.message);
            toast.error(`GENERATION FAILED: ${error.response?.data?.message || 'Registration failed'}`);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sys_auth_user');
        toast('Connection severed. Session terminated.');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
